"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowDown } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  const [mounted, setMounted] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [currentScore, setCurrentScore] = useState(1080)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)

    const handleScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect()
        const scrollProgress = Math.max(0, Math.min(1, -rect.top / (rect.height * 0.5)))
        setScrollY(scrollProgress)

        // Animate score based on scroll
        const newScore = Math.floor(1080 + scrollProgress * 320)
        setCurrentScore(Math.min(1400, newScore))
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scoreColor = currentScore > 1300 ? "#62b6cb" : currentScore > 1200 ? "#5fa8d3" : "#1b4965"

  return (
    <section ref={heroRef} className="relative min-h-[200vh] bg-[#1b4965]">
      {/* Sticky container for the hero content */}
      <div className="sticky top-0 flex min-h-screen flex-col items-center justify-center overflow-hidden">
        {/* Animated gradient background */}
        <div
          className="absolute inset-0 transition-all duration-500"
          style={{
            background: `radial-gradient(ellipse at 50% 50%, 
              rgba(190, 233, 232, ${0.1 + scrollY * 0.3}) 0%, 
              rgba(27, 73, 101, 1) 70%)`,
          }}
        />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute h-2 w-2 rounded-full bg-[#bee9e8]/30"
              style={{
                left: `${10 + i * 4.5}%`,
                top: `${20 + (i % 5) * 15}%`,
                transform: `translateY(${scrollY * (50 + i * 10)}px) scale(${1 + scrollY * 0.5})`,
                opacity: mounted ? 0.3 + scrollY * 0.5 : 0,
                transition: "opacity 1s ease-out",
              }}
            />
          ))}
        </div>

        {/* Main score display - the centerpiece */}
        <div className="relative z-10 flex flex-col items-center px-6 text-center">
          {/* Pre-headline */}
          <p
            className={`text-sm font-medium uppercase tracking-[0.3em] text-[#bee9e8] transition-all duration-1000 md:text-base ${
              mounted ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
            }`}
          >
            Your Score Journey
          </p>

          {/* The Score - main interactive element */}
          <div
            className={`relative mt-8 transition-all duration-1000 ${
              mounted ? "scale-100 opacity-100" : "scale-90 opacity-0"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <span
              className="font-bold leading-none tracking-tight transition-colors duration-300"
              style={{
                fontSize: "clamp(120px, 25vw, 280px)",
                color: scoreColor,
                textShadow: `0 0 120px ${scoreColor}40`,
              }}
            >
              {currentScore}
            </span>

            {/* Score change indicator */}
            <div
              className={`absolute -right-4 top-4 rounded-full bg-[#bee9e8] px-4 py-2 font-semibold text-[#1b4965] shadow-lg transition-all duration-500 md:-right-8 ${
                scrollY > 0.1 ? "scale-100 opacity-100" : "scale-75 opacity-0"
              }`}
            >
              +{currentScore - 1080}
            </div>
          </div>

          {/* Dynamic headline based on scroll */}
          <h1
            className={`mt-6 max-w-3xl text-2xl font-medium text-white/90 transition-all duration-1000 md:text-3xl ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            {scrollY < 0.3 ? (
              <span className="text-balance">This is where you start.</span>
            ) : scrollY < 0.6 ? (
              <span className="text-balance">Watch your potential unfold.</span>
            ) : (
              <span className="text-balance">This is where you belong.</span>
            )}
          </h1>

          {/* Subheadline */}
          <p
            className={`mt-4 max-w-xl text-base text-white/60 transition-all duration-1000 md:text-lg ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: "600ms" }}
          >
            Scroll to see your transformation
          </p>
        </div>

        {/* Scroll indicator */}
        <div
          className={`absolute bottom-12 flex flex-col items-center gap-2 transition-all duration-1000 ${
            mounted && scrollY < 0.2 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
          style={{ transitionDelay: "800ms" }}
        >
          <span className="text-sm text-white/50">Scroll to explore</span>
          <ArrowDown className="h-5 w-5 animate-bounce text-white/50" />
        </div>
      </div>

      {/* Second section that appears as you scroll through */}
      <div className="relative z-20 flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-transparent via-[#1b4965] to-white px-6 pb-32 pt-20">
        <div
          className="max-w-3xl text-center"
          style={{
            opacity: Math.min(1, scrollY * 2),
            transform: `translateY(${Math.max(0, 50 - scrollY * 100)}px)`,
          }}
        >
          <h2 className="text-3xl font-bold text-white md:text-5xl">
            <span className="text-balance">Your dream school is waiting.</span>
          </h2>
          <p className="mt-6 text-lg text-white/80 md:text-xl">
            Join 50,000+ students who transformed their scores with personalized AI tutoring that adapts to exactly how
            you learn.
          </p>
          <Link href="/signup">
            <Button className="mt-10 rounded-full bg-[#bee9e8] px-10 py-7 text-lg font-semibold text-[#1b4965] shadow-xl transition-all hover:bg-white hover:shadow-2xl">
              Start Your Free Trial
            </Button>
          </Link>
          <p className="mt-4 text-sm text-white/50">No credit card required</p>
        </div>
      </div>
    </section>
  )
}
