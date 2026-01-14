"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Star, TrendingUp, Calculator, BookOpen, PenTool } from "lucide-react"

const categoryIcons = {
  math: Calculator,
  reading: BookOpen,
  writing: PenTool,
}

const reviews = [
  {
    name: "Sarah Mitchell",
    avatar: "/young-woman-professional-headshot.png",
    location: "Boston, MA",
    rating: 5,
    scoreBefore: 1180,
    scoreAfter: 1420,
    quote:
      "The AI knew exactly what I needed to work on. I never thought I could improve this much in just 2 months. Now I'm headed to my dream school!",
    categories: [
      { name: "math", label: "Math", before: 560, after: 720 },
      { name: "reading", label: "Reading", before: 340, after: 380 },
      { name: "writing", label: "Writing", before: 280, after: 320 },
    ],
    highlight: "Algebra & Functions",
  },
  {
    name: "James Kim",
    avatar: "/young-asian-man-professional-headshot.jpg",
    location: "Seattle, WA",
    rating: 5,
    scoreBefore: 1050,
    scoreAfter: 1310,
    quote:
      "Way better than any tutor I've had. The practice questions felt just like the real test. The analytics showed me patterns I never noticed.",
    categories: [
      { name: "math", label: "Math", before: 480, after: 640 },
      { name: "reading", label: "Reading", before: 310, after: 360 },
      { name: "writing", label: "Writing", before: 260, after: 310 },
    ],
    highlight: "Data Analysis",
  },
  {
    name: "Emily Rodriguez",
    avatar: "/teenage-girl-smiling-headshot.jpg",
    location: "Austin, TX",
    rating: 5,
    scoreBefore: 1100,
    scoreAfter: 1380,
    quote:
      "I was skeptical at first, but the personalized study plan actually worked. Got into my dream school! The reading section tips were game-changing.",
    categories: [
      { name: "math", label: "Math", before: 520, after: 680 },
      { name: "reading", label: "Reading", before: 300, after: 380 },
      { name: "writing", label: "Writing", before: 280, after: 320 },
    ],
    highlight: "Reading Comprehension",
  },
  {
    name: "Michael Thompson",
    avatar: "/young-man-glasses-professional-headshot.jpg",
    location: "Chicago, IL",
    rating: 5,
    scoreBefore: 1200,
    scoreAfter: 1480,
    quote:
      "The 1-on-1 tutor sessions were incredible. They helped me with test anxiety too! My confidence going into test day was completely different.",
    categories: [
      { name: "math", label: "Math", before: 600, after: 760 },
      { name: "reading", label: "Reading", before: 320, after: 380 },
      { name: "writing", label: "Writing", before: 280, after: 340 },
    ],
    highlight: "Advanced Math",
  },
  {
    name: "Olivia Parker",
    avatar: "/teenage-girl-curly-hair-smiling.jpg",
    location: "Denver, CO",
    rating: 5,
    scoreBefore: 1140,
    scoreAfter: 1360,
    quote:
      "I studied for only 6 weeks and improved more than I did in a year of self-study. The AI adapts to exactly where you struggle.",
    categories: [
      { name: "math", label: "Math", before: 540, after: 680 },
      { name: "reading", label: "Reading", before: 320, after: 360 },
      { name: "writing", label: "Writing", before: 280, after: 320 },
    ],
    highlight: "Grammar & Usage",
  },
  {
    name: "David Chen",
    avatar: "/young-man-headshot.png",
    location: "San Francisco, CA",
    rating: 5,
    scoreBefore: 1220,
    scoreAfter: 1510,
    quote:
      "The structured approach made all the difference. I knew exactly what to study each day, and the progress tracking kept me motivated.",
    categories: [
      { name: "math", label: "Math", before: 620, after: 780 },
      { name: "reading", label: "Reading", before: 320, after: 390 },
      { name: "writing", label: "Writing", before: 280, after: 340 },
    ],
    highlight: "Problem Solving",
  },
]

function useScrollLock(ref: React.RefObject<HTMLElement | null>, onLock: () => void, animationComplete: boolean) {
  const hasTriggered = useRef(false)
  const [isLocked, setIsLocked] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current || hasTriggered.current || animationComplete) return

      const rect = ref.current.getBoundingClientRect()
      // Trigger when section reaches top of viewport
      if (rect.top <= 100 && rect.bottom > window.innerHeight) {
        hasTriggered.current = true
        setIsLocked(true)

        // Lock scroll
        document.body.style.overflow = "hidden"

        // Scroll to top of section
        ref.current.scrollIntoView({ behavior: "instant" })

        onLock()
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [ref, onLock, animationComplete])

  // Unlock when animation completes
  useEffect(() => {
    if (animationComplete && isLocked) {
      document.body.style.overflow = ""
      setIsLocked(false)
    }
  }, [animationComplete, isLocked])

  return isLocked
}

function ReviewCard({
  review,
  isVisible,
  index,
}: {
  review: (typeof reviews)[0]
  isVisible: boolean
  index: number
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const activeCategory = selectedCategory ? review.categories.find((c) => c.name === selectedCategory) : null

  return (
    <Card
      className="overflow-hidden border-0 bg-white shadow-xl transition-all duration-700 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: `translateY(${isVisible ? 0 : 80}px) scale(${isVisible ? 1 : 0.85})`,
      }}
    >
      <CardContent className="flex h-full flex-col p-6 md:p-8">
        {/* Header with avatar and score */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <img
              src={review.avatar || "/placeholder.svg"}
              alt={review.name}
              className="h-14 w-14 rounded-full object-cover ring-2 ring-[#bee9e8]"
            />
            <div>
              <p className="font-semibold text-[#1b4965]">{review.name}</p>
              <p className="text-sm text-[#1b4965]/50">{review.location}</p>
            </div>
          </div>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < review.rating ? "fill-[#62b6cb] text-[#62b6cb]" : "text-gray-200"}`}
              />
            ))}
          </div>
        </div>

        {/* Score transformation */}
        <div className="mt-6 flex items-center justify-center gap-4 rounded-2xl bg-gradient-to-r from-[#bee9e8]/30 to-[#cae9ff]/30 p-4">
          <div className="text-center">
            <p className="text-sm text-[#1b4965]/60">Before</p>
            <p className="text-2xl font-bold text-[#1b4965]">{review.scoreBefore}</p>
          </div>
          <TrendingUp className="h-6 w-6 text-[#62b6cb]" />
          <div className="text-center">
            <p className="text-sm text-[#1b4965]/60">After</p>
            <p className="text-2xl font-bold text-[#62b6cb]">{review.scoreAfter}</p>
          </div>
          <div className="rounded-full bg-[#62b6cb] px-3 py-1 text-sm font-semibold text-white">
            +{review.scoreAfter - review.scoreBefore}
          </div>
        </div>

        {/* Category breakdown - interactive */}
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#1b4965]/50">
            Tap to see improvement by category
          </p>
          <div className="flex gap-2">
            {review.categories.map((category) => {
              const Icon = categoryIcons[category.name as keyof typeof categoryIcons]
              const isSelected = selectedCategory === category.name

              return (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(isSelected ? null : category.name)}
                  className={`flex flex-1 flex-col items-center gap-1 rounded-xl p-3 transition-all ${
                    isSelected ? "bg-[#1b4965] text-white" : "bg-[#bee9e8]/20 text-[#1b4965] hover:bg-[#bee9e8]/40"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-medium">{category.label}</span>
                </button>
              )
            })}
          </div>

          {/* Category detail */}
          {activeCategory && (
            <div className="mt-3 animate-in slide-in-from-top-2 rounded-xl bg-[#1b4965] p-4 text-white">
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-80">{activeCategory.label} Score</span>
                <span className="font-semibold text-[#bee9e8]">
                  +{activeCategory.after - activeCategory.before} pts
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <span>{activeCategory.before}</span>
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full bg-[#bee9e8] transition-all duration-500"
                    style={{
                      width: `${((activeCategory.after - activeCategory.before) / 200) * 100}%`,
                    }}
                  />
                </div>
                <span className="font-semibold text-[#bee9e8]">{activeCategory.after}</span>
              </div>
            </div>
          )}
        </div>

        {/* Quote */}
        <p className="mt-4 flex-1 text-[#1b4965]/80 italic">&ldquo;{review.quote}&rdquo;</p>

        {/* Highlight tag */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-[#1b4965]/50">Biggest improvement:</span>
          <span className="rounded-full bg-[#bee9e8]/50 px-3 py-1 text-xs font-medium text-[#1b4965]">
            {review.highlight}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export function ReviewsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<"idle" | "header" | "revealing" | "complete">("idle")
  const [visibleReviews, setVisibleReviews] = useState(0)

  const startAnimation = useCallback(() => {
    if (phase !== "idle") return

    // Phase 1: Header fades in (0.8s)
    setPhase("header")

    setTimeout(() => {
      // Phase 2: Start revealing cards one by one
      setPhase("revealing")

      // Reveal each card with 600ms delay between them
      reviews.forEach((_, i) => {
        setTimeout(() => {
          setVisibleReviews(i + 1)
        }, i * 600)
      })
    }, 1000)

    // Total time: header (1s) + cards (6 * 600ms = 3.6s) + buffer (0.5s)
    setTimeout(
      () => {
        setPhase("complete")
      },
      1000 + reviews.length * 600 + 500,
    )
  }, [phase])

  const isComplete = phase === "complete"
  useScrollLock(sectionRef, startAnimation, isComplete)

  const headerVisible = phase !== "idle"

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen bg-gradient-to-b from-[#0d2938] via-[#bee9e8]/20 to-white py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div
          className="mb-16 text-center transition-all duration-1000"
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: `translateY(${headerVisible ? 0 : 40}px)`,
          }}
        >
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#62b6cb]">Real Results</p>
          <h2 className="mt-4 text-4xl font-bold text-[#1b4965] md:text-5xl">
            <span className="text-balance">Students who transformed their futures</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[#1b4965]/60">
            See exactly how our students improved across every SAT category
          </p>
        </div>

        {/* Reviews grid - cards pop up one at a time */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, index) => (
            <ReviewCard key={review.name} review={review} isVisible={index < visibleReviews} index={index} />
          ))}
        </div>

        {/* Progress indicator - shows during reveal phase */}
        <div
          className="mt-12 flex justify-center gap-2 transition-all duration-500"
          style={{ opacity: phase === "revealing" ? 1 : 0 }}
        >
          {reviews.map((_, index) => (
            <div
              key={index}
              className="h-2 w-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: index < visibleReviews ? "#62b6cb" : "rgba(27, 73, 101, 0.2)",
                transform: `scale(${index < visibleReviews ? 1.2 : 1})`,
              }}
            />
          ))}
        </div>

        {/* Loading text during reveal */}
        {phase === "revealing" && visibleReviews < reviews.length && (
          <div className="mt-8 flex flex-col items-center text-[#1b4965]/50">
            <p className="text-sm">
              Loading student stories... {visibleReviews}/{reviews.length}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
