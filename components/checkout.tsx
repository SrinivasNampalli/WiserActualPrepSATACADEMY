"use client"

import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"

// Initialize Stripe outside component to avoid recreation
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutProps {
  productId: string
}

export function Checkout({ productId }: CheckoutProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("Starting checkout process...")

      const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID
      console.log("Price ID:", priceId)

      if (!priceId) {
        throw new Error("Stripe Price ID is not configured. Please add NEXT_PUBLIC_STRIPE_PRICE_ID to .env.local")
      }

      console.log("Sending request to /api/stripe/checkout")
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
        }),
      })

      const data = await response.json()
      console.log("Response data:", data)

      if (!response.ok) {
        throw new Error(data.error || "Checkout failed")
      }

      if (data.url) {
        console.log("Redirecting to:", data.url)
        window.location.href = data.url
        return
      }

      // Fallback for debugging (shouldn't be reached if API returns URL)
      console.log("No URL returned, checking Stripe object")
      const stripe = await stripePromise
      if (!stripe) throw new Error("Stripe failed to load")

      // Deprecated method fallback
      console.warn("Using deprecated redirectToCheckout")
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      })

      if (stripeError) {
        throw new Error(stripeError.message)
      }
    } catch (err: any) {
      console.error("Checkout error:", err)
      setError(err.message || "An error occurred during checkout")
      setLoading(false) // Only stop loading on error, otherwise keep loading while redirecting
    }
  }

  // Auto-redirect on mount
  useEffect(() => {
    handleCheckout()
  }, [])

  // Check for success/canceled query params
  const urlParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "")
  const success = urlParams.get("success")
  const canceled = urlParams.get("canceled")

  if (success) {
    return (
      <div className="bg-white rounded-lg p-8 flex flex-col items-center justify-center min-h-[400px]">
        <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to Premium!</h3>
        <p className="text-gray-600 text-center">Your subscription is now active. Enjoy unlimited access!</p>
        <button
          onClick={() => window.location.href = "/dashboard"}
          className="mt-6 px-6 py-2 bg-theme-base text-white rounded-lg hover:bg-theme-dark transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    )
  }

  if (canceled) {
    return (
      <div className="bg-white rounded-lg p-8 flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Checkout Canceled</h3>
        <p className="text-gray-600 text-center">Your payment was not processed. No charges were made.</p>
        <button
          onClick={() => window.location.href = "/pricing"}
          className="mt-6 px-6 py-2 bg-theme-base text-white rounded-lg hover:bg-theme-dark transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-8 flex flex-col items-center justify-center min-h-[400px] shadow-xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Upgrade to Premium</h2>

      <div className="text-center mb-8">
        <p className="text-4xl font-bold text-theme-base mb-2">$8.99<span className="text-lg text-gray-500 font-normal">/month</span></p>
        <p className="text-gray-600">Cancel anytime. 200+ point increase guarantee.</p>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm max-w-md w-full">
          {error}
          <button
            onClick={handleCheckout}
            className="block mt-2 text-sm font-semibold underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center">
          <Loader2 className="h-8 w-8 text-theme-base animate-spin mb-4" />
          <p className="text-lg font-medium text-gray-700">Redirecting to secure payment...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait a moment.</p>
        </div>
      )}

      <p className="mt-8 text-xs text-gray-400">
        Secured by Stripe. We do not store your credit card information.
      </p>
    </div>
  )
}
