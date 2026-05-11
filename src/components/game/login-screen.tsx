"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"

interface LoginScreenProps {
  onLogin: (username: string) => void
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters long.")
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      setError("Username can only contain letters, numbers, and underscores.")
      return
    }
    setError("")
    onLogin(username.trim())
  }

  const handleSkip = () => {
    onLogin("Guest") // Automatically log in as "Guest"
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-green-800 flex items-center justify-center z-50 p-4"
    >
      <Card className="w-full max-w-md bg-green-700 text-white border-2 border-yellow-500">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Welcome to Blackjack!</CardTitle>
          <CardDescription className="text-green-200">
            Please enter a username to play and track your progress.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-green-100">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="bg-white/10 text-white border-green-500 focus:border-yellow-500 placeholder:text-green-300"
                required
              />
            </div>
            {error && <p className="text-sm text-red-400 bg-red-900/50 p-2 rounded">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold">
              Play Now
            </Button>
            {/* Temporary Skip Button for Development */}
            <Button
              type="button"
              onClick={handleSkip}
              variant="ghost"
              className="w-full text-green-200 hover:bg-green-600 hover:text-white"
            >
              Skip (Dev Only)
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  )
}
