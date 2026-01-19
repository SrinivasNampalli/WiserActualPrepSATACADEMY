"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    User,
    LogOut,
    Sparkles,
    BookOpen,
    FileText,
    Clock,
    Trash2,
    ChevronDown,
    ChevronUp,
    ArrowLeft,
    Trophy,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface ProfileContentProps {
    user: any
    profile: any
    flashcardSets: any[]
    summarizerHistory: any[]
    testResults: any[]
}

export function ProfileContent({
    user,
    profile,
    flashcardSets: initialFlashcardSets,
    summarizerHistory: initialSummarizerHistory,
    testResults,
}: ProfileContentProps) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("flashcards")
    const [flashcardSets, setFlashcardSets] = useState(initialFlashcardSets)
    const [summarizerHistory, setSummarizerHistory] = useState(initialSummarizerHistory)
    const [expandedSummary, setExpandedSummary] = useState<string | null>(null)

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push("/")
    }

    const deleteFlashcardSet = async (setId: string) => {
        const supabase = createClient()

        // Delete flashcards first (foreign key constraint)
        await supabase.from("flashcards").delete().eq("set_id", setId)

        // Then delete the set
        const { error } = await supabase.from("flashcard_sets").delete().eq("id", setId)

        if (!error) {
            setFlashcardSets(flashcardSets.filter((set) => set.id !== setId))
        }
    }

    const deleteSummary = async (summaryId: string) => {
        const supabase = createClient()
        const { error } = await supabase.from("summarizer_history").delete().eq("id", summaryId)

        if (!error) {
            setSummarizerHistory(summarizerHistory.filter((item) => item.id !== summaryId))
        }
    }

    // Stats calculations
    const totalFlashcards = flashcardSets.reduce((acc, set) => {
        const count = set.flashcards?.[0]?.count || 0
        return acc + count
    }, 0)
    const totalSummaries = summarizerHistory.length
    const totalTests = testResults.length
    const avgScore = testResults.length > 0
        ? Math.round(testResults.reduce((acc, r) => acc + (r.score || 0), 0) / testResults.length)
        : 0

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef]">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" onClick={handleLogout}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Profile Header */}
                <Card className="mb-8">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-6">
                            <div className="h-20 w-20 rounded-full bg-theme flex items-center justify-center">
                                <User className="h-10 w-10 text-white" />
                            </div>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-[#1B4B6B]">
                                    {profile?.full_name || "Student"}
                                </h1>
                                <p className="text-gray-600">{user.email}</p>
                                <div className="flex gap-2 mt-2">
                                    {profile?.is_admin && (
                                        <Badge className="bg-purple-100 text-purple-700">Admin</Badge>
                                    )}
                                    <Badge className="bg-[#4ECDC4]/20 text-[#1B4B6B]">
                                        Member since {new Date(user.created_at).toLocaleDateString()}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <Sparkles className="h-8 w-8 mx-auto mb-2 text-theme" />
                            <p className="text-3xl font-bold text-[#1B4B6B]">{totalFlashcards}</p>
                            <p className="text-sm text-gray-600">Flashcards Created</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <FileText className="h-8 w-8 mx-auto mb-2 text-theme" />
                            <p className="text-3xl font-bold text-[#1B4B6B]">{totalSummaries}</p>
                            <p className="text-sm text-gray-600">AI Summaries</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <BookOpen className="h-8 w-8 mx-auto mb-2 text-theme" />
                            <p className="text-3xl font-bold text-[#1B4B6B]">{totalTests}</p>
                            <p className="text-sm text-gray-600">Tests Taken</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <Trophy className="h-8 w-8 mx-auto mb-2 text-theme" />
                            <p className="text-3xl font-bold text-[#1B4B6B]">{avgScore}%</p>
                            <p className="text-sm text-gray-600">Avg. Score</p>
                        </CardContent>
                    </Card>
                </div>

                {/* AI History Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="flashcards">
                            <Sparkles className="h-4 w-4 mr-2" />
                            Flashcard Sets ({flashcardSets.length})
                        </TabsTrigger>
                        <TabsTrigger value="summaries">
                            <FileText className="h-4 w-4 mr-2" />
                            Summaries ({summarizerHistory.length})
                        </TabsTrigger>
                        <TabsTrigger value="tests">
                            <BookOpen className="h-4 w-4 mr-2" />
                            Test Results ({testResults.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* Flashcard Sets Tab */}
                    <TabsContent value="flashcards" className="space-y-4">
                        {flashcardSets.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center text-gray-500">
                                    <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No flashcard sets yet.</p>
                                    <Button
                                        className="mt-4 bg-theme-base hover:bg-theme-dark text-white"
                                        onClick={() => router.push("/dashboard")}
                                    >
                                        Create Your First Set
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            flashcardSets.map((set) => (
                                <Card key={set.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg">{set.title || set.topic}</CardTitle>
                                                <CardDescription className="flex items-center gap-2 mt-1">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(set.created_at).toLocaleDateString()}
                                                    <Badge variant="outline" className="ml-2">
                                                        {set.course_level}
                                                    </Badge>
                                                </CardDescription>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-theme-base/20 text-theme-dark">
                                                    {set.flashcards?.[0]?.count || 0} cards
                                                </Badge>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => deleteFlashcardSet(set.id)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                </Card>
                            ))
                        )}
                    </TabsContent>

                    {/* Summaries Tab */}
                    <TabsContent value="summaries" className="space-y-4">
                        {summarizerHistory.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center text-gray-500">
                                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No summaries yet.</p>
                                    <Button
                                        className="mt-4 bg-theme-base hover:bg-theme-dark text-white"
                                        onClick={() => router.push("/dashboard")}
                                    >
                                        Create Your First Summary
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            summarizerHistory.map((item) => (
                                <Card key={item.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <CardDescription className="flex items-center gap-2">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(item.created_at).toLocaleDateString()}
                                                    {item.content_source && (
                                                        <a
                                                            href={item.content_source}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-theme hover:underline truncate max-w-xs"
                                                        >
                                                            {item.content_source}
                                                        </a>
                                                    )}
                                                </CardDescription>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        setExpandedSummary(expandedSummary === item.id ? null : item.id)
                                                    }
                                                >
                                                    {expandedSummary === item.id ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => deleteSummary(item.id)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-sm text-gray-600 line-clamp-2 mb-2">
                                            <strong>Original:</strong> {item.original_text}
                                        </div>
                                        {expandedSummary === item.id && (
                                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                                <strong className="text-[#1B4B6B]">AI Summary:</strong>
                                                <p className="mt-2 text-gray-700 whitespace-pre-wrap">
                                                    {item.summarized_text}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </TabsContent>

                    {/* Test Results Tab */}
                    <TabsContent value="tests" className="space-y-4">
                        {testResults.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center text-gray-500">
                                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No test results yet.</p>
                                    <Button
                                        className="mt-4 bg-theme-base hover:bg-theme-dark text-white"
                                        onClick={() => router.push("/dashboard")}
                                    >
                                        Take Your First Test
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            testResults.map((result) => (
                                <Card key={result.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg">
                                                    {result.tests?.title || "Practice Test"}
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-2 mt-1">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(result.completed_at).toLocaleDateString()}
                                                </CardDescription>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    className={
                                                        result.score >= 80
                                                            ? "bg-green-100 text-green-700"
                                                            : result.score >= 60
                                                                ? "bg-yellow-100 text-yellow-700"
                                                                : "bg-red-100 text-red-700"
                                                    }
                                                >
                                                    {result.score}%
                                                </Badge>
                                                <Badge variant="outline">
                                                    {result.correct_answers}/{result.total_questions} correct
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardHeader>
                                </Card>
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
