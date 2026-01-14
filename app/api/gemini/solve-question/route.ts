import { GoogleGenAI } from "@google/genai"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { question } = await request.json()

    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 })
    }

    const apiKey = process.env.APIKEYFLASHGEMINI

    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 })
    }

    const ai = new GoogleGenAI({ apiKey })

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an SAT tutor. Solve this problem clearly and concisely.

Format your response as:
ANSWER: [final answer]

STEPS:
1. [step 1]
2. [step 2]
3. [step 3]

CONCEPT: [key concept in one sentence]

Question: ${question}`,
    })

    return NextResponse.json({ answer: response.text })
  } catch (error: any) {
    console.error("[v0] Gemini API error:", error)
    return NextResponse.json({ error: error?.message || "Failed to solve question" }, { status: 500 })
  }
}
