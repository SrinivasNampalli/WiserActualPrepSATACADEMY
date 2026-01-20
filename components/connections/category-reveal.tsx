"use client"

import type { Category } from "@/lib/connections-data"

interface CategoryRevealProps {
    category: Category
}

export function CategoryReveal({ category }: CategoryRevealProps) {
    return (
        <div className={`p-4 rounded-xl ${category.color} text-white animate-in fade-in slide-in-from-top-2 duration-500`}>
            <p className="font-bold text-center mb-2">{category.name}</p>
            <p className="text-center text-sm opacity-90">
                {category.words.join(" • ")}
            </p>
        </div>
    )
}
