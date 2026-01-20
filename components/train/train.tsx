"use client"

interface TrainProps {
    options: string[]
    correctAnswer: string
    selectedAnswer: string | null
    answered: boolean
    onSelect: (answer: string) => void
    position: number
}

export function Train({ options, correctAnswer, selectedAnswer, answered, onSelect, position }: TrainProps) {
    return (
        <div
            className="relative overflow-hidden h-32 bg-muted/30 rounded-xl"
            style={{ transform: `translateX(${position}%)`, transition: 'transform 0.5s ease-out' }}
        >
            <div className="flex h-full items-center gap-2 px-4">
                {/* Engine */}
                <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center text-3xl shrink-0">
                    🚂
                </div>

                {/* Train cars with answers */}
                {options.map((option, index) => {
                    const isCorrect = option === correctAnswer
                    const isSelected = option === selectedAnswer
                    let bgColor = "bg-card border-2 border-border hover:border-primary"

                    if (answered) {
                        if (isCorrect) {
                            bgColor = "bg-green-500 text-white border-2 border-green-600"
                        } else if (isSelected && !isCorrect) {
                            bgColor = "bg-red-500 text-white border-2 border-red-600"
                        }
                    }

                    return (
                        <button
                            key={option}
                            onClick={() => onSelect(option)}
                            disabled={answered}
                            className={`h-20 px-4 rounded-lg font-medium transition-all ${bgColor} ${!answered && 'hover:scale-105 cursor-pointer'} ${answered && 'cursor-default'}`}
                        >
                            {option}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
