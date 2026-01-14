"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface QuestionManagerProps {
  questions: any[]
  userId: string
}

export function QuestionManager({ questions: initialQuestions, userId }: QuestionManagerProps) {
  const router = useRouter()
  const [questions, setQuestions] = useState(initialQuestions)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    question_text: "",
    question_type: "multiple_choice",
    category: "math",
    difficulty: "medium",
    correct_answer: "",
    options: ["", "", "", ""],
    explanation: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    const { data, error } = await supabase
      .from("questions")
      .insert({
        ...formData,
        options: formData.question_type === "multiple_choice" ? formData.options : null,
        created_by: userId,
      })
      .select()
      .single()

    if (!error && data) {
      setQuestions([data, ...questions])
      setIsAdding(false)
      setFormData({
        question_text: "",
        question_type: "multiple_choice",
        category: "math",
        difficulty: "medium",
        correct_answer: "",
        options: ["", "", "", ""],
        explanation: "",
      })
    }
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("questions").delete().eq("id", id)

    if (!error) {
      setQuestions(questions.filter((q) => q.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Questions Bank</h2>
          <p className="text-gray-400">Manage SAT practice questions</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className="bg-[#4FB3A8] hover:bg-[#3d8f85]">
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      {isAdding && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Create New Question</CardTitle>
            <CardDescription>Add a new question to the question bank</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Question Text</Label>
                <Textarea
                  value={formData.question_text}
                  onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                  required
                  className="bg-gray-900 border-gray-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select
                    value={formData.question_type}
                    onValueChange={(value) => setFormData({ ...formData, question_type: value })}
                  >
                    <SelectTrigger className="bg-gray-900 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                      <SelectItem value="grid_in">Grid In</SelectItem>
                      <SelectItem value="essay">Essay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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

              {formData.question_type === "multiple_choice" && (
                <div className="space-y-2">
                  <Label>Answer Options</Label>
                  {formData.options.map((option, index) => (
                    <Input
                      key={index}
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...formData.options]
                        newOptions[index] = e.target.value
                        setFormData({ ...formData, options: newOptions })
                      }}
                      className="bg-gray-900 border-gray-600"
                    />
                  ))}
                </div>
              )}

              <div>
                <Label>Correct Answer</Label>
                <Input
                  value={formData.correct_answer}
                  onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                  required
                  className="bg-gray-900 border-gray-600"
                />
              </div>

              <div>
                <Label>Explanation</Label>
                <Textarea
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  className="bg-gray-900 border-gray-600"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-[#4FB3A8] hover:bg-[#3d8f85]">
                  Create Question
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {questions.map((question) => (
          <Card key={question.id} className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{question.question_text}</CardTitle>
                  <CardDescription className="flex gap-2 mt-2">
                    <span className="px-2 py-1 bg-gray-700 rounded text-xs">{question.category}</span>
                    <span className="px-2 py-1 bg-gray-700 rounded text-xs">{question.difficulty}</span>
                    <span className="px-2 py-1 bg-gray-700 rounded text-xs">{question.question_type}</span>
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(question.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                <strong>Correct Answer:</strong> {question.correct_answer}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
