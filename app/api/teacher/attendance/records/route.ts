import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET: Fetch attendance records for a session
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json(
        { error: "session_id is required" },
        { status: 400 }
      )
    }

    // Fetch attendance records with student details
    const { data: records, error } = await supabase
      .from("attendance_records")
      .select(`
        *,
        students (
          id,
          student_id,
          name,
          email
        )
      `)
      .eq("session_id", sessionId)
      .order("marked_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      records: records || []
    })
  } catch (error: any) {
    console.error("Error fetching attendance records:", error)
    return NextResponse.json(
      { error: "Failed to fetch attendance records" },
      { status: 500 }
    )
  }
}
