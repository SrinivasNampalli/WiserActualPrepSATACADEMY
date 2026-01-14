import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { StatsBar } from "@/components/stats-bar"
import { ScoreJourney } from "@/components/score-journey"
import { ReviewsSection } from "@/components/reviews-section"
import { FinalCTA } from "@/components/final-cta"

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <StatsBar />
      <ScoreJourney />
      <ReviewsSection />
      <FinalCTA />
    </main>
  )
}
