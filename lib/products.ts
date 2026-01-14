export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  features: string[]
  popular?: boolean
}

// This is the source of truth for all products
export const PRODUCTS: Product[] = [
  {
    id: "basic-plan",
    name: "Basic",
    description: "Perfect for getting started with SAT prep",
    priceInCents: 4900, // $49
    features: [
      "Access to 500+ practice questions",
      "Basic progress tracking",
      "Study guides and tips",
      "Email support",
    ],
  },
  {
    id: "pro-plan",
    name: "Pro",
    description: "Our most popular plan for serious students",
    priceInCents: 9900, // $99
    features: [
      "Everything in Basic",
      "Full AI-powered evaluation",
      "Real mock test questions",
      "Spaced repetition learning",
      "Personalized study plan",
      "Priority support",
      "200+ point score guarantee",
    ],
    popular: true,
  },
  {
    id: "premium-plan",
    name: "Premium",
    description: "Complete SAT mastery with 1-on-1 tutoring",
    priceInCents: 19900, // $199
    features: [
      "Everything in Pro",
      "Weekly 1-on-1 tutoring sessions",
      "College application guidance",
      "Unlimited practice tests",
      "Custom study materials",
      "Phone & video support",
      "Dedicated success coach",
    ],
  },
]
