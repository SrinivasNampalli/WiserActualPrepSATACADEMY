"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { QuestionManager } from "./question-manager"
import { QuizManager } from "./quiz-manager"
import { TestManager } from "./test-manager"

interface AdminDashboardProps {
  user: any
  profile: any
  questions: any[]
  quizzes: any[]
  tests: any[]
}

export function AdminDashboard({ user, profile, questions, quizzes, tests }: AdminDashboardProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("questions")

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Admin Header */}
      <header className="bg-gray-950 border-b border-gray-700 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-[#4FB3A8]" />
            <div>
              <h1 className="text-2xl font-bold">Admin Panel</h1>
              <p className="text-sm text-gray-400">Content Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
              User Dashboard
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="questions">Questions Bank</TabsTrigger>
            <TabsTrigger value="quizzes">Quiz Manager</TabsTrigger>
            <TabsTrigger value="tests">Test Manager</TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="space-y-6">
            <QuestionManager questions={questions} userId={user.id} />
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-6">
            <QuizManager quizzes={quizzes} questions={questions} userId={user.id} />
          </TabsContent>

          <TabsContent value="tests" className="space-y-6">
            <TestManager tests={tests} userId={user.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
