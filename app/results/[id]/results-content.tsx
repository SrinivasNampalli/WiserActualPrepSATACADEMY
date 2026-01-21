"use client"

import { useState } from "react"
import { TestResultsSummary } from "@/components/test-results-summary"
import { MistakeLog } from "@/components/mistake-log"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { CategoryStatsMap } from "@/lib/sat-categories"
import { BarChart3, BookOpen } from "lucide-react"

interface Question {
    id: string
    question_text: string
    options: string[]
    correct_answer: string
    category?: string
    image_url?: string
    explanation?: string
}

interface TestResultsContentProps {
    result: {
        id: string
        score: number
        total_score: number
        correct_answers?: number
        total_questions?: number
        time_taken_minutes?: number
        category_stats?: CategoryStatsMap
    }
    testTitle: string
    incorrectQuestions?: { question: Question; userAnswer: string }[]
}

export function TestResultsContent({ result, testTitle, incorrectQuestions = [] }: TestResultsContentProps) {
    const [activeTab, setActiveTab] = useState("summary")

    const hasIncorrectQuestions = incorrectQuestions.length > 0

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Tab Navigation */}
            {hasIncorrectQuestions && (
                <div className="bg-[#0D2240] text-white py-3 px-4">
                    <div className="max-w-4xl mx-auto">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="bg-white/10 border-0">
                                <TabsTrigger
                                    value="summary"
                                    className="data-[state=active]:bg-white data-[state=active]:text-[#0D2240] text-white"
                                >
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    Summary
                                </TabsTrigger>
                                <TabsTrigger
                                    value="mistakes"
                                    className="data-[state=active]:bg-white data-[state=active]:text-[#0D2240] text-white"
                                >
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    Review Mistakes ({incorrectQuestions.length})
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>
            )}

            {/* Content */}
            {activeTab === "summary" ? (
                <TestResultsSummary
                    score={result.score}
                    totalScore={result.total_score}
                    correctAnswers={result.correct_answers || 0}
                    totalQuestions={result.total_questions || 0}
                    timeTaken={result.time_taken_minutes || 0}
                    categoryStats={(result.category_stats as CategoryStatsMap) || {}}
                    testTitle={testTitle}
                />
            ) : (
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <MistakeLog incorrectQuestions={incorrectQuestions} showTestInfo={false} />
                </div>
            )}

            {/* Quick Action for Summary Tab */}
            {activeTab === "summary" && hasIncorrectQuestions && (
                <div className="fixed bottom-6 right-6 z-50">
                    <Button
                        onClick={() => setActiveTab("mistakes")}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg px-6 py-6 rounded-full"
                    >
                        <BookOpen className="w-5 h-5 mr-2" />
                        Review {incorrectQuestions.length} Mistake{incorrectQuestions.length !== 1 ? 's' : ''}
                    </Button>
                </div>
            )}
        </div>
    )
}
