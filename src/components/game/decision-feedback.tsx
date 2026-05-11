"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

interface DecisionFeedbackProps {
  decision: string | null
  onComplete: () => void
}

export default function DecisionFeedback({ decision, onComplete }: DecisionFeedbackProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (decision) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        // Ensure onComplete is called after the exit animation might have finished
        setTimeout(onComplete, 300) // Duration of exit animation
      }, 1500) // Pill visible for 1.5 seconds

      return () => clearTimeout(timer)
    }
  }, [decision, onComplete])

  const getDecisionColor = (decisionText: string) => {
    switch (decisionText.toLowerCase()) {
      case "hit":
        return "bg-red-500/90"
      case "stand":
        return "bg-blue-500/90"
      case "double down":
        return "bg-purple-500/90"
      case "split":
        return "bg-orange-500/90"
      default:
        return "bg-slate-500/90"
    }
  }

  return (
    <AnimatePresence>
      {isVisible && decision && (
        <motion.div
          initial={{ opacity: 0, x: -30, scale: 0.8 }} // Animate from left
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -30, scale: 0.8, transition: { duration: 0.3 } }}
          // Positioned on the center-left of the table, aligned with player hands area
          className="absolute top-[60%] left-4 md:left-6 transform -translate-y-1/2 z-30 pointer-events-none"
        >
          <div
            className={`${getDecisionColor(decision)} text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-xl border-2 border-white/30`}
          >
            {decision}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
