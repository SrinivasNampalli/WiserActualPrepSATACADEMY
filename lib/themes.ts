// Theme definitions for the multi-theme system
// 3 themes: Sakura (pink), Ocean (teal), Sunset (orange)

export type ThemeName = "sakura" | "ocean" | "sunset"
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
    // Text colors for on-theme backgrounds
    onThemeText: string
}

export const themes: Record<ThemeName, ThemeColors> = {
    sakura: {
        name: "sakura",
        displayName: "Sakura",
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
        displayName: "Ocean",
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
        displayName: "Sunset",
        base: "#F7931E",
        baseLight: "#FFD699",
        baseDark: "#D4451A",
        gradientFrom: "#F7931E",
        gradientTo: "#D4451A",
        gradient: "linear-gradient(135deg, #F7931E, #D4451A)",
        onThemeText: "#FFFFFF",
    },
}

export const defaultTheme: ThemeName = "ocean"
export const defaultMascot: MascotType = "female"

export function getTheme(name: ThemeName): ThemeColors {
    return themes[name] || themes[defaultTheme]
}
