import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TestResultsContent } from "./results-content"

interface TestResultsPageProps {
    params: Promise<{ id: string }>
}

interface Question {
    id: string
    question_text: string
    options: string[]
    correct_answer: string
    category?: string
    image_url?: string
    explanation?: string
}

export default async function TestResultsPage({ params }: TestResultsPageProps) {
    const { id } = await params
    const supabase = await createClient()

    // Check auth
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    // Fetch the test result with user_answers
    const { data: result, error } = await supabase
        .from("test_results")
        .select(`
            *,
            tests (
                id,
                title,
                test_type
            )
        `)
        .eq("id", id)
        .eq("user_id", user.id)
        .single()

    if (error || !result) {
        redirect("/dashboard")
    }

    // Fetch questions for this test with explanations
    let incorrectQuestions: { question: Question; userAnswer: string }[] = []

    if (result.user_answers && result.tests?.id) {
        const userAnswers = result.user_answers as Record<string, string>

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
            .eq("test_id", result.tests.id)

        if (testQuestions) {
            for (const tq of testQuestions) {
                const question = tq.questions as unknown as Question
                if (!question) continue

                const userAnswer = userAnswers[question.id]
                if (userAnswer && userAnswer !== question.correct_answer) {
                    incorrectQuestions.push({ question, userAnswer })
                }
            }
        }
    }

    return (
        <TestResultsContent
            result={result}
            testTitle={result.tests?.title || "Practice Test"}
            incorrectQuestions={incorrectQuestions}
        />
    )
}
