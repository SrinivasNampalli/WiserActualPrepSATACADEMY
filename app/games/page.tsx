"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Gamepad2 } from "lucide-react"

const games = [
    {
        id: "comma-fall",
        title: "Comma Fall",
        description: "Catch the correct punctuation mark before it falls! Practice commas, semicolons, and more.",
        emoji: "✨",
        category: "Writing",
        difficulty: "Easy",
        color: "from-pink-500 to-rose-600"
    },
    {
        id: "connections",
        title: "Word Connections",
        description: "Find groups of 4 words that share a common SAT theme. Like NYT Connections!",
        emoji: "🔗",
        category: "Vocabulary",
        difficulty: "Medium",
        color: "from-blue-500 to-indigo-600"
    },
    {
        id: "transition-tracks",
        title: "Transition Tracks",
        description: "Pick the right transition word before the train leaves! Master SAT transition words.",
        emoji: "🚂",
        category: "Writing",
        difficulty: "Medium",
        color: "from-emerald-500 to-green-600"
    },
    {
        id: "word-roots",
        title: "Word Roots",
        description: "Learn Greek and Latin roots to unlock thousands of vocabulary words.",
        emoji: "📚",
        category: "Vocabulary",
        difficulty: "Hard",
        color: "from-purple-500 to-violet-600"
    }
]

export default function GamesPage() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <header className="flex items-center justify-between mb-8">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Dashboard</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">SAT Games</h1>
                    <div className="w-20" />
                </header>

                {/* Hero */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
                        <Gamepad2 className="w-5 h-5 text-primary" />
                        <span className="font-medium text-primary">Learn While Playing</span>
                    </div>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        SAT Prep Games
                    </h2>
                    <p className="text-gray-600 max-w-md mx-auto">
                        Make studying fun! Practice vocabulary, grammar, and writing skills through interactive games.
                    </p>
                </div>

                {/* Games Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    {games.map((game) => (
                        <Link href={`/games/${game.id}`} key={game.id}>
                            <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group overflow-hidden">
                                <div className={`h-2 bg-gradient-to-r ${game.color}`} />
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="text-5xl mb-2">{game.emoji}</div>
                                        <div className="flex gap-2">
                                            <Badge variant="outline" className="text-xs">
                                                {game.category}
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className={`text-xs ${game.difficulty === "Easy"
                                                        ? "border-green-300 text-green-600"
                                                        : game.difficulty === "Medium"
                                                            ? "border-yellow-300 text-yellow-600"
                                                            : "border-red-300 text-red-600"
                                                    }`}
                                            >
                                                {game.difficulty}
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                                        {game.title}
                                    </CardTitle>
                                    <CardDescription className="text-gray-600">
                                        {game.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                                        <span>Play Now</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                {/* Tips section */}
                <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3">💡 Pro Tips</h3>
                    <ul className="space-y-2 text-gray-600 text-sm">
                        <li>• Play Word Roots daily to build vocabulary faster</li>
                        <li>• Connections helps you see patterns in SAT vocab</li>
                        <li>• Comma Fall teaches punctuation rules through practice</li>
                        <li>• Try to beat your high score each day!</li>
                    </ul>
                </div>
            </div>
        </main>
    )
}
