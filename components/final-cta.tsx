"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Check, Zap, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { SATCountdown } from "@/components/sat-countdown"

function useInView(ref: React.RefObject<HTMLElement | null>, options?: IntersectionObserverInit) {
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true)
        observer.disconnect()
      }
    }, options)

    observer.observe(ref.current)

    return () => observer.disconnect()
  }, [ref, options])

  return isInView
}

const benefits = ["7-day free trial", "200+ point guarantee", "Cancel anytime", "AI tutoring 24/7"]

export function FinalCTA() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { threshold: 0.3 })

  return (
    <section ref={ref} className="relative overflow-hidden bg-white py-24 md:py-32">
      <div className="absolute inset-0">
        <Image
          src="/images/herosectionsatdefineyourfuture.jpeg"
          alt="Define Your Future"
          fill
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-white/90" />
      </div>

      {/* Gradient orbs */}
      <div className="absolute left-1/4 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#bee9e8]/30 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] translate-x-1/2 translate-y-1/2 rounded-full bg-[#cae9ff]/30 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <div
          className={`transition-all duration-700 ${isInView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
        >
          <h2 className="text-4xl font-bold text-[#1b4965] md:text-5xl lg:text-6xl">
            <span className="text-balance">Don't wait until it's too late.</span>
          </h2>

          {/* SAT Countdown */}
          <div className="mt-6">
            <SATCountdown variant="card" />
          </div>

          <p className="mx-auto mt-6 max-w-xl text-lg text-[#1b4965]/70 md:text-xl">
            Every day you delay is 3+ points you could have gained. Students who start now score <strong>200+ points higher</strong> on average.
          </p>
        </div>

        {/* CTA Card */}
        <div
          className={`mx-auto mt-12 max-w-md rounded-3xl bg-[#1b4965] p-8 shadow-2xl transition-all duration-700 md:p-10 ${isInView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          style={{ transitionDelay: "200ms" }}
        >
          <p className="text-sm font-medium uppercase tracking-wider text-[#bee9e8]">Start Your Journey</p>
          <p className="mt-4 text-3xl font-bold text-white">Free for 7 days</p>
          <p className="mt-2 text-white/60">No credit card required</p>

          <Link href="/signup">
            <Button className="group mt-8 w-full rounded-xl bg-[#bee9e8] py-7 text-lg font-semibold text-[#1b4965] transition-all hover:bg-white">
              <Zap className="h-5 w-5 mr-2" />
              Start Improving Today
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>

          {/* Benefits list */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-2 text-left text-sm text-white/70">
                <Check className="h-4 w-4 flex-shrink-0 text-[#bee9e8]" />
                {benefit}
              </div>
            ))}
          </div>
        </div>

        <div
          className={`mt-16 transition-all duration-700 ${isInView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          style={{ transitionDelay: "600ms" }}
        >
          <p className="text-sm font-medium uppercase tracking-wider text-[#1b4965]/60 mb-6">
            Students Accepted To Top Universities
          </p>
          <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="relative h-32 rounded-xl overflow-hidden shadow-lg group">
              <Image
                src="/images/topcollege1.jpeg"
                alt="Top University Campus"
                fill
                className="object-cover transition-transform group-hover:scale-110 duration-500"
              />
            </div>
            <div className="relative h-32 rounded-xl overflow-hidden shadow-lg group">
              <Image
                src="/images/topcollege2.jpg"
                alt="Top University Campus"
                fill
                className="object-cover transition-transform group-hover:scale-110 duration-500"
              />
            </div>
            <div className="relative h-32 rounded-xl overflow-hidden shadow-lg group">
              <Image
                src="/images/topcollege3.jpg"
                alt="Top University Campus"
                fill
                className="object-cover transition-transform group-hover:scale-110 duration-500"
              />
            </div>
          </div>
        </div>

        {/* Trust indicators */}
        <p
          className={`mt-12 text-sm text-[#1b4965]/50 transition-all duration-700 ${isInView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          style={{ transitionDelay: "400ms" }}
        >
          Trusted by students from Harvard, Stanford, MIT, and 500+ top universities
        </p>
      </div>
    </section>
  )
}
