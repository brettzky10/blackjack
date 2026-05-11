"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface DeckSelectionProps {
  onSelectDecks: (numDecks: number) => void
}

export default function DeckSelection({ onSelectDecks }: DeckSelectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
    >
      <Card className="w-full max-w-md bg-green-700 text-white border-2 border-yellow-500">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Choose Number of Decks</CardTitle>
          <p className="text-sm text-green-200">Select the shoe configuration for this game</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => onSelectDecks(2)} className="w-full h-16 text-lg bg-blue-600 hover:bg-blue-700">
            <div className="text-center">
              <div className="font-bold">Double Deck</div>
              <div className="text-sm opacity-80">2 Decks (104 cards)</div>
            </div>
          </Button>

          <Button onClick={() => onSelectDecks(6)} className="w-full h-16 text-lg bg-purple-600 hover:bg-purple-700">
            <div className="text-center">
              <div className="font-bold">Six Deck Shoe</div>
              <div className="text-sm opacity-80">6 Decks (312 cards)</div>
            </div>
          </Button>

          <div className="mt-6 p-3 bg-black/30 rounded-lg">
            <h4 className="font-semibold mb-2">Card Counting Info:</h4>
            <ul className="text-sm space-y-1">
              <li>• Cards 2-6: +1</li>
              <li>• Cards 7-9: 0</li>
              <li>• Cards 10-A: -1</li>
              <li>• Click the count to see history</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
