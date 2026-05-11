"use client"

import { motion, AnimatePresence } from "framer-motion"
import type { HandHistoryEntry } from "@/lib/utils/blackjack-utils"
import { useEffect, useRef } from "react"

interface HandHistoryFeedProps {
  history: HandHistoryEntry[]
}

export default function HandHistoryFeed({ history }: HandHistoryFeedProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to the latest entry
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth
    }
  }, [history])

  return (
    <div
      ref={scrollContainerRef}
      className="flex-grow h-16 flex items-center gap-2 overflow-x-auto overflow-y-hidden p-2 rounded-lg bg-black/10"
      style={{ scrollbarWidth: "none" }} // Hide scrollbar for Firefox
    >
      <AnimatePresence>
        {history.map((entry) => {
          const profit = entry.profitOrLoss
          const colorClass =
            profit > 0
              ? "bg-green-500/80 text-white"
              : profit < 0
                ? "bg-red-500/80 text-white"
                : "bg-slate-500/80 text-white"

          return (
            <motion.div
              key={entry.timestamp}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`px-3 py-1 rounded-full text-sm font-semibold shadow-md whitespace-nowrap ${colorClass}`}
            >
              {profit > 0 ? `+$${profit}` : `-$${Math.abs(profit)}`}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
