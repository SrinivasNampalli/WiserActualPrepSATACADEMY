
import { Loader2 } from "lucide-react"

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
            <div className="relative">
                {/* Pulse effect */}
                <div className="absolute inset-0 bg-theme-base/20 rounded-full animate-ping"></div>
                <div className="relative bg-white p-4 rounded-full shadow-xl">
                    <Loader2 className="h-10 w-10 text-theme animate-spin" />
                </div>
            </div>
            <h2 className="mt-4 text-lg font-medium text-gray-600 animate-pulse">
                Loading WiserPrep...
            </h2>
        </div>
    )
}
