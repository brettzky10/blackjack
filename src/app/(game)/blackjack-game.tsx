/* "use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import {
  createShoe,
  shuffleDeck,
  getHandValue,
  getBasicStrategy,
  canSplit,
  getHiLoValue,
  calculateTrueCount,
  calculateDecksRemaining,
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
const BET_SUGGESTIONS = [25, 50, 100]

export default function BlackjackGame() {
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [numDecks, setNumDecks] = useState<number | null>(null)
  const [deck, setDeck] = useState<PlayingCardType[]>([])
  const [playerHands, setPlayerHands] = useState<PlayerHand[]>([])
  const [dealerHand, setDealerHand] = useState<PlayingCardType[]>([])
  const [gameState, setGameState] = useState<
    "login" | "deckSelection" | "betting" | "playing" | "dealerTurn" | "roundComplete" | "gameComplete"
  >("login")
  const [message, setMessage] = useState<string>("Welcome! Please log in.")
  const [playerMoney, setPlayerMoney] = useState<number>(INITIAL_BANKROLL)
  const [currentBet, setCurrentBet] = useState<number>(0)
  const [customBetAmount, setCustomBetAmount] = useState<string>("")
  const [betError, setBetError] = useState<string>("")

  const [dealerCardHidden, setDealerCardHidden] = useState<boolean>(true)
  const [showStrategyPanel, setShowStrategyPanel] = useState<boolean>(true)
  const [recommendedMove, setRecommendedMove] = useState<string>("")
  const [outcome, setOutcome] = useState<{
    type: "win" | "lose" | "push" | "blackjack" | null
    message: string
  }>({ type: null, message: "" })
  const [isDealing, setIsDealing] = useState<boolean>(false)
  const [activeHandIndex, setActiveHandIndex] = useState<number>(0)

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

  const deckRef = useRef<HTMLDivElement>(null)
  const [deckPosition, setDeckPosition] = useState({ x: 0, y: 0 })

  const resetSessionData = () => {
    setRunningCount(0)
    setCountHistory([])
    setCurrentStreak(0)
  }

  const validateShoeIntegrity = (shoe: PlayingCardType[]): boolean => {
    const totalHiLoValue = shoe.reduce((sum, card) => sum + getHiLoValue(card), 0)
    console.log(`Shoe Integrity Check: Total Hi-Lo sum for ${shoe.length} cards = ${totalHiLoValue}`)
    return totalHiLoValue === 0
  }

  const handleLogin = (username: string) => {
    setCurrentUser(username)
    const existingData = loadPlayerData(username)
    if (existingData) {
      setPlayerMoney(existingData.money)
      setGameStats(existingData.stats)
      setHandHistory(existingData.handHistory || [])
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
  const hasEnoughCards = () => deck.length >= 4

  const initializeGameSession = (isNewUser = false) => {
    if (numDecks) {
      const newShoe = shuffleDeck(createShoe(numDecks))
      setDeck(newShoe)
    }
    setPlayerHands([])
    setDealerHand([])
    setGameState("betting")
    setMessage("Place your bet!")
    setCurrentBet(0)
    setCustomBetAmount("")
    setBetError("")
    setDealerCardHidden(true)
    setRecommendedMove("")
    setOutcome({ type: null, message: "" })
    setActiveHandIndex(0)
    resetSessionData()

    if (isNewUser && currentUser) {
      const initialStats: GameStats = {
        handsPlayed: 0,
        wins: 0,
        losses: 0,
        pushes: 0,
        blackjacks: 0,
        bestStreak: 0,
        worstStreak: 0,
      }
      setGameStats(initialStats)
      setPlayerMoney(INITIAL_BANKROLL)
      setHandHistory([])
      savePlayerData(currentUser, {
        username: currentUser,
        money: INITIAL_BANKROLL,
        stats: initialStats,
        handHistory: [],
      })
    }
  }

  const startNewRound = () => {
    if (!hasEnoughCards()) {
      setGameState("gameComplete")
      setShowGameSummary(true)
      return
    }
    setPlayerHands([])
    setDealerHand([])
    setGameState("betting")
    setMessage("Place your bet for the next hand!")
    setCurrentBet(0)
    setCustomBetAmount("")
    setBetError("")
    setDealerCardHidden(true)
    setRecommendedMove("")
    setOutcome({ type: null, message: "" })
    setActiveHandIndex(0)
    setCurrentDecision(null)
  }

  const handleDeckSelection = (selectedDecks: number) => {
    setNumDecks(selectedDecks)
    const newShoe = shuffleDeck(createShoe(selectedDecks))

    if (!validateShoeIntegrity(newShoe)) {
      setMessage("CRITICAL ERROR: Deck integrity check failed. Please restart the game.")
      setGameState("deckSelection")
      playSound("error.mp3")
      setDeck([])
      setNumDecks(null)
      return
    }

    setDeck(newShoe)
    setGameState("betting")
    setMessage("Shoe prepared! Place your bet to begin.")
    resetSessionData()
  }

  const addToCount = (card: PlayingCardType) => {
    const countValue = getHiLoValue(card)
    const newRunningCount = runningCount + countValue
    setRunningCount(newRunningCount)
    const countEntry: CountEntry = {
      card: card.value,
      suit: card.suit,
      value: countValue,
      runningCount: newRunningCount,
      timestamp: Date.now(),
    }
    setCountHistory((prev) => [...prev, countEntry])
  }

  const updateGameStatsAndHistory = (
    finalPlayerHands: PlayerHand[],
    finalDealerHand: PlayingCardType[],
    totalBetOnTable: number,
    totalWinningsReturned: number,
  ) => {
    let winsThisRound = 0
    let lossesThisRound = 0
    let pushesThisRound = 0
    let blackjacksThisRound = 0

    finalPlayerHands.forEach((hand) => {
      if (hand.result === "win") winsThisRound++
      else if (hand.result === "lose") lossesThisRound++
      else if (hand.result === "push") pushesThisRound++
      else if (hand.result === "blackjack") {
        blackjacksThisRound++
        winsThisRound++
      }
    })

    let newStreak = currentStreak
    if (winsThisRound > lossesThisRound) {
      newStreak = currentStreak >= 0 ? currentStreak + 1 : 1
    } else if (lossesThisRound > winsThisRound) {
      newStreak = currentStreak <= 0 ? currentStreak - 1 : -1
    }
    setCurrentStreak(newStreak)

    const newStats = {
      ...gameStats,
      handsPlayed: gameStats.handsPlayed + finalPlayerHands.length,
      wins: gameStats.wins + winsThisRound,
      losses: gameStats.losses + lossesThisRound,
      pushes: gameStats.pushes + pushesThisRound,
      blackjacks: gameStats.blackjacks + blackjacksThisRound,
      bestStreak: Math.max(gameStats.bestStreak, newStreak),
      worstStreak: Math.min(gameStats.worstStreak, newStreak),
    }
    setGameStats(newStats)

    const roundNetProfitOrLoss = totalWinningsReturned - totalBetOnTable

    const historyEntry: HandHistoryEntry = {
      handNumber: newStats.handsPlayed,
      playerHand: finalPlayerHands[0].cards,
      dealerHand: finalDealerHand,
      result: finalPlayerHands[0].result || "N/A",
      profitOrLoss: roundNetProfitOrLoss,
      timestamp: Date.now(),
    }
    setHandHistory((prev) => [...prev, historyEntry])
  }

  useEffect(() => {
    if (gameState === "login") {
      setMessage("Welcome! Please log in.")
    }
  }, [gameState])

  const updateDeckPosition = () => {
    if (deckRef.current) {
      const rect = deckRef.current.getBoundingClientRect()
      const gameArea = deckRef.current.closest(".game-area")
      const gameRect = gameArea?.getBoundingClientRect()
      if (gameRect) {
        setDeckPosition({
          x: rect.left - gameRect.left + rect.width / 2,
          y: rect.top - gameRect.top + rect.height / 2,
        })
      }
    }
  }

  useEffect(() => {
    updateDeckPosition()
    window.addEventListener("resize", updateDeckPosition)
    return () => window.removeEventListener("resize", updateDeckPosition)
  }, [showStrategyPanel])

  useEffect(() => {
    if (gameState === "playing" && playerHands.length > 0 && dealerHand.length > 0) {
      const activeHand = playerHands[activeHandIndex]
      if (activeHand && !activeHand.isComplete) {
        const dealerUpCard = dealerHand[1]
        const strategy = getBasicStrategy(activeHand.cards, dealerUpCard)
        setRecommendedMove(strategy)
      }
    }
  }, [playerHands, dealerHand, gameState, activeHandIndex])

  const handleBetSuggestion = (amountToAdd: number) => {
    playSound("bet_chip.mp3")
    setBetError("")
    const currentAmount = Number.parseInt(customBetAmount) || 0
    const newTotal = currentAmount + amountToAdd
    setCustomBetAmount(String(newTotal))
  }

  const handleDeal = async () => {
    const betAmount = Number.parseInt(customBetAmount)

    if (isNaN(betAmount) || betAmount <= 0) {
      setBetError("Please enter a valid bet amount.")
      playSound("error.mp3")
      return
    }
    if (betAmount > playerMoney) {
      setBetError("Bet amount cannot exceed your bankroll.")
      playSound("error.mp3")
      return
    }
    if (!hasEnoughCards()) {
      setMessage("Not enough cards remaining to deal a new hand!")
      setGameState("gameComplete")
      setShowGameSummary(true)
      playSound("error.mp3")
      return
    }

    setBetError("")
    setCurrentBet(betAmount)
    setPlayerMoney((prevMoney) => prevMoney - betAmount)
    playSound("bet_confirm.mp3")

    setIsDealing(true)
    const initialHand: PlayerHand = { cards: [], bet: betAmount, isActive: true, isComplete: false }
    const newDeck = [...deck]
    const newDealerHand: PlayingCardType[] = []

    const dealerCard1 = newDeck.pop()!
    newDealerHand.push(dealerCard1)
    setDealerHand([...newDealerHand])
    playSound("card_deal.mp3")
    await new Promise((resolve) => setTimeout(resolve, 300))

    const playerCard1 = newDeck.pop()!
    initialHand.cards.push(playerCard1)
    setPlayerHands([{ ...initialHand }])
    addToCount(playerCard1)
    playSound("card_deal.mp3")
    await new Promise((resolve) => setTimeout(resolve, 300))

    const dealerCard2 = newDeck.pop()!
    newDealerHand.push(dealerCard2)
    setDealerHand([...newDealerHand])
    addToCount(dealerCard2)
    playSound("card_deal.mp3")
    await new Promise((resolve) => setTimeout(resolve, 300))

    const playerCard2 = newDeck.pop()!
    initialHand.cards.push(playerCard2)
    setPlayerHands([{ ...initialHand }])
    addToCount(playerCard2)
    playSound("card_deal.mp3")
    await new Promise((resolve) => setTimeout(resolve, 300))

    setDeck(newDeck)
    setGameState("playing")
    setMessage("Your turn! Hit or Stand?")
    setIsDealing(false)

    const playerValue = getHandValue(initialHand.cards)
    const dealerValue = getHandValue(newDealerHand)

    if (playerValue === 21 && dealerValue === 21) {
      setDealerCardHidden(false)
      addToCount(dealerCard1)
      setGameState("roundComplete")
      setMessage("Push! Both have Blackjack!")
      setPlayerMoney((prevMoney) => prevMoney + betAmount)
      setOutcome({ type: "push", message: "Push! Both have Blackjack!" })
      playSound("push_neutral.mp3")
      initialHand.result = "push"
      setPlayerHands([{ ...initialHand }])
      updateGameStatsAndHistory([{ ...initialHand }], newDealerHand, betAmount, betAmount)
    } else if (playerValue === 21) {
      setDealerCardHidden(false)
      addToCount(dealerCard1)
      const winnings = betAmount * 2.5
      setPlayerMoney((prevMoney) => prevMoney + winnings)
      setGameState("roundComplete")
      setMessage("Blackjack! You win!")
      setOutcome({ type: "blackjack", message: "Blackjack! You win!" })
      playSound("win_confetti_pop.mp3")
      setTimeout(() => playSound("win_kaching.mp3"), 400)
      initialHand.result = "blackjack"
      setPlayerHands([{ ...initialHand }])
      updateGameStatsAndHistory([{ ...initialHand }], newDealerHand, betAmount, winnings)
    } else if (dealerValue === 21) {
      setDealerCardHidden(false)
      addToCount(dealerCard1)
      setGameState("roundComplete")
      setMessage("Dealer has Blackjack! You lose!")
      setOutcome({ type: "dealer_blackjack", message: "Dealer has Blackjack! You lose!" })
      playSound("lose_sad.mp3")
      initialHand.result = "lose"
      setPlayerHands([{ ...initialHand }])
      updateGameStatsAndHistory([{ ...initialHand }], newDealerHand, betAmount, 0)
    }
  }

  const hit = async () => {
    if (gameState !== "playing") return
    showDecisionFeedback("Hit")
    setIsDealing(true)
    const newDeck = [...deck]
    const card = newDeck.pop()!
    const newPlayerHands = [...playerHands]
    const activeHand = newPlayerHands[activeHandIndex]
    activeHand.cards.push(card)
    setPlayerHands(newPlayerHands)
    addToCount(card)
    playSound("card_deal.mp3")
    await new Promise((resolve) => setTimeout(resolve, 300))
    setDeck(newDeck)
    setIsDealing(false)
    const handValue = getHandValue(activeHand.cards)
    if (handValue > 21) {
      activeHand.isComplete = true
      activeHand.result = "lose"
      setPlayerHands([...newPlayerHands])
      await moveToNextHand()
    } else if (handValue === 21) {
      activeHand.isComplete = true
      setPlayerHands([...newPlayerHands])
      await moveToNextHand()
    }
  }

  const moveToNextHand = async () => {
    const nextHandIndex = activeHandIndex + 1
    if (nextHandIndex < playerHands.length) {
      setActiveHandIndex(nextHandIndex)
      setMessage(`Playing hand ${nextHandIndex + 1}`)
    } else {
      await dealerTurn()
    }
  }

  const stand = async () => {
    if (gameState !== "playing") return
    showDecisionFeedback("Stand")
    const newPlayerHands = [...playerHands]
    const activeHand = newPlayerHands[activeHandIndex]
    activeHand.isComplete = true
    setPlayerHands(newPlayerHands)
    await moveToNextHand()
  }

  const dealerTurn = async () => {
    setGameState("dealerTurn")
    setDealerCardHidden(false)
    setMessage("Dealer's turn...")

    // **REFACTOR**: Always count the hole card as soon as it's revealed.
    if (dealerHand.length > 0 && dealerCardHidden) {
      addToCount(dealerHand[0])
    }

    const newDeck = [...deck]
    const currentDealerHand = [...dealerHand]
    let dealerValue = getHandValue(currentDealerHand)

    // **REFACTOR**: Check if the dealer needs to play.
    // The dealer only hits if there is at least one player hand that has not busted.
    const playerHasStandingHand = playerHands.some((hand) => getHandValue(hand.cards) <= 21)

    if (playerHasStandingHand) {
      while (dealerValue < 17) {
        setIsDealing(true)
        await new Promise((resolve) => setTimeout(resolve, 300))
        const card = newDeck.pop()!
        currentDealerHand.push(card)
        setDealerHand([...currentDealerHand])
        addToCount(card)
        playSound("card_deal.mp3")
        dealerValue = getHandValue(currentDealerHand)
        setIsDealing(false)
      }
    } else {
      setMessage("All players busted. Dealer reveals cards.")
    }

    setDeck(newDeck)

    // --- Finalization logic begins ---
    const finalPlayerHands = [...playerHands]
    let totalWinningsReturned = 0
    let totalBetOnTable = 0
    let winCount = 0
    let loseCount = 0
    let pushCount = 0

    finalPlayerHands.forEach((hand) => {
      totalBetOnTable += hand.bet
      const playerValue = getHandValue(hand.cards)

      if (hand.result === "lose") {
        loseCount++
      } else if (playerValue > 21) {
        hand.result = "lose"
        loseCount++
      } else if (dealerValue > 21) {
        hand.result = "win"
        totalWinningsReturned += hand.bet * 2
        winCount++
      } else if (dealerValue > playerValue) {
        hand.result = "lose"
        loseCount++
      } else if (dealerValue < playerValue) {
        hand.result = "win"
        totalWinningsReturned += hand.bet * 2
        winCount++
      } else {
        hand.result = "push"
        totalWinningsReturned += hand.bet
        pushCount++
      }
    })

    setPlayerHands(finalPlayerHands)
    setPlayerMoney((prevMoney) => prevMoney + totalWinningsReturned)
    setGameState("roundComplete")
    updateGameStatsAndHistory(finalPlayerHands, currentDealerHand, totalBetOnTable, totalWinningsReturned)

    let outcomeMessage = ""
    let outcomeType: "win" | "lose" | "push" | "blackjack" = "lose"
    if (winCount > 0 && loseCount === 0 && pushCount === 0) {
      outcomeMessage = `You win all hands!`
      outcomeType = "win"
      playSound("win_confetti_pop.mp3")
      setTimeout(() => playSound("win_kaching.mp3"), 400)
    } else if (loseCount > 0 && winCount === 0 && pushCount === 0) {
      outcomeMessage = `You lose all hands!`
      outcomeType = "lose"
      playSound("lose_sad.mp3")
    } else if (pushCount > 0 && winCount === 0 && loseCount === 0) {
      outcomeMessage = `All hands push!`
      outcomeType = "push"
      playSound("push_neutral.mp3")
    } else {
      outcomeMessage = `Mixed: ${winCount}W, ${loseCount}L, ${pushCount}P`
      if (winCount > loseCount) {
        outcomeType = "win"
        playSound("win_confetti_pop.mp3")
        setTimeout(() => playSound("win_kaching.mp3"), 400)
      } else if (loseCount > winCount) {
        outcomeType = "lose"
        playSound("lose_sad.mp3")
      } else {
        outcomeType = "push"
        playSound("push_neutral.mp3")
      }
    }

    setMessage(outcomeMessage)
    setOutcome({ type: outcomeType, message: outcomeMessage })
  }

  const split = async () => {
    if (gameState !== "playing" || playerHands.length === 0) return
    const activeHand = playerHands[activeHandIndex]
    if (!canSplit(activeHand.cards) || playerMoney < activeHand.bet) {
      playSound("error.mp3")
      return
    }
    showDecisionFeedback("Split")

    setPlayerMoney((prevMoney) => prevMoney - activeHand.bet)

    setIsDealing(true)
    const newDeck = [...deck]
    const newPlayerHands = [...playerHands]

    const firstHand: PlayerHand = {
      cards: [activeHand.cards[0]],
      bet: activeHand.bet,
      isActive: true,
      isComplete: false,
    }
    const secondHand: PlayerHand = {
      cards: [activeHand.cards[1]],
      bet: activeHand.bet,
      isActive: false,
      isComplete: false,
    }
    newPlayerHands.splice(activeHandIndex, 1, firstHand, secondHand)
    setPlayerHands(newPlayerHands)
    await new Promise((resolve) => setTimeout(resolve, 100))

    const card1 = newDeck.pop()!
    firstHand.cards.push(card1)
    setPlayerHands([...newPlayerHands])
    addToCount(card1)
    playSound("card_deal.mp3")
    await new Promise((resolve) => setTimeout(resolve, 300))

    const card2 = newDeck.pop()!
    secondHand.cards.push(card2)
    setPlayerHands([...newPlayerHands])
    addToCount(card2)
    playSound("card_deal.mp3")
    await new Promise((resolve) => setTimeout(resolve, 300))

    setDeck(newDeck)
    setIsDealing(false)
    setMessage(`Playing hand 1 of ${newPlayerHands.length}`)

    if (getHandValue(firstHand.cards) === 21) {
      firstHand.isComplete = true
    }
  }

  const doubleDown = async () => {
    const activeHand = playerHands[activeHandIndex]
    if (gameState !== "playing" || activeHand.cards.length !== 2 || playerMoney < activeHand.bet) {
      playSound("error.mp3")
      return
    }
    showDecisionFeedback("Double Down")

    setPlayerMoney((prevMoney) => prevMoney - activeHand.bet)
    const newPlayerHands = [...playerHands]
    newPlayerHands[activeHandIndex].bet *= 2
    setPlayerHands(newPlayerHands)

    setIsDealing(true)
    const newDeck = [...deck]
    const card = newDeck.pop()!
    activeHand.cards.push(card)
    setPlayerHands([...newPlayerHands])
    addToCount(card)
    playSound("card_deal.mp3")
    await new Promise((resolve) => setTimeout(resolve, 300))
    setDeck(newDeck)
    setIsDealing(false)

    activeHand.isComplete = true
    if (getHandValue(activeHand.cards) > 21) {
      activeHand.result = "lose"
    }
    setPlayerHands([...newPlayerHands])
    await moveToNextHand()
  }

  const handleFullResetNewGame = () => {
    playSound("menu_click.mp3")
    setShowGameMenu(false)
    setShowGameSummary(false)
    setNumDecks(null)
    if (currentUser) {
      initializeGameSession(true)
    }
    setGameState("deckSelection")
    setMessage("New game started. Choose number of decks.")
  }

  const handleMainMenu = () => {
    playSound("menu_click.mp3")
    setShowGameMenu(false)
    setShowGameSummary(false)
    setCurrentUser(null)
    setNumDecks(null)
    resetSessionData()
    setGameState("login")
    setMessage("Welcome! Please log in.")
  }

  const toggleStrategyPanel = () => {
    playSound("ui_toggle.mp3")
    setShowStrategyPanel(!showStrategyPanel)
  }

  const handleMenuButtonClick = () => {
    playSound("menu_click.mp3")
    setShowGameMenu(true)
  }

  const closeOutcomeAndContinue = () => {
    setOutcome({ type: null, message: "" })
    startNewRound()
  }

  const getCurrentHand = () => playerHands[activeHandIndex] || null
  const canSplitHand = () => {
    const activeHand = getCurrentHand()
    return activeHand && canSplit(activeHand.cards) && playerMoney >= activeHand.bet && playerHands.length < 4
  }

  const decksRemaining = calculateDecksRemaining(deck.length)
  const trueCount = calculateTrueCount(runningCount, decksRemaining)

  const gameOutcomeDisplayMode = "pill"

  if (gameState === "login") {
    return <LoginScreen onLogin={handleLogin} />
  }

  const isDealButtonDisabled = () => {
    const betAmount = Number.parseInt(customBetAmount)
    return isNaN(betAmount) || betAmount <= 0 || betAmount > playerMoney || isDealing || !hasEnoughCards()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-800 p-4 overflow-hidden">
      {gameState === "deckSelection" && <DeckSelection onSelectDecks={handleDeckSelection} />}
      <GameMenu
        isOpen={showGameMenu}
        onClose={() => {
          playSound("menu_close.mp3")
          setShowGameMenu(false)
        }}
        onNewGame={handleFullResetNewGame}
        onMainMenu={handleMainMenu}
        gameState={gameState}
      />
      {showGameSummary && (
        <GameSummary stats={gameStats} onNewGame={handleFullResetNewGame} onMainMenu={handleMainMenu} />
      )}

      <motion.div
        className="w-full max-w-6xl flex"
        layout="position"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <AnimatePresence>
          {showStrategyPanel && gameState !== "deckSelection" && (
            <motion.div
              initial={{ x: -300, opacity: 0, width: 0 }}
              animate={{ x: 0, opacity: 1, width: "16rem" }}
              exit={{ x: -300, opacity: 0, width: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="mr-4 shrink-0 hidden md:block overflow-hidden"
            >
              <StrategyPanel
                playerHand={getCurrentHand()?.cards || []}
                dealerUpCard={dealerHand.length > 0 ? dealerHand[1] : null}
                recommendedMove={recommendedMove}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="flex-grow bg-green-700 rounded-xl shadow-xl p-6 relative game-area min-h-[750px] md:min-h-[800px]"
          layout="position"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {gameState !== "deckSelection" && (
            <>
              <div className="absolute top-4 left-4 z-30">
                <div className="relative">
                  <CardCountDisplay
                    runningCount={runningCount}
                    trueCount={trueCount}
                    decksRemaining={decksRemaining}
                    onClick={() => {
                      playSound("ui_toggle.mp3")
                      setShowCountHistory(!showCountHistory)
                    }}
                    isVisible={showCounter}
                    onToggleVisibility={() => {
                      playSound("ui_toggle.mp3")
                      setShowCounter(!showCounter)
                    }}
                  />
                  <CountHistoryDropdown
                    history={countHistory}
                    isOpen={showCountHistory}
                    onToggle={() => {
                      playSound("ui_toggle.mp3")
                      setShowCountHistory(!showCountHistory)
                    }}
                    runningCount={runningCount}
                  />
                </div>
              </div>
              <div className="absolute top-4 right-4 flex items-center gap-2 z-30">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleMenuButtonClick}
                  className="bg-slate-600 hover:bg-slate-700 text-white w-9 h-9 p-0"
                  title="Game Menu"
                >
                  <MenuIcon className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleStrategyPanel}
                  className="bg-blue-600 hover:bg-blue-700 text-white hidden md:inline-flex"
                >
                  <BookOpen className="mr-1 h-4 w-4" /> {showStrategyPanel ? "Hide" : "Show"} Strategy
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleStrategyPanel}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-9 h-9 p-0 md:hidden"
                  title="Toggle Strategy Panel"
                >
                  <BookOpen className="h-5 w-5" />
                </Button>
                <Badge
                  variant="outline"
                  className="bg-yellow-500 text-black font-bold px-3 py-1 text-sm md:text-lg flex items-center"
                >
                  <Coins className="mr-1 h-4 w-4" />${playerMoney}
                </Badge>
              </div>
            </>
          )}

          {gameState !== "deckSelection" && (
            <div className="absolute top-1/2 right-2 md:right-4 transform -translate-y-1/2 z-20">
              <EquityChartPanel history={handHistory} />
            </div>
          )}

          {gameState === "playing" && (
            <DecisionFeedback decision={currentDecision} onComplete={clearDecisionFeedback} />
          )}

          <h1 className="text-2xl md:text-3xl font-bold text-center text-white mb-1 md:mb-2 mt-0 pt-0">Blackjack</h1>
          {currentUser && (
            <p className="text-center text-green-200 text-xs md:text-sm mb-1 md:mb-2">Player: {currentUser}</p>
          )}

          {gameState !== "deckSelection" && gameStats.handsPlayed > 0 && (
            <div className="text-center mb-1 md:mb-2">
              <div className="flex justify-center gap-1 md:gap-2 flex-wrap text-xs">
                <Badge variant="secondary">Hands: {gameStats.handsPlayed}</Badge>
                <Badge variant="secondary" className="bg-green-200 text-green-800">
                  Wins: {gameStats.wins}
                </Badge>
                <Badge variant="secondary" className="bg-red-200 text-red-800">
                  Losses: {gameStats.losses}
                </Badge>
                <Badge variant="secondary" className="bg-slate-200 text-slate-800">
                  Pushes: {gameStats.pushes}
                </Badge>
                {currentStreak !== 0 && (
                  <Badge
                    variant="secondary"
                    className={`${currentStreak > 0 ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}
                  >
                    Streak: {currentStreak > 0 ? `+${currentStreak}` : currentStreak}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {gameState !== "deckSelection" && numDecks && (
            <div className="text-center mb-1 md:mb-2">
              <Badge variant="outline" className="bg-blue-600 text-white text-xs">
                {numDecks === 2 ? "Double Deck" : `${numDecks} Deck Shoe`}
              </Badge>
              {!hasEnoughCards() && gameState === "betting" && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  Low Cards Warning!
                </Badge>
              )}
            </div>
          )}

          {gameState !== "deckSelection" && (
            <motion.div
              className="bg-black/30 rounded-lg p-2 mb-2 md:mb-4 text-center min-h-[30px] md:min-h-[40px] flex items-center justify-center"
              layout="position"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <p className="text-white text-sm md:text-base">{message}</p>
            </motion.div>
          )}

          {gameState !== "deckSelection" && (
            <motion.div
              className="mb-2 md:mb-4"
              layout="position"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <h2 className="text-base md:text-lg font-semibold text-white mb-1 text-center">
                Dealer: {!dealerCardHidden && getHandValue(dealerHand)}
              </h2>
              <div className="flex flex-wrap gap-1 md:gap-2 justify-center h-28 md:h-32 relative">
                <AnimatePresence>
                  {dealerHand.map((card, index) => (
                    <motion.div
                      key={`dealer-${index}`}
                      initial={{
                        scale: 0.5,
                        x: deckPosition.x - 100,
                        y: deckPosition.y - 200,
                        rotateY: 180,
                        opacity: 0,
                      }}
                      animate={{ scale: 1, x: 0, y: 0, rotateY: 0, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20, duration: 0.3 }}
                      layout
                    >
                      <PlayingCard
                        card={index === 0 && dealerCardHidden ? null : card}
                        hidden={index === 0 && dealerCardHidden}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {gameState !== "deckSelection" && (
            <motion.div
              className="mb-2 md:mb-4"
              layout="position"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <h2 className="text-base md:text-lg font-semibold text-white mb-1 text-center">
                Your Hand{playerHands.length > 1 ? "s" : ""}:
              </h2>
              <div className="space-y-1 md:space-y-2">
                {playerHands.map((hand, handIndex) => (
                  <motion.div
                    key={`hand-${handIndex}`}
                    className={`relative ${handIndex === activeHandIndex && gameState === "playing" ? "ring-2 ring-yellow-400 rounded-lg p-0.5 md:p-1" : ""}`}
                    layout
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <div className="flex items-center justify-center mb-0.5 md:mb-1 text-xs">
                      <span className="text-white font-semibold">
                        Hand {handIndex + 1}: {getHandValue(hand.cards)}
                        {hand.result && (
                          <span
                            className={`ml-1 md:ml-2 px-1 py-0.5 rounded text-xs ${hand.result === "win" || hand.result === "blackjack" ? "bg-green-600" : hand.result === "lose" ? "bg-red-600" : "bg-blue-600"}`}
                          >
                            {hand.result.toUpperCase()}
                          </span>
                        )}
                      </span>
                      <Badge variant="outline" className="ml-1 md:ml-2 bg-yellow-500 text-black text-xs px-1.5 py-0.5">
                        ${hand.bet}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 md:gap-2 justify-center h-28 md:h-32 relative">
                      <AnimatePresence>
                        {hand.cards.map((card, cardIndex) => (
                          <motion.div
                            key={`player-${handIndex}-${cardIndex}`}
                            initial={{
                              scale: 0.5,
                              x: deckPosition.x - 100,
                              y: deckPosition.y - 300,
                              rotateY: 180,
                              opacity: 0,
                            }}
                            animate={{ scale: 1, x: 0, y: 0, rotateY: 0, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20, duration: 0.3 }}
                            layout
                          >
                            <PlayingCard card={card} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {gameState !== "deckSelection" && (
            <motion.div
              className="flex flex-col items-center justify-center gap-1 md:gap-2 mb-1 md:mb-2"
              layout="position"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {gameState === "betting" && (
                <div className="flex flex-col items-center gap-1 md:gap-2 w-full max-w-xs">
                  <div className="flex items-center gap-1 md:gap-2 w-full">
                    <Input
                      type="number"
                      placeholder="Enter bet"
                      value={customBetAmount}
                      onChange={(e) => {
                        setCustomBetAmount(e.target.value)
                        setBetError("")
                      }}
                      className="bg-white/10 text-white border-green-500 focus:border-yellow-500 placeholder:text-green-300 flex-grow text-sm md:text-base"
                    />
                  </div>
                  {betError && <p className="text-xs text-red-400">{betError}</p>}

                  <div className="flex gap-1 md:gap-2 mt-1">
                    {BET_SUGGESTIONS.map((amount) => (
                      <Button
                        key={amount}
                        onClick={() => handleBetSuggestion(amount)}
                        variant="outline"
                        className="bg-yellow-500 text-black font-bold px-2 py-1 md:px-3 md:py-1.5 text-xs md:text-sm rounded-md hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-300"
                      >
                        ${amount}
                      </Button>
                    ))}
                    <Button
                      onClick={() => {
                        playSound("ui_clear.mp3")
                        setCustomBetAmount("")
                        setBetError("")
                      }}
                      variant="outline"
                      className="bg-slate-500 text-white font-bold px-2 py-1 md:px-3 md:py-1.5 text-xs md:text-sm rounded-md hover:bg-slate-600 focus:ring-2 focus:ring-slate-300"
                    >
                      Clear
                    </Button>
                  </div>

                  <Button
                    onClick={handleDeal}
                    disabled={isDealButtonDisabled()}
                    className="bg-green-600 hover:bg-green-700 w-full mt-1 text-sm md:text-base px-3 py-1.5 md:px-4 md:py-2"
                  >
                    Deal
                  </Button>
                </div>
              )}

              {gameState === "playing" && (
                <div className="flex flex-wrap justify-center gap-1 md:gap-2">
                  <Button
                    onClick={hit}
                    disabled={isDealing}
                    className="bg-red-600 hover:bg-red-700 text-sm md:text-base px-3 py-1.5 md:px-4 md:py-2"
                  >
                    <Hand className="mr-1 h-3 w-3 md:h-4 md:w-4" /> Hit
                  </Button>
                  <Button
                    onClick={stand}
                    disabled={isDealing}
                    className="bg-blue-600 hover:bg-blue-700 text-sm md:text-base px-3 py-1.5 md:px-4 md:py-2"
                  >
                    <Square className="mr-1 h-3 w-3 md:h-4 md:w-4" /> Stand
                  </Button>
                  <Button
                    onClick={doubleDown}
                    disabled={
                      getCurrentHand()?.cards.length !== 2 || playerMoney < (getCurrentHand()?.bet || 0) || isDealing
                    }
                    className="bg-purple-600 hover:bg-purple-700 text-sm md:text-base px-3 py-1.5 md:px-4 md:py-2"
                  >
                    <ChevronsDown className="mr-1 h-3 w-3 md:h-4 md:w-4" /> Double
                  </Button>
                  <Button
                    onClick={split}
                    disabled={!canSplitHand() || isDealing}
                    className="bg-orange-600 hover:bg-orange-700 text-sm md:text-base px-3 py-1.5 md:px-4 md:py-2"
                  >
                    <Split className="mr-1 h-3 w-3 md:h-4 md:w-4" /> Split
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {gameState !== "deckSelection" && (
            <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2 z-20">
              <motion.div ref={deckRef} layout="position" transition={{ type: "spring", stiffness: 300, damping: 30 }}>
                <CardDeck cardsRemaining={deck.length} />
              </motion.div>
            </div>
          )}
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {outcome.type && gameState === "roundComplete" && (
          <GameOutcome outcome={outcome} onClose={closeOutcomeAndContinue} displayMode={gameOutcomeDisplayMode} />
        )}
      </AnimatePresence>
    </div>
  )
}
 */