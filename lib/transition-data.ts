// Transition words data for SAT Writing
export interface TransitionQuestion {
    id: string
    sentence: string
    options: string[]
    correctAnswer: string
    explanation: string
}

const transitionQuestions: TransitionQuestion[] = [
    {
        id: "1",
        sentence: "The experiment failed. ______, the researchers learned valuable lessons.",
        options: ["However", "Therefore", "Similarly", "Furthermore"],
        correctAnswer: "However",
        explanation: "'However' shows contrast between the failure and the positive outcome of learning."
    },
    {
        id: "2",
        sentence: "She studied every night. ______, she passed the exam with flying colors.",
        options: ["Nevertheless", "Consequently", "Meanwhile", "Otherwise"],
        correctAnswer: "Consequently",
        explanation: "'Consequently' shows a cause-and-effect relationship between studying and passing."
    },
    {
        id: "3",
        sentence: "The weather was terrible. ______, we decided to stay home.",
        options: ["However", "Therefore", "Indeed", "Likewise"],
        correctAnswer: "Therefore",
        explanation: "'Therefore' indicates that staying home was a logical result of the bad weather."
    },
    {
        id: "4",
        sentence: "The first experiment yielded positive results. ______, the second experiment showed similar outcomes.",
        options: ["In contrast", "Similarly", "Nevertheless", "Instead"],
        correctAnswer: "Similarly",
        explanation: "'Similarly' connects two things that share common characteristics or outcomes."
    },
    {
        id: "5",
        sentence: "The company faced many challenges. ______, it continued to grow.",
        options: ["Nevertheless", "Therefore", "Similarly", "For instance"],
        correctAnswer: "Nevertheless",
        explanation: "'Nevertheless' shows that growth continued despite the challenges."
    },
    {
        id: "6",
        sentence: "You should exercise regularly. ______, you should maintain a healthy diet.",
        options: ["However", "In addition", "Instead", "Otherwise"],
        correctAnswer: "In addition",
        explanation: "'In addition' adds another related point to the first statement."
    },
    {
        id: "7",
        sentence: "The movie received poor reviews. ______, it became a box office hit.",
        options: ["Therefore", "Surprisingly", "Similarly", "For example"],
        correctAnswer: "Surprisingly",
        explanation: "'Surprisingly' indicates an unexpected contrast between reviews and success."
    },
    {
        id: "8",
        sentence: "Many students prefer online classes. ______, some teachers argue in-person learning is more effective.",
        options: ["Likewise", "On the other hand", "Therefore", "Specifically"],
        correctAnswer: "On the other hand",
        explanation: "'On the other hand' presents an opposing viewpoint."
    }
]

export function getRandomQuestions(count: number): TransitionQuestion[] {
    const shuffled = [...transitionQuestions].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
}

export function getAllQuestions(): TransitionQuestion[] {
    return transitionQuestions
}
