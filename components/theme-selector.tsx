"use client"

import React, { useState } from "react"
import { useThemeContext } from "@/lib/theme-context"
import { themes, type ThemeName, type MascotType } from "@/lib/themes"
import { Palette, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ThemeSelector() {
    const [isOpen, setIsOpen] = useState(false)
    const { themeName, setTheme, mascotType, setMascotType, theme } = useThemeContext()

    const themeOptions: Exclude<ThemeName, "custom">[] = ["sakura", "ocean", "sunset"]

    return (
        <div className="relative">
            {/* Trigger Button */}
            <Button
                variant="outline"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="relative overflow-hidden border-2"
                style={{ borderColor: theme.base }}
            >
                <Palette className="w-4 h-4" style={{ color: theme.base }} />
            </Button>

            {/* Dropdown Panel */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Panel */}
                    <div className="absolute right-0 top-12 z-50 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 w-64 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-sm">Customize Theme</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Color Theme Selection */}
                        <div className="mb-4">
                            <p className="text-xs text-slate-500 mb-2">Color Theme</p>
                            <div className="flex gap-3">
                                {themeOptions.map((name) => {
                                    const t = themes[name]
                                    const isSelected = themeName === name
                                    return (
                                        <button
                                            key={name}
                                            onClick={() => setTheme(name)}
                                            className={`relative w-12 h-12 rounded-full transition-all duration-200 ${isSelected
                                                ? "ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110"
                                                : "hover:scale-105"
                                                }`}
                                            style={{ background: t.gradient }}
                                            title={t.displayName}
                                        >
                                            {isSelected && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                            <p className="text-xs text-slate-400 mt-2 text-center">
                                {theme.displayName}
                            </p>
                        </div>

                        {/* Mascot Selection */}
                        <div>
                            <p className="text-xs text-slate-500 mb-2">Study Buddy</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setMascotType("female")}
                                    className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all text-sm flex items-center justify-center gap-2 ${mascotType === "female"
                                        ? "border-pink-400 bg-pink-50 dark:bg-pink-900/20 text-pink-600"
                                        : "border-slate-200 dark:border-slate-600 hover:border-slate-300"
                                        }`}
                                >
                                    <User className="w-4 h-4" />
                                    <span>Sakura</span>
                                </button>
                                <button
                                    onClick={() => setMascotType("male")}
                                    className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all text-sm flex items-center justify-center gap-2 ${mascotType === "male"
                                        ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                                        : "border-slate-200 dark:border-slate-600 hover:border-slate-300"
                                        }`}
                                >
                                    <User className="w-4 h-4" />
                                    <span>Kai</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
