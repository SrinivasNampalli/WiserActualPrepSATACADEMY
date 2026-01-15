"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
    Trophy,
    TrendingUp,
    TrendingDown,
    Target,
    ArrowRight,
    Home,
    RefreshCw,
    BookOpen,
    Lightbulb,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    X,
    Heart,
    Star,
} from "lucide-react"
import {
    SAT_MATH_CATEGORIES,
    SAT_RW_CATEGORIES,
    getCategoryPercentage,
    getPerformanceLevel,
    type CategoryStatsMap,
} from "@/lib/sat-categories"
import confetti from "canvas-confetti"

interface TestResultsSummaryProps {
    score: number
    totalScore: number
    correctAnswers: number
    totalQuestions: number
    timeTaken: number
    categoryStats: CategoryStatsMap
    testTitle: string
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
    const [showPicnicVideo, setShowPicnicVideo] = useState(false)
    const [hasUnlockedReward, setHasUnlockedReward] = useState(false)

    const percentage = Math.round((correctAnswers / totalQuestions) * 100)
    const scoreLevel = getScoreLevel(score)

    // Trigger confetti for good scores + special reward for 100%
    useEffect(() => {
        if (percentage >= 70) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
            })
        }

        // Special celebration for 100%!
        if (percentage === 100) {
            setHasUnlockedReward(true)
            // Extra confetti celebration
            setTimeout(() => {
                confetti({
                    particleCount: 200,
                    spread: 100,
                    origin: { y: 0.5 },
                    colors: ['#ff69b4', '#ff1493', '#ff6b6b', '#ffd700'],
                })
            }, 500)
            // Show video after a moment
            setTimeout(() => {
                setShowPicnicVideo(true)
            }, 2000)
        }
    }, [percentage])

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
    const needsWork = categoryPerformances.filter((c) => c.percentage >= 60 && c.percentage < 70)

    // Generate personalized recommendations
    const recommendations = generateRecommendations(weaknesses, needsWork, percentage)

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-3">
                        <Trophy className={`h-12 w-12 ${scoreLevel.color}`} />
                        <h1 className="text-4xl font-bold">{testTitle} Complete!</h1>
                    </div>
                    <p className="text-slate-400 text-lg">{scoreLevel.message}</p>
                </div>

                {/* Main Score Card */}
                <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
                    <div className={`h-2 ${scoreLevel.bgColor}`} />
                    <CardContent className="pt-8 pb-6">
                        <div className="grid md:grid-cols-3 gap-8 text-center">
                            {/* Overall Score */}
                            <div className="space-y-2">
                                <p className="text-sm text-slate-400 uppercase tracking-wider">SAT Score</p>
                                <div className={`text-6xl font-bold ${scoreLevel.color}`}>{score}</div>
                                <p className="text-slate-500">out of {totalScore}</p>
                            </div>

                            {/* Accuracy */}
                            <div className="space-y-2">
                                <p className="text-sm text-slate-400 uppercase tracking-wider">Accuracy</p>
                                <div className="text-6xl font-bold text-white">{percentage}%</div>
                                <p className="text-slate-500">
                                    {correctAnswers} of {totalQuestions} correct
                                </p>
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
                                                {cat.percentage}% ({cat.correct}/{cat.total})
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
                                                {cat.percentage}% ({cat.correct}/{cat.total})
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

                {/* Personalized Recommendations */}
                <Card className="bg-blue-900/20 border-blue-800/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-400">
                            <Lightbulb className="h-5 w-5" />
                            Personalized Study Plan
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Based on your performance, here's what to focus on next
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            {recommendations.map((rec, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <div
                                        className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${rec.priority === "high"
                                            ? "bg-red-500/20 text-red-400"
                                            : rec.priority === "medium"
                                                ? "bg-amber-500/20 text-amber-400"
                                                : "bg-green-500/20 text-green-400"
                                            }`}
                                    >
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{rec.title}</p>
                                        <p className="text-slate-400 text-sm">{rec.description}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

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
                                            {cat.percentage}% ({cat.correct}/{cat.total})
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

                {/* Perfect Score Video - shows naturally on screen */}
                {hasUnlockedReward && (
                    <Card className="bg-gradient-to-br from-pink-900/30 to-purple-900/30 border-pink-500/30 overflow-hidden">
                        <CardHeader className="text-center">
                            <div className="flex items-center justify-center gap-2 text-2xl font-bold text-pink-300">
                                <Star className="h-6 w-6 text-yellow-400 animate-pulse" />
                                Perfect Score Reward!
                                <Star className="h-6 w-6 text-yellow-400 animate-pulse" />
                            </div>
                            <CardDescription className="text-pink-200/80">
                                You got 100%! Here's a special reward for your hard work 🎉💕
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative rounded-xl overflow-hidden bg-black shadow-xl">
                                <video
                                    autoPlay
                                    loop
                                    controls
                                    className="w-full aspect-video"
                                    src="/girlfriend/picnicreward.mp4"
                                >
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                            <p className="text-center text-pink-200/60 text-sm mt-4">
                                Keep up the amazing work! 💪✨
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}

// Helper functions
function getScoreLevel(score: number) {
    if (score >= 1400) {
        return {
            message: "Outstanding! You're performing at an elite level! 🌟",
            color: "text-green-400",
            bgColor: "bg-gradient-to-r from-green-500 to-emerald-500",
        }
    } else if (score >= 1200) {
        return {
            message: "Great work! You're above average and improving! 💪",
            color: "text-blue-400",
            bgColor: "bg-gradient-to-r from-blue-500 to-cyan-500",
        }
    } else if (score >= 1000) {
        return {
            message: "Good effort! With focused practice, you'll improve quickly! 📈",
            color: "text-amber-400",
            bgColor: "bg-gradient-to-r from-amber-500 to-orange-500",
        }
    } else {
        return {
            message: "Keep going! Every practice session builds your skills! 🎯",
            color: "text-purple-400",
            bgColor: "bg-gradient-to-r from-purple-500 to-pink-500",
        }
    }
}

interface Recommendation {
    title: string
    description: string
    priority: "high" | "medium" | "low"
}

function generateRecommendations(
    weaknesses: { id: string; name: string; percentage: number }[],
    needsWork: { id: string; name: string; percentage: number }[],
    overallPercentage: number
): Recommendation[] {
    const recommendations: Recommendation[] = []

    // High priority: Address weaknesses
    weaknesses.slice(0, 2).forEach((cat) => {
        recommendations.push({
            title: `Focus on ${cat.name}`,
            description: getStudyTip(cat.id, cat.percentage),
            priority: "high",
        })
    })

    // Medium priority: Improve areas that need work
    needsWork.slice(0, 2).forEach((cat) => {
        recommendations.push({
            title: `Strengthen ${cat.name}`,
            description: getStudyTip(cat.id, cat.percentage),
            priority: "medium",
        })
    })

    // General recommendations based on overall score
    if (overallPercentage < 50) {
        recommendations.push({
            title: "Build Foundational Skills",
            description:
                "Focus on understanding core concepts before moving to advanced problems. Use Khan Academy or similar resources for fundamentals.",
            priority: "high",
        })
    } else if (overallPercentage < 70) {
        recommendations.push({
            title: "Practice Timed Tests",
            description:
                "Work on time management by taking more timed practice tests. Aim to complete sections with time to spare for review.",
            priority: "medium",
        })
    } else {
        recommendations.push({
            title: "Target Your Weak Spots",
            description:
                "You're doing well overall! Focus specifically on the categories where you scored lowest to maximize your improvement.",
            priority: "low",
        })
    }

    // Always add a general tip
    recommendations.push({
        title: "Review Incorrect Answers",
        description:
            "Go back and understand why you got questions wrong. This is often more valuable than doing more practice problems.",
        priority: "medium",
    })

    return recommendations.slice(0, 5) // Limit to 5 recommendations
}

function getStudyTip(categoryId: string, percentage: number): string {
    const tips: Record<string, string> = {
        algebra:
            "Practice solving linear equations and inequalities. Focus on identifying when to use substitution vs elimination for systems.",
        advanced_math:
            "Work on factoring polynomials and understanding quadratic functions. Master the quadratic formula and vertex form.",
        problem_solving:
            "Practice interpreting data from tables and graphs. Focus on rates, ratios, and percentages in real-world contexts.",
        geometry:
            "Review area and volume formulas. Practice problems involving triangles, circles, and coordinate geometry.",
        craft_structure:
            "Build vocabulary through reading. Practice identifying author's purpose and tone in passages.",
        information_ideas:
            "Focus on finding evidence in text to support conclusions. Practice summarizing main ideas.",
        english_conventions:
            "Study punctuation rules, especially commas and semicolons. Review subject-verb agreement.",
        expression_ideas:
            "Practice with transition words. Focus on recognizing effective sentence structure and word choice.",
    }

    return (
        tips[categoryId] ||
        `Spend 20-30 minutes daily on this category. Use practice problems to identify specific concepts you need to review.`
    )
}
