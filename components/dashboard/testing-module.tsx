"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, Trophy, Clock, TrendingUp, RotateCcw, Eye } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { SATQuestionSolver } from "./sat-question-solver"

interface TestingModuleProps {
  testResults: any[]
  userId: string
  availableTests?: any[]
}

export function TestingModule({ testResults, userId, availableTests = [] }: TestingModuleProps) {
  const router = useRouter()
  const [isStarting, setIsStarting] = useState(false)

  const startTest = async (testType: string, title: string) => {
    setIsStarting(true)
    const supabase = createClient()

    try {
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
      console.error("Error starting test:", error)
    } finally {
      setIsStarting(false)
    }
  }

  const startTemplateTest = (testId: string) => {
    router.push(`/test/${testId}`)
  }

  const viewResults = (resultId: string) => {
    router.push(`/results/${resultId}`)
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

  // Get unique test IDs that have been completed (for retake section)
  const completedTestIds = new Set(testResults.map(r => r.test_id))
  const newTests = availableTests.filter(t => !completedTestIds.has(t.id))
  const retakeTests = availableTests.filter(t => completedTestIds.has(t.id))

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
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#4ECDC4]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1B4B6B]">{testResults[0]?.score || '—'}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {testResults.length > 0 ? 'Latest test score' : 'Take a test to see your score'}
            </p>
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

      {/* AI Question Solver */}
      <SATQuestionSolver />

      {/* Available Tests (New) */}
      <Card>
        <CardHeader>
          <CardTitle>Start a New Test</CardTitle>
          <CardDescription>Choose a test type to begin your practice session</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {newTests.map((test) => (
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

            {newTests.length === 0 && retakeTests.length === 0 && (
              <div className="col-span-3 text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <p>No practice tests available right now. Please check back later.</p>
              </div>
            )}

            {newTests.length === 0 && retakeTests.length > 0 && (
              <div className="col-span-3 text-center py-4 text-muted-foreground">
                <p>You've completed all available tests! Check the Retake section below.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Retake Tests Section */}
      {retakeTests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-amber-500" />
              Retake Previous Tests
            </CardTitle>
            <CardDescription>Practice makes perfect! Retake tests to improve your score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {retakeTests.map((test) => {
                // Find the best score for this test
                const testScores = testResults.filter(r => r.test_id === test.id)
                const bestScore = Math.max(...testScores.map(r => r.score))
                const latestResult = testScores[0]

                return (
                  <div key={test.id} className="flex flex-col p-4 border-2 border-amber-500/30 rounded-lg hover:border-amber-500/50 transition-colors bg-amber-500/5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold line-clamp-1" title={test.title}>{test.title}</h3>
                      <Badge variant="outline" className="border-amber-500 text-amber-600">
                        Best: {bestScore}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 capitalize">{test.test_type} Test</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Completed {testScores.length} time{testScores.length > 1 ? 's' : ''}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewResults(latestResult.id)}
                        className="flex-1 border-slate-300"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Results
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => startTemplateTest(test.id)}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Retake
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

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
            <div className="space-y-3">
              {testResults.slice(0, 5).map((result) => (
                <div
                  key={result.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => viewResults(result.id)}
                >
                  <div className="flex-1">
                    <h4 className="font-semibold">{result.tests?.title || "Test"}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{new Date(result.completed_at).toLocaleDateString()}</span>
                      <span>{result.time_taken_minutes} mins</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#1B4B6B]">
                        {result.score}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        out of {result.total_score}
                      </div>
                    </div>
                    <Eye className="h-5 w-5 text-slate-400" />
                  </div>
                </div>
              ))}
              {testResults.length > 5 && (
                <p className="text-center text-sm text-muted-foreground pt-2">
                  Showing 5 most recent results
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
