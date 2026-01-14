import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProfileContent } from "@/components/dashboard/profile-content"

export default async function ProfilePage() {
    const supabase = await createClient()

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser()

    if (error || !user) {
        redirect("/login?redirect=/profile")
    }

    // Fetch user profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

    // Fetch flashcard sets with card count
    const { data: flashcardSets } = await supabase
        .from("flashcard_sets")
        .select("*, flashcards(count)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

    // Fetch summarizer history
    const { data: summarizerHistory } = await supabase
        .from("summarizer_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

    // Fetch test results
    const { data: testResults } = await supabase
        .from("test_results")
        .select("*, tests(*)")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })

    return (
        <ProfileContent
            user={user}
            profile={profile}
            flashcardSets={flashcardSets || []}
            summarizerHistory={summarizerHistory || []}
            testResults={testResults || []}
        />
    )
}
