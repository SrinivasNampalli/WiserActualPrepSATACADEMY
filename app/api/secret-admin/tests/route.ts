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

// Get all tests or questions for a specific test
export async function GET(request: Request) {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const testId = searchParams.get("testId")

        const supabase = createAdminClient()

        if (testId) {
            // Fetch questions for a specific test
            const { data, error } = await supabase
                .from("test_questions")
                .select("*, questions(*)")
                .eq("test_id", testId)
                .order("order_index")

            if (error) {
                console.error("[Admin API] Fetch test questions error:", error)
                return NextResponse.json({ error: error.message }, { status: 500 })
            }

            return NextResponse.json({ success: true, data })
        } else {
            // Fetch all tests
            const { data, error } = await supabase
                .from("tests")
                .select("*")
                .order("created_at", { ascending: false })

            if (error) {
                console.error("[Admin API] Fetch tests error:", error)
                return NextResponse.json({ error: error.message }, { status: 500 })
            }

            return NextResponse.json({ success: true, data })
        }
    } catch (error: any) {
        console.error("[Admin API] GET error:", error)
        return NextResponse.json({ error: error?.message || "Failed to fetch" }, { status: 500 })
    }
}

// Create a test
export async function POST(request: Request) {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { title, test_type, total_questions, duration_minutes } = body

        const supabase = createAdminClient()

        // Fetch the first user from profiles to use as test owner
        // This is needed because tests table has a foreign key constraint on user_id
        const { data: firstUser } = await supabase
            .from("profiles")
            .select("id")
            .limit(1)
            .single()

        if (!firstUser) {
            return NextResponse.json({ error: "No users found in database. Please create a user first." }, { status: 400 })
        }

        const { data, error } = await supabase
            .from("tests")
            .insert({
                title,
                test_type,
                total_questions,
                duration_minutes,
                user_id: firstUser.id,
            })
            .select()
            .single()

        if (error) {
            console.error("[Admin API] Create test error:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, data })
    } catch (error: any) {
        console.error("[Admin API] Create test error:", error)
        return NextResponse.json({ error: error?.message || "Failed to create test" }, { status: 500 })
    }
}

// Delete a test or all tests
export async function DELETE(request: Request) {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const testId = searchParams.get("id")
        const deleteAll = searchParams.get("all") === "true"

        const supabase = createAdminClient()

        if (deleteAll) {
            // Delete ALL tests and their questions
            console.log("[Admin API] Deleting all tests...")

            // First delete all test_questions
            const { error: tqError } = await supabase.from("test_questions").delete().neq("id", "00000000-0000-0000-0000-000000000000")
            if (tqError) {
                console.error("[Admin API] Delete all test_questions error:", tqError)
            }

            // Delete all orphaned questions too
            const { error: qError } = await supabase.from("questions").delete().neq("id", "00000000-0000-0000-0000-000000000000")
            if (qError) {
                console.error("[Admin API] Delete all questions error:", qError)
            }

            // Then delete all tests
            const { error } = await supabase.from("tests").delete().neq("id", "00000000-0000-0000-0000-000000000000")

            if (error) {
                console.error("[Admin API] Delete all tests error:", error)
                return NextResponse.json({ error: error.message }, { status: 500 })
            }

            return NextResponse.json({ success: true, message: "All tests deleted" })
        }

        if (!testId) {
            return NextResponse.json({ error: "Test ID required" }, { status: 400 })
        }

        // Delete associated test_questions first
        await supabase.from("test_questions").delete().eq("test_id", testId)

        // Delete the test
        const { error } = await supabase.from("tests").delete().eq("id", testId)

        if (error) {
            console.error("[Admin API] Delete test error:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("[Admin API] Delete test error:", error)
        return NextResponse.json({ error: error?.message || "Failed to delete test" }, { status: 500 })
    }
}

