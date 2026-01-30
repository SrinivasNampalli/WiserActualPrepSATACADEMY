"use client"

import { useState, useEffect } from "react"
import { X, Sparkles, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface ExitIntentPopupProps {
    enabled?: boolean
}

export function ExitIntentPopup({ enabled = true }: ExitIntentPopupProps) {
    const [isVisible, setIsVisible] = useState(false)
    const [hasShown, setHasShown] = useState(false)
    // Stagger states
    const [showContent, setShowContent] = useState(false)

    const router = useRouter()

    useEffect(() => {
        if (!enabled) return

        // REMOVED SESSION STORAGE CHECK - makes it appear every time (annoying)
        // const alreadyShown = sessionStorage.getItem('exitIntentShown')
        // if (alreadyShown) {
        //     setHasShown(true)
        //     return
        // }

        const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY <= 0 && !hasShown) {
                triggerPopup()
            }
        }

        let inactivityTimer: NodeJS.Timeout
        const resetTimer = () => {
            clearTimeout(inactivityTimer)
            inactivityTimer = setTimeout(() => {
                if (!hasShown) triggerPopup()
            }, 1000) // 1 second (almost immediate)
        }

        const triggerPopup = () => {
            setIsVisible(true)
            setHasShown(true)
            // sessionStorage.setItem('exitIntentShown', 'true') // Always show
            setTimeout(() => setShowContent(true), 100)
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
        // Added pointer-events-none to container and pointer-events-auto to modal to verify click behavior
        // But mainly just NOT adding onClick to the backdrop div to effectively disable backdrop click
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">

                {/* Close Button */}
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="flex flex-col md:flex-row">
                    {/* Left/Top Branding Side */}
                    <div className="bg-[#0D2240] p-6 text-white text-center md:w-2/5 flex flex-col items-center justify-center relative overlow-hidden">
                        <div className="animate-in fade-in zoom-in duration-700 delay-100">
                            {/* Using static image for thinking mascot */}
                            <div className="relative w-32 h-32 mb-4 rounded-full overflow-hidden border-4 border-white shadow-xl mx-auto ring-4 ring-blue-400/30">
                                <Image
                                    src="/ai-tutor.png"
                                    alt="AI Tutor"
                                    fill
                                    className="object-cover object-top"
                                />
                            </div>
                        </div>
                        <h2 className="text-xl font-bold mb-2 animate-in slide-in-from-bottom-2 fade-in duration-500 delay-200">
                            Wait!
                        </h2>
                        <p className="text-white/80 text-xs animate-in slide-in-from-bottom-2 fade-in duration-500 delay-300">
                            Don't miss your chance to improve.
                        </p>
                    </div>

                    {/* Content Side */}
                    <div className="p-6 md:w-3/5 flex flex-col justify-center">
                        <div className="space-y-4">
                            <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 delay-300 fill-mode-backwards">
                                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                    The SAT is coming up fast!
                                </h3>
                                <p className="text-gray-600 text-sm mt-1">
                                    Join <span className="text-theme font-bold">50,000+ students</span> improving their score by 150+ points.
                                </p>
                            </div>

                            {/* Urgency stats with sequential reveal */}
                            <div className="grid grid-cols-2 gap-2 text-center py-2">
                                <div className="bg-gray-50 p-2 rounded-lg animate-in slide-in-from-bottom-4 fade-in duration-500 delay-400 fill-mode-backwards">
                                    <div className="text-xl font-bold text-theme">200+</div>
                                    <div className="text-[10px] uppercase tracking-wide text-gray-500">Avg Gain</div>
                                </div>
                                <div className="bg-gray-50 p-2 rounded-lg animate-in slide-in-from-bottom-4 fade-in duration-500 delay-500 fill-mode-backwards">
                                    <div className="text-xl font-bold text-theme">Free</div>
                                    <div className="text-[10px] uppercase tracking-wide text-gray-500">Trial</div>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <Button
                                    onClick={() => {
                                        setIsVisible(false)
                                        router.push('/signup')
                                    }}
                                    className="w-full bg-theme-base hover:bg-theme-dark text-white shadow-lg animate-in slide-in-from-bottom-4 fade-in duration-500 delay-600 fill-mode-backwards"
                                >
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Get My Reading Plan
                                </Button>

                                <button
                                    onClick={() => setIsVisible(false)}
                                    className="w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors animate-in fade-in duration-500 delay-700 fill-mode-backwards"
                                >
                                    No thanks, I'll study on my own
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
