import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { StatsBar } from "@/components/stats-bar"
import { ScoreJourney } from "@/components/score-journey"
import { FinalCTA } from "@/components/final-cta"
import { SATCountdown } from "@/components/sat-countdown"
import { ExitIntentPopup } from "@/components/exit-intent-popup"
import { TrustBadges } from "@/components/trust-badges"
import { CaseStudies } from "@/components/case-studies"
import { CredentialsSection } from "@/components/credentials-section"
import { UniqueValueProp } from "@/components/unique-value-prop"

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Urgency banner at top */}
      <SATCountdown variant="banner" />

      <Navbar />
      <HeroSection />

      {/* Third-party trust badges */}
      <TrustBadges variant="full" />

      <StatsBar />

      {/* Unique Value Proposition - What makes us different */}
      <UniqueValueProp />

      <ScoreJourney />

      {/* Case studies with verified results */}
      <CaseStudies variant="carousel" />

      {/* Team credentials */}
      <CredentialsSection variant="full" />

      <FinalCTA />

      {/* Exit intent popup for lead capture */}
      <ExitIntentPopup />
    </main>
  )
}

