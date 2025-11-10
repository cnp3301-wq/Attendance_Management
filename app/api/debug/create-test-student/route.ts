import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    // Create a test student
    const { data: student, error } = await supabase
      .from('users')
      .insert({
        email: 'teststudent@kprcas.ac.in',
        name: 'Test Student',
        role: 'student'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating test student:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Test student created',
      student 
    })
  } catch (error) {
    console.error('Create test student error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
