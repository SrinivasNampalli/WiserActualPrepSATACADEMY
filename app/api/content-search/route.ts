import { NextRequest, NextResponse } from "next/server"

// DuckDuckGo Instant Answer API + Web scraping + Gemini summarization
export async function POST(request: NextRequest) {
    try {
        const { query } = await request.json()

        if (!query || typeof query !== "string") {
            return NextResponse.json({ error: "Query is required" }, { status: 400 })
        }

        const satQuery = `${query} SAT prep`

        // Step 1: Get search results from DuckDuckGo Instant Answer API
        const ddgResponse = await fetch(
            `https://api.duckduckgo.com/?q=${encodeURIComponent(satQuery)}&format=json&no_html=1&skip_disambig=1`
        )
        const ddgData = await ddgResponse.json()

        // Step 2: Also search Wikipedia for educational content
        const wikiResponse = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
        )
        const wikiData = wikiResponse.ok ? await wikiResponse.json() : null

        // Step 3: Compile sources
        const sources: { title: string; snippet: string; url: string; source: string }[] = []

        // Add DuckDuckGo abstract if available
        if (ddgData.Abstract) {
            sources.push({
                title: ddgData.Heading || query,
                snippet: ddgData.Abstract,
                url: ddgData.AbstractURL || "",
                source: "DuckDuckGo",
            })
        }

        // Add related topics from DuckDuckGo
        if (ddgData.RelatedTopics) {
            ddgData.RelatedTopics.slice(0, 5).forEach((topic: any) => {
                if (topic.Text && topic.FirstURL) {
                    sources.push({
                        title: topic.Text.split(" - ")[0] || topic.Text.substring(0, 50),
                        snippet: topic.Text,
                        url: topic.FirstURL,
                        source: "DuckDuckGo",
                    })
                }
            })
        }

        // Add Wikipedia content
        if (wikiData && wikiData.extract) {
            sources.push({
                title: wikiData.title,
                snippet: wikiData.extract,
                url: wikiData.content_urls?.desktop?.page || "",
                source: "Wikipedia",
            })
        }

        // Step 4: Use Gemini to create an AI summary
        const apiKey = process.env.APIKEYFLASHGEMINI
        let aiSummary = null

        if (apiKey && sources.length > 0) {
            const contentForAI = sources.map((s) => s.snippet).join("\n\n")

            try {
                const geminiResponse = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: [
                                {
                                    parts: [
                                        {
                                            text: `You are an SAT tutor helping a student understand: "${query}"

Based on this information:
${contentForAI}

Provide a clear, helpful explanation for an SAT student. Include:
1. A simple explanation of the concept (2-3 sentences)
2. Why it's important for the SAT (1-2 sentences)
3. A quick tip or example if relevant

Keep it concise and student-friendly. Use bullet points where helpful.`,
                                        },
                                    ],
                                },
                            ],
                            generationConfig: {
                                temperature: 0.7,
                                maxOutputTokens: 500,
                            },
                        }),
                    }
                )

                if (geminiResponse.ok) {
                    const geminiData = await geminiResponse.json()
                    aiSummary = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || null
                } else {
                    console.error("Gemini API error:", await geminiResponse.text())
                }
            } catch (geminiError) {
                console.error("Gemini fetch error:", geminiError)
            }
        }

        // Step 5: Generate related search suggestions
        const relatedSearches = [
            `${query} practice problems`,
            `${query} examples`,
            `${query} tips`,
            `${query} common mistakes`,
        ]

        return NextResponse.json({
            query,
            aiSummary,
            sources,
            relatedSearches,
            totalResults: sources.length,
        })
    } catch (error) {
        console.error("Search error:", error)
        return NextResponse.json({ error: "Failed to search content" }, { status: 500 })
    }
}
