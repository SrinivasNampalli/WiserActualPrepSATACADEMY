"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    ArrowRight,
    Target,
    Calendar,
    Sparkles,
    BookOpen,
    CheckCircle2,
    Zap
} from "lucide-react"
import { SATCountdown } from "@/components/sat-countdown"

interface OnboardingContentProps {
    user: any
    profile: any
}

const scoreGoals = [
    { label: "1200-1300", description: "Solid foundation" },
    { label: "1300-1400", description: "Competitive score" },
    { label: "1400-1500", description: "Top universities" },
    { label: "1500+", description: "Elite schools" },
]

const studyPlans = [
    { hours: "1-2", label: "Light", description: "Perfect for busy schedules" },
    { hours: "2-4", label: "Moderate", description: "Balanced improvement" },
    { hours: "4+", label: "Intensive", description: "Maximum score boost" },
]

export function OnboardingContent({ user, profile }: OnboardingContentProps) {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [currentScore, setCurrentScore] = useState("")
    const [goalScore, setGoalScore] = useState("")
    const [weeklyHours, setWeeklyHours] = useState("")
    const [testDate, setTestDate] = useState("")

    const totalSteps = 4
    const progress = (step / totalSteps) * 100

    const handleComplete = () => {
        // In a real app, save preferences to database
        router.push("/dashboard")
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Progress header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-2xl font-bold text-[#1B4B6B]">
                            Welcome, {profile?.full_name?.split(' ')[0] || 'there'}! 👋
                        </h1>
                        <Badge variant="outline">Step {step} of {totalSteps}</Badge>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                {/* Step 1: Current Score */}
                {step === 1 && (
                    <Card className="border-2 animate-in fade-in slide-in-from-right duration-300">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-theme-base/10">
                                    <Target className="h-6 w-6 text-theme" />
                                </div>
                                <div>
                                    <CardTitle>What's your current SAT score?</CardTitle>
                                    <CardDescription>Or your best practice test score if you haven't taken the real SAT yet</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="currentScore">Current/Practice Score</Label>
                                <Input
                                    id="currentScore"
                                    type="number"
                                    placeholder="e.g., 1150"
                                    value={currentScore}
                                    onChange={(e) => setCurrentScore(e.target.value)}
                                    min={400}
                                    max={1600}
                                    className="text-2xl font-bold text-center h-16"
                                />
                                <p className="text-sm text-gray-500 text-center">
                                    Don't worry if it's lower than you'd like—that's why you're here!
                                </p>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    onClick={() => setStep(2)}
                                    disabled={!currentScore}
                                    className="bg-theme-base hover:bg-theme-dark text-white"
                                >
                                    Continue
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 2: Goal Score */}
                {step === 2 && (
                    <Card className="border-2 animate-in fade-in slide-in-from-right duration-300">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-theme-base/10">
                                    <Sparkles className="h-6 w-6 text-theme" />
                                </div>
                                <div>
                                    <CardTitle>What's your target score?</CardTitle>
                                    <CardDescription>We'll create a personalized plan to get you there</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-3">
                                {scoreGoals.map((goal) => (
                                    <button
                                        key={goal.label}
                                        onClick={() => setGoalScore(goal.label)}
                                        className={`p-4 rounded-lg border-2 text-left transition-all ${goalScore === goal.label
                                                ? 'border-theme bg-theme-base/10'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="font-bold text-lg">{goal.label}</div>
                                        <div className="text-sm text-gray-500">{goal.description}</div>
                                    </button>
                                ))}
                            </div>

                            {currentScore && goalScore && (
                                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                    <p className="text-green-800 font-medium">
                                        <CheckCircle2 className="h-4 w-4 inline mr-2" />
                                        Students with similar goals improve by <strong>200+ points</strong> on average!
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-between">
                                <Button variant="outline" onClick={() => setStep(1)}>
                                    Back
                                </Button>
                                <Button
                                    onClick={() => setStep(3)}
                                    disabled={!goalScore}
                                    className="bg-theme-base hover:bg-theme-dark text-white"
                                >
                                    Continue
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 3: Test Date */}
                {step === 3 && (
                    <Card className="border-2 animate-in fade-in slide-in-from-right duration-300">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-theme-base/10">
                                    <Calendar className="h-6 w-6 text-theme" />
                                </div>
                                <div>
                                    <CardTitle>When is your SAT?</CardTitle>
                                    <CardDescription>We'll pace your study plan accordingly</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <SATCountdown variant="card" />

                            <div className="space-y-2">
                                <Label>Select your target test date</Label>
                                <Input
                                    type="date"
                                    value={testDate}
                                    onChange={(e) => setTestDate(e.target.value)}
                                    className="h-12"
                                />
                            </div>

                            <div className="flex justify-between">
                                <Button variant="outline" onClick={() => setStep(2)}>
                                    Back
                                </Button>
                                <Button
                                    onClick={() => setStep(4)}
                                    disabled={!testDate}
                                    className="bg-theme-base hover:bg-theme-dark text-white"
                                >
                                    Continue
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 4: Study Time */}
                {step === 4 && (
                    <Card className="border-2 animate-in fade-in slide-in-from-right duration-300">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-theme-base/10">
                                    <BookOpen className="h-6 w-6 text-theme" />
                                </div>
                                <div>
                                    <CardTitle>How much time can you study weekly?</CardTitle>
                                    <CardDescription>Be honest—consistency matters more than intensity</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-3 gap-3">
                                {studyPlans.map((plan) => (
                                    <button
                                        key={plan.hours}
                                        onClick={() => setWeeklyHours(plan.hours)}
                                        className={`p-4 rounded-lg border-2 text-center transition-all ${weeklyHours === plan.hours
                                                ? 'border-theme bg-theme-base/10'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="font-bold text-xl">{plan.hours}</div>
                                        <div className="text-sm font-medium">hrs/week</div>
                                        <div className="text-xs text-gray-500 mt-1">{plan.label}</div>
                                    </button>
                                ))}
                            </div>

                            <div className="p-4 bg-theme-base/10 rounded-lg border border-theme/20">
                                <p className="text-sm">
                                    <strong>Your personalized plan is ready!</strong> Based on your goals,
                                    we've created a study schedule that will help you reach {goalScore}.
                                </p>
                            </div>

                            <div className="flex justify-between">
                                <Button variant="outline" onClick={() => setStep(3)}>
                                    Back
                                </Button>
                                <Button
                                    onClick={handleComplete}
                                    disabled={!weeklyHours}
                                    className="bg-theme-base hover:bg-theme-dark text-white"
                                >
                                    <Zap className="h-4 w-4 mr-2" />
                                    Start My Journey
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
