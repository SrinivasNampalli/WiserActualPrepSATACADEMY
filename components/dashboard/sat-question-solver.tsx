"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Copy, Check } from "lucide-react"
import { useSubscription } from "@/lib/subscription-context"
import { UsageIndicator, Paywall } from "@/components/paywall"

// Simple markdown formatter for bold text
function formatAnswer(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-[#0D2240]">{part.slice(2, -2)}</strong>
    }
    return <span key={i}>{part}</span>
  })
}

export function SATQuestionSolver() {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { checkFeatureAccess, incrementUsage, isPremium } = useSubscription()

  const handleSolve = async () => {
    if (!question.trim()) return

    if (!checkFeatureAccess('ai_solver')) {
      setError("You've reached your daily limit. Upgrade to Premium for unlimited access!")
      return
    }

    setIsLoading(true)
    setAnswer("")
    setError(null)

    try {
      const canProceed = await incrementUsage('ai_solver')
      if (!canProceed) {
        setError("You've reached your daily limit. Upgrade to Premium for unlimited access!")
        setIsLoading(false)
        return
      }

      const response = await fetch("/api/gemini/solve-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      })

      if (!response.ok) throw new Error("Failed to solve question")

      const data = await response.json()
      setAnswer(data.answer)
    } catch (error) {
      console.error("Error solving question:", error)
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
              <Sparkles className="h-5 w-5 text-theme" />
              SAT Question Solver
            </CardTitle>
            <CardDescription>Get step-by-step solutions</CardDescription>
          </div>
          <UsageIndicator feature="ai_solver" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Paste your SAT question here..."
          className="min-h-[100px]"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button
          onClick={handleSolve}
          disabled={isLoading || !question.trim()}
          className="w-full bg-theme-base hover:bg-theme-dark text-white"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {isLoading ? "Solving..." : "Solve"}
        </Button>

        {answer && (
          <div className="mt-4 p-4 bg-slate-50 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#0D2240]">Solution</span>
              <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
            <div className="text-sm whitespace-pre-wrap text-gray-700 leading-relaxed">
              {formatAnswer(answer)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
