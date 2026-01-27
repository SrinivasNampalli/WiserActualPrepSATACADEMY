import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
    try {
        const { priceId } = await req.json()

        if (!priceId) {
            return NextResponse.json({ error: "Price ID is required" }, { status: 400 })
        }

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Create a Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            customer_email: user.email,
            metadata: {
                userId: user.id,
            },
            success_url: `${req.headers.get("origin")}/dashboard?success=true`,
            cancel_url: `${req.headers.get("origin")}/pricing?canceled=true`,
        })

        return NextResponse.json({ sessionId: session.id, url: session.url })
    } catch (err: any) {
        console.error("Error creating checkout session:", err)
        return NextResponse.json(
            { error: err.message || "Internal Server Error" },
            { status: 500 }
        )
    }
}
