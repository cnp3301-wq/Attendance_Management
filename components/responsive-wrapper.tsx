"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"

interface ResponsiveWrapperProps {
  children: ReactNode
  className?: string
  animate?: boolean
}

export function ResponsiveWrapper({ 
  children, 
  className = "", 
  animate = true 
}: ResponsiveWrapperProps) {
  if (!animate) {
    return (
      <div className={`w-full mx-auto ${className}`}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`w-full mx-auto ${className}`}
    >
      {children}
    </motion.div>
  )
}
