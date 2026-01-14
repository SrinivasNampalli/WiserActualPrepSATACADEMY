import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"

// Helper to verify admin session
async function verifyAdminSession() {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("admin_session")

    if (!sessionCookie?.value) {
        return false
    }

    try {
        const session = JSON.parse(
            Buffer.from(sessionCookie.value, "base64").toString()
        )

        if (session.expires < Date.now()) {
            return false
        }

        return true
    } catch {
        return false
    }
}

// Create questions and link to test
export async function POST(request: Request) {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { testId, questions } = body

        if (!testId || !questions || !Array.isArray(questions)) {
            return NextResponse.json({ error: "Test ID and questions array required" }, { status: 400 })
        }

        const supabase = createAdminClient()

        // Insert questions
        const { data: insertedQuestions, error: questionsError } = await supabase
            .from("questions")
            .insert(questions)
            .select()

        if (questionsError) {
            console.error("[Admin API] Insert questions error:", questionsError)
            return NextResponse.json({ error: questionsError.message }, { status: 500 })
        }

        // Link questions to test
        if (insertedQuestions && insertedQuestions.length > 0) {
            const testQuestionsToInsert = insertedQuestions.map((q: any, index: number) => ({
                test_id: testId,
                question_id: q.id,
                order_index: index,
            }))

            const { error: linkError } = await supabase
                .from("test_questions")
                .insert(testQuestionsToInsert)

            if (linkError) {
                console.error("[Admin API] Link questions error:", linkError)
                // Questions were created but linking failed, still return success with warning
                return NextResponse.json({
                    success: true,
                    data: insertedQuestions,
                    warning: "Questions created but failed to link to test"
                })
            }
        }

        return NextResponse.json({ success: true, data: insertedQuestions })
    } catch (error: any) {
        console.error("[Admin API] Create questions error:", error)
        return NextResponse.json({ error: error?.message || "Failed to create questions" }, { status: 500 })
    }
}

// Delete a question
export async function DELETE(request: Request) {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const questionId = searchParams.get("id")
        const testQuestionId = searchParams.get("testQuestionId")

        if (!questionId) {
            return NextResponse.json({ error: "Question ID required" }, { status: 400 })
        }

        const supabase = createAdminClient()

        // Delete from test_questions if provided
        if (testQuestionId) {
            await supabase.from("test_questions").delete().eq("id", testQuestionId)
        }

        // Delete the question
        const { error } = await supabase.from("questions").delete().eq("id", questionId)

        if (error) {
            console.error("[Admin API] Delete question error:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("[Admin API] Delete question error:", error)
        return NextResponse.json({ error: error?.message || "Failed to delete question" }, { status: 500 })
    }
}
