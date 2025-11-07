import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET: Fetch teacher's assigned classes and subjects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get("teacher_id")

    if (!teacherId) {
      return NextResponse.json(
        { error: "teacher_id is required" },
        { status: 400 }
      )
    }

    // Fetch all assignments for this teacher
    const { data: assignments, error } = await supabase
      .from("teacher_subjects")
      .select(`
        id,
        teacher_id,
        class_id,
        subject_id,
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
        )
      `)
      .eq("teacher_id", teacherId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Group by class
    const groupedByClass = assignments.reduce((acc: any, assignment: any) => {
      const classId = assignment.class_id
      
      if (!acc[classId]) {
        acc[classId] = {
          class: assignment.classes,
          subjects: []
        }
      }
      
      acc[classId].subjects.push({
        id: assignment.subject_id,
        assignment_id: assignment.id,
        ...assignment.subjects
      })
      
      return acc
    }, {})

    const result = Object.values(groupedByClass)

    return NextResponse.json({
      success: true,
      assignments: result,
      total_classes: result.length,
      total_subjects: assignments.length
    })
  } catch (error: any) {
    console.error("Error fetching teacher assignments:", error)
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    )
  }
}
