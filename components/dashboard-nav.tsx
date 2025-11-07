"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"

interface DashboardNavProps {
  userName?: string
  userEmail?: string
  userRole?: string
}

export function DashboardNav({ userName, userEmail, userRole }: DashboardNavProps) {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    router.push("/login")
  }

  return (
    <nav className="border-b bg-background">
      <div className="flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
            <User className="size-4" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Attendance Management</h1>
            {userRole && (
              <p className="text-xs text-muted-foreground capitalize">{userRole} Dashboard</p>
            )}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="hidden md:block text-right">
            {userName && <p className="text-sm font-medium">{userName}</p>}
            {userEmail && <p className="text-xs text-muted-foreground">{userEmail}</p>}
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  )
}
