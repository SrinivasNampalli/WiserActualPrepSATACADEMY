"use client"

import { TestResultsSummary } from "@/components/test-results-summary"
import type { CategoryStatsMap } from "@/lib/sat-categories"

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
}

export function TestResultsContent({ result, testTitle }: TestResultsContentProps) {
    return (
        <TestResultsSummary
            score={result.score}
            totalScore={result.total_score}
            correctAnswers={result.correct_answers || 0}
            totalQuestions={result.total_questions || 0}
            timeTaken={result.time_taken_minutes || 0}
            categoryStats={(result.category_stats as CategoryStatsMap) || {}}
            testTitle={testTitle}
        />
    )
}
