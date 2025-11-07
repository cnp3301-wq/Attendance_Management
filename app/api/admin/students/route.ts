import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Fetch all students or single student by ID
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const studentId = url.searchParams.get('id')
    const classId = url.searchParams.get('class_id')

    // Fetch single student
    if (studentId) {
      const { data: student, error } = await supabase
        .from('students')
        .select(`
          *,
          classes:class_id (
            id,
            class_name,
            section,
            year
          )
        `)
        .eq('id', studentId)
        .single()

      if (error) {
        console.error('Error fetching student:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to fetch student' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, student })
    }

    // Fetch all students or by class
    let query = supabase
      .from('students')
      .select(`
        *,
        classes:class_id (
          id,
          class_name,
          section,
          year
        )
      `)
      .order('name', { ascending: true })

    if (classId) {
      query = query.eq('class_id', classId)
    }

    const { data: students, error } = await query

    if (error) {
      console.error('Error fetching students:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch students' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, students })
  } catch (error: any) {
    console.error('Error in GET students:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new student
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      student_id,
      name,
      email,
      phone,
      address,
      parent_phone,
      parent_name,
      class_id,
    } = body

    // Validate required fields
    if (!student_id || !name || !email || !class_id) {
      return NextResponse.json(
        { success: false, error: 'Student ID, name, email, and class are required' },
        { status: 400 }
      )
    }

    // Check for duplicate student_id
    const { data: existingById } = await supabase
      .from('students')
      .select('student_id')
      .eq('student_id', student_id)
      .single()

    if (existingById) {
      return NextResponse.json(
        { success: false, error: 'Student ID already exists' },
        { status: 409 }
      )
    }

    // Check for duplicate email
    const { data: existingByEmail } = await supabase
      .from('students')
      .select('email')
      .eq('email', email.toLowerCase())
      .single()

    if (existingByEmail) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 409 }
      )
    }

    // Insert student
    const { data: newStudent, error } = await supabase
      .from('students')
      .insert({
        student_id,
        name,
        email: email.toLowerCase(),
        phone,
        address,
        parent_phone,
        parent_name,
        class_id,
        status: 'active',
      })
      .select(`
        *,
        classes:class_id (
          id,
          class_name,
          section,
          year
        )
      `)
      .single()

    if (error) {
      console.error('Error creating student:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create student' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Student created successfully',
      student: newStudent,
    })
  } catch (error: any) {
    console.error('Error in POST student:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update student
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      student_id,
      name,
      email,
      phone,
      address,
      parent_phone,
      parent_name,
      class_id,
      status,
    } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (student_id) updateData.student_id = student_id
    if (name) updateData.name = name
    if (email) updateData.email = email.toLowerCase()
    if (phone !== undefined) updateData.phone = phone
    if (address !== undefined) updateData.address = address
    if (parent_phone !== undefined) updateData.parent_phone = parent_phone
    if (parent_name !== undefined) updateData.parent_name = parent_name
    if (class_id) updateData.class_id = class_id
    if (status) updateData.status = status

    const { data: updatedStudent, error } = await supabase
      .from('students')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        classes:class_id (
          id,
          class_name,
          section,
          year
        )
      `)
      .single()

    if (error) {
      console.error('Error updating student:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update student' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Student updated successfully',
      student: updatedStudent,
    })
  } catch (error: any) {
    console.error('Error in PUT student:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete student
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting student:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete student' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Student deleted successfully',
    })
  } catch (error: any) {
    console.error('Error in DELETE student:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
