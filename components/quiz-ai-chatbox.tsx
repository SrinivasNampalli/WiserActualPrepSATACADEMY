"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Sparkles, X, Send, Loader2, MessageCircle, HelpCircle } from "lucide-react"
import { useSubscription } from "@/lib/subscription-context"

interface QuizAIChatboxProps {
    questionText: string
    questionNumber: number
    options?: string[]
    isDisabled?: boolean // For mock exams
}

interface Message {
    role: "user" | "assistant"
    content: string
}

export function QuizAIChatbox({
    questionText,
    questionNumber,
    options = [],
    isDisabled = false
}: QuizAIChatboxProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { checkFeatureAccess, incrementUsage } = useSubscription()

    // Don't render anything if disabled (mock exams)
    if (isDisabled) return null

    const formatQuestionForAI = () => {
        let formattedQuestion = `Question ${questionNumber}:\n${questionText}`

        if (options.length > 0) {
            formattedQuestion += "\n\nAnswer Choices:"
            options.forEach((opt, idx) => {
                const label = String.fromCharCode(65 + idx)
                formattedQuestion += `\n${label}. ${opt}`
            })
        }

        return formattedQuestion
    }

    const handleGetHelp = async () => {
        // Check feature access
        if (!checkFeatureAccess('ai_solver')) {
            setError("You've reached your daily limit. Upgrade to Premium for unlimited access!")
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const canProceed = await incrementUsage('ai_solver')
            if (!canProceed) {
                setError("You've reached your daily limit. Upgrade to Premium for unlimited access!")
                setIsLoading(false)
                return
            }

            const fullQuestion = formatQuestionForAI()

            // Add user message
            setMessages(prev => [...prev, {
                role: "user",
                content: `Help me understand Question ${questionNumber}`
            }])

            const response = await fetch("/api/gemini/solve-question", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: fullQuestion }),
            })

            if (!response.ok) {
                throw new Error("Failed to get help")
            }

            const data = await response.json()

            // Add AI response
            setMessages(prev => [...prev, {
                role: "assistant",
                content: data.answer
            }])

        } catch (err) {
            console.error("Error getting AI help:", err)
            setError("Failed to get help. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        setIsOpen(false)
    }

    const handleOpen = () => {
        setIsOpen(true)
        // Clear previous messages when opening for a new question
        if (messages.length > 0) {
            setMessages([])
        }
    }

    return (
        <>
            {/* Combined Mascot + AI Button */}
            {!isOpen && (
                <button
                    onClick={handleOpen}
                    className="fixed bottom-6 right-6 z-50 flex flex-col items-center transition-all duration-300 hover:scale-105 group"
                >
                    {/* Mascot Image */}
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-pink-400 shadow-xl ring-4 ring-pink-400/30 group-hover:ring-pink-400/50 transition-all">
                        <img
                            src="/girlfriend/animegirlsmirk.jpg"
                            alt="AI Helper"
                            className="w-full h-full object-cover object-top"
                        />
                    </div>
                    {/* AI Help Label */}
                    <div className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#0D2240] to-[#1a3a5c] text-white rounded-full shadow-lg text-sm font-medium">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>AI Help</span>
                    </div>
                </button>
            )}

            {/* Chatbox Panel - Made wider and more prominent */}
            <div
                className={cn(
                    "fixed right-0 top-0 h-full w-[420px] max-w-[95vw] bg-white shadow-2xl z-[55] transition-transform duration-300 flex flex-col border-l-4 border-pink-400",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header with larger close button */}
                <div className="bg-gradient-to-r from-[#0D2240] to-[#1a3a5c] px-4 py-4 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-2 text-white">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                        <h3 className="font-semibold">AI Study Helper</h3>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClose}
                        className="text-white hover:text-white hover:bg-red-500 w-10 h-10 rounded-full"
                    >
                        <X className="w-6 h-6" />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">

                    {/* Messages */}
                    {messages.length === 0 ? (
                        <div className="space-y-4">
                            {/* Full Question Display */}
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                <p className="text-sm text-gray-800 whitespace-pre-wrap max-h-48 overflow-y-auto">
                                    {questionText}
                                </p>
                                {options.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
                                        {options.map((opt, idx) => (
                                            <p key={idx} className="text-sm text-gray-600">
                                                <span className="font-semibold">{String.fromCharCode(65 + idx)}.</span> {opt}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Confirmation Prompt */}
                            <div className="text-center py-4">
                                <p className="text-gray-600 text-sm mb-4">
                                    🤔 Need help with this question?
                                </p>
                                <div className="flex gap-3 justify-center">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleClose}
                                        className="border-gray-300 text-gray-600"
                                    >
                                        No, I'm Good
                                    </Button>
                                    <Button
                                        onClick={handleGetHelp}
                                        disabled={isLoading}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Getting help...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4 mr-2" />
                                                Yes, Get Help!
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "p-4 rounded-xl",
                                        msg.role === "user"
                                            ? "bg-[#0D2240] text-white ml-8"
                                            : "bg-gray-100 text-gray-800 mr-4"
                                    )}
                                >
                                    {msg.role === "assistant" && (
                                        <div className="flex items-center gap-2 mb-2 text-amber-600">
                                            <Sparkles className="w-4 h-4" />
                                            <span className="text-xs font-semibold">AI Tutor</span>
                                        </div>
                                    )}
                                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                                        {msg.content.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
                                            part.startsWith('**') && part.endsWith('**')
                                                ? <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
                                                : <span key={i}>{part}</span>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Ask for more help button */}
                            {!isLoading && (
                                <div className="text-center pt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleGetHelp}
                                        className="border-[#0D2240] text-[#0D2240] hover:bg-[#0D2240]/5"
                                    >
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Get More Help
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Loading state */}
                    {isLoading && messages.length > 0 && (
                        <div className="flex items-center gap-2 text-gray-500 p-4">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">AI is thinking...</span>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <p className="text-xs text-gray-500 text-center">
                        💡 AI helps you learn — use it to understand concepts, not just get answers!
                    </p>
                </div>
            </div>

            {/* Overlay when open */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-[54]"
                    onClick={handleClose}
                />
            )}
        </>
    )
}
