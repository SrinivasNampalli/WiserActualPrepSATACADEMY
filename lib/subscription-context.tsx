"use client"

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"

// Feature limits for free users
export const FREE_LIMITS = {
    ai_solver: 5,           // 5 questions per day
    ai_summarizer: 3,       // 3 summaries/chatbot responses per day
    flashcard_sets: 1,      // 1 set total (was 2)
    practice_questions: 100, // 100 questions total
    mock_tests: 1,          // 1 sample test
    study_planner: 0,       // Not accessible for free users
}

export type SubscriptionTier = 'free' | 'premium'

interface SubscriptionContextType {
    tier: SubscriptionTier
    isPremium: boolean
    isLoading: boolean
    usageCounts: Record<string, number>
    checkFeatureAccess: (feature: keyof typeof FREE_LIMITS) => boolean
    getRemainingUsage: (feature: keyof typeof FREE_LIMITS) => number
    incrementUsage: (feature: keyof typeof FREE_LIMITS) => Promise<boolean>
    refreshSubscription: () => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
    const [tier, setTier] = useState<SubscriptionTier>('free')
    const [isLoading, setIsLoading] = useState(true)
    const [usageCounts, setUsageCounts] = useState<Record<string, number>>({})

    const isPremium = tier === 'premium'

    const fetchSubscription = async () => {
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                setTier('free')
                setIsLoading(false)
                return
            }

            // Get subscription tier from profiles
            const { data: profile } = await supabase
                .from('profiles')
                .select('subscription_tier, is_premium')
                .eq('id', user.id)
                .single()

            if (profile?.subscription_tier) {
                setTier(profile.subscription_tier as SubscriptionTier)
            }

            // Get today's usage counts
            const today = new Date().toISOString().split('T')[0]
            const { data: usage } = await supabase
                .from('usage_limits')
                .select('feature, usage_count')
                .eq('user_id', user.id)
                .eq('reset_date', today)

            if (usage) {
                const counts: Record<string, number> = {}
                usage.forEach((u: { feature: string; usage_count: number }) => {
                    counts[u.feature] = u.usage_count
                })
                setUsageCounts(counts)
            }
        } catch (error) {
            console.error('Error fetching subscription:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchSubscription()
    }, [])

    const checkFeatureAccess = (feature: keyof typeof FREE_LIMITS): boolean => {
        if (isPremium) return true
        const limit = FREE_LIMITS[feature]
        const currentUsage = usageCounts[feature] || 0
        return currentUsage < limit
    }

    const getRemainingUsage = (feature: keyof typeof FREE_LIMITS): number => {
        if (isPremium) return Infinity
        const limit = FREE_LIMITS[feature]
        const currentUsage = usageCounts[feature] || 0
        return Math.max(0, limit - currentUsage)
    }

    const incrementUsage = async (feature: keyof typeof FREE_LIMITS): Promise<boolean> => {
        if (isPremium) return true // Premium users have unlimited access

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return false

        const today = new Date().toISOString().split('T')[0]
        const currentUsage = usageCounts[feature] || 0
        const limit = FREE_LIMITS[feature]

        if (currentUsage >= limit) return false

        // Upsert usage count
        const { error } = await supabase
            .from('usage_limits')
            .upsert({
                user_id: user.id,
                feature,
                usage_count: currentUsage + 1,
                reset_date: today,
            }, {
                onConflict: 'user_id,feature,reset_date'
            })

        if (!error) {
            setUsageCounts(prev => ({
                ...prev,
                [feature]: currentUsage + 1
            }))
            return true
        }
        return false
    }

    const refreshSubscription = async () => {
        setIsLoading(true)
        await fetchSubscription()
    }

    return (
        <SubscriptionContext.Provider value={{
            tier,
            isPremium,
            isLoading,
            usageCounts,
            checkFeatureAccess,
            getRemainingUsage,
            incrementUsage,
            refreshSubscription,
        }}>
            {children}
        </SubscriptionContext.Provider>
    )
}

export function useSubscription() {
    const context = useContext(SubscriptionContext)
    if (context === undefined) {
        throw new Error("useSubscription must be used within a SubscriptionProvider")
    }
    return context
}
