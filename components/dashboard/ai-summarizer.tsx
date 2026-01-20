"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Copy, Check, History } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface AISummarizerProps {
  summarizerHistory: any[]
  userId: string
}

export function AISummarizer({ summarizerHistory: initialHistory, userId }: AISummarizerProps) {
  const [inputText, setInputText] = useState("")
  const [sourceUrl, setSourceUrl] = useState("")
  const [summary, setSummary] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [summarizerHistory, setSummarizerHistory] = useState(initialHistory)
  const [error, setError] = useState<string | null>(null)

  // Render markdown-style formatting (bold, bullets)
  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Handle bullet points
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')
      const cleanLine = isBullet ? line.replace(/^[\s]*[•\-\*][\s]*/, '') : line

      // Handle bold text (between **)
      const parts = cleanLine.split(/(\*\*[^*]+\*\*)/g)
      const formatted = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="font-semibold text-[#1B4B6B]">{part.slice(2, -2)}</strong>
        }
        return <span key={j}>{part}</span>
      })

      if (isBullet) {
        return (
          <div key={i} className="flex items-start gap-2 mb-1">
            <span className="text-[#4ECDC4] font-bold">•</span>
            <span>{formatted}</span>
          </div>
        )
      }
      return <div key={i} className="mb-1">{formatted}</div>
    })
  }

  const handleSummarize = async () => {
    if (!inputText.trim()) return

    setIsLoading(true)
    setSummary("")
    setError(null)

    try {
      console.log("[v0] Calling Gemini API for summarization")
      const response = await fetch("/api/gemini/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate summary")
      }

      const data = await response.json()
      const generatedSummary = data.summary

      setSummary(generatedSummary)

      // Save to database
      const supabase = createClient()
      const { data: savedData } = await supabase
        .from("summarizer_history")
        .insert({
          user_id: userId,
          original_text: inputText,
          summarized_text: generatedSummary,
          content_source: sourceUrl || null,
        })
        .select()
        .single()

      if (savedData) {
        setSummarizerHistory([savedData, ...summarizerHistory])
      }
    } catch (error) {
      console.error("[v0] Error summarizing:", error)
      setError("Failed to generate summary. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Summarizer Interface */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-theme" />
              AI Summarizer
            </CardTitle>
            <CardDescription>Summarize articles, study materials, and SAT passages</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="source-url">Source URL (Optional)</Label>
            <Input
              id="source-url"
              placeholder="https://example.com/article"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="input-text">Text to Summarize</Label>
            <Textarea
              id="input-text"
              placeholder="Paste your article, passage, or study material here. The AI will identify key concepts and generate a concise summary perfect for SAT prep..."
              className="min-h-[200px]"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            onClick={handleSummarize}
            disabled={isLoading || !inputText.trim()}
            className="w-full bg-theme-base hover:bg-theme-dark text-white"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {isLoading ? "Summarizing with Gemini AI..." : "Generate Summary"}
          </Button>

          {summary && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-80 overflow-auto">
              <div className="flex items-center justify-between mb-2 sticky top-0 bg-gray-50">
                <h4 className="font-semibold text-[#1B4B6B]">AI Summary</h4>
                <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="text-sm text-gray-700">{renderMarkdown(summary)}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summarization History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Recent Summaries
          </CardTitle>
          <CardDescription>Your summarization history</CardDescription>
        </CardHeader>
        <CardContent>
          {summarizerHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No summaries yet. Start by summarizing some content above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {summarizerHistory.map((item) => (
                <div key={item.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      {item.content_source && (
                        <a
                          href={item.content_source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-theme hover:underline"
                        >
                          {item.content_source}
                        </a>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">{new Date(item.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 line-clamp-2">{item.original_text}</div>
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700 line-clamp-3">
                    {item.summarized_text}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="bg-gradient-to-br from-[var(--theme-base)]/10 to-[#1B4B6B]/10 border-theme">
        <CardHeader>
          <CardTitle>How to Use the AI Summarizer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="flex items-start gap-2">
            <span className="font-semibold text-[#1B4B6B]">1.</span>
            Copy and paste any article, study material, or SAT passage into the text box
          </p>
          <p className="flex items-start gap-2">
            <span className="font-semibold text-[#1B4B6B]">2.</span>
            Click "Generate Summary" to activate the Gemini AI summarizer
          </p>
          <p className="flex items-start gap-2">
            <span className="font-semibold text-[#1B4B6B]">3.</span>
            Review the key points and use them for efficient study sessions
          </p>
          <p className="flex items-start gap-2">
            <span className="font-semibold text-[#1B4B6B]">4.</span>
            All summaries are saved automatically for future reference
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
