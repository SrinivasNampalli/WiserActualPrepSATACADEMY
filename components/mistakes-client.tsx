"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    XCircle,
    Lightbulb,
    TrendingUp,
    TrendingDown,
    Target,
    PieChart as PieChartIcon,
    BarChart3,
} from "lucide-react"
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
} from "recharts"

interface Question {
    id: string
    question_text: string
    options: string[]
    correct_answer: string
    category?: string
    image_url?: string
    explanation?: string
}

interface MistakeData {
    question: Question
    userAnswer: string
    testTitle?: string
    testDate?: string
}

interface MistakesClientProps {
    incorrectQuestions: MistakeData[]
    testResults: {
        id: string
        correct_answers: number
        total_questions: number
        completed_at: string
    }[]
}

// Theme-aware colors using CSS variables
const CHART_COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
]

// Fallback colors for charts (matching the theme system)
const PIE_COLORS = ["#4ECDC4", "#FF6B9D", "#F7931E", "#8B5CF6", "#10B981"]

export function MistakesClient({ incorrectQuestions, testResults }: MistakesClientProps) {
    // Calculate stats
    const totalMistakes = incorrectQuestions.length
    const categoryBreakdown = incorrectQuestions.reduce((acc, item) => {
        const cat = item.question.category || "Uncategorized"
        acc[cat] = (acc[cat] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const pieData = Object.entries(categoryBreakdown).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
    }))

    // Calculate accuracy trend from test results
    const accuracyTrend = testResults
        .slice(0, 7)
        .reverse()
        .map((result, index) => ({
            name: `Test ${index + 1}`,
            accuracy: Math.round((result.correct_answers / result.total_questions) * 100),
            date: new Date(result.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        }))

    // Find worst category
    const worstCategory = pieData.sort((a, b) => b.value - a.value)[0]?.name || "N/A"

    // Overall accuracy
    const totalCorrect = testResults.reduce((sum, r) => sum + r.correct_answers, 0)
    const totalQuestions = testResults.reduce((sum, r) => sum + r.total_questions, 0)
    const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0

    const getOptionLabel = (index: number) => String.fromCharCode(65 + index)

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            {/* Themed Header */}
            <header className="sticky top-0 z-50 shadow-lg" style={{ background: 'var(--theme-gradient)' }}>
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-white/70 hover:text-white hover:bg-white/10"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold text-xl text-white">Mistake Log</h1>
                                <p className="text-sm text-white/70">Learn from your mistakes</p>
                            </div>
                        </div>
                    </div>
                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                        {totalMistakes} {totalMistakes === 1 ? "Mistake" : "Mistakes"}
                    </Badge>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
                {/* Stats Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Total Mistakes</p>
                                    <p className="text-3xl font-bold text-gray-900">{totalMistakes}</p>
                                </div>
                                <div className="p-3 rounded-xl" style={{ backgroundColor: 'color-mix(in srgb, var(--theme-base) 20%, transparent)' }}>
                                    <XCircle className="w-6 h-6" style={{ color: 'var(--theme-base)' }} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Overall Accuracy</p>
                                    <p className="text-3xl font-bold text-gray-900">{overallAccuracy}%</p>
                                </div>
                                <div className="p-3 rounded-xl bg-green-100">
                                    <Target className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Tests Completed</p>
                                    <p className="text-3xl font-bold text-gray-900">{testResults.length}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-blue-100">
                                    <BarChart3 className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Needs Work</p>
                                    <p className="text-xl font-bold text-gray-900 truncate">{worstCategory}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-amber-100">
                                    <TrendingDown className="w-6 h-6 text-amber-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Pie Chart - Mistakes by Category */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <PieChartIcon className="w-5 h-5" style={{ color: 'var(--theme-base)' }} />
                                Mistakes by Category
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {pieData.length > 0 ? (
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={4}
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                labelLine={false}
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-64 flex items-center justify-center text-gray-400">
                                    <div className="text-center">
                                        <PieChartIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>No mistake data yet</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Area Chart - Accuracy Trend */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <TrendingUp className="w-5 h-5" style={{ color: 'var(--theme-base)' }} />
                                Accuracy Trend
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {accuracyTrend.length > 0 ? (
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={accuracyTrend}>
                                            <defs>
                                                <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0.1} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                                            <Tooltip
                                                formatter={(value: number) => [`${value}%`, "Accuracy"]}
                                                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="accuracy"
                                                stroke="#4ECDC4"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorAccuracy)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-64 flex items-center justify-center text-gray-400">
                                    <div className="text-center">
                                        <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>Complete tests to see trends</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Mistake List */}
                {incorrectQuestions.length === 0 ? (
                    <Card className="border-0 shadow-lg">
                        <CardContent className="py-16 text-center">
                            <CheckCircle2 className="w-20 h-20 mx-auto mb-4" style={{ color: 'var(--theme-base)' }} />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Perfect Score!</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                Amazing work! You haven't made any mistakes yet. Keep practicing to maintain your streak!
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <BookOpen className="w-5 h-5" style={{ color: 'var(--theme-base)' }} />
                            Review Your Mistakes
                        </h2>
                        {incorrectQuestions.map((item, index) => (
                            <Card key={`${item.question.id}-${index}`} className="border-0 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                <CardHeader className="pb-3" style={{ background: 'linear-gradient(to right, color-mix(in srgb, var(--theme-base) 10%, white), color-mix(in srgb, var(--theme-light) 10%, white))' }}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge style={{ backgroundColor: 'var(--theme-base)', color: 'white' }}>
                                                Question {index + 1}
                                            </Badge>
                                            {item.question.category && (
                                                <Badge variant="outline" className="capitalize border-gray-300">
                                                    {item.question.category}
                                                </Badge>
                                            )}
                                        </div>
                                        {item.testTitle && (
                                            <span className="text-xs text-gray-500">
                                                {item.testTitle} {item.testDate && `• ${item.testDate}`}
                                            </span>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    {/* Question Image */}
                                    {item.question.image_url && (
                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                            <img
                                                src={item.question.image_url}
                                                alt="Question illustration"
                                                className="max-h-48 mx-auto rounded object-contain"
                                            />
                                        </div>
                                    )}

                                    {/* Question Text */}
                                    <p className="text-gray-900 font-medium leading-relaxed whitespace-pre-wrap">
                                        {item.question.question_text}
                                    </p>

                                    {/* Answer Options */}
                                    <div className="grid gap-2">
                                        {item.question.options.map((option, optIndex) => {
                                            const label = getOptionLabel(optIndex)
                                            const isUserAnswer = item.userAnswer === label
                                            const isCorrectAnswer = item.question.correct_answer === label

                                            return (
                                                <div
                                                    key={optIndex}
                                                    className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${isCorrectAnswer
                                                            ? 'bg-green-50 border-green-400'
                                                            : isUserAnswer
                                                                ? 'bg-red-50 border-red-400'
                                                                : 'bg-gray-50 border-gray-200'
                                                        }`}
                                                >
                                                    <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm ${isCorrectAnswer
                                                            ? 'bg-green-500 text-white'
                                                            : isUserAnswer
                                                                ? 'bg-red-500 text-white'
                                                                : 'bg-gray-200 text-gray-600'
                                                        }`}>
                                                        {label}
                                                    </span>
                                                    <span className={`flex-1 pt-0.5 ${isCorrectAnswer ? 'text-green-800 font-medium' :
                                                            isUserAnswer ? 'text-red-800' : 'text-gray-700'
                                                        }`}>
                                                        {option}
                                                    </span>
                                                    {isCorrectAnswer && (
                                                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                                                    )}
                                                    {isUserAnswer && !isCorrectAnswer && (
                                                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {/* Answer Summary */}
                                    <div className="flex flex-wrap gap-4 text-sm pt-2 border-t border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <XCircle className="w-4 h-4 text-red-500" />
                                            <span className="text-gray-600">Your answer:</span>
                                            <span className="font-semibold text-red-700">{item.userAnswer}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            <span className="text-gray-600">Correct answer:</span>
                                            <span className="font-semibold text-green-700">{item.question.correct_answer}</span>
                                        </div>
                                    </div>

                                    {/* Explanation */}
                                    {item.question.explanation && (
                                        <div className="rounded-lg p-4 mt-2" style={{ backgroundColor: 'color-mix(in srgb, var(--theme-base) 10%, white)', borderColor: 'color-mix(in srgb, var(--theme-base) 30%, white)', borderWidth: '1px' }}>
                                            <div className="flex items-start gap-3">
                                                <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--theme-dark)' }} />
                                                <div>
                                                    <p className="font-semibold mb-1" style={{ color: 'var(--theme-dark)' }}>Explanation</p>
                                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--theme-dark)' }}>
                                                        {item.question.explanation}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Back to Dashboard */}
                <div className="flex justify-center pt-4">
                    <Button
                        asChild
                        className="text-white"
                        style={{ backgroundColor: 'var(--theme-base)' }}
                    >
                        <Link href="/dashboard">
                            Back to Dashboard
                        </Link>
                    </Button>
                </div>
            </main>
        </div>
    )
}
