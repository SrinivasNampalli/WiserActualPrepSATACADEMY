"use client"

import { useEffect, useRef, useState } from "react"
import { Purchases, ErrorCode, type PurchasesError } from "@revenuecat/purchases-js"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface RevenueCatCheckoutProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function RevenueCatCheckout({ onSuccess, onCancel }: RevenueCatCheckoutProps) {
  const paywallContainerRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const purchasesRef = useRef<Purchases | null>(null)

  useEffect(() => {
    let isActive = true

    async function initAndShowPaywall() {
      try {
        // Get current user
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
          throw new Error("You must be logged in to subscribe")
        }

        // Check for API key
        if (!process.env.NEXT_PUBLIC_REVENUECAT_API_KEY) {
          throw new Error("Payment system is not configured. Please contact support.")
        }

        // Initialize RevenueCat with user's Supabase ID
        const purchases = Purchases.configure({
          apiKey: process.env.NEXT_PUBLIC_REVENUECAT_API_KEY,
          appUserId: user.id,
        })

        purchasesRef.current = purchases

        if (!isActive || !paywallContainerRef.current) return

        setStatus("ready")

        // Present the RevenueCat paywall
        const result = await purchases.presentPaywall({
          htmlTarget: paywallContainerRef.current,
        })

        if (!isActive) return

        // Handle successful purchase
        if (result.customerInfo) {
          const isPremium = Object.keys(result.customerInfo.entitlements.active).includes("premium")

          if (isPremium) {
            // Update user profile in Supabase
            await supabase
              .from("profiles")
              .update({
                subscription_tier: "premium",
                is_premium: true,
                revenuecat_customer_id: user.id,
                subscription_updated_at: new Date().toISOString(),
              })
              .eq("id", user.id)

            setStatus("success")
            onSuccess?.()
          }
        }
      } catch (error: any) {
        if (!isActive) return

        console.error("RevenueCat checkout error:", error)

        // Handle specific error types
        if (error instanceof Error && "errorCode" in error) {
          const purchaseError = error as PurchasesError
          if (purchaseError.errorCode === ErrorCode.UserCancelledError) {
            onCancel?.()
            return
          }
        }

        setErrorMessage(error.message || "An error occurred during checkout")
        setStatus("error")
      }
    }

    initAndShowPaywall()

    return () => {
      isActive = false
    }
  }, [onSuccess, onCancel])

  if (status === "loading") {
    return (
      <div className="bg-white rounded-lg p-8 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-theme-base mb-4" />
        <p className="text-gray-600">Loading payment options...</p>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="bg-white rounded-lg p-8 flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
        <p className="text-gray-600 text-center">{errorMessage}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-theme-base text-white rounded-lg hover:bg-theme-dark"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (status === "success") {
    return (
      <div className="bg-white rounded-lg p-8 flex flex-col items-center justify-center min-h-[400px]">
        <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to Premium!</h3>
        <p className="text-gray-600 text-center">Your subscription is now active. Enjoy unlimited access!</p>
      </div>
    )
  }

  return (
    <div
      id="revenuecat-paywall"
      ref={paywallContainerRef}
      className="bg-white rounded-lg p-8 min-h-[400px]"
    >
      {/* RevenueCat paywall will be injected here */}
    </div>
  )
}

// Keep the old Checkout export for backwards compatibility, but use new component
export function Checkout({ productId }: { productId: string }) {
  return <RevenueCatCheckout />
}
