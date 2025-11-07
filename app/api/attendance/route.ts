import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const teacherId = searchParams.get('teacherId')
    const date = searchParams.get('date')
    const sessionId = searchParams.get('sessionId')

    let query = supabase
      .from('attendance_records')
      .select('*, students(name, email)')
      .order('created_at', { ascending: false })

    // Apply filters
    if (studentId) {
      query = query.eq('student_id', studentId)
    }

    if (teacherId) {
      query = query.eq('teacher_id', teacherId)
    }

    if (date) {
      query = query.eq('date', date)
    }

    if (sessionId) {
      query = query.eq('session_id', sessionId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching attendance:', error)
      return NextResponse.json(
        { error: 'Failed to fetch attendance records' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Error in get attendance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
