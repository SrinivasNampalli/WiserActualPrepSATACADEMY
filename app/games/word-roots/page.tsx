"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getRandomWordRootQuestions, type WordRootQuestion } from "@/lib/word-roots-data"
import { ArrowLeft, Play, BookOpen, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

type GameState = "menu" | "playing" | "feedback" | "results"

const QUESTIONS_PER_GAME = 6

interface AnswerRecord {
  question: WordRootQuestion
  selectedAnswer: string
  isCorrect: boolean
}

export default function WordRootsPage() {
  const [gameState, setGameState] = useState<GameState>("menu")
  const [questions, setQuestions] = useState<WordRootQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [answerHistory, setAnswerHistory] = useState<AnswerRecord[]>([])

  const currentQuestion = questions[currentQuestionIndex]

  const startGame = useCallback(() => {
    const newQuestions = getRandomWordRootQuestions(QUESTIONS_PER_GAME)
    setQuestions(newQuestions)
    setCurrentQuestionIndex(0)
    setScore(0)
    setSelectedAnswer(null)
    setAnswerHistory([])
    setGameState("playing")
  }, [])

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return

    setSelectedAnswer(answer)
    const isCorrect = answer === currentQuestion.correctAnswer

    if (isCorrect) {
      setScore((prev) => prev + 1)
    }

    setAnswerHistory((prev) => [
      ...prev,
      { question: currentQuestion, selectedAnswer: answer, isCorrect },
    ])

    setGameState("feedback")
  }

  const handleContinue = () => {
    if (currentQuestionIndex + 1 >= QUESTIONS_PER_GAME) {
      setGameState("results")
    } else {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setGameState("playing")
    }
  }

  const getGrade = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 90) return { grade: "A", message: "Word Wizard!", color: "text-game-green" }
    if (percentage >= 80) return { grade: "B", message: "Great job!", color: "text-game-blue" }
    if (percentage >= 70) return { grade: "C", message: "Good effort!", color: "text-game-yellow" }
    if (percentage >= 60) return { grade: "D", message: "Keep practicing!", color: "text-game-orange" }
    return { grade: "F", message: "More study needed", color: "text-game-red" }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <header className="flex items-center justify-between mb-6">
          <Link href="/games" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Word Roots</h1>
          <div className="w-16" />
        </header>

        {gameState === "menu" && (
          <div className="text-center py-12">
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Master Word Roots</h2>
              <p className="text-muted-foreground max-w-md mx-auto text-balance">
                Learn SAT vocabulary by understanding the building blocks of words.
                Roots, prefixes, and suffixes unlock thousands of words!
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 max-w-sm mx-auto mb-8">
              <h3 className="font-semibold text-foreground mb-3">How to Play:</h3>
              <ul className="text-left text-muted-foreground space-y-2 text-sm">
                <li>1. Learn a word root and its meaning</li>
                <li>2. See example words using that root</li>
                <li>3. Answer a question about a related word</li>
                <li>4. Read the explanation to learn more</li>
              </ul>
            </div>

            <Button onClick={startGame} size="lg" className="gap-2 px-8">
              <Play className="w-5 h-5" />
              Start Learning
            </Button>
          </div>
        )}

        {gameState === "playing" && currentQuestion && (
          <div className="py-4">
            {/* Progress */}
            <div className="flex items-center justify-between mb-4 text-sm">
              <span className="text-muted-foreground">
                Question {currentQuestionIndex + 1} of {QUESTIONS_PER_GAME}
              </span>
              <span className="font-bold text-foreground">Score: {score}</span>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-muted rounded-full mb-6 overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 rounded-full"
                style={{ width: `${((currentQuestionIndex) / QUESTIONS_PER_GAME) * 100}%` }}
              />
            </div>

            {/* Root card */}
            <div className="bg-card border-2 border-primary/30 rounded-2xl p-6 mb-6">
              <div className="text-center mb-4">
                <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-3">
                  <span className="text-2xl font-bold text-primary">{currentQuestion.rootOrPrefix}</span>
                </div>
                <p className="text-lg text-foreground">
                  means <span className="font-semibold">"{currentQuestion.meaning}"</span>
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                {currentQuestion.exampleWords.map((word) => (
                  <span
                    key={word}
                    className="px-3 py-1 bg-muted rounded-full text-sm text-muted-foreground"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>

            {/* Question */}
            <div className="bg-muted/50 rounded-xl p-4 mb-6">
              <p className="text-foreground font-medium text-center">
                {currentQuestion.question}
              </p>
            </div>

            {/* Options */}
            <div className="grid gap-3">
              {currentQuestion.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  className={cn(
                    "w-full p-4 rounded-xl text-left font-medium transition-all",
                    "bg-card border-2 border-border hover:border-primary hover:bg-primary/5",
                    "active:scale-[0.99]"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState === "feedback" && currentQuestion && (
          <div className="py-4">
            {/* Progress */}
            <div className="flex items-center justify-between mb-4 text-sm">
              <span className="text-muted-foreground">
                Question {currentQuestionIndex + 1} of {QUESTIONS_PER_GAME}
              </span>
              <span className="font-bold text-foreground">Score: {score}</span>
            </div>

            {/* Result banner */}
            <div className={cn(
              "rounded-2xl p-6 mb-6 text-center",
              selectedAnswer === currentQuestion.correctAnswer
                ? "bg-game-green/20"
                : "bg-game-red/20"
            )}>
              <div className={cn(
                "text-3xl font-bold mb-2",
                selectedAnswer === currentQuestion.correctAnswer
                  ? "text-game-green"
                  : "text-game-red"
              )}>
                {selectedAnswer === currentQuestion.correctAnswer ? "Correct!" : "Not Quite"}
              </div>
              {selectedAnswer !== currentQuestion.correctAnswer && (
                <p className="text-foreground">
                  The answer was: <span className="font-bold">{currentQuestion.correctAnswer}</span>
                </p>
              )}
            </div>

            {/* Explanation card */}
            <div className="bg-card border border-border rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Learn It</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>
            </div>

            {/* Root reminder */}
            <div className="bg-muted/50 rounded-xl p-4 mb-6">
              <p className="text-sm text-center text-muted-foreground">
                Remember: <span className="font-bold text-primary">{currentQuestion.rootOrPrefix}</span> = {currentQuestion.meaning}
              </p>
            </div>

            <Button onClick={handleContinue} size="lg" className="w-full gap-2">
              {currentQuestionIndex + 1 >= QUESTIONS_PER_GAME ? "See Results" : "Next Question"}
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}

        {gameState === "results" && (
          <div className="py-8 text-center">
            <div className="mb-8">
              <div className={cn(
                "text-8xl font-bold mb-2",
                getGrade(score, QUESTIONS_PER_GAME).color
              )}>
                {getGrade(score, QUESTIONS_PER_GAME).grade}
              </div>
              <p className="text-2xl font-semibold text-foreground mb-1">
                {getGrade(score, QUESTIONS_PER_GAME).message}
              </p>
              <p className="text-muted-foreground">
                You got {score} out of {QUESTIONS_PER_GAME} correct
              </p>
            </div>

            {/* Summary */}
            <div className="bg-card border border-border rounded-2xl p-6 mb-8 text-left">
              <h3 className="font-semibold text-foreground mb-4">Words You Learned:</h3>
              <div className="space-y-3">
                {answerHistory.map((record, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl",
                      record.isCorrect ? "bg-game-green/10" : "bg-game-red/10"
                    )}
                  >
                    <div>
                      <span className="font-bold text-primary">{record.question.rootOrPrefix}</span>
                      <span className="text-muted-foreground"> = {record.question.meaning}</span>
                    </div>
                    <div className={cn(
                      "text-sm font-medium",
                      record.isCorrect ? "text-game-green" : "text-game-red"
                    )}>
                      {record.isCorrect ? "Got it!" : "Review"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={startGame} size="lg" className="gap-2 px-8">
                <Play className="w-5 h-5" />
                Play Again
              </Button>
              <Link href="/">
                <Button variant="outline" size="lg" className="gap-2 px-8 w-full sm:w-auto bg-transparent">
                  <ArrowLeft className="w-5 h-5" />
                  All Games
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
