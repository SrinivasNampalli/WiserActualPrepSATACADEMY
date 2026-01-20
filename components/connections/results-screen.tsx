"use client"

import { Button } from "@/components/ui/button"
import { Trophy, RotateCcw, X } from "lucide-react"
import type { Puzzle, Category } from "@/lib/connections-data"
import { CategoryReveal } from "./category-reveal"

interface ResultsScreenProps {
    gameState: "won" | "lost"
    puzzle: Puzzle
    solvedCategories: Category[]
    mistakes: number
    timeTaken: number
    onPlayAgain: () => void
}

export function ResultsScreen({
    gameState,
    puzzle,
    solvedCategories,
    mistakes,
    timeTaken,
    onPlayAgain
}: ResultsScreenProps) {
    const unsolved = puzzle.categories.filter(
        cat => !solvedCategories.some(sc => sc.name === cat.name)
    )

    return (
        <div className="text-center py-8">
            <div className="text-6xl mb-4">
                {gameState === "won" ? "🎉" : "😔"}
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-2">
                {gameState === "won" ? "Congratulations!" : "Better luck next time!"}
            </h2>

            <p className="text-muted-foreground mb-6">
                {gameState === "won"
                    ? `Solved in ${Math.floor(timeTaken / 60)}:${(timeTaken % 60).toString().padStart(2, "0")} with ${mistakes} mistake${mistakes !== 1 ? "s" : ""}`
                    : `You found ${solvedCategories.length}/4 categories`
                }
            </p>

            {/* Show all categories */}
            <div className="space-y-3 mb-6">
                {puzzle.categories.map(category => (
                    <CategoryReveal key={category.name} category={category} />
                ))}
            </div>

            <Button onClick={onPlayAgain} size="lg" className="gap-2">
                <RotateCcw className="w-5 h-5" />
                Play Again
            </Button>
        </div>
    )
}
