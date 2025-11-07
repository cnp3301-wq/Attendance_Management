"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"

interface ResponsiveStatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: "default" | "primary" | "success" | "warning" | "danger"
}

const colorClasses = {
  default: "bg-muted text-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-green-500/10 text-green-600 dark:text-green-400",
  warning: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  danger: "bg-red-500/10 text-red-600 dark:text-red-400",
}

export function ResponsiveStatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = "default",
}: ResponsiveStatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group"
    >
      <div className={`
        relative overflow-hidden rounded-xl p-4 sm:p-6
        border border-border
        bg-card shadow-sm hover:shadow-xl
        transition-all duration-300
        cursor-pointer
      `}>
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Icon */}
        <div className={`
          inline-flex items-center justify-center
          w-12 h-12 sm:w-14 sm:h-14
          rounded-lg sm:rounded-xl
          ${colorClasses[color]}
          mb-3 sm:mb-4
          relative z-10
        `}>
          <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>

        {/* Content */}
        <div className="relative z-10 space-y-1">
          {/* Title */}
          <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
            {title}
          </p>

          {/* Value */}
          <motion.p
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground"
          >
            {value}
          </motion.p>

          {/* Description or Trend */}
          {(description || trend) && (
            <div className="flex items-center gap-2 mt-2">
              {trend && (
                <span
                  className={`text-xs sm:text-sm font-semibold ${
                    trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                </span>
              )}
              {description && (
                <span className="text-xs sm:text-sm text-muted-foreground truncate">
                  {description}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Ripple Effect */}
        <div className="absolute inset-0 ripple" />
      </div>
    </motion.div>
  )
}
