"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
    SAT_MATH_CATEGORIES,
    SAT_RW_CATEGORIES,
    getCategoryPercentage,
    getPerformanceLevel,
    type CategoryStatsMap,
} from "@/lib/sat-categories"
import { TrendingUp, TrendingDown, Target, Brain } from "lucide-react"

interface CategoryStatsProps {
    testResults: any[]
}

export function CategoryStats({ testResults }: CategoryStatsProps) {
    // Aggregate category stats across all test results
    const aggregatedStats: CategoryStatsMap = {}

    testResults.forEach((result) => {
        const stats = result.category_stats as CategoryStatsMap | null
        if (!stats) return

        Object.entries(stats).forEach(([categoryId, categoryData]) => {
            if (!aggregatedStats[categoryId as keyof CategoryStatsMap]) {
                aggregatedStats[categoryId as keyof CategoryStatsMap] = { correct: 0, total: 0 }
            }
            aggregatedStats[categoryId as keyof CategoryStatsMap]!.correct += categoryData.correct
            aggregatedStats[categoryId as keyof CategoryStatsMap]!.total += categoryData.total
        })
    })

    // Find strengths and weaknesses
    const categoryPerformances = Object.entries(aggregatedStats)
        .map(([id, stats]) => ({
            id,
            percentage: getCategoryPercentage(stats),
            total: stats.total,
        }))
        .filter((c) => c.total >= 3) // Only include categories with enough data
        .sort((a, b) => b.percentage - a.percentage)

    const strengths = categoryPerformances.slice(0, 2)
    const weaknesses = categoryPerformances.slice(-2).reverse()

    const hasData = Object.keys(aggregatedStats).length > 0

    if (!hasData) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-[#4ECDC4]" />
                        Category Performance
                    </CardTitle>
                    <CardDescription>Complete some practice tests to see your performance by category</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No category data available yet.</p>
                        <p className="text-sm mt-2">Start a test to begin tracking your progress!</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Strengths & Weaknesses Summary */}
            <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-green-500/30 bg-green-500/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            Your Strengths
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {strengths.length > 0 ? (
                            <ul className="space-y-2">
                                {strengths.map((cat) => {
                                    const category = [...SAT_MATH_CATEGORIES, ...SAT_RW_CATEGORIES].find(
                                        (c) => c.id === cat.id
                                    )
                                    return (
                                        <li key={cat.id} className="flex items-center justify-between">
                                            <span className="text-sm font-medium">{category?.name || cat.id}</span>
                                            <span className="text-green-600 font-bold">{cat.percentage}%</span>
                                        </li>
                                    )
                                })}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">Complete more tests for insights</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-amber-500/30 bg-amber-500/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <TrendingDown className="h-4 w-4 text-amber-500" />
                            Areas to Improve
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {weaknesses.length > 0 ? (
                            <ul className="space-y-2">
                                {weaknesses.map((cat) => {
                                    const category = [...SAT_MATH_CATEGORIES, ...SAT_RW_CATEGORIES].find(
                                        (c) => c.id === cat.id
                                    )
                                    return (
                                        <li key={cat.id} className="flex items-center justify-between">
                                            <span className="text-sm font-medium">{category?.name || cat.id}</span>
                                            <span className="text-amber-600 font-bold">{cat.percentage}%</span>
                                        </li>
                                    )
                                })}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">Complete more tests for insights</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Math Categories */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Math Performance</CardTitle>
                    <CardDescription>Your performance across SAT Math categories</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {SAT_MATH_CATEGORIES.map((category) => {
                        const stats = aggregatedStats[category.id as keyof CategoryStatsMap]
                        const percentage = stats ? getCategoryPercentage(stats) : 0
                        const level = getPerformanceLevel(percentage)
                        const hasStats = stats && stats.total > 0

                        return (
                            <div key={category.id} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: category.color }}
                                        />
                                        <span className="font-medium text-sm">{category.name}</span>
                                        <span className="text-xs text-muted-foreground">({category.weight}%)</span>
                                    </div>
                                    {hasStats ? (
                                        <span
                                            className={`text-sm font-bold ${level === "excellent"
                                                    ? "text-green-600"
                                                    : level === "good"
                                                        ? "text-blue-600"
                                                        : level === "needs_work"
                                                            ? "text-amber-600"
                                                            : "text-red-600"
                                                }`}
                                        >
                                            {percentage}% ({stats.correct}/{stats.total})
                                        </span>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">No data</span>
                                    )}
                                </div>
                                <Progress
                                    value={hasStats ? percentage : 0}
                                    className="h-2"
                                    style={
                                        {
                                            "--progress-foreground": category.color,
                                        } as React.CSSProperties
                                    }
                                />
                            </div>
                        )
                    })}
                </CardContent>
            </Card>

            {/* Reading & Writing Categories */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Reading & Writing Performance</CardTitle>
                    <CardDescription>Your performance across SAT R&W categories</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {SAT_RW_CATEGORIES.map((category) => {
                        const stats = aggregatedStats[category.id as keyof CategoryStatsMap]
                        const percentage = stats ? getCategoryPercentage(stats) : 0
                        const level = getPerformanceLevel(percentage)
                        const hasStats = stats && stats.total > 0

                        return (
                            <div key={category.id} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: category.color }}
                                        />
                                        <span className="font-medium text-sm">{category.name}</span>
                                        <span className="text-xs text-muted-foreground">({category.weight}%)</span>
                                    </div>
                                    {hasStats ? (
                                        <span
                                            className={`text-sm font-bold ${level === "excellent"
                                                    ? "text-green-600"
                                                    : level === "good"
                                                        ? "text-blue-600"
                                                        : level === "needs_work"
                                                            ? "text-amber-600"
                                                            : "text-red-600"
                                                }`}
                                        >
                                            {percentage}% ({stats.correct}/{stats.total})
                                        </span>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">No data</span>
                                    )}
                                </div>
                                <Progress
                                    value={hasStats ? percentage : 0}
                                    className="h-2"
                                    style={
                                        {
                                            "--progress-foreground": category.color,
                                        } as React.CSSProperties
                                    }
                                />
                            </div>
                        )
                    })}
                </CardContent>
            </Card>
        </div>
    )
}
