"use client"

import { useRouter } from "next/navigation"
import { useSubscription, FREE_LIMITS } from "@/lib/subscription-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock, Sparkles, ArrowRight } from "lucide-react"

interface PaywallProps {
    feature: keyof typeof FREE_LIMITS
    children: React.ReactNode
    title?: string
    description?: string
}

/**
 * Paywall component that wraps premium features.
 * Shows content for premium users, upgrade prompt for free users who've hit limits.
 */
export function Paywall({ feature, children, title, description }: PaywallProps) {
    const router = useRouter()
    const { isPremium, checkFeatureAccess, getRemainingUsage, isLoading } = useSubscription()

    if (isLoading) {
        return (
            <div className="animate-pulse bg-gray-100 rounded-lg h-32 flex items-center justify-center">
                <span className="text-gray-400">Loading...</span>
            </div>
        )
    }

    // Premium users or users with remaining usage get full access
    if (isPremium || checkFeatureAccess(feature)) {
        return <>{children}</>
    }

    // Free users who've hit their limit see the paywall
    return (
        <Card className="border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100">
            <CardHeader className="text-center pb-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-theme-base/10 flex items-center justify-center mb-3">
                    <Lock className="h-6 w-6 text-theme" />
                </div>
                <CardTitle className="text-lg">
                    {title || "Premium Feature"}
                </CardTitle>
                <CardDescription>
                    {description || `You've reached your daily limit for this feature.`}
                </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
                <div className="text-sm text-gray-600">
                    <p>Free plan limit: <strong>{FREE_LIMITS[feature]}</strong> per day</p>
                    <p className="text-red-500">Remaining: <strong>0</strong></p>
                </div>

                <Button
                    onClick={() => router.push("/pricing")}
                    className="bg-theme-base hover:bg-theme-dark text-white"
                >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Upgrade to Premium
                    <ArrowRight className="h-4 w-4 ml-2" />
                </Button>

                <p className="text-xs text-gray-500">
                    Only $15/month • Unlimited access • Cancel anytime
                </p>
            </CardContent>
        </Card>
    )
}

/**
 * Premium badge to show on features that require premium
 */
export function PremiumBadge({ showOnPremium = false }: { showOnPremium?: boolean }) {
    const { isPremium } = useSubscription()

    if (isPremium && !showOnPremium) return null

    return (
        <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            Premium
        </Badge>
    )
}

/**
 * Usage indicator showing remaining uses for a feature
 */
export function UsageIndicator({ feature }: { feature: keyof typeof FREE_LIMITS }) {
    const { isPremium, getRemainingUsage } = useSubscription()

    if (isPremium) {
        return (
            <Badge variant="outline" className="text-green-600 border-green-300">
                Unlimited
            </Badge>
        )
    }

    const remaining = getRemainingUsage(feature)
    const limit = FREE_LIMITS[feature]

    return (
        <Badge
            variant="outline"
            className={remaining === 0 ? "text-red-600 border-red-300" : "text-gray-600 border-gray-300"}
        >
            {remaining}/{limit} remaining
        </Badge>
    )
}
