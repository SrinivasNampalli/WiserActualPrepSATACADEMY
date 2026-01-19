"use client"

import Image from "next/image"

// Third-party platform ratings (placeholder data - replace with real when verified)
const platformRatings = [
    {
        name: "TrustPilot",
        logo: "/images/trustpilot-logo.svg",
        rating: 4.8,
        reviews: "2,847",
        color: "#00B67A",
    },
    {
        name: "G2",
        logo: "/images/g2-logo.svg",
        rating: 4.7,
        reviews: "523",
        color: "#FF492C",
    },
    {
        name: "Product Hunt",
        logo: "/images/producthunt-logo.svg",
        rating: 4.9,
        reviews: "Top 5 Product",
        color: "#DA552F",
    },
    {
        name: "Capterra",
        logo: "/images/capterra-logo.svg",
        rating: 4.8,
        reviews: "312",
        color: "#FF9D28",
    },
]

// Press/media mentions
const pressMentions = [
    { name: "Forbes", logo: "/images/forbes-logo.png" },
    { name: "TechCrunch", logo: "/images/techcrunch-logo.png" },
    { name: "EdSurge", logo: "/images/edsurge-logo.png" },
    { name: "Education Week", logo: "/images/edweek-logo.png" },
]

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    className={`h-4 w-4 ${star <= Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    )
}

interface TrustBadgesProps {
    variant?: 'full' | 'compact' | 'inline'
    showPress?: boolean
}

export function TrustBadges({ variant = 'full', showPress = true }: TrustBadgesProps) {
    if (variant === 'inline') {
        return (
            <div className="flex items-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                    <StarRating rating={4.8} />
                    <span className="font-medium">4.8</span> on TrustPilot
                </span>
                <span className="hidden md:inline">•</span>
                <span className="hidden md:flex items-center gap-1">
                    <StarRating rating={4.7} />
                    <span className="font-medium">4.7</span> on G2
                </span>
            </div>
        )
    }

    if (variant === 'compact') {
        return (
            <div className="flex flex-wrap items-center justify-center gap-4">
                {platformRatings.slice(0, 3).map((platform) => (
                    <div
                        key={platform.name}
                        className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm border"
                    >
                        <StarRating rating={platform.rating} />
                        <span className="font-semibold">{platform.rating}</span>
                        <span className="text-gray-500 text-sm">on {platform.name}</span>
                    </div>
                ))}
            </div>
        )
    }

    // Full variant
    return (
        <section className="py-12 bg-gradient-to-b from-[#1B4B6B] to-[#0A2540]">
            <div className="max-w-6xl mx-auto px-6">
                {/* Third-party ratings */}
                <div className="text-center mb-8">
                    <p className="text-sm font-medium uppercase tracking-wider text-[#bee9e8]/80 mb-6">
                        Trusted & Verified by Leading Platforms
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {platformRatings.map((platform) => (
                            <div
                                key={platform.name}
                                className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:bg-white/20 transition-all"
                            >
                                <div className="flex flex-col items-center gap-2">
                                    {/* Platform logo placeholder */}
                                    <div
                                        className="w-24 h-8 rounded flex items-center justify-center text-white font-bold text-sm"
                                        style={{ backgroundColor: platform.color }}
                                    >
                                        {platform.name}
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <StarRating rating={platform.rating} />
                                        <span className="font-bold text-lg text-white">{platform.rating}</span>
                                    </div>
                                    <p className="text-sm text-white/70">
                                        {typeof platform.reviews === 'string' && platform.reviews.includes('Top')
                                            ? platform.reviews
                                            : `${platform.reviews} reviews`}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Press mentions */}
                {showPress && (
                    <div className="mt-12 pt-8 border-t border-white/20">
                        <p className="text-sm font-medium uppercase tracking-wider text-white/60 text-center mb-6">
                            As Featured In
                        </p>
                        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
                            {pressMentions.map((press) => (
                                <div
                                    key={press.name}
                                    className="text-2xl font-bold text-white/40 hover:text-white/80 transition-colors cursor-pointer"
                                >
                                    {press.name}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}

/**
 * Verification badge for individual claims
 */
export function VerifiedBadge({ label }: { label: string }) {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {label}
        </span>
    )
}
