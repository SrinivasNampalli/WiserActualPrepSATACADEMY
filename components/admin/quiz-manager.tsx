"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface QuizManagerProps {
  quizzes: any[]
  questions: any[]
  userId: string
}

export function QuizManager({ quizzes: initialQuizzes, questions, userId }: QuizManagerProps) {
  const [quizzes, setQuizzes] = useState(initialQuizzes)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "math",
    difficulty: "medium",
    time_limit_minutes: 30,
    passing_score: 70,
  })
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    // Create quiz
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .insert({
        ...formData,
        created_by: userId,
      })
      .select()
      .single()

    if (quizError || !quiz) return

    // Add selected questions to quiz
    if (selectedQuestions.length > 0) {
      const quizQuestions = selectedQuestions.map((qId, index) => ({
        quiz_id: quiz.id,
        question_id: qId,
        order_number: index + 1,
        points: 1,
      }))

      await supabase.from("quiz_questions").insert(quizQuestions)
    }

    setQuizzes([quiz, ...quizzes])
    setIsCreating(false)
    setFormData({
      title: "",
      description: "",
      category: "math",
      difficulty: "medium",
      time_limit_minutes: 30,
      passing_score: 70,
    })
    setSelectedQuestions([])
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("quizzes").delete().eq("id", id)

    if (!error) {
      setQuizzes(quizzes.filter((q) => q.id !== id))
    }
  }

  const toggleQuestion = (questionId: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId],
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Quiz Manager</h2>
          <p className="text-gray-400">Create and manage quiz sets</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} className="bg-[#4FB3A8] hover:bg-[#3d8f85]">
          <Plus className="h-4 w-4 mr-2" />
          Create Quiz
        </Button>
      </div>

      {isCreating && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Create New Quiz</CardTitle>
            <CardDescription>Build a quiz from your question bank</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Quiz Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="bg-gray-900 border-gray-600"
                  placeholder="e.g., Algebra Practice Quiz"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-gray-900 border-gray-600"
                  placeholder="Brief description of the quiz"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="bg-gray-900 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="math">Math</SelectItem>
                      <SelectItem value="reading">Reading</SelectItem>
                      <SelectItem value="writing">Writing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Difficulty</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                  >
                    <SelectTrigger className="bg-gray-900 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Time Limit (minutes)</Label>
                  <Input
                    type="number"
                    value={formData.time_limit_minutes}
                    onChange={(e) => setFormData({ ...formData, time_limit_minutes: Number.parseInt(e.target.value) })}
                    className="bg-gray-900 border-gray-600"
                  />
                </div>

                <div>
                  <Label>Passing Score (%)</Label>
                  <Input
                    type="number"
                    value={formData.passing_score}
                    onChange={(e) => setFormData({ ...formData, passing_score: Number.parseInt(e.target.value) })}
                    className="bg-gray-900 border-gray-600"
                  />
                </div>
              </div>

              <div>
                <Label>Select Questions ({selectedQuestions.length} selected)</Label>
                <div className="mt-2 max-h-64 overflow-y-auto space-y-2 border border-gray-600 rounded p-3 bg-gray-900">
                  {questions.length === 0 ? (
                    <p className="text-sm text-gray-400">No questions available. Create questions first.</p>
                  ) : (
                    questions.map((question) => (
                      <div key={question.id} className="flex items-start gap-2">
                        <Checkbox
                          checked={selectedQuestions.includes(question.id)}
                          onCheckedChange={() => toggleQuestion(question.id)}
                        />
                        <label className="text-sm cursor-pointer flex-1">
                          {question.question_text.substring(0, 100)}...
                          <span className="ml-2 text-xs text-gray-500">
                            ({question.category} - {question.difficulty})
                          </span>
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-[#4FB3A8] hover:bg-[#3d8f85]">
                  Create Quiz
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {quizzes.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="py-12 text-center text-gray-400">
              No quizzes created yet. Click &quot;Create Quiz&quot; to get started.
            </CardContent>
          </Card>
        ) : (
          quizzes.map((quiz) => (
            <Card key={quiz.id} className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{quiz.title}</CardTitle>
                    <CardDescription className="mt-2">{quiz.description}</CardDescription>
                    <div className="flex gap-2 mt-3">
                      <span className="px-2 py-1 bg-gray-700 rounded text-xs">{quiz.category}</span>
                      <span className="px-2 py-1 bg-gray-700 rounded text-xs">{quiz.difficulty}</span>
                      <span className="px-2 py-1 bg-gray-700 rounded text-xs">{quiz.time_limit_minutes} min</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(quiz.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
