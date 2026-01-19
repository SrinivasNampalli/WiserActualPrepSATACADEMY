"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"
import {
    Calendar as CalendarIcon,
    TrendingUp,
    Clock,
    Target,
    Sparkles,
    ChevronRight,
    FileText,
    X,
    BookOpen,
    Loader2,
    CheckCircle
} from "lucide-react"

interface HomeModuleProps {
    testResults: any[]
    summarizerHistory: any[]
    savedFlashcards?: any[]
    userId: string
}

// SAT Test Dates 2025-2026
const SAT_DATES = [
    { date: new Date("2025-03-08"), label: "March 8, 2025" },
    { date: new Date("2025-05-03"), label: "May 3, 2025" },
    { date: new Date("2025-06-07"), label: "June 7, 2025" },
    { date: new Date("2025-08-23"), label: "August 23, 2025" },
    { date: new Date("2025-10-04"), label: "October 4, 2025" },
    { date: new Date("2025-11-01"), label: "November 1, 2025" },
    { date: new Date("2025-12-06"), label: "December 6, 2025" },
    { date: new Date("2026-03-14"), label: "March 14, 2026" },
    { date: new Date("2026-05-02"), label: "May 2, 2026" },
    { date: new Date("2026-06-06"), label: "June 6, 2026" },
]

// Suggested focus areas
const FOCUS_SUGGESTIONS = [
    "Math - Algebra & Equations",
    "Math - Geometry & Trig",
    "Reading - Main Ideas",
    "Reading - Vocabulary in Context",
    "Writing - Grammar Rules",
    "Full SAT - All Sections"
]

export function HomeModule({ testResults, summarizerHistory, savedFlashcards = [], userId }: HomeModuleProps) {
    const now = new Date()
    const [selectedSummary, setSelectedSummary] = useState<any>(null)
    const [showAllSummaries, setShowAllSummaries] = useState(false)

    // AI Calendar State
    const [focusAreas, setFocusAreas] = useState("")
    const [hoursPerDay, setHoursPerDay] = useState("2")
    const [selectedSATDate, setSelectedSATDate] = useState<Date | null>(SAT_DATES.find(d => d.date > now)?.date || null)
    const [schedule, setSchedule] = useState<any>(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [canGenerate, setCanGenerate] = useState(true)
    const [lastGenerated, setLastGenerated] = useState<string | null>(null)

    // Check daily limit on mount
    useEffect(() => {
        const lastGen = localStorage.getItem(`schedule_generated_${userId}`)
        if (lastGen) {
            const lastDate = new Date(lastGen)
            const today = new Date()
            if (lastDate.toDateString() === today.toDateString()) {
                setCanGenerate(false)
                setLastGenerated(lastGen)
            }
        }
        // Load saved schedule
        const savedSchedule = localStorage.getItem(`study_schedule_${userId}`)
        if (savedSchedule) {
            setSchedule(JSON.parse(savedSchedule))
        }
    }, [userId])

    // Get next upcoming SAT dates
    const upcomingDates = SAT_DATES.filter(d => d.date >= now).slice(0, 3)

    // Calculate days until next SAT
    const nextSAT = upcomingDates[0]
    const daysUntilSAT = nextSAT
        ? Math.ceil((nextSAT.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null

    // Stats
    const totalTests = testResults.length
    const totalSummaries = summarizerHistory.length
    const recentSummaries = summarizerHistory.slice(0, 3)
    const recentFlashcards = savedFlashcards.slice(0, 3)

    // Best score
    const bestScore = testResults.length > 0
        ? Math.max(...testResults.map(r => Math.round((r.correct_answers / r.total_questions) * 100)))
        : 0

    // Generate AI Schedule
    const handleGenerateSchedule = async () => {
        if (!canGenerate || !focusAreas.trim() || !selectedSATDate) return

        setIsGenerating(true)
        try {
            const response = await fetch("/api/gemini/generate-schedule", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    satDate: selectedSATDate.toISOString().split("T")[0],
                    focusAreas,
                    hoursPerDay: parseInt(hoursPerDay),
                    userId
                })
            })

            const data = await response.json()
            if (data.success) {
                setSchedule(data)
                // Save to localStorage
                localStorage.setItem(`study_schedule_${userId}`, JSON.stringify(data))
                localStorage.setItem(`schedule_generated_${userId}`, new Date().toISOString())
                setCanGenerate(false)
            } else {
                alert("Failed to generate schedule: " + data.error)
            }
        } catch (error) {
            console.error("Error generating schedule:", error)
            alert("Failed to generate schedule")
        } finally {
            setIsGenerating(false)
        }
    }

    // Highlight SAT dates on calendar
    const tileClassName = ({ date }: { date: Date }) => {
        const isSATDate = SAT_DATES.some(
            satDate => satDate.date.toDateString() === date.toDateString()
        )
        if (isSATDate) {
            return "sat-date-tile"
        }
        return null
    }

    return (
        <div className="space-y-6">
            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card
                    className="text-white border-0"
                    style={{ background: 'linear-gradient(to bottom right, var(--theme-base), var(--theme-dark))' }}
                >
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/80 text-sm">Tests Completed</p>
                                <p className="text-3xl font-bold">{totalTests}</p>
                            </div>
                            <Target className="h-10 w-10 text-white/60" />
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className="text-white border-0"
                    style={{ background: 'linear-gradient(to bottom right, var(--theme-base), var(--theme-dark))' }}
                >
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/80 text-sm">Best Score</p>
                                <p className="text-3xl font-bold">{bestScore}%</p>
                            </div>
                            <TrendingUp className="h-10 w-10 text-white/60" />
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className="text-white border-0"
                    style={{ background: 'linear-gradient(to bottom right, var(--theme-base), var(--theme-dark))' }}
                >
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/80 text-sm">AI Summaries</p>
                                <p className="text-3xl font-bold">{totalSummaries}</p>
                            </div>
                            <Sparkles className="h-10 w-10 text-white/60" />
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className="text-white border-0"
                    style={{ background: 'linear-gradient(to bottom right, var(--theme-base), var(--theme-dark))' }}
                >
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/80 text-sm">Days Until SAT</p>
                                <p className="text-3xl font-bold">{daysUntilSAT ?? "—"}</p>
                            </div>
                            <Clock className="h-10 w-10 text-white/60" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Summaries + Saved Flashcards Row */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Recent Summaries Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-theme" />
                                <CardTitle>Recent Summaries</CardTitle>
                            </div>
                            {recentSummaries.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-theme"
                                    onClick={() => setShowAllSummaries(true)}
                                >
                                    View All <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            )}
                        </div>
                        <CardDescription>Your AI-generated study summaries</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentSummaries.length > 0 ? (
                            <div className="space-y-3">
                                {recentSummaries.map((summary: any) => (
                                    <div
                                        key={summary.id}
                                        className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                                        onClick={() => setSelectedSummary(summary)}
                                    >
                                        <p className="font-medium text-gray-800 truncate">
                                            {summary.original_text?.substring(0, 60) || "Untitled Summary"}...
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(summary.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Sparkles className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p>No summaries yet</p>
                                <p className="text-sm mt-1">Use the AI Summarizer to create study notes</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Saved Flashcards Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-theme" />
                                <CardTitle>Saved Flashcards</CardTitle>
                            </div>
                        </div>
                        <CardDescription>Your saved flashcard sets</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentFlashcards.length > 0 ? (
                            <div className="space-y-3">
                                {recentFlashcards.map((set: any) => (
                                    <div
                                        key={set.id}
                                        className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                                    >
                                        <p className="font-medium text-gray-800">{set.name || set.topic}</p>
                                        <p className="text-sm text-gray-500">
                                            {set.card_count || "?"} cards • {new Date(set.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p>No flashcards saved</p>
                                <p className="text-sm mt-1">Generate flashcards and save them for later</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* AI Study Planner - Full Width */}
            <Card className="border-2 border-theme-base/30">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-theme" />
                            <CardTitle>AI Study Planner</CardTitle>
                        </div>
                        {!canGenerate && (
                            <Badge variant="outline" className="text-amber-600 border-amber-300">
                                1 per day limit reached
                            </Badge>
                        )}
                    </div>
                    <CardDescription>Generate a personalized study schedule based on your SAT date</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Input Section */}
                        <div className="space-y-4">
                            <div>
                                <Label>Focus Areas</Label>
                                <Input
                                    placeholder="e.g., Math algebra, Reading comprehension"
                                    value={focusAreas}
                                    onChange={(e) => setFocusAreas(e.target.value)}
                                    disabled={!canGenerate}
                                />
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {FOCUS_SUGGESTIONS.slice(0, 4).map(suggestion => (
                                        <Badge
                                            key={suggestion}
                                            variant="outline"
                                            className="cursor-pointer hover:bg-theme-base/10"
                                            onClick={() => setFocusAreas(suggestion)}
                                        >
                                            {suggestion}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Label>Hours per Day</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="8"
                                    value={hoursPerDay}
                                    onChange={(e) => setHoursPerDay(e.target.value)}
                                    disabled={!canGenerate}
                                />
                            </div>

                            <div>
                                <Label>Target SAT Date</Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {upcomingDates.map(satDate => (
                                        <Badge
                                            key={satDate.label}
                                            className={`cursor-pointer ${selectedSATDate?.toDateString() === satDate.date.toDateString()
                                                ? 'bg-theme-base text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            onClick={() => setSelectedSATDate(satDate.date)}
                                        >
                                            {satDate.label}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <Button
                                onClick={handleGenerateSchedule}
                                disabled={!canGenerate || isGenerating || !focusAreas.trim()}
                                className="w-full"
                                style={{ backgroundColor: canGenerate ? 'var(--theme-base)' : undefined }}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Generating Schedule...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Generate Study Plan
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Calendar + Schedule Display */}
                        <div>
                            {schedule ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-green-600">
                                        <CheckCircle className="h-5 w-5" />
                                        <span className="font-medium">Schedule Generated!</span>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto space-y-3">
                                        {schedule.schedule?.map((week: any) => (
                                            <div key={week.week} className="p-3 bg-gray-50 rounded-lg">
                                                <p className="font-semibold text-theme">Week {week.week}: {week.focus}</p>
                                                <ul className="mt-2 space-y-1">
                                                    {week.tasks?.map((task: string, i: number) => (
                                                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                                            <span className="text-theme">•</span>
                                                            {task}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                    {schedule.tips && (
                                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                            <p className="font-medium text-amber-800 mb-2">💡 Tips</p>
                                            <ul className="space-y-1">
                                                {schedule.tips.map((tip: string, i: number) => (
                                                    <li key={i} className="text-sm text-amber-700">{tip}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <CalendarIcon className="h-16 w-16 mx-auto mb-3 text-gray-300" />
                                    <p>Enter your focus areas and generate a plan</p>
                                    <p className="text-sm mt-1">Limited to 1 generation per day</p>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Full Width Calendar at Bottom */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-theme" />
                        <CardTitle>SAT Test Calendar</CardTitle>
                    </div>
                    <CardDescription>Official SAT test dates are highlighted in green</CardDescription>
                </CardHeader>
                <CardContent>
                    <style jsx global>{`
                        .react-calendar {
                            width: 100% !important;
                            border: none !important;
                            font-family: inherit;
                        }
                        .react-calendar__tile {
                            padding: 1em 0.5em;
                        }
                        .react-calendar__tile--active {
                            background: var(--theme-base) !important;
                        }
                        .sat-date-tile {
                            background: #10b981 !important;
                            color: white !important;
                            font-weight: bold;
                            border-radius: 8px;
                        }
                        .react-calendar__tile--now {
                            background: #fef3c7 !important;
                        }
                    `}</style>
                    <Calendar
                        value={selectedSATDate}
                        onChange={(date) => setSelectedSATDate(date as Date)}
                        tileClassName={tileClassName}
                        minDate={new Date()}
                        className="rounded-lg"
                    />
                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-green-500"></div>
                            <span>SAT Test Date</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-amber-200"></div>
                            <span>Today</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Detail Modal */}
            {selectedSummary && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedSummary(null)}>
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="font-semibold text-lg">Summary Details</h3>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedSummary(null)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
                            <div className="mb-4">
                                <p className="text-sm text-gray-500 mb-1">Original Text</p>
                                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedSummary.original_text}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">AI Summary</p>
                                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">{selectedSummary.summarized_text}</p>
                            </div>
                        </div>
                        <div className="p-4 border-t">
                            <p className="text-xs text-gray-400">
                                Created: {new Date(selectedSummary.created_at).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* View All Summaries Modal */}
            {showAllSummaries && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAllSummaries(false)}>
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="font-semibold text-lg">All Summaries ({summarizerHistory.length})</h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowAllSummaries(false)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)] space-y-3">
                            {summarizerHistory.map((summary: any) => (
                                <div
                                    key={summary.id}
                                    className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                                    onClick={() => {
                                        setShowAllSummaries(false)
                                        setSelectedSummary(summary)
                                    }}
                                >
                                    <p className="font-medium text-gray-800">
                                        {summary.original_text?.substring(0, 80) || "Untitled"}...
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {new Date(summary.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
