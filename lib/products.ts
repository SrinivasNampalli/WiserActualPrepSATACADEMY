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
    priceInCents: 0, // Free
    features: [
      "100 practice questions",
      "Basic AI question solver",
      "Limited flashcard generation",
      "Progress tracking",
      "Community support",
    ],
  },
  {
    id: "premium-plan",
    name: "Premium",
    description: "Unlimited access to all features",
    priceInCents: 1500, // $15
    features: [
      "Unlimited practice questions",
      "Full AI-powered tutoring",
      "Unlimited flashcards & summarizer",
      "Real SAT mock tests",
      "Personalized study plans",
      "Priority support",
      "200+ point score guarantee",
    ],
    popular: true,
  },
]
