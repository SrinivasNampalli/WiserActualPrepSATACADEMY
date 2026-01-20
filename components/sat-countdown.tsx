"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, AlertCircle } from "lucide-react"

// SAT 2025-2026 Test Dates (update as needed)
const SAT_DATES = [
    { date: new Date('2025-03-08'), name: 'March SAT' },
    { date: new Date('2025-05-03'), name: 'May SAT' },
    { date: new Date('2025-06-07'), name: 'June SAT' },
    { date: new Date('2025-08-23'), name: 'August SAT' },
    { date: new Date('2025-10-04'), name: 'October SAT' },
    { date: new Date('2025-11-01'), name: 'November SAT' },
    { date: new Date('2025-12-06'), name: 'December SAT' },
    { date: new Date('2026-03-14'), name: 'March SAT' },
    { date: new Date('2026-05-02'), name: 'May SAT' },
    { date: new Date('2026-06-06'), name: 'June SAT' },
]

function getNextSATDate(): { date: Date; name: string; daysUntil: number } | null {
    const now = new Date()
    for (const sat of SAT_DATES) {
        const daysUntil = Math.ceil((sat.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        if (daysUntil > 0) {
            return { ...sat, daysUntil }
        }
    }
    return null
}

interface SATCountdownProps {
    variant?: 'banner' | 'card' | 'inline'
    showIcon?: boolean
}

export function SATCountdown({ variant = 'inline', showIcon = true }: SATCountdownProps) {
    const [nextSAT, setNextSAT] = useState<ReturnType<typeof getNextSATDate>>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        setNextSAT(getNextSATDate())

        // Update every hour
        const interval = setInterval(() => {
            setNextSAT(getNextSATDate())
        }, 1000 * 60 * 60)

        return () => clearInterval(interval)
    }, [])

    if (!mounted || !nextSAT) return null

    const isUrgent = nextSAT.daysUntil <= 60
    const isCritical = nextSAT.daysUntil <= 30

    if (variant === 'banner') {
        return (
            <div className={`w-full py-3 px-4 text-center font-medium relative overflow-hidden ${isCritical
                    ? 'bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white'
                    : isUrgent
                        ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white'
                        : 'bg-gradient-to-r from-[#1B4B6B] via-[#0A2540] to-[#1B4B6B] text-white'
                }`}>
                {/* Animated pulse background */}
                <div className={`absolute inset-0 ${isCritical ? 'animate-pulse bg-red-400/20' : isUrgent ? 'animate-pulse bg-amber-400/20' : ''
                    }`} />

                <div className="relative flex items-center justify-center gap-3">
                    {/* Warning icon with animation */}
                    <div className={`flex items-center justify-center ${isCritical || isUrgent ? 'animate-bounce' : ''}`}>
                        <AlertCircle className={`h-5 w-5 ${isCritical ? 'text-yellow-300' : 'text-white'}`} />
                    </div>

                    <span className="text-base md:text-lg">
                        {isCritical ? (
                            <>
                                <span className="hidden md:inline">⚠️ WARNING: </span>
                                <span className="font-bold text-yellow-300">{nextSAT.daysUntil} DAYS</span>
                                <span> until {nextSAT.name} — </span>
                                <span className="font-bold underline decoration-2">START PREP NOW!</span>
                            </>
                        ) : isUrgent ? (
                            <>
                                <span className="hidden md:inline">⏰ </span>
                                <span className="font-bold">{nextSAT.daysUntil} days</span>
                                <span> until {nextSAT.name} — </span>
                                <span className="font-semibold">Time is running out!</span>
                            </>
                        ) : (
                            <>
                                <Calendar className="h-4 w-4 inline mr-1" />
                                <span className="font-bold">{nextSAT.daysUntil} days</span>
                                <span> until {nextSAT.name}</span>
                                <span className="hidden md:inline"> — Start preparing today</span>
                            </>
                        )}
                    </span>

                    {/* Warning icon with animation (right side) */}
                    <div className={`flex items-center justify-center ${isCritical || isUrgent ? 'animate-bounce' : ''}`}>
                        <AlertCircle className={`h-5 w-5 ${isCritical ? 'text-yellow-300' : 'text-white'}`} />
                    </div>
                </div>

                {/* Shimmer effect for critical urgency */}
                {isCritical && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"
                        style={{ animation: 'shimmer 2s infinite' }} />
                )}
            </div>
        )
    }

    if (variant === 'card') {
        return (
            <div className={`rounded-lg p-4 ${isCritical
                ? 'bg-red-50 border-2 border-red-200'
                : isUrgent
                    ? 'bg-amber-50 border-2 border-amber-200'
                    : 'bg-theme-base/10 border-2 border-theme/20'
                }`}>
                <div className="flex items-center gap-3">
                    <div className={`rounded-full p-2 ${isCritical
                        ? 'bg-red-100 text-red-600'
                        : isUrgent
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-theme-base/20 text-theme'
                        }`}>
                        <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="font-bold text-lg">
                            {nextSAT.daysUntil} days until {nextSAT.name}
                        </div>
                        <div className="text-sm text-gray-600">
                            {nextSAT.date.toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Inline variant
    return (
        <span className={`inline-flex items-center gap-1 text-sm font-medium ${isCritical
            ? 'text-red-600'
            : isUrgent
                ? 'text-amber-600'
                : 'text-theme'
            }`}>
            {showIcon && <Clock className="h-4 w-4" />}
            <span>{nextSAT.daysUntil} days to {nextSAT.name}</span>
        </span>
    )
}

/**
 * Urgency-driven CTA button with SAT countdown
 */
interface UrgencyCTAProps {
    children: React.ReactNode
    onClick?: () => void
    href?: string
    className?: string
}

export function UrgencyCTA({ children, onClick, href, className = '' }: UrgencyCTAProps) {
    const nextSAT = getNextSATDate()
    const isUrgent = nextSAT && nextSAT.daysUntil <= 60

    return (
        <div className="flex flex-col items-center gap-2">
            <button
                onClick={onClick}
                className={`inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all ${className}`}
            >
                {children}
            </button>
            {isUrgent && nextSAT && (
                <span className="text-xs text-gray-500">
                    Only <strong className="text-red-600">{nextSAT.daysUntil} days</strong> until the next SAT!
                </span>
            )}
        </div>
    )
}
