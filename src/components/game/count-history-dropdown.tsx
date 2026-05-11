"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronDown, ChevronUp } from "lucide-react"
import { useState, useEffect } from "react"

interface CountEntry {
  card: string
  suit: string
  value: number
  runningCount: number
  timestamp: number
}

interface CountHistoryDropdownProps {
  history: CountEntry[]
  isOpen: boolean
  onToggle: () => void
  runningCount: number
}

export default function CountHistoryDropdown({ history, isOpen, onToggle, runningCount }: CountHistoryDropdownProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Auto-collapse when new cards are added
  useEffect(() => {
    if (history.length > 0) {
      setIsExpanded(false)
    }
  }, [history.length])

  const getSuitSymbol = (suit: string) => {
    const symbols = {
      hearts: "♥",
      diamonds: "♦",
      clubs: "♣",
      spades: "♠",
    }
    return symbols[suit as keyof typeof symbols] || suit
  }

  const getSuitColor = (suit: string) => {
    return suit === "hearts" || suit === "diamonds" ? "text-red-600" : "text-black"
  }

  // Show only last 5 entries when collapsed, all when expanded
  const displayHistory = isExpanded ? history : history.slice(-5)
  const hasMoreEntries = history.length > 5

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className="absolute top-full left-0 mt-2 w-80 z-40"
        >
          <Card className="bg-slate-800 text-white border border-slate-600 shadow-xl">
            <CardHeader className="bg-slate-900 p-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Count History</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="text-xs bg-slate-700 px-2 py-1 rounded">
                    Count: {runningCount > 0 ? `+${runningCount}` : runningCount}
                  </div>
                  <Button variant="ghost" size="sm" onClick={onToggle} className="p-1 h-6 w-6">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-48 overflow-y-auto">
                {history.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-sm">No cards dealt yet</div>
                ) : (
                  <div className="space-y-0">
                    {displayHistory.map((entry, index) => (
                      <motion.div
                        key={`${entry.timestamp}-${index}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="flex items-center justify-between p-2 border-b border-slate-700 hover:bg-slate-700/30 text-sm"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-white rounded flex items-center justify-center text-xs font-bold">
                            <span className={getSuitColor(entry.suit)}>{entry.card}</span>
                          </div>
                          <span className="text-lg">{getSuitSymbol(entry.suit)}</span>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span
                            className={`font-bold text-xs ${
                              entry.value > 0 ? "text-green-400" : entry.value < 0 ? "text-red-400" : "text-slate-400"
                            }`}
                          >
                            {entry.value > 0 ? `+${entry.value}` : entry.value}
                          </span>
                          <span className="text-white font-bold text-xs min-w-[2rem] text-right">
                            {entry.runningCount > 0 ? `+${entry.runningCount}` : entry.runningCount}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Expand/Collapse button */}
              {hasMoreEntries && (
                <div className="p-2 bg-slate-900 border-t border-slate-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full text-xs text-slate-300 hover:text-white"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-3 w-3 mr-1" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3 mr-1" />
                        Show All ({history.length} cards)
                      </>
                    )}
                  </Button>
                </div>
              )}

              {history.length > 0 && (
                <div className="p-2 bg-slate-900 border-t border-slate-700 text-center">
                  <div className="text-xs text-slate-400">Total Cards: {history.length}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
