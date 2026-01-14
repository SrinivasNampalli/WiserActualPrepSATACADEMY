import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json()

        const adminUsername = process.env.ADMIN_USERNAME
        const adminPassword = process.env.ADMIN_PASSWORD

        if (!adminUsername || !adminPassword) {
            return NextResponse.json(
                { error: "Admin credentials not configured" },
                { status: 500 }
            )
        }

        if (username !== adminUsername || password !== adminPassword) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            )
        }

        // Create a simple session token (in production, use a proper JWT)
        const sessionToken = Buffer.from(
            JSON.stringify({
                username,
                timestamp: Date.now(),
                expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
            })
        ).toString("base64")

        // Set HTTP-only cookie
        const cookieStore = await cookies()
        cookieStore.set("admin_session", sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60, // 24 hours
            path: "/",
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("[Secret Admin] Login error:", error)
        return NextResponse.json(
            { error: error?.message || "Login failed" },
            { status: 500 }
        )
    }
}
