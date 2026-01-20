import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { OnboardingContent } from "./onboarding-content"

export default async function OnboardingPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    // Get user profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

    return <OnboardingContent user={user} profile={profile} />
}
