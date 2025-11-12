"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardNav } from "@/components/dashboard-nav"
import { StatsCard } from "@/components/ui/stats-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, GraduationCap, FileText, Settings, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface User {
  id: string
  email: string
  role: string
  name?: string
}

interface DashboardStats {
  totalStudents: number
  totalTeachers: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
  })
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    // Check authentication immediately
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.replace("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "admin") {
      router.replace("/login")
      return
    }

    // User is authorized
    setIsAuthorized(true)
    setUser(parsedUser)
    fetchDashboardData()
  }, []) // Remove router dependency to prevent re-fetching

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Debug: First fetch all users to see what exists
      const { data: allUsers, error: debugError } = await supabase
        .from("users")
        .select("id, email, name, role, user_type")
        .limit(10)

      console.log("🔍 Debug - Sample users:", allUsers)
      if (debugError) console.error("Debug error:", debugError)

      // Fetch students from the students table (not users table)
      const { data: studentsData, count: studentCount, error: studentsError } = await supabase
        .from("students")
        .select("*", { count: "exact" })

      // Fetch teachers from users table
      const { data: teachersByRole, count: teacherCountByRole } = await supabase
        .from("users")
        .select("*", { count: "exact" })
        .eq("role", "teacher")

      const { data: teachersByUserType, count: teacherCountByUserType } = await supabase
        .from("users")
        .select("*", { count: "exact" })
        .eq("user_type", "teacher")

      const totalStudents = studentCount || 0
      const totalTeachers = (teacherCountByRole || 0) + (teacherCountByUserType || 0)

      console.log("📊 Dashboard Stats:", {
        students: totalStudents,
        teachers: totalTeachers,
        studentsFromStudentsTable: studentCount,
        studentsError,
        teachersByRole: teacherCountByRole,
        teachersByUserType: teacherCountByUserType,
        sampleStudents: (studentsData || []).slice(0, 3),
        sampleTeachers: [...(teachersByRole || []), ...(teachersByUserType || [])].slice(0, 3)
      })

      setStats({
        totalStudents: totalStudents,
        totalTeachers: totalTeachers,
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <DashboardNav userName={user.name} userEmail={user.email} userRole={user.role} />
      
      <main className="container mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2 sm:px-0">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Dashboard</h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Manage your attendance system and view analytics
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              onClick={fetchDashboardData} 
              disabled={loading}
              className="flex-1 sm:flex-none text-sm"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
          <StatsCard
            title="Total Students"
            value={stats.totalStudents}
            icon={GraduationCap}
            description="Registered students"
          />
          <StatsCard
            title="Total Teachers"
            value={stats.totalTeachers}
            icon={Users}
            description="Active teachers"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">System Management</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Manage classes, subjects, and teachers</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => router.push("/admin/manage")} 
                className="w-full text-sm sm:text-base"
              >
                <Users className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Open Management Panel</span>
                <span className="sm:hidden">Management</span>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Manage Users</CardTitle>
              <CardDescription className="text-xs sm:text-sm">View and manage teachers and students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-sm sm:text-base"
                  onClick={() => router.push("/admin/teachers")}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">View All Teachers</span>
                  <span className="sm:hidden">Teachers</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-sm sm:text-base"
                  onClick={() => router.push("/admin/students")}
                >
                  <GraduationCap className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">View All Students</span>
                  <span className="sm:hidden">Students</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Reports</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Generate and download attendance reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-sm sm:text-base"
                  onClick={() => router.push("/admin/reports")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Attendance Reports</span>
                  <span className="sm:hidden">Reports</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-sm sm:text-base"
                  onClick={() => router.push("/admin/analytics")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Analytics Dashboard</span>
                  <span className="sm:hidden">Analytics</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
