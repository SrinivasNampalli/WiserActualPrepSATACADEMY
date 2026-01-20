"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
} from "lucide-react"

interface HomeModuleProps {
    testResults: any[]
    summarizerHistory: any[]
    savedFlashcards?: any[]
    userId: string
}

// SAT Test Dates 2025-2026 (for countdown)
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

    // UI State
    const [selectedSummary, setSelectedSummary] = useState<any>(null)
    const [showAllSummaries, setShowAllSummaries] = useState(false)

    // Stats
    const nextSAT = SAT_DATES.find(d => d.date >= now)
    const daysUntilSAT = nextSAT ? Math.ceil((nextSAT.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null
    const totalTests = testResults.length
    const totalSummaries = summarizerHistory.length
    const recentSummaries = summarizerHistory.slice(0, 3)
    const recentFlashcards = savedFlashcards.slice(0, 3)
    const bestScore = testResults.length > 0
        ? Math.max(...testResults.map(r => Math.round((r.correct_answers / r.total_questions) * 100)))
        : 0

    return (
        <div className="space-y-6">
            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="text-white border-0" style={{ background: 'linear-gradient(to bottom right, var(--theme-base), var(--theme-dark))' }}>
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
                <Card className="text-white border-0" style={{ background: 'linear-gradient(to bottom right, var(--theme-base), var(--theme-dark))' }}>
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
                <Card className="text-white border-0" style={{ background: 'linear-gradient(to bottom right, var(--theme-base), var(--theme-dark))' }}>
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
                <Card className="text-white border-0" style={{ background: 'linear-gradient(to bottom right, var(--theme-base), var(--theme-dark))' }}>
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

            {/* Recent Summaries + Saved Flashcards */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-theme" />
                                <CardTitle>Recent Summaries</CardTitle>
                            </div>
                            {recentSummaries.length > 0 && (
                                <Button variant="ghost" size="sm" className="text-theme" onClick={() => setShowAllSummaries(true)}>
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
                                    <div key={summary.id} className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer" onClick={() => setSelectedSummary(summary)}>
                                        <p className="font-medium text-gray-800 truncate">{summary.original_text?.substring(0, 60) || "Untitled"}...</p>
                                        <p className="text-sm text-gray-500">{new Date(summary.created_at).toLocaleDateString()}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Sparkles className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p>No summaries yet</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-theme" />
                            <CardTitle>Saved Flashcards</CardTitle>
                        </div>
                        <CardDescription>Your saved flashcard sets</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentFlashcards.length > 0 ? (
                            <div className="space-y-3">
                                {recentFlashcards.map((set: any) => (
                                    <div key={set.id} className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100">
                                        <p className="font-medium text-gray-800">{set.name || set.topic}</p>
                                        <p className="text-sm text-gray-500">{set.card_count || "?"} cards • {new Date(set.created_at).toLocaleDateString()}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p>No flashcards saved</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Study Planner CTA */}
            <Card className="border-2 border-theme-base/30 bg-gradient-to-br from-white to-blue-50">
                <CardContent className="py-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#1B4B6B] to-[#2d6a8f] flex items-center justify-center">
                                <CalendarIcon className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">AI Study Planner</h3>
                                <p className="text-gray-600">Get a personalized study schedule designed to help you achieve 1600</p>
                            </div>
                        </div>
                        <Button
                            asChild
                            className="whitespace-nowrap"
                            style={{ backgroundColor: 'var(--theme-base)' }}
                        >
                            <a href="/study-planner">
                                <Sparkles className="h-4 w-4 mr-2" />
                                Create My Study Plan
                            </a>
                        </Button>
                    </div>
                </CardContent>
            </Card>


            {/* Summary Modals */}
            {selectedSummary && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedSummary(null)}>
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="font-semibold text-lg">Summary Details</h3>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedSummary(null)}><X className="h-5 w-5" /></Button>
                        </div>
                        <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
                            <p className="text-sm text-gray-500 mb-1">Original Text</p>
                            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg mb-4">{selectedSummary.original_text}</p>
                            <p className="text-sm text-gray-500 mb-1">AI Summary</p>
                            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">{selectedSummary.summarized_text}</p>
                        </div>
                    </div>
                </div>
            )}

            {showAllSummaries && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAllSummaries(false)}>
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="font-semibold text-lg">All Summaries ({summarizerHistory.length})</h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowAllSummaries(false)}><X className="h-5 w-5" /></Button>
                        </div>
                        <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)] space-y-3">
                            {summarizerHistory.map((summary: any) => (
                                <div key={summary.id} className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer" onClick={() => { setShowAllSummaries(false); setSelectedSummary(summary) }}>
                                    <p className="font-medium text-gray-800">{summary.original_text?.substring(0, 80) || "Untitled"}...</p>
                                    <p className="text-sm text-gray-500 mt-1">{new Date(summary.created_at).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
