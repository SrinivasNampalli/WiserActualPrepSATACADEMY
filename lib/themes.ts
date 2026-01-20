// Theme definitions for the multi-theme system
// Preset themes + Custom theme support

export type ThemeName = "sakura" | "ocean" | "sunset" | "midnight" | "forest" | "custom"
export type MascotType = "female" | "male"

export interface ThemeColors {
    name: ThemeName
    displayName: string
    base: string
    baseLight: string
    baseDark: string
    gradientFrom: string
    gradientTo: string
    gradient: string
    onThemeText: string
}

export interface CustomThemeConfig {
    primary: string
    secondary: string
}

export const themes: Record<Exclude<ThemeName, "custom">, ThemeColors> = {
    sakura: {
        name: "sakura",
        displayName: "🌸 Sakura",
        base: "#FF6B9D",
        baseLight: "#FFB3CC",
        baseDark: "#C44569",
        gradientFrom: "#FF6B9D",
        gradientTo: "#C44569",
        gradient: "linear-gradient(135deg, #FF6B9D, #C44569)",
        onThemeText: "#FFFFFF",
    },
    ocean: {
        name: "ocean",
        displayName: "🌊 Ocean",
        base: "#4ECDC4",
        baseLight: "#A8E6CF",
        baseDark: "#2C7873",
        gradientFrom: "#4ECDC4",
        gradientTo: "#2C7873",
        gradient: "linear-gradient(135deg, #4ECDC4, #2C7873)",
        onThemeText: "#FFFFFF",
    },
    sunset: {
        name: "sunset",
        displayName: "🌅 Sunset",
        base: "#F7931E",
        baseLight: "#FFD699",
        baseDark: "#D4451A",
        gradientFrom: "#F7931E",
        gradientTo: "#D4451A",
        gradient: "linear-gradient(135deg, #F7931E, #D4451A)",
        onThemeText: "#FFFFFF",
    },
    midnight: {
        name: "midnight",
        displayName: "🌙 Midnight",
        base: "#6366F1",
        baseLight: "#A5B4FC",
        baseDark: "#4338CA",
        gradientFrom: "#6366F1",
        gradientTo: "#4338CA",
        gradient: "linear-gradient(135deg, #6366F1, #4338CA)",
        onThemeText: "#FFFFFF",
    },
    forest: {
        name: "forest",
        displayName: "🌲 Forest",
        base: "#22C55E",
        baseLight: "#86EFAC",
        baseDark: "#15803D",
        gradientFrom: "#22C55E",
        gradientTo: "#15803D",
        gradient: "linear-gradient(135deg, #22C55E, #15803D)",
        onThemeText: "#FFFFFF",
    },
}

export const defaultTheme: Exclude<ThemeName, "custom"> = "ocean"
export const defaultMascot: MascotType = "female"
export const defaultCustomConfig: CustomThemeConfig = {
    primary: "#6366F1",
    secondary: "#4338CA"
}

// Helpers for color manipulation
function lightenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace("#", ""), 16)
    const amt = Math.round(2.55 * percent)
    const R = Math.min((num >> 16) + amt, 255)
    const G = Math.min((num >> 8 & 0x00FF) + amt, 255)
    const B = Math.min((num & 0x0000FF) + amt, 255)
    return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)
}

function darkenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace("#", ""), 16)
    const amt = Math.round(2.55 * percent)
    const R = Math.max((num >> 16) - amt, 0)
    const G = Math.max((num >> 8 & 0x00FF) - amt, 0)
    const B = Math.max((num & 0x0000FF) - amt, 0)
    return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)
}

// Create custom theme from user's config
export function createCustomTheme(config: CustomThemeConfig): ThemeColors {
    const { primary, secondary } = config

    return {
        name: "custom",
        displayName: "✨ Custom",
        base: primary,
        baseLight: lightenColor(primary, 30),
        baseDark: secondary, // Use secondary as the dark/brand accent
        gradientFrom: primary,
        gradientTo: secondary,
        gradient: `linear-gradient(135deg, ${primary}, ${secondary})`,
        onThemeText: "#FFFFFF",
    }
}

export function getTheme(name: ThemeName, customConfig?: CustomThemeConfig): ThemeColors {
    if (name === "custom") {
        return createCustomTheme(customConfig || defaultCustomConfig)
    }
    // At this point, name is guaranteed to be one of the preset theme names
    const presetName = name as Exclude<ThemeName, "custom">
    return themes[presetName] ?? themes.ocean
}
