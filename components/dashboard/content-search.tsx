"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Loader2, ExternalLink, Sparkles, BookOpen, RefreshCw } from "lucide-react"

interface SearchResult {
    query: string
    aiSummary: string | null
    sources: {
        title: string
        snippet: string
        url: string
        source: string
    }[]
    relatedSearches: string[]
    totalResults: number
}

export function ContentSearch() {
    const [query, setQuery] = useState("")
    const [isSearching, setIsSearching] = useState(false)
    const [result, setResult] = useState<SearchResult | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleSearch = async (searchQuery?: string) => {
        const q = searchQuery || query
        if (!q.trim()) return

        setIsSearching(true)
        setError(null)

        try {
            const response = await fetch("/api/content-search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: q }),
            })

            if (!response.ok) throw new Error("Search failed")

            const data = await response.json()
            setResult(data)
            if (searchQuery) setQuery(searchQuery)
        } catch (err) {
            setError("Failed to search. Please try again.")
            console.error(err)
        } finally {
            setIsSearching(false)
        }
    }

    const suggestedSearches = [
        "Quadratic equations",
        "Reading comprehension strategies",
        "Grammar rules",
        "Word problems",
        "Rhetorical analysis",
    ]

    return (
        <Card className="border-2 border-[#4ECDC4]/30 bg-gradient-to-br from-[#4ECDC4]/5 to-transparent">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-[#4ECDC4]" />
                    SAT Content Search
                </CardTitle>
                <CardDescription>
                    Search any SAT topic and get AI-powered explanations from educational sources
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Search Input */}
                <div className="flex gap-2">
                    <Input
                        placeholder="Search any SAT topic... (e.g., 'parallel structure', 'circle theorems')"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="flex-1"
                    />
                    <Button
                        onClick={() => handleSearch()}
                        disabled={isSearching || !query.trim()}
                        className="bg-[#1B4B6B] hover:bg-[#153a52]"
                    >
                        {isSearching ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Search className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                {/* Suggested Searches */}
                {!result && (
                    <div className="flex flex-wrap gap-2">
                        <span className="text-sm text-muted-foreground">Try:</span>
                        {suggestedSearches.map((suggestion) => (
                            <Badge
                                key={suggestion}
                                variant="outline"
                                className="cursor-pointer hover:bg-[#4ECDC4]/20 transition-colors"
                                onClick={() => handleSearch(suggestion)}
                            >
                                {suggestion}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center py-4 text-red-500">
                        <p>{error}</p>
                    </div>
                )}

                {/* Results */}
                {result && (
                    <div className="space-y-4 mt-4">
                        {/* AI Summary */}
                        {result.aiSummary && (
                            <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2 text-purple-700">
                                        <Sparkles className="h-4 w-4" />
                                        AI Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
                                        {result.aiSummary}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Sources */}
                        {result.sources.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    Sources ({result.sources.length})
                                </h4>
                                {result.sources.map((source, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <h5 className="font-medium text-sm line-clamp-1">
                                                    {source.title}
                                                </h5>
                                                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                                    {source.snippet}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <Badge variant="secondary" className="text-xs">
                                                    {source.source}
                                                </Badge>
                                                {source.url && (
                                                    <a
                                                        href={source.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-500 hover:text-blue-700"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Related Searches */}
                        {result.relatedSearches && result.relatedSearches.length > 0 && (
                            <div className="pt-2">
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                                    Related searches:
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {result.relatedSearches.map((search, idx) => (
                                        <Badge
                                            key={idx}
                                            variant="outline"
                                            className="cursor-pointer hover:bg-[#4ECDC4]/20 transition-colors"
                                            onClick={() => handleSearch(search)}
                                        >
                                            <RefreshCw className="h-3 w-3 mr-1" />
                                            {search}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No Results */}
                        {result.sources.length === 0 && !result.aiSummary && (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>No results found for "{result.query}"</p>
                                <p className="text-sm mt-1">Try a different search term</p>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
