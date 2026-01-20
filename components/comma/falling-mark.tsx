"use client"

import { useEffect, useState } from "react"

interface FallingMarkProps {
    mark: string
    lane: number
    totalLanes: number
    duration: number
    onClick: () => void
}

export function FallingMark({ mark, lane, totalLanes, duration, onClick }: FallingMarkProps) {
    const [position, setPosition] = useState(0)

    useEffect(() => {
        const startTime = Date.now()
        const animate = () => {
            const elapsed = (Date.now() - startTime) / 1000
            const progress = Math.min(elapsed / duration, 1)
            setPosition(progress * 100)
            if (progress < 1) {
                requestAnimationFrame(animate)
            }
        }
        requestAnimationFrame(animate)
    }, [duration])

    const laneWidth = 100 / totalLanes
    const leftPosition = lane * laneWidth + laneWidth / 2

    return (
        <button
            onClick={onClick}
            className="absolute transform -translate-x-1/2 w-16 h-16 rounded-2xl bg-primary text-primary-foreground text-2xl font-bold flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer active:scale-95"
            style={{
                left: `${leftPosition}%`,
                top: `${position}%`,
                transform: `translateX(-50%) translateY(-50%)`
            }}
        >
            {mark}
        </button>
    )
}
