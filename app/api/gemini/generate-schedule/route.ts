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
      contents: `You are an elite SAT tutor and former Admissions Officer at a top university. Your mission is to create a strategic, comprehensive study schedule to help this student achieve a PERFECT 1600 score.

STUDENT CONTEXT:
- SAT Date: ${satDate} (${daysUntil} days away, ${weeksUntil} weeks)
- Daily Study Time: ${hoursPerDay} hours
- Focus Areas: ${focusAreas}

YOUR APPROACH AS AN AO:
1. Think strategically - what topics yield the most points?
2. Build from foundations to advanced topics progressively
3. Include regular practice tests and review sessions
4. Balance between all sections to maximize overall score
5. Include rest days to prevent burnout
6. Focus on high-frequency question types first

REAL SAT TOPIC NAMES TO USE (use these exact names):

MATH - Heart of Algebra:
- Linear Equations & Inequalities (foundational - start here)
- Systems of Linear Equations
- Linear Functions & Graphs

MATH - Problem Solving & Data Analysis:
- Ratios, Rates & Proportions
- Percentages & Percent Change  
- Statistics & Data Interpretation
- Scatterplots & Line of Best Fit
- Probability & Counting

MATH - Passport to Advanced Math:
- Quadratic Equations (high priority)
- Polynomial Operations
- Exponential Functions & Growth/Decay
- Function Notation & Transformations

MATH - Additional Topics:
- Circle Equations & Properties
- Right Triangle Trigonometry
- Coordinate Geometry

READING:
- Central Ideas & Themes (start here)
- Command of Evidence
- Words in Context
- Text Structure & Purpose
- Paired Passages & Synthesis

WRITING:
- Sentence Structure (foundational)
- Punctuation Rules (high frequency!)
- Subject-Verb Agreement
- Effective Transitions
- Conciseness & Wordiness

SCHEDULE PHILOSOPHY:
- Week 1-2: Foundation building - cover basics in all areas
- Week 3-4: Skill development - intermediate topics + practice
- Week 5+: Advanced topics + full practice tests + review weak areas
- Final week: Light review, confidence building, rest

CRITICAL: Return ONLY valid JSON, no markdown, no backticks.

Generate a ${Math.min(planDays, 21)}-day detailed study plan following this exact JSON structure:
{
  "days": [
    {
      "dayNumber": 1,
      "date": "2025-01-20",
      "dayType": "new_content",
      "focus": "Linear Equations & Inequalities",
      "tasks": [
        {"task": "Learn solving single-variable linear equations", "minutes": 30, "category": "math"},
        {"task": "Practice 15 linear equation problems", "minutes": 45, "category": "math"},
        {"task": "Review common mistakes and edge cases", "minutes": 25, "category": "math"}
      ]
    }
  ],
  "weeklyGoals": [
    "Week 1: Master Heart of Algebra and Reading Central Ideas",
    "Week 2: Tackle Problem Solving & Data Analysis, begin Writing conventions",
    "Week 3: Practice tests and advanced topics"
  ],
  "examTips": [
    "Take a full timed practice test every Saturday",
    "Review ALL wrong answers the next day - understand WHY you missed each one",
    "For Reading, always read the blurb and predict the main idea",
    "For Writing, trust your ear but verify with grammar rules",
    "Math: eliminate 2 wrong answers first, then decide between remaining"
  ]
}

Mix study types appropriately: new_content, practice, review, rest_day (every 6-7 days).
Use SPECIFIC task descriptions with real SAT topic names.
Tasks should match the declared hours per day.`,
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

