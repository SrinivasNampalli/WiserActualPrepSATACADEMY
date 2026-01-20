// Connections game data - like NYT Connections
export interface Category {
    name: string
    words: string[]
    difficulty: 1 | 2 | 3 | 4
    color: string
}

export interface Puzzle {
    id: string
    date: string
    categories: Category[]
}

export const puzzles: Puzzle[] = [
    {
        id: "sat-vocab-1",
        date: "2025-01-20",
        categories: [
            {
                name: "SAT Math: Types of Angles",
                words: ["ACUTE", "OBTUSE", "RIGHT", "REFLEX"],
                difficulty: 1,
                color: "bg-yellow-400"
            },
            {
                name: "Words Meaning 'To Lessen'",
                words: ["MITIGATE", "DIMINISH", "ABATE", "ALLEVIATE"],
                difficulty: 2,
                color: "bg-green-400"
            },
            {
                name: "Literary Devices",
                words: ["METAPHOR", "SIMILE", "HYPERBOLE", "PERSONIFICATION"],
                difficulty: 3,
                color: "bg-blue-400"
            },
            {
                name: "Words with Greek Root 'GRAPH'",
                words: ["BIOGRAPHY", "PHOTOGRAPH", "TELEGRAPH", "AUTOGRAPH"],
                difficulty: 4,
                color: "bg-purple-400"
            }
        ]
    },
    {
        id: "sat-vocab-2",
        date: "2025-01-21",
        categories: [
            {
                name: "SAT Reading: Tone Words (Positive)",
                words: ["LAUDATORY", "OPTIMISTIC", "REVERENT", "ENTHUSIASTIC"],
                difficulty: 1,
                color: "bg-yellow-400"
            },
            {
                name: "SAT Reading: Tone Words (Negative)",
                words: ["SARDONIC", "DISMISSIVE", "CONTEMPTUOUS", "CYNICAL"],
                difficulty: 2,
                color: "bg-green-400"
            },
            {
                name: "Math: Coordinate Geometry Terms",
                words: ["SLOPE", "INTERCEPT", "ORIGIN", "QUADRANT"],
                difficulty: 3,
                color: "bg-blue-400"
            },
            {
                name: "SAT Transition Words: Contrast",
                words: ["HOWEVER", "NEVERTHELESS", "ALTHOUGH", "DESPITE"],
                difficulty: 4,
                color: "bg-purple-400"
            }
        ]
    },
    {
        id: "sat-vocab-3",
        date: "2025-01-22",
        categories: [
            {
                name: "Geometric Shapes",
                words: ["POLYGON", "HEXAGON", "PENTAGON", "OCTAGON"],
                difficulty: 1,
                color: "bg-yellow-400"
            },
            {
                name: "Words Meaning 'To Praise'",
                words: ["EXTOL", "COMMEND", "LAUD", "ACCLAIM"],
                difficulty: 2,
                color: "bg-green-400"
            },
            {
                name: "Types of Logical Fallacies",
                words: ["STRAWMAN", "SLIPPERY SLOPE", "AD HOMINEM", "RED HERRING"],
                difficulty: 3,
                color: "bg-blue-400"
            },
            {
                name: "Rhetorical Appeals",
                words: ["ETHOS", "PATHOS", "LOGOS", "KAIROS"],
                difficulty: 4,
                color: "bg-purple-400"
            }
        ]
    }
]

export function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

export function getAllWords(puzzle: Puzzle): string[] {
    const words = puzzle.categories.flatMap(cat => cat.words)
    return shuffleArray(words)
}

export function getRandomPuzzle(): Puzzle {
    return puzzles[Math.floor(Math.random() * puzzles.length)]
}
