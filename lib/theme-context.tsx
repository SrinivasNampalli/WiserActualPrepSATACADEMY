"use client"

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import {
    themes,
    defaultTheme,
    defaultMascot,
    getTheme,
    defaultCustomConfig,
    type ThemeName,
    type MascotType,
    type ThemeColors,
    type CustomThemeConfig
} from "./themes"

interface ThemeContextType {
    themeName: ThemeName
    theme: ThemeColors
    mascotType: MascotType
    customConfig: CustomThemeConfig
    setTheme: (name: ThemeName) => void
    setMascotType: (type: MascotType) => void
    updateCustomConfig: (config: Partial<CustomThemeConfig>) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = "sat-prep-theme"
const MASCOT_STORAGE_KEY = "sat-prep-mascot"
const CUSTOM_CONFIG_STORAGE_KEY = "sat-prep-custom-config"

export function ThemeContextProvider({ children }: { children: ReactNode }) {
    const [themeName, setThemeName] = useState<ThemeName>(defaultTheme)
    const [mascotType, setMascotTypeState] = useState<MascotType>(defaultMascot)
    const [customConfig, setCustomConfig] = useState<CustomThemeConfig>(defaultCustomConfig)
    const [mounted, setMounted] = useState(false)

    // Load from localStorage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeName | null
        const savedMascot = localStorage.getItem(MASCOT_STORAGE_KEY) as MascotType | null
        const savedConfig = localStorage.getItem(CUSTOM_CONFIG_STORAGE_KEY)

        if (savedTheme && (themes[savedTheme as Exclude<ThemeName, "custom">] || savedTheme === "custom")) {
            setThemeName(savedTheme)
        }
        if (savedMascot && (savedMascot === "female" || savedMascot === "male")) {
            setMascotTypeState(savedMascot)
        }
        if (savedConfig) {
            try {
                const parsed = JSON.parse(savedConfig)
                setCustomConfig({ ...defaultCustomConfig, ...parsed })
            } catch (e) {
                console.error("Failed to parse custom theme config", e)
            }
        }
        setMounted(true)
    }, [])

    const theme = getTheme(themeName, customConfig)

    // Apply theme class and CSS variables to document
    useEffect(() => {
        if (!mounted) return

        const root = document.documentElement

        // Remove all theme classes
        root.classList.remove(
            "theme-sakura", "theme-ocean", "theme-sunset",
            "theme-midnight", "theme-forest", "theme-custom"
        )
        // Add current theme class
        root.classList.add(`theme-${themeName}`)

        // Inject CSS variables for dynamic theming
        root.style.setProperty("--theme-base", theme.base)
        root.style.setProperty("--theme-light", theme.baseLight)
        root.style.setProperty("--theme-dark", theme.baseDark)
        root.style.setProperty("--theme-gradient", theme.gradient)

        // Map to shadcn/Tailwind semantic variables
        root.style.setProperty("--primary", theme.base)
        root.style.setProperty("--primary-foreground", theme.onThemeText)

        // Use secondary color for secondary components or accents
        root.style.setProperty("--secondary", theme.baseDark)
        root.style.setProperty("--secondary-foreground", theme.onThemeText)

        // Update ring for focus states
        root.style.setProperty("--ring", theme.base)

        // Save to localStorage
        localStorage.setItem(THEME_STORAGE_KEY, themeName)
    }, [themeName, theme, mounted])

    const setTheme = (name: ThemeName) => {
        setThemeName(name)
    }

    const setMascotType = (type: MascotType) => {
        setMascotTypeState(type)
        localStorage.setItem(MASCOT_STORAGE_KEY, type)
    }

    const updateCustomConfig = (updates: Partial<CustomThemeConfig>) => {
        const newConfig = { ...customConfig, ...updates }
        setCustomConfig(newConfig)
        localStorage.setItem(CUSTOM_CONFIG_STORAGE_KEY, JSON.stringify(newConfig)) // Persist as JSON

        // Auto-switch to custom theme when updating config
        if (themeName !== "custom") {
            setThemeName("custom")
        }
    }

    return (
        <ThemeContext.Provider value={{
            themeName,
            theme,
            mascotType,
            customConfig,
            setTheme,
            setMascotType,
            updateCustomConfig,
        }}>
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
