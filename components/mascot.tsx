"use client"

import React, { useState, useEffect, useRef } from "react"
import { useMascot, type MascotEmotion } from "@/lib/mascot-context"
import Image from "next/image"

// Map emotions to girlfriend expressions with labels
const emotionConfig: Record<MascotEmotion, { image: string; label: string; emoji: string }> = {
    idle: { image: "/girlfriend/animegirlsleepy.jpg", label: "Relaxed", emoji: "😌" },
    thinking: { image: "/girlfriend/animegirlbuisnessserious.jpg", label: "Focused", emoji: "🧐" },
    happy: { image: "/girlfriend/animegirlsmirk.jpg", label: "Happy", emoji: "😊" },
    celebrating: { image: "/girlfriend/animegirlsmirk.jpg", label: "Proud!", emoji: "🎉" },
    encouraging: { image: "/girlfriend/animegirltsundere.jpg", label: "Hmph!", emoji: "😤" },
    waving: { image: "/girlfriend/animegirlsmirk.jpg", label: "Hey!", emoji: "👋" },
}

// Interactive anime girlfriend mascot that follows your cursor
export function Mascot() {
    const { emotion, message, isVisible, setEmotion, setMessage } = useMascot()
    const [hasMounted, setHasMounted] = useState(false)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [targetPos, setTargetPos] = useState({ x: 0, y: 0 })
    const [isHovered, setIsHovered] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const [clickCount, setClickCount] = useState(0)
    const mascotRef = useRef<HTMLDivElement>(null)

    const config = emotionConfig[emotion] || emotionConfig.idle

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
                x: prev.x + (targetPos.x - prev.x) * 0.06,
                y: prev.y + (targetPos.y - prev.y) * 0.06,
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

            // Mascot stays in bottom-right quadrant but moves with mouse
            const baseX = windowWidth - 100
            const baseY = windowHeight - 120

            // More movement when expanded
            const moveFactor = isExpanded ? 100 : 60
            const offsetX = ((e.clientX / windowWidth) - 0.5) * moveFactor
            const offsetY = ((e.clientY / windowHeight) - 0.5) * moveFactor

            setTargetPos({
                x: baseX + offsetX,
                y: baseY + offsetY,
            })
        }

        // Initial position
        setTargetPos({
            x: window.innerWidth - 100,
            y: window.innerHeight - 120,
        })
        setPosition({
            x: window.innerWidth - 100,
            y: window.innerHeight - 120,
        })

        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [hasMounted, isExpanded])

    // Interactive click responses
    const handleClick = () => {
        const newCount = clickCount + 1
        setClickCount(newCount)

        // Different responses based on click count
        const responses = [
            { emotion: "happy" as MascotEmotion, message: "Hey! Need help studying? 📚" },
            { emotion: "encouraging" as MascotEmotion, message: "Don't just click me, study! 😤" },
            { emotion: "happy" as MascotEmotion, message: "You've got this! 💪" },
            { emotion: "celebrating" as MascotEmotion, message: "Keep up the great work! ✨" },
            { emotion: "thinking" as MascotEmotion, message: "Hmm... need a break? 🤔" },
            { emotion: "waving" as MascotEmotion, message: "Good luck on your SAT! 🍀" },
        ]

        const response = responses[newCount % responses.length]
        setEmotion(response.emotion)
        setMessage(response.message)

        // Clear message after a few seconds
        setTimeout(() => {
            setMessage("")
            setEmotion("idle")
        }, 3000)
    }

    // Toggle expanded view
    const handleDoubleClick = () => {
        setIsExpanded(!isExpanded)
    }

    // Don't render until mounted on client (prevents hydration mismatch)
    if (!hasMounted || !isVisible) return null

    const size = isExpanded ? "w-40 h-40" : isHovered ? "w-28 h-28" : "w-24 h-24"
    const containerSize = isExpanded ? 180 : isHovered ? 130 : 110

    return (
        <div
            ref={mascotRef}
            className="fixed z-50 select-none cursor-pointer"
            style={{
                left: position.x,
                top: position.y,
                transform: "translate(-50%, -50%)",
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
        >
            {/* Speech Bubble */}
            {message && (
                <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-4 py-3 rounded-2xl text-sm font-medium whitespace-nowrap shadow-xl animate-in fade-in zoom-in-95 duration-200 bg-white/95 backdrop-blur-sm border-2 border-pink-300"
                    style={{ color: "#1B4B6B", maxWidth: "250px", whiteSpace: "normal" }}
                >
                    <span className="text-lg mr-2">{config.emoji}</span>
                    {message}
                    {/* Speech bubble tail */}
                    <div
                        className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
                        style={{
                            borderLeft: "10px solid transparent",
                            borderRight: "10px solid transparent",
                            borderTop: "10px solid rgba(255,255,255,0.95)",
                        }}
                    />
                </div>
            )}

            {/* Girlfriend Character */}
            <div
                className={`relative transition-all duration-300 ${getEmotionAnimation(emotion)}`}
                style={{ width: containerSize, height: containerSize }}
            >
                {/* Glow effect - bigger and more vibrant */}
                <div
                    className="absolute inset-0 rounded-full blur-2xl transition-all duration-300"
                    style={{
                        background: isExpanded
                            ? "radial-gradient(circle, rgba(255,105,180,0.5) 0%, rgba(255,20,147,0.3) 50%, transparent 70%)"
                            : "radial-gradient(circle, rgba(255,105,180,0.4) 0%, rgba(255,20,147,0.2) 50%, transparent 70%)",
                        transform: "scale(1.3)",
                    }}
                />

                {/* Character image container */}
                <div className={`relative ${size} rounded-full overflow-hidden border-4 border-white shadow-2xl transition-all duration-300 ring-4 ring-pink-400/50`}>
                    <Image
                        src={config.image}
                        alt="Study Buddy"
                        fill
                        className="object-cover object-top transition-transform duration-300"
                        style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
                        priority
                    />

                    {/* Overlay gradient for emotion indication */}
                    <div
                        className="absolute inset-0 opacity-20 transition-colors duration-300"
                        style={{
                            background: emotion === "celebrating"
                                ? "linear-gradient(to top, gold, transparent)"
                                : emotion === "happy" || emotion === "waving"
                                    ? "linear-gradient(to top, pink, transparent)"
                                    : emotion === "encouraging"
                                        ? "linear-gradient(to top, orange, transparent)"
                                        : "transparent"
                        }}
                    />
                </div>

                {/* Emotion label badge */}
                <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg transition-all duration-300 ${emotion === "celebrating" ? "bg-gradient-to-r from-yellow-500 to-amber-500" :
                        emotion === "happy" || emotion === "waving" ? "bg-gradient-to-r from-pink-500 to-rose-500" :
                            emotion === "thinking" ? "bg-gradient-to-r from-blue-500 to-cyan-500" :
                                emotion === "encouraging" ? "bg-gradient-to-r from-orange-500 to-red-500" :
                                    "bg-gradient-to-r from-purple-500 to-indigo-500"
                    }`}>
                    {config.emoji} {config.label}
                </div>

                {/* Sparkles when celebrating */}
                {emotion === "celebrating" && (
                    <>
                        <div className="absolute -top-3 -left-3 w-4 h-4 bg-yellow-400 rounded-full animate-ping" />
                        <div className="absolute -top-2 -right-4 w-3 h-3 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: "0.2s" }} />
                        <div className="absolute -bottom-2 left-2 w-3 h-3 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: "0.4s" }} />
                        <div className="absolute top-0 right-0 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: "0.6s" }} />
                    </>
                )}

                {/* Hearts when happy */}
                {(emotion === "happy" || emotion === "waving") && (
                    <>
                        <div className="absolute -top-2 -right-2 text-xl animate-bounce">💕</div>
                        <div className="absolute -top-4 left-2 text-sm animate-bounce" style={{ animationDelay: "0.3s" }}>💗</div>
                    </>
                )}

                {/* Thinking bubbles */}
                {emotion === "thinking" && (
                    <>
                        <div className="absolute -top-2 -right-2 w-3 h-3 bg-blue-300 rounded-full animate-pulse" />
                        <div className="absolute -top-4 right-2 w-2 h-2 bg-blue-200 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                    </>
                )}

                {/* Angry/tsundere marks */}
                {emotion === "encouraging" && (
                    <div className="absolute -top-1 right-0 text-lg animate-pulse">💢</div>
                )}
            </div>

            {/* Hint text when hovered */}
            {isHovered && !message && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs text-pink-500 font-medium animate-pulse whitespace-nowrap">
                    Click me! Double-click to expand
                </div>
            )}
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
