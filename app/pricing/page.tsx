"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { PRODUCTS } from "@/lib/products"
import { Checkout } from "@/components/checkout"

export default function PricingPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  if (selectedPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B4B6B] to-[#0A2540] p-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setSelectedPlan(null)}
            className="mb-6 text-white hover:text-[#4ECDC4]"
          >
            ← Back to Plans
          </Button>
          <Checkout productId={selectedPlan} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B4B6B] to-[#0A2540] py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">Choose Your Plan</h1>
          <p className="text-xl text-white/80">Start your journey to SAT success today</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {PRODUCTS.map((product) => (
            <Card
              key={product.id}
              className={`relative ${product.popular ? "border-[#4ECDC4] border-2 shadow-2xl scale-105" : ""}`}
            >
              {product.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#4ECDC4] text-[#0A2540]">
                  Most Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{product.name}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-[#1B4B6B]">${(product.priceInCents / 100).toFixed(0)}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-[#4ECDC4] shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={product.popular ? "default" : "outline"}
                  onClick={() => setSelectedPlan(product.id)}
                  style={
                    product.popular
                      ? {
                          backgroundColor: "#4ECDC4",
                          color: "#0A2540",
                        }
                      : undefined
                  }
                >
                  Get Started
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
