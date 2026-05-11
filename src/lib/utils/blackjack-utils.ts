export interface Card {
  suit: "hearts" | "diamonds" | "clubs" | "spades"
  value: string
}

export interface CountEntry {
  card: string
  suit: string
  value: number
  runningCount: number
  timestamp: number
}

// New interface for detailed hand history
export interface HandHistoryEntry {
  handNumber: number
  playerHand: Card[]
  dealerHand: Card[]
  result: string
  profitOrLoss: number
  timestamp: number
}

// Create a standard deck of 52 cards
export function createDeck(): Card[] {
  const suits: Card["suit"][] = ["hearts", "diamonds", "clubs", "spades"]
  const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
  const deck: Card[] = []

  for (const suit of suits) {
    for (const value of values) {
      deck.push({ suit, value })
    }
  }

  return deck
}

// Create multiple decks for shoe games
export function createShoe(numDecks: number): Card[] {
  const shoe: Card[] = []
  for (let i = 0; i < numDecks; i++) {
    shoe.push(...createDeck())
  }
  return shoe
}

// Shuffle the deck using Fisher-Yates algorithm
export function shuffleDeck(deck: Card[]): Card[] {
  const newDeck = [...deck]
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]]
  }
  return newDeck
}

// Get the numerical value of a card
export function getCardValue(card: Card): number {
  if (["J", "Q", "K"].includes(card.value)) {
    return 10
  } else if (card.value === "A") {
    return 11 // Ace is initially 11, but can be 1 if needed
  } else {
    return Number.parseInt(card.value)
  }
}

// Get the Hi-Lo count value of a card
export function getHiLoValue(card: Card): number {
  const value = card.value

  // Low cards (2-6): +1
  if (["2", "3", "4", "5", "6"].includes(value)) {
    return 1
  }

  // Neutral cards (7-9): 0
  if (["7", "8", "9"].includes(value)) {
    return 0
  }

  // High cards (10, J, Q, K, A): -1
  if (["10", "J", "Q", "K", "A"].includes(value)) {
    return -1
  }

  return 0
}

// Calculate the value of a hand, accounting for aces
export function getHandValue(hand: Card[]): number {
  let value = 0
  let aces = 0

  // Sum up all cards
  for (const card of hand) {
    const cardValue = getCardValue(card)
    value += cardValue

    // Count aces
    if (card.value === "A") {
      aces++
    }
  }

  // Adjust for aces if needed
  while (value > 21 && aces > 0) {
    value -= 10 // Convert an ace from 11 to 1
    aces--
  }

  return value
}

// New function to get detailed hand information for display
export function getHandInfo(hand: Card[]): { display: string; value: number; isBust: boolean; isSoft: boolean } {
  if (!hand || hand.length === 0) {
    return { display: "0", value: 0, isBust: false, isSoft: false }
  }

  let valueWithoutAces = 0
  let aceCount = 0
  for (const card of hand) {
    if (card.value === "A") {
      aceCount++
    } else {
      valueWithoutAces += getCardValue(card)
    }
  }

  if (aceCount === 0) {
    const total = valueWithoutAces
    return { display: `${total}`, value: total, isBust: total > 21, isSoft: false }
  }

  const hardTotal = valueWithoutAces + aceCount
  const softTotal = valueWithoutAces + 11 + (aceCount - 1)

  if (softTotal <= 21) {
    // This is a soft hand, display both totals
    return { display: `${softTotal} / ${hardTotal}`, value: softTotal, isBust: false, isSoft: true }
  } else {
    // The soft total would bust, so we must use the hard total
    return { display: `${hardTotal}`, value: hardTotal, isBust: hardTotal > 21, isSoft: false }
  }
}

// Calculate true count
export function calculateTrueCount(runningCount: number, decksRemaining: number): number {
  if (decksRemaining <= 0) return 0
  return runningCount / decksRemaining
}

// Calculate decks remaining
export function calculateDecksRemaining(cardsRemaining: number): number {
  return cardsRemaining / 52
}

// Determine if player has a soft hand (contains an Ace counted as 11)
export function hasSoftHand(hand: Card[]): boolean {
  let value = 0
  let aces = 0

  // Count non-ace cards first
  for (const card of hand) {
    if (card.value !== "A") {
      value += getCardValue(card)
    } else {
      aces++
    }
  }

  // If adding an ace as 11 doesn't bust, it's a soft hand
  return aces > 0 && value + 11 <= 21
}

// Determine if player has a pair
export function hasPair(hand: Card[]): boolean {
  return hand.length === 2 && (hand[0].value === hand[1].value || (isValueTen(hand[0]) && isValueTen(hand[1])))
}

// Check if player can split their hand
export function canSplit(hand: Card[]): boolean {
  return hasPair(hand)
}

// Check if card has a value of 10 (10, J, Q, K)
function isValueTen(card: Card): boolean {
  return card.value === "10" || card.value === "J" || card.value === "Q" || card.value === "K"
}

// Get basic strategy recommendation
export function getBasicStrategy(playerHand: Card[], dealerUpCard: Card): string {
  const playerValue = getHandValue(playerHand)
  const dealerValue = getCardValue(dealerUpCard)
  const isSoft = hasSoftHand(playerHand)
  const isPair = hasPair(playerHand)

  // Handle pairs (split strategy)
  if (isPair && playerHand.length === 2) {
    const pairValue = getCardValue(playerHand[0])

    // Always split Aces and 8s
    if (pairValue === 11 || pairValue === 8) return "Split"

    // Never split 10s, 5s
    if (pairValue === 10 || pairValue === 5) {
      if (pairValue === 10) return "Stand"
      // For 5s, treat as hard 10
      if (dealerValue >= 2 && dealerValue <= 9) return "Double Down"
      return "Hit"
    }

    // Split 9s against 2-6, 8-9
    if (pairValue === 9) {
      if (dealerValue >= 2 && dealerValue <= 6) return "Split"
      if (dealerValue === 8 || dealerValue === 9) return "Split"
      return "Stand"
    }

    // Split 7s against 2-7
    if (pairValue === 7) {
      if (dealerValue >= 2 && dealerValue <= 7) return "Split"
      return "Hit"
    }

    // Split 6s against 2-6
    if (pairValue === 6) {
      if (dealerValue >= 2 && dealerValue <= 6) return "Split"
      return "Hit"
    }

    // Split 4s against 5-6 (some prefer to hit)
    if (pairValue === 4) {
      if (dealerValue === 5 || dealerValue === 6) return "Split"
      return "Hit"
    }

    // Split 2s and 3s against 2-7
    if (pairValue === 2 || pairValue === 3) {
      if (dealerValue >= 2 && dealerValue <= 7) return "Split"
      return "Hit"
    }
  }

  // Handle soft hands (A + something)
  if (isSoft) {
    // Soft 20 (A,9) - always stand
    if (playerValue === 20) return "Stand"

    // Soft 19 (A,8) - stand, double vs 6
    if (playerValue === 19) {
      if (dealerValue === 6 && playerHand.length === 2) return "Double Down"
      return "Stand"
    }

    // Soft 18 (A,7) - double vs 2-6, stand vs 7-8, hit vs 9-A
    if (playerValue === 18) {
      if (dealerValue >= 2 && dealerValue <= 6 && playerHand.length === 2) return "Double Down"
      if (dealerValue === 7 || dealerValue === 8) return "Stand"
      return "Hit"
    }

    // Soft 17 (A,6) - double vs 3-6, hit otherwise
    if (playerValue === 17) {
      if (dealerValue >= 3 && dealerValue <= 6 && playerHand.length === 2) return "Double Down"
      return "Hit"
    }

    // Soft 16 (A,5) - double vs 4-6, hit otherwise
    if (playerValue === 16) {
      if (dealerValue >= 4 && dealerValue <= 6 && playerHand.length === 2) return "Double Down"
      return "Hit"
    }

    // Soft 15 (A,4) - double vs 4-6, hit otherwise
    if (playerValue === 15) {
      if (dealerValue >= 4 && dealerValue <= 6 && playerHand.length === 2) return "Double Down"
      return "Hit"
    }

    // Soft 14 (A,3) - double vs 5-6, hit otherwise
    if (playerValue === 14) {
      if (dealerValue === 5 || (dealerValue === 6 && playerHand.length === 2)) return "Double Down"
      return "Hit"
    }

    // Soft 13 (A,2) - double vs 5-6, hit otherwise
    if (playerValue === 13) {
      if (dealerValue === 5 || (dealerValue === 6 && playerHand.length === 2)) return "Double Down"
      return "Hit"
    }
  }

  // Handle hard hands

  // 17+ always stand
  if (playerValue >= 17) return "Stand"

  // 16 stand against dealer 2-6, hit against 7-A
  if (playerValue === 16) {
    if (dealerValue >= 2 && dealerValue <= 6) return "Stand"
    return "Hit"
  }

  // 15 stand against dealer 2-6, hit against 7-A
  if (playerValue === 15) {
    if (dealerValue >= 2 && dealerValue <= 6) return "Stand"
    return "Hit"
  }

  // 14 stand against dealer 2-6, hit against 7-A
  if (playerValue === 14) {
    if (dealerValue >= 2 && dealerValue <= 6) return "Stand"
    return "Hit"
  }

  // 13 stand against dealer 2-6, hit against 7-A
  if (playerValue === 13) {
    if (dealerValue >= 2 && dealerValue <= 6) return "Stand"
    return "Hit"
  }

  // 12 stand against dealer 4-6, hit against 2-3, 7-A
  if (playerValue === 12) {
    if (dealerValue >= 4 && dealerValue <= 6) return "Stand"
    return "Hit"
  }

  // 11 always double down (if 2 cards)
  if (playerValue === 11) {
    if (playerHand.length === 2) return "Double Down"
    return "Hit"
  }

  // 10 double down against dealer 2-9, hit against 10-A (if 2 cards)
  if (playerValue === 10) {
    if (dealerValue >= 2 && dealerValue <= 9 && playerHand.length === 2) return "Double Down"
    return "Hit"
  }

  // 9 double down against dealer 3-6, hit otherwise (if 2 cards)
  if (playerValue === 9) {
    if (dealerValue >= 3 && dealerValue <= 6 && playerHand.length === 2) return "Double Down"
    return "Hit"
  }

  // 8 or less always hit
  return "Hit"
}
