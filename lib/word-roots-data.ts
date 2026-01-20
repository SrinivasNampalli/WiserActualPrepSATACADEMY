// Word roots/prefixes data for SAT vocabulary
export interface WordRootQuestion {
    id: string
    rootOrPrefix: string
    meaning: string
    exampleWords: string[]
    question: string
    options: string[]
    correctAnswer: string
    explanation: string
}

const wordRootQuestions: WordRootQuestion[] = [
    {
        id: "1",
        rootOrPrefix: "BENE-",
        meaning: "good, well",
        exampleWords: ["benefit", "benevolent", "benefactor"],
        question: "What does 'benign' most likely mean?",
        options: ["Harmful", "Gentle/harmless", "Loud", "Fast"],
        correctAnswer: "Gentle/harmless",
        explanation: "The prefix 'bene-' means good or well, so 'benign' means harmless or gentle, like a benign tumor (non-cancerous)."
    },
    {
        id: "2",
        rootOrPrefix: "MAL-",
        meaning: "bad, evil",
        exampleWords: ["malfunction", "malicious", "malware"],
        question: "What does 'malediction' most likely mean?",
        options: ["Blessing", "Curse", "Recipe", "Song"],
        correctAnswer: "Curse",
        explanation: "'Mal-' means bad and 'dict' means speak, so malediction literally means 'bad speaking' - a curse."
    },
    {
        id: "3",
        rootOrPrefix: "CHRON-",
        meaning: "time",
        exampleWords: ["chronological", "chronicle", "synchronize"],
        question: "What does 'anachronism' refer to?",
        options: ["A type of clock", "Something out of its time period", "A time zone", "A schedule"],
        correctAnswer: "Something out of its time period",
        explanation: "'Chron' relates to time, and 'ana-' means against/back, so anachronism is something placed in the wrong time period."
    },
    {
        id: "4",
        rootOrPrefix: "CRED-",
        meaning: "believe, trust",
        exampleWords: ["credit", "incredible", "credibility"],
        question: "What does 'incredulous' describe?",
        options: ["Believing easily", "Disbelieving/skeptical", "Angry", "Excited"],
        correctAnswer: "Disbelieving/skeptical",
        explanation: "'In-' means not, and 'cred' means believe, so incredulous means not willing to believe - skeptical."
    },
    {
        id: "5",
        rootOrPrefix: "DICT-",
        meaning: "speak, say",
        exampleWords: ["dictate", "dictionary", "predict"],
        question: "What is a 'dictum'?",
        options: ["A formal statement", "A type of writing", "A number", "A question"],
        correctAnswer: "A formal statement",
        explanation: "'Dict' means speak/say, so a dictum is an authoritative statement or pronounced judgment."
    },
    {
        id: "6",
        rootOrPrefix: "GRAPH-",
        meaning: "write, draw",
        exampleWords: ["photograph", "autograph", "biography"],
        question: "What does 'calligraphy' refer to?",
        options: ["Loud music", "Beautiful handwriting", "A type of camera", "Scientific measurement"],
        correctAnswer: "Beautiful handwriting",
        explanation: "'Calli-' means beautiful and 'graph' means writing, so calligraphy is the art of beautiful writing."
    },
    {
        id: "7",
        rootOrPrefix: "PHON-",
        meaning: "sound",
        exampleWords: ["telephone", "symphony", "microphone"],
        question: "What does 'cacophony' mean?",
        options: ["Beautiful music", "Harsh/unpleasant sounds", "Complete silence", "A type of phone"],
        correctAnswer: "Harsh/unpleasant sounds",
        explanation: "'Caco-' means bad and 'phon' means sound, so cacophony refers to harsh, jarring sounds."
    },
    {
        id: "8",
        rootOrPrefix: "VERT-",
        meaning: "turn",
        exampleWords: ["convert", "revert", "vertigo"],
        question: "What does 'extrovert' suggest about a person?",
        options: ["They turn inward", "They turn outward (sociable)", "They are tall", "They are quiet"],
        correctAnswer: "They turn outward (sociable)",
        explanation: "'Extro-' means outward and 'vert' means turn, so extrovert describes someone who 'turns outward' - is sociable."
    }
]

export function getRandomWordRootQuestions(count: number): WordRootQuestion[] {
    const shuffled = [...wordRootQuestions].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
}

export function getAllWordRootQuestions(): WordRootQuestion[] {
    return wordRootQuestions
}
