"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    TrendingUp,
    Clock,
    Target,
    Sparkles,
    ChevronRight,
    FileText,
    X,
    BookOpen,
    CheckCircle,
    Plus,
    Trash2,
    CalendarDays,
    ListTodo
} from "lucide-react"

interface HomeModuleProps {
    testResults: any[]
    summarizerHistory: any[]
    savedFlashcards?: any[]
    userId: string
}

interface DayPlan {
    dayNumber: number
    date: string
    dayType: string
    focus: string
    tasks: { task: string; minutes: number; category: string; completed?: boolean }[]
}

// SAT Test Dates 2025-2026
const SAT_DATES = [
    { date: new Date("2025-03-08"), label: "March 8, 2025" },
    { date: new Date("2025-05-03"), label: "May 3, 2025" },
    { date: new Date("2025-06-07"), label: "June 7, 2025" },
    { date: new Date("2025-08-23"), label: "August 23, 2025" },
    { date: new Date("2025-10-04"), label: "October 4, 2025" },
    { date: new Date("2025-11-01"), label: "November 1, 2025" },
    { date: new Date("2025-12-06"), label: "December 6, 2025" },
    { date: new Date("2026-03-14"), label: "March 14, 2026" },
    { date: new Date("2026-05-02"), label: "May 2, 2026" },
    { date: new Date("2026-06-06"), label: "June 6, 2026" },
]

const DAY_TYPE_COLORS: Record<string, string> = {
    new_content: "bg-blue-500",
    practice: "bg-green-500",
    review: "bg-purple-500",
    rest_day: "bg-gray-400"
}

export function HomeModule({ testResults, summarizerHistory, savedFlashcards = [], userId }: HomeModuleProps) {
    const now = new Date()
    // Fix: Use local date instead of UTC to avoid showing tomorrow's tasks in the evening
    const todayStr = now.toLocaleDateString('en-CA') // YYYY-MM-DD in local time

    // UI State
    const [selectedSummary, setSelectedSummary] = useState<any>(null)
    const [showAllSummaries, setShowAllSummaries] = useState(false)

    // Study plan and custom tasks (loaded from localStorage)
    const [studyPlan, setStudyPlan] = useState<{ days: DayPlan[]; weeklyGoals?: string[]; examTips?: string[] } | null>(null)
    const [customTasks, setCustomTasks] = useState<Record<string, { task: string; completed: boolean }[]>>({})
    const [newTaskText, setNewTaskText] = useState("")

    // Load saved data on mount
    useEffect(() => {
        const savedPlan = localStorage.getItem(`study_plan_${userId}`)
        if (savedPlan) {
            setStudyPlan(JSON.parse(savedPlan))
        }
        const savedTasks = localStorage.getItem(`custom_tasks_${userId}`)
        if (savedTasks) {
            setCustomTasks(JSON.parse(savedTasks))
        }
    }, [userId])

    // Save custom tasks when they change
    useEffect(() => {
        if (Object.keys(customTasks).length > 0) {
            localStorage.setItem(`custom_tasks_${userId}`, JSON.stringify(customTasks))
        }
    }, [customTasks, userId])

    // Stats
    const nextSAT = SAT_DATES.find(d => d.date >= now)
    const daysUntilSAT = nextSAT ? Math.ceil((nextSAT.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null
    const totalTests = testResults.length
    const totalSummaries = summarizerHistory.length
    const recentSummaries = summarizerHistory.slice(0, 3)
    const recentFlashcards = savedFlashcards.slice(0, 3)
    const bestScore = testResults.length > 0
        ? Math.max(...testResults.map(r => Math.round((r.correct_answers / r.total_questions) * 100)))
        : 0

    // Get today's tasks from study plan
    const getTodayPlan = (): DayPlan | undefined => {
        if (!studyPlan?.days) return undefined
        return studyPlan.days.find(d => d.date === todayStr)
    }

    // Get today's custom tasks
    const getTodayCustomTasks = () => {
        return customTasks[todayStr] || []
    }

    const todayPlan = getTodayPlan()
    const todayCustomTasks = getTodayCustomTasks()

    // Add custom task for today
    const addTodayTask = () => {
        if (!newTaskText.trim()) return
        setCustomTasks(prev => ({
            ...prev,
            [todayStr]: [...(prev[todayStr] || []), { task: newTaskText.trim(), completed: false }]
        }))
        setNewTaskText("")
    }

    // Toggle task completion
    const toggleTaskComplete = (index: number) => {
        setCustomTasks(prev => ({
            ...prev,
            [todayStr]: prev[todayStr].map((t, i) => i === index ? { ...t, completed: !t.completed } : t)
        }))
    }

    // Delete custom task
    const deleteCustomTask = (index: number) => {
        setCustomTasks(prev => ({
            ...prev,
            [todayStr]: prev[todayStr].filter((_, i) => i !== index)
        }))
    }

    // Calculate total tasks and completed
    const allTodayTasks = [
        ...(todayPlan?.tasks || []).map(t => ({ ...t, isAI: true })),
        ...todayCustomTasks.map(t => ({ ...t, isAI: false }))
    ]
    const completedCount = todayCustomTasks.filter(t => t.completed).length
    const totalTodayTasks = allTodayTasks.length

    return (
        <div className="space-y-6">
            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="text-white border-0" style={{ background: 'linear-gradient(to bottom right, var(--theme-base), var(--theme-dark))' }}>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/80 text-sm">Tests Completed</p>
                                <p className="text-3xl font-bold">{totalTests}</p>
                            </div>
                            <Target className="h-10 w-10 text-white/60" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="text-white border-0" style={{ background: 'linear-gradient(to bottom right, var(--theme-base), var(--theme-dark))' }}>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/80 text-sm">Best Score</p>
                                <p className="text-3xl font-bold">{bestScore}%</p>
                            </div>
                            <TrendingUp className="h-10 w-10 text-white/60" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="text-white border-0" style={{ background: 'linear-gradient(to bottom right, var(--theme-base), var(--theme-dark))' }}>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/80 text-sm">AI Summaries</p>
                                <p className="text-3xl font-bold">{totalSummaries}</p>
                            </div>
                            <Sparkles className="h-10 w-10 text-white/60" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="text-white border-0" style={{ background: 'linear-gradient(to bottom right, var(--theme-base), var(--theme-dark))' }}>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/80 text-sm">Days Until SAT</p>
                                <p className="text-3xl font-bold">{daysUntilSAT ?? "—"}</p>
                            </div>
                            <Clock className="h-10 w-10 text-white/60" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tasks Today + Upcoming SAT Dates Row */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Tasks Today - Left Side */}
                <Card className="border-2 border-theme-base/30">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ListTodo className="h-5 w-5 text-theme" />
                                <CardTitle>Tasks Today</CardTitle>
                            </div>
                            {totalTodayTasks > 0 && (
                                <Badge className="bg-theme-base text-white">
                                    {completedCount}/{totalTodayTasks} done
                                </Badge>
                            )}
                        </div>
                        <CardDescription>
                            {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* AI Generated Tasks */}
                            {todayPlan && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Badge className={`${DAY_TYPE_COLORS[todayPlan.dayType]} text-white text-xs`}>
                                            {todayPlan.dayType.replace('_', ' ')}
                                        </Badge>
                                        <span className="text-sm text-gray-600 font-medium">{todayPlan.focus}</span>
                                    </div>
                                    <div className="space-y-2">
                                        {todayPlan.tasks.map((task, i) => (
                                            <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                                <div className="mt-1">
                                                    <div className={`w-3 h-3 rounded-full ${task.category === 'math' ? 'bg-blue-500' : task.category === 'reading' ? 'bg-purple-500' : 'bg-green-500'}`}></div>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-gray-800 text-sm">{task.task}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{task.minutes} min • {task.category}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Custom Tasks */}
                            {todayCustomTasks.length > 0 && (
                                <div>
                                    {todayPlan && <div className="border-t pt-4 mt-4"></div>}
                                    <p className="text-sm font-medium text-gray-700 mb-2">✏️ Your Tasks</p>
                                    <div className="space-y-2">
                                        {todayCustomTasks.map((task, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg group">
                                                <input
                                                    type="checkbox"
                                                    checked={task.completed}
                                                    onChange={() => toggleTaskComplete(i)}
                                                    className="w-5 h-5 rounded accent-amber-500"
                                                />
                                                <span className={`flex-1 text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                                    {task.task}
                                                </span>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => deleteCustomTask(i)}>
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Empty State */}
                            {!todayPlan && todayCustomTasks.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <CalendarDays className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                    <p className="font-medium">No tasks scheduled for today</p>
                                    <p className="text-sm mt-1">Add a task below or generate a study plan in the Calendar tab</p>
                                </div>
                            )}

                            {/* Add Task */}
                            <div className="flex gap-2 pt-2">
                                <Input
                                    placeholder="Add a task for today..."
                                    value={newTaskText}
                                    onChange={(e) => setNewTaskText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addTodayTask()}
                                    className="flex-1"
                                />
                                <Button onClick={addTodayTask} disabled={!newTaskText.trim()} style={{ backgroundColor: 'var(--theme-base)' }}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Upcoming SAT Dates - Right Side */}
                <Card className="h-fit">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-theme" />
                            <CardTitle>Upcoming SAT Dates</CardTitle>
                        </div>
                        <CardDescription>Mark your calendar for the next SAT test dates</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {SAT_DATES.filter(d => d.date >= now).slice(0, 5).map((satDate, index) => {
                                const daysUntil = Math.ceil((satDate.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                                const isNext = index === 0
                                return (
                                    <div
                                        key={satDate.label}
                                        className={`p-4 rounded-xl border-2 transition-all ${isNext
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isNext ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                                                    }`}>
                                                    <CalendarDays className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className={`font-semibold text-sm ${isNext ? 'text-green-700' : 'text-gray-800'}`}>
                                                        {satDate.label}
                                                    </p>
                                                    <p className={`text-xs ${isNext ? 'text-green-600' : 'text-gray-500'}`}>
                                                        {satDate.date.toLocaleDateString('en-US', { weekday: 'long' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge className={`${isNext
                                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                    }`}>
                                                    {daysUntil} days
                                                </Badge>
                                                {isNext && (
                                                    <p className="text-xs text-green-600 mt-1 font-medium">Next Test</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Summaries + Saved Flashcards */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-theme" />
                                <CardTitle>Recent Summaries</CardTitle>
                            </div>
                            {recentSummaries.length > 0 && (
                                <Button variant="ghost" size="sm" className="text-theme" onClick={() => setShowAllSummaries(true)}>
                                    View All <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            )}
                        </div>
                        <CardDescription>Your AI-generated study summaries</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentSummaries.length > 0 ? (
                            <div className="space-y-3">
                                {recentSummaries.map((summary: any) => (
                                    <div key={summary.id} className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer" onClick={() => setSelectedSummary(summary)}>
                                        <p className="font-medium text-gray-800 truncate">{summary.original_text?.substring(0, 60) || "Untitled"}...</p>
                                        <p className="text-sm text-gray-500">{new Date(summary.created_at).toLocaleDateString()}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Sparkles className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p>No summaries yet</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-theme" />
                            <CardTitle>Saved Flashcards</CardTitle>
                        </div>
                        <CardDescription>Your saved flashcard sets</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentFlashcards.length > 0 ? (
                            <div className="space-y-3">
                                {recentFlashcards.map((set: any) => (
                                    <div key={set.id} className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100">
                                        <p className="font-medium text-gray-800">{set.name || set.topic}</p>
                                        <p className="text-sm text-gray-500">{set.card_count || "?"} cards • {new Date(set.created_at).toLocaleDateString()}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p>No flashcards saved</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Summary Modals */}
            {selectedSummary && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedSummary(null)}>
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="font-semibold text-lg">Summary Details</h3>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedSummary(null)}><X className="h-5 w-5" /></Button>
                        </div>
                        <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
                            <p className="text-sm text-gray-500 mb-1">Original Text</p>
                            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg mb-4">{selectedSummary.original_text}</p>
                            <p className="text-sm text-gray-500 mb-1">AI Summary</p>
                            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">{selectedSummary.summarized_text}</p>
                        </div>
                    </div>
                </div>
            )}

            {showAllSummaries && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAllSummaries(false)}>
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="font-semibold text-lg">All Summaries ({summarizerHistory.length})</h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowAllSummaries(false)}><X className="h-5 w-5" /></Button>
                        </div>
                        <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)] space-y-3">
                            {summarizerHistory.map((summary: any) => (
                                <div key={summary.id} className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer" onClick={() => { setShowAllSummaries(false); setSelectedSummary(summary) }}>
                                    <p className="font-medium text-gray-800">{summary.original_text?.substring(0, 80) || "Untitled"}...</p>
                                    <p className="text-sm text-gray-500 mt-1">{new Date(summary.created_at).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
