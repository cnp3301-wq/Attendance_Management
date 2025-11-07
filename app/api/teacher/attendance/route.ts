import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Generate unique session code
function generateSessionCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// GET: Fetch attendance sessions for a teacher
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get("teacher_id")
    const sessionId = searchParams.get("session_id")
    const status = searchParams.get("status") // active, expired, completed

    if (!teacherId && !sessionId) {
      return NextResponse.json(
        { error: "teacher_id or session_id is required" },
        { status: 400 }
      )
    }

    // Fetch specific session by ID
    if (sessionId) {
      const { data: session, error } = await supabase
        .from("attendance_sessions")
        .select(`
          *,
          classes (id, class_name, section, year),
          subjects (id, subject_name, subject_code),
          users (id, name, email)
        `)
        .eq("id", sessionId)
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      if (!session) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 })
      }

      // Get attendance count for this session
      const { count } = await supabase
        .from("attendance_records")
        .select("*", { count: "exact", head: true })
        .eq("session_id", sessionId)
        .eq("status", "present")

      return NextResponse.json({
        success: true,
        session: { ...session, present_count: count || 0 }
      })
    }

    // Fetch all sessions for a teacher
    let query = supabase
      .from("attendance_sessions")
      .select(`
        *,
        classes (id, class_name, section, year),
        subjects (id, subject_name, subject_code)
      `)
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false })

    if (status) {
      query = query.eq("status", status)
    }

    const { data: sessions, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get attendance count for each session
    const sessionsWithCounts = await Promise.all(
      sessions.map(async (session) => {
        const { count } = await supabase
          .from("attendance_records")
          .select("*", { count: "exact", head: true })
          .eq("session_id", session.id)
          .eq("status", "present")

        return { ...session, present_count: count || 0 }
      })
    )

    return NextResponse.json({
      success: true,
      sessions: sessionsWithCounts
    })
  } catch (error: any) {
    console.error("Error fetching sessions:", error)
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    )
  }
}

// POST: Create a new attendance session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { teacher_id, class_id, subject_id, duration_minutes = 5 } = body

    // Validation
    if (!teacher_id || !class_id || !subject_id) {
      return NextResponse.json(
        { error: "teacher_id, class_id, and subject_id are required" },
        { status: 400 }
      )
    }

    // Verify teacher is assigned to this class-subject combination
    const { data: assignment, error: assignError } = await supabase
      .from("teacher_subjects")
      .select("*")
      .eq("teacher_id", teacher_id)
      .eq("class_id", class_id)
      .eq("subject_id", subject_id)
      .single()

    if (assignError || !assignment) {
      return NextResponse.json(
        { error: "Teacher is not assigned to this class-subject combination" },
        { status: 403 }
      )
    }

    // Generate unique session code
    let sessionCode = generateSessionCode()
    let isUnique = false
    let attempts = 0

    while (!isUnique && attempts < 10) {
      const { data: existing } = await supabase
        .from("attendance_sessions")
        .select("session_code")
        .eq("session_code", sessionCode)
        .single()

      if (!existing) {
        isUnique = true
      } else {
        sessionCode = generateSessionCode()
        attempts++
      }
    }

    if (!isUnique) {
      return NextResponse.json(
        { error: "Failed to generate unique session code" },
        { status: 500 }
      )
    }

    // Calculate expiry time
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + duration_minutes)

    // Create attendance session
    const { data: session, error } = await supabase
      .from("attendance_sessions")
      .insert({
        teacher_id,
        class_id,
        subject_id,
        session_code: sessionCode,
        expires_at: expiresAt.toISOString(),
        status: "active"
      })
      .select(`
        *,
        classes (id, class_name, section, year),
        subjects (id, subject_name, subject_code),
        users (id, name, email)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Attendance session created successfully",
      session
    })
  } catch (error: any) {
    console.error("Error creating session:", error)
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    )
  }
}

// PUT: Update session status (expire, complete)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { session_id, status } = body

    if (!session_id || !status) {
      return NextResponse.json(
        { error: "session_id and status are required" },
        { status: 400 }
      )
    }

    if (!["active", "expired", "completed"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be: active, expired, or completed" },
        { status: 400 }
      )
    }

    const { data: session, error } = await supabase
      .from("attendance_sessions")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", session_id)
      .select(`
        *,
        classes (id, class_name, section, year),
        subjects (id, subject_name, subject_code)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Session status updated successfully",
      session
    })
  } catch (error: any) {
    console.error("Error updating session:", error)
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    )
  }
}

// DELETE: Delete an attendance session
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("id")

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      )
    }

    // Delete session (will cascade to attendance_records and attendance_otps)
    const { error } = await supabase
      .from("attendance_sessions")
      .delete()
      .eq("id", sessionId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Session deleted successfully"
    })
  } catch (error: any) {
    console.error("Error deleting session:", error)
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    )
  }
}
