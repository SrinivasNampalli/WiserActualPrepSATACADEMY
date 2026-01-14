import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default async function AdminPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/login?redirect=/admin")
  }

  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (profileError || !profile?.is_admin) {
    redirect("/dashboard")
  }

  // Fetch admin dashboard data
  const { data: questions } = await supabase.from("questions").select("*").order("created_at", { ascending: false })

  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("*, quiz_questions(count)")
    .order("created_at", { ascending: false })

  const { data: tests } = await supabase.from("tests").select("*").order("created_at", { ascending: false })

  return (
    <AdminDashboard
      user={user}
      profile={profile}
      questions={questions || []}
      quizzes={quizzes || []}
      tests={tests || []}
    />
  )
}
