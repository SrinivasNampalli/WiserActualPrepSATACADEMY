"use server"

import { stripe } from "@/lib/stripe"
import { PRODUCTS } from "@/lib/products"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

export async function startCheckoutSession(productId: string) {
  try {
    const product = PRODUCTS.find((p) => p.id === productId)
    if (!product) {
      throw new Error(`Product with id "${productId}" not found`)
    }

    // Verify Stripe secret key is set
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("STRIPE_SECRET_KEY is not set")
      throw new Error("Payment system is not configured. Please contact support.")
    }

    // Get current user for metadata
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error("Auth error:", authError)
      throw new Error("Authentication error. Please log in again.")
    }

    if (!user) {
      throw new Error("You must be logged in to subscribe")
    }

    console.log("Creating checkout session for user:", user.id, "product:", productId)

    // Create Checkout Sessions with user metadata
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      redirect_on_completion: "never",
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        product_id: productId,
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: product.priceInCents,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
    })

    if (!session.client_secret) {
      throw new Error("Failed to create checkout session - no client secret returned")
    }

    console.log("Checkout session created successfully:", session.id)
    return session.client_secret
  } catch (error: any) {
    console.error("Stripe checkout error:", error)
    // Re-throw with more context
    if (error.type === 'StripeAuthenticationError') {
      throw new Error("Payment system authentication failed. Please contact support.")
    }
    if (error.type === 'StripeInvalidRequestError') {
      throw new Error("Invalid payment request: " + error.message)
    }
    throw error
  }
}
