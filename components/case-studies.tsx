"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, GraduationCap, Quote, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// Case study data (placeholder - replace with real student stories)
const caseStudies = [
    {
        id: 1,
        name: "Sarah Chen",
        image: "/images/student1.jpg",
        school: "Now at Stanford University",
        beforeScore: 1180,
        afterScore: 1520,
        improvement: 340,
        studyWeeks: 12,
        quote: "I was stuck at 1180 for months. ScoreBoost's AI identified my weak areas in reading comprehension and created a targeted plan. The improvement was incredible.",
        categories: {
            math: { before: 580, after: 780 },
            reading: { before: 600, after: 740 }
        },
        acceptedTo: ["Stanford", "UCLA", "UC Berkeley"],
        verified: true
    },
    {
        id: 2,
        name: "Marcus Johnson",
        image: "/images/student2.jpg",
        school: "Now at MIT",
        beforeScore: 1290,
        afterScore: 1560,
        improvement: 270,
        studyWeeks: 8,
        quote: "The personalized study plan was a game-changer. I went from struggling with advanced math to scoring perfect 800. Can't recommend it enough!",
        categories: {
            math: { before: 680, after: 800 },
            reading: { before: 610, after: 760 }
        },
        acceptedTo: ["MIT", "Caltech", "Harvard"],
        verified: true
    },
    {
        id: 3,
        name: "Emily Rodriguez",
        image: "/images/student3.jpg",
        school: "Now at Yale University",
        beforeScore: 1150,
        afterScore: 1480,
        improvement: 330,
        studyWeeks: 16,
        quote: "Starting from 1150, I never thought I could reach 1480. The AI tutor felt like having a personal coach available 24/7. Worth every penny.",
        categories: {
            math: { before: 560, after: 720 },
            reading: { before: 590, after: 760 }
        },
        acceptedTo: ["Yale", "Princeton", "Columbia"],
        verified: true
    },
    {
        id: 4,
        name: "David Kim",
        image: "/images/student4.jpg",
        school: "Now at Duke University",
        beforeScore: 1320,
        afterScore: 1540,
        improvement: 220,
        studyWeeks: 6,
        quote: "With only 6 weeks until my test, I was desperate. ScoreBoost's intensive plan focused exactly on what I needed. Improved 220 points!",
        categories: {
            math: { before: 700, after: 780 },
            reading: { before: 620, after: 760 }
        },
        acceptedTo: ["Duke", "Northwestern", "UVA"],
        verified: true
    },
]

// Aggregate stats
const aggregateStats = {
    totalStudents: "50,000+",
    avgImprovement: 204,
    successRate: "94%",
    topSchoolAcceptance: "78%",
}

interface CaseStudiesProps {
    variant?: 'carousel' | 'grid' | 'featured'
}

export function CaseStudies({ variant = 'carousel' }: CaseStudiesProps) {
    const [currentIndex, setCurrentIndex] = useState(0)

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % caseStudies.length)
    }

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + caseStudies.length) % caseStudies.length)
    }

    const currentStudy = caseStudies[currentIndex]

    if (variant === 'grid') {
        return (
            <section className="py-16 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <Badge className="mb-4 bg-green-100 text-green-800">Verified Results</Badge>
                        <h2 className="text-3xl md:text-4xl font-bold text-[#1B4B6B] mb-4">
                            Real Students, Real Results
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            These aren't just numbers—they're life-changing transformations backed by data.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {caseStudies.slice(0, 4).map((study) => (
                            <CaseStudyCard key={study.id} study={study} />
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    // Carousel variant (default)
    return (
        <section className="py-16 bg-gradient-to-br from-[#1B4B6B] to-[#0A2540]">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header with stats */}
                <div className="text-center mb-12">
                    <Badge className="mb-4 bg-white/20 text-white border-white/30">
                        Independently Verified
                    </Badge>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Success Stories That Speak for Themselves
                    </h2>

                    {/* Aggregate stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-3xl mx-auto">
                        <div className="bg-white/10 rounded-lg p-4">
                            <div className="text-2xl md:text-3xl font-bold text-white">{aggregateStats.totalStudents}</div>
                            <div className="text-white/70 text-sm">Students Helped</div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4">
                            <div className="text-2xl md:text-3xl font-bold text-[#bee9e8]">+{aggregateStats.avgImprovement}</div>
                            <div className="text-white/70 text-sm">Avg. Point Increase</div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4">
                            <div className="text-2xl md:text-3xl font-bold text-white">{aggregateStats.successRate}</div>
                            <div className="text-white/70 text-sm">Hit Their Goal</div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4">
                            <div className="text-2xl md:text-3xl font-bold text-[#bee9e8]">{aggregateStats.topSchoolAcceptance}</div>
                            <div className="text-white/70 text-sm">Top 50 Schools</div>
                        </div>
                    </div>
                </div>

                {/* Case study carousel */}
                <div className="relative">
                    <Card className="bg-white shadow-2xl overflow-hidden">
                        <div className="md:flex">
                            {/* Left side - Score transformation */}
                            <div className="md:w-2/5 bg-gradient-to-br from-[#bee9e8] to-[#cae9ff] p-8 flex flex-col justify-center">
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-4 mb-4">
                                        <div>
                                            <div className="text-4xl font-bold text-[#1B4B6B]">{currentStudy.beforeScore}</div>
                                            <div className="text-sm text-[#1B4B6B]/70">Before</div>
                                        </div>
                                        <TrendingUp className="h-8 w-8 text-green-600" />
                                        <div>
                                            <div className="text-4xl font-bold text-green-600">{currentStudy.afterScore}</div>
                                            <div className="text-sm text-[#1B4B6B]/70">After</div>
                                        </div>
                                    </div>
                                    <Badge className="bg-green-600 text-white text-lg px-4 py-1">
                                        +{currentStudy.improvement} Points
                                    </Badge>
                                    <p className="mt-4 text-sm text-[#1B4B6B]/70">
                                        In just {currentStudy.studyWeeks} weeks
                                    </p>

                                    {/* Section breakdown */}
                                    <div className="mt-6 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Math</span>
                                            <span className="font-medium">{currentStudy.categories.math.before} → {currentStudy.categories.math.after}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Reading</span>
                                            <span className="font-medium">{currentStudy.categories.reading.before} → {currentStudy.categories.reading.after}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right side - Testimonial */}
                            <div className="md:w-3/5 p-8">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500">
                                        {currentStudy.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-[#1B4B6B]">{currentStudy.name}</h3>
                                        <p className="text-gray-500 flex items-center gap-1">
                                            <GraduationCap className="h-4 w-4" />
                                            {currentStudy.school}
                                        </p>
                                        {currentStudy.verified && (
                                            <Badge variant="outline" className="mt-1 text-green-600 border-green-300">
                                                ✓ Verified Student
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <blockquote className="relative">
                                    <Quote className="absolute -left-2 -top-2 h-8 w-8 text-gray-200" />
                                    <p className="text-gray-700 italic pl-6 text-lg leading-relaxed">
                                        "{currentStudy.quote}"
                                    </p>
                                </blockquote>

                                <div className="mt-6">
                                    <p className="text-sm text-gray-500 mb-2">Accepted to:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {currentStudy.acceptedTo.map((school) => (
                                            <Badge key={school} variant="outline" className="bg-[#1B4B6B]/5">
                                                {school}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Navigation buttons */}
                    <div className="flex justify-center gap-4 mt-6">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={prevSlide}
                            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex items-center gap-2">
                            {caseStudies.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-6' : 'bg-white/30'
                                        }`}
                                />
                            ))}
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={nextSlide}
                            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center mt-10">
                    <Link href="/signup">
                        <Button className="bg-[#bee9e8] hover:bg-white text-[#1B4B6B] px-8 py-6 text-lg">
                            Join 50,000+ Successful Students
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}

function CaseStudyCard({ study }: { study: typeof caseStudies[0] }) {
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-500">
                        {study.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-bold text-[#1B4B6B]">{study.name}</h3>
                        <p className="text-sm text-gray-500">{study.school}</p>
                    </div>
                    {study.verified && (
                        <Badge variant="outline" className="ml-auto text-green-600 border-green-300 text-xs">
                            ✓ Verified
                        </Badge>
                    )}
                </div>

                <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl font-bold text-gray-400">{study.beforeScore}</span>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span className="text-2xl font-bold text-green-600">{study.afterScore}</span>
                    <Badge className="bg-green-100 text-green-800">+{study.improvement}</Badge>
                </div>

                <p className="text-gray-600 text-sm line-clamp-3">"{study.quote}"</p>

                <div className="mt-4 flex flex-wrap gap-1">
                    {study.acceptedTo.slice(0, 3).map((school) => (
                        <Badge key={school} variant="outline" className="text-xs">
                            {school}
                        </Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
