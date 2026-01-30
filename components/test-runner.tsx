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
import { normalizeCategoryId, type CategoryStatsMap } from "@/lib/sat-categories"
import { QuizAIChatbox } from "@/components/quiz-ai-chatbox"

interface Question {
    id: string
    question_text: string
    options: string[]
    correct_answer: string
    category?: string
    image_url?: string
    explanation?: string
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
    const [zoomedImage, setZoomedImage] = useState<string | null>(null)

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

        console.log("Submitting test for User:", userId, "Test ID:", test.id) // Debug log

        // Calculate score and category stats
        let correctCount = 0
        const categoryStats: CategoryStatsMap = {}

        questions.forEach((q) => {
            const isCorrect = answers[q.id] === q.correct_answer
            if (isCorrect) {
                correctCount++
            }

            // Track by category
            const categoryId = normalizeCategoryId(q.category || "general")
            if (categoryId) {
                if (!categoryStats[categoryId]) {
                    categoryStats[categoryId] = { correct: 0, total: 0 }
                }
                categoryStats[categoryId]!.total++
                if (isCorrect) {
                    categoryStats[categoryId]!.correct++
                }
            }
        })

        // Simple percentage-based scoring
        const rawScore = questions.length > 0 ? correctCount / questions.length : 0
        const score = Math.round(rawScore * 100) // Percentage score

        try {
            const payload = {
                user_id: userId,
                test_id: test.id,
                score: score,
                total_score: 100,
                correct_answers: correctCount,
                total_questions: questions.length,
                time_taken_minutes: Math.round((test.duration_minutes * 60 - timeLeft) / 60),
                completed_at: new Date().toISOString(),
                category_stats: categoryStats,
                user_answers: answers, // Store user's answers for mistake log
            }
            console.log("Submission Payload:", payload)

            const { data: resultData, error } = await supabase.from("test_results").insert(payload).select().single()

            if (error) {
                console.error("Supabase Insert Error:", error)
                throw error
            }

            // Redirect to results page with detailed summary
            router.push(`/results/${resultData.id}`)
        } catch (error: any) {
            console.error("Error submitting test:", error)
            alert(`Failed to submit test: ${error.message || JSON.stringify(error)}`)
        } finally {
            setIsSubmitting(false)
            setShowSubmitConfirm(false)
        }
    }

    const getOptionLabel = (index: number) => String.fromCharCode(65 + index)

    // Check if this is a mock exam (AI help disabled)
    const isMockExam = test.test_type === "mock"

    // Empty state
    if (!currentQuestion || questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white text-[#0D2240]">
                <AlertCircle className="w-16 h-16 text-amber-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">No Questions Available</h2>
                <p className="text-gray-500 mb-6">This test doesn't have any questions yet.</p>
                <Button
                    onClick={() => router.push("/dashboard")}
                    className="bg-[#0D2240] hover:bg-[#0D2240]/90 text-white"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Return to Dashboard
                </Button>
            </div>
        )
    }

    const isTimeWarning = timeLeft < 300 // Less than 5 minutes

    return (
        <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
            {/* Header - Bluebook Style Navy Blue */}
            <header className="bg-[#0D2240] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-lg">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/dashboard")}
                        className="text-white/70 hover:text-white hover:bg-white/10"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="font-semibold text-lg">{test.title}</h1>
                        <p className="text-xs text-white/60">
                            Question {currentQuestionIndex + 1} of {questions.length}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Timer */}
                    <div className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg",
                        isTimeWarning
                            ? "bg-red-500 text-white animate-pulse"
                            : "bg-white/10 text-white"
                    )}>
                        <Clock className="w-5 h-5" />
                        <span>{formatTime(timeLeft)}</span>
                    </div>

                    {/* Navigation Toggle */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowNavPanel(!showNavPanel)}
                        className="border-white/30 text-white hover:bg-white/10 bg-transparent"
                    >
                        {answeredCount}/{questions.length} Answered
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex">
                {/* Question Area */}
                <main className="flex-1 p-6 md:p-8 max-w-4xl mx-auto w-full">
                    {/* Question Card */}
                    <div className="bg-white rounded-2xl p-6 md:p-8 mb-6 shadow-sm border border-gray-200">
                        <div className="flex items-start justify-between mb-4">
                            <span className="text-sm text-[#0D2240] font-semibold bg-[#0D2240]/10 px-3 py-1 rounded-full">
                                Question {currentQuestionIndex + 1}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleMarkForReview}
                                className={cn(
                                    "text-sm",
                                    markedForReview.has(currentQuestion.id)
                                        ? "text-amber-600 bg-amber-50"
                                        : "text-gray-500 hover:text-amber-600 hover:bg-amber-50"
                                )}
                            >
                                <Flag className="w-4 h-4 mr-1" />
                                {markedForReview.has(currentQuestion.id) ? "Marked" : "Mark for Review"}
                            </Button>
                        </div>

                        {/* Question Image (if exists) - Larger container */}
                        {currentQuestion.image_url && (
                            <div
                                className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200 cursor-pointer hover:border-[#0D2240] hover:shadow-md transition-all group"
                                onClick={() => setZoomedImage(currentQuestion.image_url!)}
                            >
                                <div className="relative">
                                    <img
                                        src={currentQuestion.image_url}
                                        alt={`Question ${currentQuestionIndex + 1} illustration`}
                                        className="w-full max-h-[400px] rounded-lg object-contain"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-all rounded-lg">
                                        <span className="text-[#0D2240] text-sm font-medium bg-white px-4 py-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 border border-gray-200">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                                            Click to zoom
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <p className="text-lg leading-relaxed whitespace-pre-wrap text-gray-900">
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
                                            ? "bg-[#0D2240] border-[#0D2240] text-white shadow-lg"
                                            : "bg-white border-gray-200 text-gray-700 hover:border-[#0D2240]/50 hover:shadow-md"
                                    )}
                                >
                                    <span className={cn(
                                        "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2",
                                        isSelected
                                            ? "bg-white border-white text-[#0D2240]"
                                            : "border-gray-300 text-gray-500"
                                    )}>
                                        {label}
                                    </span>
                                    <span className="pt-1.5 font-medium">{option}</span>
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
                            className="border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Previous
                        </Button>

                        <div className="flex gap-2">
                            {currentQuestionIndex === questions.length - 1 ? (
                                <Button
                                    onClick={() => setShowSubmitConfirm(true)}
                                    className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Submit Test
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleNext}
                                    className="bg-[#0D2240] hover:bg-[#0D2240]/90 text-white shadow-lg"
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
                    <aside className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">Questions</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowNavPanel(false)}
                                className="text-gray-500 hover:text-gray-900"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap gap-4 mb-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-[#0D2240]"></div>
                                <span>Answered</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                <span>Marked</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-gray-200"></div>
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
                                            isCurrent && "ring-2 ring-[#0D2240]",
                                            isMarked
                                                ? "bg-amber-500 text-white"
                                                : isAnswered
                                                    ? "bg-[#0D2240] text-white"
                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        )}
                                    >
                                        {idx + 1}
                                    </button>
                                )
                            })}
                        </div>

                        {/* Summary */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <div className="text-sm text-gray-600 space-y-1">
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-100">
                        <h3 className="text-xl font-bold mb-4 text-gray-900">Submit Test?</h3>
                        <div className="text-gray-600 mb-6 space-y-2">
                            <p>You have answered {answeredCount} out of {questions.length} questions.</p>
                            {answeredCount < questions.length && (
                                <p className="text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                                    ⚠️ {questions.length - answeredCount} questions are unanswered.
                                </p>
                            )}
                            {markedForReview.size > 0 && (
                                <p className="text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                                    ⚠️ {markedForReview.size} questions are marked for review.
                                </p>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowSubmitConfirm(false)}
                                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100"
                            >
                                Continue Test
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            >
                                {isSubmitting ? "Submitting..." : "Submit"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Zoom Modal */}
            {zoomedImage && (
                <div
                    className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] cursor-zoom-out p-4"
                    onClick={() => setZoomedImage(null)}
                >
                    <div className="relative max-w-5xl max-h-[90vh] w-full">
                        <img
                            src={zoomedImage}
                            alt="Zoomed question image"
                            className="w-full h-full object-contain bg-white rounded-lg shadow-2xl"
                        />
                        <button
                            onClick={() => setZoomedImage(null)}
                            className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors"
                        >
                            ✕
                        </button>
                        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm bg-black/50 px-4 py-2 rounded-full">
                            Click anywhere to close
                        </p>
                    </div>
                </div>
            )}

            {/* Progress Bar */}
            <div className="h-1.5 bg-gray-200">
                <div
                    className="h-full bg-[#0D2240] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* AI Chatbox - Only show for non-mock exams */}
            <QuizAIChatbox
                questionText={currentQuestion.question_text}
                questionNumber={currentQuestionIndex + 1}
                options={currentQuestion.options}
                isDisabled={isMockExam}
            />
        </div>
    )
}
