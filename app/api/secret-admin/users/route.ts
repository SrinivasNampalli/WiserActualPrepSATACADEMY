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

// Delete a user
export async function DELETE(request: Request) {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get("id")

        if (!userId) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 })
        }

        const supabase = createAdminClient()

        // Delete user's related data first
        // Delete test results
        await supabase.from("test_results").delete().eq("user_id", userId)

        // Delete summarizer history
        await supabase.from("summarizer_history").delete().eq("user_id", userId)

        // Delete flashcard sets (cascade will delete flashcards)
        await supabase.from("flashcard_sets").delete().eq("user_id", userId)

        // Delete course progress
        await supabase.from("course_progress").delete().eq("user_id", userId)

        // Delete profile
        const { error: profileError } = await supabase
            .from("profiles")
            .delete()
            .eq("id", userId)

        if (profileError) {
            console.error("[Admin API] Delete profile error:", profileError)
            return NextResponse.json({ error: profileError.message }, { status: 500 })
        }

        // Note: We cannot delete from auth.users directly without Supabase admin API
        // The profile deletion is the main action - auth user will be orphaned but can be cleaned up later

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("[Admin API] Delete user error:", error)
        return NextResponse.json({ error: error?.message || "Failed to delete user" }, { status: 500 })
    }
}
