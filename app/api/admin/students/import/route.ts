import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST - Bulk import students from Excel data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { students, class_id } = body

    if (!students || !Array.isArray(students) || students.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No student data provided' },
        { status: 400 }
      )
    }

    if (!class_id) {
      return NextResponse.json(
        { success: false, error: 'Class ID is required' },
        { status: 400 }
      )
    }

    const results: {
      success: any[]
      failed: any[]
      total: number
    } = {
      success: [],
      failed: [],
      total: students.length,
    }

    // Process each student
    for (const student of students) {
      try {
        const {
          student_id,
          name,
          email,
          phone,
          address,
          parent_phone,
          parent_name,
        } = student

        // Validate required fields
        if (!student_id || !name || !email) {
          results.failed.push({
            student,
            error: 'Missing required fields (student_id, name, email)',
          })
          continue
        }

        // Check for duplicates
        const { data: existing } = await supabase
          .from('students')
          .select('student_id, email')
          .or(`student_id.eq.${student_id},email.eq.${email.toLowerCase()}`)
          .single()

        if (existing) {
          results.failed.push({
            student,
            error: 'Student ID or email already exists',
          })
          continue
        }

        // Insert student
        const { data: newStudent, error } = await supabase
          .from('students')
          .insert({
            student_id,
            name,
            email: email.toLowerCase(),
            phone: phone || null,
            address: address || null,
            parent_phone: parent_phone || null,
            parent_name: parent_name || null,
            class_id,
            status: 'active',
          })
          .select()
          .single()

        if (error) {
          results.failed.push({
            student,
            error: error.message,
          })
        } else {
          results.success.push(newStudent)
        }
      } catch (error: any) {
        results.failed.push({
          student,
          error: error.message || 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import completed: ${results.success.length} succeeded, ${results.failed.length} failed`,
      results,
    })
  } catch (error: any) {
    console.error('Error in bulk import:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
