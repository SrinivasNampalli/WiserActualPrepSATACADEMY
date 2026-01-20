import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { StudyPlannerContent } from "@/components/study-planner/study-planner-content"
import { Navbar } from "@/components/navbar"

export default async function StudyPlannerPage() {
    const supabase = await createClient()

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser()

    // Fetch profile to check premium status
    let isPremium = false
    if (user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("subscription_tier, is_premium")
            .eq("id", user.id)
            .single()

        isPremium = profile?.is_premium || profile?.subscription_tier === "premium" || false
    }

    return (
        <>
            <Navbar />
            <div className="pt-16"> {/* Offset for fixed navbar */}
                <StudyPlannerContent userId={user?.id || null} isPremium={isPremium} />
            </div>
        </>
    )
}
