"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Eye, EyeOff, ChevronRight, ChevronDown } from "lucide-react"

interface CardCountDisplayProps {
  runningCount: number
  trueCount: number
  decksRemaining: number
  onClick: () => void
  isVisible: boolean
  onToggleVisibility: () => void
  showCountHistory: boolean
}

export default function CardCountDisplay({
  runningCount,
  trueCount,
  decksRemaining,
  onClick,
  isVisible,
  onToggleVisibility,
  showCountHistory,
}: CardCountDisplayProps) {
  const getCountColor = (count: number) => {
    if (count > 2) return "bg-green-600 hover:bg-green-700"
    if (count < -2) return "bg-red-600 hover:bg-red-700"
    return "bg-slate-600 hover:bg-slate-700"
  }

  return (
    <div className="flex items-start gap-2">
      {/* Eye toggle button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleVisibility}
        className="p-2 bg-slate-700 hover:bg-slate-600 text-white"
        title={isVisible ? "Hide counter" : "Show counter"}
      >
        {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </Button>

      {/* Counter display */}
      {isVisible && (
        <motion.div
          className="cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClick}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <div className="space-y-1">
            <Badge className={`${getCountColor(runningCount)} text-white px-2 py-0.5 text-xs mr-2 font-bold`}>
              Run: {runningCount > 0 ? `+${runningCount}` : runningCount}
            </Badge>

            <Badge
              className={`${getCountColor(trueCount)} text-white px-2 py-0.5 text-xs ${decksRemaining < 1 ? "ring-2 ring-yellow-400 shadow-lg shadow-yellow-500/50" : ""}`}
            >
              True: {trueCount > 0 ? `+${trueCount.toFixed(1)}` : trueCount.toFixed(1)}
            </Badge>

            <div className="text-xs text-white/70">Decks: {decksRemaining.toFixed(1)}</div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClick} // This onClick toggles the history dropdown
              className="p-0 h-auto text-xs text-white/50 hover:bg-transparent hover:text-white/50 flex items-center gap-1"
            >
              History
              {showCountHistory ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
