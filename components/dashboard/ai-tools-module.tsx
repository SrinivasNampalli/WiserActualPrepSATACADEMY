"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, BookOpen, ChevronDown, ChevronUp } from "lucide-react"
import { AISummarizer } from "./ai-summarizer"
import { FlashcardGenerator } from "./flashcard-generator"

interface AIToolsModuleProps {
    summarizerHistory: any[]
    userId: string
}

export function AIToolsModule({ summarizerHistory, userId }: AIToolsModuleProps) {
    const [expandedSection, setExpandedSection] = useState<"summarizer" | "flashcards" | null>(null)

    const toggleSection = (section: "summarizer" | "flashcards") => {
        setExpandedSection(expandedSection === section ? null : section)
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-theme" />
                    AI Tools
                </h2>
                <p className="text-gray-600 mt-1">Powerful AI-powered study tools to boost your SAT prep</p>
            </div>

            {/* AI Summarizer Section */}
            <Card className={`border-2 transition-all ${expandedSection === "summarizer" ? "border-theme-base shadow-lg" : "border-gray-200 hover:border-gray-300"}`}>
                <CardHeader
                    className="cursor-pointer select-none"
                    onClick={() => toggleSection("summarizer")}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                                <Sparkles className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">AI Summarizer</CardTitle>
                                <CardDescription>Summarize notes, textbooks, or any study material instantly</CardDescription>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-10 w-10">
                            {expandedSection === "summarizer" ? (
                                <ChevronUp className="h-5 w-5" />
                            ) : (
                                <ChevronDown className="h-5 w-5" />
                            )}
                        </Button>
                    </div>
                </CardHeader>
                {expandedSection === "summarizer" && (
                    <CardContent className="pt-0 border-t">
                        <div className="pt-4">
                            <AISummarizer summarizerHistory={summarizerHistory} userId={userId} />
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Flashcard Generator Section */}
            <Card className={`border-2 transition-all ${expandedSection === "flashcards" ? "border-theme-base shadow-lg" : "border-gray-200 hover:border-gray-300"}`}>
                <CardHeader
                    className="cursor-pointer select-none"
                    onClick={() => toggleSection("flashcards")}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Flashcard Generator</CardTitle>
                                <CardDescription>Create AI-powered flashcards for any topic</CardDescription>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-10 w-10">
                            {expandedSection === "flashcards" ? (
                                <ChevronUp className="h-5 w-5" />
                            ) : (
                                <ChevronDown className="h-5 w-5" />
                            )}
                        </Button>
                    </div>
                </CardHeader>
                {expandedSection === "flashcards" && (
                    <CardContent className="pt-0 border-t">
                        <div className="pt-4">
                            <FlashcardGenerator userId={userId} />
                        </div>
                    </CardContent>
                )}
            </Card>
        </div>
    )
}
