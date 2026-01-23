export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  features: string[]
  popular?: boolean
}

// Simplified pricing: Free and Premium only
export const PRODUCTS: Product[] = [
  {
    id: "free-plan",
    name: "Free",
    description: "Get started with essential SAT prep tools",
    priceInCents: 0,
    features: [
      "3 AI chatbot messages per day",
      "1 flashcard set",
      "3 practice quizzes",
      "All games free",
      "Basic progress tracking",
    ],
  },
  {
    id: "premium-plan",
    name: "Premium",
    description: "Everything you need to ace the SAT",
    priceInCents: 899, // $8.99
    features: [
      "Unlimited AI tutoring",
      "Unlimited flashcards",
      "All practice tests",
      "Personalized study calendar",
      "Priority support",
      "200+ point guarantee",
    ],
    popular: true,
  },
]

