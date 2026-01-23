"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Play,
  Trophy,
  Clock,
  TrendingUp,
  RotateCcw,
  Eye,
  Calculator,
  BookOpen,
  Target,
  Zap,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Lock,
  Crown
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useThemeContext } from "@/lib/theme-context"
import { useSubscription, FREE_LIMITS } from "@/lib/subscription-context"

interface TestingModuleProps {
  testResults: any[]
  userId: string
  availableTests?: any[]
}

export function TestingModule({ testResults, userId, availableTests = [] }: TestingModuleProps) {
  const router = useRouter()
  const { theme } = useThemeContext()
  const { isPremium } = useSubscription()
  const [activeTab, setActiveTab] = useState<"math" | "english" | "full">("math")

  // Free users get first 3 quizzes only
  const FREE_QUIZ_LIMIT = FREE_LIMITS.quizzes || 3

  const startTemplateTest = (testId: string) => {
    router.push(`/test/${testId}`)
  }

  const viewResults = (resultId: string) => {
    router.push(`/results/${resultId}`)
  }

  // Calculate stats from actual results
  const totalTests = testResults.length
  const latestResult = testResults[0]
  const latestScore = latestResult ? `${latestResult.correct_answers}/${latestResult.total_questions}` : "—"
  const latestPercentage = latestResult ? Math.round((latestResult.correct_answers / latestResult.total_questions) * 100) : 0

  // Categorize tests by subject field (with fallback to title/test_type for backwards compat)
  const mathTests = availableTests.filter(t =>
    t.subject === "math" ||
    t.test_type?.toLowerCase().includes("math") ||
    t.title?.toLowerCase().includes("math")
  )
  const englishTests = availableTests.filter(t =>
    t.subject === "english" ||
    t.test_type?.toLowerCase().includes("english") ||
    t.test_type?.toLowerCase().includes("reading") ||
    t.title?.toLowerCase().includes("english") ||
    t.title?.toLowerCase().includes("reading")
  )
  const fullTests = availableTests.filter(t =>
    t.subject === "full" ||
    (!mathTests.includes(t) && !englishTests.includes(t))
  )

  // Get unique test IDs that have been completed
  const completedTestIds = new Set(testResults.map(r => r.test_id))

  const renderTestCard = (test: any, index: number) => {
    const isCompleted = completedTestIds.has(test.id)
    const testScores = testResults.filter(r => r.test_id === test.id)
    const bestResult = testScores.length > 0 ? testScores.reduce((best, r) =>
      (r.correct_answers / r.total_questions) > (best.correct_answers / best.total_questions) ? r : best
      , testScores[0]) : null

    // Check if test is locked for free users (only first 3 tests are free)
    const isLocked = !isPremium && index >= FREE_QUIZ_LIMIT

    return (
      <div
        key={test.id}
        className={`group relative overflow-hidden rounded-2xl border bg-white transition-all duration-300 ${isLocked
            ? 'border-slate-300 opacity-75'
            : 'border-slate-200 hover:shadow-xl hover:-translate-y-1'
          }`}
      >
        {/* Top accent bar - uses theme colors */}
        <div
          className="h-1.5"
          style={{ background: isLocked ? '#94a3b8' : theme.gradient }}
        />

        {/* Premium lock overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center">
            <Lock className="h-8 w-8 text-amber-500 mb-2" />
            <p className="text-sm font-medium text-slate-600 mb-2">Premium Only</p>
            <Button
              size="sm"
              asChild
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              <a href="/pricing">
                <Crown className="h-4 w-4 mr-1" />
                Upgrade
              </a>
            </Button>
          </div>
        )}

        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-slate-800 line-clamp-2 group-hover:text-theme transition-colors">
                {test.title}
              </h3>
              <p className="text-sm text-slate-500 mt-1 capitalize">{test.test_type} Test</p>
            </div>
            <Badge className={`${isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-theme-base/10 text-theme-dark'} font-semibold`}>
              {test.total_questions || '?'} Qs
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{test.duration_minutes || 60} min</span>
            </div>
            {isCompleted && bestResult && (
              <div className="flex items-center gap-1.5 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>Best: {bestResult.correct_answers}/{bestResult.total_questions}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {isCompleted && testScores[0] && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => viewResults(testScores[0].id)}
                className="flex-1 border-slate-300 hover:bg-slate-50"
              >
                <Eye className="h-4 w-4 mr-1.5" />
                Results
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => startTemplateTest(test.id)}
              className="flex-1 text-white"
              style={{
                background: isCompleted ? '#f59e0b' : theme.gradient
              }}
              disabled={isLocked}
            >
              {isCompleted ? (
                <>
                  <RotateCcw className="h-4 w-4 mr-1.5" />
                  Retake
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1.5" />
                  Start
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero Stats Section - Uses theme colors */}
      <div className="grid md:grid-cols-3 gap-5">
        <Card
          className="relative overflow-hidden border-0 text-white shadow-lg"
          style={{
            background: theme.gradient,
            boxShadow: `0 10px 40px -10px ${theme.base}40`
          }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
          <CardContent className="pt-6 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">Tests Completed</p>
                <div className="text-4xl font-bold">{totalTests}</div>
                <p className="text-white/70 text-xs mt-1">Keep up the great work!</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                <Trophy className="h-7 w-7" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="relative overflow-hidden border-0 text-white shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${theme.baseDark}, ${theme.base})`,
            boxShadow: `0 10px 40px -10px ${theme.baseDark}40`
          }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
          <CardContent className="pt-6 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">Latest Score</p>
                <div className="text-4xl font-bold">{latestScore}</div>
                <p className="text-white/70 text-xs mt-1">
                  {latestPercentage > 0 ? `${latestPercentage}% accuracy` : 'Take a test to begin'}
                </p>
              </div>
              <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                <Target className="h-7 w-7" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="relative overflow-hidden border-0 text-white shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${theme.base}, ${theme.baseLight})`,
            boxShadow: `0 10px 40px -10px ${theme.base}40`
          }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
          <CardContent className="pt-6 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">Available Tests</p>
                <div className="text-4xl font-bold">{availableTests.length}</div>
                <p className="text-white/70 text-xs mt-1">Ready to practice</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                <Zap className="h-7 w-7" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Categories Section */}
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Practice Tests</CardTitle>
              <CardDescription className="mt-1">Choose your focus area and start practicing</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-white">
                <Calculator className="h-3.5 w-3.5 mr-1" />
                {mathTests.length} Math
              </Badge>
              <Badge variant="outline" className="bg-white">
                <BookOpen className="h-3.5 w-3.5 mr-1" />
                {englishTests.length} English
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="math" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-100 p-1 rounded-xl">
              <TabsTrigger
                value="math"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2"
              >
                <Calculator className="h-4 w-4" />
                Math
              </TabsTrigger>
              <TabsTrigger
                value="english"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                English
              </TabsTrigger>
              <TabsTrigger
                value="full"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Full Tests
              </TabsTrigger>
            </TabsList>

            <TabsContent value="math" className="mt-0">
              {mathTests.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mathTests.map((test, i) => renderTestCard(test, i))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Calculator className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p className="font-medium">No math tests available</p>
                  <p className="text-sm mt-1">Check back soon for more practice tests</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="english" className="mt-0">
              {englishTests.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {englishTests.map((test, i) => renderTestCard(test, i))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p className="font-medium">No English tests available</p>
                  <p className="text-sm mt-1">Check back soon for more practice tests</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="full" className="mt-0">
              {fullTests.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {fullTests.map((test, i) => renderTestCard(test, i))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p className="font-medium">No full practice tests available</p>
                  <p className="text-sm mt-1">Check back soon for more practice tests</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Recent Results Section */}
      {testResults.length > 0 && (
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                  Recent Results
                </CardTitle>
                <CardDescription className="mt-1">Your latest test performance</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {testResults.slice(0, 5).map((result, i) => {
                const percentage = Math.round((result.correct_answers / result.total_questions) * 100)
                return (
                  <div
                    key={result.id}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer transition-colors group"
                    onClick={() => viewResults(result.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${percentage >= 80 ? 'bg-emerald-100 text-emerald-600' :
                        percentage >= 60 ? 'bg-blue-100 text-blue-600' :
                          'bg-amber-100 text-amber-600'
                        }`}>
                        <span className="font-bold text-lg">{percentage}%</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                          {result.tests?.title || "Practice Test"}
                        </h4>
                        <div className="flex items-center gap-3 mt-0.5 text-sm text-slate-500">
                          <span>{new Date(result.completed_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{result.time_taken_minutes} min</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xl font-bold text-slate-800">
                          {result.correct_answers}/{result.total_questions}
                        </div>
                        <div className="text-xs text-slate-500">correct</div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                )
              })}
            </div>
            {testResults.length > 5 && (
              <div className="p-4 text-center border-t border-slate-100">
                <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                  View All Results
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
