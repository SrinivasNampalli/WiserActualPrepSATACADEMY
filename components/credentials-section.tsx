"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Award, BookOpen, GraduationCap } from "lucide-react"

// Team/tutor credentials (placeholder - replace with real bios)
const teamMembers = [
    {
        name: "Dr. Michael Chen",
        role: "Lead Curriculum Designer",
        credentials: ["Ph.D. in Education, Harvard", "Former SAT Question Writer", "15 years test prep experience"],
        avatar: "MC",
        score: "Perfect 1600 SAT",
    },
    {
        name: "Sarah Williams",
        role: "Head of AI Tutoring",
        credentials: ["M.S. Computer Science, MIT", "Former Kaplan Senior Instructor", "AI/ML Education Specialist"],
        avatar: "SW",
        score: "1580 SAT",
    },
    {
        name: "James Rodriguez",
        role: "Math Content Lead",
        credentials: ["B.S. Mathematics, Princeton", "Math Olympiad Gold Medalist", "10 years tutoring experience"],
        avatar: "JR",
        score: "800 Math SAT",
    },
    {
        name: "Dr. Emily Park",
        role: "Reading & Writing Lead",
        credentials: ["Ph.D. English Literature, Yale", "Published Author", "Former College Board Consultant"],
        avatar: "EP",
        score: "800 R&W SAT",
    },
]

const certifications = [
    { name: "College Board Certified", icon: Award },
    { name: "NACAC Member", icon: GraduationCap },
    { name: "EdTech Verified", icon: CheckCircle2 },
    { name: "SOC 2 Compliant", icon: BookOpen },
]

interface CredentialsSectionProps {
    variant?: 'full' | 'compact'
}

export function CredentialsSection({ variant = 'full' }: CredentialsSectionProps) {
    if (variant === 'compact') {
        return (
            <div className="bg-[#1B4B6B] py-8">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex flex-wrap justify-center items-center gap-6">
                        {certifications.map((cert) => {
                            const Icon = cert.icon
                            return (
                                <div key={cert.name} className="flex items-center gap-2 text-white/80">
                                    <Icon className="h-5 w-5 text-[#bee9e8]" />
                                    <span className="font-medium">{cert.name}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <section className="py-16 bg-gradient-to-b from-[#1B4B6B] to-[#0A2540]">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-12">
                    <Badge className="mb-4 bg-[#bee9e8]/20 text-[#bee9e8] border border-[#bee9e8]/30">Expert Team</Badge>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Built by SAT Experts, Powered by AI
                    </h2>
                    <p className="text-lg text-white/70 max-w-2xl mx-auto">
                        Our curriculum is designed by former test writers, Ivy League educators, and AI specialists
                        with a combined 50+ years of experience.
                    </p>
                </div>

                {/* Certifications bar */}
                <div className="flex flex-wrap justify-center gap-6 mb-12 p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    {certifications.map((cert) => {
                        const Icon = cert.icon
                        return (
                            <div
                                key={cert.name}
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg"
                            >
                                <Icon className="h-5 w-5 text-[#bee9e8]" />
                                <span className="font-medium text-white">{cert.name}</span>
                            </div>
                        )
                    })}
                </div>

                {/* Team grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {teamMembers.map((member) => (
                        <Card key={member.name} className="text-center bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all">
                            <CardContent className="pt-6">
                                {/* Avatar */}
                                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#bee9e8] to-[#4ECDC4] flex items-center justify-center text-[#1B4B6B] text-xl font-bold mb-4">
                                    {member.avatar}
                                </div>

                                <h3 className="font-bold text-white">{member.name}</h3>
                                <p className="text-sm text-[#bee9e8] font-medium">{member.role}</p>

                                <Badge variant="outline" className="mt-2 text-xs border-white/30 text-white/80">
                                    {member.score}
                                </Badge>

                                <ul className="mt-4 space-y-1">
                                    {member.credentials.map((cred, idx) => (
                                        <li key={idx} className="text-xs text-white/60 flex items-start gap-1">
                                            <CheckCircle2 className="h-3 w-3 text-[#bee9e8] shrink-0 mt-0.5" />
                                            {cred}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Trust statement */}
                <div className="mt-12 text-center">
                    <p className="text-white/50 text-sm">
                        All tutors undergo rigorous vetting • Background checked • Ongoing training required
                    </p>
                </div>
            </div>
        </section>
    )
}
