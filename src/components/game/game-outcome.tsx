"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import confetti from "canvas-confetti"
import { useEffect, useRef } from "react"

interface GameOutcomeProps {
  outcome: {
    type: "win" | "lose" | "push" | "blackjack" | "dealer_blackjack" | null // Added "dealer_blackjack"
    message: string
  }
  onClose: () => void
  displayMode?: "modal" | "pill"
}

export default function GameOutcome({ outcome, onClose, displayMode = "modal" }: GameOutcomeProps) {
  const confettiRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Trigger confetti for wins and blackjack
    if (outcome.type === "win" || outcome.type === "blackjack") {
      const canvas = document.createElement("canvas")
      canvas.style.position = "fixed"
      canvas.style.inset = "0"
      canvas.style.width = "100vw"
      canvas.style.height = "100vh"
      canvas.style.zIndex = "100"
      canvas.style.pointerEvents = "none"
      document.body.appendChild(canvas)

      const myConfetti = confetti.create(canvas, {
        resize: true,
        useWorker: true,
      })

      if (outcome.type === "blackjack") {
        const end = Date.now() + 3000
        const colors = ["#FFD700", "#FFC107", "#FFEB3B"]
        ;(function frame() {
          myConfetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors,
          })
          myConfetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors,
          })
          if (Date.now() < end) {
            requestAnimationFrame(frame)
          }
        })()
      } else {
        myConfetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })
      }

      return () => {
        if (document.body.contains(canvas)) {
          document.body.removeChild(canvas)
        }
      }
    }
  }, [outcome.type])

  // Auto-close for pill display mode
  useEffect(() => {
    if (displayMode === "pill" && outcome.type) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000) // Pill visible for 3 seconds
      return () => clearTimeout(timer)
    }
  }, [displayMode, outcome.type, onClose])

  const getBgColor = () => {
    switch (outcome.type) {
      case "win":
        return "bg-green-600"
      case "blackjack": // Player Blackjack
        return "bg-yellow-500 shadow-yellow-500/50" // Enhanced for player blackjack pill
      case "lose":
        return "bg-red-600"
      case "dealer_blackjack": // Dealer Blackjack
        return "bg-red-700 shadow-red-700/50" // Enhanced for dealer blackjack pill
      case "push":
        return "bg-blue-600"
      default:
        return "bg-slate-800"
    }
  }

  if (displayMode === "pill") {
    return (
      <AnimatePresence>
        {outcome.type && (
          <motion.div
            key={outcome.type} // Add key for re-animation on type change
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              ...(outcome.type === "blackjack" && {
                transition: {
                  scale: {
                    type: "spring",
                    stiffness: 300,
                    damping: 10,
                    repeat: 2,
                    repeatType: "mirror",
                  },
                },
              }),
              ...(outcome.type === "dealer_blackjack" && {
                x: [0, -5, 5, -5, 5, 0], // Subtle shake
                transition: { x: { duration: 0.5 } },
              }),
            }}
            exit={{ opacity: 0, y: 50, scale: 0.3 }}
            className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 p-3 rounded-lg shadow-xl text-white text-base font-semibold ${getBgColor()} ${
              outcome.type === "blackjack" || outcome.type === "dealer_blackjack"
                ? "px-5 py-3 text-lg border-2 border-white/50" // Larger and bordered for blackjacks
                : "text-sm"
            }`}
          >
            {outcome.message}
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  // Modal display mode (original)
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose} // Allow closing modal by clicking background
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={`${getBgColor()} p-8 rounded-xl shadow-2xl max-w-md w-full text-center`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal content
        ref={confettiRef}
      >
        <h2 className="text-4xl font-bold text-white mb-6">{outcome.message}</h2>
        <div className="mt-8">
          <Button onClick={onClose} size="lg" variant="outline" className="bg-white/20 hover:bg-white/30 text-white">
            Continue
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
