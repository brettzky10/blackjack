"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Coins, Hand, Square, BookOpen, ChevronsDown, Split, MenuIcon } from "lucide-react"
import PlayingCard from "@/components/game/playing-card"
import CardDeck from "@/components/game/card-deck"
import CardCountDisplay from "@/components/game/card-count-display"
import CountHistoryDropdown from "@/components/game/count-history-dropdown"
import DeckSelection from "@/components/game/deck-selection"
import GameMenu from "@/components/game/game-menu"
import GameSummary from "@/components/game/game-summary"
import DecisionFeedback from "@/components/game/decision-feedback"
import LoginScreen from "@/components/game/login-screen"
import GameOutcome from "@/components/game/game-outcome"
import EquityChartPanel from "@/components/game/equity-chart-panel"
import BlackjackTable from "@/components/game/blackjack-table"
import BettingSpot from "@/components/game/betting-spot"
import HandHistoryFeed from "@/components/game/hand-history-feed"
import {
  createShoe,
  shuffleDeck,
  getHandValue,
  getBasicStrategy,
  canSplit,
  getHiLoValue,
  calculateTrueCount,
  calculateDecksRemaining,
  getHandInfo,
  type CountEntry,
  type Card as PlayingCardType,
  type HandHistoryEntry,
} from "@/lib/utils/blackjack-utils"
import { savePlayerData, loadPlayerData } from "@/lib/data/player-data"
import { playSound } from "@/lib/utils/audio-utils"
import { motion, AnimatePresence } from "framer-motion"
import StrategyPanel from "@/components/game/strategy-panel"

interface PlayerHand {
  cards: PlayingCardType[]
  bet: number
  isActive: boolean
  isComplete: boolean
  result?: "win" | "lose" | "push" | "blackjack"
  isDoubled?: boolean
}

interface GameStats {
  handsPlayed: number
  wins: number
  losses: number
  pushes: number
  blackjacks: number
  bestStreak: number
  worstStreak: number
}

const INITIAL_BANKROLL = 10000
const NUM_SPOTS = 3
const MAX_SPLITS_PER_SPOT = 3 // Allows splitting up to 4 hands total

export default function BlackjackGame() {
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [numDecks, setNumDecks] = useState<number | null>(null)
  const [deck, setDeck] = useState<PlayingCardType[]>([])
  const [playerHands, setPlayerHands] = useState<PlayerHand[][]>(Array(NUM_SPOTS).fill([]))
  const [dealerHand, setDealerHand] = useState<PlayingCardType[]>([])
  const [gameState, setGameState] = useState<
    "login" | "deckSelection" | "betting" | "playing" | "dealerTurn" | "roundComplete" | "gameComplete"
  >("login")
  const [message, setMessage] = useState<string>("Welcome! Please log in.")
  const [playerMoney, setPlayerMoney] = useState<number>(INITIAL_BANKROLL)

  const [dealerCardHidden, setDealerCardHidden] = useState<boolean>(true)
  const [showStrategyPanel, setShowStrategyPanel] = useState<boolean>(false)
  const [recommendedMove, setRecommendedMove] = useState<string>("")
  const [outcome, setOutcome] = useState<{
    type: "win" | "lose" | "push" | "blackjack" | null
    message: string
  }>({ type: null, message: "" })
  const [isDealing, setIsDealing] = useState<boolean>(false)
  const [activeHandKey, setActiveHandKey] = useState<{ spot: number; hand: number } | null>(null)

  const [showGameMenu, setShowGameMenu] = useState<boolean>(false)
  const [showGameSummary, setShowGameSummary] = useState<boolean>(false)
  const [currentDecision, setCurrentDecision] = useState<string | null>(null)

  const [gameStats, setGameStats] = useState<GameStats>({
    handsPlayed: 0,
    wins: 0,
    losses: 0,
    pushes: 0,
    blackjacks: 0,
    bestStreak: 0,
    worstStreak: 0,
  })
  const [currentStreak, setCurrentStreak] = useState<number>(0)

  const [runningCount, setRunningCount] = useState<number>(0)
  const [countHistory, setCountHistory] = useState<CountEntry[]>([])
  const [showCountHistory, setShowCountHistory] = useState<boolean>(false)
  const [showCounter, setShowCounter] = useState<boolean>(true)
  const [handHistory, setHandHistory] = useState<HandHistoryEntry[]>([])
  const [roundHistory, setRoundHistory] = useState<HandHistoryEntry[]>([])

  const resetSessionData = () => {
    setRunningCount(0)
    setCountHistory([])
    setCurrentStreak(0)
    setRoundHistory([])
  }

  const handleLogin = (username: string) => {
    setCurrentUser(username)
    const existingData = loadPlayerData(username)
    if (existingData) {
      setPlayerMoney(existingData.money)
      setGameStats(existingData.stats)
      setHandHistory(existingData.handHistory || [])
      setRoundHistory(existingData.handHistory || [])
      setMessage(`Welcome back, ${username}! Choose number of decks.`)
    } else {
      const initialStats: GameStats = {
        handsPlayed: 0,
        wins: 0,
        losses: 0,
        pushes: 0,
        blackjacks: 0,
        bestStreak: 0,
        worstStreak: 0,
      }
      setPlayerMoney(INITIAL_BANKROLL)
      setGameStats(initialStats)
      setHandHistory([])
      setRoundHistory([])
      savePlayerData(username, { username, money: INITIAL_BANKROLL, stats: initialStats, handHistory: [] })
      setMessage(`Welcome, ${username}! Choose number of decks.`)
    }
    setNumDecks(null)
    resetSessionData()
    setGameState("deckSelection")
  }

  useEffect(() => {
    if (currentUser) {
      savePlayerData(currentUser, { username: currentUser, money: playerMoney, stats: gameStats, handHistory })
    }
  }, [playerMoney, gameStats, currentUser, handHistory])

  const showDecisionFeedback = (decision: string) => {
    playSound("action_click.mp3")
    setCurrentDecision(decision)
  }
  const clearDecisionFeedback = () => setCurrentDecision(null)
  const hasEnoughCards = () => deck.length >= playerHands.flat().length * 2 + 2

  const startNewRound = () => {
    if (!hasEnoughCards()) {
      setGameState("gameComplete")
      setShowGameSummary(true)
      return
    }
    setPlayerHands(Array(NUM_SPOTS).fill([]))
    setDealerHand([])
    setGameState("betting")
    setMessage("Place your bets!")
    setDealerCardHidden(true)
    setRecommendedMove("")
    setOutcome({ type: null, message: "" })
    setActiveHandKey(null)
    setCurrentDecision(null)
  }

  const handleDeckSelection = (selectedDecks: number) => {
    setNumDecks(selectedDecks)
    const newShoe = shuffleDeck(createShoe(selectedDecks))
    setDeck(newShoe)
    setGameState("betting")
    setMessage("Shoe prepared! Place your bets.")
    resetSessionData()
  }

  const addToCount = (card: PlayingCardType) => {
    const countValue = getHiLoValue(card)
    setRunningCount((prev) => prev + countValue)
    setCountHistory((prev) => [
      ...prev,
      {
        card: card.value,
        suit: card.suit,
        value: countValue,
        runningCount: runningCount + countValue,
        timestamp: Date.now(),
      },
    ])
  }

  const updateGameStatsAndHistory = (finalPlayerHands: PlayerHand[][], finalDealerHand: PlayingCardType[]) => {
    let winsThisRound = 0,
      lossesThisRound = 0,
      pushesThisRound = 0,
      blackjacksThisRound = 0
    let totalBet = 0,
      totalWinnings = 0

    const flatHands = finalPlayerHands.flat()

    flatHands.forEach((hand) => {
      totalBet += hand.bet
      if (hand.result === "win") {
        winsThisRound++
        totalWinnings += hand.bet * 2
      } else if (hand.result === "lose") {
        lossesThisRound++
      } else if (hand.result === "push") {
        pushesThisRound++
        totalWinnings += hand.bet
      } else if (hand.result === "blackjack") {
        blackjacksThisRound++
        winsThisRound++
        totalWinnings += hand.bet * 2.5
      }
    })

    let newStreak = currentStreak
    if (winsThisRound > lossesThisRound) newStreak = currentStreak >= 0 ? currentStreak + 1 : 1
    else if (lossesThisRound > winsThisRound) newStreak = currentStreak <= 0 ? currentStreak - 1 : -1
    setCurrentStreak(newStreak)

    const newStats = {
      ...gameStats,
      handsPlayed: gameStats.handsPlayed + flatHands.length,
      wins: gameStats.wins + winsThisRound,
      losses: gameStats.losses + lossesThisRound,
      pushes: gameStats.pushes + pushesThisRound,
      blackjacks: gameStats.blackjacks + blackjacksThisRound,
      bestStreak: Math.max(gameStats.bestStreak, newStreak),
      worstStreak: Math.min(gameStats.worstStreak, newStreak),
    }
    setGameStats(newStats)

    const roundNetProfitOrLoss = totalWinnings - totalBet
    if (flatHands.length > 0) {
      const historyEntry: HandHistoryEntry = {
        handNumber: newStats.handsPlayed,
        playerHand: flatHands[0].cards,
        dealerHand: finalDealerHand,
        result: flatHands[0].result || "N/A",
        profitOrLoss: roundNetProfitOrLoss,
        timestamp: Date.now(),
      }
      setHandHistory((prev) => [...prev, historyEntry])
      setRoundHistory((prev) => [...prev, historyEntry])
    }
  }

  useEffect(() => {
    const hand = getCurrentHand()
    if (gameState === "playing" && hand && dealerHand.length > 0) {
      const dealerUpCard = dealerHand[1]
      const strategy = getBasicStrategy(hand.cards, dealerUpCard)
      setRecommendedMove(strategy)
    } else {
      setRecommendedMove("")
    }
  }, [activeHandKey, playerHands, dealerHand, gameState])

  const addHand = (spotIndex: number, bet: number) => {
    if (playerMoney < bet) return
    const newHands = [...playerHands]
    newHands[spotIndex] = [{ cards: [], bet, isActive: false, isComplete: false }]
    setPlayerHands(newHands)
    setPlayerMoney((m) => m - bet)
    playSound("bet_chip.mp3")
  }

  const removeHand = (spotIndex: number) => {
    const handToRemove = playerHands[spotIndex][0]
    if (!handToRemove) return
    const newHands = [...playerHands]
    newHands[spotIndex] = []
    setPlayerHands(newHands)
    setPlayerMoney((m) => m + handToRemove.bet)
    playSound("ui_clear.mp3")
  }

  const handleDeal = async () => {
    if (!hasEnoughCards()) {
      setMessage("Not enough cards remaining!")
      setGameState("gameComplete")
      setShowGameSummary(true)
      return
    }

    playSound("bet_confirm.mp3")
    setIsDealing(true)
    setGameState("playing")

    const newDeck = [...deck]
    const handsToDeal = playerHands.map((spot) => spot.map((hand) => ({ ...hand })))
    const dealerCards: PlayingCardType[] = []

    // Deal first card to each player hand
    for (let i = 0; i < 2; i++) {
      for (let spot = 0; spot < handsToDeal.length; spot++) {
        if (handsToDeal[spot].length > 0) {
          const card = newDeck.pop()!
          handsToDeal[spot][0].cards.push(card)
          addToCount(card)
          setPlayerHands([...handsToDeal])
          playSound("card_deal.mp3")
          await new Promise((r) => setTimeout(r, 200))
        }
      }
      // Deal to dealer
      if (i === 0) {
        dealerCards.push(newDeck.pop()!) // Hole card
      } else {
        const upCard = newDeck.pop()!
        dealerCards.push(upCard)
        addToCount(upCard) // Only count up-card initially
      }
      setDealerHand([...dealerCards])
      playSound("card_deal.mp3")
      await new Promise((r) => setTimeout(r, 200))
    }

    setDeck(newDeck)

    // Check for blackjacks
    const dealerValue = getHandValue(dealerCards)
    let moneyToReturn = 0
    let allHandsResolved = true

    handsToDeal.forEach((spot) => {
      spot.forEach((hand) => {
        const playerValue = getHandValue(hand.cards)
        if (playerValue === 21) {
          hand.isComplete = true
          if (dealerValue === 21) {
            hand.result = "push"
            moneyToReturn += hand.bet
          } else {
            hand.result = "blackjack"
            moneyToReturn += hand.bet * 2.5
          }
        } else {
          allHandsResolved = false
        }
      })
    })

    if (dealerValue === 21) {
      setDealerCardHidden(false)
      addToCount(dealerCards[0])
      handsToDeal.forEach((spot) =>
        spot.forEach((hand) => {
          if (!hand.isComplete) {
            hand.isComplete = true
            hand.result = "lose"
          }
        }),
      )
      allHandsResolved = true
    }

    setPlayerHands([...handsToDeal])
    setPlayerMoney((m) => m + moneyToReturn)

    if (allHandsResolved) {
      setGameState("roundComplete")
      updateGameStatsAndHistory(handsToDeal, dealerCards)
      setOutcome({ type: "push", message: "Round Complete" })
    } else {
      moveToNextHand(handsToDeal)
    }
    setIsDealing(false)
  }

  const moveToNextHand = (currentHands = playerHands) => {
    let nextSpot = activeHandKey?.spot ?? -1
    let nextHand = (activeHandKey?.hand ?? -1) + 1

    while (nextSpot < currentHands.length) {
      if (nextSpot === -1) nextSpot = 0
      if (currentHands[nextSpot] && nextHand < currentHands[nextSpot].length) {
        if (!currentHands[nextSpot][nextHand].isComplete) {
          setActiveHandKey({ spot: nextSpot, hand: nextHand })
          setMessage(`Your turn! Playing hand at spot ${nextSpot + 1}.`)
          return
        }
      }
      nextHand++
      if (!currentHands[nextSpot] || nextHand >= currentHands[nextSpot].length) {
        nextSpot++
        nextHand = 0
      }
    }

    // No more hands to play
    setActiveHandKey(null)
    dealerTurn()
  }

  const hit = async () => {
    const hand = getCurrentHand()
    if (!hand) return
    showDecisionFeedback("Hit")
    setIsDealing(true)
    const newDeck = [...deck]
    const card = newDeck.pop()!
    hand.cards.push(card)
    setPlayerHands([...playerHands])
    addToCount(card)
    playSound("card_deal.mp3")
    await new Promise((r) => setTimeout(r, 300))
    setDeck(newDeck)
    setIsDealing(false)
    const handValue = getHandValue(hand.cards)
    if (handValue >= 21) {
      hand.isComplete = true
      if (handValue > 21) hand.result = "lose"
      setPlayerHands([...playerHands])
      moveToNextHand()
    }
  }

  const stand = () => {
    const hand = getCurrentHand()
    if (!hand) return
    showDecisionFeedback("Stand")
    hand.isComplete = true
    setPlayerHands([...playerHands])
    moveToNextHand()
  }

  const dealerTurn = async () => {
    setGameState("dealerTurn")
    setDealerCardHidden(false)
    setMessage("Dealer's turn...")
    if (dealerHand.length > 0 && dealerCardHidden) {
      addToCount(dealerHand[0])
    }

    const newDeck = [...deck]
    const currentDealerHand = [...dealerHand]
    let dealerValue = getHandValue(currentDealerHand)

    const playerHasStandingHand = playerHands.flat().some((hand) => getHandValue(hand.cards) <= 21)

    if (playerHasStandingHand) {
      while (dealerValue < 17 || (dealerValue === 17 && getHandValue(currentDealerHand) !== 17)) {
        setIsDealing(true)
        await new Promise((r) => setTimeout(r, 300))
        const card = newDeck.pop()!
        currentDealerHand.push(card)
        setDealerHand([...currentDealerHand])
        addToCount(card)
        playSound("card_deal.mp3")
        dealerValue = getHandValue(currentDealerHand)
        setIsDealing(false)
      }
    }
    setDeck(newDeck)

    const finalPlayerHands = [...playerHands]
    let totalWinningsReturned = 0

    finalPlayerHands.forEach((spot) =>
      spot.forEach((hand) => {
        if (hand.result) return
        const playerValue = getHandValue(hand.cards)
        if (dealerValue > 21 || playerValue > dealerValue) {
          hand.result = "win"
          totalWinningsReturned += hand.bet * 2
        } else if (playerValue < dealerValue) {
          hand.result = "lose"
        } else {
          hand.result = "push"
          totalWinningsReturned += hand.bet
        }
      }),
    )

    setPlayerHands(finalPlayerHands)
    setPlayerMoney((m) => m + totalWinningsReturned)
    setGameState("roundComplete")
    updateGameStatsAndHistory(finalPlayerHands, currentDealerHand)

    const winCount = finalPlayerHands.flat().filter((h) => h.result === "win").length
    const loseCount = finalPlayerHands.flat().filter((h) => h.result === "lose").length
    let outcomeMessage = "Round Complete"
    if (winCount > loseCount) outcomeMessage = "You Win!"
    if (loseCount > winCount) outcomeMessage = "Dealer Wins!"

    setOutcome({ type: winCount > loseCount ? "win" : loseCount > winCount ? "lose" : "push", message: outcomeMessage })
  }

  const doubleDown = async () => {
    const hand = getCurrentHand()
    if (!hand || hand.cards.length !== 2 || playerMoney < hand.bet) return
    showDecisionFeedback("Double Down")
    setPlayerMoney((m) => m - hand.bet)
    hand.bet *= 2
    hand.isDoubled = true
    setIsDealing(true)
    const newDeck = [...deck]
    const card = newDeck.pop()!
    hand.cards.push(card)
    setPlayerHands([...playerHands])
    addToCount(card)
    playSound("card_deal.mp3")
    await new Promise((r) => setTimeout(r, 300))
    setDeck(newDeck)
    setIsDealing(false)
    hand.isComplete = true
    if (getHandValue(hand.cards) > 21) hand.result = "lose"
    setPlayerHands([...playerHands])
    moveToNextHand()
  }

  const split = async () => {
    const handToSplit = getCurrentHand()
    const spotIndex = activeHandKey?.spot
    if (!handToSplit || spotIndex === undefined || !canSplitHand()) {
      playSound("error.mp3")
      return
    }
    showDecisionFeedback("Split")
    setPlayerMoney((m) => m - handToSplit.bet)

    const newDeck = [...deck]
    const newPlayerHands = [...playerHands]
    const spotHands = newPlayerHands[spotIndex]

    const newHand: PlayerHand = {
      cards: [handToSplit.cards.pop()!],
      bet: handToSplit.bet,
      isActive: false,
      isComplete: false,
    }
    spotHands.push(newHand)

    // Deal new cards to both split hands
    const card1 = newDeck.pop()!
    handToSplit.cards.push(card1)
    addToCount(card1)

    const card2 = newDeck.pop()!
    newHand.cards.push(card2)
    addToCount(card2)

    setDeck(newDeck)

    if (handToSplit.cards[0].value === "A") {
      handToSplit.isComplete = true
      newHand.isComplete = true
    }

    setPlayerHands(newPlayerHands)
    moveToNextHand(newPlayerHands)
  }

  const handleFullResetNewGame = () => {
    setShowGameMenu(false)
    setShowGameSummary(false)
    setNumDecks(null)
    setGameState("deckSelection")
  }

  const handleMainMenu = () => {
    setShowGameMenu(false)
    setShowGameSummary(false)
    setCurrentUser(null)
    setNumDecks(null)
    resetSessionData()
    setGameState("login")
  }

  const closeOutcomeAndContinue = () => {
    setOutcome({ type: null, message: "" })
    startNewRound()
  }

  const getCurrentHand = () => {
    if (!activeHandKey) return null
    return playerHands[activeHandKey.spot]?.[activeHandKey.hand] ?? null
  }

  const canSplitHand = () => {
    const hand = getCurrentHand()
    const spotIndex = activeHandKey?.spot
    if (spotIndex === undefined || !hand) return false
    return canSplit(hand.cards) && playerMoney >= hand.bet && playerHands[spotIndex].length <= MAX_SPLITS_PER_SPOT
  }

  const decksRemaining = calculateDecksRemaining(deck.length)
  const trueCount = calculateTrueCount(runningCount, decksRemaining)

  if (gameState === "login") return <LoginScreen onLogin={handleLogin} />
  if (gameState === "deckSelection") return <DeckSelection onSelectDecks={handleDeckSelection} />

  const renderActionButton = (
    action: "Hit" | "Stand" | "Double Down" | "Split",
    onClick: () => void,
    disabled: boolean,
    icon: React.ReactNode,
    colorClass: string,
  ) => {
    const isRecommended = recommendedMove.toLowerCase().includes(action.toLowerCase())
    return (
      <Button
        onClick={onClick}
        disabled={disabled}
        className={`relative text-white font-bold shadow-lg transition-all duration-300 rounded-xl sm:rounded-full px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base ${colorClass} ${
          disabled ? "bg-opacity-50 cursor-not-allowed" : "hover:bg-opacity-90"
        }`}
      >
        {isRecommended && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow: "0 0 0 0px rgba(253, 224, 71, 0.7)",
            }}
            animate={{
              boxShadow: [
                "0 0 0 0px rgba(253, 224, 71, 0.7)",
                "0 0 0 10px rgba(253, 224, 71, 0)",
                "0 0 0 0px rgba(253, 224, 71, 0)",
              ],
            }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        )}
        <span className="relative z-10 flex items-center">
          {icon}
          {action}
        </span>
      </Button>
    )
  }

  return (
    <div className="min-h-dvh w-full bg-slate-900 overflow-x-hidden overflow-y-auto">
  <div className="flex flex-col items-center p-2 md:p-4">
      <GameMenu
        isOpen={showGameMenu}
        onClose={() => setShowGameMenu(false)}
        onNewGame={handleFullResetNewGame}
        onMainMenu={handleMainMenu}
        gameState={gameState}
      />
      {showGameSummary && (
        <GameSummary stats={gameStats} onNewGame={handleFullResetNewGame} onMainMenu={handleMainMenu} />
      )}

      <div className="w-full flex items-start gap-4">
        <AnimatePresence>
          {showStrategyPanel && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="w-64 shrink-0 hidden lg:block"
            >
              <StrategyPanel
                playerHand={getCurrentHand()?.cards || []}
                dealerUpCard={dealerHand.length > 0 ? dealerHand[1] : null}
                recommendedMove={recommendedMove}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grow flex flex-col items-center">
          <BlackjackTable>
            {/* Top Bar */}
            <div className="absolute top-2 left-2 right-2 sm:top-4 sm:left-4 sm:right-4 flex justify-between items-start z-20 gap-2">
              <div className="relative">
                <CardCountDisplay
                  runningCount={runningCount}
                  trueCount={trueCount}
                  decksRemaining={decksRemaining}
                  onClick={() => setShowCountHistory(!showCountHistory)}
                  isVisible={showCounter}
                  onToggleVisibility={() => setShowCounter(!showCounter)}
                />
                <CountHistoryDropdown
                  history={countHistory}
                  isOpen={showCountHistory}
                  onToggle={() => setShowCountHistory(!showCountHistory)}
                  runningCount={runningCount}
                />
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Badge
                  variant="outline"
                  className="bg-yellow-500 text-black font-bold text-xs sm:text-lg px-2 sm:px-4 py-1"
                >
                  <Coins className="mr-2 h-5 w-5" />${playerMoney}
                </Badge>
                <Button variant="outline" size="icon" onClick={() => setShowGameMenu(true)}>
                  <MenuIcon />
                </Button>
              </div>
            </div>

            {/* Dealer Area */}
            <div className="absolute top-[12%] sm:top-[15%] w-full flex flex-col items-center px-2">
              <h2 className="text-lg font-semibold text-white/80 mb-2">
                Dealer {!dealerCardHidden && `(${getHandInfo(dealerHand).display})`}
              </h2>
              <div className="flex justify-center h-24 sm:h-32 relative -space-x-8 sm:-space-x-12">
                {dealerHand.map((card, index) => (
                  <motion.div key={`dealer-${index}`} layoutId={`dealer-${index}`} style={{ zIndex: index }}>
                    <PlayingCard
                      card={index === 0 && dealerCardHidden ? null : card}
                      hidden={index === 0 && dealerCardHidden}
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Player Betting Spots */}
            <div className="absolute bottom-[28%] sm:bottom-[25%] w-full px-2">
              <div className="flex flex-row justify-around items-end gap-2 sm:gap-4">
              {playerHands.map((hands, index) => (
                <BettingSpot
                  key={index}
                  spotIndex={index}
                  hands={hands}
                  onAddHand={addHand}
                  onRemoveHand={removeHand}
                  gameState={gameState}
                  activeHandKey={activeHandKey}
                  playerMoney={playerMoney}
                />
              ))}
              </div>
            </div>

            {/* Action Buttons / Message Area */}
            <div className="absolute bottom-[calc(8%+env(safe-area-inset-bottom))] w-full flex items-center justify-center pointer-events-auto px-2">
              {gameState === "betting" && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <Button
                    onClick={handleDeal}
                    disabled={playerHands.flat().length === 0 || isDealing}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-xl px-12 py-6 rounded-full shadow-2xl"
                  >
                    Deal
                  </Button>
                </motion.div>
              )}

              {gameState === "playing" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-2 sm:gap-3 px-2 w-full max-w-md"
                >
                  {renderActionButton(
                    "Hit",
                    hit,
                    isDealing || !getCurrentHand(),
                    <Hand className="mr-2 h-4 w-4" />,
                    "bg-blue-600",
                  )}
                  {renderActionButton(
                    "Stand",
                    stand,
                    isDealing || !getCurrentHand(),
                    <Square className="mr-2 h-4 w-4" />,
                    "bg-red-600",
                  )}
                  {renderActionButton(
                    "Double Down",
                    doubleDown,
                    isDealing ||
                      !getCurrentHand() ||
                      getCurrentHand()!.cards.length !== 2 ||
                      playerMoney < getCurrentHand()!.bet,
                    <ChevronsDown className="mr-2 h-4 w-4" />,
                    "bg-purple-600",
                  )}
                  {renderActionButton(
                    "Split",
                    split,
                    isDealing || !canSplitHand(),
                    <Split className="mr-2 h-4 w-4" />,
                    "bg-orange-500",
                  )}
                </motion.div>
              )}

              {gameState !== "playing" && gameState !== "betting" && (
                <p className="text-white text-lg font-semibold drop-shadow-lg">{message}</p>
              )}
            </div>
          </BlackjackTable>

          {/* Bottom Bar */}
          <div className="w-full max-w-7xl mt-4 flex flex-col sm:flex-row justify-between items-center gap-4 pb-6">
            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                onClick={() => setShowStrategyPanel(!showStrategyPanel)}
                className="hidden lg:inline-flex bg-slate-700/50 border-slate-600 hover:bg-slate-700"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Strategy
              </Button>
              <EquityChartPanel history={handHistory} />
            </div>

            <HandHistoryFeed history={roundHistory} />

            <div className="flex justify-center sm:justify-end w-full sm:w-64">
              <CardDeck cardsRemaining={deck.length} />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {outcome.type && gameState === "roundComplete" && (
          <GameOutcome outcome={outcome} onClose={closeOutcomeAndContinue} displayMode="pill" />
        )}
      </AnimatePresence>
      <DecisionFeedback decision={currentDecision} onComplete={clearDecisionFeedback} />
    </div>
    </div>
  )
}
