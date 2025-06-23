import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const movieTitle = searchParams.get("title")

  console.log("=== RECOMMENDATIONS API CALLED ===")
  console.log("Search term:", movieTitle)

  if (!movieTitle) {
    return NextResponse.json({ error: "Movie title is required" }, { status: 400 })
  }

  try {
    // First, let's determine the correct table name
    const tableVariations = ["movie_dataset", "movie-dataset", "movies"]
    let workingTable = "movie_dataset" // default

    // Quick test to find working table
    for (const tableName of tableVariations) {
      try {
        const { count, error } = await supabase.from(tableName).select("*", { count: "exact", head: true }).limit(1)

        if (!error && count !== null) {
          workingTable = tableName
          console.log(`Using table: ${tableName}`)
          break
        }
      } catch (err) {
        console.log(`Table ${tableName} not accessible`)
      }
    }

    console.log(`Searching in table: ${workingTable}`)

    // Strategy 1: Exact match (case insensitive)
    console.log("Trying exact match...")
    const { data: exactMatch, error: exactError } = await supabase
      .from(workingTable)
      .select("*")
      .ilike("title", movieTitle)
      .limit(1)

    console.log("Exact match result:", { count: exactMatch?.length, error: exactError?.message })

    let searchedMovie = null

    if (exactMatch && exactMatch.length > 0) {
      searchedMovie = exactMatch[0]
      console.log("✓ Found exact match:", searchedMovie.title)
    } else {
      // Strategy 2: Partial match
      console.log("Trying partial match...")
      const { data: partialMatch, error: partialError } = await supabase
        .from(workingTable)
        .select("*")
        .ilike("title", `%${movieTitle}%`)
        .limit(10)

      console.log("Partial match result:", { count: partialMatch?.length, error: partialError?.message })

      if (partialMatch && partialMatch.length > 0) {
        searchedMovie = partialMatch[0]
        console.log("✓ Found partial match:", searchedMovie.title)
      }
    }

    if (!searchedMovie) {
      // Get some sample movies to suggest
      console.log("No matches found, getting sample movies...")
      const { data: sampleMovies } = await supabase.from(workingTable).select("title").limit(5)

      console.log(
        "Sample movies for suggestion:",
        sampleMovies?.map((m) => m.title),
      )

      return NextResponse.json(
        {
          error: "Movie not found",
          suggestion: sampleMovies?.length
            ? `Try searching for: ${sampleMovies
                .slice(0, 3)
                .map((m) => m.title)
                .join(", ")}`
            : "No movies found in database",
          searchTerm: movieTitle,
          tableUsed: workingTable,
        },
        { status: 404 },
      )
    }

    console.log("Found movie:", {
      title: searchedMovie.title,
      genres: searchedMovie.genres,
      vote_average: searchedMovie.vote_average,
      keywords: searchedMovie.keywords,
    })

    // Get movie attributes for matching
    const movieGenres = searchedMovie.genres ? searchedMovie.genres.split(",").map((g: string) => g.trim()) : []
    const movieKeywords = searchedMovie.keywords ? searchedMovie.keywords.split(",").map((k: string) => k.trim()) : []
    const movieRating = searchedMovie.vote_average || 0
    const moviePopularity = searchedMovie.popularity || 0

    console.log("Movie attributes:", {
      genres: movieGenres,
      keywords: movieKeywords.slice(0, 5), // Log first 5 keywords
      rating: movieRating,
      popularity: moviePopularity,
    })

    // Get a larger pool of potential recommendations
    const { data: candidateMovies, error: candidatesError } = await supabase
      .from(workingTable)
      .select("*")
      .neq("id", searchedMovie.id) // Exclude the searched movie
      .not("genres", "is", null)
      .not("vote_average", "is", null)
      .not("poster_path", "is", null) // Ensure movies have posters
      .not("overview", "is", null) // Ensure movies have descriptions
      .gte("vote_average", 5.0) // Minimum quality threshold
      .gte("vote_count", 100) // Minimum vote count for reliability
      .order("popularity", { ascending: false })
      .limit(200) // Get a large pool to choose from

    console.log("Candidate movies query result:", {
      count: candidateMovies?.length,
      error: candidatesError?.message,
    })

    if (candidatesError) {
      console.error("Candidates error:", candidatesError)
      return NextResponse.json(
        {
          error: "Failed to fetch candidate movies",
          details: candidatesError.message,
        },
        { status: 500 },
      )
    }

    if (!candidateMovies || candidateMovies.length === 0) {
      return NextResponse.json(
        {
          error: "No candidate movies found",
          movie: searchedMovie.title,
        },
        { status: 404 },
      )
    }

    // Advanced scoring algorithm
    const scoredMovies = candidateMovies
      .map((movie) => {
        let score = 0
        const candidateGenres = movie.genres ? movie.genres.split(",").map((g: string) => g.trim()) : []
        const candidateKeywords = movie.keywords ? movie.keywords.split(",").map((k: string) => k.trim()) : []

        // 1. Genre matching (40% of score)
        const genreMatches = candidateGenres.filter((genre) =>
          movieGenres.some(
            (searchGenre) =>
              genre.toLowerCase().includes(searchGenre.toLowerCase()) ||
              searchGenre.toLowerCase().includes(genre.toLowerCase()),
          ),
        ).length

        const genreScore =
          genreMatches > 0 ? (genreMatches / Math.max(movieGenres.length, candidateGenres.length)) * 40 : 0

        // 2. Keywords matching (30% of score)
        const keywordMatches = candidateKeywords.filter((keyword) =>
          movieKeywords.some(
            (searchKeyword) =>
              keyword.toLowerCase().includes(searchKeyword.toLowerCase()) ||
              searchKeyword.toLowerCase().includes(keyword.toLowerCase()),
          ),
        ).length

        const keywordScore =
          keywordMatches > 0 ? (keywordMatches / Math.max(movieKeywords.length, candidateKeywords.length)) * 30 : 0

        // 3. Rating similarity (20% of score)
        const ratingDifference = Math.abs(movieRating - (movie.vote_average || 0))
        const ratingScore = Math.max(0, (3 - ratingDifference) / 3) * 20 // Max difference of 3 points

        // 4. Popularity factor (10% of score)
        const popularityScore = Math.min(movie.popularity / 100, 1) * 10 // Normalize popularity

        score = genreScore + keywordScore + ratingScore + popularityScore

        return {
          ...movie,
          recommendationScore: score,
          genreMatches,
          keywordMatches,
          ratingDifference,
        }
      })
      .filter((movie) => movie.recommendationScore > 10) // Only include movies with decent scores
      .sort((a, b) => b.recommendationScore - a.recommendationScore) // Sort by score descending

    console.log(
      "Top scored movies:",
      scoredMovies.slice(0, 5).map((m) => ({
        title: m.title,
        score: m.recommendationScore.toFixed(2),
        genreMatches: m.genreMatches,
        keywordMatches: m.keywordMatches,
      })),
    )

    // Remove duplicates by title (case insensitive)
    const uniqueMovies = []
    const seenTitles = new Set()

    for (const movie of scoredMovies) {
      const normalizedTitle = movie.title.toLowerCase().trim()
      if (!seenTitles.has(normalizedTitle)) {
        seenTitles.add(normalizedTitle)
        uniqueMovies.push(movie)
      }
    }

    // Get top 15 unique recommendations
    const finalRecommendations = uniqueMovies.slice(0, 15)

    console.log("Final recommendations count:", finalRecommendations.length)
    console.log(
      "Final recommendations:",
      finalRecommendations.map((m) => m.title),
    )

    return NextResponse.json({
      searchedMovie,
      recommendations: finalRecommendations,
      totalFound: finalRecommendations.length,
      debug: {
        candidatesFound: candidateMovies.length,
        scoredMovies: scoredMovies.length,
        uniqueMovies: uniqueMovies.length,
        searchCriteria: {
          genres: movieGenres,
          keywordsCount: movieKeywords.length,
          rating: movieRating,
          popularity: moviePopularity,
        },
      },
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
