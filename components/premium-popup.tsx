"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Crown,
    X,
    Check,
    Sparkles,
    Zap,
    BookOpen,
    Brain,
    Calendar,
    Star
} from "lucide-react"

interface PremiumPopupProps {
    isOpen: boolean
    onClose: () => void
    feature?: string
}

export function PremiumPopup({ isOpen, onClose, feature }: PremiumPopupProps) {
    const router = useRouter()

    if (!isOpen) return null

    const features = [
        { icon: Brain, text: "Unlimited AI Tutoring" },
        { icon: BookOpen, text: "Unlimited Flashcards" },
        { icon: Zap, text: "All Practice Tests" },
        { icon: Calendar, text: "Personalized Study Plan" },
        { icon: Star, text: "200+ Point Guarantee" },
    ]

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
                >
                    <X className="h-5 w-5 text-gray-600" />
                </button>

                {/* Header gradient */}
                <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 px-8 pt-10 pb-16 text-white text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur mb-4">
                        <Crown className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Unlock Premium</h2>
                    <p className="text-white/90 text-sm">
                        {feature
                            ? `Upgrade to access ${feature} and more!`
                            : "Get unlimited access to all features"
                        }
                    </p>
                </div>

                {/* Price card - overlapping header */}
                <div className="relative -mt-8 mx-6">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
                        <div className="flex items-baseline justify-center gap-1 mb-1">
                            <span className="text-4xl font-bold text-gray-900">$8.99</span>
                            <span className="text-gray-500">/month</span>
                        </div>
                        <p className="text-sm text-gray-500">Cancel anytime • Billed monthly</p>
                    </div>
                </div>

                {/* Features */}
                <div className="px-8 py-6">
                    <div className="space-y-3">
                        {features.map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                                    <item.icon className="h-4 w-4 text-amber-600" />
                                </div>
                                <span className="text-gray-700 font-medium">{item.text}</span>
                                <Check className="h-4 w-4 text-green-500 ml-auto" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="px-8 pb-8">
                    <Button
                        onClick={() => router.push("/pricing")}
                        className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-orange-200"
                    >
                        <Sparkles className="h-5 w-5 mr-2" />
                        Start Premium Now
                    </Button>
                    <button
                        onClick={onClose}
                        className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        Maybe later
                    </button>
                </div>
            </div>
        </div>
    )
}

/**
 * Hook to manage premium popup state
 */
export function usePremiumPopup() {
    const [isOpen, setIsOpen] = useState(false)
    const [feature, setFeature] = useState<string>()

    const openPopup = (featureName?: string) => {
        setFeature(featureName)
        setIsOpen(true)
    }

    const closePopup = () => {
        setIsOpen(false)
        setFeature(undefined)
    }

    return { isOpen, feature, openPopup, closePopup }
}
