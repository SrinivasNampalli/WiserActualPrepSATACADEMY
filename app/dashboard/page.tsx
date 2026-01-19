import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default async function DashboardPage() {
  const supabase = await createClient()
  const adminSupabase = createAdminClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch test results
  const { data: testResults } = await supabase
    .from("test_results")
    .select("*, tests(*)")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(5)

  // Fetch course progress
  const { data: courseProgress } = await supabase
    .from("user_course_progress")
    .select("*, courses(*)")
    .eq("user_id", user.id)
    .limit(10)

  // Fetch summarizer history
  const { data: summarizerHistory } = await supabase
    .from("summarizer_history")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  // Fetch available tests using admin client to bypass RLS
  const { data: allTests, error: testsError } = await adminSupabase
    .from("tests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50)

  console.log("[Dashboard] Fetched tests:", allTests?.length || 0, "Error:", testsError?.message || "none")

  const availableTests = allTests || []

  return (
    <DashboardContent
      user={user}
      profile={profile}
      testResults={testResults || []}
      courseProgress={courseProgress || []}
      summarizerHistory={summarizerHistory || []}
      availableTests={availableTests}
    />
  )
}
