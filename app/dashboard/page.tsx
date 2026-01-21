import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

interface Question {
  id: string
  question_text: string
  options: string[]
  correct_answer: string
  category?: string
  image_url?: string
  explanation?: string
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const adminSupabase = createAdminClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch ALL test results with user_answers for mistakes
  const { data: allTestResults } = await supabase
    .from("test_results")
    .select(`
      id,
      user_answers,
      completed_at,
      correct_answers,
      total_questions,
      test_id,
      tests (
        id,
        title
      )
    `)
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })

  // Fetch course progress
  const { data: courseProgress } = await supabase
    .from("user_course_progress")
    .select("*, courses(*)")
    .eq("user_id", user.id)
    .limit(10)

  // Fetch summarizer history
  const { data: summarizerHistory } = await supabase
    .from("summarizer_history")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  // Fetch available tests using admin client to bypass RLS
  const { data: allTests, error: testsError } = await adminSupabase
    .from("tests")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(50)

  console.log("[Dashboard] Fetched public tests:", allTests?.length || 0, "Error:", testsError?.message || "none")

  const availableTests = allTests || []

  // Collect all incorrect answers for the Mistakes tab
  const incorrectQuestions: {
    question: Question
    userAnswer: string
    testTitle?: string
    testDate?: string
  }[] = []

  // Process each test result to find mistakes
  for (const result of allTestResults || []) {
    if (!result.user_answers || !result.test_id) continue

    const userAnswers = result.user_answers as Record<string, string>
    const questionIds = Object.keys(userAnswers)

    if (questionIds.length === 0) continue

    // Fetch questions for this test
    const { data: testQuestions } = await supabase
      .from("test_questions")
      .select(`
        question_id,
        questions (
          id,
          question_text,
          options,
          correct_answer,
          category,
          image_url,
          explanation
        )
      `)
      .eq("test_id", result.test_id)

    if (!testQuestions) continue

    // Find incorrect answers
    for (const tq of testQuestions) {
      const question = tq.questions as unknown as Question
      if (!question) continue

      const userAnswer = userAnswers[question.id]
      if (userAnswer && userAnswer !== question.correct_answer) {
        incorrectQuestions.push({
          question,
          userAnswer,
          testTitle: (result.tests as any)?.title,
          testDate: result.completed_at
            ? new Date(result.completed_at).toLocaleDateString()
            : undefined,
        })
      }
    }
  }

  // Prepare test results for trend chart
  const testResultsForChart = (allTestResults || [])
    .filter(r => r.correct_answers !== null)
    .map(r => ({
      id: r.id,
      correct_answers: r.correct_answers || 0,
      total_questions: r.total_questions || 1,
      completed_at: r.completed_at || new Date().toISOString(),
    }))

  return (
    <DashboardContent
      user={user}
      profile={profile}
      testResults={allTestResults || []}
      courseProgress={courseProgress || []}
      summarizerHistory={summarizerHistory || []}
      availableTests={availableTests}
      incorrectQuestions={incorrectQuestions}
      testResultsForChart={testResultsForChart}
    />
  )
}
