import { createClient } from "@supabase/supabase-js"

// Debug environment variables
console.log("Environment check:", {
  hasSupabaseUrl: !!process.env.SUPABASE_URL,
  hasNextPublicSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasSupabaseAnonKey: !!process.env.SUPABASE_ANON_KEY,
  hasNextPublicSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
})

// Try different environment variable combinations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials:", {
    url: supabaseUrl ? "✓" : "✗",
    key: supabaseKey ? "✓" : "✗",
  })
}

export const supabase = createClient(supabaseUrl!, supabaseKey!)

export type Movie = {
  id: number
  title: string
  genres: string
  overview: string
  poster_path: string
  release_date: string
  vote_average: number
  vote_count: number
  popularity: number
  backdrop_path: string
  original_title: string
  tagline: string
  runtime: string
  adult: boolean
}
