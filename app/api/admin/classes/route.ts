import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Generate random password (letters, numbers, and @ symbol only)
function generatePassword(length: number = 10): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const special = '@'
  const allChars = uppercase + lowercase + numbers + special
  
  let password = ''
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += '@' // Always include @
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

// GET - Fetch all classes
export async function GET() {
  try {
    console.log('Fetching classes from database...')
    
    // Fetch all columns including year
    const { data: classes, error } = await supabase
      .from('classes')
      .select('id, class_name, section, year, created_at')
      .order('class_name', { ascending: true })

    if (error) {
      console.error('Supabase error fetching classes:', error)
      console.error('Error code:', error.code)
      console.error('Error details:', error.details)
      console.error('Error hint:', error.hint)
      return NextResponse.json(
        { 
          success: false,
          error: error.message || 'Failed to fetch classes',
          code: error.code,
          details: error.details,
          hint: error.hint
        },
        { status: 500 }
      )
    }

    console.log('Classes fetched successfully:', classes?.length || 0)
    if (classes && classes.length > 0) {
      console.log('Sample class:', classes[0])
    }
    return NextResponse.json({ success: true, classes: classes || [] })
  } catch (error: any) {
    console.error('Error fetching classes:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch classes' },
      { status: 500 }
    )
  }
}

// POST - Create new class
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received class data:', body)
    
    const { class_name, section, year } = body

    if (!class_name) {
      return NextResponse.json(
        { error: 'Class name is required' },
        { status: 400 }
      )
    }

    // Prepare data with all fields
    const insertData: any = {
      class_name,
    }
    
    // Add optional fields if they have values
    if (section) insertData.section = section
    if (year) insertData.year = year
    
    console.log('Inserting to database:', insertData)

    const { data: newClass, error } = await supabase
      .from('classes')
      .insert(insertData)
      .select('id, class_name, section, year, created_at')
      .single()

    if (error) {
      console.error('Supabase error:', error)
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Class with this name already exists' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: error.message || 'Database error' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Class created successfully',
      class: newClass,
    })
  } catch (error: any) {
    console.error('Error creating class:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create class' },
      { status: 500 }
    )
  }
}

// PUT - Update class
export async function PUT(request: NextRequest) {
  try {
    const { id, class_name, section, year } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Class ID is required' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (class_name) updateData.class_name = class_name
    if (section !== undefined) updateData.section = section
    if (year !== undefined) updateData.year = year

    const { data: updatedClass, error } = await supabase
      .from('classes')
      .update(updateData)
      .eq('id', id)
      .select('id, class_name, section, year, created_at')
      .single()

    if (error) {
      console.error('Error updating class:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      return NextResponse.json(
        { error: error.message || 'Failed to update class' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Class updated successfully',
      class: updatedClass,
    })
  } catch (error: any) {
    console.error('Error updating class:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update class' },
      { status: 500 }
    )
  }
}

// DELETE - Delete class
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Class ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Class deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting class:', error)
    return NextResponse.json(
      { error: 'Failed to delete class' },
      { status: 500 }
    )
  }
}
