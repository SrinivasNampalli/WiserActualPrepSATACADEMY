"use client"

import { Purchases, type CustomerInfo, type Package, type PurchasesError, ErrorCode } from "@revenuecat/purchases-js"

let purchasesInstance: Purchases | null = null

// Initialize RevenueCat with a user ID (or anonymous if not provided)
export function initializeRevenueCat(appUserId?: string): Purchases {
    if (!process.env.NEXT_PUBLIC_REVENUECAT_API_KEY) {
        throw new Error("NEXT_PUBLIC_REVENUECAT_API_KEY is not set")
    }

    if (purchasesInstance) {
        return purchasesInstance
    }

    const userId = appUserId || Purchases.generateRevenueCatAnonymousAppUserId()

    purchasesInstance = Purchases.configure({
        apiKey: process.env.NEXT_PUBLIC_REVENUECAT_API_KEY,
        appUserId: userId,
    })

    return purchasesInstance
}

// Get the shared instance (throws if not initialized)
export function getRevenueCatInstance(): Purchases {
    if (!purchasesInstance) {
        throw new Error("RevenueCat not initialized. Call initializeRevenueCat first.")
    }
    return purchasesInstance
}

// Check if RevenueCat is initialized
export function isRevenueCatInitialized(): boolean {
    return purchasesInstance !== null
}

// Check if user has premium entitlement
export async function checkPremiumStatus(): Promise<boolean> {
    try {
        const instance = getRevenueCatInstance()
        const customerInfo = await instance.getCustomerInfo()
        return Object.keys(customerInfo.entitlements.active).includes("premium")
    } catch (error) {
        console.error("Error checking premium status:", error)
        return false
    }
}

// Export types for use in components
export type { CustomerInfo, Package, PurchasesError }
export { ErrorCode }
