import { GoogleGenAI } from "@google/genai"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { topic, courseLevel, numCards } = await request.json()

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 })
    }

    const apiKey = process.env.APIKEYFLASHGEMINI

    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 })
    }

    const ai = new GoogleGenAI({ apiKey })

    const cardCount = numCards || 10
    const level = courseLevel || "AP"

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate ${cardCount} ${level} level flashcards about: ${topic}

Make them college-level appropriate. Format each card exactly as:

Q: [Clear, specific question]
A: [Concise, accurate answer]

---

Separate each card with exactly --- on a new line.`,
    })

    // Parse the response into structured flashcards
    const text = response.text
    const cards = text
      .split("---")
      .map((card) => {
        const lines = card.trim().split("\n")
        const question = lines
          .find((l) => l.startsWith("Q:"))
          ?.replace("Q:", "")
          .trim()
        const answer = lines
          .find((l) => l.startsWith("A:"))
          ?.replace("A:", "")
          .trim()
        return question && answer ? { question, answer } : null
      })
      .filter((card) => card !== null)

    return NextResponse.json({ flashcards: cards, topic, courseLevel: level })
  } catch (error: any) {
    console.error("[v0] Gemini API error:", error)
    return NextResponse.json({ error: error?.message || "Failed to generate flashcards" }, { status: 500 })
  }
}
