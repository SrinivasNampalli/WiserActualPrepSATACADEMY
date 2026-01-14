// SAT Category Definitions and Helper Functions

// Math Categories
export const SAT_MATH_CATEGORIES = [
    {
        id: "algebra",
        name: "Algebra",
        weight: 35,
        subcategories: ["Linear Equations & Inequalities", "Systems of Linear Equations/Inequalities"],
        color: "#4ECDC4", // Teal
    },
    {
        id: "advanced_math",
        name: "Advanced Math",
        weight: 35,
        subcategories: ["Polynomial, Quadratic, Nonlinear & Exponential Functions", "Radical, Rational, & Absolute Value Equations"],
        color: "#FF6B6B", // Coral
    },
    {
        id: "problem_solving",
        name: "Problem Solving & Data Analysis",
        weight: 15,
        subcategories: ["Rates, Ratios, Proportions, Percentages, & Probability", "Data Representations and statistical claims"],
        color: "#45B7D1", // Sky Blue
    },
    {
        id: "geometry",
        name: "Geometry & Trigonometry",
        weight: 15,
        subcategories: ["Area, Perimeter, and Volume", "Lines, angles, triangles, and circles", "Trigonometry"],
        color: "#96CEB4", // Mint
    },
] as const

// Reading & Writing Categories
export const SAT_RW_CATEGORIES = [
    {
        id: "craft_structure",
        name: "Craft and Structure",
        weight: 28,
        subcategories: ["Words in Context", "Structure and Purpose", "Cross-Text Connections"],
        color: "#9B59B6", // Purple
    },
    {
        id: "information_ideas",
        name: "Information and Ideas",
        weight: 26,
        subcategories: ["Reading Comprehension", "Command of Evidence", "Inference"],
        color: "#3498DB", // Blue
    },
    {
        id: "english_conventions",
        name: "Standard English Conventions",
        weight: 26,
        subcategories: ["Punctuation & Boundaries", "Grammar Agreement"],
        color: "#E67E22", // Orange
    },
    {
        id: "expression_ideas",
        name: "Expression of Ideas",
        weight: 20,
        subcategories: ["Transitions", "Rhetorical Synthesis"],
        color: "#1ABC9C", // Turquoise
    },
] as const

// All categories combined
export const ALL_SAT_CATEGORIES = [...SAT_MATH_CATEGORIES, ...SAT_RW_CATEGORIES]

// Type definitions
export type MathCategoryId = typeof SAT_MATH_CATEGORIES[number]["id"]
export type RWCategoryId = typeof SAT_RW_CATEGORIES[number]["id"]
export type SATCategoryId = MathCategoryId | RWCategoryId

export interface CategoryStats {
    correct: number
    total: number
}

export type CategoryStatsMap = Partial<Record<SATCategoryId, CategoryStats>>

// Helper functions
export function getCategoryDisplayName(categoryId: string): string {
    const category = ALL_SAT_CATEGORIES.find(c => c.id === categoryId)
    return category?.name || categoryId.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())
}

export function getCategoryColor(categoryId: string): string {
    const category = ALL_SAT_CATEGORIES.find(c => c.id === categoryId)
    return category?.color || "#6B7280" // Default gray
}

export function getCategoryById(categoryId: string) {
    return ALL_SAT_CATEGORIES.find(c => c.id === categoryId)
}

export function isMathCategory(categoryId: string): boolean {
    return SAT_MATH_CATEGORIES.some(c => c.id === categoryId)
}

export function isRWCategory(categoryId: string): boolean {
    return SAT_RW_CATEGORIES.some(c => c.id === categoryId)
}

// Calculate percentage score for a category
export function getCategoryPercentage(stats: CategoryStats): number {
    if (stats.total === 0) return 0
    return Math.round((stats.correct / stats.total) * 100)
}

// Get performance level based on percentage
export function getPerformanceLevel(percentage: number): "excellent" | "good" | "needs_work" | "struggling" {
    if (percentage >= 85) return "excellent"
    if (percentage >= 70) return "good"
    if (percentage >= 50) return "needs_work"
    return "struggling"
}

// Normalize category string to match our IDs
export function normalizeCategoryId(category: string): SATCategoryId | null {
    if (!category) return null

    const normalized = category.toLowerCase().trim().replace(/\s+/g, "_").replace(/&/g, "and")

    // Try exact match first
    const exactMatch = ALL_SAT_CATEGORIES.find(c => c.id === normalized)
    if (exactMatch) return exactMatch.id as SATCategoryId

    // Try partial matching
    const partialMatch = ALL_SAT_CATEGORIES.find(c =>
        normalized.includes(c.id) || c.id.includes(normalized) ||
        c.name.toLowerCase().replace(/\s+/g, "_").includes(normalized)
    )
    if (partialMatch) return partialMatch.id as SATCategoryId

    return null
}
