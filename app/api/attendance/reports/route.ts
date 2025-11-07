import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { teacherId, classId, subjectId, startDate, endDate } = await request.json()

    if (!teacherId) {
      return NextResponse.json(
        { error: 'Teacher ID is required' },
        { status: 400 }
      )
    }

    console.log('📊 Generating report for:', { teacherId, classId, subjectId, startDate, endDate })

    // Build query for sessions
    let query = supabase
      .from('attendance_sessions')
      .select(`
        *,
        classes!inner(id, class_name, section, year),
        subjects!inner(id, subject_name, subject_code, credits, semester)
      `)
      .eq('teacher_id', teacherId)
      .in('status', ['completed', 'expired']) // Only finished sessions

    // Apply filters
    if (classId) {
      query = query.eq('class_id', classId)
    }
    if (subjectId) {
      query = query.eq('subject_id', subjectId)
    }
    if (startDate) {
      query = query.gte('session_date', startDate)
    }
    if (endDate) {
      query = query.lte('session_date', endDate)
    }

    query = query.order('session_date', { ascending: false })

    const { data: sessions, error: sessionsError } = await query

    if (sessionsError) {
      console.error('❌ Error fetching sessions:', sessionsError)
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500 }
      )
    }

    if (!sessions || sessions.length === 0) {
      return NextResponse.json({
        success: true,
        sessions: [],
        summary: {
          total_sessions: 0,
          total_students: 0,
          total_present: 0,
          total_absent: 0,
          average_attendance: '0.00'
        },
        records: []
      })
    }

    console.log(`✅ Found ${sessions.length} sessions`)

    // For each session, get all students from the class and their attendance
    const detailedSessions = await Promise.all(
      sessions.map(async (session) => {
        // Fetch all students from the class
        const { data: allStudents, error: studentsError } = await supabase
          .from('students')
          .select('id, student_id, name, email, class_id')
          .eq('class_id', session.class_id)
          .order('student_id', { ascending: true })

        if (studentsError) {
          console.error('❌ Error fetching students:', studentsError)
          return null
        }

        // Fetch attendance records for this session
        const { data: attendanceRecords } = await supabase
          .from('attendance_records')
          .select('*')
          .eq('session_id', session.id)

        // Create attendance map
        const attendanceMap = new Map()
        attendanceRecords?.forEach(record => {
          attendanceMap.set(record.student_id, record)
        })

        // Merge students with attendance
        const records = allStudents.map(student => {
          const attendance = attendanceMap.get(student.id)
          return {
            student_id: student.id,
            students: {
              id: student.id,
              student_id: student.student_id,
              name: student.name,
              email: student.email,
              class_id: student.class_id
            },
            status: attendance?.status || 'absent',
            marked_at: attendance?.marked_at || null
          }
        })

        const totalStudents = records.length
        const presentCount = records.filter(r => r.status === 'present').length
        const absentCount = records.filter(r => r.status === 'absent').length
        const percentage = totalStudents > 0 
          ? ((presentCount / totalStudents) * 100).toFixed(2)
          : '0.00'

        return {
          session_id: session.id,
          session_code: session.session_code,
          session_date: session.session_date,
          session_time: session.session_time,
          class: session.classes,
          subject: session.subjects,
          status: session.status,
          statistics: {
            total_students: totalStudents,
            present: presentCount,
            absent: absentCount,
            attendance_percentage: percentage
          },
          records
        }
      })
    )

    // Filter out null results
    const validSessions = detailedSessions.filter(s => s !== null)

    // Calculate overall summary
    const summary = {
      total_sessions: validSessions.length,
      total_students: validSessions.reduce((sum, s) => sum + s.statistics.total_students, 0),
      total_present: validSessions.reduce((sum, s) => sum + s.statistics.present, 0),
      total_absent: validSessions.reduce((sum, s) => sum + s.statistics.absent, 0),
      average_attendance: '0.00'
    }

    if (summary.total_students > 0) {
      summary.average_attendance = ((summary.total_present / summary.total_students) * 100).toFixed(2)
    }

    console.log('✅ Report generated:', summary)

    return NextResponse.json({
      success: true,
      sessions: validSessions,
      summary,
      filters: {
        classId,
        subjectId,
        startDate,
        endDate
      }
    })
  } catch (error) {
    console.error('❌ Error in reports API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
