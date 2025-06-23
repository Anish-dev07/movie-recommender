"use client"

import { SearchBar } from "./search-bar"

interface SearchSectionProps {
  onSearch: (query: string) => void
  onShuffle: () => void
  isSearchLoading: boolean
  isShuffleLoading: boolean
}

export function SearchSection({ onSearch, onShuffle, isSearchLoading, isShuffleLoading }: SearchSectionProps) {
  return (
    <section className="px-4 pb-16">
      <div className="max-w-6xl mx-auto">
        <SearchBar
          onSearch={onSearch}
          onShuffle={onShuffle}
          isSearchLoading={isSearchLoading}
          isShuffleLoading={isShuffleLoading}
        />

        {/* Helper Text */}
        <div className="text-center mt-4">
          <p className="text-gray-400 text-sm">
            Search for specific movies or click the dice to discover popular picks
          </p>
        </div>
      </div>
    </section>
  )
}
