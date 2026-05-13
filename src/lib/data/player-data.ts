import type { HandHistoryEntry } from "../utils/blackjack-utils"

const STORAGE_KEY_PREFIX = "blackjack_player_"

export interface PlayerData {
  username: string
  money: number
  stats: {
    handsPlayed: number
    wins: number
    losses: number
    pushes: number
    blackjacks: number
    bestStreak: number
    worstStreak: number
    startingMoney: number,
  endingMoney: number,
  }
  handHistory: HandHistoryEntry[] // Add hand history for persistence
}

export function savePlayerData(username: string, data: PlayerData): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${username}`, JSON.stringify(data))
  }
}

export function loadPlayerData(username: string): PlayerData | null {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}${username}`)
    return data ? JSON.parse(data) : null
  }
  return null
}

export function checkUsernameExists(username: string): boolean {
  if (typeof window !== "undefined") {
    return localStorage.getItem(`${STORAGE_KEY_PREFIX}${username}`) !== null
  }
  return false
}
