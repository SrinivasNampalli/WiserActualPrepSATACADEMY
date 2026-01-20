// Comprehensive SAT Topics for Study Planning

export interface SATTopic {
    id: string
    name: string
    category: "math" | "reading" | "writing"
    subcategory: string
    difficulty: "foundational" | "intermediate" | "advanced"
    estimatedHours: number
    description: string
    skills: string[]
}

export interface SATCategory {
    id: string
    name: string
    icon: string
    topics: SATTopic[]
}

// ============ MATH TOPICS ============
export const mathTopics: SATTopic[] = [
    // Heart of Algebra
    {
        id: "linear-equations",
        name: "Linear Equations & Inequalities",
        category: "math",
        subcategory: "Heart of Algebra",
        difficulty: "foundational",
        estimatedHours: 4,
        description: "Solve single-variable linear equations and inequalities",
        skills: ["Solving for x", "Graphing lines", "Slope-intercept form"]
    },
    {
        id: "systems-of-equations",
        name: "Systems of Linear Equations",
        category: "math",
        subcategory: "Heart of Algebra",
        difficulty: "intermediate",
        estimatedHours: 5,
        description: "Solve systems using substitution, elimination, and graphing",
        skills: ["Substitution method", "Elimination method", "Word problems"]
    },
    {
        id: "linear-functions",
        name: "Linear Functions & Graphs",
        category: "math",
        subcategory: "Heart of Algebra",
        difficulty: "intermediate",
        estimatedHours: 4,
        description: "Interpret and analyze linear functions in context",
        skills: ["Slope interpretation", "Y-intercept meaning", "Parallel/perpendicular lines"]
    },
    {
        id: "absolute-value",
        name: "Absolute Value Equations",
        category: "math",
        subcategory: "Heart of Algebra",
        difficulty: "intermediate",
        estimatedHours: 2,
        description: "Solve equations with absolute value expressions",
        skills: ["Absolute value properties", "Distance interpretation"]
    },

    // Problem Solving & Data Analysis
    {
        id: "ratios-proportions",
        name: "Ratios, Rates & Proportions",
        category: "math",
        subcategory: "Problem Solving & Data Analysis",
        difficulty: "foundational",
        estimatedHours: 3,
        description: "Work with ratios, unit rates, and proportional relationships",
        skills: ["Unit conversion", "Cross multiplication", "Direct variation"]
    },
    {
        id: "percentages",
        name: "Percentages & Percent Change",
        category: "math",
        subcategory: "Problem Solving & Data Analysis",
        difficulty: "foundational",
        estimatedHours: 3,
        description: "Calculate percentages, percent increase/decrease",
        skills: ["Percent of a number", "Percent change formula", "Compound interest"]
    },
    {
        id: "statistics",
        name: "Statistics & Data Interpretation",
        category: "math",
        subcategory: "Problem Solving & Data Analysis",
        difficulty: "intermediate",
        estimatedHours: 5,
        description: "Analyze data using mean, median, mode, range, and standard deviation",
        skills: ["Central tendency", "Spread measures", "Outlier effects"]
    },
    {
        id: "scatterplots",
        name: "Scatterplots & Line of Best Fit",
        category: "math",
        subcategory: "Problem Solving & Data Analysis",
        difficulty: "intermediate",
        estimatedHours: 3,
        description: "Interpret scatter plots and lines of best fit",
        skills: ["Correlation", "Predictions", "Residuals"]
    },
    {
        id: "probability",
        name: "Probability & Counting",
        category: "math",
        subcategory: "Problem Solving & Data Analysis",
        difficulty: "intermediate",
        estimatedHours: 4,
        description: "Calculate probabilities and use counting principles",
        skills: ["Basic probability", "Compound events", "Conditional probability"]
    },
    {
        id: "tables-graphs",
        name: "Two-way Tables & Graphs",
        category: "math",
        subcategory: "Problem Solving & Data Analysis",
        difficulty: "intermediate",
        estimatedHours: 3,
        description: "Read and interpret two-way frequency tables",
        skills: ["Marginal frequencies", "Conditional probability from tables"]
    },

    // Passport to Advanced Math
    {
        id: "quadratic-equations",
        name: "Quadratic Equations",
        category: "math",
        subcategory: "Passport to Advanced Math",
        difficulty: "intermediate",
        estimatedHours: 6,
        description: "Solve quadratics using factoring, formula, and completing the square",
        skills: ["Factoring", "Quadratic formula", "Completing the square", "Discriminant"]
    },
    {
        id: "quadratic-functions",
        name: "Quadratic Functions & Parabolas",
        category: "math",
        subcategory: "Passport to Advanced Math",
        difficulty: "intermediate",
        estimatedHours: 4,
        description: "Analyze quadratic functions and their graphs",
        skills: ["Vertex form", "Axis of symmetry", "Max/min values"]
    },
    {
        id: "polynomials",
        name: "Polynomial Operations",
        category: "math",
        subcategory: "Passport to Advanced Math",
        difficulty: "advanced",
        estimatedHours: 5,
        description: "Add, subtract, multiply, and factor polynomials",
        skills: ["FOIL", "Factoring techniques", "Polynomial division"]
    },
    {
        id: "rational-expressions",
        name: "Rational Expressions & Equations",
        category: "math",
        subcategory: "Passport to Advanced Math",
        difficulty: "advanced",
        estimatedHours: 4,
        description: "Simplify and solve equations with rational expressions",
        skills: ["Simplifying fractions", "Finding LCD", "Extraneous solutions"]
    },
    {
        id: "radicals-exponents",
        name: "Radicals & Rational Exponents",
        category: "math",
        subcategory: "Passport to Advanced Math",
        difficulty: "intermediate",
        estimatedHours: 3,
        description: "Work with square roots and fractional exponents",
        skills: ["Simplifying radicals", "Exponent rules", "Radical equations"]
    },
    {
        id: "exponential-functions",
        name: "Exponential Functions & Growth/Decay",
        category: "math",
        subcategory: "Passport to Advanced Math",
        difficulty: "advanced",
        estimatedHours: 4,
        description: "Model exponential growth and decay situations",
        skills: ["Growth/decay identification", "Compound interest", "Half-life"]
    },
    {
        id: "function-notation",
        name: "Function Notation & Transformations",
        category: "math",
        subcategory: "Passport to Advanced Math",
        difficulty: "intermediate",
        estimatedHours: 4,
        description: "Use function notation and understand transformations",
        skills: ["f(x) notation", "Translations", "Reflections", "Stretches"]
    },

    // Additional Topics in Math
    {
        id: "geometry-basics",
        name: "Geometry Fundamentals",
        category: "math",
        subcategory: "Additional Topics",
        difficulty: "foundational",
        estimatedHours: 4,
        description: "Lines, angles, triangles, and basic properties",
        skills: ["Angle relationships", "Triangle properties", "Parallel lines"]
    },
    {
        id: "circles",
        name: "Circle Equations & Properties",
        category: "math",
        subcategory: "Additional Topics",
        difficulty: "intermediate",
        estimatedHours: 4,
        description: "Circle equations, arc length, sector area",
        skills: ["Standard form", "Arc length", "Central angles"]
    },
    {
        id: "trigonometry",
        name: "Right Triangle Trigonometry",
        category: "math",
        subcategory: "Additional Topics",
        difficulty: "advanced",
        estimatedHours: 5,
        description: "Use sine, cosine, tangent in right triangles",
        skills: ["SOH-CAH-TOA", "Special triangles", "Pythagorean theorem"]
    },
    {
        id: "complex-numbers",
        name: "Complex Numbers",
        category: "math",
        subcategory: "Additional Topics",
        difficulty: "advanced",
        estimatedHours: 2,
        description: "Operations with complex numbers (i)",
        skills: ["Adding/multiplying complex numbers", "Conjugates"]
    },
    {
        id: "coordinate-geometry",
        name: "Coordinate Geometry",
        category: "math",
        subcategory: "Additional Topics",
        difficulty: "intermediate",
        estimatedHours: 3,
        description: "Distance, midpoint, and geometric proofs on coordinate plane",
        skills: ["Distance formula", "Midpoint formula", "Slope applications"]
    },
]

// ============ READING TOPICS ============
export const readingTopics: SATTopic[] = [
    {
        id: "central-ideas",
        name: "Central Ideas & Themes",
        category: "reading",
        subcategory: "Key Ideas",
        difficulty: "foundational",
        estimatedHours: 4,
        description: "Identify main ideas and themes in passages",
        skills: ["Summarization", "Theme identification", "Author's purpose"]
    },
    {
        id: "text-evidence",
        name: "Command of Evidence",
        category: "reading",
        subcategory: "Key Ideas",
        difficulty: "intermediate",
        estimatedHours: 5,
        description: "Find and use textual evidence to support answers",
        skills: ["Quote selection", "Evidence pairing", "Supporting claims"]
    },
    {
        id: "vocabulary-context",
        name: "Words in Context",
        category: "reading",
        subcategory: "Craft & Structure",
        difficulty: "intermediate",
        estimatedHours: 4,
        description: "Determine word meaning from context",
        skills: ["Context clues", "Connotation vs denotation", "Multiple meanings"]
    },
    {
        id: "text-structure",
        name: "Text Structure & Purpose",
        category: "reading",
        subcategory: "Craft & Structure",
        difficulty: "intermediate",
        estimatedHours: 3,
        description: "Analyze how parts of a passage relate",
        skills: ["Paragraph function", "Transitions", "Argument structure"]
    },
    {
        id: "author-purpose",
        name: "Author's Point of View & Purpose",
        category: "reading",
        subcategory: "Craft & Structure",
        difficulty: "intermediate",
        estimatedHours: 3,
        description: "Identify author's perspective and rhetorical choices",
        skills: ["Tone analysis", "Persuasive techniques", "Bias detection"]
    },
    {
        id: "data-in-reading",
        name: "Analyzing Data in Reading",
        category: "reading",
        subcategory: "Integration of Knowledge",
        difficulty: "intermediate",
        estimatedHours: 3,
        description: "Interpret graphs, charts, and tables in passages",
        skills: ["Graph reading", "Data synthesis", "Evidence from graphics"]
    },
    {
        id: "paired-passages",
        name: "Paired Passages & Synthesis",
        category: "reading",
        subcategory: "Integration of Knowledge",
        difficulty: "advanced",
        estimatedHours: 5,
        description: "Compare and contrast two related passages",
        skills: ["Finding connections", "Identifying disagreements", "Synthesis"]
    },
    {
        id: "inference",
        name: "Making Inferences",
        category: "reading",
        subcategory: "Key Ideas",
        difficulty: "intermediate",
        estimatedHours: 4,
        description: "Draw logical conclusions from passage information",
        skills: ["Implicit meaning", "Reading between lines", "Logical deduction"]
    },
    {
        id: "literary-analysis",
        name: "Literary Passage Analysis",
        category: "reading",
        subcategory: "Craft & Structure",
        difficulty: "advanced",
        estimatedHours: 4,
        description: "Analyze narrative techniques in fiction passages",
        skills: ["Character analysis", "Narrative voice", "Literary devices"]
    },
    {
        id: "science-passages",
        name: "Science Passage Strategies",
        category: "reading",
        subcategory: "Passage Types",
        difficulty: "intermediate",
        estimatedHours: 4,
        description: "Approach science-based reading passages effectively",
        skills: ["Scientific reasoning", "Experiment analysis", "Technical vocabulary"]
    },
    {
        id: "history-passages",
        name: "History/Social Studies Passages",
        category: "reading",
        subcategory: "Passage Types",
        difficulty: "intermediate",
        estimatedHours: 4,
        description: "Analyze historical documents and social science texts",
        skills: ["Historical context", "Argument analysis", "Founding documents"]
    },
]

// ============ WRITING TOPICS ============
export const writingTopics: SATTopic[] = [
    // Standard English Conventions
    {
        id: "sentence-structure",
        name: "Sentence Structure",
        category: "writing",
        subcategory: "Standard English Conventions",
        difficulty: "foundational",
        estimatedHours: 4,
        description: "Identify and fix sentence fragments, run-ons, and comma splices",
        skills: ["Complete sentences", "Run-on correction", "Comma splices"]
    },
    {
        id: "punctuation",
        name: "Punctuation Rules",
        category: "writing",
        subcategory: "Standard English Conventions",
        difficulty: "intermediate",
        estimatedHours: 5,
        description: "Master commas, semicolons, colons, dashes, and apostrophes",
        skills: ["Comma rules", "Semicolon use", "Colon use", "Dash use"]
    },
    {
        id: "subject-verb-agreement",
        name: "Subject-Verb Agreement",
        category: "writing",
        subcategory: "Standard English Conventions",
        difficulty: "intermediate",
        estimatedHours: 3,
        description: "Ensure subjects and verbs agree in number",
        skills: ["Finding true subject", "Compound subjects", "Tricky constructions"]
    },
    {
        id: "pronoun-agreement",
        name: "Pronoun Agreement & Clarity",
        category: "writing",
        subcategory: "Standard English Conventions",
        difficulty: "intermediate",
        estimatedHours: 3,
        description: "Fix pronoun-antecedent agreement and ambiguous pronouns",
        skills: ["Antecedent identification", "Singular they", "Pronoun clarity"]
    },
    {
        id: "verb-tense",
        name: "Verb Tense & Mood",
        category: "writing",
        subcategory: "Standard English Conventions",
        difficulty: "intermediate",
        estimatedHours: 3,
        description: "Maintain consistent and appropriate verb tenses",
        skills: ["Tense consistency", "Subjunctive mood", "Irregular verbs"]
    },
    {
        id: "modifiers",
        name: "Modifier Placement",
        category: "writing",
        subcategory: "Standard English Conventions",
        difficulty: "intermediate",
        estimatedHours: 3,
        description: "Fix dangling and misplaced modifiers",
        skills: ["Dangling modifiers", "Misplaced modifiers", "Squinting modifiers"]
    },
    {
        id: "parallel-structure",
        name: "Parallel Structure",
        category: "writing",
        subcategory: "Standard English Conventions",
        difficulty: "intermediate",
        estimatedHours: 2,
        description: "Ensure grammatically parallel constructions",
        skills: ["Lists", "Comparisons", "Correlative conjunctions"]
    },
    {
        id: "possessives",
        name: "Possessives & Contractions",
        category: "writing",
        subcategory: "Standard English Conventions",
        difficulty: "foundational",
        estimatedHours: 2,
        description: "Use apostrophes correctly for possession and contractions",
        skills: ["Its vs it's", "Their/there/they're", "Whose vs who's"]
    },

    // Expression of Ideas
    {
        id: "transitions",
        name: "Effective Transitions",
        category: "writing",
        subcategory: "Expression of Ideas",
        difficulty: "intermediate",
        estimatedHours: 4,
        description: "Choose appropriate transition words and phrases",
        skills: ["Logical connectors", "Contrast transitions", "Addition transitions"]
    },
    {
        id: "sentence-combining",
        name: "Sentence Combining & Variety",
        category: "writing",
        subcategory: "Expression of Ideas",
        difficulty: "intermediate",
        estimatedHours: 3,
        description: "Combine sentences for clarity and style",
        skills: ["Subordination", "Coordination", "Sentence variety"]
    },
    {
        id: "conciseness",
        name: "Conciseness & Wordiness",
        category: "writing",
        subcategory: "Expression of Ideas",
        difficulty: "intermediate",
        estimatedHours: 3,
        description: "Eliminate redundancy and unnecessary words",
        skills: ["Redundancy", "Wordy phrases", "Active voice"]
    },
    {
        id: "precision",
        name: "Precision & Word Choice",
        category: "writing",
        subcategory: "Expression of Ideas",
        difficulty: "intermediate",
        estimatedHours: 3,
        description: "Choose the most precise and effective words",
        skills: ["Vague vs specific", "Formal register", "Appropriate diction"]
    },
    {
        id: "organization",
        name: "Logical Organization",
        category: "writing",
        subcategory: "Expression of Ideas",
        difficulty: "advanced",
        estimatedHours: 4,
        description: "Order sentences and paragraphs logically",
        skills: ["Paragraph order", "Sentence placement", "Topic sentences"]
    },
    {
        id: "support-development",
        name: "Support & Development",
        category: "writing",
        subcategory: "Expression of Ideas",
        difficulty: "advanced",
        estimatedHours: 3,
        description: "Add, revise, or delete information based on relevance",
        skills: ["Relevant details", "Supporting claims", "Deleting irrelevant info"]
    },
    {
        id: "intro-conclusions",
        name: "Introductions & Conclusions",
        category: "writing",
        subcategory: "Expression of Ideas",
        difficulty: "intermediate",
        estimatedHours: 2,
        description: "Evaluate and improve opening and closing sentences",
        skills: ["Hook sentences", "Thesis placement", "Concluding statements"]
    },
]

// ============ ALL TOPICS COMBINED ============
export const allSATTopics: SATTopic[] = [
    ...mathTopics,
    ...readingTopics,
    ...writingTopics,
]

// ============ CATEGORIES FOR UI ============
export const satCategories: SATCategory[] = [
    {
        id: "math",
        name: "Math",
        icon: "📐",
        topics: mathTopics,
    },
    {
        id: "reading",
        name: "Reading",
        icon: "📖",
        topics: readingTopics,
    },
    {
        id: "writing",
        name: "Writing & Language",
        icon: "✍️",
        topics: writingTopics,
    },
]

// ============ TOPIC LOOKUP ============
export function getTopicById(id: string): SATTopic | undefined {
    return allSATTopics.find(t => t.id === id)
}

export function getTopicsByCategory(category: "math" | "reading" | "writing"): SATTopic[] {
    return allSATTopics.filter(t => t.category === category)
}

export function getTopicsByDifficulty(difficulty: "foundational" | "intermediate" | "advanced"): SATTopic[] {
    return allSATTopics.filter(t => t.difficulty === difficulty)
}

export function getTopicsBySubcategory(subcategory: string): SATTopic[] {
    return allSATTopics.filter(t => t.subcategory === subcategory)
}

// ============ STUDY PROGRESSION (Recommended Order) ============
export const recommendedProgression = {
    math: [
        // Foundational first
        "linear-equations",
        "ratios-proportions",
        "percentages",
        "geometry-basics",
        // Intermediate
        "systems-of-equations",
        "linear-functions",
        "quadratic-equations",
        "quadratic-functions",
        "statistics",
        "scatterplots",
        "probability",
        "radicals-exponents",
        "function-notation",
        "circles",
        "coordinate-geometry",
        // Advanced
        "polynomials",
        "rational-expressions",
        "exponential-functions",
        "trigonometry",
        "complex-numbers",
    ],
    reading: [
        "central-ideas",
        "inference",
        "text-evidence",
        "vocabulary-context",
        "text-structure",
        "author-purpose",
        "data-in-reading",
        "science-passages",
        "history-passages",
        "literary-analysis",
        "paired-passages",
    ],
    writing: [
        "sentence-structure",
        "possessives",
        "punctuation",
        "subject-verb-agreement",
        "pronoun-agreement",
        "verb-tense",
        "modifiers",
        "parallel-structure",
        "transitions",
        "conciseness",
        "precision",
        "sentence-combining",
        "intro-conclusions",
        "organization",
        "support-development",
    ],
}

// Total estimated study hours
export const totalEstimatedHours = allSATTopics.reduce((sum, t) => sum + t.estimatedHours, 0)
