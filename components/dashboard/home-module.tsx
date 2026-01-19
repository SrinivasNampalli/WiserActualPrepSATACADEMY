"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Calendar,
    TrendingUp,
    Clock,
    Target,
    Sparkles,
    ChevronRight,
    FileText
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

export function HomeModule({ testResults, summarizerHistory, savedFlashcards = [], userId }: HomeModuleProps) {
    const now = new Date()

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

    // Best score
    const bestScore = testResults.length > 0
        ? Math.max(...testResults.map(r => Math.round((r.correct_answers / r.total_questions) * 100)))
        : 0

    return (
        <div className="space-y-6">
            {/* Quick Stats Row - Using theme colors */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-theme-base to-theme-dark text-white border-0">
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

                <Card className="bg-gradient-to-br from-theme-base to-theme-dark text-white border-0">
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

                <Card className="bg-gradient-to-br from-theme-base to-theme-dark text-white border-0">
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

                <Card className="bg-gradient-to-br from-theme-base to-theme-dark text-white border-0">
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

            <div className="grid md:grid-cols-2 gap-6">
                {/* SAT Calendar Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-theme" />
                            <CardTitle>Upcoming SAT Dates</CardTitle>
                        </div>
                        <CardDescription>Mark your calendar and plan your prep</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {upcomingDates.map((satDate, i) => {
                                const days = Math.ceil((satDate.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                                return (
                                    <div
                                        key={satDate.label}
                                        className={`flex items-center justify-between p-3 rounded-lg ${i === 0 ? 'bg-theme-base/10 border border-theme-base/30' : 'bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${i === 0 ? 'bg-theme-base text-white' : 'bg-gray-200 text-gray-600'
                                                }`}>
                                                <Calendar className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">{satDate.label}</p>
                                                <p className="text-sm text-gray-500">{days} days away</p>
                                            </div>
                                        </div>
                                        {i === 0 && (
                                            <Badge className="bg-theme-base text-white">Next</Badge>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Summaries Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-theme" />
                                <CardTitle>Recent Summaries</CardTitle>
                            </div>
                            <Button variant="ghost" size="sm" className="text-theme">
                                View All <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
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
            </div>
        </div>
    )
}
