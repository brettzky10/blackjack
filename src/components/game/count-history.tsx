"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

interface CountEntry {
  card: string
  suit: string
  value: number
  runningCount: number
  timestamp: number
}

interface CountHistoryProps {
  history: CountEntry[]
  onClose: () => void
  isOpen: boolean
}

export default function CountHistory({ history, onClose, isOpen }: CountHistoryProps) {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-2xl max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="h-full bg-slate-800 text-white">
              <CardHeader className="bg-slate-900 flex flex-row items-center justify-between">
                <CardTitle>Card Counting History</CardTitle>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {history.length === 0 ? (
                    <div className="p-6 text-center text-slate-400">
                      No cards dealt yet. Start playing to see the count history!
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {history.map((entry, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className="flex items-center justify-between p-3 border-b border-slate-700 hover:bg-slate-700/50"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-sm font-bold">
                              <span className={getSuitColor(entry.suit)}>{entry.card}</span>
                            </div>
                            <span className="text-2xl">{getSuitSymbol(entry.suit)}</span>
                            <span className="text-sm text-slate-400">
                              {entry.card}
                              {getSuitSymbol(entry.suit)}
                            </span>
                          </div>

                          <div className="flex items-center space-x-4">
                            <span
                              className={`font-bold ${
                                entry.value > 0 ? "text-green-400" : entry.value < 0 ? "text-red-400" : "text-slate-400"
                              }`}
                            >
                              {entry.value > 0 ? `+${entry.value}` : entry.value}
                            </span>
                            <span className="text-white font-bold min-w-[3rem] text-right">
                              {entry.runningCount > 0 ? `+${entry.runningCount}` : entry.runningCount}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {history.length > 0 && (
                  <div className="p-4 bg-slate-900 border-t border-slate-700">
                    <div className="text-center">
                      <div className="text-sm text-slate-400">Total Cards Counted</div>
                      <div className="text-2xl font-bold">{history.length}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
