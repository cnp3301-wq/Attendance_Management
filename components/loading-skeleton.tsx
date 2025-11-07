"use client"

import { motion } from "framer-motion"

interface LoadingSkeletonProps {
  type?: "card" | "list" | "stats" | "table"
  count?: number
}

export function LoadingSkeleton({ type = "card", count = 3 }: LoadingSkeletonProps) {
  const skeletons = Array.from({ length: count }, (_, i) => i)

  if (type === "card") {
    return (
      <div className="grid-responsive">
        {skeletons.map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl border border-border p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 skeleton rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 skeleton rounded w-3/4" />
                <div className="h-3 skeleton rounded w-1/2" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 skeleton rounded w-full" />
              <div className="h-3 skeleton rounded w-5/6" />
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  if (type === "list") {
    return (
      <div className="space-y-3">
        {skeletons.map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-4 p-4 rounded-lg border border-border"
          >
            <div className="w-12 h-12 skeleton rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 skeleton rounded w-2/3" />
              <div className="h-3 skeleton rounded w-1/2" />
            </div>
            <div className="w-20 h-8 skeleton rounded" />
          </motion.div>
        ))}
      </div>
    )
  }

  if (type === "stats") {
    return (
      <div className="grid-responsive">
        {skeletons.map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl border border-border p-6 space-y-4"
          >
            <div className="w-14 h-14 skeleton rounded-xl" />
            <div className="space-y-2">
              <div className="h-3 skeleton rounded w-1/2" />
              <div className="h-8 skeleton rounded w-3/4" />
              <div className="h-3 skeleton rounded w-2/3" />
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  if (type === "table") {
    return (
      <div className="rounded-lg border border-border overflow-hidden">
        {/* Header */}
        <div className="bg-muted/50 p-4 flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 skeleton rounded flex-1" />
          ))}
        </div>
        {/* Rows */}
        {skeletons.map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 border-t border-border flex gap-4"
          >
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="h-4 skeleton rounded flex-1" />
            ))}
          </motion.div>
        ))}
      </div>
    )
  }

  return null
}

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="text-center space-y-4"
      >
        <div className="spinner w-12 h-12 border-4 mx-auto" />
        <p className="text-responsive-base text-muted-foreground">Loading...</p>
      </motion.div>
    </div>
  )
}
