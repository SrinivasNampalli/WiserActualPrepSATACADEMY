"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    ChevronLeft,
    ChevronRight,
    Flag,
    Clock,
    CheckCircle,
    AlertCircle,
    X,
    ArrowLeft
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Mascot } from "@/components/mascot"
import { useMascot } from "@/lib/mascot-context"

interface Question {
    id: string
    question_text: string
    options: string[]
    correct_answer: string
    category?: string
}

interface Test {
    id: string
    title: string
    duration_minutes: number
    test_type?: string
}

interface TestRunnerProps {
    test: Test
    questions: Question[]
    userId: string
}

export function TestRunner({ test, questions, userId }: TestRunnerProps) {
    const router = useRouter()
    const { triggerFlag } = useMascot()
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set())
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [timeLeft, setTimeLeft] = useState(test.duration_minutes * 60)
    const [showNavPanel, setShowNavPanel] = useState(false)
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
    const [correctStreak, setCorrectStreak] = useState(0)

    // Timer effect
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer)
                    handleSubmit()
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    const currentQuestion = questions[currentQuestionIndex]
    const answeredCount = Object.keys(answers).length
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${String(secs).padStart(2, '0')}`
    }

    const handleOptionSelect = (optionLabel: string) => {
        if (!currentQuestion) return

        // Check if answer is correct and trigger appropriate mascot message
        const isCorrect = optionLabel === currentQuestion.correct_answer
        if (isCorrect) {
            const newStreak = correctStreak + 1
            setCorrectStreak(newStreak)

            // Show different messages based on streak
            if (newStreak >= 5) {
                triggerFlag("streak_5")
            } else if (newStreak >= 3) {
                triggerFlag("streak_3")
            } else {
                triggerFlag("correct_answer")
            }
        } else {
            setCorrectStreak(0) // Reset streak on wrong answer
            triggerFlag("wrong_answer")
        }

        setAnswers({
            ...answers,
            [currentQuestion.id]: optionLabel,
        })
    }

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1)
        }
    }

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1)
        }
    }

    const handleGoToQuestion = (index: number) => {
        setCurrentQuestionIndex(index)
        setShowNavPanel(false)
    }

    const toggleMarkForReview = () => {
        if (!currentQuestion) return
        const newMarked = new Set(markedForReview)
        if (newMarked.has(currentQuestion.id)) {
            newMarked.delete(currentQuestion.id)
        } else {
            newMarked.add(currentQuestion.id)
        }
        setMarkedForReview(newMarked)
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        const supabase = createClient()

        // Calculate score
        let correctCount = 0
        questions.forEach((q) => {
            if (answers[q.id] === q.correct_answer) {
                correctCount++
            }
        })

        // SAT scoring (simplified - 200-800 per section, total 400-1600)
        const rawScore = questions.length > 0 ? correctCount / questions.length : 0
        const score = Math.round(400 + (rawScore * 1200)) // Scale 400-1600

        try {
            const { error } = await supabase.from("test_results").insert({
                user_id: userId,
                test_id: test.id,
                score: score,
                total_score: 1600,
                correct_answers: correctCount,
                total_questions: questions.length,
                time_taken_minutes: Math.round((test.duration_minutes * 60 - timeLeft) / 60),
                completed_at: new Date().toISOString(),
            })

            if (error) throw error
            router.push("/dashboard")
        } catch (error) {
            console.error("Error submitting test:", error)
            alert("Failed to submit test. Please try again.")
        } finally {
            setIsSubmitting(false)
            setShowSubmitConfirm(false)
        }
    }

    const getOptionLabel = (index: number) => String.fromCharCode(65 + index)

    // Empty state
    if (!currentQuestion || questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
                <AlertCircle className="w-16 h-16 text-amber-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">No Questions Available</h2>
                <p className="text-slate-400 mb-6">This test doesn't have any questions yet.</p>
                <Button
                    onClick={() => router.push("/dashboard")}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Return to Dashboard
                </Button>
            </div>
        )
    }

    const isTimeWarning = timeLeft < 300 // Less than 5 minutes

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col">
            {/* Header - Bluebook Style */}
            <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/dashboard")}
                        className="text-slate-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="font-semibold text-lg">{test.title}</h1>
                        <p className="text-xs text-slate-400">
                            Question {currentQuestionIndex + 1} of {questions.length}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Timer */}
                    <div className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg",
                        isTimeWarning
                            ? "bg-red-500/20 text-red-400 animate-pulse"
                            : "bg-slate-700 text-white"
                    )}>
                        <Clock className="w-5 h-5" />
                        <span>{formatTime(timeLeft)}</span>
                    </div>

                    {/* Navigation Toggle */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowNavPanel(!showNavPanel)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                        {answeredCount}/{questions.length} Answered
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex">
                {/* Question Area */}
                <main className="flex-1 p-8 max-w-4xl mx-auto">
                    {/* Question Text */}
                    <div className="bg-slate-800 rounded-xl p-6 mb-6 border border-slate-700">
                        <div className="flex items-start justify-between mb-4">
                            <span className="text-sm text-slate-400 font-medium">
                                Question {currentQuestionIndex + 1}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleMarkForReview}
                                className={cn(
                                    "text-sm",
                                    markedForReview.has(currentQuestion.id)
                                        ? "text-amber-500"
                                        : "text-slate-400 hover:text-amber-500"
                                )}
                            >
                                <Flag className="w-4 h-4 mr-1" />
                                {markedForReview.has(currentQuestion.id) ? "Marked" : "Mark for Review"}
                            </Button>
                        </div>
                        <p className="text-lg leading-relaxed whitespace-pre-wrap">
                            {currentQuestion.question_text}
                        </p>
                    </div>

                    {/* Answer Options - Bluebook Style */}
                    <div className="space-y-3 mb-8">
                        {currentQuestion.options.map((option, index) => {
                            const label = getOptionLabel(index)
                            const isSelected = answers[currentQuestion.id] === label

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleOptionSelect(label)}
                                    className={cn(
                                        "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-start gap-4",
                                        isSelected
                                            ? "bg-blue-600/20 border-blue-500 text-white"
                                            : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-750"
                                    )}
                                >
                                    <span className={cn(
                                        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2",
                                        isSelected
                                            ? "bg-blue-500 border-blue-500 text-white"
                                            : "border-slate-600 text-slate-400"
                                    )}>
                                        {label}
                                    </span>
                                    <span className="pt-1">{option}</span>
                                </button>
                            )
                        })}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between">
                        <Button
                            variant="outline"
                            onClick={handlePrev}
                            disabled={currentQuestionIndex === 0}
                            className="border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-50"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Previous
                        </Button>

                        <div className="flex gap-2">
                            {currentQuestionIndex === questions.length - 1 ? (
                                <Button
                                    onClick={() => setShowSubmitConfirm(true)}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Submit Test
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleNext}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            )}
                        </div>
                    </div>
                </main>

                {/* Question Navigation Panel (Slide-in) */}
                {showNavPanel && (
                    <aside className="w-80 bg-slate-800 border-l border-slate-700 p-4 overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">Questions</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowNavPanel(false)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap gap-4 mb-4 text-xs text-slate-400">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span>Answered</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                <span>Marked</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                                <span>Unanswered</span>
                            </div>
                        </div>

                        {/* Question Grid */}
                        <div className="grid grid-cols-5 gap-2">
                            {questions.map((q, idx) => {
                                const isAnswered = !!answers[q.id]
                                const isMarked = markedForReview.has(q.id)
                                const isCurrent = idx === currentQuestionIndex

                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => handleGoToQuestion(idx)}
                                        className={cn(
                                            "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all",
                                            isCurrent && "ring-2 ring-white",
                                            isMarked
                                                ? "bg-amber-500 text-slate-900"
                                                : isAnswered
                                                    ? "bg-blue-500 text-white"
                                                    : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                                        )}
                                    >
                                        {idx + 1}
                                    </button>
                                )
                            })}
                        </div>

                        {/* Summary */}
                        <div className="mt-6 pt-4 border-t border-slate-700">
                            <div className="text-sm text-slate-400 space-y-1">
                                <p>Answered: {answeredCount} / {questions.length}</p>
                                <p>Marked for Review: {markedForReview.size}</p>
                                <p>Unanswered: {questions.length - answeredCount}</p>
                            </div>
                        </div>
                    </aside>
                )}
            </div>

            {/* Submit Confirmation Modal */}
            {showSubmitConfirm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 border border-slate-700">
                        <h3 className="text-xl font-bold mb-4">Submit Test?</h3>
                        <div className="text-slate-400 mb-6 space-y-2">
                            <p>You have answered {answeredCount} out of {questions.length} questions.</p>
                            {answeredCount < questions.length && (
                                <p className="text-amber-500">
                                    ⚠️ {questions.length - answeredCount} questions are unanswered.
                                </p>
                            )}
                            {markedForReview.size > 0 && (
                                <p className="text-amber-500">
                                    ⚠️ {markedForReview.size} questions are marked for review.
                                </p>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowSubmitConfirm(false)}
                                className="flex-1 border-slate-600"
                            >
                                Continue Test
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                                {isSubmitting ? "Submitting..." : "Submit"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Progress Bar */}
            <div className="h-1 bg-slate-700">
                <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Mascot - follows mouse automatically */}
            <Mascot />
        </div>
    )
}
