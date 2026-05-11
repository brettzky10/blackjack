"use client"

import type React from "react"

interface BlackjackTableProps {
  children: React.ReactNode
}

const CurvedText = ({
  text,
  arc,
  radius,
  className,
}: { text: string; arc: number; radius: number; className?: string }) => {
  const characters = text.split("")
  const degree = arc / characters.length

  return (
    <div className="relative w-full h-full flex justify-center items-center pointer-events-none">
      {characters.map((char, i) => (
        <span
          key={i}
          className={`absolute h-full origin-bottom ${className}`}
          style={{
            transform: `rotate(${i * degree - arc / 2}deg)`,
            transformOrigin: `0 ${radius}px`,
            height: `${radius}px`,
          }}
        >
          {char}
        </span>
      ))}
    </div>
  )
}

export default function BlackjackTable({ children }: BlackjackTableProps) {
  return (
    <div className="relative w-full aspect-[16/10] max-w-7xl mx-auto">
      {/* Outer table structure */}
      <div className="absolute inset-0 bg-amber-900 rounded-t-[50%] shadow-2xl" />
      <div className="absolute inset-x-[2%] inset-y-[2%] bg-green-800 rounded-t-[50%]" />

      {/* Felt playing surface */}
      <div className="absolute inset-x-[4%] inset-y-[4%] bg-green-700 rounded-t-[50%] border-4 border-green-900/50 shadow-inner">
        {/* Casino Text */}
        <div className="absolute top-[25%] left-1/2 -translate-x-1/2 w-[60%] h-[30%] text-center">
          <CurvedText
            text="BLACKJACK PAYS 3 TO 2"
            arc={60}
            radius={250}
            className="text-yellow-300/80 font-bold text-sm md:text-lg uppercase tracking-widest"
          />
        </div>
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 w-[85%] h-[40%] text-center">
          <CurvedText
            text="DEALER MUST HIT ON SOFT 17 • INSURANCE PAYS 2 TO 1"
            arc={80}
            radius={320}
            className="text-white/80 font-semibold text-xs md:text-base"
          />
        </div>
      </div>

      {/* Content passed to the table (dealer, player hands, etc.) */}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  )
}
