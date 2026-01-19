"use client"

import { useRef, useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
    Brain,
    Target,
    Zap,
    Shield,
    TrendingUp,
    Clock,
    Sparkles,
    CheckCircle2,
    XCircle,
    ArrowRight,
    RefreshCw
} from "lucide-react"

// The unique methodology pillars
const methodologyPillars = [
    {
        icon: Brain,
        title: "Adaptive Intelligence Engine™",
        subtitle: "Not just AI—predictive AI",
        description: "Our proprietary algorithm doesn't just track what you get wrong. It predicts what you'll struggle with next and preemptively teaches you, cutting study time by 40%.",
        stats: "40% faster improvement",
        color: "#4ECDC4",
    },
    {
        icon: Target,
        title: "Weakness-First Targeting",
        subtitle: "Surgical precision, not carpet bombing",
        description: "While others give you 1,000 random questions, we identify your exact 3-5 weak concepts and attack them relentlessly until they become strengths.",
        stats: "5x more effective practice",
        color: "#FF6B6B",
    },
    {
        icon: RefreshCw,
        title: "Dynamic Difficulty Calibration",
        subtitle: "Always in your growth zone",
        description: "Questions automatically adjust difficulty in real-time. Too easy? We push harder. Struggling? We step back. You're always learning optimally.",
        stats: "Never plateau",
        color: "#9B59B6",
    },
]

// What makes us different from competitors
const competitorComparison = [
    {
        feature: "Real-time adaptive difficulty",
        us: true,
        khan: false,
        prepscholar: false,
        kaplan: false,
    },
    {
        feature: "AI explains YOUR specific mistakes",
        us: true,
        khan: false,
        prepscholar: "Partial",
        kaplan: false,
    },
    {
        feature: "Money-back score guarantee",
        us: "200+ points",
        khan: false,
        prepscholar: "160 points",
        kaplan: "Vague",
    },
    {
        feature: "Price per month",
        us: "$15",
        khan: "Free",
        prepscholar: "$399+",
        kaplan: "$199+",
    },
    {
        feature: "24/7 AI tutoring",
        us: true,
        khan: false,
        prepscholar: false,
        kaplan: false,
    },
    {
        feature: "Personalized to YOUR test date",
        us: true,
        khan: false,
        prepscholar: true,
        kaplan: true,
    },
]

// The guarantee details
const guaranteeDetails = [
    "Improve 200+ points or 100% money back",
    "Must complete 80% of recommended lessons",
    "Applies to official SAT score comparison",
    "No fine print, no hassle refund process",
]

function ComparisonIcon({ value }: { value: boolean | string }) {
    if (value === true) {
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
    }
    if (value === false) {
        return <XCircle className="h-5 w-5 text-red-400" />
    }
    return <span className="text-sm font-medium text-amber-600">{value}</span>
}

export function UniqueValueProp() {
    const [activeTab, setActiveTab] = useState(0)
    const sectionRef = useRef<HTMLDivElement>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                }
            },
            { threshold: 0.2 }
        )

        if (sectionRef.current) {
            observer.observe(sectionRef.current)
        }

        return () => observer.disconnect()
    }, [])

    return (
        <section ref={sectionRef} className="py-20 bg-gradient-to-b from-[#0A2540] to-[#1B4B6B]">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <Badge className="mb-4 bg-[#bee9e8]/20 text-[#bee9e8] border border-[#bee9e8]/30">What Makes Us Different</Badge>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        We're Not Just Another SAT Prep.
                        <br />
                        <span className="text-[#bee9e8]">We're the Last One You'll Need.</span>
                    </h2>
                    <p className="text-lg text-white/70 max-w-3xl mx-auto">
                        Khan Academy is free but generic. PrepScholar costs $400+ and overwhelms you.
                        Kaplan's one-size-fits-all approach wastes time. <strong className="text-white">We built something better.</strong>
                    </p>
                </div>

                {/* The Three Pillars */}
                <div className="grid md:grid-cols-3 gap-6 mb-20">
                    {methodologyPillars.map((pillar, index) => {
                        const Icon = pillar.icon
                        return (
                            <Card
                                key={pillar.title}
                                className={`relative overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                                    }`}
                                style={{ transitionDelay: `${index * 150}ms` }}
                            >
                                <div
                                    className="absolute top-0 left-0 right-0 h-1"
                                    style={{ backgroundColor: pillar.color }}
                                />
                                <CardContent className="pt-8 pb-6">
                                    <div
                                        className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                                        style={{ backgroundColor: `${pillar.color}30` }}
                                    >
                                        <Icon className="h-7 w-7" style={{ color: pillar.color }} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-1">
                                        {pillar.title}
                                    </h3>
                                    <p className="text-sm text-[#bee9e8] font-medium mb-3">
                                        {pillar.subtitle}
                                    </p>
                                    <p className="text-white/70 text-sm leading-relaxed mb-4">
                                        {pillar.description}
                                    </p>
                                    <Badge variant="outline" className="text-xs border-white/30 text-white/80">
                                        {pillar.stats}
                                    </Badge>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {/* Side-by-side Comparison */}
                <div className="mb-20">
                    <div className="text-center mb-10">
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                            The Honest Comparison
                        </h3>
                        <p className="text-white/60">
                            We could trash-talk competitors. Instead, here are the facts.
                        </p>
                    </div>

                    <Card className="overflow-hidden shadow-lg">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-[#1B4B6B] text-white">
                                        <th className="text-left p-4 font-semibold">Feature</th>
                                        <th className="p-4 text-center bg-theme">
                                            <div className="font-bold">ScoreBoost</div>
                                            <div className="text-xs opacity-80">That's us</div>
                                        </th>
                                        <th className="p-4 text-center">Khan Academy</th>
                                        <th className="p-4 text-center">PrepScholar</th>
                                        <th className="p-4 text-center">Kaplan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {competitorComparison.map((row, index) => (
                                        <tr key={index} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                            <td className="p-4 font-medium text-gray-700">{row.feature}</td>
                                            <td className="p-4 text-center bg-theme/5">
                                                <div className="flex justify-center">
                                                    <ComparisonIcon value={row.us} />
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex justify-center">
                                                    <ComparisonIcon value={row.khan} />
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex justify-center">
                                                    <ComparisonIcon value={row.prepscholar} />
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex justify-center">
                                                    <ComparisonIcon value={row.kaplan} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* The Guarantee Section */}
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1B4B6B] to-[#0A2540] rounded-3xl" />
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl" />
                        <div className="absolute bottom-0 right-0 w-60 h-60 bg-theme rounded-full blur-3xl" />
                    </div>

                    <div className="relative p-10 md:p-16 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 mb-6">
                            <Shield className="h-10 w-10 text-[#bee9e8]" />
                        </div>

                        <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            The 200+ Point Guarantee
                        </h3>
                        <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                            We're so confident in our method, we put our money where our mouth is.
                            Improve 200+ points or get a <strong>full refund</strong>. No questions asked.
                        </p>

                        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-10">
                            {guaranteeDetails.map((detail, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-left text-white/90 text-sm">
                                    <CheckCircle2 className="h-5 w-5 text-[#bee9e8] shrink-0" />
                                    <span>{detail}</span>
                                </div>
                            ))}
                        </div>

                        <Link href="/signup">
                            <Button className="bg-[#bee9e8] hover:bg-white text-[#1B4B6B] px-10 py-7 text-lg font-semibold shadow-xl">
                                <Zap className="h-5 w-5 mr-2" />
                                Start Risk-Free Today
                                <ArrowRight className="h-5 w-5 ml-2" />
                            </Button>
                        </Link>

                        <p className="mt-4 text-white/60 text-sm">
                            7-day free trial • Cancel anytime • No credit card for trial
                        </p>
                    </div>
                </div>

                {/* Why this works callout */}
                <div className="mt-16 text-center">
                    <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 max-w-3xl">
                        <Sparkles className="h-8 w-8 text-[#bee9e8] mx-auto mb-4" />
                        <h4 className="text-xl font-bold text-white mb-3">
                            Why Others Can't Copy This
                        </h4>
                        <p className="text-white/70">
                            Our Adaptive Intelligence Engine is built on <strong className="text-white">3+ years of learning data</strong> from
                            50,000+ students. Every question you answer makes the algorithm smarter—for you
                            and everyone who follows. This compounding advantage is impossible to replicate overnight.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
