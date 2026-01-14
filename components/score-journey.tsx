"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import { RotateCcw, FileText, Brain } from "lucide-react"

const methods = [
  {
    id: "repetition",
    icon: RotateCcw,
    title: "Spaced Repetition",
    subtitle: "The Science of Memory",
    description:
      "Our algorithm tracks every concept you learn and resurfaces it at the perfect moment—just before you'd forget. This isn't random practice; it's precision memory engineering.",
    stat: "94%",
    statLabel: "Long-term retention rate",
    color: "#62b6cb",
  },
  {
    id: "mock-tests",
    icon: FileText,
    title: "Real Mock Tests",
    subtitle: "Authentic SAT Experience",
    description:
      "Practice with questions indistinguishable from the real SAT. Timed sections, adaptive difficulty, and the exact format you'll face on test day. No surprises.",
    stat: "2,400+",
    statLabel: "Official-style questions",
    color: "#bee9e8",
  },
  {
    id: "ai-evaluator",
    icon: Brain,
    title: "AI Evaluator",
    subtitle: "Instant Expert Feedback",
    description:
      "Every answer is analyzed in real-time. Understand not just what you got wrong, but why—with personalized explanations that adapt to your learning style.",
    stat: "< 1s",
    statLabel: "Feedback response time",
    color: "#cae9ff",
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

type MethodPhase =
  | "idle"
  | "arrow-start"
  | "arrow-to-loop1"
  | "loop1-pause"
  | "arrow-to-loop2"
  | "loop2-pause"
  | "arrow-to-loop3"
  | "loop3-pause"
  | "arrow-exit"
  | "complete"

function AnimatedArrow({ phase }: { phase: MethodPhase }) {
  // Calculate arrow position based on phase
  const getArrowTransform = () => {
    switch (phase) {
      case "idle":
      case "arrow-start":
        return { x: -50, y: 150, rotation: 0 }
      case "arrow-to-loop1":
        return { x: 200, y: 150, rotation: 0 }
      case "loop1-pause":
        return { x: 250, y: 110, rotation: -90 }
      case "arrow-to-loop2":
        return { x: 450, y: 150, rotation: 0 }
      case "loop2-pause":
        return { x: 500, y: 110, rotation: -90 }
      case "arrow-to-loop3":
        return { x: 700, y: 150, rotation: 0 }
      case "loop3-pause":
        return { x: 750, y: 110, rotation: -90 }
      case "arrow-exit":
      case "complete":
        return { x: 1050, y: 150, rotation: 0 }
      default:
        return { x: -50, y: 150, rotation: 0 }
    }
  }

  const { x, y, rotation } = getArrowTransform()
  const activeLoop = phase === "loop1-pause" ? 0 : phase === "loop2-pause" ? 1 : phase === "loop3-pause" ? 2 : -1

  return (
    <svg viewBox="0 0 1000 300" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1b4965" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#62b6cb" stopOpacity="0.3" />
        </linearGradient>
        <filter id="arrowGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="loopGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background path - horizontal line with three loops */}
      <path
        d="M 0,150 L 210,150 
           A 40,40 0 1,1 290,150 
           L 460,150 
           A 40,40 0 1,1 540,150 
           L 710,150 
           A 40,40 0 1,1 790,150 
           L 1000,150"
        fill="none"
        stroke="url(#pathGrad)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Loop circles - highlight when active */}
      {[
        { cx: 250, cy: 150, method: 0 },
        { cx: 500, cy: 150, method: 1 },
        { cx: 750, cy: 150, method: 2 },
      ].map((loop, i) => {
        const isActive = activeLoop === i
        const isPast = activeLoop > i || phase === "arrow-exit" || phase === "complete"

        return (
          <g key={i}>
            {/* Outer glow ring */}
            <circle
              cx={loop.cx}
              cy={loop.cy}
              r={isActive ? 60 : 45}
              fill="none"
              stroke={methods[i].color}
              strokeWidth={isActive ? 3 : 1}
              strokeOpacity={isActive ? 1 : isPast ? 0.5 : 0.2}
              filter={isActive ? "url(#loopGlow)" : undefined}
              className="transition-all duration-500"
            />

            {/* Inner filled circle */}
            <circle
              cx={loop.cx}
              cy={loop.cy}
              r={40}
              fill={isActive ? `${methods[i].color}40` : isPast ? `${methods[i].color}20` : "transparent"}
              stroke={methods[i].color}
              strokeWidth={isActive ? 2 : 1}
              strokeOpacity={isActive ? 0.8 : isPast ? 0.5 : 0.15}
              className="transition-all duration-500"
            />

            {/* Step number */}
            <text
              x={loop.cx}
              y={loop.cy + 6}
              textAnchor="middle"
              fill={isActive || isPast ? "white" : "rgba(255,255,255,0.3)"}
              fontSize="20"
              fontWeight="bold"
              className="transition-all duration-500"
            >
              {i + 1}
            </text>
          </g>
        )
      })}

      {/* The traveling arrow */}
      <g
        className="transition-all duration-1000 ease-out"
        style={{
          transform: `translate(${x}px, ${y}px) rotate(${rotation}deg)`,
          transformOrigin: "0 0",
        }}
        filter="url(#arrowGlow)"
      >
        {/* Arrow head pointing right */}
        <polygon points="-15,-12 15,0 -15,12 -8,0" fill="#62b6cb" />
        {/* Glow trail */}
        <ellipse cx="-25" cy="0" rx="20" ry="8" fill="#62b6cb" fillOpacity="0.3" />
      </g>
    </svg>
  )
}

function MethodCard({
  method,
  isActive,
  isPast,
}: {
  method: (typeof methods)[0]
  isActive: boolean
  isPast: boolean
}) {
  const Icon = method.icon

  return (
    <div
      className={`
        relative overflow-hidden rounded-3xl border backdrop-blur-sm
        transition-all duration-700 ease-out
        ${
          isActive
            ? "border-white/30 bg-white/15 scale-105 shadow-2xl"
            : isPast
              ? "border-white/15 bg-white/8 scale-100 opacity-80"
              : "border-white/5 bg-white/5 scale-95 opacity-30"
        }
      `}
    >
      {/* Active glow effect */}
      {isActive && (
        <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40" style={{ backgroundColor: method.color }} />
      )}

      <div className="relative p-6 md:p-8">
        {/* Icon and title */}
        <div className="flex items-start gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-all duration-500"
            style={{
              backgroundColor: isActive || isPast ? method.color : "rgba(255,255,255,0.1)",
            }}
          >
            <Icon
              className="h-7 w-7 transition-colors duration-500"
              style={{ color: isActive || isPast ? "#1b4965" : "rgba(255,255,255,0.4)" }}
            />
          </div>

          <div className="flex-1">
            <p
              className="text-sm font-medium uppercase tracking-wider transition-colors duration-500"
              style={{ color: isActive ? method.color : isPast ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.3)" }}
            >
              {method.subtitle}
            </p>
            <h3 className="mt-1 text-xl font-bold text-white md:text-2xl">{method.title}</h3>
          </div>
        </div>

        {/* Description - only show when active */}
        <div
          className="overflow-hidden transition-all duration-700"
          style={{
            maxHeight: isActive ? "200px" : "0px",
            opacity: isActive ? 1 : 0,
            marginTop: isActive ? "24px" : "0px",
          }}
        >
          <p className="text-base leading-relaxed text-white/70">{method.description}</p>

          {/* Stat */}
          <div className="mt-6 flex items-baseline gap-2 border-t border-white/10 pt-6">
            <span className="text-4xl font-bold" style={{ color: method.color }}>
              {method.stat}
            </span>
            <span className="text-sm text-white/50">{method.statLabel}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ScoreJourney() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<MethodPhase>("idle")

  const startAnimation = useCallback(() => {
    if (phase !== "idle") return

    // Phase 1: Arrow enters (0.5s)
    setPhase("arrow-start")

    setTimeout(() => {
      // Arrow travels to first loop (1s)
      setPhase("arrow-to-loop1")
    }, 500)

    setTimeout(() => {
      // Pause at loop 1 - Repetition (2.5s pause)
      setPhase("loop1-pause")
    }, 1500)

    setTimeout(() => {
      // Arrow travels to second loop (1s)
      setPhase("arrow-to-loop2")
    }, 4000)

    setTimeout(() => {
      // Pause at loop 2 - Mock Tests (2.5s pause)
      setPhase("loop2-pause")
    }, 5000)

    setTimeout(() => {
      // Arrow travels to third loop (1s)
      setPhase("arrow-to-loop3")
    }, 7500)

    setTimeout(() => {
      // Pause at loop 3 - AI Evaluator (2.5s pause)
      setPhase("loop3-pause")
    }, 8500)

    setTimeout(() => {
      // Arrow exits (0.5s)
      setPhase("arrow-exit")
    }, 11000)

    setTimeout(() => {
      // Complete - unlock scroll
      setPhase("complete")
    }, 12000)
  }, [phase])

  const isComplete = phase === "complete"
  useScrollLock(sectionRef, startAnimation, isComplete)

  // Determine active loop based on phase
  const activeLoop = phase === "loop1-pause" ? 0 : phase === "loop2-pause" ? 1 : phase === "loop3-pause" ? 2 : -1

  const headerVisible = phase !== "idle"

  return (
    <section ref={sectionRef} className="relative min-h-screen overflow-hidden bg-[#1b4965]">
      {/* Background gradient transition from stats section */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0d2938] via-[#1b4965] to-[#1b4965]" />

      {/* Ambient orbs */}
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-[#62b6cb]/10 blur-3xl" />
      <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full bg-[#bee9e8]/10 blur-3xl" />

      {/* Content */}
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-6xl">
          {/* Header */}
          <div
            className="mb-8 text-center transition-all duration-1000"
            style={{
              opacity: headerVisible ? 1 : 0,
              transform: `translateY(${headerVisible ? 0 : 40}px)`,
            }}
          >
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-[#62b6cb]">The Method</p>
            <h2 className="mt-4 text-balance text-4xl font-bold text-white md:text-5xl lg:text-6xl">
              How we get you there
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/60">
              Follow the arrow through our three powerful systems
            </p>
          </div>

          {/* Arrow path visualization */}
          <div className="relative mb-8 h-[180px] w-full md:h-[220px]">
            <AnimatedArrow phase={phase} />
          </div>

          {/* Method cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            {methods.map((method, index) => (
              <MethodCard
                key={method.id}
                method={method}
                isActive={activeLoop === index}
                isPast={activeLoop > index || phase === "arrow-exit" || phase === "complete"}
              />
            ))}
          </div>

          {/* Progress indicator */}
          {phase !== "idle" && phase !== "complete" && (
            <div className="mt-10 flex flex-col items-center text-white/40">
              <p className="text-sm">
                {activeLoop === -1
                  ? "The journey begins..."
                  : activeLoop === 0
                    ? "Step 1: Building Strong Foundations"
                    : activeLoop === 1
                      ? "Step 2: Real Practice Makes Perfect"
                      : "Step 3: AI-Powered Improvement"}
              </p>
              <div className="mt-4 flex gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-2 w-8 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor:
                        activeLoop >= i || phase === "arrow-exit" || phase === "complete"
                          ? methods[Math.min(i, 2)].color
                          : "rgba(255,255,255,0.2)",
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
