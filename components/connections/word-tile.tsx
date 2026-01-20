"use client"

interface WordTileProps {
    word: string
    isSelected: boolean
    isShaking: boolean
    onClick: () => void
}

export function WordTile({ word, isSelected, isShaking, onClick }: WordTileProps) {
    return (
        <button
            onClick={onClick}
            className={`
        p-3 rounded-lg font-medium text-sm transition-all duration-200 
        ${isSelected
                    ? "bg-primary text-primary-foreground scale-105 shadow-lg"
                    : "bg-muted hover:bg-muted/80 text-foreground"
                }
        ${isShaking ? "animate-shake" : ""}
      `}
        >
            {word}
        </button>
    )
}
