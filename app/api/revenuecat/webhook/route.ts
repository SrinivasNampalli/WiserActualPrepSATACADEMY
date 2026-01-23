import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase Admin client for webhook
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// RevenueCat webhook event types
type RevenueCatEventType =
    | "INITIAL_PURCHASE"
    | "RENEWAL"
    | "CANCELLATION"
    | "UNCANCELLATION"
    | "NON_RENEWING_PURCHASE"
    | "SUBSCRIPTION_PAUSED"
    | "EXPIRATION"
    | "BILLING_ISSUE"
    | "PRODUCT_CHANGE"
    | "TRANSFER"

interface RevenueCatWebhookEvent {
    api_version: string
    event: {
        type: RevenueCatEventType
        id: string
        app_user_id: string
        product_id: string
        entitlement_id?: string
        entitlement_ids?: string[]
        purchased_at_ms: number
        expiration_at_ms?: number
        period_type?: string
        store: string
        environment: string
        is_trial_conversion?: boolean
        is_family_share?: boolean
        takehome_percentage?: number
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as RevenueCatWebhookEvent
        const event = body.event

        console.log(`RevenueCat webhook received: ${event.type} for user ${event.app_user_id}`)

        // Handle different event types
        switch (event.type) {
            case "INITIAL_PURCHASE":
            case "RENEWAL":
            case "UNCANCELLATION": {
                // Grant premium access
                const hasPremium = event.entitlement_ids?.includes("premium") ||
                    event.entitlement_id === "premium"

                if (hasPremium) {
                    const { error } = await supabaseAdmin
                        .from("profiles")
                        .update({
                            subscription_tier: "premium",
                            is_premium: true,
                            revenuecat_customer_id: event.app_user_id,
                            subscription_updated_at: new Date().toISOString(),
                        })
                        .eq("id", event.app_user_id)

                    if (error) {
                        console.error("Error updating user subscription:", error)
                    } else {
                        console.log(`User ${event.app_user_id} upgraded to premium`)
                    }
                }
                break
            }

            case "CANCELLATION":
            case "EXPIRATION": {
                // Revoke premium access
                const { error } = await supabaseAdmin
                    .from("profiles")
                    .update({
                        subscription_tier: "free",
                        is_premium: false,
                        subscription_updated_at: new Date().toISOString(),
                    })
                    .eq("id", event.app_user_id)

                if (error) {
                    console.error("Error downgrading user:", error)
                } else {
                    console.log(`User ${event.app_user_id} downgraded to free`)
                }
                break
            }

            case "BILLING_ISSUE": {
                // Log billing issue but don't immediately revoke
                console.log(`Billing issue for user ${event.app_user_id}`)
                break
            }

            default:
                console.log(`Unhandled RevenueCat event type: ${event.type}`)
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error("RevenueCat webhook error:", error)
        return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
    }
}
