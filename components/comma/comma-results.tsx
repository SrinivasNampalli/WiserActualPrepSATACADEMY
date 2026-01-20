"use client"

import { Button } from "@/components/ui/button"
import { Trophy, RotateCcw } from "lucide-react"

interface CommaResultsScreenProps {
    score: number
    total: number
    onPlayAgain: () => void
}

export function CommaResultsScreen({ score, total, onPlayAgain }: CommaResultsScreenProps) {
    const percentage = Math.round((score / total) * 100)

    const getMessage = () => {
        if (percentage === 100) return "Perfect! 🎉"
        if (percentage >= 80) return "Excellent! 🌟"
        if (percentage >= 60) return "Good job! 👍"
        if (percentage >= 40) return "Keep practicing! 💪"
        return "Don't give up! 📚"
    }

    const getEmoji = () => {
        if (percentage === 100) return "🏆"
        if (percentage >= 80) return "🥇"
        if (percentage >= 60) return "🥈"
        if (percentage >= 40) return "🥉"
        return "💪"
    }

    return (
        <div className="text-center py-12">
            <div className="text-8xl mb-6">{getEmoji()}</div>

            <h2 className="text-3xl font-bold text-foreground mb-2">{getMessage()}</h2>

            <div className="mb-8">
                <p className="text-6xl font-bold text-primary mb-2">
                    {score}/{total}
                </p>
                <p className="text-muted-foreground">
                    {percentage}% accuracy
                </p>
            </div>

            <div className="flex flex-col gap-3 max-w-xs mx-auto">
                <Button onClick={onPlayAgain} size="lg" className="gap-2">
                    <RotateCcw className="w-5 h-5" />
                    Play Again
                </Button>
            </div>
        </div>
    )
}
