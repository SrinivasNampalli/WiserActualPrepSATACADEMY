import { GoogleGenAI } from "@google/genai"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    const apiKey = process.env.APIKEYFLASHGEMINI

    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 })
    }

    const ai = new GoogleGenAI({ apiKey })

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Summarize this content concisely for SAT prep. Maximum 150 words.

${text}

Format rules:
- Use **bold** for key terms
- Use bullet points (•) for main ideas
- Keep it scannable and study-friendly
- No more than 5 bullet points`,
    })

    return NextResponse.json({ summary: response.text })
  } catch (error: any) {
    console.error("[v0] Gemini API error:", error)
    return NextResponse.json({ error: error?.message || "Failed to generate summary" }, { status: 500 })
  }
}
