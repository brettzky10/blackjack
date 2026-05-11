"use client"

import { useState, useMemo } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush } from "recharts"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Minus, Maximize } from "lucide-react"
import type { HandHistoryEntry } from "@/lib/utils/blackjack-utils"

interface EquityChartPanelProps {
  history: HandHistoryEntry[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="p-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm">
        <p className="font-bold">Hand #{label}</p>
        <p
          className={`font-semibold ${data.handProfit > 0 ? "text-green-400" : data.handProfit < 0 ? "text-red-400" : "text-slate-300"}`}
        >
          Hand P/L: {data.handProfit > 0 ? "+" : ""}${data.handProfit}
        </p>
        <p>Cumulative P/L: ${data.cumulativeProfit.toFixed(2)}</p>
      </div>
    )
  }
  return null
}

export default function EquityChartPanel({ history }: EquityChartPanelProps) {
  const [isMinimized, setIsMinimized] = useState(true)

  const chartData = useMemo(() => {
    let cumulativeProfit = 0
    return history.map((entry) => {
      cumulativeProfit += entry.profitOrLoss
      return {
        handNumber: entry.handNumber,
        cumulativeProfit: cumulativeProfit,
        handProfit: entry.profitOrLoss,
      }
    })
  }, [history])

  const latestProfit = chartData.length > 0 ? chartData[chartData.length - 1].cumulativeProfit : 0
  const profitColor = latestProfit > 0 ? "text-green-400" : latestProfit < 0 ? "text-red-400" : "text-slate-300"

  if (isMinimized) {
    return (
      <motion.div
        layoutId="equity-chart-wrapper"
        onClick={() => setIsMinimized(false)}
        className="cursor-pointer p-2 bg-slate-900/80 border border-slate-700 rounded-lg shadow-lg flex flex-col items-center justify-center w-24 h-16 hover:bg-slate-800 transition-colors"
        title="Click to expand equity chart"
      >
        <div className={`text-lg font-bold ${profitColor}`}>
          {latestProfit >= 0 ? "+" : ""}${latestProfit.toFixed(0)}
        </div>
        <Maximize className="absolute top-1.5 right-1.5 h-3 w-3 text-slate-500" />
      </motion.div>
    )
  }

  return (
    <motion.div layoutId="equity-chart-wrapper" className="w-40 md:w-56">
      <Card className="bg-slate-800/80 text-white border-slate-700 w-full">
        <CardHeader className="p-2 flex flex-row items-center justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-6 w-6 text-slate-400 hover:text-white hover:bg-slate-700"
            onClick={() => setIsMinimized(true)}
            title="Minimize chart"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 20,
                  left: -10,
                  bottom: 20,
                }}
              >
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="handNumber" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="cumulativeProfit"
                  stroke="#38bdf8"
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeProfit"
                  stroke="#38bdf8"
                  fillOpacity={1}
                  fill="url(#colorLoss)"
                  filter={(d) => d.cumulativeProfit < 0}
                />
                <Brush dataKey="handNumber" height={20} stroke="#818cf8" fill="rgba(129, 140, 248, 0.1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
