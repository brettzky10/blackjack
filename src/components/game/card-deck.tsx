"use client"

import { motion } from "framer-motion"

interface CardDeckProps {
  cardsRemaining: number
}

export default function CardDeck({ cardsRemaining }: CardDeckProps) {
  // Calculate how many "layers" to show in the deck based on cards remaining
  const layerCount = Math.min(5, Math.max(1, Math.ceil(cardsRemaining / 10)))

  return (
    <div className="relative w-20 h-28">
      {/* Generate stacked cards for visual effect */}
      {Array.from({ length: layerCount }).map((_, index) => (
        <motion.div
          key={`deck-layer-${index}`}
          className="absolute"
          style={{
            top: `${-index * 0.5}px`,
            left: `${-index * 0.5}px`,
            zIndex: 10 - index,
            transform: `rotate(${index * 0.5}deg)`,
          }}
        >
          <div className="w-20 h-28 rounded-lg bg-blue-800 border-2 border-white shadow-md flex items-center justify-center">
            {index === 0 && (
              <div className="w-16 h-24 bg-white/10 rounded-sm flex items-center justify-center">
                <div className="w-10 h-16 bg-blue-600 rounded-sm flex items-center justify-center">
                  <div className="text-white font-bold">♠♥♦♣</div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
