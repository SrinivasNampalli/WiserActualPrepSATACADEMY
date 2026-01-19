import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.APIKEYFLASHGEMINI || '')

interface ParsedQuestion {
    question_text: string
    options: string[]
    correct_answer: string
    category: string
    difficulty: string
}

export async function POST(request: NextRequest) {
    try {
        const { imageData, category, difficulty } = await request.json()

        if (!imageData) {
            return NextResponse.json({ success: false, error: 'No image data provided' }, { status: 400 })
        }

        // Remove data URL prefix if present
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '')

        // Use Gemini Vision to parse the image
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

        const prompt = `You are an SAT question parser. Analyze this image and extract ALL multiple choice questions you can find.

For EACH question found, extract:
1. The full question text
2. All answer options (A, B, C, D)
3. If visible, identify which answer is marked as correct. If not visible, guess the most likely correct answer based on the content.

IMPORTANT: 
- Return ONLY valid JSON, no markdown or explanations
- Extract ALL questions visible in the image
- If there are multiple questions, return an array

Return this exact JSON format:
{
  "questions": [
    {
      "question_text": "The full question text here",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "correct_answer": "A"
    }
  ]
}

If you cannot parse any questions, return: {"questions": [], "error": "Could not parse questions from image"}`

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: 'image/png',
                    data: base64Data
                }
            }
        ])

        const response = await result.response
        const text = response.text()

        // Try to parse JSON from response
        let parsedData
        try {
            // Clean up response - remove markdown code blocks if present
            const cleanedText = text
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim()

            parsedData = JSON.parse(cleanedText)
        } catch (parseError) {
            console.error('JSON parse error:', parseError)
            console.error('Raw response:', text)
            return NextResponse.json({
                success: false,
                error: 'Failed to parse AI response',
                rawResponse: text.substring(0, 500)
            }, { status: 500 })
        }

        if (parsedData.error) {
            return NextResponse.json({
                success: false,
                error: parsedData.error
            }, { status: 400 })
        }

        // Add category and difficulty to each question
        const questionsWithMeta: ParsedQuestion[] = (parsedData.questions || []).map((q: any) => ({
            question_text: q.question_text || '',
            options: q.options || [],
            correct_answer: q.correct_answer || 'A',
            category: category || 'Math',
            difficulty: difficulty || 'Medium'
        }))

        return NextResponse.json({
            success: true,
            questions: questionsWithMeta,
            count: questionsWithMeta.length
        })

    } catch (error) {
        console.error('Image parsing error:', error)
        return NextResponse.json({
            success: false,
            error: 'Failed to parse image'
        }, { status: 500 })
    }
}
