"use client"

import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export type MascotEmotion = "idle" | "happy" | "thinking" | "celebrating" | "encouraging" | "waving"

// Predefined message triggers - add more as needed!
export type MessageFlag =
    | "welcome"
    | "correct_answer"
    | "wrong_answer"
    | "test_start"
    | "test_complete"
    | "streak_3"
    | "streak_5"
    | "time_warning"
    | "encouragement"
    | "thinking"
    | "idle"

// Message definitions for each flag
const MESSAGES: Record<MessageFlag, string[]> = {
    welcome: [
        "Hey! Ready to study? 📚",
        "Let's crush it today! 💪",
        "I believe in you! ✨",
    ],
    correct_answer: [
        "Nice one! 🎉",
        "You got it! ⭐",
        "Brilliant! 🌟",
        "Keep it up! 🔥",
        "Awesome! 💯",
    ],
    wrong_answer: [
        "You got this! 💪",
        "Keep trying! 🌱",
        "Learn and grow! 📈",
        "Almost there! 🎯",
    ],
    test_start: [
        "Let's do this! 🚀",
        "Focus mode! 🎯",
        "You're prepared! ✨",
    ],
    test_complete: [
        "Amazing work! 🏆",
        "You did it! 🎊",
        "So proud of you! 🌟",
    ],
    streak_3: [
        "3 in a row! 🔥",
        "On fire! 🔥🔥",
        "Keep it going! ⚡",
    ],
    streak_5: [
        "UNSTOPPABLE! 🔥🔥🔥",
        "5 streak! Legend! 👑",
        "You're a genius! 🧠",
    ],
    time_warning: [
        "5 mins left! ⏰",
        "Almost done! ⏱️",
        "Final push! 💨",
    ],
    encouragement: [
        "You can do it! 💪",
        "Believe in yourself! ✨",
        "Keep pushing! 🌟",
    ],
    thinking: [
        "Hmm... 🤔",
        "Let me think... 💭",
    ],
    idle: [],
}

interface MascotContextType {
    emotion: MascotEmotion
    message: string | null
    isVisible: boolean
    setEmotion: (emotion: MascotEmotion) => void
    setMessage: (message: string | null) => void
    showMessage: (flag: MessageFlag) => void
    hideMessage: () => void
    setVisible: (visible: boolean) => void
    triggerFlag: (flag: MessageFlag) => void
}

const MascotContext = createContext<MascotContextType | undefined>(undefined)

export function MascotProvider({ children }: { children: ReactNode }) {
    const [emotion, setEmotionState] = useState<MascotEmotion>("idle")
    const [message, setMessage] = useState<string | null>(null)
    const [isVisible, setIsVisible] = useState(true)

    const setEmotion = useCallback((newEmotion: MascotEmotion) => {
        setEmotionState(newEmotion)
    }, [])

    const showMessage = useCallback((flag: MessageFlag) => {
        const messages = MESSAGES[flag]
        if (messages && messages.length > 0) {
            const randomMsg = messages[Math.floor(Math.random() * messages.length)]
            setMessage(randomMsg)
        }
    }, [])

    const hideMessage = useCallback(() => {
        setMessage(null)
    }, [])

    const setVisible = useCallback((visible: boolean) => {
        setIsVisible(visible)
    }, [])

    // Combined trigger - sets emotion AND shows message
    const triggerFlag = useCallback((flag: MessageFlag) => {
        // Set appropriate emotion based on flag
        switch (flag) {
            case "correct_answer":
            case "streak_3":
            case "streak_5":
            case "test_complete":
                setEmotionState("celebrating")
                break
            case "wrong_answer":
            case "encouragement":
                setEmotionState("encouraging")
                break
            case "thinking":
                setEmotionState("thinking")
                break
            case "welcome":
            case "test_start":
                setEmotionState("waving")
                break
            case "time_warning":
                setEmotionState("thinking")
                break
            default:
                setEmotionState("happy")
        }

        // Show message
        showMessage(flag)

        // Auto-hide message and reset emotion after delay
        setTimeout(() => {
            setMessage(null)
        }, 3000)

        setTimeout(() => {
            setEmotionState("idle")
        }, 4000)
    }, [showMessage])

    return (
        <MascotContext.Provider value={{
            emotion,
            message,
            isVisible,
            setEmotion,
            setMessage,
            showMessage,
            hideMessage,
            setVisible,
            triggerFlag,
        }}>
            {children}
        </MascotContext.Provider>
    )
}

export function useMascot() {
    const context = useContext(MascotContext)
    if (context === undefined) {
        throw new Error("useMascot must be used within a MascotProvider")
    }
    return context
}
