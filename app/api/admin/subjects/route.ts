import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Fetch all subjects
export async function GET() {
  try {
    const { data: subjects, error } = await supabase
      .from('subjects')
      .select('*')
      .order('subject_name', { ascending: true })

    if (error) throw error

    return NextResponse.json({ success: true, subjects })
  } catch (error) {
    console.error('Error fetching subjects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 }
    )
  }
}

// POST - Create new subject
export async function POST(request: NextRequest) {
  try {
    const { subject_code, subject_name, credits, semester } = await request.json()

    if (!subject_code || !subject_name) {
      return NextResponse.json(
        { error: 'Subject code and name are required' },
        { status: 400 }
      )
    }

    const { data: newSubject, error } = await supabase
      .from('subjects')
      .insert({
        subject_code,
        subject_name,
        credits: credits || null,
        semester: semester || null,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Subject code already exists' },
          { status: 409 }
        )
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Subject created successfully',
      subject: newSubject,
    })
  } catch (error) {
    console.error('Error creating subject:', error)
    return NextResponse.json(
      { error: 'Failed to create subject' },
      { status: 500 }
    )
  }
}

// PUT - Update subject
export async function PUT(request: NextRequest) {
  try {
    const { id, subject_code, subject_name, credits, semester } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Subject ID is required' },
        { status: 400 }
      )
    }

    const { data: updatedSubject, error } = await supabase
      .from('subjects')
      .update({
        subject_code,
        subject_name,
        credits,
        semester,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Subject updated successfully',
      subject: updatedSubject,
    })
  } catch (error) {
    console.error('Error updating subject:', error)
    return NextResponse.json(
      { error: 'Failed to update subject' },
      { status: 500 }
    )
  }
}

// DELETE - Delete subject
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Subject ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Subject deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting subject:', error)
    return NextResponse.json(
      { error: 'Failed to delete subject' },
      { status: 500 }
    )
  }
}
