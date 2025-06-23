"use client"
import Image from "next/image"
import { X, Star, Calendar, Clock, Globe, Users, Award } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Movie } from "@/lib/supabase"

interface MovieDetailModalProps {
  movie: Movie | null
  isOpen: boolean
  onClose: () => void
}

export function MovieDetailModal({ movie, isOpen, onClose }: MovieDetailModalProps) {
  if (!movie) return null

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "/placeholder.svg?height=750&width=500"

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : "/placeholder.svg?height=720&width=1280"

  const genres = movie.genres ? movie.genres.split(",").map((g) => g.trim()) : []
  const productionCompanies = movie.production_companies
    ? movie.production_companies.split(",").map((c) => c.trim())
    : []
  const spokenLanguages = movie.spoken_languages ? movie.spoken_languages.split(",").map((l) => l.trim()) : []

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-gray-900 border-gray-800 text-white overflow-hidden">
        <div className="relative">
          {/* Backdrop Image */}
          <div className="relative h-64 md:h-80 overflow-hidden">
            <Image src={backdropUrl || "/placeholder.svg"} alt={movie.title} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="max-h-[60vh]">
            <div className="p-6 space-y-6">
              {/* Header Section */}
              <div className="flex flex-col md:flex-row gap-6">
                {/* Poster */}
                <div className="flex-shrink-0 mx-auto md:mx-0">
                  <div className="w-48 h-72 relative rounded-lg overflow-hidden shadow-2xl">
                    <Image src={posterUrl || "/placeholder.svg"} alt={movie.title} fill className="object-cover" />
                  </div>
                </div>

                {/* Movie Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">{movie.title}</h1>
                    {movie.original_title !== movie.title && (
                      <p className="text-gray-400 text-lg">Original: {movie.original_title}</p>
                    )}
                    {movie.tagline && <p className="text-gray-300 italic text-lg mt-2">"{movie.tagline}"</p>}
                  </div>

                  {/* Rating and Basic Info */}
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1 rounded-full">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{movie.vote_average.toFixed(1)}</span>
                      <span className="text-gray-400">({movie.vote_count.toLocaleString()} votes)</span>
                    </div>

                    {movie.release_date && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(movie.release_date).getFullYear()}</span>
                      </div>
                    )}

                    {movie.runtime && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <Clock className="w-4 h-4" />
                        <span>{movie.runtime}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-gray-300">
                      <Users className="w-4 h-4" />
                      <span>{movie.popularity.toFixed(0)} popularity</span>
                    </div>
                  </div>

                  {/* Genres */}
                  {genres.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {genres.map((genre, index) => (
                        <Badge key={index} variant="secondary" className="bg-gray-800 text-gray-200 hover:bg-gray-700">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Overview */}
                  {movie.overview && (
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Overview</h3>
                      <p className="text-gray-300 leading-relaxed">{movie.overview}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-800">
                {/* Production Info */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Production Details
                  </h3>

                  {productionCompanies.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-300 mb-2">Production Companies</h4>
                      <div className="flex flex-wrap gap-2">
                        {productionCompanies.slice(0, 5).map((company, index) => (
                          <Badge key={index} variant="outline" className="border-gray-700 text-gray-300">
                            {company}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {movie.budget && (
                    <div>
                      <h4 className="font-medium text-gray-300 mb-1">Budget</h4>
                      <p className="text-gray-400">{movie.budget}</p>
                    </div>
                  )}

                  {movie.revenue && (
                    <div>
                      <h4 className="font-medium text-gray-300 mb-1">Revenue</h4>
                      <p className="text-gray-400">{movie.revenue}</p>
                    </div>
                  )}

                  {movie.status && (
                    <div>
                      <h4 className="font-medium text-gray-300 mb-1">Status</h4>
                      <Badge variant="outline" className="border-green-600 text-green-400">
                        {movie.status}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Additional Information
                  </h3>

                  {spokenLanguages.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-300 mb-2">Languages</h4>
                      <div className="flex flex-wrap gap-2">
                        {spokenLanguages.slice(0, 5).map((language, index) => (
                          <Badge key={index} variant="outline" className="border-gray-700 text-gray-300">
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {movie.original_language && (
                    <div>
                      <h4 className="font-medium text-gray-300 mb-1">Original Language</h4>
                      <p className="text-gray-400">{movie.original_language}</p>
                    </div>
                  )}

                  {movie.homepage && (
                    <div>
                      <h4 className="font-medium text-gray-300 mb-1">Official Website</h4>
                      <a
                        href={movie.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}

                  {movie.imdb_id && (
                    <div>
                      <h4 className="font-medium text-gray-300 mb-1">IMDb</h4>
                      <a
                        href={`https://www.imdb.com/title/${movie.imdb_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        View on IMDb
                      </a>
                    </div>
                  )}

                  {movie.adult !== undefined && (
                    <div>
                      <h4 className="font-medium text-gray-300 mb-1">Content Rating</h4>
                      <Badge variant={movie.adult ? "destructive" : "secondary"}>
                        {movie.adult ? "Adult Content" : "General Audience"}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
