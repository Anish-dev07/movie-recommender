import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // ── 1. Determine the working table ──────────────────────────────
    const tableCandidates = ["movie_dataset", "movie-dataset", "movies"]
    let workingTable: string | null = null
    for (const name of tableCandidates) {
      try {
        const { count, error } = await supabase.from(name).select("*", { count: "exact", head: true }).limit(1)

        if (!error && count !== null) {
          workingTable = name
          break
        }
      } catch {
        /* ignore – table doesn’t exist */
      }
    }

    if (!workingTable) {
      return NextResponse.json({ error: "Movie table not found. Check your Supabase schema." }, { status: 404 })
    }

    // ── 2. Fetch a pool of popular movies ────────────────────────────
    const { data: rawMovies, error } = await supabase
      .from(workingTable)
      .select("*")
      .not("poster_path", "is", null)
      .not("overview", "is", null)
      .gte("vote_average", 7) // highly-rated
      .gte("vote_count", 1000) // well-reviewed
      .order("popularity", { ascending: false })
      .limit(50) // pool to shuffle from

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to fetch popular movies" }, { status: 500 })
    }

    if (!rawMovies || rawMovies.length === 0) {
      return NextResponse.json({ error: "No popular movies found in database" }, { status: 404 })
    }

    // ── 3. Shuffle & return the first 5 unique movies ────────────────
    const shuffled = [...rawMovies].sort(() => Math.random() - 0.5).slice(0, 5)

    return NextResponse.json({
      movies: shuffled,
      totalFound: shuffled.length,
      message: "Popular movies shuffled successfully",
    })
  } catch (err) {
    console.error("Shuffle API error:", err)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    )
  }
}
