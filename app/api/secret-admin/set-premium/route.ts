import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

// POST /api/secret-admin/set-premium
// Body: { email: string, isPremium: boolean }
export async function POST(request: Request) {
    try {
        const { email, isPremium = true } = await request.json()

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 })
        }

        const supabase = createAdminClient()

        // Find user by email
        const { data: users, error: userError } = await supabase.auth.admin.listUsers()

        if (userError) {
            console.error("Error listing users:", userError)
            return NextResponse.json({ error: "Failed to list users" }, { status: 500 })
        }

        const user = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase())

        if (!user) {
            return NextResponse.json({ error: `User with email ${email} not found` }, { status: 404 })
        }

        // Update the profile's subscription tier
        const { error: updateError } = await supabase
            .from("profiles")
            .update({
                subscription_tier: isPremium ? "premium" : "free",
                subscription_expires_at: isPremium ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null // 1 year from now
            })
            .eq("id", user.id)

        if (updateError) {
            console.error("Error updating profile:", updateError)
            return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: `User ${email} has been set to ${isPremium ? "premium" : "free"}`,
            userId: user.id,
            tier: isPremium ? "premium" : "free"
        })
    } catch (error: any) {
        console.error("[set-premium] Error:", error)
        return NextResponse.json({ error: error?.message || "Failed to set premium status" }, { status: 500 })
    }
}

// GET - Get premium status for a user
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const email = searchParams.get("email")

        if (!email) {
            return NextResponse.json({ error: "Email query parameter required" }, { status: 400 })
        }

        const supabase = createAdminClient()

        // Find user by email
        const { data: users, error: userError } = await supabase.auth.admin.listUsers()

        if (userError) {
            return NextResponse.json({ error: "Failed to list users" }, { status: 500 })
        }

        const user = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase())

        if (!user) {
            return NextResponse.json({ error: `User with email ${email} not found` }, { status: 404 })
        }

        // Get profile
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("subscription_tier, is_premium, subscription_expires_at")
            .eq("id", user.id)
            .single()

        if (profileError) {
            return NextResponse.json({ error: "Failed to get profile" }, { status: 500 })
        }

        return NextResponse.json({
            email,
            userId: user.id,
            subscription_tier: profile?.subscription_tier || "free",
            is_premium: profile?.is_premium || false,
            subscription_expires_at: profile?.subscription_expires_at
        })
    } catch (error: any) {
        console.error("[set-premium] Error:", error)
        return NextResponse.json({ error: error?.message || "Failed to get status" }, { status: 500 })
    }
}
