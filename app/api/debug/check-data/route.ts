import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Check classes
    const { data: classes, error: classError } = await supabase
      .from('classes')
      .select('*')
    
    // Check subjects
    const { data: subjects, error: subjectError } = await supabase
      .from('subjects')
      .select('*')
    
    // Check teachers
    const { data: teachers, error: teacherError } = await supabase
      .from('users')
      .select('*')
      .eq('user_type', 'teacher')
    
    // Check assignments
    const { data: assignments, error: assignError } = await supabase
      .from('teacher_subjects')
      .select('*')

    return NextResponse.json({
      success: true,
      data: {
        classes: {
          count: classes?.length || 0,
          data: classes,
          error: classError
        },
        subjects: {
          count: subjects?.length || 0,
          data: subjects,
          error: subjectError
        },
        teachers: {
          count: teachers?.length || 0,
          data: teachers,
          error: teacherError
        },
        assignments: {
          count: assignments?.length || 0,
          data: assignments,
          error: assignError
        }
      }
    })
  } catch (error: any) {
    console.error('Error checking data:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check data' },
      { status: 500 }
    )
  }
}
