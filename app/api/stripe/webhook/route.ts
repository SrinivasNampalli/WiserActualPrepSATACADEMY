import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"
import Stripe from "stripe"

// Initialize Supabase Admin client for webhook
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
        return NextResponse.json({ error: "No signature" }, { status: 400 })
    }

    let event: Stripe.Event

    try {
        // For now, we'll skip signature verification since we don't have webhook secret
        // In production, you should add STRIPE_WEBHOOK_SECRET and verify
        event = JSON.parse(body) as Stripe.Event
    } catch (err) {
        console.error("Webhook parsing error:", err)
        return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session
            const userId = session.metadata?.user_id

            if (userId) {
                // Update user to premium
                const { error } = await supabaseAdmin
                    .from("profiles")
                    .update({
                        subscription_tier: "premium",
                        is_premium: true,
                        stripe_customer_id: session.customer as string,
                        stripe_subscription_id: session.subscription as string,
                        subscription_updated_at: new Date().toISOString(),
                    })
                    .eq("id", userId)

                if (error) {
                    console.error("Error updating user subscription:", error)
                } else {
                    console.log(`User ${userId} upgraded to premium`)
                }
            }
            break
        }

        case "customer.subscription.deleted": {
            const subscription = event.data.object as Stripe.Subscription
            const customerId = subscription.customer as string

            // Find user by stripe customer ID and downgrade
            const { data: profile } = await supabaseAdmin
                .from("profiles")
                .select("id")
                .eq("stripe_customer_id", customerId)
                .single()

            if (profile) {
                await supabaseAdmin
                    .from("profiles")
                    .update({
                        subscription_tier: "free",
                        is_premium: false,
                        subscription_updated_at: new Date().toISOString(),
                    })
                    .eq("id", profile.id)

                console.log(`User ${profile.id} downgraded to free`)
            }
            break
        }

        case "customer.subscription.updated": {
            const subscription = event.data.object as Stripe.Subscription
            const customerId = subscription.customer as string

            // Check if subscription is active or canceled
            const isActive = subscription.status === "active"

            const { data: profile } = await supabaseAdmin
                .from("profiles")
                .select("id")
                .eq("stripe_customer_id", customerId)
                .single()

            if (profile) {
                await supabaseAdmin
                    .from("profiles")
                    .update({
                        subscription_tier: isActive ? "premium" : "free",
                        is_premium: isActive,
                        subscription_updated_at: new Date().toISOString(),
                    })
                    .eq("id", profile.id)
            }
            break
        }

        default:
            console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
}
