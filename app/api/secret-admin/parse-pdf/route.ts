import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

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
        const { pdfText, category, difficulty } = await request.json()

        if (!pdfText || pdfText.trim().length === 0) {
            return NextResponse.json({ success: false, error: "No PDF text provided" }, { status: 400 })
        }

        // Use Gemini to parse questions from PDF text
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

        const prompt = `You are an SAT question parser. Extract all multiple-choice questions from the following text.

For each question found, output a JSON object with these exact fields:
- question_text: The full question text
- options: An array of exactly 4 options [A, B, C, D] (just the text, not the letter prefix)
- correct_answer: The letter of the correct answer if identifiable, otherwise "A" as default
- category: "${category || "Math"}"
- difficulty: "${difficulty || "Medium"}"
- question_type: "multiple_choice"

Return ONLY a valid JSON array of question objects. No markdown, no explanation, just the JSON array.
If no questions are found, return an empty array: []

TEXT TO PARSE:
${pdfText}

IMPORTANT: Return ONLY valid JSON array. Example format:
[{"question_text": "What is 2+2?", "options": ["3", "4", "5", "6"], "correct_answer": "B", "category": "Math", "difficulty": "Easy", "question_type": "multiple_choice"}]`

        const result = await model.generateContent(prompt)
        const response = await result.response
        let text = response.text().trim()

        // Clean up response - remove markdown code blocks if present
        if (text.startsWith("```json")) {
            text = text.slice(7)
        }
        if (text.startsWith("```")) {
            text = text.slice(3)
        }
        if (text.endsWith("```")) {
            text = text.slice(0, -3)
        }
        text = text.trim()

        // Parse JSON
        let questions = []
        try {
            questions = JSON.parse(text)
            if (!Array.isArray(questions)) {
                questions = [questions]
            }
        } catch (parseErr) {
            console.error("Failed to parse Gemini response:", text)
            return NextResponse.json({
                success: false,
                error: "Failed to parse questions from PDF. Please try a different format.",
            })
        }

        // Validate and clean up questions
        const validQuestions = questions.filter((q: any) => {
            return (
                q.question_text &&
                q.options &&
                Array.isArray(q.options) &&
                q.options.length >= 4
            )
        }).map((q: any) => ({
            question_text: q.question_text,
            options: q.options.slice(0, 4),
            correct_answer: ["A", "B", "C", "D"].includes(q.correct_answer) ? q.correct_answer : "A",
            category: q.category || category || "Math",
            difficulty: q.difficulty || difficulty || "Medium",
            question_type: "multiple_choice",
        }))

        return NextResponse.json({
            success: true,
            questions: validQuestions,
            totalParsed: validQuestions.length,
        })
    } catch (error) {
        console.error("PDF parsing error:", error)
        return NextResponse.json({
            success: false,
            error: "Failed to parse PDF. Please try again.",
        })
    }
}
