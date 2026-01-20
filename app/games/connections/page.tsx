"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { WordTile } from "@/components/connections/word-tile"
import { CategoryReveal } from "@/components/connections/category-reveal"
import { ResultsScreen } from "@/components/connections/results-screen"
import { puzzles, shuffleArray, getAllWords, type Puzzle, type Category } from "@/lib/connections-data"
import { ArrowLeft, Shuffle, RotateCcw } from "lucide-react"

type GameState = "playing" | "won" | "lost"

export default function ConnectionsPage() {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null)
  const [words, setWords] = useState<string[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [solvedCategories, setSolvedCategories] = useState<Category[]>([])
  const [mistakes, setMistakes] = useState(0)
  const [gameState, setGameState] = useState<GameState>("playing")
  const [shakeWords, setShakeWords] = useState<string[]>([])
  const [startTime, setStartTime] = useState<number>(0)
  const [endTime, setEndTime] = useState<number>(0)
  const [feedback, setFeedback] = useState<{ type: "correct" | "wrong"; category?: Category } | null>(null)
  const [isPaused, setIsPaused] = useState(false)

  const maxMistakes = 4

  const initGame = useCallback(() => {
    const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)]
    setPuzzle(randomPuzzle)
    setWords(getAllWords(randomPuzzle))
    setSelected([])
    setSolvedCategories([])
    setMistakes(0)
    setGameState("playing")
    setShakeWords([])
    setStartTime(Date.now())
    setEndTime(0)
  }, [])

  useEffect(() => {
    initGame()
  }, [initGame])

  const toggleWord = (word: string) => {
    if (gameState !== "playing" || isPaused) return
    if (solvedCategories.some((cat) => cat.words.includes(word))) return

    setSelected((prev) => {
      if (prev.includes(word)) {
        return prev.filter((w) => w !== word)
      }
      if (prev.length >= 4) return prev
      return [...prev, word]
    })
  }

  const handleSubmit = () => {
    if (selected.length !== 4 || !puzzle || isPaused) return

    const matchingCategory = puzzle.categories.find(
      (cat) =>
        !solvedCategories.includes(cat) &&
        cat.words.every((word) => selected.includes(word))
    )

    if (matchingCategory) {
      setIsPaused(true)
      setFeedback({ type: "correct", category: matchingCategory })

      setTimeout(() => {
        setSolvedCategories((prev) => [...prev, matchingCategory])
        setSelected([])
        setWords((prev) => prev.filter((w) => !matchingCategory.words.includes(w)))
        setFeedback(null)
        setIsPaused(false)

        if (solvedCategories.length + 1 === 4) {
          setGameState("won")
          setEndTime(Date.now())
        }
      }, 2000)
    } else {
      setIsPaused(true)
      setShakeWords(selected)
      setFeedback({ type: "wrong" })

      setTimeout(() => {
        setShakeWords([])
        setFeedback(null)
        setIsPaused(false)
        setMistakes((prev) => prev + 1)

        if (mistakes + 1 >= maxMistakes) {
          setGameState("lost")
          setEndTime(Date.now())
        }
      }, 2000)
    }
  }

  const handleShuffle = () => {
    setWords(shuffleArray(words))
  }

  const handleDeselect = () => {
    setSelected([])
  }

  if (!puzzle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-foreground text-xl">Loading...</div>
      </div>
    )
  }

  const remainingWords = words.filter(
    (w) => !solvedCategories.some((cat) => cat.words.includes(w))
  )

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <header className="flex items-center justify-between mb-6">
          <Link href="/games" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Word Connections</h1>
          <Button variant="ghost" size="icon" onClick={initGame}>
            <RotateCcw className="w-5 h-5" />
          </Button>
        </header>

        {gameState === "playing" ? (
          <>
            <p className="text-center text-muted-foreground mb-6">
              Find groups of 4 words that share a common theme
            </p>

            {/* Mistakes indicator */}
            <div className="flex justify-center gap-2 mb-6">
              {Array.from({ length: maxMistakes }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-colors ${i < mistakes ? "bg-destructive" : "bg-muted"
                    }`}
                />
              ))}
            </div>

            {/* Solved categories */}
            <div className="space-y-3 mb-4">
              {solvedCategories.map((category) => (
                <CategoryReveal key={category.name} category={category} />
              ))}
            </div>

            {/* Feedback overlay */}
            {feedback && (
              <div className={`mb-4 p-4 rounded-xl text-center animate-in fade-in slide-in-from-top-2 duration-300 ${feedback.type === "correct"
                  ? "bg-game-green/20"
                  : "bg-game-red/20"
                }`}>
                {feedback.type === "correct" && feedback.category ? (
                  <div>
                    <p className="font-bold text-game-green mb-1">Correct!</p>
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">{feedback.category.name}:</span>{" "}
                      {feedback.category.words.join(", ")}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-bold text-game-red mb-1">Not quite!</p>
                    <p className="text-sm text-muted-foreground">These 4 words don{"'"}t share a category. Try again!</p>
                  </div>
                )}
              </div>
            )}

            {/* Word grid */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {remainingWords.map((word) => (
                <WordTile
                  key={word}
                  word={word}
                  isSelected={selected.includes(word)}
                  isShaking={shakeWords.includes(word)}
                  onClick={() => toggleWord(word)}
                />
              ))}
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={handleShuffle} className="gap-2 bg-transparent">
                <Shuffle className="w-4 h-4" />
                Shuffle
              </Button>
              <Button variant="outline" onClick={handleDeselect} disabled={selected.length === 0}>
                Deselect All
              </Button>
              <Button onClick={handleSubmit} disabled={selected.length !== 4} className="px-6">
                Submit
              </Button>
            </div>
          </>
        ) : (
          <ResultsScreen
            gameState={gameState}
            puzzle={puzzle}
            solvedCategories={solvedCategories}
            mistakes={mistakes}
            timeTaken={Math.round((endTime - startTime) / 1000)}
            onPlayAgain={initGame}
          />
        )}
      </div>
    </main>
  )
}
