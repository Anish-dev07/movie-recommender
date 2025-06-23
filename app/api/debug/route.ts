import { NextResponse } from "next/server"

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new Response("Not found", { status: 404 });
  }

  try {
    console.log("=== COMPREHENSIVE DEBUG START ===")

    // 1. Check ALL environment variables
    const allEnvVars = {
      // Supabase variables
      SUPABASE_URL: process.env.SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET,

      // Check if any other Supabase-related vars exist
      NODE_ENV: process.env.NODE_ENV,
    }

    const envStatus = Object.entries(allEnvVars).map(([key, value]) => ({
      key,
      exists: !!value,
      length: value ? value.length : 0,
      preview: value ? `${value.substring(0, 10)}...` : "MISSING",
    }))

    console.log("Environment variables status:", envStatus)

    // 2. Try to create Supabase client with different combinations
    const { createClient } = await import("@supabase/supabase-js")

    const attempts = [
      {
        name: "Server-side vars",
        url: process.env.SUPABASE_URL,
        key: process.env.SUPABASE_ANON_KEY,
      },
      {
        name: "Client-side vars",
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
      {
        name: "Mixed vars (URL: server, KEY: client)",
        url: process.env.SUPABASE_URL,
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
      {
        name: "Mixed vars (URL: client, KEY: server)",
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        key: process.env.SUPABASE_ANON_KEY,
      },
    ]

    let workingClient = null
    let workingConfig = null

    for (const attempt of attempts) {
      console.log(`\n--- Testing ${attempt.name} ---`)
      console.log(`URL exists: ${!!attempt.url}`)
      console.log(`Key exists: ${!!attempt.key}`)

      if (attempt.url && attempt.key) {
        try {
          const testClient = createClient(attempt.url, attempt.key)

          // Test the connection
          const { data, error, count } = await testClient
            .from("movie_dataset")
            .select("*", { count: "exact", head: true })
            .limit(1)

          console.log(`${attempt.name} result:`, { count, error: error?.message })

          if (!error && count !== null) {
            workingClient = testClient
            workingConfig = attempt
            console.log(`✅ SUCCESS with ${attempt.name}`)
            break
          } else {
            console.log(`❌ Failed with ${attempt.name}:`, error?.message)
          }
        } catch (err) {
          console.log(`❌ Exception with ${attempt.name}:`, err)
        }
      } else {
        console.log(`❌ Missing credentials for ${attempt.name}`)
      }
    }

    if (!workingClient) {
      return NextResponse.json(
        {
          success: false,
          error: "No working Supabase configuration found",
          envStatus,
          attempts: attempts.map((a) => ({
            name: a.name,
            hasUrl: !!a.url,
            hasKey: !!a.key,
          })),
          troubleshooting: {
            message: "Environment variables are not properly configured",
            steps: [
              "1. Check your Vercel dashboard > Project Settings > Environment Variables",
              "2. Ensure SUPABASE_URL and SUPABASE_ANON_KEY are set",
              "3. Redeploy your application after adding environment variables",
              "4. Make sure you're using the correct Supabase project URL and anon key",
            ],
          },
        },
        { status: 500 },
      )
    }

    // 3. If we have a working client, test the database
    console.log("\n--- Testing Database Access ---")

    // Test different table names
    const tableTests = ["movie_dataset", "movie-dataset", "movies", "Movie_Dataset"]
    let workingTable = null
    const tableResults = []

    for (const tableName of tableTests) {
      try {
        const { data, error, count } = await workingClient
          .from(tableName)
          .select("*", { count: "exact", head: true })
          .limit(1)

        const result = {
          tableName,
          count: count || 0,
          error: error?.message || null,
          success: !error && count !== null,
        }

        tableResults.push(result)
        console.log(`Table ${tableName}:`, result)

        if (result.success && result.count > 0) {
          workingTable = tableName
        }
      } catch (err) {
        tableResults.push({
          tableName,
          count: 0,
          error: String(err),
          success: false,
        })
      }
    }

    if (!workingTable) {
      // Try to list all tables
      try {
        const { data: allTables } = await workingClient
          .from("information_schema.tables")
          .select("table_name")
          .eq("table_schema", "public")

        return NextResponse.json(
          {
            success: false,
            error: "Movie table not found",
            workingConfig: workingConfig.name,
            envStatus,
            tableResults,
            availableTables: allTables?.map((t) => t.table_name) || [],
            troubleshooting: {
              message: "Database connection works but movie table not found",
              steps: [
                "1. Check your Supabase dashboard to verify table name",
                "2. Ensure the table is named 'movie_dataset'",
                "3. Verify the table has data",
                "4. Check table permissions",
              ],
            },
          },
          { status: 404 },
        )
      } catch (err) {
        return NextResponse.json(
          {
            success: false,
            error: "Cannot access database schema",
            workingConfig: workingConfig.name,
            envStatus,
            tableResults,
            schemaError: String(err),
          },
          { status: 500 },
        )
      }
    }

    // 4. Get sample data
    console.log(`\n--- Getting Sample Data from ${workingTable} ---`)

    const { data: sampleMovies, error: sampleError } = await workingClient.from(workingTable).select("*").limit(5)

    const { count: totalCount } = await workingClient.from(workingTable).select("*", { count: "exact", head: true })

    console.log("Sample data retrieved:", {
      sampleCount: sampleMovies?.length || 0,
      totalCount,
      sampleError: sampleError?.message,
    })

    return NextResponse.json({
      success: true,
      message: `Successfully connected using ${workingConfig.name}`,
      workingConfig: workingConfig.name,
      workingTable,
      totalMovies: totalCount || 0,
      sampleMovies: sampleMovies || [],
      availableColumns: sampleMovies?.[0] ? Object.keys(sampleMovies[0]) : [],
      envStatus,
      tableResults,
      troubleshooting:
        totalCount === 0
          ? {
              message: "Table exists but has no data",
              steps: [
                "1. Check your Supabase dashboard to verify data exists",
                "2. Ensure data was properly imported",
                "3. Check if there are any row-level security policies blocking access",
              ],
            }
          : null,
    })
  } catch (error) {
    console.error("Debug API critical error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Critical error in debug API",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}