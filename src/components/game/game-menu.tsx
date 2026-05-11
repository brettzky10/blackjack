"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { X, Home, RotateCcw } from "lucide-react"

interface GameMenuProps {
  isOpen: boolean
  onClose: () => void
  onNewGame: () => void
  onMainMenu: () => void
  gameState: string
}

export default function GameMenu({ isOpen, onClose, onNewGame, onMainMenu }: GameMenuProps) {
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
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="bg-green-700 text-white border-2 border-yellow-500">
              <CardHeader className="bg-green-800 flex flex-row items-center justify-between">
                <CardTitle>Game Menu</CardTitle>
                <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-green-600">
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <Button onClick={onClose} className="w-full bg-blue-600 hover:bg-blue-700">
                  Resume Game
                </Button>

                <Button onClick={onNewGame} className="w-full bg-purple-600 hover:bg-purple-700">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  New Game
                </Button>

                <Button onClick={onMainMenu} className="w-full bg-red-600 hover:bg-red-700">
                  <Home className="mr-2 h-4 w-4" />
                  Main Menu
                </Button>

                <div className="pt-4 border-t border-green-600">
                  <p className="text-sm text-green-200 text-center">Game will continue until the deck is depleted</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
