"use client"

import { useState } from "react"
import { Film, Sparkles, Star, Zap, TrendingUp } from "lucide-react"
import { SearchSection } from "@/components/search-section"
import { MovieGrid } from "@/components/movie-grid"
import { MovieDetailModal } from "@/components/movie-detail-modal"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Movie } from "@/lib/supabase"

interface SearchResult {
  searchedMovie: Movie
  recommendations: Movie[]
  totalFound: number
}

interface ShuffleResult {
  movies: Movie[]
  totalFound: number
  message: string
}

export default function HomePage() {
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null)
  const [shuffleResult, setShuffleResult] = useState<ShuffleResult | null>(null)
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const [isShuffleLoading, setIsShuffleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentMode, setCurrentMode] = useState<"search" | "shuffle" | null>(null)

  const handleSearch = async (query: string) => {
    setIsSearchLoading(true)
    setError(null)
    setShuffleResult(null)
    setCurrentMode("search")

    try {
      const response = await fetch(`/api/recommendations?title=${encodeURIComponent(query)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch recommendations")
      }

      setSearchResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setSearchResult(null)
    } finally {
      setIsSearchLoading(false)
    }
  }

  const handleShuffle = async () => {
    setIsShuffleLoading(true)
    setError(null)
    setSearchResult(null)
    setCurrentMode("shuffle")

    try {
      const response = await fetch("/api/shuffle")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch popular movies")
      }

      setShuffleResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setShuffleResult(null)
    } finally {
      setIsShuffleLoading(false)
    }
  }

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedMovie(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="relative max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="p-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse">
              <Film className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
              MovieFinder
            </h1>
          </div>

          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Discover your next favorite movie with AI-powered recommendations or explore popular picks
          </p>

          <div className="flex items-center justify-center gap-3 text-gray-400 flex-wrap">
            <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-full backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-full backdrop-blur-sm">
              <Star className="w-4 h-4 text-blue-400" />
              <span>Smart Matching</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-full backdrop-blur-sm">
              <TrendingUp className="w-4 h-4 text-pink-400" />
              <span>Popular Picks</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-full backdrop-blur-sm">
              <Zap className="w-4 h-4 text-purple-400" />
              <span>Instant Results</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Shuffle Section */}
      <SearchSection
        onSearch={handleSearch}
        onShuffle={handleShuffle}
        isSearchLoading={isSearchLoading}
        isShuffleLoading={isShuffleLoading}
      />

      {/* Results Section */}
      <section className="px-4 pb-20">
        <div className="max-w-6xl mx-auto space-y-12">
          {error && (
            <Card className="border-red-800 bg-red-900/20 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-red-400 font-medium mb-2">Error</div>
                <p className="text-gray-300">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Search Results */}
          {searchResult && currentMode === "search" && (
            <>
              {/* Searched Movie */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-bold text-white">You searched for:</h2>
                  <Badge variant="outline" className="text-lg px-3 py-1 border-yellow-500 text-yellow-400">
                    {searchResult.searchedMovie.vote_average.toFixed(1)} ⭐
                  </Badge>
                </div>

                <Card
                  className="overflow-hidden bg-gray-900/50 border-gray-700 backdrop-blur-sm cursor-pointer hover:bg-gray-800/50 transition-all duration-300"
                  onClick={() => handleMovieClick(searchResult.searchedMovie)}
                >
                  <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 p-6">
                    <div className="mx-auto md:mx-0">
                      <div className="w-full max-w-[300px] relative group">
                        <div className="aspect-[2/3] relative rounded-lg overflow-hidden">
                          <img
                            src={
                              searchResult.searchedMovie.poster_path
                                ? `https://image.tmdb.org/t/p/w500${searchResult.searchedMovie.poster_path}`
                                : "/placeholder.svg?height=450&width=300"
                            }
                            alt={searchResult.searchedMovie.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-4xl font-bold text-white group-hover:text-blue-400 transition-colors">
                        {searchResult.searchedMovie.title}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {searchResult.searchedMovie.genres?.split(",").map((genre, index) => (
                          <Badge key={index} variant="secondary" className="bg-gray-800 text-gray-300">
                            {genre.trim()}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-gray-300 leading-relaxed text-lg">{searchResult.searchedMovie.overview}</p>
                      <div className="flex items-center gap-6 text-gray-400">
                        <span className="flex items-center gap-2">
                          <span>Released: {new Date(searchResult.searchedMovie.release_date).getFullYear()}</span>
                        </span>
                        <span>•</span>
                        <span>Rating: {searchResult.searchedMovie.vote_average.toFixed(1)}/10</span>
                        <span>•</span>
                        <span>Click to view details</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Recommendations */}
              <MovieGrid
                movies={searchResult.recommendations}
                title={`Recommended Movies (${searchResult.totalFound} found)`}
                onMovieClick={handleMovieClick}
              />
            </>
          )}

          {/* Shuffle Results */}
          {shuffleResult && currentMode === "shuffle" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold text-white">🎲 Popular Movies Shuffle</h2>
                <Badge variant="outline" className="text-lg px-3 py-1 border-pink-500 text-pink-400">
                  {shuffleResult.totalFound} movies
                </Badge>
              </div>

              <div className="text-center mb-8">
                <p className="text-gray-300 text-lg">
                  Here are {shuffleResult.totalFound} highly-rated popular movies picked just for you!
                </p>
                <p className="text-gray-400 text-sm mt-2">Click the dice again for a different selection</p>
              </div>

              <MovieGrid movies={shuffleResult.movies} title="🔥 Trending & Popular" onMovieClick={handleMovieClick} />
            </div>
          )}

          {/* Empty State */}
          {!searchResult && !shuffleResult && !isSearchLoading && !isShuffleLoading && !error && (
            <div className="text-center py-20">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 flex items-center justify-center backdrop-blur-sm">
                <Film className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-3xl font-semibold mb-4 text-white">Ready to discover amazing movies?</h3>
              <p className="text-gray-400 text-lg max-w-md mx-auto mb-6">
                Search for specific movies or click the dice to explore popular picks based on ratings and popularity.
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                <span>🔍 Search for recommendations</span>
                <span>•</span>
                <span>🎲 Click dice for popular movies</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Movie Detail Modal */}
      <MovieDetailModal movie={selectedMovie} isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  )
}
