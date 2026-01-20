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

// Dynamic anime girlfriend mascot - grows bigger on events!
export function Mascot() {
    const { emotion, message, isVisible, setEmotion, setMessage } = useMascot()
    const [hasMounted, setHasMounted] = useState(false)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [targetPos, setTargetPos] = useState({ x: 0, y: 0 })
    const [isHovered, setIsHovered] = useState(false)
    const [sizeBoost, setSizeBoost] = useState(0) // Extra size from events
    const [clickCount, setClickCount] = useState(0)
    const mascotRef = useRef<HTMLDivElement>(null)

    const currentImage = emotionToImage[emotion] || emotionToImage.idle

    // Prevent hydration mismatch - only render on client
    useEffect(() => {
        setHasMounted(true)
    }, [])

    // Dynamic size based on emotion - celebrating/happy makes it bigger!
    useEffect(() => {
        if (emotion === "celebrating") {
            setSizeBoost(40) // Big boost for celebrations!
        } else if (emotion === "happy" || emotion === "waving") {
            setSizeBoost(20) // Medium boost for happiness
        } else {
            setSizeBoost(0)
        }
    }, [emotion])

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
            const baseX = windowWidth - 80
            const baseY = windowHeight - 90

            // Movement based on mouse
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
            y: window.innerHeight - 90,
        })
        setPosition({
            x: window.innerWidth - 80,
            y: window.innerHeight - 90,
        })

        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [hasMounted])

    // Interactive click responses
    const handleClick = () => {
        const newCount = clickCount + 1
        setClickCount(newCount)

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

        // Clear after a few seconds
        setTimeout(() => {
            setMessage("")
            setEmotion("idle")
        }, 3000)
    }

    // Don't render until mounted on client
    if (!hasMounted || !isVisible) return null

    // Dynamic sizing: base + hover + emotion boost
    const baseSize = 80
    const hoverBonus = isHovered ? 16 : 0
    const dynamicSize = baseSize + hoverBonus + sizeBoost

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
        >
            {/* Speech Bubble */}
            {message && (
                <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 rounded-2xl text-sm font-medium shadow-xl animate-in fade-in zoom-in-95 duration-200 bg-white/95 backdrop-blur-sm border-2 border-pink-300"
                    style={{ color: "#1B4B6B", maxWidth: "220px", whiteSpace: "normal" }}
                >
                    {message}
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

            {/* Girlfriend Character - Dynamic Size */}
            <div
                className={`relative transition-all duration-300 ease-out ${getEmotionAnimation(emotion)}`}
                style={{ width: dynamicSize + 20, height: dynamicSize + 20 }}
            >
                {/* Glow effect - intensity matches size */}
                <div
                    className="absolute inset-0 rounded-full blur-2xl transition-all duration-300"
                    style={{
                        background: `radial-gradient(circle, rgba(255,105,180,${0.3 + sizeBoost * 0.005}) 0%, rgba(255,20,147,${0.15 + sizeBoost * 0.003}) 50%, transparent 70%)`,
                        transform: `scale(${1.2 + sizeBoost * 0.01})`,
                    }}
                />

                {/* Character image - grows dynamically! */}
                <div
                    className="relative rounded-full overflow-hidden border-4 border-white shadow-2xl transition-all duration-300 ring-4 ring-pink-400/50"
                    style={{ width: dynamicSize, height: dynamicSize }}
                >
                    <Image
                        src={currentImage}
                        alt="Study Buddy"
                        fill
                        className="object-cover object-top transition-transform duration-300"
                        style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
                        priority
                    />
                </div>

                {/* Sparkles when celebrating */}
                {emotion === "celebrating" && (
                    <>
                        <div className="absolute -top-2 -left-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping" />
                        <div className="absolute -top-1 -right-3 w-3 h-3 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: "0.2s" }} />
                        <div className="absolute -bottom-1 left-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: "0.4s" }} />
                    </>
                )}

                {/* Hearts when happy */}
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
            return ""
        default:
            return "animate-mascot-float"
    }
}
