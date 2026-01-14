"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface TestManagerProps {
  tests: any[]
  userId: string
}

export function TestManager({ tests: initialTests, userId }: TestManagerProps) {
  const [tests, setTests] = useState(initialTests)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    test_type: "practice",
    title: "",
    total_questions: 40,
    duration_minutes: 60,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    const { data, error } = await supabase
      .from("tests")
      .insert({
        ...formData,
        user_id: userId,
      })
      .select()
      .single()

    if (!error && data) {
      setTests([data, ...tests])
      setIsCreating(false)
      setFormData({
        test_type: "practice",
        title: "",
        total_questions: 40,
        duration_minutes: 60,
      })
    }
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("tests").delete().eq("id", id)

    if (!error) {
      setTests(tests.filter((t) => t.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Test Manager</h2>
          <p className="text-gray-400">Manage full-length practice tests</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} className="bg-[#4FB3A8] hover:bg-[#3d8f85]">
          <Plus className="h-4 w-4 mr-2" />
          Create Test
        </Button>
      </div>

      {isCreating && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Create New Test</CardTitle>
            <CardDescription>Set up a new SAT practice test</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Test Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="bg-gray-900 border-gray-600"
                  placeholder="e.g., SAT Practice Test #1"
                />
              </div>

              <div>
                <Label>Test Type</Label>
                <Select
                  value={formData.test_type}
                  onValueChange={(value) => setFormData({ ...formData, test_type: value })}
                >
                  <SelectTrigger className="bg-gray-900 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diagnostic">Diagnostic Test</SelectItem>
                    <SelectItem value="practice">Practice Test</SelectItem>
                    <SelectItem value="mock">Mock Test</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Total Questions</Label>
                  <Input
                    type="number"
                    value={formData.total_questions}
                    onChange={(e) => setFormData({ ...formData, total_questions: Number.parseInt(e.target.value) })}
                    required
                    className="bg-gray-900 border-gray-600"
                  />
                </div>

                <div>
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: Number.parseInt(e.target.value) })}
                    required
                    className="bg-gray-900 border-gray-600"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-[#4FB3A8] hover:bg-[#3d8f85]">
                  Create Test
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
        {tests.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="py-12 text-center text-gray-400">
              No tests created yet. Click &quot;Create Test&quot; to get started.
            </CardContent>
          </Card>
        ) : (
          tests.map((test) => (
            <Card key={test.id} className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{test.title}</CardTitle>
                    <div className="flex gap-2 mt-3">
                      <span className="px-2 py-1 bg-gray-700 rounded text-xs capitalize">{test.test_type}</span>
                      <span className="px-2 py-1 bg-gray-700 rounded text-xs">{test.total_questions} questions</span>
                      <span className="px-2 py-1 bg-gray-700 rounded text-xs">{test.duration_minutes} min</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(test.id)}
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
