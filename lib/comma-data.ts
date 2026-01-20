// Punctuation question types used by Comma Fall game
export interface PunctuationQuestion {
    id: string
    sentence: string
    options: string[]
    correctAnswer: string
    explanation: string
}

const punctuationQuestions: PunctuationQuestion[] = [
    {
        id: "1",
        sentence: "The dog ran quickly __ and the cat followed behind.",
        options: [",", ";", ":", "."],
        correctAnswer: ",",
        explanation: "Use a comma before a coordinating conjunction (and) joining two independent clauses."
    },
    {
        id: "2",
        sentence: "I love pizza __ however __ I rarely eat it.",
        options: [", ,", "; ,", ": ,", "- -"],
        correctAnswer: "; ,",
        explanation: "Use a semicolon before 'however' and a comma after when it joins two independent clauses."
    },
    {
        id: "3",
        sentence: "She bought three things __ apples __ oranges __ and bananas.",
        options: [": , ,", ", , ,", "; , ,", "- - -"],
        correctAnswer: ": , ,",
        explanation: "Use a colon to introduce a list, then commas to separate items."
    },
    {
        id: "4",
        sentence: "Running through the park __ Sarah saw her friend.",
        options: [",", ";", ":", "no punctuation"],
        correctAnswer: ",",
        explanation: "Use a comma after an introductory participial phrase."
    },
    {
        id: "5",
        sentence: "The book __ which was published in 2020 __ became a bestseller.",
        options: [", ,", "- -", "( )", ": :"],
        correctAnswer: ", ,",
        explanation: "Use commas to set off non-essential (non-restrictive) clauses."
    },
    {
        id: "6",
        sentence: "My sister lives in Boston __ my brother lives in New York.",
        options: [",", ";", ":", "and"],
        correctAnswer: ";",
        explanation: "Use a semicolon to join two closely related independent clauses."
    },
    {
        id: "7",
        sentence: "The teacher said __ 'Please open your books.'",
        options: [",", ":", ";", "."],
        correctAnswer: ",",
        explanation: "Use a comma before a direct quotation when it follows a verb of saying."
    },
    {
        id: "8",
        sentence: "I need to buy eggs __ milk __ bread __ and cheese.",
        options: [", , ,", "; ; ;", ": : :", "- - -"],
        correctAnswer: ", , ,",
        explanation: "Use commas to separate items in a simple list."
    },
    {
        id: "9",
        sentence: "Although it was raining __ we went to the park.",
        options: [",", ";", ":", "no punctuation"],
        correctAnswer: ",",
        explanation: "Use a comma after an introductory dependent clause."
    },
    {
        id: "10",
        sentence: "The concert starts at 8 PM __ don't be late!",
        options: [";", ",", ":", "—"],
        correctAnswer: ";",
        explanation: "Use a semicolon to join two independent clauses without a conjunction."
    },
    {
        id: "11",
        sentence: "There's only one thing I want for my birthday __ a new laptop.",
        options: [":", ",", ";", "-"],
        correctAnswer: ":",
        explanation: "Use a colon to introduce something that explains or illustrates what precedes it."
    },
    {
        id: "12",
        sentence: "The storm __ a category 5 hurricane __ destroyed the town.",
        options: [", ,", "— —", "( )", ": :"],
        correctAnswer: ", ,",
        explanation: "Use commas (or dashes) to set off an appositive phrase."
    }
]

export function getRandomPunctuationQuestions(count: number): PunctuationQuestion[] {
    const shuffled = [...punctuationQuestions].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
}

export function getAllPunctuationQuestions(): PunctuationQuestion[] {
    return punctuationQuestions
}
