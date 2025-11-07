"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface InteractiveCardProps {
  title?: string
  description?: string
  children: ReactNode
  onClick?: () => void
  className?: string
  icon?: ReactNode
  badge?: string | number
}

export function InteractiveCard({
  title,
  description,
  children,
  onClick,
  className = "",
  icon,
  badge,
}: InteractiveCardProps) {
  const CardWrapper = onClick ? motion.div : "div"

  return (
    <CardWrapper
      {...(onClick && {
        whileHover: { scale: 1.02, y: -4 },
        whileTap: { scale: 0.98 },
        transition: { type: "spring", stiffness: 300, damping: 20 },
      })}
      onClick={onClick}
      className={`${onClick ? "cursor-pointer" : ""}`}
    >
      <Card className={`relative overflow-hidden ${className} ${onClick ? "hover:shadow-xl transition-shadow" : ""}`}>
        {/* Badge */}
        {badge !== undefined && (
          <div className="absolute top-3 right-3 z-10">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold text-primary-foreground bg-primary rounded-full shadow-lg"
            >
              {badge}
            </motion.span>
          </div>
        )}

        {/* Header */}
        {(title || description || icon) && (
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              {icon && (
                <motion.div
                  initial={{ rotate: -10, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex-shrink-0"
                >
                  {icon}
                </motion.div>
              )}
              <div className="flex-1 min-w-0">
                {title && (
                  <CardTitle className="text-responsive-base truncate">{title}</CardTitle>
                )}
                {description && (
                  <CardDescription className="text-responsive-sm mt-1">
                    {description}
                  </CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
        )}

        {/* Content */}
        <CardContent className="pb-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {children}
          </motion.div>
        </CardContent>

        {/* Interactive Overlay */}
        {onClick && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
        )}
      </Card>
    </CardWrapper>
  )
}
