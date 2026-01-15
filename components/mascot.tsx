"use client"

import React, { useState, useEffect, useRef } from "react"
import { useMascot, type MascotEmotion } from "@/lib/mascot-context"
import Image from "next/image"

// Map emotions to girlfriend expressions
const emotionToImage: Record<MascotEmotion, string> = {
    idle: "/girlfriend/animegirlsleepy.jpg",
    thinking: "/girlfriend/animegirlbuisnessserious.jpg",
    happy: "/girlfriend/animegirlsmirk.jpg",
    celebrating: "/girlfriend/animegirlsmirk.jpg",
    encouraging: "/girlfriend/animegirltsundere.jpg",
    waving: "/girlfriend/animegirlsmirk.jpg",
}

// Anime girlfriend mascot that follows your cursor
export function Mascot() {
    const { emotion, message, isVisible } = useMascot()
    const [hasMounted, setHasMounted] = useState(false)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [targetPos, setTargetPos] = useState({ x: 0, y: 0 })
    const [isHovered, setIsHovered] = useState(false)
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
                x: prev.x + (targetPos.x - prev.x) * 0.08,
                y: prev.y + (targetPos.y - prev.y) * 0.08,
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
            const baseX = windowWidth - 70
            const baseY = windowHeight - 90

            // Add subtle movement based on mouse position (max 40px offset)
            const offsetX = ((e.clientX / windowWidth) - 0.5) * 80
            const offsetY = ((e.clientY / windowHeight) - 0.5) * 80

            setTargetPos({
                x: baseX + offsetX,
                y: baseY + offsetY,
            })
        }

        // Initial position
        setTargetPos({
            x: window.innerWidth - 70,
            y: window.innerHeight - 90,
        })
        setPosition({
            x: window.innerWidth - 70,
            y: window.innerHeight - 90,
        })

        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [hasMounted])

    // Don't render until mounted on client (prevents hydration mismatch)
    if (!hasMounted || !isVisible) return null

    const currentImage = emotionToImage[emotion] || emotionToImage.idle

    return (
        <div
            ref={mascotRef}
            className="fixed z-50 pointer-events-auto select-none cursor-pointer"
            style={{
                left: position.x,
                top: position.y,
                transform: "translate(-50%, -50%)",
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Speech Bubble */}
            {message && (
                <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 rounded-2xl text-sm font-medium whitespace-nowrap shadow-xl animate-in fade-in zoom-in-95 duration-200 bg-white/95 backdrop-blur-sm border border-pink-200"
                    style={{ color: "#1B4B6B" }}
                >
                    {message}
                    {/* Speech bubble tail */}
                    <div
                        className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
                        style={{
                            borderLeft: "8px solid transparent",
                            borderRight: "8px solid transparent",
                            borderTop: "8px solid rgba(255,255,255,0.95)",
                        }}
                    />
                </div>
            )}

            {/* Girlfriend Character */}
            <div
                className={`relative transition-all duration-300 ${getEmotionAnimation(emotion)} ${isHovered ? 'scale-110' : 'scale-100'}`}
            >
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-full bg-pink-400/30 blur-xl scale-110" />

                {/* Character image */}
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-3 border-white shadow-xl ring-2 ring-pink-300/50">
                    <Image
                        src={currentImage}
                        alt="Study Buddy"
                        fill
                        className="object-cover object-top"
                        priority
                    />
                </div>

                {/* Sparkles when celebrating */}
                {emotion === "celebrating" && (
                    <>
                        <div className="absolute -top-2 -left-2 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
                        <div className="absolute -top-1 -right-3 w-2 h-2 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: "0.2s" }} />
                        <div className="absolute -bottom-1 left-0 w-2 h-2 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: "0.4s" }} />
                    </>
                )}

                {/* Heart when happy */}
                {(emotion === "happy" || emotion === "waving") && (
                    <div className="absolute -top-1 -right-1 text-lg animate-bounce">💕</div>
                )}
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
            return ""
        case "encouraging":
            return "animate-mascot-wave"
        default:
            return "animate-mascot-float"
    }
}
