import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TestResultsContent } from "./results-content"

interface TestResultsPageProps {
    params: Promise<{ id: string }>
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

    // Fetch the test result
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

    return (
        <TestResultsContent
            result={result}
            testTitle={result.tests?.title || "Practice Test"}
        />
    )
}
