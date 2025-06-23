"use client"

import { useState } from "react"
import { Shuffle, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ShuffleButtonProps {
  onShuffle: () => void
  isLoading: boolean
}

export function ShuffleButton({ onShuffle, isLoading }: ShuffleButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleClick = () => {
    setIsAnimating(true)
    onShuffle()
    setTimeout(() => setIsAnimating(false), 1000)
  }

  return (
    <div className="relative">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-600/20 via-purple-600/20 to-blue-600/20 rounded-2xl blur-xl animate-pulse" />

      <Button
        onClick={handleClick}
        disabled={isLoading}
        className={`relative h-14 px-8 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 ${
          isAnimating ? "animate-pulse scale-105" : ""
        }`}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <div className="flex items-center gap-2">
            <Shuffle className={`w-5 h-5 transition-transform duration-500 ${isAnimating ? "rotate-180" : ""}`} />
            <span>Shuffle</span>
            <Sparkles className="w-4 h-4" />
          </div>
        )}
      </Button>
    </div>
  )
}
