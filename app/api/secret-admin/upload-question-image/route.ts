import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

const BUCKET_NAME = "question-images"

export async function POST(request: NextRequest) {
    // Check admin session
    const cookieStore = await cookies()
    const adminSession = cookieStore.get("admin_session")

    // Validate session - the cookie contains a base64-encoded JSON token
    if (!adminSession?.value) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Verify the session is valid and not expired
    try {
        const sessionData = JSON.parse(Buffer.from(adminSession.value, 'base64').toString())
        if (!sessionData.expires || sessionData.expires < Date.now()) {
            return NextResponse.json({ success: false, error: "Session expired" }, { status: 401 })
        }
    } catch {
        return NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 })
    }

    try {
        const { imageData, fileName } = await request.json()

        if (!imageData) {
            return NextResponse.json({ success: false, error: "No image data provided" }, { status: 400 })
        }

        // Check for required environment variables
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseKey) {
            console.error("Missing Supabase configuration")
            return NextResponse.json({
                success: false,
                error: "Storage not configured. Please check Supabase environment variables."
            })
        }

        // Create admin Supabase client for storage operations
        const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
            auth: { persistSession: false }
        })

        // Extract base64 data - handle various formats
        // Matches: data:image/png;base64,... or data:image/jpeg;base64,... etc.
        const base64Match = imageData.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/)
        if (!base64Match) {
            console.error("Invalid image format. Received:", imageData.substring(0, 50))
            return NextResponse.json({
                success: false,
                error: "Invalid image format. Please upload a PNG, JPG, or WebP image."
            }, { status: 400 })
        }

        let imageType = base64Match[1].toLowerCase()
        const base64Data = base64Match[2]

        // Normalize image type
        if (imageType === 'jpeg') imageType = 'jpg'

        // Decode base64
        const buffer = Buffer.from(base64Data, 'base64')

        if (buffer.length === 0) {
            return NextResponse.json({ success: false, error: "Empty image data" }, { status: 400 })
        }

        if (buffer.length > 5 * 1024 * 1024) {
            return NextResponse.json({ success: false, error: "Image too large. Max 5MB." }, { status: 400 })
        }

        // Generate unique filename
        const timestamp = Date.now()
        const randomId = Math.random().toString(36).substring(2, 8)
        const uniqueFileName = fileName || `question_${timestamp}_${randomId}.${imageType}`
        const filePath = `questions/${uniqueFileName}`

        // Try to upload - bucket should already exist, but handle errors gracefully
        let uploadError = null

        // First attempt
        const { data, error } = await supabaseAdmin.storage
            .from(BUCKET_NAME)
            .upload(filePath, buffer, {
                contentType: `image/${imageType === 'jpg' ? 'jpeg' : imageType}`,
                upsert: true
            })

        if (error) {
            console.error("First upload attempt failed:", error.message)

            // If bucket doesn't exist, try to create it
            if (error.message.includes("not found") || error.message.includes("Bucket not found")) {
                console.log("Attempting to create bucket...")
                const { error: createError } = await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
                    public: true,
                    fileSizeLimit: 5242880,
                    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
                })

                if (createError && !createError.message.includes("already exists")) {
                    console.error("Failed to create bucket:", createError)
                    return NextResponse.json({
                        success: false,
                        error: "Storage bucket error: " + createError.message
                    })
                }

                // Retry upload
                const { data: retryData, error: retryError } = await supabaseAdmin.storage
                    .from(BUCKET_NAME)
                    .upload(filePath, buffer, {
                        contentType: `image/${imageType === 'jpg' ? 'jpeg' : imageType}`,
                        upsert: true
                    })

                if (retryError) {
                    uploadError = retryError
                }
            } else {
                uploadError = error
            }
        }

        if (uploadError) {
            console.error("Storage upload error:", uploadError)
            return NextResponse.json({
                success: false,
                error: "Failed to upload: " + uploadError.message
            })
        }

        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath)

        console.log("Image uploaded successfully:", urlData.publicUrl)

        return NextResponse.json({
            success: true,
            url: urlData.publicUrl,
            path: filePath
        })
    } catch (error: any) {
        console.error("Image upload error:", error)
        return NextResponse.json({
            success: false,
            error: "Upload failed: " + (error?.message || "Unknown error")
        })
    }
}
