"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, BookOpen } from "lucide-react"
import { AISummarizer } from "./ai-summarizer"
import { FlashcardGenerator } from "./flashcard-generator"

interface AIToolsCombinedProps {
    summarizerHistory: any[]
    userId: string
}

type ActiveTool = "summarizer" | "flashcards"

export function AIToolsCombined({ summarizerHistory, userId }: AIToolsCombinedProps) {
    const [activeTool, setActiveTool] = useState<ActiveTool>("summarizer")

    return (
        <div className="space-y-6">
            {/* Tool Selector */}
            <Card className="bg-gradient-to-br from-[#1B4B6B] to-[#2d6a8f] text-white">
                <CardHeader className="pb-4">
                    <CardTitle className="text-2xl">AI Study Tools</CardTitle>
                    <CardDescription className="text-white/80">
                        Powered by AI to help you study smarter
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-3">
                        <Button
                            variant={activeTool === "summarizer" ? "default" : "outline"}
                            className={`flex-1 h-16 text-lg ${activeTool === "summarizer"
                                    ? "bg-white text-[#1B4B6B] hover:bg-gray-100"
                                    : "bg-transparent border-white/30 text-white hover:bg-white/10"
                                }`}
                            onClick={() => setActiveTool("summarizer")}
                        >
                            <Sparkles className="mr-2 h-5 w-5" />
                            AI Summarizer
                        </Button>
                        <Button
                            variant={activeTool === "flashcards" ? "default" : "outline"}
                            className={`flex-1 h-16 text-lg ${activeTool === "flashcards"
                                    ? "bg-white text-[#1B4B6B] hover:bg-gray-100"
                                    : "bg-transparent border-white/30 text-white hover:bg-white/10"
                                }`}
                            onClick={() => setActiveTool("flashcards")}
                        >
                            <BookOpen className="mr-2 h-5 w-5" />
                            Flashcard Generator
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Active Tool Content */}
            <div className="animate-in fade-in duration-300">
                {activeTool === "summarizer" ? (
                    <AISummarizer summarizerHistory={summarizerHistory} userId={userId} />
                ) : (
                    <FlashcardGenerator userId={userId} />
                )}
            </div>
        </div>
    )
}
