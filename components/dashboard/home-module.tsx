"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"
import {
    Calendar as CalendarIcon,
    TrendingUp,
    Clock,
    Target,
    Sparkles,
    ChevronRight,
    FileText,
    X,
    BookOpen,
    Loader2,
    CheckCircle,
    Plus,
    Trash2,
    BookMarked
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

const FOCUS_SUGGESTIONS = [
    "Math - Algebra & Linear Equations",
    "Math - Geometry & Trigonometry",
    "Reading - Main Ideas & Evidence",
    "Writing - Grammar & Punctuation",
    "Full SAT Prep - All Sections"
]

const DAY_TYPE_COLORS: Record<string, string> = {
    new_content: "bg-blue-500",
    practice: "bg-green-500",
    review: "bg-purple-500",
    rest_day: "bg-gray-400"
}

export function HomeModule({ testResults, summarizerHistory, savedFlashcards = [], userId }: HomeModuleProps) {
    const now = new Date()

    // UI State
    const [selectedSummary, setSelectedSummary] = useState<any>(null)
    const [showAllSummaries, setShowAllSummaries] = useState(false)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [showDayModal, setShowDayModal] = useState(false)

    // AI Planner State
    const [focusAreas, setFocusAreas] = useState("")
    const [hoursPerDay, setHoursPerDay] = useState("2")
    const [selectedSATDate, setSelectedSATDate] = useState<Date | null>(SAT_DATES.find(d => d.date > now)?.date || null)
    const [studyPlan, setStudyPlan] = useState<{ days: DayPlan[]; weeklyGoals?: string[]; examTips?: string[] } | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [canGenerate, setCanGenerate] = useState(true)

    // Custom tasks for a day
    const [customTasks, setCustomTasks] = useState<Record<string, { task: string; completed: boolean }[]>>({})
    const [newTaskText, setNewTaskText] = useState("")

    // Load saved data on mount
    useEffect(() => {
        const lastGen = localStorage.getItem(`schedule_generated_${userId}`)
        if (lastGen) {
            const lastDate = new Date(lastGen)
            const today = new Date()
            if (lastDate.toDateString() === today.toDateString()) {
                setCanGenerate(false)
            }
        }
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
    const upcomingDates = SAT_DATES.filter(d => d.date >= now).slice(0, 3)
    const nextSAT = upcomingDates[0]
    const daysUntilSAT = nextSAT ? Math.ceil((nextSAT.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null
    const totalTests = testResults.length
    const totalSummaries = summarizerHistory.length
    const recentSummaries = summarizerHistory.slice(0, 3)
    const recentFlashcards = savedFlashcards.slice(0, 3)
    const bestScore = testResults.length > 0
        ? Math.max(...testResults.map(r => Math.round((r.correct_answers / r.total_questions) * 100)))
        : 0

    // Generate AI Schedule
    const handleGenerateSchedule = async () => {
        if (!canGenerate || !focusAreas.trim() || !selectedSATDate) return

        setIsGenerating(true)
        try {
            const response = await fetch("/api/gemini/generate-schedule", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    satDate: selectedSATDate.toISOString().split("T")[0],
                    focusAreas,
                    hoursPerDay: parseInt(hoursPerDay),
                    userId
                })
            })

            const data = await response.json()
            if (data.success) {
                const newPlan = {
                    days: data.days,
                    weeklyGoals: data.weeklyGoals,
                    examTips: data.examTips
                }
                setStudyPlan(newPlan)
                localStorage.setItem(`study_plan_${userId}`, JSON.stringify(newPlan))
                localStorage.setItem(`schedule_generated_${userId}`, new Date().toISOString())
                setCanGenerate(false)
            } else {
                alert("Failed to generate schedule: " + data.error)
            }
        } catch (error) {
            console.error("Error generating schedule:", error)
            alert("Failed to generate schedule")
        } finally {
            setIsGenerating(false)
        }
    }

    // Get plan for a specific date
    const getPlanForDate = (date: Date): DayPlan | undefined => {
        if (!studyPlan?.days) return undefined
        const dateStr = date.toISOString().split("T")[0]
        return studyPlan.days.find(d => d.date === dateStr)
    }

    // Get custom tasks for a date
    const getCustomTasksForDate = (date: Date) => {
        const dateStr = date.toISOString().split("T")[0]
        return customTasks[dateStr] || []
    }

    // Add custom task
    const addCustomTask = () => {
        if (!selectedDate || !newTaskText.trim()) return
        const dateStr = selectedDate.toISOString().split("T")[0]
        setCustomTasks(prev => ({
            ...prev,
            [dateStr]: [...(prev[dateStr] || []), { task: newTaskText.trim(), completed: false }]
        }))
        setNewTaskText("")
    }

    // Toggle task completion
    const toggleTaskComplete = (dateStr: string, index: number) => {
        setCustomTasks(prev => ({
            ...prev,
            [dateStr]: prev[dateStr].map((t, i) => i === index ? { ...t, completed: !t.completed } : t)
        }))
    }

    // Delete custom task
    const deleteCustomTask = (dateStr: string, index: number) => {
        setCustomTasks(prev => ({
            ...prev,
            [dateStr]: prev[dateStr].filter((_, i) => i !== index)
        }))
    }

    // Calendar tile styling
    const tileClassName = ({ date }: { date: Date }) => {
        const classes: string[] = []
        const isSATDate = SAT_DATES.some(satDate => satDate.date.toDateString() === date.toDateString())
        if (isSATDate) classes.push("sat-date-tile")

        const plan = getPlanForDate(date)
        if (plan) classes.push("has-plan-tile")

        const customTasksForDay = getCustomTasksForDate(date)
        if (customTasksForDay.length > 0) classes.push("has-tasks-tile")

        return classes.join(" ")
    }

    // Calendar tile content - show indicators
    const tileContent = ({ date }: { date: Date }) => {
        const plan = getPlanForDate(date)
        const tasks = getCustomTasksForDate(date)
        const hasSomething = plan || tasks.length > 0

        if (!hasSomething) return null

        return (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                {plan && <div className={`w-2 h-2 rounded-full ${DAY_TYPE_COLORS[plan.dayType] || 'bg-gray-400'}`}></div>}
                {tasks.length > 0 && <div className="w-2 h-2 rounded-full bg-amber-500"></div>}
            </div>
        )
    }

    // Open day modal
    const handleDateClick = (date: Date) => {
        setSelectedDate(date)
        setShowDayModal(true)
    }

    const selectedDayPlan = selectedDate ? getPlanForDate(selectedDate) : undefined
    const selectedDayTasks = selectedDate ? getCustomTasksForDate(selectedDate) : []
    const selectedDateStr = selectedDate?.toISOString().split("T")[0] || ""

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

            {/* AI Study Planner */}
            <Card className="border-2 border-theme-base/30">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-theme" />
                            <CardTitle>AI Study Planner</CardTitle>
                        </div>
                        {!canGenerate && <Badge variant="outline" className="text-amber-600 border-amber-300">1 per day limit</Badge>}
                    </div>
                    <CardDescription>Generate a detailed day-by-day study plan. Click any date to see tasks!</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Generator Form */}
                    {!studyPlan && (
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-4">
                                <div>
                                    <Label>What do you want to focus on?</Label>
                                    <Textarea
                                        placeholder="e.g., I struggle with algebra word problems and reading comprehension..."
                                        value={focusAreas}
                                        onChange={(e) => setFocusAreas(e.target.value)}
                                        className="min-h-[100px]"
                                        disabled={!canGenerate}
                                    />
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {FOCUS_SUGGESTIONS.map(s => (
                                            <Badge key={s} variant="outline" className="cursor-pointer hover:bg-theme-base/10" onClick={() => setFocusAreas(s)}>{s}</Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Hours/Day</Label>
                                        <Input type="number" min="1" max="6" value={hoursPerDay} onChange={(e) => setHoursPerDay(e.target.value)} disabled={!canGenerate} />
                                    </div>
                                    <div>
                                        <Label>Target SAT</Label>
                                        <select
                                            className="w-full p-2 border rounded-md"
                                            value={selectedSATDate?.toISOString() || ""}
                                            onChange={(e) => setSelectedSATDate(new Date(e.target.value))}
                                            disabled={!canGenerate}
                                        >
                                            {upcomingDates.map(d => (
                                                <option key={d.label} value={d.date.toISOString()}>{d.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <Button onClick={handleGenerateSchedule} disabled={!canGenerate || isGenerating || !focusAreas.trim()} className="w-full" style={{ backgroundColor: 'var(--theme-base)' }}>
                                    {isGenerating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating Plan...</> : <><Sparkles className="h-4 w-4 mr-2" /> Generate My Study Plan</>}
                                </Button>
                            </div>
                            <div className="flex items-center justify-center p-8 bg-gray-50 rounded-xl">
                                <div className="text-center text-gray-500">
                                    <BookMarked className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                    <p className="font-medium">Your personalized plan will appear here</p>
                                    <p className="text-sm mt-1">AI will create daily tasks based on your goals</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Plan Generated - Show Summary */}
                    {studyPlan && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                            <div className="flex items-center gap-2 text-green-700 mb-3">
                                <CheckCircle className="h-5 w-5" />
                                <span className="font-semibold">Study Plan Active!</span>
                                <span className="text-sm text-green-600 ml-2">({studyPlan.days?.length || 0} days planned)</span>
                            </div>
                            {studyPlan.weeklyGoals && (
                                <div className="space-y-1">
                                    {studyPlan.weeklyGoals.slice(0, 3).map((goal, i) => (
                                        <p key={i} className="text-sm text-green-800">• {goal}</p>
                                    ))}
                                </div>
                            )}
                            <Button variant="outline" size="sm" className="mt-3" onClick={() => { setStudyPlan(null); localStorage.removeItem(`study_plan_${userId}`) }}>
                                Clear Plan & Start Over
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Full Width Interactive Calendar */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-theme" />
                        <CardTitle>Study Calendar</CardTitle>
                    </div>
                    <CardDescription>Click any date to view or add study tasks. SAT dates in green, planned days marked.</CardDescription>
                </CardHeader>
                <CardContent>
                    <style jsx global>{`
                        .react-calendar { width: 100% !important; border: none !important; font-family: inherit; background: transparent; }
                        .react-calendar__tile { padding: 1.2em 0.5em; position: relative; transition: all 0.2s; }
                        .react-calendar__tile:hover { background: #f3f4f6 !important; }
                        .react-calendar__tile--active { background: var(--theme-base) !important; color: white !important; }
                        .sat-date-tile { background: #10b981 !important; color: white !important; font-weight: bold; border-radius: 8px; }
                        .react-calendar__tile--now { background: #fef3c7 !important; border-radius: 8px; }
                        .has-plan-tile { border: 2px solid var(--theme-base) !important; border-radius: 8px; }
                        .has-tasks-tile { box-shadow: inset 0 -3px 0 #f59e0b; }
                        .react-calendar__navigation button { font-size: 1.1rem; }
                    `}</style>
                    <Calendar
                        onClickDay={handleDateClick}
                        tileClassName={tileClassName}
                        tileContent={tileContent}
                        minDate={new Date()}
                        className="rounded-lg"
                    />
                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-green-500"></div><span>SAT Date</span></div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-blue-500"></div><span>New Content</span></div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-green-500"></div><span>Practice</span></div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-purple-500"></div><span>Review</span></div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-amber-500"></div><span>Custom Tasks</span></div>
                    </div>
                </CardContent>
            </Card>

            {/* Day Detail Modal */}
            {showDayModal && selectedDate && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDayModal(false)}>
                    <div className="bg-white rounded-xl max-w-lg w-full max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                            <div>
                                <h3 className="font-bold text-lg">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
                                {selectedDayPlan && (
                                    <Badge className={`mt-1 ${DAY_TYPE_COLORS[selectedDayPlan.dayType]} text-white`}>
                                        {selectedDayPlan.dayType.replace('_', ' ')}
                                    </Badge>
                                )}
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setShowDayModal(false)}><X className="h-5 w-5" /></Button>
                        </div>

                        <div className="p-4 overflow-y-auto max-h-[calc(85vh-140px)] space-y-6">
                            {/* AI Generated Plan */}
                            {selectedDayPlan && (
                                <div>
                                    <h4 className="font-semibold text-theme mb-2">📚 {selectedDayPlan.focus}</h4>
                                    <div className="space-y-2">
                                        {selectedDayPlan.tasks.map((task, i) => (
                                            <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                                <div className="mt-0.5">
                                                    <div className={`w-3 h-3 rounded-full ${task.category === 'math' ? 'bg-blue-500' : task.category === 'reading' ? 'bg-purple-500' : 'bg-green-500'}`}></div>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-gray-800">{task.task}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{task.minutes} min • {task.category}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Custom Tasks */}
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">✏️ Your Tasks</h4>
                                {selectedDayTasks.length > 0 ? (
                                    <div className="space-y-2">
                                        {selectedDayTasks.map((task, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg group">
                                                <input
                                                    type="checkbox"
                                                    checked={task.completed}
                                                    onChange={() => toggleTaskComplete(selectedDateStr, i)}
                                                    className="w-5 h-5 rounded"
                                                />
                                                <span className={`flex-1 ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>{task.task}</span>
                                                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100" onClick={() => deleteCustomTask(selectedDateStr, i)}>
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No custom tasks yet</p>
                                )}

                                {/* Add Task */}
                                <div className="flex gap-2 mt-3">
                                    <Input
                                        placeholder="Add a task..."
                                        value={newTaskText}
                                        onChange={(e) => setNewTaskText(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addCustomTask()}
                                    />
                                    <Button onClick={addCustomTask} disabled={!newTaskText.trim()} style={{ backgroundColor: 'var(--theme-base)' }}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t bg-gray-50">
                            <Button className="w-full" variant="outline" onClick={() => setShowDayModal(false)}>Done</Button>
                        </div>
                    </div>
                </div>
            )}

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
