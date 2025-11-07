"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface ResponsivePageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
  showBack?: boolean
  sticky?: boolean
}

export function ResponsivePageHeader({
  title,
  description,
  action,
  showBack = false,
  sticky = false,
}: ResponsivePageHeaderProps) {
  const router = useRouter()

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`
        ${sticky ? "sticky-header" : ""}
        py-4 sm:py-6 lg:py-8
        safe-area-top
      `}
    >
      <div className="container">
        <div className="flex items-start justify-between gap-4">
          {/* Left Section */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              {/* Back Button */}
              {showBack && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.back()}
                  className="flex-shrink-0 ripple"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}

              {/* Title & Description */}
              <div className="flex-1 min-w-0">
                <h1 className="text-responsive-2xl font-bold tracking-tight truncate">
                  {title}
                </h1>
                {description && (
                  <p className="text-responsive-sm text-muted-foreground mt-1 line-clamp-2">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Action Button */}
          {action && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex-shrink-0"
            >
              {action}
            </motion.div>
          )}
        </div>
      </div>
    </motion.header>
  )
}
