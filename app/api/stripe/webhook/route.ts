import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"
import Stripe from "stripe"

// Initialize Supabase Admin client for webhook
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const relevantEvents = new Set([
    "checkout.session.completed",
    "customer.subscription.updated",
    "customer.subscription.deleted",
])

export async function POST(req: Request) {
    const body = await req.text()
    const sig = (await headers()).get("Stripe-Signature")
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    let event: Stripe.Event

    // Verify Stripe signature if secret is present
    try {
        if (!sig || !webhookSecret) {
            // If no webhook secret is configured yet, we can't verify the signature
            // For development/debugging, we might want to proceed or return early
            console.warn("Webhook secret not configured or signature missing")
            return NextResponse.json({ error: "Webhook secret not configured" }, { status: 400 })
        }
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } catch (err: any) {
        console.error(`❌ Error message: ${err.message}`)
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
    }

    if (relevantEvents.has(event.type)) {
        try {
            switch (event.type) {
                case "checkout.session.completed":
                    const checkoutSession = event.data.object as Stripe.Checkout.Session
                    if (checkoutSession.mode === "subscription") {
                        const subscriptionId = checkoutSession.subscription as string
                        const userId = checkoutSession.metadata?.userId

                        if (userId) {
                            await supabaseAdmin
                                .from("profiles")
                                .update({
                                    subscription_tier: "premium",
                                    is_premium: true,
                                    stripe_subscription_id: subscriptionId,
                                    stripe_customer_id: checkoutSession.customer as string,
                                    subscription_updated_at: new Date().toISOString(),
                                })
                                .eq("id", userId)

                            console.log(`✅ User ${userId} upgraded to premium via Checkout`)
                        }
                    }
                    break

                case "customer.subscription.updated":
                case "customer.subscription.deleted":
                    const subscription = event.data.object as Stripe.Subscription
                    const subscriptionStatus = subscription.status

                    if (subscriptionStatus !== "active" && subscriptionStatus !== "trialing") {
                        // Find user by stripe_subscription_id and revoke access
                        // Note: In a real app we might want to be more careful about grac periods etc.
                        const { error } = await supabaseAdmin
                            .from("profiles")
                            .update({
                                subscription_tier: "free",
                                is_premium: false,
                                subscription_updated_at: new Date().toISOString(),
                            })
                            .eq("stripe_subscription_id", subscription.id)

                        if (!error) {
                            console.log(`User subscription ${subscription.id} updated/deleted. Access revoked.`)
                        }
                    } else {
                        // Ensure access is permitted
                        const { error } = await supabaseAdmin
                            .from("profiles")
                            .update({
                                subscription_tier: "premium",
                                is_premium: true,
                                subscription_updated_at: new Date().toISOString(),
                            })
                            .eq("stripe_subscription_id", subscription.id)
                        if (!error) {
                            console.log(`User subscription ${subscription.id} is active. Access confirmed.`)
                        }
                    }
                    break

                default:
                    throw new Error("Unhandled relevant event!")
            }
        } catch (error) {
            console.error(error)
            return NextResponse.json(
                { error: "Webhook handler failed." },
                { status: 400 }
            )
        }
    }

    return NextResponse.json({ received: true })
}
