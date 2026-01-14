"use client"

import React, { useState, useEffect, useRef } from "react"
import { useMascot, type MascotEmotion } from "@/lib/mascot-context"
import { useThemeContext } from "@/lib/theme-context"

// Tiny floating mascot that follows your scroll with speech bubbles
export function Mascot() {
    const { emotion, message, isVisible } = useMascot()
    const { theme } = useThemeContext()
    const [hasMounted, setHasMounted] = useState(false)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [targetPos, setTargetPos] = useState({ x: 0, y: 0 })
    const mascotRef = useRef<HTMLDivElement>(null)

    // Prevent hydration mismatch - only render on client
    useEffect(() => {
        setHasMounted(true)
    }, [])

    // Smooth following animation
    useEffect(() => {
        if (!hasMounted) return

        let animationId: number

        const animate = () => {
            setPosition(prev => ({
                x: prev.x + (targetPos.x - prev.x) * 0.1,
                y: prev.y + (targetPos.y - prev.y) * 0.1,
            }))
            animationId = requestAnimationFrame(animate)
        }

        animationId = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(animationId)
    }, [targetPos, hasMounted])

    // Follow mouse with offset (stays near bottom-right area)
    useEffect(() => {
        if (!hasMounted) return

        const handleMouseMove = (e: MouseEvent) => {
            const windowWidth = window.innerWidth
            const windowHeight = window.innerHeight

            // Mascot stays in bottom-right quadrant but moves slightly with mouse
            const baseX = windowWidth - 80
            const baseY = windowHeight - 80

            // Add subtle movement based on mouse position (max 30px offset)
            const offsetX = ((e.clientX / windowWidth) - 0.5) * 60
            const offsetY = ((e.clientY / windowHeight) - 0.5) * 60

            setTargetPos({
                x: baseX + offsetX,
                y: baseY + offsetY,
            })
        }

        // Initial position
        setTargetPos({
            x: window.innerWidth - 80,
            y: window.innerHeight - 80,
        })
        setPosition({
            x: window.innerWidth - 80,
            y: window.innerHeight - 80,
        })

        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [hasMounted])

    // Don't render until mounted on client (prevents hydration mismatch)
    if (!hasMounted || !isVisible) return null

    return (
        <div
            ref={mascotRef}
            className="fixed z-50 pointer-events-none select-none"
            style={{
                left: position.x,
                top: position.y,
                transform: "translate(-50%, -50%)",
            }}
        >
            {/* Speech Bubble */}
            {message && (
                <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap shadow-lg animate-in fade-in zoom-in-95 duration-200"
                    style={{
                        backgroundColor: theme.base,
                        color: "#fff",
                    }}
                >
                    {message}
                    {/* Speech bubble tail */}
                    <div
                        className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
                        style={{
                            borderLeft: "6px solid transparent",
                            borderRight: "6px solid transparent",
                            borderTop: `6px solid ${theme.base}`,
                        }}
                    />
                </div>
            )}

            {/* Tiny Mascot - just a simple cute blob/circle */}
            <div className={`w-12 h-12 ${getEmotionAnimation(emotion)} transition-all duration-200`}>
                <svg viewBox="0 0 48 48" className="w-full h-full drop-shadow-md">
                    {/* Body - round blob */}
                    <circle
                        cx="24"
                        cy="26"
                        r="18"
                        fill={theme.base}
                        className="transition-colors duration-300"
                    />

                    {/* Cheeks/blush */}
                    <circle cx="14" cy="28" r="3" fill="#fff" opacity="0.3" />
                    <circle cx="34" cy="28" r="3" fill="#fff" opacity="0.3" />

                    {/* Eyes */}
                    {getEyes(emotion)}

                    {/* Mouth */}
                    {getMouth(emotion)}

                    {/* Sparkles when celebrating */}
                    {emotion === "celebrating" && (
                        <>
                            <circle cx="8" cy="12" r="2" fill="#FFD700" className="animate-ping" />
                            <circle cx="40" cy="12" r="2" fill="#FFD700" className="animate-ping" style={{ animationDelay: "0.2s" }} />
                            <circle cx="24" cy="4" r="1.5" fill="#FFD700" className="animate-ping" style={{ animationDelay: "0.4s" }} />
                        </>
                    )}
                </svg>
            </div>
        </div>
    )
}

function getEmotionAnimation(emotion: MascotEmotion): string {
    switch (emotion) {
        case "celebrating":
            return "animate-bounce"
        case "happy":
        case "waving":
            return "animate-pulse"
        case "thinking":
            return "animate-mascot-tilt"
        case "encouraging":
            return "animate-mascot-wave"
        default:
            return "animate-mascot-float"
    }
}

function getEyes(emotion: MascotEmotion) {
    switch (emotion) {
        case "celebrating":
        case "happy":
            // Happy squinty eyes
            return (
                <>
                    <path d="M17 22 Q19 20 21 22" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    <path d="M27 22 Q29 20 31 22" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                </>
            )
        case "thinking":
            // Looking up eyes
            return (
                <>
                    <circle cx="19" cy="20" r="3" fill="#fff" />
                    <circle cx="19" cy="19" r="1.5" fill="#333" />
                    <circle cx="29" cy="20" r="3" fill="#fff" />
                    <circle cx="29" cy="19" r="1.5" fill="#333" />
                </>
            )
        case "encouraging":
        case "waving":
            // Winking
            return (
                <>
                    <circle cx="19" cy="22" r="3" fill="#fff" />
                    <circle cx="19" cy="22" r="1.5" fill="#333" />
                    <path d="M27 22 Q29 20 31 22" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                </>
            )
        default:
            // Normal eyes
            return (
                <>
                    <circle cx="19" cy="22" r="3" fill="#fff" />
                    <circle cx="19" cy="22" r="1.5" fill="#333" />
                    <circle cx="29" cy="22" r="3" fill="#fff" />
                    <circle cx="29" cy="22" r="1.5" fill="#333" />
                </>
            )
    }
}

function getMouth(emotion: MascotEmotion) {
    switch (emotion) {
        case "celebrating":
            // Big open smile
            return <ellipse cx="24" cy="32" rx="5" ry="4" fill="#fff" />
        case "happy":
        case "encouraging":
        case "waving":
            // Smile
            return <path d="M20 30 Q24 35 28 30" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" />
        case "thinking":
            // Small o
            return <circle cx="24" cy="32" r="2" fill="#fff" />
        default:
            // Small smile
            return <path d="M21 31 Q24 33 27 31" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" />
    }
}
