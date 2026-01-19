"use client"

import { useState } from "react"
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
    FileText,
    X
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
    const [selectedSummary, setSelectedSummary] = useState<any>(null)
    const [showAllSummaries, setShowAllSummaries] = useState(false)

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
            {/* Quick Stats Row - Using inline styles for theme */}
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
                                            <div
                                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                                style={{
                                                    backgroundColor: i === 0 ? 'var(--theme-base)' : '#e5e7eb',
                                                    color: i === 0 ? 'white' : '#4b5563'
                                                }}
                                            >
                                                <Calendar className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">{satDate.label}</p>
                                                <p className="text-sm text-gray-500">{days} days away</p>
                                            </div>
                                        </div>
                                        {i === 0 && (
                                            <Badge style={{ backgroundColor: 'var(--theme-base)' }} className="text-white">Next</Badge>
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
            </div>

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
