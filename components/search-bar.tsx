"use client"

import type React from "react"
import { useState } from "react"
import { Search, Loader2, Sparkles, Dice6 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SearchBarProps {
  onSearch: (query: string) => void
  onShuffle: () => void
  isSearchLoading: boolean
  isShuffleLoading: boolean
}

export function SearchBar({ onSearch, onShuffle, isSearchLoading, isShuffleLoading }: SearchBarProps) {
  const [query, setQuery] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  return (
    <div className="relative">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-2xl blur-xl animate-pulse" />

      <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
        <div className="relative flex gap-3 p-2 bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for a movie (e.g., Inception, Avatar, The Dark Knight...)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 h-14 text-lg bg-transparent border-0 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50"
              disabled={isSearchLoading || isShuffleLoading}
            />
          </div>

          {/* Dice Button */}
          <Button
            type="button"
            onClick={onShuffle}
            disabled={isShuffleLoading || isSearchLoading}
            className="h-14 w-14 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex-shrink-0"
          >
            {isShuffleLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Dice6 className="w-6 h-6 transition-transform duration-300 hover:rotate-12" />
            )}
          </Button>

          {/* Search Button */}
          <Button
            type="submit"
            disabled={isSearchLoading || !query.trim() || isShuffleLoading}
            className="h-14 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isSearchLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span>Discover</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
