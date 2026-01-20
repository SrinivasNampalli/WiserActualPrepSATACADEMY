"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Plus, RotateCw, Save, ChevronRight, ChevronLeft, Check, X, Crown, Lock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useSubscription, FREE_LIMITS } from "@/lib/subscription-context"

interface FlashcardGeneratorProps {
  userId: string
}

export function FlashcardGenerator({ userId }: FlashcardGeneratorProps) {
  const { isPremium, checkFeatureAccess, getRemainingUsage, incrementUsage } = useSubscription()
  const [topic, setTopic] = useState("")
  const [courseLevel, setCourseLevel] = useState("AP")
  const [numCards, setNumCards] = useState(10)
  const [flashcards, setFlashcards] = useState<Array<{ question: string; answer: string }>>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [savedSets, setSavedSets] = useState<any[]>([])
  const [limitReached, setLimitReached] = useState(false)

  const remainingGenerations = getRemainingUsage('flashcard_sets')
  const canGenerate = isPremium || remainingGenerations > 0

  const generateFlashcards = async () => {
    if (!topic.trim()) return

    // Check limit for free users
    if (!canGenerate) {
      setLimitReached(true)
      return
    }

    setIsGenerating(true)
    setLimitReached(false)
    try {
      const response = await fetch("/api/gemini/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, courseLevel, numCards }),
      })

      const data = await response.json()
      if (data.flashcards) {
        setFlashcards(data.flashcards)
        setCurrentCardIndex(0)
        setIsFlipped(false)
        // Increment usage for free users (only when saving, not generating preview)
      }
    } catch (error) {
      console.error("Failed to generate flashcards:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const saveFlashcardSet = async () => {
    if (flashcards.length === 0) return

    // Check if free user can save (has remaining usage)
    if (!isPremium && !canGenerate) {
      setLimitReached(true)
      return
    }

    setIsSaving(true)
    try {
      const supabase = createClient()

      // Create flashcard set
      const { data: setData, error: setError } = await supabase
        .from("flashcard_sets")
        .insert({
          user_id: userId,
          title: topic,
          topic: topic,
          course_level: courseLevel,
        })
        .select()
        .single()

      if (setError) throw setError

      // Insert all flashcards
      const flashcardsToInsert = flashcards.map((card) => ({
        set_id: setData.id,
        question: card.question,
        answer: card.answer,
      }))

      const { error: cardsError } = await supabase.from("flashcards").insert(flashcardsToInsert)

      if (cardsError) throw cardsError

      // Increment usage for free users after successful save
      if (!isPremium) {
        await incrementUsage('flashcard_sets')
      }

      alert("Flashcard set saved successfully!")
      loadSavedSets()
    } catch (error) {
      console.error("Failed to save flashcards:", error)
      alert("Failed to save flashcard set")
    } finally {
      setIsSaving(false)
    }
  }

  const loadSavedSets = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("flashcard_sets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (data) {
      setSavedSets(data)
    }
  }

  const loadFlashcardSet = async (setId: string) => {
    const supabase = createClient()
    const { data } = await supabase.from("flashcards").select("*").eq("set_id", setId)

    if (data) {
      setFlashcards(data.map((card: { question: string; answer: string }) => ({ question: card.question, answer: card.answer })))
      setCurrentCardIndex(0)
      setIsFlipped(false)
    }
  }

  const nextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setIsFlipped(false)
    }
  }

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1)
      setIsFlipped(false)
    }
  }

  // Load saved sets on mount
  useEffect(() => {
    loadSavedSets()
  }, [userId])

  return (
    <div className="space-y-6">
      {/* Generator Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-theme" />
              <CardTitle>AI Flashcard Generator</CardTitle>
            </div>
            {/* Usage Counter for Free Users */}
            {!isPremium && (
              <Badge variant={canGenerate ? "secondary" : "destructive"} className="flex items-center gap-1">
                {canGenerate ? (
                  <>{remainingGenerations} set{remainingGenerations !== 1 ? 's' : ''} remaining</>
                ) : (
                  <>
                    <Lock className="h-3 w-3" />
                    Limit reached
                  </>
                )}
              </Badge>
            )}
            {isPremium && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
          <CardDescription>Generate AP-level flashcards for any topic using Gemini AI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Limit Reached Warning */}
          {limitReached && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800">Free limit reached!</p>
                  <p className="text-sm text-amber-600">You can only generate {FREE_LIMITS.flashcard_sets} flashcard set as a free user.</p>
                </div>
              </div>
              <Button asChild size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                <a href="/pricing">
                  <Crown className="h-4 w-4 mr-1" />
                  Upgrade
                </a>
              </Button>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="topic">Course Topic</Label>
              <Input
                id="topic"
                placeholder="e.g., AP Biology: Cell Structure, AP Calculus: Derivatives, SAT Math: Quadratics"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={limitReached && !isPremium}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseLevel">Course Level</Label>
              <Select value={courseLevel} onValueChange={setCourseLevel} disabled={limitReached && !isPremium}>
                <SelectTrigger id="courseLevel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AP">AP</SelectItem>
                  <SelectItem value="SAT">SAT</SelectItem>
                  <SelectItem value="College">College</SelectItem>
                  <SelectItem value="Honors">Honors</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-end gap-4">
            <div className="space-y-2 flex-1">
              <Label htmlFor="numCards">Number of Cards</Label>
              <Input
                id="numCards"
                type="number"
                min={5}
                max={50}
                value={numCards}
                onChange={(e) => setNumCards(Number.parseInt(e.target.value))}
                disabled={limitReached && !isPremium}
              />
            </div>
            <Button
              onClick={generateFlashcards}
              disabled={isGenerating || !topic.trim() || (limitReached && !isPremium)}
              className="bg-theme-base hover:bg-theme-dark text-white"
            >
              {isGenerating ? (
                <>
                  <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Flashcards
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Flashcard Viewer */}
      {flashcards.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Flashcard Study Mode</CardTitle>
                <CardDescription>
                  Card {currentCardIndex + 1} of {flashcards.length}
                </CardDescription>
              </div>
              <Button onClick={saveFlashcardSet} disabled={isSaving} variant="outline" size="sm">
                {isSaving ? (
                  <>
                    <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Set
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Flashcard */}
            <div onClick={() => setIsFlipped(!isFlipped)} className="relative h-80 cursor-pointer perspective-1000">
              <div
                className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? "rotate-y-180" : ""
                  }`}
              >
                {/* Front (Question) */}
                <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-[#1B4B6B] to-[#0A2540] rounded-lg p-8 flex flex-col items-center justify-center text-center">
                  <Badge className="mb-4 bg-theme-base text-white">Question</Badge>
                  <p className="text-white text-2xl font-medium leading-relaxed">
                    {flashcards[currentCardIndex].question}
                  </p>
                  <p className="text-gray-300 text-sm mt-6">Click to reveal answer</p>
                </div>

                {/* Back (Answer) */}
                <div className="absolute w-full h-full backface-hidden bg-theme rounded-lg p-8 flex flex-col items-center justify-center text-center rotate-y-180">
                  <Badge className="mb-4 bg-[#0A2540] text-white">Answer</Badge>
                  <p className="text-[#0A2540] text-xl font-medium leading-relaxed">
                    {flashcards[currentCardIndex].answer}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button onClick={prevCard} disabled={currentCardIndex === 0} variant="outline">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="text-red-600 bg-transparent">
                  <X className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className="text-green-600 bg-transparent">
                  <Check className="h-5 w-5" />
                </Button>
              </div>

              <Button onClick={nextCard} disabled={currentCardIndex === flashcards.length - 1} variant="outline">
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-theme-base h-2 rounded-full transition-all"
                style={{ width: `${((currentCardIndex + 1) / flashcards.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved Flashcard Sets */}
      {savedSets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Saved Sets</CardTitle>
            <CardDescription>Click to load a previously saved flashcard set</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {savedSets.map((set) => (
                <button
                  key={set.id}
                  onClick={() => loadFlashcardSet(set.id)}
                  className="p-4 rounded-lg border border-gray-200 hover:border-theme-base hover:bg-theme-base/5 transition-all text-left group"
                >
                  <p className="font-medium text-gray-800 group-hover:text-theme-dark truncate">
                    {set.title || set.topic}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {set.course_level} • {new Date(set.created_at).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
