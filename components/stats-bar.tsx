"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from "recharts"

const studentProgressData = [
  { week: "Start", score: 1080, math: 520, reading: 560 },
  { week: "Week 2", score: 1120, math: 550, reading: 570 },
  { week: "Week 4", score: 1180, math: 590, reading: 590 },
  { week: "Week 6", score: 1240, math: 630, reading: 610 },
  { week: "Week 8", score: 1310, math: 670, reading: 640 },
  { week: "Week 10", score: 1360, math: 700, reading: 660 },
  { week: "Week 12", score: 1420, math: 730, reading: 690 },
]

const milestones = [
  { score: 1200, label: "College Ready", color: "#62b6cb" },
  { score: 1350, label: "Competitive", color: "#bee9e8" },
  { score: 1400, label: "Elite", color: "#cae9ff" },
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

function AnimatedCounter({
  target,
  suffix = "",
  prefix = "",
  duration = 2000,
  isVisible,
}: {
  target: number
  suffix?: string
  prefix?: string
  duration?: number
  isVisible: boolean
}) {
  const [count, setCount] = useState(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!isVisible || hasAnimated.current) return
    hasAnimated.current = true

    const steps = 60
    const increment = target / steps
    let current = 0
    let frame = 0

    const timer = setInterval(() => {
      frame++
      current = Math.min(target, current + increment)
      const eased = target * (1 - Math.pow(1 - frame / steps, 3))
      setCount(Math.floor(eased))

      if (frame >= steps) {
        setCount(target)
        clearInterval(timer)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [isVisible, target, duration])

  return (
    <span className="tabular-nums">
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; dataKey: string }>
  label?: string
}) {
  if (!active || !payload) return null

  return (
    <div className="rounded-xl border border-white/20 bg-[#1b4965]/95 px-4 py-3 shadow-2xl backdrop-blur-sm">
      <p className="mb-2 text-sm font-medium text-[#bee9e8]">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: entry.dataKey === "score" ? "#62b6cb" : entry.dataKey === "math" ? "#bee9e8" : "#cae9ff",
            }}
          />
          <span className="text-xs capitalize text-white/70">{entry.dataKey}:</span>
          <span className="font-semibold text-white">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

type AnimationPhase =
  | "idle"
  | "arrow-rising"
  | "arrow-text"
  | "arrow-shrinking"
  | "chart-reveal"
  | "stats-reveal"
  | "complete"

export function StatsBar() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<AnimationPhase>("idle")
  const [activeView, setActiveView] = useState<"total" | "math" | "reading">("total")
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null)
  const [visibleDataPoints, setVisibleDataPoints] = useState(0)

  // Start animation sequence when section is reached
  const startAnimation = useCallback(() => {
    if (phase !== "idle") return

    // Phase 1: Arrow rises up (1.5s)
    setPhase("arrow-rising")

    setTimeout(() => {
      // Phase 2: Text appears (1.5s)
      setPhase("arrow-text")
    }, 1500)

    setTimeout(() => {
      // Phase 3: Arrow shrinks (1s)
      setPhase("arrow-shrinking")
    }, 3500)

    setTimeout(() => {
      // Phase 4: Chart reveals (3s for data points)
      setPhase("chart-reveal")

      // Reveal data points one by one
      studentProgressData.forEach((_, i) => {
        setTimeout(() => {
          setVisibleDataPoints(i + 1)
        }, i * 400)
      })
    }, 4500)

    setTimeout(() => {
      // Phase 5: Stats reveal (1s)
      setPhase("stats-reveal")
    }, 7500)

    setTimeout(() => {
      // Phase 6: Complete - unlock scroll
      setPhase("complete")
    }, 9000)
  }, [phase])

  const isComplete = phase === "complete"
  useScrollLock(sectionRef, startAnimation, isComplete)

  const getDataKey = useCallback(() => {
    switch (activeView) {
      case "math":
        return "math"
      case "reading":
        return "reading"
      default:
        return "score"
    }
  }, [activeView])

  const getMaxScore = useCallback(() => {
    switch (activeView) {
      case "math":
      case "reading":
        return 800
      default:
        return 1600
    }
  }, [activeView])

  const getGainText = useCallback(() => {
    switch (activeView) {
      case "math":
        return "+210 Math"
      case "reading":
        return "+130 Reading"
      default:
        return "+340 Total"
    }
  }, [activeView])

  const revealedData = studentProgressData.slice(0, visibleDataPoints)

  // Phase-based visibility
  const showArrow = phase === "arrow-rising" || phase === "arrow-text" || phase === "arrow-shrinking"
  const showArrowText = phase === "arrow-text" || phase === "arrow-shrinking"
  const arrowShrinking = phase === "arrow-shrinking"
  const showChart = phase === "chart-reveal" || phase === "stats-reveal" || phase === "complete"
  const showStats = phase === "stats-reveal" || phase === "complete"

  return (
    <section ref={sectionRef} className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#1b4965] via-[#1b4965] to-[#0d2938]" />

      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          opacity: showChart ? 0.5 : 0.2,
          transition: "opacity 1s ease",
        }}
      />

      {/* Floating orbs */}
      <div
        className="pointer-events-none absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-[#62b6cb]/10 blur-3xl"
        style={{
          opacity: 0.3 + (showChart ? 0.3 : 0),
          transition: "opacity 1s ease",
        }}
      />

      {/* Content container */}
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
        <div className="relative w-full max-w-6xl">
          <div
            className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000"
            style={{
              opacity: showArrow ? 1 : 0,
              pointerEvents: showArrow ? "auto" : "none",
              zIndex: showArrow ? 10 : 0,
            }}
          >
            {/* Giant animated arrow */}
            <div
              className="transition-all duration-1000"
              style={{
                transform: `translateY(${phase === "arrow-rising" ? 0 : 0}px) scale(${arrowShrinking ? 0.3 : 1})`,
                opacity: arrowShrinking ? 0 : 1,
              }}
            >
              <svg
                width="140"
                height="220"
                viewBox="0 0 140 220"
                className="drop-shadow-2xl"
                style={{
                  filter: `drop-shadow(0 0 30px rgba(98, 182, 203, 0.6))`,
                }}
              >
                <defs>
                  <linearGradient id="arrowBodyGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#1b4965" />
                    <stop offset="40%" stopColor="#62b6cb" />
                    <stop offset="100%" stopColor="#bee9e8" />
                  </linearGradient>
                  <filter id="arrowGlowFilter">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Pulse rings */}
                {[0, 1, 2].map((i) => (
                  <circle
                    key={i}
                    cx="70"
                    cy="40"
                    r={25 + i * 20}
                    fill="none"
                    stroke="#62b6cb"
                    strokeWidth="2"
                    opacity={0.4 - i * 0.12}
                    className="animate-pulse"
                    style={{
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}

                {/* Arrow body */}
                <rect x="55" y="70" width="30" height="150" fill="url(#arrowBodyGrad)" rx="6" />

                {/* Arrow head */}
                <polygon
                  points="70,0 115,75 90,75 90,70 50,70 50,75 25,75"
                  fill="#bee9e8"
                  filter="url(#arrowGlowFilter)"
                />
              </svg>
            </div>

            {/* Text reveal */}
            <div
              className="mt-10 text-center transition-all duration-700"
              style={{
                opacity: showArrowText ? 1 : 0,
                transform: `translateY(${showArrowText ? 0 : 20}px)`,
              }}
            >
              <p className="text-base font-medium uppercase tracking-[0.5em] text-[#62b6cb]">Your Score</p>
              <h2 className="mt-3 text-6xl font-bold text-white md:text-8xl">Going Up</h2>
              <p className="mt-6 text-xl text-white/50">Watch the transformation</p>
            </div>
          </div>

          {/* Chart and stats - fade in after arrow */}
          <div
            className="transition-all duration-1000"
            style={{
              opacity: showChart ? 1 : 0,
              transform: `translateY(${showChart ? 0 : 60}px)`,
            }}
          >
            {/* Header */}
            <div className="mb-10 text-center">
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-[#62b6cb]">The 12-Week Journey</p>
              <h2 className="text-balance text-4xl font-bold text-white md:text-5xl lg:text-6xl">
                Watch your score transform
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
                Every data point represents real student progress
              </p>
            </div>

            {/* Interactive Chart */}
            <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm md:p-10">
              {/* Chart header */}
              <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm text-white/50">Average Student Progress</p>
                  <p className="text-3xl font-bold text-white">
                    {getGainText()}
                    <span className="ml-2 text-base font-normal text-[#62b6cb]">in 12 weeks</span>
                  </p>
                </div>

                <div className="flex gap-2 rounded-full bg-white/5 p-1">
                  {(["total", "math", "reading"] as const).map((view) => (
                    <button
                      key={view}
                      onClick={() => setActiveView(view)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                        activeView === view ? "bg-[#62b6cb] text-[#1b4965]" : "text-white/60 hover:text-white"
                      }`}
                    >
                      {view.charAt(0).toUpperCase() + view.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[280px] w-full md:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={revealedData}
                    margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                    onMouseMove={(e) => {
                      if (e?.activeTooltipIndex !== undefined) {
                        setHoveredWeek(e.activeTooltipIndex)
                      }
                    }}
                    onMouseLeave={() => setHoveredWeek(null)}
                  >
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#62b6cb" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#62b6cb" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <XAxis
                      dataKey="week"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      domain={[activeView === "total" ? 1000 : 400, getMaxScore()]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                      dx={-10}
                    />

                    {activeView === "total" &&
                      milestones.map((milestone) => (
                        <ReferenceLine
                          key={milestone.score}
                          y={milestone.score}
                          stroke={milestone.color}
                          strokeDasharray="5 5"
                          strokeOpacity={0.3}
                          label={{
                            value: milestone.label,
                            position: "right",
                            fill: milestone.color,
                            fontSize: 11,
                            opacity: 0.7,
                          }}
                        />
                      ))}

                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 2 }} />

                    <Area
                      type="monotone"
                      dataKey={getDataKey()}
                      stroke="#62b6cb"
                      strokeWidth={3}
                      fill="url(#scoreGradient)"
                      dot={(props) => {
                        const { cx, cy, index } = props
                        const isHovered = hoveredWeek === index
                        const isEndpoint = index === 0 || index === revealedData.length - 1

                        return (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isHovered ? 8 : isEndpoint ? 6 : 4}
                            fill={isHovered || isEndpoint ? "#62b6cb" : "transparent"}
                            stroke="#62b6cb"
                            strokeWidth={2}
                            style={{ transition: "all 0.2s ease" }}
                          />
                        )
                      }}
                      animationDuration={500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Score comparison */}
              <div
                className="mt-6 flex items-center justify-center gap-8 border-t border-white/10 pt-6 transition-opacity duration-500"
                style={{
                  opacity: visibleDataPoints >= studentProgressData.length ? 1 : 0.3,
                }}
              >
                <div className="text-center">
                  <p className="text-sm text-white/50">Starting Score</p>
                  <p className="text-2xl font-bold text-white/70">
                    {activeView === "total" ? "1,080" : activeView === "math" ? "520" : "560"}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#62b6cb]/20">
                  <svg className="h-5 w-5 text-[#62b6cb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm text-white/50">Final Score</p>
                  <p className="text-2xl font-bold text-[#62b6cb]">
                    {activeView === "total" ? "1,420" : activeView === "math" ? "730" : "690"}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div
              className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 transition-all duration-800"
              style={{
                opacity: showStats ? 1 : 0,
                transform: `translateY(${showStats ? 0 : 30}px)`,
              }}
            >
              {[
                { value: 50000, suffix: "+", label: "Students Helped", sublabel: "And counting" },
                { value: 200, suffix: "+", label: "Avg Point Gain", sublabel: "Guaranteed" },
                { value: 95, suffix: "%", label: "Hit Goal Score", sublabel: "Within 3 months" },
                { value: 4.9, suffix: "/5", label: "Student Rating", sublabel: "10,000+ reviews", isDecimal: true },
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur-sm transition-all duration-500 hover:border-[#62b6cb]/30 hover:bg-white/10"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <p className="text-2xl font-bold text-white md:text-3xl">
                    {stat.isDecimal ? (
                      <span>
                        {showStats ? stat.value : 0}
                        {stat.suffix}
                      </span>
                    ) : (
                      <AnimatedCounter target={stat.value} suffix={stat.suffix} isVisible={showStats} />
                    )}
                  </p>
                  <p className="mt-2 text-sm font-medium text-[#bee9e8]">{stat.label}</p>
                  <p className="mt-1 text-xs text-white/40">{stat.sublabel}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
