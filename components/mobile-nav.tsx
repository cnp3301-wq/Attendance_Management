"use client"

import { Home, Users, QrCode, BarChart3, Settings } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"

interface MobileNavProps {
  userRole: string
}

export function MobileNav({ userRole }: MobileNavProps) {
  const pathname = usePathname()
  const router = useRouter()

  const getNavItems = () => {
    if (userRole === "admin") {
      return [
        { icon: Home, label: "Home", path: "/admin" },
        { icon: Users, label: "Manage", path: "/admin/manage" },
        { icon: BarChart3, label: "Reports", path: "/admin/reports" },
        { icon: Settings, label: "Settings", path: "/admin/settings" },
      ]
    } else if (userRole === "teacher") {
      return [
        { icon: Home, label: "Home", path: "/teacher" },
        { icon: QrCode, label: "QR Code", path: "/teacher" },
        { icon: Users, label: "Students", path: "/teacher" },
        { icon: BarChart3, label: "Reports", path: "/teacher/reports" },
      ]
    }
    return []
  }

  const navItems = getNavItems()

  if (navItems.length === 0) return null

  return (
    <>
      {/* Spacer to prevent content from being hidden behind bottom nav */}
      <div className="h-20 sm:h-0" />
      
      {/* Mobile Bottom Navigation - Hidden on larger screens */}
      <nav className="mobile-nav sm:hidden safe-area-bottom">
        {navItems.map((item, index) => {
          const isActive = pathname === item.path
          const Icon = item.icon

          return (
            <motion.button
              key={item.path}
              whileTap={{ scale: 0.9 }}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center justify-center flex-1 gap-1 relative ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {/* Active Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              <Icon className={`w-6 h-6 ${isActive ? "scale-110" : ""}`} />
              <span className={`text-xs font-medium ${isActive ? "font-semibold" : ""}`}>
                {item.label}
              </span>

              {/* Ripple Effect */}
              <span className="absolute inset-0 ripple" />
            </motion.button>
          )
        })}
      </nav>
    </>
  )
}
