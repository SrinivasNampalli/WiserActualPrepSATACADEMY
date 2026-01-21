"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
    Shield,
    LogOut,
    Plus,
    Trash2,
    Users,
    FileText,
    BookOpen,
    ClipboardList,
    Search,
    Check,
    X,
    Eye,
    EyeOff,
    ChevronDown,
    ChevronUp,
    ImagePlus,
    Loader2,
    FileUp,
    Upload,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface SecretAdminDashboardProps {
    tests: any[]
    users: any[]
    questions: any[]
    quizzes: any[]
}

interface ParsedQuestion {
    question_text: string
    options: string[]
    correct_answer: string
    category: string
    difficulty: string
    question_type: string
    image_url?: string
    explanation?: string
}

export function SecretAdminDashboard({
    tests: initialTests,
    users: initialUsers,
    questions: initialQuestions,
    quizzes: initialQuizzes,
}: SecretAdminDashboardProps) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("tests")
    const [tests, setTests] = useState(initialTests)
    const [users, setUsers] = useState(initialUsers)
    const [questions, setQuestions] = useState(initialQuestions)
    const [quizzes, setQuizzes] = useState(initialQuizzes)
    const [searchTerm, setSearchTerm] = useState("")

    // Test creation
    const [isCreatingTest, setIsCreatingTest] = useState(false)
    const [testFormData, setTestFormData] = useState({
        test_type: "practice",
        subject: "math",
        title: "",
        total_questions: 40,
        duration_minutes: 60,
        is_public: false, // Start as draft (private)
    })

    // Question parser state
    const [selectedTestId, setSelectedTestId] = useState<string | null>(null)
    const [rawQuestionInput, setRawQuestionInput] = useState("")
    const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([])
    const [parseError, setParseError] = useState("")
    const [questionCategory, setQuestionCategory] = useState("Math")
    const [questionDifficulty, setQuestionDifficulty] = useState("Medium")
    const [expandedTest, setExpandedTest] = useState<string | null>(null)
    const [testQuestions, setTestQuestions] = useState<Record<string, any[]>>({})


    // Manual question creation state
    const [manualQuestion, setManualQuestion] = useState<ParsedQuestion>({
        question_text: "",
        options: ["", "", "", ""],
        correct_answer: "A",
        category: "Math",
        difficulty: "Medium",
        question_type: "multiple_choice",
        image_url: "",
        explanation: "",
    })
    const [manualImagePreview, setManualImagePreview] = useState<string | null>(null)
    const [isUploadingImage, setIsUploadingImage] = useState(false)

    const handleLogout = async () => {
        await fetch("/api/secret-admin/logout", { method: "POST" })
        router.push("/secret-admin")
    }

    // Create test
    const handleCreateTest = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const response = await fetch("/api/secret-admin/tests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(testFormData),
            })

            const result = await response.json()

            if (result.success && result.data) {
                setTests([result.data, ...tests])
                setIsCreatingTest(false)
                setTestFormData({
                    test_type: "practice",
                    subject: "math",
                    title: "",
                    total_questions: 40,
                    duration_minutes: 60,
                    is_public: false,
                })
            } else {
                alert("Failed to create test: " + (result.error || "Unknown error"))
            }
        } catch (error) {
            console.error("Create test error:", error)
            alert("Failed to create test")
        }
    }

    // Delete test
    const handleDeleteTest = async (id: string) => {
        if (!confirm("Are you sure you want to delete this test and ALL its questions?")) return

        try {
            const response = await fetch(`/api/secret-admin/tests?id=${id}`, {
                method: "DELETE",
            })

            const result = await response.json()

            if (result.success) {
                setTests(tests.filter((t) => t.id !== id))
                const updated = { ...testQuestions }
                delete updated[id]
                setTestQuestions(updated)
            } else {
                alert("Failed to delete test: " + (result.error || "Unknown error"))
            }
        } catch (error) {
            console.error("Delete test error:", error)
            alert("Failed to delete test")
        }
    }

    // Delete user
    const handleDeleteUser = async (userId: string, userEmail: string) => {
        if (!confirm(`Are you sure you want to delete user "${userEmail}"? This action cannot be undone.`)) return

        try {
            const response = await fetch(`/api/secret-admin/users?id=${userId}`, {
                method: "DELETE",
            })

            const result = await response.json()

            if (result.success) {
                setUsers(users.filter((u) => u.id !== userId))
            } else {
                alert("Failed to delete user: " + (result.error || "Unknown error"))
            }
        } catch (error) {
            console.error("Delete user error:", error)
            alert("Failed to delete user")
        }
    }

    // Toggle test visibility (public/private)
    const handleToggleTestVisibility = async (testId: string, currentlyPublic: boolean) => {
        try {
            const response = await fetch(`/api/secret-admin/tests`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: testId, is_public: !currentlyPublic }),
            })

            const result = await response.json()

            if (result.success) {
                setTests(tests.map((t) =>
                    t.id === testId ? { ...t, is_public: !currentlyPublic } : t
                ))
            } else {
                alert("Failed to update visibility: " + (result.error || "Unknown error"))
            }
        } catch (error) {
            console.error("Toggle visibility error:", error)
            alert("Failed to update visibility")
        }
    }

    // Parse questions from pasted text - handles mass import with or without numbers
    const parseQuestions = () => {
        setParseError("")
        setParsedQuestions([])

        if (!rawQuestionInput.trim()) {
            setParseError("Please paste some questions first")
            return
        }

        try {
            const parsed: ParsedQuestion[] = []
            let currentCategory = questionCategory // Default category from dropdown

            // Split input into lines for processing
            const allLines = rawQuestionInput.split("\n")
            let i = 0

            while (i < allLines.length) {
                const line = allLines[i].trim()

                // Skip empty lines
                if (!line) {
                    i++
                    continue
                }

                // Check for Category: header - update current category
                const categoryMatch = line.match(/^Category:\s*(.+)$/i)
                if (categoryMatch) {
                    currentCategory = categoryMatch[1].trim()
                    i++
                    continue
                }

                // Check for numbered question start (1. or 1) format)
                const questionStartMatch = line.match(/^(\d+)[\.\)]\s*(.*)$/)
                let questionText = questionStartMatch ? questionStartMatch[2].trim() : line
                const options: string[] = []
                let foundOptions = false

                // Check if options are on the same line (inline format)
                // Example: "Which element...? A) Helium B) Oxygen C) Hydrogen D) Carbon"
                const inlineOptionsMatch = questionText.match(/^(.+?)\s+A\)\s*(.+?)\s+B\)\s*(.+?)\s+C\)\s*(.+?)\s+D\)\s*(.+)$/i)
                if (inlineOptionsMatch) {
                    questionText = inlineOptionsMatch[1].trim()
                    options.push(inlineOptionsMatch[2].trim())
                    options.push(inlineOptionsMatch[3].trim())
                    options.push(inlineOptionsMatch[4].trim())
                    options.push(inlineOptionsMatch[5].trim())
                    foundOptions = true
                }

                // If no inline options, look for options on following lines
                if (!foundOptions) {
                    i++
                    // Collect question text until we hit option A
                    while (i < allLines.length) {
                        const nextLine = allLines[i].trim()

                        // Skip empty lines
                        if (!nextLine) {
                            i++
                            continue
                        }

                        // Check for Category: header - means end of this question
                        if (/^Category:/i.test(nextLine)) break

                        // Check for next numbered question - means end of this question
                        if (/^\d+[\.\)]/.test(nextLine)) break

                        // Check for another inline question (has A) B) C) D) pattern)
                        if (/\sA\)\s*.+\sB\)\s*.+\sC\)\s*.+\sD\)\s/i.test(nextLine)) break

                        // Check if this line starts with an option letter
                        const optionMatch = nextLine.match(/^([A-D])[\)\.\:]\s*(.+)$/i)
                        if (optionMatch) {
                            options.push(optionMatch[2].trim())
                            i++

                            // Continue collecting remaining options
                            while (i < allLines.length && options.length < 4) {
                                const optLine = allLines[i].trim()
                                if (!optLine) { i++; continue }

                                const nextOptMatch = optLine.match(/^([A-D])[\)\.\:]\s*(.+)$/i)
                                if (nextOptMatch) {
                                    options.push(nextOptMatch[2].trim())
                                    i++
                                } else {
                                    break
                                }
                            }
                            foundOptions = true
                            break
                        } else {
                            // Add to question text
                            questionText += "\n" + nextLine
                            i++
                        }
                    }
                } else {
                    i++
                }

                // Save question if we have valid data
                if (questionText.trim() && options.length >= 4) {
                    parsed.push({
                        question_text: questionText.trim(),
                        options: [options[0], options[1], options[2], options[3]],
                        correct_answer: "A",
                        category: currentCategory,
                        difficulty: questionDifficulty,
                        question_type: "multiple_choice",
                    })
                }
            }

            if (parsed.length === 0) {
                setParseError("Could not parse any questions. Expected format:\n\nQuestion text A) Option B) Option C) Option D) Option\n\nOR\n\n1. Question text\nA) Option 1\nB) Option 2\nC) Option 3\nD) Option 4")
                return
            }

            setParsedQuestions(parsed)
        } catch (err) {
            setParseError("Error parsing questions. Please check the format.")
        }
    }



    // Handle manual question image upload
    const handleManualImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            setParseError("Please upload an image file")
            return
        }

        const reader = new FileReader()
        reader.onload = async (event) => {
            const imageData = event.target?.result as string
            setManualImagePreview(imageData)
            setIsUploadingImage(true)

            try {
                const response = await fetch("/api/secret-admin/upload-question-image", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        imageData: imageData,
                        fileName: `q_${Date.now()}.${file.type.split('/')[1]}`,
                    }),
                })

                const result = await response.json()

                if (result.success && result.url) {
                    setManualQuestion({ ...manualQuestion, image_url: result.url })
                } else {
                    setParseError("Failed to upload image: " + (result.error || "Unknown error"))
                }
            } catch (error) {
                console.error("Image upload error:", error)
                setParseError("Failed to upload image. Please try again.")
            } finally {
                setIsUploadingImage(false)
            }
        }
        reader.readAsDataURL(file)
    }

    // Add manual question to parsed list
    const addManualQuestion = () => {
        if (!manualQuestion.question_text.trim()) {
            setParseError("Please enter question text")
            return
        }
        if (manualQuestion.options.some(opt => !opt.trim())) {
            setParseError("Please fill in all 4 options")
            return
        }

        setParsedQuestions([...parsedQuestions, { ...manualQuestion }])
        // Reset form
        setManualQuestion({
            question_text: "",
            options: ["", "", "", ""],
            correct_answer: "A",
            category: questionCategory,
            difficulty: questionDifficulty,
            question_type: "multiple_choice",
            image_url: "",
            explanation: "",
        })
        setManualImagePreview(null)
        setParseError("")
    }

    // Update a parsed question
    const updateParsedQuestion = (index: number, field: string, value: string, optionIndex?: number) => {
        const updated = [...parsedQuestions]
        if (field === "options" && optionIndex !== undefined) {
            const newOptions = [...updated[index].options]
            newOptions[optionIndex] = value
            updated[index] = { ...updated[index], options: newOptions }
        } else {
            updated[index] = { ...updated[index], [field]: value }
        }
        setParsedQuestions(updated)
    }

    // Remove a parsed question
    const removeParsedQuestion = (index: number) => {
        setParsedQuestions(parsedQuestions.filter((_, i) => i !== index))
    }

    // Save parsed questions to database
    const saveQuestions = async () => {
        if (!selectedTestId) {
            setParseError("Please select a test first")
            return
        }

        if (parsedQuestions.length === 0) {
            setParseError("No questions to save")
            return
        }

        // Prepare questions for API
        const questionsToInsert = parsedQuestions.map((q) => ({
            question_text: q.question_text,
            options: q.options,
            correct_answer: q.correct_answer,
            category: q.category.toLowerCase(),
            difficulty: q.difficulty.toLowerCase(),
            question_type: "multiple_choice",
            image_url: q.image_url || null,
            explanation: q.explanation || null,
        }))

        try {
            const response = await fetch("/api/secret-admin/questions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    testId: selectedTestId,
                    questions: questionsToInsert,
                }),
            })

            const result = await response.json()

            if (result.success && result.data) {
                // Update local state
                setQuestions([...result.data, ...questions])

                // Clear parser
                setParsedQuestions([])
                setRawQuestionInput("")
                setParseError("")

                alert(`Successfully saved ${result.data.length} questions to the test!`)
            } else {
                setParseError("Error saving questions: " + (result.error || "Unknown error"))
            }
        } catch (error) {
            console.error("Save questions error:", error)
            setParseError("Failed to save questions. Please try again.")
        }
    }

    // Load questions for a specific test (using API to bypass RLS)
    const loadTestQuestions = async (testId: string) => {
        if (testQuestions[testId]) {
            setExpandedTest(expandedTest === testId ? null : testId)
            return
        }

        try {
            const response = await fetch(`/api/secret-admin/tests?testId=${testId}`)
            const result = await response.json()

            if (result.success && result.data) {
                setTestQuestions({ ...testQuestions, [testId]: result.data })
            }
            setExpandedTest(testId)
        } catch (error) {
            console.error("Load test questions error:", error)
            setExpandedTest(testId)
        }
    }

    // Delete ALL tests
    const deleteAllTests = async () => {
        if (!confirm("Are you ABSOLUTELY SURE you want to delete ALL tests and questions? This cannot be undone!")) return
        if (!confirm("FINAL WARNING: This will delete EVERYTHING. Type OK to confirm.")) return

        try {
            const response = await fetch(`/api/secret-admin/tests?all=true`, {
                method: "DELETE",
            })

            const result = await response.json()

            if (result.success) {
                setTests([])
                setTestQuestions({})
                setQuestions([])
                alert("All tests and questions deleted!")
            } else {
                alert("Failed to delete: " + (result.error || "Unknown error"))
            }
        } catch (error) {
            console.error("Delete all error:", error)
            alert("Failed to delete all tests")
        }
    }

    // Delete a question from a test
    const deleteQuestionFromTest = async (testId: string, testQuestionId: string, questionId: string) => {
        if (!confirm("Delete this question?")) return

        const supabase = createClient()

        // Delete from test_questions link table
        await supabase.from("test_questions").delete().eq("id", testQuestionId)

        // Delete the question itself
        await supabase.from("questions").delete().eq("id", questionId)

        // Update local state
        setTestQuestions({
            ...testQuestions,
            [testId]: testQuestions[testId].filter((q) => q.id !== testQuestionId),
        })
        setQuestions(questions.filter((q) => q.id !== questionId))
    }

    // Filter users
    const filteredUsers = users.filter(
        (user) =>
            user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            {/* Header */}
            <header className="bg-gray-950 border-b border-gray-700 sticky top-0 z-50 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#4ECDC4] to-[#1B4B6B] flex items-center justify-center">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Secret Admin Panel</h1>
                            <p className="text-sm text-gray-400">Test & Question Management</p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLogout}
                        className="border-gray-600 text-gray-300 hover:text-white hover:border-gray-500"
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-gray-800 border-gray-700">
                        <CardContent className="pt-6 text-center">
                            <FileText className="h-8 w-8 mx-auto mb-2 text-[#4ECDC4]" />
                            <p className="text-3xl font-bold text-white">{tests.length}</p>
                            <p className="text-sm text-gray-400">Tests</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-800 border-gray-700">
                        <CardContent className="pt-6 text-center">
                            <ClipboardList className="h-8 w-8 mx-auto mb-2 text-[#4ECDC4]" />
                            <p className="text-3xl font-bold text-white">{questions.length}</p>
                            <p className="text-sm text-gray-400">Questions</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-800 border-gray-700">
                        <CardContent className="pt-6 text-center">
                            <BookOpen className="h-8 w-8 mx-auto mb-2 text-[#4ECDC4]" />
                            <p className="text-3xl font-bold text-white">{quizzes.length}</p>
                            <p className="text-sm text-gray-400">Quizzes</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-800 border-gray-700">
                        <CardContent className="pt-6 text-center">
                            <Users className="h-8 w-8 mx-auto mb-2 text-[#4ECDC4]" />
                            <p className="text-3xl font-bold text-white">{users.length}</p>
                            <p className="text-sm text-gray-400">Users</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                        <TabsTrigger value="tests">Test Manager</TabsTrigger>
                        <TabsTrigger value="add-questions">Add Questions</TabsTrigger>
                        <TabsTrigger value="users">Users</TabsTrigger>
                    </TabsList>

                    {/* Tests Tab */}
                    <TabsContent value="tests" className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold">Test Manager</h2>
                                <p className="text-gray-400">Create tests and manage questions</p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => setIsCreatingTest(!isCreatingTest)}
                                    className="bg-theme-base hover:bg-theme-dark text-white"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Test
                                </Button>
                                {tests.length > 0 && (
                                    <Button
                                        onClick={deleteAllTests}
                                        variant="outline"
                                        className="border-red-500 text-red-400 hover:bg-red-500/20"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete All
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Create Test Form */}
                        {isCreatingTest && (
                            <Card className="bg-gray-800 border-gray-700">
                                <CardHeader>
                                    <CardTitle>Create New Test</CardTitle>
                                    <CardDescription className="text-gray-400">
                                        Set up a new SAT practice test
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleCreateTest} className="space-y-4">
                                        <div>
                                            <Label className="text-gray-300">Test Title</Label>
                                            <Input
                                                value={testFormData.title}
                                                onChange={(e) => setTestFormData({ ...testFormData, title: e.target.value })}
                                                required
                                                className="bg-gray-900 border-gray-600 text-white"
                                                placeholder="e.g., SAT Practice Test #1"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <Label className="text-gray-300">Subject</Label>
                                                <Select
                                                    value={testFormData.subject}
                                                    onValueChange={(value) => setTestFormData({ ...testFormData, subject: value })}
                                                >
                                                    <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="math">Math</SelectItem>
                                                        <SelectItem value="english">English</SelectItem>
                                                        <SelectItem value="full">Full (Both)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label className="text-gray-300">Test Type</Label>
                                                <Select
                                                    value={testFormData.test_type}
                                                    onValueChange={(value) => setTestFormData({ ...testFormData, test_type: value })}
                                                >
                                                    <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="diagnostic">Diagnostic</SelectItem>
                                                        <SelectItem value="practice">Practice</SelectItem>
                                                        <SelectItem value="mock">Mock</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label className="text-gray-300">Questions</Label>
                                                <Input
                                                    type="number"
                                                    value={testFormData.total_questions}
                                                    onChange={(e) => setTestFormData({ ...testFormData, total_questions: parseInt(e.target.value) })}
                                                    className="bg-gray-900 border-gray-600 text-white"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-gray-300">Duration (min)</Label>
                                                <Input
                                                    type="number"
                                                    value={testFormData.duration_minutes}
                                                    onChange={(e) => setTestFormData({ ...testFormData, duration_minutes: parseInt(e.target.value) })}
                                                    className="bg-gray-900 border-gray-600 text-white"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button type="submit" className="bg-theme-base hover:bg-theme-dark text-white">
                                                Create Test
                                            </Button>
                                            <Button type="button" variant="outline" onClick={() => setIsCreatingTest(false)} className="border-gray-600 text-gray-300">
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {/* Test List */}
                        <div className="space-y-4">
                            {tests.length === 0 ? (
                                <Card className="bg-gray-800 border-gray-700">
                                    <CardContent className="py-12 text-center text-gray-400">
                                        No tests created yet. Click "Create Test" to get started.
                                    </CardContent>
                                </Card>
                            ) : (
                                tests.map((test) => (
                                    <Card key={test.id} className="bg-gray-800 border-gray-700">
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <CardTitle className="text-lg text-white">{test.title}</CardTitle>
                                                    <div className="flex gap-2 mt-2 flex-wrap">
                                                        <Badge className={`capitalize ${test.subject === 'math' ? 'bg-blue-600 text-white' : test.subject === 'english' ? 'bg-purple-600 text-white' : 'bg-emerald-600 text-white'}`}>
                                                            {test.subject || 'full'}
                                                        </Badge>
                                                        <Badge className="bg-gray-700 text-gray-300 capitalize">{test.test_type}</Badge>
                                                        <Badge className="bg-gray-700 text-gray-300">{test.total_questions} questions</Badge>
                                                        <Badge className="bg-gray-700 text-gray-300">{test.duration_minutes} min</Badge>
                                                        <Badge className={test.is_public ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'}>
                                                            {test.is_public ? 'Public' : 'Draft'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleToggleTestVisibility(test.id, test.is_public)}
                                                        className={test.is_public ? 'text-green-400 hover:text-green-300' : 'text-yellow-400 hover:text-yellow-300'}
                                                        title={test.is_public ? 'Make Draft' : 'Make Public'}
                                                    >
                                                        {test.is_public ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => loadTestQuestions(test.id)}
                                                        className="text-gray-400 hover:text-white"
                                                    >
                                                        <FileText className="h-4 w-4 mr-1" />
                                                        {expandedTest === test.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteTest(test.id)}
                                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>

                                        {/* Expanded Questions */}
                                        {expandedTest === test.id && testQuestions[test.id] && (
                                            <CardContent className="pt-0">
                                                <div className="border-t border-gray-700 pt-4 mt-2">
                                                    {testQuestions[test.id].length === 0 ? (
                                                        <p className="text-gray-500 text-sm">No questions added yet. Go to "Add Questions" tab.</p>
                                                    ) : (
                                                        <div className="space-y-2 max-h-96 overflow-y-auto">
                                                            {testQuestions[test.id].map((tq, index) => (
                                                                <div key={tq.id} className="flex justify-between items-start bg-gray-900 p-3 rounded-lg">
                                                                    <div className="flex-1">
                                                                        <p className="text-sm text-gray-300">
                                                                            <span className="text-[#4ECDC4] font-medium">Q{index + 1}:</span> {tq.questions?.question_text}
                                                                        </p>
                                                                        <div className="grid grid-cols-2 gap-1 mt-2 text-xs text-gray-500">
                                                                            {tq.questions?.options?.map((opt: string, i: number) => (
                                                                                <span key={i}>{String.fromCharCode(65 + i)}: {opt}</span>
                                                                            )) || (
                                                                                    <>
                                                                                        <span>A: {tq.questions?.option_a}</span>
                                                                                        <span>B: {tq.questions?.option_b}</span>
                                                                                        <span>C: {tq.questions?.option_c}</span>
                                                                                        <span>D: {tq.questions?.option_d}</span>
                                                                                    </>
                                                                                )}
                                                                        </div>
                                                                        <Badge className="mt-2 bg-green-500/20 text-green-300 text-xs">
                                                                            Answer: {tq.questions?.correct_answer}
                                                                        </Badge>
                                                                    </div>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => deleteQuestionFromTest(test.id, tq.id, tq.question_id)}
                                                                        className="text-red-400 hover:text-red-300"
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        )}
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    {/* Add Questions Tab */}
                    <TabsContent value="add-questions" className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold">Add Questions to Test</h2>
                            <p className="text-gray-400">Paste questions and they'll be automatically parsed</p>
                        </div>

                        {/* Select Test */}
                        <Card className="bg-gray-800 border-gray-700">
                            <CardHeader>
                                <CardTitle>1. Select Target Test</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Select value={selectedTestId || ""} onValueChange={setSelectedTestId}>
                                    <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                                        <SelectValue placeholder="Choose a test to add questions to..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tests.map((test) => (
                                            <SelectItem key={test.id} value={test.id}>
                                                {test.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>

                        {/* Question Input */}
                        <Card className="bg-gray-800 border-gray-700">
                            <CardHeader>
                                <CardTitle>2. Paste Questions</CardTitle>
                                <CardDescription className="text-gray-400">
                                    Paste questions in this format:
                                    <pre className="mt-2 p-2 bg-gray-900 rounded text-xs">
                                        {`Question text here?
A. First option
B. Second option
C. Third option
D. Fourth option

Next question...`}
                                    </pre>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-gray-300">Category</Label>
                                        <Select value={questionCategory} onValueChange={setQuestionCategory}>
                                            <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Math">Math</SelectItem>
                                                <SelectItem value="Reading">Reading</SelectItem>
                                                <SelectItem value="Writing">Writing</SelectItem>
                                                <SelectItem value="Grammar">Grammar</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label className="text-gray-300">Difficulty</Label>
                                        <Select value={questionDifficulty} onValueChange={setQuestionDifficulty}>
                                            <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Easy">Easy</SelectItem>
                                                <SelectItem value="Medium">Medium</SelectItem>
                                                <SelectItem value="Hard">Hard</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Textarea
                                    value={rawQuestionInput}
                                    onChange={(e) => setRawQuestionInput(e.target.value)}
                                    placeholder="Paste your questions here..."
                                    className="bg-gray-900 border-gray-600 text-white min-h-[200px] font-mono text-sm"
                                />

                                {parseError && (
                                    <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                                        <p className="text-red-400 text-sm whitespace-pre-wrap">{parseError}</p>
                                    </div>
                                )}

                                <Button onClick={parseQuestions} className="bg-theme-base hover:bg-theme-dark text-white">
                                    Parse Questions
                                </Button>
                            </CardContent>
                        </Card>



                        {/* Manual Question Creator */}
                        <Card className="bg-gray-800 border-gray-700">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Plus className="h-5 w-5 text-[#4ECDC4]" />
                                    Add Single Question
                                </CardTitle>
                                <CardDescription className="text-gray-400">
                                    Manually create a question with optional image attachment
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Image Upload for Question */}
                                <div>
                                    <Label className="text-gray-300 mb-2 block">Question Image (Optional)</Label>
                                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:border-[#4ECDC4] transition-colors">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleManualImageUpload}
                                            className="hidden"
                                            id="manual-image-upload"
                                        />
                                        <label
                                            htmlFor="manual-image-upload"
                                            className="cursor-pointer flex flex-col items-center gap-2"
                                        >
                                            {manualImagePreview ? (
                                                <div className="relative w-full">
                                                    <img
                                                        src={manualImagePreview}
                                                        alt="Question image"
                                                        className="max-h-32 mx-auto rounded"
                                                    />
                                                    {isUploadingImage && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded">
                                                            <Loader2 className="h-6 w-6 animate-spin text-white" />
                                                        </div>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.preventDefault()
                                                            setManualImagePreview(null)
                                                            setManualQuestion({ ...manualQuestion, image_url: "" })
                                                        }}
                                                        className="absolute top-0 right-0 text-red-400 hover:text-red-300"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="h-8 w-8 text-gray-500" />
                                                    <span className="text-sm text-gray-400">
                                                        Click to add an image (displays above question)
                                                    </span>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                </div>

                                {/* Question Text */}
                                <div>
                                    <Label className="text-gray-300">Question Text</Label>
                                    <Textarea
                                        value={manualQuestion.question_text}
                                        onChange={(e) => setManualQuestion({ ...manualQuestion, question_text: e.target.value })}
                                        placeholder="Enter the question text..."
                                        className="bg-gray-900 border-gray-600 text-white mt-1"
                                        rows={3}
                                    />
                                </div>

                                {/* Options */}
                                <div className="grid grid-cols-2 gap-3">
                                    {["A", "B", "C", "D"].map((letter, idx) => (
                                        <div key={letter}>
                                            <Label className="text-gray-300">Option {letter}</Label>
                                            <Input
                                                value={manualQuestion.options[idx]}
                                                onChange={(e) => {
                                                    const newOptions = [...manualQuestion.options]
                                                    newOptions[idx] = e.target.value
                                                    setManualQuestion({ ...manualQuestion, options: newOptions })
                                                }}
                                                placeholder={`Option ${letter}...`}
                                                className="bg-gray-900 border-gray-600 text-white mt-1"
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Correct Answer, Category, Difficulty */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <Label className="text-gray-300">Correct Answer</Label>
                                        <Select
                                            value={manualQuestion.correct_answer}
                                            onValueChange={(v) => setManualQuestion({ ...manualQuestion, correct_answer: v })}
                                        >
                                            <SelectTrigger className="bg-gray-900 border-gray-600 text-white mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="A">A</SelectItem>
                                                <SelectItem value="B">B</SelectItem>
                                                <SelectItem value="C">C</SelectItem>
                                                <SelectItem value="D">D</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label className="text-gray-300">Category</Label>
                                        <Select
                                            value={manualQuestion.category}
                                            onValueChange={(v) => setManualQuestion({ ...manualQuestion, category: v })}
                                        >
                                            <SelectTrigger className="bg-gray-900 border-gray-600 text-white mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Math">Math</SelectItem>
                                                <SelectItem value="Reading">Reading</SelectItem>
                                                <SelectItem value="Writing">Writing</SelectItem>
                                                <SelectItem value="Grammar">Grammar</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label className="text-gray-300">Difficulty</Label>
                                        <Select
                                            value={manualQuestion.difficulty}
                                            onValueChange={(v) => setManualQuestion({ ...manualQuestion, difficulty: v })}
                                        >
                                            <SelectTrigger className="bg-gray-900 border-gray-600 text-white mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Easy">Easy</SelectItem>
                                                <SelectItem value="Medium">Medium</SelectItem>
                                                <SelectItem value="Hard">Hard</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Explanation */}
                                <div>
                                    <Label className="text-gray-300">Explanation (Optional)</Label>
                                    <Textarea
                                        value={manualQuestion.explanation || ""}
                                        onChange={(e) => setManualQuestion({ ...manualQuestion, explanation: e.target.value })}
                                        placeholder="Explain why the correct answer is right and why other options are wrong..."
                                        className="bg-gray-900 border-gray-600 text-white mt-1"
                                        rows={3}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">This explanation will be shown in the mistake log after test completion</p>
                                </div>

                                {parseError && (
                                    <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                                        <p className="text-red-400 text-sm whitespace-pre-wrap">{parseError}</p>
                                    </div>
                                )}

                                <Button
                                    onClick={addManualQuestion}
                                    className="w-full bg-theme-base hover:bg-theme-dark text-white"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Question to List
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Parsed Questions Preview */}
                        {parsedQuestions.length > 0 && (
                            <Card className="bg-gray-800 border-gray-700">
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle>3. Review & Confirm ({parsedQuestions.length} questions)</CardTitle>
                                            <CardDescription className="text-gray-400">
                                                Set correct answers and review before saving
                                            </CardDescription>
                                        </div>
                                        <Button onClick={saveQuestions} className="bg-green-600 hover:bg-green-700 text-white">
                                            <Check className="h-4 w-4 mr-2" />
                                            Save All Questions
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                                    {parsedQuestions.map((q, index) => (
                                        <div key={index} className="bg-gray-900 p-4 rounded-lg space-y-3">
                                            <div className="flex justify-between items-start">
                                                <span className="text-[#4ECDC4] font-bold">Question {index + 1}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeParsedQuestion(index)}
                                                    className="text-red-400 hover:text-red-300"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            {/* Display question image if exists */}
                                            {q.image_url && (
                                                <div className="bg-gray-800 p-2 rounded-lg">
                                                    <img
                                                        src={q.image_url}
                                                        alt={`Question ${index + 1} image`}
                                                        className="max-h-48 mx-auto rounded object-contain"
                                                    />
                                                </div>
                                            )}

                                            <Textarea
                                                value={q.question_text}
                                                onChange={(e) => updateParsedQuestion(index, "question_text", e.target.value)}
                                                className="bg-gray-800 border-gray-600 text-white"
                                                rows={2}
                                            />

                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-400 w-6">A:</span>
                                                    <Input
                                                        value={q.options[0] || ""}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParsedQuestion(index, "options", e.target.value, 0)}
                                                        className="bg-gray-800 border-gray-600 text-white text-sm"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-400 w-6">B:</span>
                                                    <Input
                                                        value={q.options[1] || ""}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParsedQuestion(index, "options", e.target.value, 1)}
                                                        className="bg-gray-800 border-gray-600 text-white text-sm"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-400 w-6">C:</span>
                                                    <Input
                                                        value={q.options[2] || ""}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParsedQuestion(index, "options", e.target.value, 2)}
                                                        className="bg-gray-800 border-gray-600 text-white text-sm"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-400 w-6">D:</span>
                                                    <Input
                                                        value={q.options[3] || ""}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParsedQuestion(index, "options", e.target.value, 3)}
                                                        className="bg-gray-800 border-gray-600 text-white text-sm"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <Label className="text-gray-400">Correct Answer:</Label>
                                                <div className="flex gap-2">
                                                    {["A", "B", "C", "D"].map((letter) => (
                                                        <Button
                                                            key={letter}
                                                            size="sm"
                                                            variant={q.correct_answer === letter ? "default" : "outline"}
                                                            onClick={() => updateParsedQuestion(index, "correct_answer", letter)}
                                                            className={q.correct_answer === letter
                                                                ? "bg-green-600 hover:bg-green-700"
                                                                : "border-gray-600 text-gray-300"
                                                            }
                                                        >
                                                            {letter}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Explanation */}
                                            <div>
                                                <Label className="text-gray-400">Explanation:</Label>
                                                <Textarea
                                                    value={q.explanation || ""}
                                                    onChange={(e) => updateParsedQuestion(index, "explanation", e.target.value)}
                                                    placeholder="Explain why the correct answer is right..."
                                                    className="bg-gray-800 border-gray-600 text-white text-sm mt-1"
                                                    rows={2}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Users Tab */}
                    <TabsContent value="users" className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold">User Management</h2>
                                <p className="text-gray-400">View all registered users</p>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 bg-gray-900 border-gray-600 text-white w-64"
                                />
                            </div>
                        </div>

                        <div className="grid gap-4">
                            {filteredUsers.length === 0 ? (
                                <Card className="bg-gray-800 border-gray-700">
                                    <CardContent className="py-12 text-center text-gray-400">
                                        {searchTerm ? "No users found." : "No users registered yet."}
                                    </CardContent>
                                </Card>
                            ) : (
                                filteredUsers.map((user) => (
                                    <Card key={user.id} className="bg-gray-800 border-gray-700">
                                        <CardHeader>
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#4ECDC4] to-[#1B4B6B] flex items-center justify-center">
                                                        <Users className="h-6 w-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-lg text-white">{user.full_name || "Unnamed"}</CardTitle>
                                                        <CardDescription className="text-gray-400">{user.email}</CardDescription>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {user.is_admin && <Badge className="bg-purple-500/20 text-purple-300">Admin</Badge>}
                                                    <Badge className="bg-gray-700 text-gray-300">
                                                        {new Date(user.created_at).toLocaleDateString()}
                                                    </Badge>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteUser(user.id, user.email)}
                                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20 ml-2"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
