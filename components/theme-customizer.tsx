"use client"

import { useState } from "react"
import { useThemeContext } from "@/lib/theme-context"
import { themes, type ThemeName } from "@/lib/themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Palette, Check } from "lucide-react"

export function ThemeCustomizer() {
    const { themeName, setTheme } = useThemeContext()
    const [isOpen, setIsOpen] = useState(false)

    const presetThemes = Object.values(themes) as Array<{ name: ThemeName; displayName: string; base: string; gradient: string }>

    return (
        <div className="relative">
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="gap-2 border-gray-300 hover:bg-gray-100"
            >
                <Palette className="h-4 w-4" />
                Theme
            </Button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <Card className="absolute right-0 top-full mt-2 z-50 w-64 shadow-2xl animate-in fade-in zoom-in-95 duration-200 border-gray-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Palette className="h-4 w-4" />
                                Choose Theme
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-2">
                                {presetThemes.map((theme) => (
                                    <button
                                        key={theme.name}
                                        onClick={() => {
                                            setTheme(theme.name)
                                            setIsOpen(false)
                                        }}
                                        className={`relative group overflow-hidden rounded-lg border-2 transition-all hover:scale-[1.02] active:scale-95 ${themeName === theme.name
                                                ? "border-gray-800 shadow-md ring-1 ring-gray-300"
                                                : "border-transparent hover:border-gray-200"
                                            }`}
                                    >
                                        <div
                                            className="w-full h-10"
                                            style={{ background: theme.gradient }}
                                        />
                                        <div className="p-2 pt-1 text-left bg-white">
                                            <span className="text-xs font-medium text-gray-700">{theme.displayName}</span>
                                        </div>

                                        {themeName === theme.name && (
                                            <div className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow-sm">
                                                <Check className="h-3 w-3 text-black" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}
