"use client"

import Image from "next/image"
import { Star, Play } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Movie } from "@/lib/supabase"

interface MovieCardProps {
  movie: Movie
  onClick: () => void
}

export function MovieCard({ movie, onClick }: MovieCardProps) {
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "/placeholder.svg?height=600&width=400"

  const genres = movie.genres ? movie.genres.split(",").map((g) => g.trim()) : []

  return (
    <Card
      className="group overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer bg-gray-900 border-gray-800 hover:border-gray-600"
      onClick={onClick}
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <Image
          src={posterUrl || "/placeholder.svg"}
          alt={movie.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-8 h-8 text-white fill-white" />
          </div>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-white text-sm font-medium">{movie.vote_average.toFixed(1)}</span>
        </div>
      </div>

      <CardContent className="p-4 bg-gray-900">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors duration-300 text-white">
          {movie.title}
        </h3>
        <div className="flex flex-wrap gap-1 mb-3">
          {genres.slice(0, 2).map((genre, index) => (
            <Badge key={index} variant="secondary" className="text-xs bg-gray-800 text-gray-300 hover:bg-gray-700">
              {genre}
            </Badge>
          ))}
        </div>
        <p className="text-sm text-gray-400 line-clamp-3 mb-2">{movie.overview}</p>
        <p className="text-xs text-gray-500">{new Date(movie.release_date).getFullYear()}</p>
      </CardContent>
    </Card>
  )
}
