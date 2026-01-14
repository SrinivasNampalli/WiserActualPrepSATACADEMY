"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Copy, Check } from "lucide-react"

export function SATQuestionSolver() {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSolve = async () => {
    if (!question.trim()) return

    setIsLoading(true)
    setAnswer("")
    setError(null)

    try {
      console.log("[v0] Calling Gemini API to solve SAT question")
      const response = await fetch("/api/gemini/solve-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      })

      if (!response.ok) {
        throw new Error("Failed to solve question")
      }

      const data = await response.json()
      setAnswer(data.answer)
    } catch (error) {
      console.error("[v0] Error solving question:", error)
      setError("Failed to solve the question. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(answer)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#4ECDC4]" />
              SAT Question Solver
            </CardTitle>
            <CardDescription>Get step-by-step solutions to SAT practice questions</CardDescription>
          </div>
          <Badge className="bg-[#4ECDC4] text-[#0A2540]">Gemini AI</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Paste your SAT question here... The AI tutor will solve it step-by-step and explain the answer."
          className="min-h-[150px]"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button
          onClick={handleSolve}
          disabled={isLoading || !question.trim()}
          className="w-full bg-[#4ECDC4] hover:bg-[#45b8b0] text-[#0A2540]"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {isLoading ? "Solving with AI Tutor..." : "Solve Question"}
        </Button>

        {answer && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-[#1B4B6B]">Step-by-Step Solution</h4>
              <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="prose prose-sm max-w-none">
              <p className="text-sm whitespace-pre-wrap text-gray-700">{answer}</p>
            </div>
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-900">
            <strong>Tip:</strong> Copy and paste complete SAT questions including answer choices for the most accurate
            solutions. The AI tutor will explain the reasoning behind each step.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
