"use client"

import { Card } from "@/components/ui/card"
import { motion, useAnimationControls } from "framer-motion"
import { useEffect, useMemo } from "react"

export interface PlayingCard {
  suit: "hearts" | "diamonds" | "clubs" | "spades"
  value: string
}

interface PlayingCardProps {
  card: PlayingCard | null
  hidden?: boolean
  rotated?: boolean
  size?: "sm" | "md" | "lg"
}

export default function PlayingCard({
  card,
  hidden = false,
  rotated = false,
  size = "md",
}: PlayingCardProps) {
  const controls = useAnimationControls()

  // Disable heavy animation on mobile (performance fix)
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640

  useEffect(() => {
    if (isMobile) return

    controls.start({
      y: [0, -2, 0],
      rotateZ: [0, 0.5, 0],
      transition: {
        duration: 8,
        ease: "easeInOut",
        repeat: Number.POSITIVE_INFINITY,
      },
    })
  }, [controls, isMobile])

  const sizeClass = useMemo(() => {
    switch (size) {
      case "sm":
        return "w-10 h-14 sm:w-14 sm:h-20"
      case "lg":
        return "w-16 h-24 sm:w-24 sm:h-36"
      default:
        return "w-12 h-16 sm:w-20 sm:h-28"
    }
  }, [size])

  const baseMotionProps = {
    whileHover: isMobile ? {} : { scale: 1.05 },
    whileTap: { scale: 0.97 },
    animate: controls,
    style: {
      transformStyle: "preserve-3d",
      filter: "drop-shadow(-2px 2px 3px rgba(0,0,0,0.4))",
    },
    className: rotated ? "rotate-90" : "",
  }

  // CARD BACK
  if (hidden || !card) {
    return (
      <div className={rotated ? "rotate-90" : ""} style={{ filter: "drop-shadow(-2px 2px 3px rgba(0,0,0,0.4))" }}>
      <motion.div {...baseMotionProps} style={{ transformStyle: "preserve-3d" }}>
        <Card
          className={`${sizeClass} flex items-center justify-center bg-blue-800 border border-white/70`}
        >
          <div className="w-[80%] h-[85%] bg-white/10 rounded-sm flex items-center justify-center">
            <div className="w-[70%] h-[70%] bg-blue-600 rounded-sm flex items-center justify-center">
              <div className="text-white font-bold text-xs">♠♥♦♣</div>
            </div>
          </div>
        </Card>
      </motion.div>
      </div>
    )
  }

  const isRed = card.suit === "hearts" || card.suit === "diamonds"
  const textColor = isRed ? "text-red-600" : "text-black"

  const suitSymbol = {
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
    spades: "♠",
  }[card.suit]

  return (
    <div className={rotated ? "rotate-90" : ""} style={{ filter: "drop-shadow(-2px 2px 3px rgba(0,0,0,0.4))" }}>
    <motion.div {...baseMotionProps} style={{ transformStyle: "preserve-3d" }}>
      <Card
        className={`${sizeClass} bg-white flex flex-col p-1 sm:p-2 relative`}
      >
        {/* Top left */}
        <div className={`text-[10px] sm:text-xs font-bold ${textColor}`}>
          {card.value}
        </div>
        <div className={`text-[10px] sm:text-xs ${textColor}`}>
          {suitSymbol}
        </div>

        {/* Center suit */}
        <div className={`flex-1 flex items-center justify-center text-lg sm:text-2xl ${textColor}`}>
          {suitSymbol}
        </div>

        {/* Bottom right (rotated) */}
        <div className="absolute bottom-1 right-1 rotate-180 text-[10px] sm:text-xs font-bold">
          <span className={textColor}>{card.value}</span>
        </div>
      </Card>
    </motion.div>
    </div>
  )
}

// "use client"

// import { Card } from "@/components/ui/card"
// import { motion, useAnimationControls } from "framer-motion"
// import { useEffect } from "react"

// export interface PlayingCard {
//   suit: "hearts" | "diamonds" | "clubs" | "spades"
//   value: string
// }

// interface PlayingCardProps {
//   card: PlayingCard | null
//   hidden?: boolean
//   rotated?: boolean
// }

// export default function PlayingCard({ card, hidden = false, rotated = false }: PlayingCardProps) {
//   const controls = useAnimationControls()

//   // Set up the ambient floating animation
//   useEffect(() => {
//     controls.start({
//       x: [0, 4, 0, -4, 0],
//       y: [0, -3, 0, -3, 0],
//       rotateX: [0, 2, 0, -2, 0],
//       rotateY: [0, -1, 0, 1, 0],
//       rotateZ: [0, 1, 0, -1, 0],
//       transition: {
//         duration: 6,
//         ease: "easeInOut",
//         times: [0, 0.25, 0.5, 0.75, 1],
//         repeat: Number.POSITIVE_INFINITY,
//         repeatType: "loop",
//       },
//     })
//   }, [controls])

//   // Card back design
//   if (hidden || !card) {
//     return (
//       <motion.div
//         whileHover={{ scale: 1.05 }}
//         whileTap={{ scale: 0.95 }}
//         animate={controls}
//         style={{
//           filter: "drop-shadow(-4px 4px 4px rgba(0, 0, 0, 0.5))",
//           transformStyle: "preserve-3d",
//           perspective: "1000px",
//         }}
//         className={rotated ? "rotate-90" : ""}
//       >
//         <Card className="w-20 h-28 flex items-center justify-center bg-blue-800 border-2 border-white">
//           <div className="w-16 h-24 bg-white/10 rounded-sm flex items-center justify-center">
//             <div className="w-10 h-16 bg-blue-600 rounded-sm flex items-center justify-center">
//               <div className="text-white font-bold">♠♥♦♣</div>
//             </div>
//           </div>
//         </Card>
//       </motion.div>
//     )
//   }

//   // Card colors
//   const isRed = card.suit === "hearts" || card.suit === "diamonds"
//   const textColor = isRed ? "text-red-600" : "text-black"

//   // Suit symbols
//   const suitSymbol = {
//     hearts: "♥",
//     diamonds: "♦",
//     clubs: "♣",
//     spades: "♠",
//   }[card.suit]

//   return (
//     <motion.div
//       whileHover={{ scale: 1.05 }}
//       whileTap={{ scale: 0.95 }}
//       animate={controls}
//       style={{
//         filter: "drop-shadow(-4px 4px 4px rgba(0, 0, 0, 0.5))",
//         transformStyle: "preserve-3d",
//         perspective: "1000px",
//       }}
//       className={rotated ? "rotate-90" : ""}
//     >
//       <Card className="w-20 h-28 flex p-1 bg-white flex-col">
//         <div className={`text-xs font-bold ${textColor} self-start`}>{card.value}</div>
//         <div className={`text-xs ${textColor} self-start`}>{suitSymbol}</div>
//         <div className={`text-2xl ${textColor} grow flex items-center justify-center font-bold`}>{suitSymbol}</div>
//         <div className={`text-xs font-bold ${textColor} self-end rotate-180`}>{card.value}</div>
//         <div className={`text-xs ${textColor} self-end rotate-180`}>{suitSymbol}</div>
//       </Card>
//     </motion.div>
//   )
// }
