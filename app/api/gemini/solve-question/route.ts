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
      config: {
        maxOutputTokens: 300,
      },
      contents: `Solve concisely. Use LaTeX: $x^2$, $\\frac{a}{b}$, $\\sqrt{x}$.

Format:
**Answer:** [letter and short answer]

**Solution:**
1. [brief step]
2. [brief step]

Question: ${question}`,
    })

    return NextResponse.json({ answer: response.text })
  } catch (error: any) {
    console.error("[v0] Gemini API error:", error)
    return NextResponse.json({ error: error?.message || "Failed to solve question" }, { status: 500 })
  }
}
