import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MistakesClient } from "@/components/mistakes-client"

interface Question {
    id: string
    question_text: string
    options: string[]
    correct_answer: string
    category?: string
    image_url?: string
    explanation?: string
}

export default async function MistakesPage() {
    const supabase = await createClient()

    // Check auth
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    // Fetch all test results with user_answers for this user
    const { data: testResults, error: resultsError } = await supabase
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
        .not("user_answers", "is", null)
        .order("completed_at", { ascending: false })

    if (resultsError) {
        console.error("Error fetching test results:", resultsError)
    }

    // Collect all incorrect answers across all tests
    const incorrectQuestions: {
        question: Question
        userAnswer: string
        testTitle?: string
        testDate?: string
    }[] = []

    // Process each test result
    for (const result of testResults || []) {
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

    // Prepare test results for trend chart (only need basic info)
    const testResultsForChart = (testResults || []).map(r => ({
        id: r.id,
        correct_answers: r.correct_answers || 0,
        total_questions: r.total_questions || 1,
        completed_at: r.completed_at || new Date().toISOString(),
    }))

    return (
        <MistakesClient
            incorrectQuestions={incorrectQuestions}
            testResults={testResultsForChart}
        />
    )
}
