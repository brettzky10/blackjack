"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, MinusCircle, Coins, Check, X } from "lucide-react"
import PlayingCard from "./playing-card"
import type { Card as PlayingCardType } from "@/lib/utils/blackjack-utils"
import { getHandInfo } from "@/lib/utils/blackjack-utils"
import { useState } from "react"

interface PlayerHand {
  cards: PlayingCardType[]
  bet: number
  isActive: boolean
  isComplete: boolean
  result?: "win" | "lose" | "push" | "blackjack"
  isDoubled?: boolean
}

interface BettingSpotProps {
  hands: PlayerHand[]
  spotIndex: number
  onAddHand: (spotIndex: number, bet: number) => void
  onRemoveHand: (spotIndex: number) => void
  gameState: string
  activeHandKey: { spot: number; hand: number } | null
  playerMoney: number
}

const BET_CHIPS = [25, 50, 100, 500]

export default function BettingSpot({
  hands,
  spotIndex,
  onAddHand,
  onRemoveHand,
  gameState,
  activeHandKey,
  playerMoney,
}: BettingSpotProps) {
  const [currentBet, setCurrentBet] = useState(0)
  const [isBetting, setIsBetting] = useState(false)

  const handleConfirmBet = () => {
    if (playerMoney >= currentBet && currentBet > 0) {
      onAddHand(spotIndex, currentBet)
      setIsBetting(false)
      setCurrentBet(0)
    } else {
      // Optional: Add feedback for invalid bet
      console.error("Invalid bet amount or not enough money.")
    }
  }

  const handleCancelBet = () => {
    setIsBetting(false)
    setCurrentBet(0)
  }

  const handleAddChip = (amount: number) => {
    if (playerMoney >= currentBet + amount) {
      setCurrentBet((prev) => prev + amount)
    }
  }

  const renderBettingInterface = () => (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.9 }}
      className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 rounded-full shadow-xl z-20 p-2 space-y-2"
    >
      {/* Dynamic Bet Amount Display */}
      <div className="text-yellow-400 font-bold text-xl">${currentBet}</div>

      {/* Predefined Bet Options */}
      <div className="grid grid-cols-2 gap-1">
        {BET_CHIPS.map((amount) => (
          <Button
            key={amount}
            size="sm"
            variant="ghost"
            onClick={() => handleAddChip(amount)}
            className="text-white/70 hover:text-white hover:bg-white/10 text-xs p-1 h-6 rounded-md"
            disabled={playerMoney < currentBet + amount}
          >
            +${amount}
          </Button>
        ))}
      </div>

      {/* Confirm/Cancel Buttons */}
      <div className="flex gap-2">
        <Button
          size="icon"
          onClick={handleConfirmBet}
          className="w-8 h-8 bg-green-600 hover:bg-green-700 rounded-full"
          disabled={currentBet === 0}
        >
          <Check className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleCancelBet}
          className="w-8 h-8 text-slate-400 hover:text-white rounded-full"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  )

  const renderEmptySpot = () => (
    <AnimatePresence>
      {gameState === "betting" && (
        <>
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => setIsBetting(!isBetting)}
            className="w-full h-full flex items-center justify-center"
          >
            {!isBetting && <PlusCircle className="w-10 h-10 text-white/20 hover:text-white/50 transition-colors" />}
          </motion.button>
          {isBetting && renderBettingInterface()}
        </>
      )}
    </AnimatePresence>
  )

  const renderHands = () => {
    const handCount = hands.length
    const isSplit = handCount > 1
    const containerClass = isSplit ? "flex justify-center items-center gap-1" : "relative"
    const handWrapperClass = isSplit ? "w-1/2 h-full relative" : "w-full h-full relative"

    return (
      <div className={containerClass}>
        {hands.map((hand, handIndex) => {
          const handInfo = getHandInfo(hand.cards)
          return (
            <div key={handIndex} className={handWrapperClass}>
              {/* Cards */}
              <div
                className={`absolute inset-0 flex items-start justify-center pt-2 ${isSplit ? "-space-x-14" : "-space-x-12"}`}
              >
                <AnimatePresence>
                  {hand.cards.map((card, cardIndex) => {
                    const isDoubleDownCard = hand.isDoubled && cardIndex === hand.cards.length - 1
                    return (
                      <motion.div
                        key={`player-${spotIndex}-${handIndex}-${cardIndex}`}
                        initial={{ scale: 0, y: -100, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20, delay: cardIndex * 0.1 }}
                        layout
                        className="relative"
                        style={{
                          zIndex: cardIndex,
                          transform: `scale(${isSplit ? 0.8 : 1})`,
                          ...(isDoubleDownCard && {
                            transform: `scale(${isSplit ? 0.8 : 1}) translateY(-15px) translateX(10px)`,
                          }),
                        }}
                      >
                        <PlayingCard card={card} rotated={isDoubleDownCard} />
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>

              {/* Hand Value Badge */}
              {hand.cards.length > 0 && (
                <Badge
                  className={`absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-bold z-30 ${
                    handInfo.isBust ? "bg-red-600" : "bg-slate-900/80"
                  }`}
                >
                  {handInfo.display}
                </Badge>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const isSpotActive = activeHandKey?.spot === spotIndex

  return (
    <div
      className={`relative w-40 h-40 rounded-full border-2 ${
        isSpotActive ? "border-yellow-400 shadow-xl shadow-yellow-400/20" : "border-dashed border-white/10"
      } transition-all duration-300`}
    >
      {hands.length === 0 ? renderEmptySpot() : renderHands()}

      {/* Bet Amount, Result Pills, and Remove Button Container */}
      {hands.length > 0 && (
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          {/* Bet Amount & Remove Button */}
          <div className="relative">
            <Badge
              variant="secondary"
              className="bg-yellow-500 text-black font-bold text-base px-4 py-1 shadow-lg cursor-pointer"
            >
              <Coins className="w-4 h-4 mr-2" />${hands.reduce((acc, hand) => acc + hand.bet, 0)}
            </Badge>
            {gameState === "betting" && (
              <button onClick={() => onRemoveHand(spotIndex)} className="absolute -top-2 -right-2 z-10">
                <MinusCircle className="w-5 h-5 text-red-500 bg-white rounded-full" />
              </button>
            )}
          </div>

          {/* Result Pills */}
          <div className="flex gap-2">
            {hands.map(
              (hand, handIndex) =>
                hand.result && (
                  <Badge
                    key={handIndex}
                    className={`px-3 py-1 text-base font-bold uppercase shadow-2xl ${
                      hand.result === "win" || hand.result === "blackjack"
                        ? "bg-green-600"
                        : hand.result === "lose"
                          ? "bg-red-600"
                          : "bg-blue-600"
                    }`}
                  >
                    {hand.result}
                  </Badge>
                ),
            )}
          </div>
        </div>
      )}
    </div>
  )
}
