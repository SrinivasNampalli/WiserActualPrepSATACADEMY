"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, Loader2 } from "lucide-react"
import { PRODUCTS } from "@/lib/products"
import { Checkout } from "@/components/checkout"
import { createClient } from "@/lib/supabase/client"

// Competitor comparison data
const comparisonFeatures = [
  { feature: "Monthly Price", us: "$15", khan: "Free", prepscholar: "$399+", kaplan: "$199+" },
  { feature: "AI-Powered Feedback", us: true, khan: false, prepscholar: true, kaplan: false },
  { feature: "Real SAT Mock Tests", us: true, khan: false, prepscholar: true, kaplan: true },
  { feature: "Personalized Study Plan", us: true, khan: false, prepscholar: true, kaplan: true },
  { feature: "1-on-1 Tutoring", us: false, khan: false, prepscholar: "Add-on", kaplan: "Add-on" },
  { feature: "Score Guarantee", us: "200+ pts", khan: false, prepscholar: "160 pts", kaplan: "Higher score" },
  { feature: "Mobile App", us: "Coming Soon", khan: true, prepscholar: true, kaplan: true },
  { feature: "Unlimited Practice", us: true, khan: true, prepscholar: true, kaplan: false },
  { feature: "AI Flashcards", us: true, khan: false, prepscholar: false, kaplan: false },
  { feature: "AI Summarizer", us: true, khan: false, prepscholar: false, kaplan: false },
]

function ComparisonCell({ value }: { value: boolean | string }) {
  if (value === true) {
    return <Check className="h-5 w-5 text-green-500 mx-auto" />
  }
  if (value === false) {
    return <X className="h-5 w-5 text-red-400 mx-auto" />
  }
  return <span className="text-sm text-center block">{value}</span>
}

export default function PricingPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [authChecked, setAuthChecked] = useState(false)

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setAuthChecked(true)
    }
    checkAuth()
  }, [])

  const handleUpgradeClick = async (productId: string) => {
    setIsCheckingAuth(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // Redirect to login with return URL
      router.push(`/login?redirect=/pricing&plan=${productId}`)
      return
    }

    setSelectedPlan(productId)
    setIsCheckingAuth(false)
  }

  // Handle redirect back from login with plan parameter
  useEffect(() => {
    if (authChecked && user) {
      const urlParams = new URLSearchParams(window.location.search)
      const planFromUrl = urlParams.get('plan')
      if (planFromUrl) {
        setSelectedPlan(planFromUrl)
        // Clean up URL
        window.history.replaceState({}, '', '/pricing')
      }
    }
  }, [authChecked, user])

  if (selectedPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B4B6B] to-[#0A2540] p-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setSelectedPlan(null)}
            className="mb-6 text-white hover:text-theme"
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
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">Simple, Affordable Pricing</h1>
          <p className="text-xl text-white/80">Get premium SAT prep at a fraction of the cost</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-20">
          {PRODUCTS.map((product) => (
            <Card
              key={product.id}
              className={`relative ${product.popular ? "border-theme border-2 shadow-2xl scale-105" : ""}`}
            >
              {product.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-theme-base text-white">
                  Best Value
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{product.name}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
                <div className="mt-4">
                  {product.priceInCents === 0 ? (
                    <span className="text-4xl font-bold text-theme">Free</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-[#1B4B6B]">${(product.priceInCents / 100).toFixed(0)}</span>
                      <span className="text-muted-foreground">/month</span>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-theme shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant={product.popular ? "default" : "outline"}
                  onClick={() => product.priceInCents === 0 ? router.push("/signup") : handleUpgradeClick(product.id)}
                  disabled={isCheckingAuth}
                  className={product.popular ? "w-full bg-theme-base hover:bg-theme-dark text-white" : "w-full"}
                >
                  {isCheckingAuth ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Checking...</>
                  ) : (
                    product.priceInCents === 0 ? "Get Started Free" : "Upgrade to Premium"
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">How We Compare</h2>
            <p className="text-white/70">See why students choose WiserPrep over expensive alternatives</p>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left p-4 font-semibold text-gray-700">Feature</th>
                    <th className="p-4 text-center">
                      <div className="font-bold text-theme">WiserPrep</div>
                      <div className="text-xs text-gray-500">Premium</div>
                    </th>
                    <th className="p-4 text-center">
                      <div className="font-semibold text-gray-700">Khan Academy</div>
                    </th>
                    <th className="p-4 text-center">
                      <div className="font-semibold text-gray-700">PrepScholar</div>
                    </th>
                    <th className="p-4 text-center">
                      <div className="font-semibold text-gray-700">Kaplan</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((row, index) => (
                    <tr key={index} className={`border-b ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                      <td className="p-4 font-medium text-gray-700">{row.feature}</td>
                      <td className="p-4 bg-theme-base/5">
                        <ComparisonCell value={row.us} />
                      </td>
                      <td className="p-4">
                        <ComparisonCell value={row.khan} />
                      </td>
                      <td className="p-4">
                        <ComparisonCell value={row.prepscholar} />
                      </td>
                      <td className="p-4">
                        <ComparisonCell value={row.kaplan} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <p className="text-center text-white/50 text-sm mt-4">
            * Competitor pricing as of January 2026. Prices may vary.
          </p>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-theme-base/20 to-theme-dark/20 border-theme/30">
            <CardContent className="pt-8 pb-8">
              <h3 className="text-2xl font-bold text-white mb-3">Ready to Boost Your Score?</h3>
              <p className="text-white/80 mb-6">
                Join thousands of students who improved their SAT scores with our AI-powered platform.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => router.push("/signup")} variant="outline" className="border-white text-white hover:bg-white/10">
                  Start Free
                </Button>
                <Button onClick={() => handleUpgradeClick("premium-plan")} className="bg-theme-base hover:bg-theme-dark text-white">
                  Get Premium - $9/mo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
