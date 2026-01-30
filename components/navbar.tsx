"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`relative w-full transition-all duration-300 ${isScrolled ? "bg-white/95 backdrop-blur-md shadow-md" : "bg-white/95 backdrop-blur-md"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className={`text-2xl font-bold transition-colors ${isScrolled ? "text-[#1B4B6B]" : "text-[#1B4B6B]"}`}>
              WiserPrep
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/#method"
              className={`text-sm font-medium transition-colors hover:text-theme ${isScrolled ? "text-[#1B4B6B]" : "text-[#1B4B6B]"
                }`}
            >
              How It Works
            </Link>
            <Link
              href="/study-planner"
              className={`text-sm font-medium transition-colors hover:text-theme ${isScrolled ? "text-[#1B4B6B]" : "text-[#1B4B6B]"
                }`}
            >
              Study Planner
            </Link>
            <Link
              href="/#reviews"
              className={`text-sm font-medium transition-colors hover:text-theme ${isScrolled ? "text-[#1B4B6B]" : "text-[#1B4B6B]"
                }`}
            >
              Reviews
            </Link>
            <Link
              href="/pricing"
              className={`text-sm font-medium transition-colors hover:text-theme ${isScrolled ? "text-[#1B4B6B]" : "text-[#1B4B6B]"
                }`}
            >
              Pricing
            </Link>
            <Link href="/login">
              <Button
                variant="ghost"
                className={`${isScrolled ? "text-[#1B4B6B] hover:text-theme" : "text-[#1B4B6B] hover:text-theme"}`}
              >
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-theme-base hover:bg-theme-dark text-white">Start Free Trial</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle menu">
            {isMobileMenuOpen ? (
              <X className={`h-6 w-6 ${isScrolled ? "text-[#1B4B6B]" : "text-[#1B4B6B]"}`} />
            ) : (
              <Menu className={`h-6 w-6 ${isScrolled ? "text-[#1B4B6B]" : "text-[#1B4B6B]"}`} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <div className="px-4 pt-2 pb-4 space-y-3">
            <Link
              href="/#method"
              className="block py-2 text-[#1B4B6B] hover:text-theme font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="/study-planner"
              className="block py-2 text-[#1B4B6B] hover:text-theme font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Study Planner
            </Link>
            <Link
              href="/#reviews"
              className="block py-2 text-[#1B4B6B] hover:text-theme font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Reviews
            </Link>
            <Link
              href="/pricing"
              className="block py-2 text-[#1B4B6B] hover:text-theme font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full bg-transparent">
                Login
              </Button>
            </Link>
            <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full bg-theme-base hover:bg-theme-dark text-white">Start Free Trial</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
