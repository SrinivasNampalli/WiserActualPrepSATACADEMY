import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { TestRunner } from "@/components/test-runner"

export default async function TestPage({ params }: { params: Promise<{ id: string }> }) {
    // In Next.js 15+, params is a Promise that must be awaited
    const resolvedParams = await params
    const testId = resolvedParams.id

    // Use regular client for auth check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    // Use admin client to bypass RLS for fetching test data
    const adminSupabase = createAdminClient()

    console.log("TestPage: Looking for test with ID:", testId)

    // Fetch test details
    const { data: test, error: testError } = await adminSupabase
        .from("tests")
        .select("*")
        .eq("id", testId)
        .single()

    console.log("TestPage: Fetch result - test:", test, "error:", testError)

    if (testError || !test) {
        console.error("TestPage: Test not found or error. ID:", testId, "Error:", testError)
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900">
                <h1 className="text-2xl font-bold mb-4 text-white">Test not found</h1>
                <p className="text-slate-400">The test you are looking for does not exist or has been removed.</p>
                <p className="text-slate-500 mt-4 text-sm">Test ID: {testId}</p>
                {testError && <p className="text-red-400 mt-2 text-sm">Error: {testError.message}</p>}
            </div>
        )
    }

    // Fetch questions linked to the test using admin client
    const { data: testQuestions, error: questionsError } = await adminSupabase
        .from("test_questions")
        .select(`
            *,
            questions (*)
        `)
        .eq("test_id", testId)
        .order("order_index")

    if (questionsError) {
        console.error("Error fetching questions:", questionsError)
    }

    // Flatten the structure
    const questions = (testQuestions || []).map((tq: any) => tq.questions).filter(Boolean)

    return (
        <div className="min-h-screen bg-slate-900">
            <TestRunner
                test={test}
                questions={questions}
                userId={user.id}
            />
        </div>
    )
}
