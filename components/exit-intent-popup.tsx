"use client"

import { useState, useEffect } from "react"
import { X, Sparkles, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface ExitIntentPopupProps {
    enabled?: boolean
}

export function ExitIntentPopup({ enabled = true }: ExitIntentPopupProps) {
    const [isVisible, setIsVisible] = useState(false)
    const [hasShown, setHasShown] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (!enabled) return

        // Check if already shown this session
        const alreadyShown = sessionStorage.getItem('exitIntentShown')
        if (alreadyShown) {
            setHasShown(true)
            return
        }

        const handleMouseLeave = (e: MouseEvent) => {
            // Only trigger when mouse leaves from top of page
            if (e.clientY <= 0 && !hasShown) {
                setIsVisible(true)
                setHasShown(true)
                sessionStorage.setItem('exitIntentShown', 'true')
            }
        }

        // Also trigger after 30 seconds of inactivity
        let inactivityTimer: NodeJS.Timeout
        const resetTimer = () => {
            clearTimeout(inactivityTimer)
            inactivityTimer = setTimeout(() => {
                if (!hasShown) {
                    setIsVisible(true)
                    setHasShown(true)
                    sessionStorage.setItem('exitIntentShown', 'true')
                }
            }, 30000) // 30 seconds
        }

        document.addEventListener('mouseleave', handleMouseLeave)
        document.addEventListener('mousemove', resetTimer)
        document.addEventListener('scroll', resetTimer)
        resetTimer()

        return () => {
            document.removeEventListener('mouseleave', handleMouseLeave)
            document.removeEventListener('mousemove', resetTimer)
            document.removeEventListener('scroll', resetTimer)
            clearTimeout(inactivityTimer)
        }
    }, [enabled, hasShown])

    if (!isVisible) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Close button */}
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-theme-base to-theme-dark p-6 text-white text-center">
                    <div className="flex justify-center mb-3">
                        <div className="bg-white/20 rounded-full p-3">
                            <Clock className="h-8 w-8" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold mb-1">Wait! Don't Leave Yet</h2>
                    <p className="text-white/90 text-sm">Your SAT score improvement is just one click away</p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <div className="text-center">
                        <p className="text-gray-700 mb-4">
                            <strong>The next SAT is in just weeks!</strong> Students who start prep now see
                            <span className="text-theme font-bold"> 150+ point improvements</span> on average.
                        </p>
                    </div>

                    {/* Urgency stats */}
                    <div className="grid grid-cols-3 gap-3 text-center py-3 bg-gray-50 rounded-lg">
                        <div>
                            <div className="text-2xl font-bold text-theme">50K+</div>
                            <div className="text-xs text-gray-500">Students</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-theme">200+</div>
                            <div className="text-xs text-gray-500">Avg. Point Gain</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-theme">$15</div>
                            <div className="text-xs text-gray-500">/month</div>
                        </div>
                    </div>

                    {/* CTA buttons */}
                    <div className="space-y-3">
                        <Button
                            onClick={() => {
                                setIsVisible(false)
                                router.push('/signup')
                            }}
                            className="w-full bg-theme-base hover:bg-theme-dark text-white py-6 text-lg"
                        >
                            <Sparkles className="h-5 w-5 mr-2" />
                            Start My Free Trial
                            <ArrowRight className="h-5 w-5 ml-2" />
                        </Button>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
                        >
                            No thanks, I'll risk my score
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
