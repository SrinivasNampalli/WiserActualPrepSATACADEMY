import { GoogleGenAI } from "@google/genai"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        const { satDate, focusAreas, hoursPerDay, userId } = await request.json()

        if (!satDate || !focusAreas) {
            return NextResponse.json({ error: "SAT date and focus areas are required" }, { status: 400 })
        }

        const apiKey = process.env.APIKEYFLASHGEMINI

        if (!apiKey) {
            return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 })
        }

        const ai = new GoogleGenAI({ apiKey })

        // Calculate weeks until SAT
        const today = new Date()
        const testDate = new Date(satDate)
        const weeksUntil = Math.ceil((testDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 7))

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Create a concise ${weeksUntil}-week SAT study schedule.

SAT Date: ${satDate}
Focus Areas: ${focusAreas}
Hours per day: ${hoursPerDay || 2}

Return ONLY a JSON object with this exact structure (no markdown, no backticks):
{
  "schedule": [
    {
      "week": 1,
      "focus": "Topic name",
      "tasks": ["Task 1", "Task 2", "Task 3"],
      "keyDates": ["Mon: Math", "Wed: Reading"]
    }
  ],
  "tips": ["Tip 1", "Tip 2"]
}

Keep each week's tasks to 3-4 items max. Keep tips to 2-3 items.`,
        })

        let scheduleData
        try {
            // Clean the response text and parse JSON
            let text = response.text || ""
            // Remove any markdown code blocks if present
            text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
            scheduleData = JSON.parse(text)
        } catch (parseError) {
            console.error("Failed to parse schedule JSON:", response.text)
            return NextResponse.json({
                error: "Failed to parse AI response",
                rawResponse: response.text
            }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            schedule: scheduleData.schedule,
            tips: scheduleData.tips,
            satDate,
            weeksUntil
        })
    } catch (error: any) {
        console.error("[v0] Gemini API error:", error)
        return NextResponse.json({ error: error?.message || "Failed to generate schedule" }, { status: 500 })
    }
}
