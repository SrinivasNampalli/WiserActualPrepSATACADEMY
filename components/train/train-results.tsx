"use client"

import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"

interface TrainResultsScreenProps {
    score: number
    total: number
    onPlayAgain: () => void
}

export function TrainResultsScreen({ score, total, onPlayAgain }: TrainResultsScreenProps) {
    const percentage = Math.round((score / total) * 100)

    const getMessage = () => {
        if (percentage === 100) return "Perfect Journey! 🎉"
        if (percentage >= 80) return "Express Train! 🚄"
        if (percentage >= 60) return "On Track! 🚂"
        if (percentage >= 40) return "Keep Chugging! 💪"
        return "Need More Practice 📚"
    }

    return (
        <div className="text-center py-12">
            <div className="text-8xl mb-6">🚂</div>

            <h2 className="text-3xl font-bold text-foreground mb-2">{getMessage()}</h2>

            <div className="mb-8">
                <p className="text-6xl font-bold text-primary mb-2">
                    {score}/{total}
                </p>
                <p className="text-muted-foreground">
                    {percentage}% accuracy
                </p>
            </div>

            <Button onClick={onPlayAgain} size="lg" className="gap-2">
                <RotateCcw className="w-5 h-5" />
                Play Again
            </Button>
        </div>
    )
}
