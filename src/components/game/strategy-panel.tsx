import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getHandInfo, canSplit, 
//    getCardValue 
} from "@/lib/utils/blackjack-utils"
import type { Card as CardType } from "@/lib/utils/blackjack-utils"

interface StrategyPanelProps {
  playerHand: CardType[]
  dealerUpCard: CardType | null
  recommendedMove: string
}

export default function StrategyPanel({ playerHand, dealerUpCard, recommendedMove }: StrategyPanelProps) {
  const playerInfo =
    playerHand.length > 0 ? getHandInfo(playerHand) : { display: "0", value: 0, isBust: false, isSoft: false }
  //const dealerValue = dealerUpCard ? getCardValue(dealerUpCard) : 0

  // Determine if player has a soft hand (contains an Ace counted as 11)
  //const hasSoftHand = playerInfo.isSoft

  // Determine if player has a pair
  const hasPair = canSplit(playerHand)

  // Get hand type description
  const getHandType = () => {
    if (hasPair) return "Pair"
    if (playerInfo.isSoft) return "Soft Hand"
    return "Hard Hand"
  }

  return (
    <Card className="h-full bg-slate-800 text-white">
      <CardHeader className="bg-slate-900 rounded-t-lg">
        <CardTitle className="text-center">Basic Strategy</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-300">Your Hand</h3>
            <p className="text-lg font-bold">
              {playerInfo.display} ({getHandType()})
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-300">Dealer&apos;s Up Card</h3>
            <p className="text-lg font-bold">{dealerUpCard ? dealerUpCard.value : "-"}</p>
          </div>

          <div className="pt-4 border-t border-slate-700">
            <h3 className="text-sm font-semibold text-slate-300">Recommended Move</h3>
            <div className="mt-2 p-3 bg-slate-700 rounded-lg">
              <p className="text-xl font-bold text-center">{recommendedMove || "-"}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Basic Strategy Tips</h3>
            <ul className="text-sm space-y-2">
              <li>• Always hit hard 8 or less</li>
              <li>• Always stand on hard 17 or more</li>
              <li>• Double down on 11 when dealer has 10 or less</li>
              <li>• Always split Aces and 8s</li>
              <li>• Never split 10s or 5s</li>
              <li>• Split pairs when strategy recommends</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
