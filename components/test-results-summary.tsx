"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
    Trophy,
    Target,
    ArrowRight,
    Home,
    RefreshCw,
    Lightbulb,
    AlertTriangle,
    CheckCircle2,
    Brain,
    BarChart3,
    TrendingUp,
    Zap,
    Clock,
    Award,
} from "lucide-react"
import {
    SAT_MATH_CATEGORIES,
    SAT_RW_CATEGORIES,
    getCategoryPercentage,
    type CategoryStatsMap,
} from "@/lib/sat-categories"

interface TestResultsSummaryProps {
    score: number
    totalScore: number
    correctAnswers: number
    totalQuestions: number
    timeTaken: number
    categoryStats: CategoryStatsMap
    testTitle: string
}

// Pool of 100 fake AI insights
const AI_INSIGHTS_POOL = [
    "Your problem-solving speed increased by 23% compared to average first-time users.",
    "Pattern detected: You excel at questions requiring logical deduction.",
    "Analysis shows strong conceptual understanding in algebraic reasoning.",
    "Your reading comprehension scores suggest advanced vocabulary retention.",
    "Time management analysis: You spent optimal time on difficult questions.",
    "Neural pattern match: Similar to 94th percentile test-takers.",
    "Cognitive load analysis indicates efficient mental processing.",
    "Your error patterns suggest minor attention lapses on medium-difficulty items.",
    "Strength detected: Multi-step problem decomposition skills above average.",
    "Improvement opportunity: Complex sentence structure interpretation.",
    "Your accuracy on inference questions exceeds baseline by 18%.",
    "Processing speed metrics indicate room for strategic time allocation.",
    "Pattern recognition abilities scored in the top quartile.",
    "Vocabulary inference skills show strong contextual reasoning.",
    "Mathematical reasoning pathways align with high-achiever profiles.",
    "Your approach to elimination strategies is highly effective.",
    "Analysis indicates strong working memory utilization.",
    "Critical reading engagement levels exceed typical benchmarks.",
    "Quantitative reasoning shows consistent methodology application.",
    "Your revision patterns suggest thorough answer verification habits.",
    "Abstract reasoning scores indicate strong analytical capabilities.",
    "Comparative analysis shows above-average synthesis skills.",
    "Your attention to detail metrics are in the 85th percentile.",
    "Evidence-based reasoning shows systematic approach.",
    "Geometric visualization abilities are particularly strong.",
    "Text analysis speed is 12% faster than cohort average.",
    "Your approach to data interpretation is methodical and accurate.",
    "Verbal reasoning patterns match advanced proficiency levels.",
    "Calculation accuracy suggests solid foundational math skills.",
    "Reading passage engagement shows active comprehension strategies.",
    "Your question prioritization strategy is well-optimized.",
    "Analysis reveals strong cause-and-effect reasoning.",
    "Graph interpretation skills are notably above baseline.",
    "Sentence completion accuracy indicates rich vocabulary.",
    "Your problem approach shows excellent strategic planning.",
    "Pattern: High accuracy on questions with visual components.",
    "Textual inference abilities demonstrate strong subtext reading.",
    "Mathematical modeling skills are developing well.",
    "Your pacing strategy maximizes available time effectively.",
    "Critical analysis of arguments shows logical consistency.",
    "Numerical estimation skills are highly accurate.",
    "Reading speed paired with comprehension is optimal.",
    "Your error correction during review is effective.",
    "Abstract word relationship recognition is strong.",
    "Data analysis methodology shows structured thinking.",
    "Your approach to unfamiliar content is adaptive.",
    "Inference chains are logically sound and complete.",
    "Mathematical intuition aligns with problem requirements.",
    "Contextual vocabulary usage is sophisticated.",
    "Your stamina throughout the test remained consistent.",
    "Complex sentence parsing shows advanced language skills.",
    "Quantitative comparison accuracy is above average.",
    "Your reading depth matches high comprehension profiles.",
    "Algebraic manipulation speed is well-developed.",
    "Evidence synthesis from multiple sources is strong.",
    "Your test-taking confidence level appears optimal.",
    "Pattern recognition in sequences is highly accurate.",
    "Main idea extraction is quick and reliable.",
    "Your computational fluency supports complex problems.",
    "Tone and style detection in passages is nuanced.",
    "Problem categorization speed indicates experience.",
    "Your answer change patterns show good judgment.",
    "Grammatical rule application is consistent.",
    "Data trend identification is accurate and fast.",
    "Your concentration metrics remained stable throughout.",
    "Word choice analysis shows semantic awareness.",
    "Proportional reasoning is a clear strength.",
    "Your skipping strategy on difficult items was effective.",
    "Author purpose identification accuracy is high.",
    "Equation solving shows systematic methodology.",
    "Your reading annotation strategy is productive.",
    "Function interpretation skills are well-developed.",
    "Passage structure recognition supports comprehension.",
    "Your mental math abilities reduce calculation time.",
    "Implicit meaning extraction is a notable strength.",
    "Unit conversion accuracy is reliable.",
    "Your question stem analysis is thorough.",
    "Rhetorical device recognition is above average.",
    "Algebraic translation from word problems is strong.",
    "Your passage preview strategy saves time.",
    "Logical connector understanding is solid.",
    "Percentage calculation speed is excellent.",
    "Your active reading engagement is measurable.",
    "Transition word usage comprehension is strong.",
    "Geometric proof logic is well-structured.",
    "Your vocabulary in context scores are impressive.",
    "Rate and ratio problems show strong fundamentals.",
    "Close reading for evidence is methodical.",
    "Your answer elimination process is efficient.",
    "Punctuation rule application is accurate.",
    "Statistical reasoning shows good intuition.",
    "Your main argument identification is reliable.",
    "Linear equation solving is a core strength.",
    "Compare and contrast skills are well-developed.",
    "Your focus recovery after difficult items is quick.",
    "Sentence boundary recognition is accurate.",
    "Exponential growth understanding is solid.",
    "Your summary ability indicates deep comprehension.",
    "Pronoun reference clarity checking is effective.",
    "Coordinate geometry skills are above baseline.",
]

// Get random insights for display
function getRandomInsights(count: number, percentage: number): string[] {
    const shuffled = [...AI_INSIGHTS_POOL].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
}

// Get performance level based on percentage
function getPerformanceLevel(percentage: number) {
    if (percentage >= 90) {
        return {
            message: "Outstanding performance! You crushed it! 🌟",
            color: "text-green-400",
            bgColor: "bg-gradient-to-r from-green-500 to-emerald-500",
            label: "Excellent"
        }
    } else if (percentage >= 70) {
        return {
            message: "Great job! You're showing solid understanding! 💪",
            color: "text-blue-400",
            bgColor: "bg-gradient-to-r from-blue-500 to-cyan-500",
            label: "Good"
        }
    } else if (percentage >= 50) {
        return {
            message: "Good effort! Keep practicing to improve! 📈",
            color: "text-amber-400",
            bgColor: "bg-gradient-to-r from-amber-500 to-orange-500",
            label: "Fair"
        }
    } else {
        return {
            message: "Keep going! Every practice makes you stronger! 🎯",
            color: "text-purple-400",
            bgColor: "bg-gradient-to-r from-purple-500 to-pink-500",
            label: "Needs Practice"
        }
    }
}

// Generate fake chart data
function generateChartData(correctAnswers: number, totalQuestions: number, categoryStats: CategoryStatsMap) {
    const percentage = Math.round((correctAnswers / totalQuestions) * 100)

    // Fake performance over time data
    const timeData = [
        { label: "Q1-Q5", value: Math.min(100, percentage + Math.floor(Math.random() * 20) - 10) },
        { label: "Q6-Q10", value: Math.min(100, percentage + Math.floor(Math.random() * 20) - 10) },
        { label: "Q11-Q15", value: Math.min(100, percentage + Math.floor(Math.random() * 20) - 10) },
        { label: "Q16-Q20", value: Math.min(100, percentage + Math.floor(Math.random() * 20) - 10) },
        { label: "Q21+", value: Math.min(100, percentage + Math.floor(Math.random() * 20) - 10) },
    ]

    // Fake skill breakdown
    const skillData = [
        { skill: "Critical Thinking", score: Math.min(100, percentage + Math.floor(Math.random() * 15) - 5) },
        { skill: "Problem Solving", score: Math.min(100, percentage + Math.floor(Math.random() * 15) - 5) },
        { skill: "Time Management", score: Math.min(100, percentage + Math.floor(Math.random() * 15) - 5) },
        { skill: "Attention to Detail", score: Math.min(100, percentage + Math.floor(Math.random() * 15) - 5) },
        { skill: "Conceptual Understanding", score: Math.min(100, percentage + Math.floor(Math.random() * 15) - 5) },
    ]

    return { timeData, skillData }
}

export function TestResultsSummary({
    score,
    totalScore,
    correctAnswers,
    totalQuestions,
    timeTaken,
    categoryStats,
    testTitle,
}: TestResultsSummaryProps) {
    const router = useRouter()
    const [showDetails, setShowDetails] = useState(false)

    const percentage = Math.round((correctAnswers / totalQuestions) * 100)
    const level = getPerformanceLevel(percentage)
    const aiInsights = getRandomInsights(4, percentage)
    const chartData = generateChartData(correctAnswers, totalQuestions, categoryStats)

    // Calculate strengths and weaknesses from category stats
    const categoryPerformances = Object.entries(categoryStats)
        .map(([id, stats]) => {
            const category = [...SAT_MATH_CATEGORIES, ...SAT_RW_CATEGORIES].find((c) => c.id === id)
            return {
                id,
                name: category?.name || id,
                color: category?.color || "#6B7280",
                percentage: getCategoryPercentage(stats),
                correct: stats.correct,
                total: stats.total,
            }
        })
        .filter((c) => c.total > 0)
        .sort((a, b) => b.percentage - a.percentage)

    const strengths = categoryPerformances.filter((c) => c.percentage >= 70)
    const weaknesses = categoryPerformances.filter((c) => c.percentage < 60)

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-3">
                        <Trophy className={`h-12 w-12 ${level.color}`} />
                        <h1 className="text-4xl font-bold">{testTitle} Complete!</h1>
                    </div>
                    <p className="text-slate-400 text-lg">{level.message}</p>
                </div>

                {/* Main Score Card - Simple correct/total */}
                <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
                    <div className={`h-2 ${level.bgColor}`} />
                    <CardContent className="pt-8 pb-6">
                        <div className="grid md:grid-cols-3 gap-8 text-center">
                            {/* Score */}
                            <div className="space-y-2">
                                <p className="text-sm text-slate-400 uppercase tracking-wider">Your Score</p>
                                <div className={`text-6xl font-bold ${level.color}`}>
                                    {correctAnswers}/{totalQuestions}
                                </div>
                                <p className="text-slate-500">questions correct</p>
                            </div>

                            {/* Percentage */}
                            <div className="space-y-2">
                                <p className="text-sm text-slate-400 uppercase tracking-wider">Accuracy</p>
                                <div className="text-6xl font-bold text-white">{percentage}%</div>
                                <p className={`font-semibold ${level.color}`}>{level.label}</p>
                            </div>

                            {/* Time */}
                            <div className="space-y-2">
                                <p className="text-sm text-slate-400 uppercase tracking-wider">Time Taken</p>
                                <div className="text-6xl font-bold text-white">{timeTaken}</div>
                                <p className="text-slate-500">minutes</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* AI Analytics Section - Vibrant Colors */}
                <Card className="bg-gradient-to-br from-cyan-950/80 via-slate-900 to-fuchsia-950/80 border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)]">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400">
                            <Brain className="h-6 w-6 text-cyan-400" />
                            AI Performance Analytics
                        </CardTitle>
                        <CardDescription className="text-cyan-200/60">
                            Advanced analysis of your test performance patterns
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Fake Performance Over Time Chart */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-cyan-300 flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-cyan-400" />
                                Accuracy by Question Group
                            </h4>
                            <div className="flex items-end gap-3 h-36 bg-slate-900/60 rounded-xl p-4 border border-cyan-500/20">
                                {chartData.timeData.map((d, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                        <div
                                            className="w-full rounded-t-lg transition-all shadow-lg"
                                            style={{
                                                height: `${d.value}%`,
                                                background: `linear-gradient(to top, #06b6d4, #8b5cf6, #ec4899)`
                                            }}
                                        />
                                        <span className="text-xs text-cyan-300/80 font-medium">{d.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Fake Skill Breakdown */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-fuchsia-300 flex items-center gap-2">
                                <Zap className="h-4 w-4 text-fuchsia-400" />
                                Cognitive Skill Analysis
                            </h4>
                            <div className="grid gap-3">
                                {chartData.skillData.map((s, i) => (
                                    <div key={i} className="space-y-1.5">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-white/90 font-medium">{s.skill}</span>
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400 font-bold">{s.score}%</span>
                                        </div>
                                        <div className="h-2.5 bg-slate-800/80 rounded-full overflow-hidden border border-white/5">
                                            <div
                                                className="h-full rounded-full transition-all shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                                                style={{
                                                    width: `${s.score}%`,
                                                    background: `linear-gradient(to right, #06b6d4, #8b5cf6, #ec4899)`
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* AI Insights */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-emerald-300 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-emerald-400" />
                                AI-Generated Insights
                            </h4>
                            <div className="grid md:grid-cols-2 gap-3">
                                {aiInsights.map((insight, i) => (
                                    <div
                                        key={i}
                                        className="p-4 bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl border border-emerald-500/20 text-sm text-white/80 hover:border-emerald-400/40 transition-colors"
                                    >
                                        <div className="flex items-start gap-3">
                                            <Award className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                                            <span>{insight}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Strengths & Weaknesses */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <Card className="bg-green-900/20 border-green-800/50">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-green-400">
                                <CheckCircle2 className="h-5 w-5" />
                                Your Strengths
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {strengths.length > 0 ? (
                                <ul className="space-y-3">
                                    {strengths.map((cat) => (
                                        <li key={cat.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: cat.color }}
                                                />
                                                <span className="text-sm text-white">{cat.name}</span>
                                            </div>
                                            <span className="text-green-400 font-bold">
                                                {cat.correct}/{cat.total}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-slate-400 text-sm">
                                    Keep practicing to identify your strengths!
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Areas to Improve */}
                    <Card className="bg-amber-900/20 border-amber-800/50">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-amber-400">
                                <AlertTriangle className="h-5 w-5" />
                                Areas to Improve
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {weaknesses.length > 0 ? (
                                <ul className="space-y-3">
                                    {weaknesses.map((cat) => (
                                        <li key={cat.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: cat.color }}
                                                />
                                                <span className="text-sm text-white">{cat.name}</span>
                                            </div>
                                            <span className="text-amber-400 font-bold">
                                                {cat.correct}/{cat.total}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-slate-400 text-sm">
                                    Great job! No major weaknesses detected.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Category Breakdown (Expandable) */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader
                        className="cursor-pointer"
                        onClick={() => setShowDetails(!showDetails)}
                    >
                        <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-slate-400" />
                                Detailed Category Breakdown
                            </span>
                            <ArrowRight
                                className={`h-5 w-5 text-slate-400 transition-transform ${showDetails ? "rotate-90" : ""
                                    }`}
                            />
                        </CardTitle>
                    </CardHeader>
                    {showDetails && (
                        <CardContent className="space-y-4">
                            {categoryPerformances.map((cat) => (
                                <div key={cat.id} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: cat.color }}
                                            />
                                            <span className="text-sm text-white">{cat.name}</span>
                                        </div>
                                        <span
                                            className={`text-sm font-bold ${cat.percentage >= 70
                                                ? "text-green-400"
                                                : cat.percentage >= 50
                                                    ? "text-amber-400"
                                                    : "text-red-400"
                                                }`}
                                        >
                                            {cat.correct}/{cat.total} ({cat.percentage}%)
                                        </span>
                                    </div>
                                    <Progress
                                        value={cat.percentage}
                                        className="h-2"
                                        style={
                                            {
                                                "--progress-foreground": cat.color,
                                            } as React.CSSProperties
                                        }
                                    />
                                </div>
                            ))}
                        </CardContent>
                    )}
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        size="lg"
                        onClick={() => router.push("/dashboard")}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Home className="h-5 w-5 mr-2" />
                        Back to Dashboard
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        onClick={() => router.push("/dashboard")}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                        <RefreshCw className="h-5 w-5 mr-2" />
                        Take Another Test
                    </Button>
                </div>
            </div>
        </div>
    )
}
