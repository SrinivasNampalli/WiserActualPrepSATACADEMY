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

        // Calculate days until SAT
        const today = new Date()
        const testDate = new Date(satDate)
        const daysUntil = Math.ceil((testDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        const weeksUntil = Math.ceil(daysUntil / 7)

        // Generate dates for the next X days (max 60 days)
        const planDays = Math.min(daysUntil, 60)

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Create a detailed ${planDays}-day SAT study schedule from today.

SAT Date: ${satDate} (${daysUntil} days away)
Focus Areas: ${focusAreas}
Study Hours/Day: ${hoursPerDay || 2}

CRITICAL: Return ONLY valid JSON, no markdown, no backticks.

Generate a day-by-day plan. For each day include:
- A main focus topic
- 2-3 specific tasks
- Estimated minutes per task
- Whether it's a review day, practice day, or new content day

JSON Structure:
{
  "days": [
    {
      "dayNumber": 1,
      "date": "2025-01-20",
      "dayType": "new_content",
      "focus": "Algebra Fundamentals",
      "tasks": [
        {"task": "Review linear equations", "minutes": 30, "category": "math"},
        {"task": "Practice 10 algebra problems", "minutes": 45, "category": "math"},
        {"task": "Watch video on quadratics", "minutes": 25, "category": "math"}
      ]
    }
  ],
  "weeklyGoals": [
    "Week 1: Master basic algebra",
    "Week 2: Focus on reading strategies"
  ],
  "examTips": [
    "Take a practice test every Saturday",
    "Review mistakes the next day"
  ]
}

Generate ${Math.min(planDays, 14)} days of detailed plans. Mix study types: new_content, practice, review, rest_day.`,
        })

        let scheduleData
        try {
            let text = response.text || ""
            text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
            scheduleData = JSON.parse(text)

            // Add actual dates to the days
            const startDate = new Date()
            scheduleData.days = scheduleData.days.map((day: any, index: number) => {
                const dayDate = new Date(startDate)
                dayDate.setDate(dayDate.getDate() + index)
                return {
                    ...day,
                    date: dayDate.toISOString().split("T")[0],
                    dayNumber: index + 1
                }
            })
        } catch (parseError) {
            console.error("Failed to parse schedule JSON:", response.text)
            return NextResponse.json({
                error: "Failed to parse AI response. Please try again.",
                rawResponse: response.text?.substring(0, 500)
            }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            days: scheduleData.days,
            weeklyGoals: scheduleData.weeklyGoals,
            examTips: scheduleData.examTips,
            satDate,
            daysUntil,
            generatedAt: new Date().toISOString()
        })
    } catch (error: any) {
        console.error("[v0] Gemini API error:", error)
        return NextResponse.json({ error: error?.message || "Failed to generate schedule" }, { status: 500 })
    }
}
