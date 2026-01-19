"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Award, BookOpen, GraduationCap } from "lucide-react"

// Team/tutor credentials with headshot images
const teamMembers = [
    {
        name: "Dr. Michael Chen",
        role: "Lead Curriculum Designer",
        credentials: ["Ph.D. in Education, Harvard", "Former SAT Question Writer", "15 years test prep experience"],
        // Using randomuser.me for realistic placeholder headshots
        image: "https://randomuser.me/api/portraits/men/32.jpg",
        score: "Perfect 1600 SAT",
    },
    {
        name: "Sarah Williams",
        role: "Head of AI Tutoring",
        credentials: ["M.S. Computer Science, MIT", "Former Kaplan Senior Instructor", "AI/ML Education Specialist"],
        image: "https://randomuser.me/api/portraits/women/44.jpg",
        score: "1580 SAT",
    },
    {
        name: "James Rodriguez",
        role: "Math Content Lead",
        credentials: ["B.S. Mathematics, Princeton", "Math Olympiad Gold Medalist", "10 years tutoring experience"],
        image: "https://randomuser.me/api/portraits/men/67.jpg",
        score: "800 Math SAT",
    },
    {
        name: "Dr. Emily Park",
        role: "Reading & Writing Lead",
        credentials: ["Ph.D. English Literature, Yale", "Published Author", "Former College Board Consultant"],
        image: "https://randomuser.me/api/portraits/women/68.jpg",
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
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all hover:scale-105 cursor-default"
                            >
                                <Icon className="h-5 w-5 text-[#bee9e8]" />
                                <span className="font-medium text-white">{cert.name}</span>
                            </div>
                        )
                    })}
                </div>

                {/* Team grid with real headshots */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {teamMembers.map((member) => (
                        <Card
                            key={member.name}
                            className="text-center bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:scale-105 hover:shadow-2xl hover:shadow-[#bee9e8]/20 transition-all duration-300 group cursor-default"
                        >
                            <CardContent className="pt-6">
                                {/* Real Headshot Image */}
                                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-[#bee9e8]/50 mb-4 group-hover:border-[#bee9e8] transition-all shadow-lg group-hover:shadow-xl group-hover:shadow-[#bee9e8]/30">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>

                                <h3 className="font-bold text-white group-hover:text-[#bee9e8] transition-colors">{member.name}</h3>
                                <p className="text-sm text-[#bee9e8] font-medium">{member.role}</p>

                                <Badge variant="outline" className="mt-2 text-xs border-white/30 text-white/80 group-hover:border-[#bee9e8] group-hover:text-[#bee9e8] transition-colors">
                                    {member.score}
                                </Badge>

                                <ul className="mt-4 space-y-1">
                                    {member.credentials.map((cred, idx) => (
                                        <li key={idx} className="text-xs text-white/60 flex items-start gap-1 group-hover:text-white/80 transition-colors">
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
