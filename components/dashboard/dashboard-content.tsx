"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, User, Shield, Home, Target, Sparkles, BookOpen, CalendarDays } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { HomeModule } from "./home-module"
import { TestingModule } from "./testing-module"
import { AISummarizer } from "./ai-summarizer"
import { FlashcardGenerator } from "./flashcard-generator"
import { CalendarModule } from "./calendar-module"
import { ThemeCustomizer } from "@/components/theme-customizer"
import { Mascot } from "@/components/mascot"

interface DashboardContentProps {
  user: any
  profile: any
  testResults: any[]
  courseProgress: any[]
  summarizerHistory: any[]
  availableTests?: any[]
}

export function DashboardContent({
  user,
  profile,
  testResults,
  courseProgress,
  summarizerHistory,
  availableTests = [],
}: DashboardContentProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("home")
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#1B4B6B]">SAT Prep Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome back, {profile?.full_name || user.email}</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Theme Customizer */}
            <ThemeCustomizer />

            {profile?.is_admin && (
              <Button
                variant="default"
                size="sm"
                onClick={() => router.push("/admin")}
                className="bg-theme-dark hover:bg-theme-base"
              >
                <Shield className="h-4 w-4 mr-2" />
                Admin Panel
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => router.push("/profile")}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoggingOut}>
              <LogOut className={`h-4 w-4 mr-2 ${isLoggingOut ? 'animate-spin' : ''}`} />
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="home" className="gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </TabsTrigger>
            <TabsTrigger value="practice" className="gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Practice</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="summarizer" className="gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">AI Tools</span>
            </TabsTrigger>
            <TabsTrigger value="flashcards" className="gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Flashcards</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-6">
            <HomeModule
              testResults={testResults}
              summarizerHistory={summarizerHistory}
              userId={user.id}
            />
          </TabsContent>

          <TabsContent value="practice" className="space-y-6">
            <TestingModule testResults={testResults} userId={user.id} availableTests={availableTests} />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <CalendarModule userId={user.id} />
          </TabsContent>

          <TabsContent value="summarizer" className="space-y-6">
            <AISummarizer summarizerHistory={summarizerHistory} userId={user.id} />
          </TabsContent>

          <TabsContent value="flashcards" className="space-y-6">
            <FlashcardGenerator userId={user.id} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Mascot - follows mouse automatically */}
      <Mascot />
    </div>
  )
}

