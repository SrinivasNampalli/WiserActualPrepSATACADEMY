import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { SecretAdminDashboard } from "@/components/admin/secret-admin-dashboard"

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

        // Check if session is expired
        if (session.expires < Date.now()) {
            return false
        }

        return true
    } catch {
        return false
    }
}

export default async function SecretAdminDashboardPage() {
    const isAuthenticated = await verifyAdminSession()

    if (!isAuthenticated) {
        redirect("/secret-admin")
    }

    // Fetch data for admin dashboard
    const supabase = createAdminClient()

    // Fetch all tests
    const { data: tests } = await supabase
        .from("tests")
        .select("*")
        .order("created_at", { ascending: false })

    // Fetch all users with their profiles
    const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })

    // Fetch questions
    const { data: questions } = await supabase
        .from("questions")
        .select("*")
        .order("created_at", { ascending: false })

    // Fetch quizzes
    const { data: quizzes } = await supabase
        .from("quizzes")
        .select("*, quiz_questions(count)")
        .order("created_at", { ascending: false })

    return (
        <SecretAdminDashboard
            tests={tests || []}
            users={profiles || []}
            questions={questions || []}
            quizzes={quizzes || []}
        />
    )
}
