// Resource Links for SAT Topics - Khan Academy and other study resources

export interface ResourceLink {
    name: string
    url: string
    type: 'video' | 'practice' | 'article' | 'course'
}

// Map topic IDs to Khan Academy and other resource links
export const topicResourceLinks: Record<string, ResourceLink[]> = {
    // ============ MATH TOPICS ============
    "linear-equations": [
        { name: "Khan Academy: Linear Equations", url: "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities", type: "course" },
        { name: "Practice: Solving Equations", url: "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities/x2f8bb11595b61c86:linear-equations-variables-both-sides/e/linear_equations_4", type: "practice" },
    ],
    "systems-of-equations": [
        { name: "Khan Academy: Systems of Equations", url: "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:systems-of-equations", type: "course" },
        { name: "Practice: Substitution Method", url: "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:systems-of-equations/x2f8bb11595b61c86:solving-systems-substitution/e/systems_of_equations_with_substitution", type: "practice" },
    ],
    "linear-functions": [
        { name: "Khan Academy: Linear Functions", url: "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:linear-equations-graphs", type: "course" },
    ],
    "ratios-proportions": [
        { name: "Khan Academy: Ratios & Proportions", url: "https://www.khanacademy.org/math/pre-algebra/xb4832e56:ratios-rates-proportions", type: "course" },
    ],
    "percentages": [
        { name: "Khan Academy: Percentages", url: "https://www.khanacademy.org/math/pre-algebra/xb4832e56:percentages", type: "course" },
    ],
    "statistics": [
        { name: "Khan Academy: Statistics", url: "https://www.khanacademy.org/math/statistics-probability", type: "course" },
        { name: "Practice: Mean, Median, Mode", url: "https://www.khanacademy.org/math/statistics-probability/summarizing-quantitative-data", type: "practice" },
    ],
    "probability": [
        { name: "Khan Academy: Probability", url: "https://www.khanacademy.org/math/statistics-probability/probability-library", type: "course" },
    ],
    "quadratic-equations": [
        { name: "Khan Academy: Quadratics", url: "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring", type: "course" },
        { name: "Practice: Quadratic Formula", url: "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:quadratic-formula-a1/e/quadratic_equation", type: "practice" },
    ],
    "quadratic-functions": [
        { name: "Khan Academy: Quadratic Graphs", url: "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations", type: "course" },
    ],
    "polynomials": [
        { name: "Khan Academy: Polynomials", url: "https://www.khanacademy.org/math/algebra2/x2ec2f6f830c9fb89:poly-arithmetic", type: "course" },
    ],
    "geometry-basics": [
        { name: "Khan Academy: Geometry", url: "https://www.khanacademy.org/math/geometry", type: "course" },
    ],
    "circles": [
        { name: "Khan Academy: Circles", url: "https://www.khanacademy.org/math/geometry-home/cc-geometry-circles", type: "course" },
    ],
    "trigonometry": [
        { name: "Khan Academy: Trigonometry", url: "https://www.khanacademy.org/math/trigonometry", type: "course" },
        { name: "Practice: SOH-CAH-TOA", url: "https://www.khanacademy.org/math/geometry/hs-geo-trig", type: "practice" },
    ],

    // ============ READING TOPICS ============
    "central-ideas": [
        { name: "Khan Academy: Central Ideas", url: "https://www.khanacademy.org/test-prep/sat/x0a8c2e5f:reading-and-writing/x0a8c2e5f:central-ideas-and-details/a/sat-central-ideas-lesson", type: "article" },
        { name: "SAT Reading Practice", url: "https://www.khanacademy.org/test-prep/sat/x0a8c2e5f:reading-and-writing", type: "practice" },
    ],
    "text-evidence": [
        { name: "Khan Academy: Command of Evidence", url: "https://www.khanacademy.org/test-prep/sat/x0a8c2e5f:reading-and-writing/x0a8c2e5f:command-of-evidence/a/sat-command-of-evidence-lesson", type: "article" },
    ],
    "vocabulary-context": [
        { name: "Khan Academy: Words in Context", url: "https://www.khanacademy.org/test-prep/sat/x0a8c2e5f:reading-and-writing/x0a8c2e5f:words-in-context/a/sat-words-in-context-lesson", type: "article" },
    ],
    "inference": [
        { name: "Khan Academy: Inferences", url: "https://www.khanacademy.org/test-prep/sat/x0a8c2e5f:reading-and-writing/x0a8c2e5f:inferences/a/sat-inferences-lesson", type: "article" },
    ],

    // ============ WRITING TOPICS ============
    "sentence-structure": [
        { name: "Khan Academy: Sentence Structure", url: "https://www.khanacademy.org/test-prep/sat/x0a8c2e5f:reading-and-writing/x0a8c2e5f:boundaries/a/sat-boundaries-lesson", type: "article" },
    ],
    "punctuation": [
        { name: "Khan Academy: Punctuation", url: "https://www.khanacademy.org/humanities/grammar/punctuation-the-comma-and-the-apostrophe", type: "course" },
    ],
    "subject-verb-agreement": [
        { name: "Khan Academy: Subject-Verb Agreement", url: "https://www.khanacademy.org/humanities/grammar/parts-of-speech-the-verb/subject-verb-agreement", type: "course" },
    ],
    "transitions": [
        { name: "Khan Academy: Transitions", url: "https://www.khanacademy.org/test-prep/sat/x0a8c2e5f:reading-and-writing/x0a8c2e5f:transitions/a/sat-transitions-lesson", type: "article" },
    ],
    "conciseness": [
        { name: "Khan Academy: Rhetorical Synthesis", url: "https://www.khanacademy.org/test-prep/sat/x0a8c2e5f:reading-and-writing/x0a8c2e5f:rhetorical-synthesis/a/sat-rhetorical-synthesis-lesson", type: "article" },
    ],
}

// Get resource links for a topic (returns empty array if not found)
export function getResourceLinks(topicId: string): ResourceLink[] {
    return topicResourceLinks[topicId] || []
}

// Get a primary resource link for a topic
export function getPrimaryResourceLink(topicId: string): ResourceLink | null {
    const links = topicResourceLinks[topicId]
    return links && links.length > 0 ? links[0] : null
}

// Fallback Khan Academy search for topics without specific links
export function getKhanAcademySearchUrl(topicName: string): string {
    return `https://www.khanacademy.org/search?referer=%2F&page_search_query=${encodeURIComponent(topicName + " SAT")}`
}
