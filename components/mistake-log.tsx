"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
    CheckCircle2,
    XCircle,
    BookOpen,
    Lightbulb,
    ArrowRight,
} from "lucide-react"

interface Question {
    id: string
    question_text: string
    options: string[]
    correct_answer: string
    category?: string
    image_url?: string
    explanation?: string
}

interface MistakeLogProps {
    incorrectQuestions: {
        question: Question
        userAnswer: string
        testTitle?: string
        testDate?: string
    }[]
    showTestInfo?: boolean
}

export function MistakeLog({ incorrectQuestions, showTestInfo = false }: MistakeLogProps) {
    const router = useRouter()

    const getOptionLabel = (index: number) => String.fromCharCode(65 + index)

    const getOptionText = (question: Question, answerLabel: string) => {
        const index = answerLabel.charCodeAt(0) - 65
        return question.options[index] || answerLabel
    }

    if (incorrectQuestions.length === 0) {
        return (
            <Card className="bg-white border-gray-200 shadow-sm">
                <CardContent className="py-12 text-center">
                    <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Mistakes!</h3>
                    <p className="text-gray-500">
                        Great job! You haven&apos;t made any mistakes yet, or all your test results show perfect scores.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header Summary */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-100 rounded-full">
                        <BookOpen className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Mistake Log</h2>
                        <p className="text-sm text-gray-500">
                            {incorrectQuestions.length} question{incorrectQuestions.length !== 1 ? 's' : ''} to review
                        </p>
                    </div>
                </div>
            </div>

            {/* Mistake Cards */}
            <div className="space-y-4">
                {incorrectQuestions.map((item, index) => (
                    <Card key={`${item.question.id}-${index}`} className="bg-white border-gray-200 shadow-sm overflow-hidden">
                        <CardHeader className="pb-3 bg-gradient-to-r from-red-50 to-orange-50 border-b border-gray-100">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-red-100 text-red-700 border-red-200">
                                        Question {index + 1}
                                    </Badge>
                                    {item.question.category && (
                                        <Badge variant="outline" className="border-gray-300 text-gray-600 capitalize">
                                            {item.question.category}
                                        </Badge>
                                    )}
                                </div>
                                {showTestInfo && item.testTitle && (
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
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-2">
                                    <div className="flex items-start gap-3">
                                        <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-blue-900 mb-1">Explanation</p>
                                            <p className="text-blue-800 text-sm leading-relaxed">
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

            {/* Action Button */}
            <div className="flex justify-center pt-4">
                <Button
                    onClick={() => router.push('/dashboard')}
                    className="bg-[#0D2240] hover:bg-[#0D2240]/90 text-white"
                >
                    Back to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    )
}
