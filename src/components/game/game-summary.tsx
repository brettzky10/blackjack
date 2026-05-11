"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Trophy, TrendingUp, TrendingDown, Minus, Home, RotateCcw } from "lucide-react"

interface GameStats {
  handsPlayed: number
  wins: number
  losses: number
  pushes: number
  blackjacks: number
  startingMoney: number
  endingMoney: number
  bestStreak: number
  worstStreak: number
}

interface GameSummaryProps {
  stats: GameStats
  onNewGame: () => void
  onMainMenu: () => void
}

export default function GameSummary({ stats, onNewGame, onMainMenu }: GameSummaryProps) {
  const netProfit = stats.endingMoney - stats.startingMoney
  const winRate = stats.handsPlayed > 0 ? ((stats.wins / stats.handsPlayed) * 100).toFixed(1) : "0"

  const getResultIcon = (result: "win" | "lose" | "neutral") => {
    switch (result) {
      case "win":
        return <TrendingUp className="h-5 w-5 text-green-400" />
      case "lose":
        return <TrendingDown className="h-5 w-5 text-red-400" />
      default:
        return <Minus className="h-5 w-5 text-gray-400" />
    }
  }

  const getNetProfitResult = () => {
    if (netProfit > 0) return "win"
    if (netProfit < 0) return "lose"
    return "neutral"
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    >
      <Card className="w-full max-w-2xl bg-green-700 text-white border-2 border-yellow-500">
        <CardHeader className="bg-green-800 text-center">
          <div className="flex items-center justify-center mb-2">
            <Trophy className="h-8 w-8 text-yellow-500 mr-2" />
            <CardTitle className="text-2xl">Game Complete!</CardTitle>
          </div>
          <p className="text-green-200">The deck has been depleted</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Game Statistics */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b border-green-600 pb-2">Game Statistics</h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Hands Played:</span>
                  <Badge variant="outline" className="bg-blue-600 text-white">
                    {stats.handsPlayed}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span>Win Rate:</span>
                  <Badge variant="outline" className="bg-blue-600 text-white">
                    {winRate}%
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span>Wins:</span>
                  <Badge variant="outline" className="bg-green-600 text-white">
                    {stats.wins}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span>Losses:</span>
                  <Badge variant="outline" className="bg-red-600 text-white">
                    {stats.losses}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span>Pushes:</span>
                  <Badge variant="outline" className="bg-gray-600 text-white">
                    {stats.pushes}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span>Blackjacks:</span>
                  <Badge variant="outline" className="bg-yellow-600 text-white">
                    {stats.blackjacks}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b border-green-600 pb-2">Financial Summary</h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Starting Money:</span>
                  <Badge variant="outline" className="bg-blue-600 text-white">
                    ${stats.startingMoney}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span>Ending Money:</span>
                  <Badge variant="outline" className="bg-blue-600 text-white">
                    ${stats.endingMoney}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span>Net Profit/Loss:</span>
                  <div className="flex items-center">
                    {getResultIcon(getNetProfitResult())}
                    <Badge
                      variant="outline"
                      className={`ml-2 ${
                        netProfit > 0 ? "bg-green-600" : netProfit < 0 ? "bg-red-600" : "bg-gray-600"
                      } text-white`}
                    >
                      {netProfit > 0 ? "+" : ""}${netProfit}
                    </Badge>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span>Best Streak:</span>
                  <Badge variant="outline" className="bg-green-600 text-white">
                    {stats.bestStreak} wins
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span>Worst Streak:</span>
                  <Badge variant="outline" className="bg-red-600 text-white">
                    {Math.abs(stats.worstStreak)} losses
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-green-600">
            <Button onClick={onNewGame} className="flex-1 bg-purple-600 hover:bg-purple-700">
              <RotateCcw className="mr-2 h-4 w-4" />
              Play Again
            </Button>
            <Button onClick={onMainMenu} className="flex-1 bg-blue-600 hover:bg-blue-700">
              <Home className="mr-2 h-4 w-4" />
              Main Menu
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
