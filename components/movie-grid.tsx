"use client"

import { MovieCard } from "./movie-card"
import type { Movie } from "@/lib/supabase"

interface MovieGridProps {
  movies: Movie[]
  title: string
  onMovieClick: (movie: Movie) => void
}

export function MovieGrid({ movies, title, onMovieClick }: MovieGridProps) {
  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
          <span className="text-4xl">🎬</span>
        </div>
        <h3 className="text-xl font-semibold mb-2 text-white">No movies found</h3>
        <p className="text-gray-400">Try searching for a different movie title.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} onClick={() => onMovieClick(movie)} />
        ))}
      </div>
    </div>
  )
}
