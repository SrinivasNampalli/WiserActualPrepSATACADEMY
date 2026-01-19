import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeContextProvider } from "@/lib/theme-context"
import { MascotProvider } from "@/lib/mascot-context"
import { SubscriptionProvider } from "@/lib/subscription-context"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ScoreBoost SAT Prep - Guaranteed 200+ Point Increase",
  description:
    "AI-powered SAT prep that adapts to you. Join 50,000+ students who boosted their scores with personalized learning.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased ${inter.className}`}>
        <ThemeContextProvider>
          <SubscriptionProvider>
            <MascotProvider>
              {children}
            </MascotProvider>
          </SubscriptionProvider>
        </ThemeContextProvider>
        <Analytics />
      </body>
    </html>
  )
}
