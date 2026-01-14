"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, Trophy, Clock, TrendingUp } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { SATQuestionSolver } from "./sat-question-solver"
import { CategoryStats } from "./category-stats"

interface TestingModuleProps {
  testResults: any[]
  userId: string
  availableTests?: any[]
}

export function TestingModule({ testResults, userId, availableTests = [] }: TestingModuleProps) {
  const router = useRouter()
  const [isStarting, setIsStarting] = useState(false)

  const startTest = async (testType: string, title: string) => {
    // Legacy logic for hardcoded cards (creates an empty test shell)
    setIsStarting(true)
    const supabase = createClient()

    try {
      console.log("[v0] Creating new test session")
      const { data, error } = await supabase
        .from("tests")
        .insert({
          user_id: userId,
          test_type: testType,
          title: title,
          total_questions: testType === "diagnostic" ? 58 : 154,
          duration_minutes: testType === "diagnostic" ? 70 : 180,
        })
        .select()
        .single()

      if (error) throw error

      router.push(`/test/${data.id}`)
    } catch (error) {
      console.error("[v0] Error starting test:", error)
    } finally {
      setIsStarting(false)
    }
  }

  const startTemplateTest = (testId: string) => {
    router.push(`/test/${testId}`)
  }

  const calculateAverageScore = () => {
    if (testResults.length === 0) return 0
    const total = testResults.reduce((sum, result) => sum + result.score, 0)
    return Math.round(total / testResults.length)
  }

  const calculateProgress = () => {
    if (testResults.length < 2) return 0
    const latest = testResults[0]?.score || 0
    const earliest = testResults[testResults.length - 1]?.score || 0
    const improvement = latest - earliest
    return Math.max(0, Math.min(100, (improvement / 600) * 100))
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tests Completed</CardTitle>
            <Trophy className="h-4 w-4 text-[#4ECDC4]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1B4B6B]">{testResults.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Keep practicing!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#4ECDC4]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1B4B6B]">{calculateAverageScore()}</div>
            <p className="text-xs text-muted-foreground mt-1">Out of 1600</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Improvement</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#4ECDC4]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1B4B6B]">{calculateProgress()}%</div>
            <Progress value={calculateProgress()} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Category Performance Stats */}
      <CategoryStats testResults={testResults} />

      {/* AI Question Solver */}
      <SATQuestionSolver />

      {/* Available Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Start a New Test</CardTitle>
          <CardDescription>Choose a test type to begin your practice session</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Render Admin Templates First */}
            {availableTests.map((test) => (
              <div key={test.id} className="flex flex-col p-4 border-2 border-[#4ECDC4]/50 rounded-lg hover:border-[#4ECDC4] transition-colors bg-[#4ECDC4]/5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold line-clamp-1" title={test.title}>{test.title}</h3>
                  <Badge variant="default" className="bg-[#4ECDC4] text-[#0A2540] hover:bg-[#45b8b0]">{test.total_questions || '?'} Qs</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4 capitalize">{test.test_type} Test</p>
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <Clock className="h-4 w-4 mr-2" />
                  {test.duration_minutes || 60} minutes
                </div>
                <Button
                  onClick={() => startTemplateTest(test.id)}
                  className="w-full bg-[#1B4B6B] hover:bg-[#153a52] text-white"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Test
                </Button>
              </div>
            ))}

            {availableTests.length === 0 && (
              <div className="col-span-3 text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <p>No practice tests available right now. Please check back later.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Test Results</CardTitle>
          <CardDescription>Your latest test performance and scores</CardDescription>
        </CardHeader>
        <CardContent>
          {testResults.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No test results yet. Start your first test above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {testResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold">{result.tests?.title || "Test"}</h4>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>Completed: {new Date(result.completed_at).toLocaleDateString()}</span>
                      <span>Time: {result.time_taken_minutes} mins</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#1B4B6B]">
                      {result.score}/{result.total_score}
                    </div>
                    {result.math_score && result.reading_score && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Math: {result.math_score} | R&W: {result.reading_score}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
