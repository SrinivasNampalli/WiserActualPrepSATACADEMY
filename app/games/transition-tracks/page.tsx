"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Train } from "@/components/train/train"
import { TrainResultsScreen } from "@/components/train/train-results"
import { getRandomQuestions, type TransitionQuestion } from "@/lib/transition-data"
import { ArrowLeft, Play } from "lucide-react"

type GameState = "menu" | "playing" | "results"

const QUESTIONS_PER_GAME = 5
const TIME_PER_QUESTION = 10

export default function TransitionTracksPage() {
  const [gameState, setGameState] = useState<GameState>("menu")
  const [questions, setQuestions] = useState<TransitionQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION)
  const [answered, setAnswered] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [trainPosition, setTrainPosition] = useState(0)

  const currentQuestion = questions[currentQuestionIndex]

  const startGame = useCallback(() => {
    setQuestions(getRandomQuestions(QUESTIONS_PER_GAME))
    setCurrentQuestionIndex(0)
    setScore(0)
    setTimeLeft(TIME_PER_QUESTION)
    setAnswered(false)
    setSelectedAnswer(null)
    setTrainPosition(-100) // Start off-screen
    setGameState("playing")

    // Animate train onto screen
    setTimeout(() => {
      setTrainPosition(0)
    }, 100)
  }, [])

  useEffect(() => {
    if (gameState !== "playing" || answered) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout()
          return TIME_PER_QUESTION
        }
        return prev - 1
      })

      setTrainPosition((prev) => {
        const newPos = prev + (100 / TIME_PER_QUESTION)
        return Math.min(newPos, 100)
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState, answered])

  const handleTimeout = () => {
    setAnswered(true)
    setTimeout(moveToNextQuestion, 3000) // Longer pause to read explanation
  }

  const handleAnswer = (answer: string) => {
    if (answered) return

    setAnswered(true)
    setSelectedAnswer(answer)

    if (answer === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 1)
    }

    setTimeout(moveToNextQuestion, 3000) // Longer pause to read explanation
  }

  const moveToNextQuestion = () => {
    if (currentQuestionIndex + 1 >= QUESTIONS_PER_GAME) {
      setGameState("results")
    } else {
      setCurrentQuestionIndex((prev) => prev + 1)
      setTimeLeft(TIME_PER_QUESTION)
      setAnswered(false)
      setSelectedAnswer(null)
      setTrainPosition(-100) // Start off-screen

      // Animate train onto screen
      setTimeout(() => {
        setTrainPosition(0)
      }, 100)
    }
  }

  const timerColor =
    timeLeft > 6 ? "bg-game-green" : timeLeft > 3 ? "bg-game-yellow" : "bg-game-red"

  return (
    <main className="min-h-screen bg-background overflow-hidden">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <header className="flex items-center justify-between mb-6">
          <Link href="/games" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Transition Tracks</h1>
          <div className="w-16" />
        </header>

        {gameState === "menu" && (
          <div className="text-center py-12">
            <div className="mb-8">
              <div className="text-6xl mb-4">{"🚂"}</div>
              <h2 className="text-3xl font-bold text-foreground mb-4">All Aboard!</h2>
              <p className="text-muted-foreground max-w-md mx-auto text-balance">
                Choose the correct transition word before the train leaves the station!
                You have 10 seconds per question.
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 max-w-sm mx-auto mb-8">
              <h3 className="font-semibold text-foreground mb-3">How to Play:</h3>
              <ul className="text-left text-muted-foreground space-y-2 text-sm">
                <li>1. Read the sentence with the blank</li>
                <li>2. Tap the train car with the correct answer</li>
                <li>3. Beat the clock - 10 seconds per question!</li>
                <li>4. Complete all 5 questions</li>
              </ul>
            </div>

            <Button onClick={startGame} size="lg" className="gap-2 px-8">
              <Play className="w-5 h-5" />
              Start Game
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

            {/* Timer bar */}
            <div className="h-3 bg-muted rounded-full mb-6 overflow-hidden">
              <div
                className={`h-full ${timerColor} transition-all duration-1000 ease-linear rounded-full`}
                style={{ width: `${(timeLeft / TIME_PER_QUESTION) * 100}%` }}
              />
            </div>

            {/* Sentence */}
            <div className="bg-card border border-border rounded-2xl p-6 mb-8">
              <p className="text-lg text-foreground leading-relaxed text-center">
                {currentQuestion.sentence.split("______").map((part, i, arr) => (
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

            {/* Train */}
            <Train
              options={currentQuestion.options}
              correctAnswer={currentQuestion.correctAnswer}
              selectedAnswer={selectedAnswer}
              answered={answered}
              onSelect={handleAnswer}
              position={trainPosition}
            />

            {/* Feedback */}
            {answered && (
              <div className={`mt-6 p-4 rounded-xl text-center animate-in fade-in slide-in-from-bottom-2 duration-300 ${selectedAnswer === currentQuestion.correctAnswer
                  ? "bg-game-green/20 text-game-green"
                  : "bg-game-red/20 text-game-red"
                }`}>
                <p className="font-bold mb-1">
                  {selectedAnswer === currentQuestion.correctAnswer
                    ? "Correct!"
                    : selectedAnswer
                      ? "Not quite!"
                      : "Time's up!"}
                </p>
                <p className="text-sm opacity-90">{currentQuestion.explanation}</p>
              </div>
            )}
          </div>
        )}

        {gameState === "results" && (
          <TrainResultsScreen
            score={score}
            total={QUESTIONS_PER_GAME}
            onPlayAgain={startGame}
          />
        )}
      </div>
    </main>
  )
}
