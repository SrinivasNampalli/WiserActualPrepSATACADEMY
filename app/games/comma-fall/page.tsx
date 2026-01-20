"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FallingMark } from "@/components/comma/falling-mark"
import { CommaResultsScreen } from "@/components/comma/comma-results"
import { getRandomPunctuationQuestions, type PunctuationQuestion } from "@/lib/comma-data"
import { ArrowLeft, Play } from "lucide-react"

type GameState = "menu" | "reading" | "playing" | "results"

const QUESTIONS_PER_GAME = 8
const GAME_DURATION = 60
const READING_TIME = 3
const FALL_DURATION = 2.5

interface FallingMarkData {
  id: string
  mark: string
  lane: number
  startTime: number
}

export default function CommaFallPage() {
  const [gameState, setGameState] = useState<GameState>("menu")
  const [questions, setQuestions] = useState<PunctuationQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [gameTimeLeft, setGameTimeLeft] = useState(GAME_DURATION)
  const [readingCountdown, setReadingCountdown] = useState(READING_TIME)
  const [fallingMarks, setFallingMarks] = useState<FallingMarkData[]>([])
  const [feedback, setFeedback] = useState<{ type: "correct" | "wrong"; text: string } | null>(null)
  const [answered, setAnswered] = useState(false)
  const gameAreaRef = useRef<HTMLDivElement>(null)

  const currentQuestion = questions[currentQuestionIndex]

  const startGame = useCallback(() => {
    const newQuestions = getRandomPunctuationQuestions(QUESTIONS_PER_GAME)
    setQuestions(newQuestions)
    setCurrentQuestionIndex(0)
    setScore(0)
    setGameTimeLeft(GAME_DURATION)
    setReadingCountdown(READING_TIME)
    setFallingMarks([])
    setFeedback(null)
    setAnswered(false)
    setGameState("reading")
  }, [])

  // Reading countdown
  useEffect(() => {
    if (gameState !== "reading") return

    if (readingCountdown <= 0) {
      startFalling()
      setGameState("playing")
      return
    }

    const timer = setTimeout(() => {
      setReadingCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [gameState, readingCountdown])

  // Game timer
  useEffect(() => {
    if (gameState !== "playing") return

    if (gameTimeLeft <= 0 || currentQuestionIndex >= QUESTIONS_PER_GAME) {
      setGameState("results")
      return
    }

    const timer = setInterval(() => {
      setGameTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState, gameTimeLeft, currentQuestionIndex])

  const startFalling = useCallback(() => {
    if (!currentQuestion) return

    const marks = currentQuestion.options.map((mark, index) => ({
      id: `${currentQuestionIndex}-${mark}-${index}`,
      mark,
      lane: index,
      startTime: Date.now(),
    }))

    setFallingMarks(marks)
    setAnswered(false)
  }, [currentQuestion, currentQuestionIndex])

  // Handle mark timeout (fell off screen)
  useEffect(() => {
    if (gameState !== "playing" || answered) return

    const timeout = setTimeout(() => {
      if (!answered) {
        handleAnswer(null)
      }
    }, FALL_DURATION * 1000)

    return () => clearTimeout(timeout)
  }, [currentQuestionIndex, gameState, answered])

  const handleAnswer = (mark: string | null) => {
    if (answered || !currentQuestion) return

    setAnswered(true)
    const isCorrect = mark === currentQuestion.correctAnswer

    if (isCorrect) {
      setScore((prev) => prev + 1)
      setFeedback({ type: "correct", text: "Correct!" })
    } else {
      setFeedback({
        type: "wrong",
        text: mark ? `Wrong! The answer was "${currentQuestion.correctAnswer}"` : `Time's up! The answer was "${currentQuestion.correctAnswer}"`,
      })
    }

    // Move to next question after delay - longer pause to read explanation
    setTimeout(() => {
      setFeedback(null)
      if (currentQuestionIndex + 1 >= QUESTIONS_PER_GAME) {
        setGameState("results")
      } else {
        setCurrentQuestionIndex((prev) => prev + 1)
        setReadingCountdown(READING_TIME)
        setGameState("reading")
      }
    }, 3000)
  }

  const handleMarkClick = (mark: string) => {
    handleAnswer(mark)
  }

  return (
    <main className="min-h-screen bg-background overflow-hidden">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <header className="flex items-center justify-between mb-4">
          <Link href="/games" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Comma Fall</h1>
          <div className="w-16" />
        </header>

        {gameState === "menu" && (
          <div className="text-center py-12">
            <div className="mb-8">
              <div className="text-6xl mb-4">{"✨"}</div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Catch the Punctuation!</h2>
              <p className="text-muted-foreground max-w-md mx-auto text-balance">
                Read the sentence and tap the correct falling punctuation mark to complete it!
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 max-w-sm mx-auto mb-8">
              <h3 className="font-semibold text-foreground mb-3">How to Play:</h3>
              <ul className="text-left text-muted-foreground space-y-2 text-sm">
                <li>1. Read the sentence with the missing mark</li>
                <li>2. Watch for falling punctuation marks</li>
                <li>3. Tap the correct mark before it falls away!</li>
                <li>4. Complete 8 questions</li>
              </ul>
            </div>

            <Button onClick={startGame} size="lg" className="gap-2 px-8">
              <Play className="w-5 h-5" />
              Start Game
            </Button>
          </div>
        )}

        {gameState === "reading" && currentQuestion && (
          <div className="text-center py-12">
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">Get ready...</p>
              <div className="text-6xl font-bold text-primary animate-pulse">
                {readingCountdown}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 mb-4">
              <p className="text-lg text-foreground leading-relaxed">
                {currentQuestion.sentence.split("__").map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span className="inline-block w-8 h-8 mx-1 bg-primary/20 rounded-lg align-middle" />
                    )}
                  </span>
                ))}
              </p>
            </div>

            <p className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {QUESTIONS_PER_GAME}
            </p>
          </div>
        )}

        {gameState === "playing" && currentQuestion && (
          <div>
            {/* Stats bar */}
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Score:</span>
                <span className="font-bold text-foreground">{score}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Time:</span>
                <span className={`font-bold ${gameTimeLeft <= 10 ? "text-game-red" : "text-foreground"}`}>
                  {gameTimeLeft}s
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {currentQuestionIndex + 1}/{QUESTIONS_PER_GAME}
              </div>
            </div>

            {/* Sentence */}
            <div className="bg-card border border-border rounded-2xl p-4 mb-4">
              <p className="text-center text-foreground leading-relaxed">
                {currentQuestion.sentence.split("__").map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span className="inline-block px-3 py-1 mx-1 bg-primary/10 rounded-lg font-bold text-primary">
                        ?
                      </span>
                    )}
                  </span>
                ))}
              </p>
            </div>

            {/* Game area */}
            <div
              ref={gameAreaRef}
              className="relative h-80 bg-muted/30 rounded-2xl overflow-hidden border border-border"
            >
              {/* Lane dividers */}
              <div className="absolute inset-0 flex">
                {currentQuestion.options.map((_, lane) => (
                  <div
                    key={lane}
                    className="flex-1 border-r border-border/30 last:border-r-0"
                  />
                ))}
              </div>

              {/* Falling marks */}
              {!answered && fallingMarks.map((data) => (
                <FallingMark
                  key={data.id}
                  mark={data.mark}
                  lane={data.lane}
                  totalLanes={currentQuestion.options.length}
                  duration={FALL_DURATION}
                  onClick={() => handleMarkClick(data.mark)}
                />
              ))}

              {/* Feedback overlay */}
              {feedback && (
                <div
                  className={`absolute inset-0 flex items-center justify-center ${feedback.type === "correct" ? "bg-game-green/20" : "bg-game-red/20"
                    } animate-in fade-in duration-200`}
                >
                  <div
                    className={`px-6 py-4 rounded-xl text-center max-w-sm ${feedback.type === "correct"
                        ? "bg-game-green text-card"
                        : "bg-game-red text-card"
                      }`}
                  >
                    <p className="font-bold text-lg mb-2">{feedback.text}</p>
                    <p className="text-sm opacity-90">{currentQuestion.explanation}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {gameState === "results" && (
          <CommaResultsScreen
            score={score}
            total={QUESTIONS_PER_GAME}
            onPlayAgain={startGame}
          />
        )}
      </div>
    </main>
  )
}
