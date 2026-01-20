"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import {
    Calendar,
    Sparkles,
    Clock,
    Target,
    BookOpen,
    ChevronDown,
    ChevronUp,
    Loader2,
    CheckCircle2,
    ArrowRight,
    Lock,
    LogIn,
    Crown
} from "lucide-react"
import { satCategories, allSATTopics, recommendedProgression, type SATTopic } from "@/lib/sat-topics"

interface ScheduleDay {
    dayNumber: number
    date: string
    dayType: string
    focus: string
    tasks: {
        task: string
        minutes: number
        category: string
    }[]
}

interface GeneratedSchedule {
    days: ScheduleDay[]
    weeklyGoals: string[]
    examTips: string[]
    satDate: string
    daysUntil: number
}

interface StudyPlannerContentProps {
    userId: string | null
    isPremium: boolean
}

export function StudyPlannerContent({ userId, isPremium }: StudyPlannerContentProps) {
    const [satDate, setSatDate] = useState("")
    const [hoursPerDay, setHoursPerDay] = useState(2)
    const [selectedTopics, setSelectedTopics] = useState<string[]>([])
    const [expandedCategories, setExpandedCategories] = useState<string[]>(["math", "reading", "writing"])
    const [isGenerating, setIsGenerating] = useState(false)
    const [schedule, setSchedule] = useState<GeneratedSchedule | null>(null)
    const [error, setError] = useState("")
    const [hasExistingPlan, setHasExistingPlan] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // Load existing plan on mount (one per account)
    useEffect(() => {
        if (userId) {
            const savedPlan = localStorage.getItem(`study_plan_account_${userId}`)
            if (savedPlan) {
                try {
                    const parsed = JSON.parse(savedPlan)
                    setSchedule(parsed)
                    setHasExistingPlan(true)
                } catch (e) {
                    console.error("Failed to parse saved plan:", e)
                }
            }
        }
        setIsLoading(false)
    }, [userId])

    // Save plan to localStorage when generated
    const savePlan = (planData: GeneratedSchedule) => {
        if (userId) {
            localStorage.setItem(`study_plan_account_${userId}`, JSON.stringify(planData))
            setHasExistingPlan(true)
        }
    }

    const toggleCategory = (categoryId: string) => {
        setExpandedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(c => c !== categoryId)
                : [...prev, categoryId]
        )
    }

    const toggleTopic = (topicId: string) => {
        setSelectedTopics(prev =>
            prev.includes(topicId)
                ? prev.filter(t => t !== topicId)
                : [...prev, topicId]
        )
    }

    const selectAllInCategory = (categoryId: "math" | "reading" | "writing") => {
        const categoryTopics = allSATTopics.filter(t => t.category === categoryId).map(t => t.id)
        const allSelected = categoryTopics.every(t => selectedTopics.includes(t))

        if (allSelected) {
            setSelectedTopics(prev => prev.filter(t => !categoryTopics.includes(t)))
        } else {
            setSelectedTopics(prev => [...new Set([...prev, ...categoryTopics])])
        }
    }

    const selectRecommended = () => {
        // Select foundational and intermediate topics for a balanced study plan
        const recommended = allSATTopics
            .filter(t => t.difficulty !== "advanced")
            .map(t => t.id)
        setSelectedTopics(recommended)
    }

    const generateSchedule = async () => {
        // Check if user already has a plan (one per account)
        if (hasExistingPlan && userId) {
            setError("You already have a study plan. You can only generate one plan per account.")
            return
        }
        if (!satDate) {
            setError("Please select your SAT test date")
            return
        }
        if (selectedTopics.length === 0) {
            setError("Please select at least one topic to study")
            return
        }

        setIsGenerating(true)
        setError("")
        setSchedule(null)

        // Get the full topic names for the API
        const focusAreas = selectedTopics
            .map(id => allSATTopics.find(t => t.id === id)?.name)
            .filter(Boolean)
            .join(", ")

        try {
            const response = await fetch("/api/gemini/generate-schedule", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    satDate,
                    focusAreas,
                    hoursPerDay,
                }),
            })

            const data = await response.json()

            if (data.success) {
                setSchedule(data)
                savePlan(data) // Save to localStorage for one-per-account limit
            } else {
                setError(data.error || "Failed to generate schedule")
            }
        } catch (err) {
            setError("Failed to generate schedule. Please try again.")
        } finally {
            setIsGenerating(false)
        }
    }

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "foundational": return "bg-green-100 text-green-800"
            case "intermediate": return "bg-yellow-100 text-yellow-800"
            case "advanced": return "bg-red-100 text-red-800"
            default: return "bg-gray-100 text-gray-800"
        }
    }

    const getDayTypeColor = (dayType: string) => {
        switch (dayType) {
            case "new_content": return "bg-blue-500"
            case "practice": return "bg-green-500"
            case "review": return "bg-purple-500"
            case "rest_day": return "bg-gray-400"
            default: return "bg-blue-500"
        }
    }

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#1B4B6B]" />
            </div>
        )
    }

    // Premium Gate - Block free users from accessing Study Planner
    if (!isPremium) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef]">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#1B4B6B] to-[#2d6a8f] text-white py-12 px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex items-center gap-3 mb-4">
                            <Calendar className="h-10 w-10" />
                            <h1 className="text-4xl font-bold">AI Study Planner</h1>
                        </div>
                        <p className="text-xl text-white/80 max-w-2xl">
                            Get a personalized study schedule designed like an Admissions Officer would recommend.
                        </p>
                    </div>
                </div>

                <div className="max-w-2xl mx-auto px-4 py-16">
                    <Card className="text-center border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                        <CardContent className="py-12">
                            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-6">
                                <Crown className="h-10 w-10 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-3">Premium Feature</h2>
                            <p className="text-lg text-gray-600 mb-6 max-w-md mx-auto">
                                The AI Study Planner is exclusively available to Premium members.
                                Upgrade now to get your personalized path to a 1600!
                            </p>
                            <div className="space-y-4">
                                <Button
                                    asChild
                                    size="lg"
                                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-lg px-8"
                                >
                                    <a href="/pricing">
                                        <Crown className="h-5 w-5 mr-2" />
                                        Upgrade to Premium
                                    </a>
                                </Button>
                                {!userId && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-2">Already have premium?</p>
                                        <Button asChild variant="outline">
                                            <a href="/login">Log In</a>
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 pt-6 border-t border-amber-200">
                                <p className="text-sm font-medium text-gray-700 mb-3">Premium includes:</p>
                                <div className="flex flex-wrap justify-center gap-3">
                                    <Badge className="bg-white border border-amber-200">✓ AI Study Planner</Badge>
                                    <Badge className="bg-white border border-amber-200">✓ Unlimited Flashcards</Badge>
                                    <Badge className="bg-white border border-amber-200">✓ Unlimited AI Help</Badge>
                                    <Badge className="bg-white border border-amber-200">✓ All Practice Tests</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef]">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1B4B6B] to-[#2d6a8f] text-white py-12 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-10 w-10" />
                            <h1 className="text-4xl font-bold">AI Study Planner</h1>
                        </div>
                        {userId ? (
                            <Badge className="bg-white/20 text-white border-0">
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                One plan per account
                            </Badge>
                        ) : (
                            <Badge className="bg-amber-500 text-white border-0">
                                <LogIn className="h-4 w-4 mr-1" />
                                Guest Mode
                            </Badge>
                        )}
                    </div>
                    <p className="text-xl text-white/80 max-w-2xl">
                        Get a personalized study schedule designed like an Admissions Officer would recommend —
                        strategic, comprehensive, and optimized for a 1600 score.
                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Guest Login Prompt */}
                {!userId && !schedule && (
                    <Card className="mb-6 bg-amber-50 border-amber-200">
                        <CardContent className="py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <LogIn className="h-5 w-5 text-amber-600" />
                                <div>
                                    <p className="font-medium text-amber-800">Log in to save your study plan</p>
                                    <p className="text-sm text-amber-600">You can generate a plan as a guest, but it won't be saved.</p>
                                </div>
                            </div>
                            <Button asChild variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-100">
                                <a href="/login">Log In</a>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {!schedule ? (
                    <div className="space-y-8">
                        {/* Configuration Section */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* SAT Date */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-[#1B4B6B]" />
                                        SAT Test Date
                                    </CardTitle>
                                    <CardDescription>When is your SAT?</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Input
                                        type="date"
                                        value={satDate}
                                        onChange={(e) => setSatDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="text-lg"
                                    />
                                </CardContent>
                            </Card>

                            {/* Study Hours */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-[#1B4B6B]" />
                                        Hours Per Day
                                    </CardTitle>
                                    <CardDescription>How much time can you dedicate daily?</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-3xl font-bold text-[#1B4B6B]">{hoursPerDay}</span>
                                        <span className="text-gray-500">hours/day</span>
                                    </div>
                                    <Slider
                                        value={[hoursPerDay]}
                                        onValueChange={(v) => setHoursPerDay(v[0])}
                                        min={1}
                                        max={6}
                                        step={0.5}
                                        className="py-4"
                                    />
                                    <div className="flex justify-between text-xs text-gray-400">
                                        <span>1h</span>
                                        <span>2h</span>
                                        <span>3h</span>
                                        <span>4h</span>
                                        <span>5h</span>
                                        <span>6h</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Topic Selection */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Target className="h-5 w-5 text-[#1B4B6B]" />
                                            Select Topics to Study
                                        </CardTitle>
                                        <CardDescription>
                                            Choose the SAT topics you want to focus on ({selectedTopics.length} selected)
                                        </CardDescription>
                                    </div>
                                    <Button variant="outline" onClick={selectRecommended} size="sm">
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Select Recommended
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {satCategories.map(category => {
                                        const isExpanded = expandedCategories.includes(category.id)
                                        const categoryTopicIds = category.topics.map(t => t.id)
                                        const selectedCount = categoryTopicIds.filter(id => selectedTopics.includes(id)).length
                                        const allSelected = selectedCount === category.topics.length

                                        return (
                                            <div key={category.id} className="border rounded-lg overflow-hidden">
                                                {/* Category Header */}
                                                <button
                                                    onClick={() => toggleCategory(category.id)}
                                                    className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-2xl">{category.icon}</span>
                                                        <span className="font-semibold text-lg">{category.name}</span>
                                                        <Badge variant="secondary">
                                                            {selectedCount}/{category.topics.length}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                selectAllInCategory(category.id as "math" | "reading" | "writing")
                                                            }}
                                                        >
                                                            {allSelected ? "Deselect All" : "Select All"}
                                                        </Button>
                                                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                                    </div>
                                                </button>

                                                {/* Topics */}
                                                {isExpanded && (
                                                    <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {category.topics.map(topic => (
                                                            <label
                                                                key={topic.id}
                                                                className={`
                                                                    flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all
                                                                    ${selectedTopics.includes(topic.id)
                                                                        ? 'border-[#1B4B6B] bg-blue-50'
                                                                        : 'border-gray-200 hover:border-gray-300'
                                                                    }
                                                                `}
                                                            >
                                                                <Checkbox
                                                                    checked={selectedTopics.includes(topic.id)}
                                                                    onCheckedChange={() => toggleTopic(topic.id)}
                                                                    className="mt-0.5"
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-medium text-sm">{topic.name}</p>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <Badge className={`text-xs ${getDifficultyColor(topic.difficulty)}`}>
                                                                            {topic.difficulty}
                                                                        </Badge>
                                                                        <span className="text-xs text-gray-400">
                                                                            ~{topic.estimatedHours}h
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Generate Button */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <Button
                            onClick={generateSchedule}
                            disabled={isGenerating}
                            className="w-full h-14 text-lg bg-gradient-to-r from-[#1B4B6B] to-[#2d6a8f] hover:from-[#163d57] hover:to-[#245a7a]"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    Generating Your Personalized Schedule...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-5 w-5 mr-2" />
                                    Generate AI Study Schedule
                                </>
                            )}
                        </Button>
                    </div>
                ) : (
                    /* Schedule Display */
                    <div className="space-y-8">
                        {/* Summary Header */}
                        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                            <CardContent className="py-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                                    <div>
                                        <h2 className="text-2xl font-bold text-green-800">Your Study Schedule is Ready!</h2>
                                        <p className="text-green-600">
                                            {schedule.daysUntil} days until your SAT on {new Date(schedule.satDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="outline" onClick={() => setSchedule(null)}>
                                    ← Generate New Schedule
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Weekly Goals */}
                        {schedule.weeklyGoals && schedule.weeklyGoals.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="h-5 w-5 text-[#1B4B6B]" />
                                        Weekly Goals
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {schedule.weeklyGoals.map((goal, i) => (
                                            <li key={i} className="flex items-center gap-2">
                                                <ArrowRight className="h-4 w-4 text-[#1B4B6B]" />
                                                {goal}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}

                        {/* Daily Schedule */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-[#1B4B6B]" />
                                    Daily Study Plan
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {schedule.days.map((day) => (
                                        <div key={day.dayNumber} className="border rounded-lg overflow-hidden">
                                            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50">
                                                <div className={`w-3 h-3 rounded-full ${getDayTypeColor(day.dayType)}`} />
                                                <div className="flex-1">
                                                    <span className="font-semibold">Day {day.dayNumber}</span>
                                                    <span className="text-gray-500 ml-2">
                                                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                                <Badge variant="outline" className="capitalize">
                                                    {day.dayType.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                            <div className="px-4 py-3">
                                                <p className="font-medium text-[#1B4B6B] mb-2">{day.focus}</p>
                                                <ul className="space-y-1">
                                                    {day.tasks.map((task, i) => (
                                                        <li key={i} className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-600">• {task.task}</span>
                                                            <span className="text-gray-400">{task.minutes} min</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Exam Tips */}
                        {schedule.examTips && schedule.examTips.length > 0 && (
                            <Card className="bg-amber-50 border-amber-200">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-amber-800">
                                        <Sparkles className="h-5 w-5" />
                                        Pro Tips for Success
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {schedule.examTips.map((tip, i) => (
                                            <li key={i} className="flex items-start gap-2 text-amber-700">
                                                <span className="text-amber-500">💡</span>
                                                {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
