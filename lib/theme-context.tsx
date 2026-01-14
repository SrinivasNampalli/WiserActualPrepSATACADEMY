"use client"

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { themes, defaultTheme, defaultMascot, getTheme, type ThemeName, type MascotType, type ThemeColors } from "./themes"

interface ThemeContextType {
    themeName: ThemeName
    theme: ThemeColors
    mascotType: MascotType
    setTheme: (name: ThemeName) => void
    setMascotType: (type: MascotType) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = "sat-prep-theme"
const MASCOT_STORAGE_KEY = "sat-prep-mascot"

export function ThemeContextProvider({ children }: { children: ReactNode }) {
    const [themeName, setThemeName] = useState<ThemeName>(defaultTheme)
    const [mascotType, setMascotTypeState] = useState<MascotType>(defaultMascot)
    const [mounted, setMounted] = useState(false)

    // Load from localStorage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeName | null
        const savedMascot = localStorage.getItem(MASCOT_STORAGE_KEY) as MascotType | null

        if (savedTheme && themes[savedTheme]) {
            setThemeName(savedTheme)
        }
        if (savedMascot && (savedMascot === "female" || savedMascot === "male")) {
            setMascotTypeState(savedMascot)
        }
        setMounted(true)
    }, [])

    // Apply theme class to document
    useEffect(() => {
        if (!mounted) return

        // Remove all theme classes
        document.documentElement.classList.remove("theme-sakura", "theme-ocean", "theme-sunset")
        // Add current theme class
        document.documentElement.classList.add(`theme-${themeName}`)

        // Save to localStorage
        localStorage.setItem(THEME_STORAGE_KEY, themeName)
    }, [themeName, mounted])

    const setTheme = (name: ThemeName) => {
        setThemeName(name)
    }

    const setMascotType = (type: MascotType) => {
        setMascotTypeState(type)
        localStorage.setItem(MASCOT_STORAGE_KEY, type)
    }

    const theme = getTheme(themeName)

    return (
        <ThemeContext.Provider value={{ themeName, theme, mascotType, setTheme, setMascotType }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useThemeContext() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error("useThemeContext must be used within a ThemeContextProvider")
    }
    return context
}
