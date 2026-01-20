"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, User, Shield, Home, Target, Sparkles, Gamepad2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { HomeModule } from "./home-module"
import { TestingModule } from "./testing-module"
import { AIToolsCombined } from "./ai-tools-combined"
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="home" className="gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </TabsTrigger>
            <TabsTrigger value="practice" className="gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Practice</span>
            </TabsTrigger>
            <TabsTrigger value="ai-tools" className="gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">AI Tools</span>
            </TabsTrigger>
            <TabsTrigger value="games" className="gap-2">
              <Gamepad2 className="h-4 w-4" />
              <span className="hidden sm:inline">Games</span>
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

          <TabsContent value="ai-tools" className="space-y-6">
            <AIToolsCombined summarizerHistory={summarizerHistory} userId={user.id} />
          </TabsContent>

          <TabsContent value="games" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">SAT Prep Games</h2>
              <p className="text-gray-600">Make studying fun with interactive games!</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { id: "comma-fall", title: "Comma Fall", emoji: "✨", desc: "Catch the correct punctuation!", color: "from-pink-500 to-rose-600" },
                { id: "connections", title: "Word Connections", emoji: "🔗", desc: "Find groups of 4 related words", color: "from-blue-500 to-indigo-600" },
                { id: "transition-tracks", title: "Transition Tracks", emoji: "🚂", desc: "Pick transitions before the train leaves!", color: "from-emerald-500 to-green-600" },
                { id: "word-roots", title: "Word Roots", emoji: "📚", desc: "Learn Greek & Latin roots", color: "from-purple-500 to-violet-600" },
              ].map(game => (
                <a
                  key={game.id}
                  href={`/games/${game.id}`}
                  className="block p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all"
                >
                  <div className={`inline-block px-3 py-1 rounded-full text-white text-xs font-medium bg-gradient-to-r ${game.color} mb-3`}>
                    {game.emoji}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">{game.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{game.desc}</p>
                </a>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Mascot - follows mouse automatically */}
      <Mascot />
    </div>
  )
}

