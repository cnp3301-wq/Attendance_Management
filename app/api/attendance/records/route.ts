import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    console.log('📋 Fetching attendance records for session:', sessionId)

    // Fetch session details first
    const { data: session, error: sessionError } = await supabase
      .from('attendance_sessions')
      .select(`
        *,
        classes (
          id,
          class_name,
          section,
          year
        ),
        subjects (
          id,
          subject_name,
          subject_code,
          credits,
          semester
        ),
        users!attendance_sessions_teacher_id_fkey (
          id,
          name,
          email,
          department
        )
      `)
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      console.error('❌ Error fetching session:', sessionError)
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Fetch ALL students from the session's class
    const { data: allStudents, error: studentsError } = await supabase
      .from('students')
      .select(`
        id,
        student_id,
        name,
        email,
        phone,
        class_id
      `)
      .eq('class_id', session.class_id)
      .order('student_id', { ascending: true })

    if (studentsError) {
      console.error('❌ Error fetching students:', studentsError)
      return NextResponse.json(
        { error: 'Failed to fetch students' },
        { status: 500 }
      )
    }

    // Fetch attendance records for this session
    const { data: attendanceRecords, error: recordsError } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('session_id', sessionId)

    if (recordsError) {
      console.error('❌ Error fetching attendance records:', recordsError)
      return NextResponse.json(
        { error: 'Failed to fetch attendance records' },
        { status: 500 }
      )
    }

    // Create a map of student_id to attendance record
    const attendanceMap = new Map()
    attendanceRecords?.forEach(record => {
      attendanceMap.set(record.student_id, record)
    })

    // Merge all students with their attendance status
    const records = allStudents.map(student => {
      const attendance = attendanceMap.get(student.id)
      return {
        id: attendance?.id || null,
        session_id: sessionId,
        student_id: student.id,
        students: {
          id: student.id,
          student_id: student.student_id,
          name: student.name,
          email: student.email,
          phone: student.phone,
          class_id: student.class_id,
          classes: session.classes // Include class info
        },
        status: attendance?.status || 'absent',
        marked_at: attendance?.marked_at || null,
        otp_verified: attendance?.otp_verified || false,
        created_at: attendance?.created_at || null
      }
    })

    // Calculate statistics
    const totalRecords = records.length
    const totalPresent = records.filter(r => r.status === 'present').length
    const totalAbsent = records.filter(r => r.status === 'absent').length
    const attendancePercentage = totalRecords > 0 
      ? ((totalPresent / totalRecords) * 100).toFixed(2) 
      : '0.00'

    console.log(`✅ Found ${totalRecords} students in class, ${totalPresent} marked present`)

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        session_code: session.session_code,
        session_date: session.session_date,
        status: session.status,
        expires_at: session.expires_at,
        class_id: session.class_id,
        teacher: session.users,
        class: session.classes,
        subject: session.subjects,
      },
      records: records || [],
      statistics: {
        total_records: totalRecords,
        total_present: totalPresent,
        total_absent: totalAbsent,
        attendance_percentage: attendancePercentage,
      },
    })
  } catch (error) {
    console.error('❌ Error in attendance records API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
