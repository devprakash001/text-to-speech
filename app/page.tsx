"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Loader from "@/components/tts/loader"
import AudioPlayer from "@/components/tts/audio-player"
import { Volume2, RotateCcw } from "lucide-react"

export default function Home() {
  const [text, setText] = useState("")
  const [language, setLanguage] = useState("en")
  const [speed, setSpeed] = useState("normal")
  const [loading, setLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState("")
  const [error, setError] = useState("")
  const audioRef = useRef<HTMLAudioElement>(null)

  const handleConvert = async () => {
    // Clear previous state
    setError("")
    setAudioUrl("")

    // Validate input
    if (!text.trim()) {
      setError("Please enter some text to convert")
      return
    }

    setLoading(true)
    try {
      console.log("[v0] Sending TTS request")
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language, speed }),
      })

      console.log("[v0] Response status:", response.status)
      const data = await response.json()
      console.log("[v0] Response data:", data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate audio")
      }

      await new Promise((resolve) => setTimeout(resolve, 500))

      setAudioUrl(data.audioUrl)
    } catch (err) {
      console.error("[v0] Conversion error:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setText("")
    setLanguage("en")
    setSpeed("normal")
    setAudioUrl("")
    setError("")
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  const handleDownload = async () => {
    if (!audioUrl) return

    try {
      const response = await fetch(audioUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `tts-${Date.now()}.mp3`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError("Failed to download audio")
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-secondary/10 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Volume2 className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Text to Speech</h1>
          </div>
          <p className="text-muted-foreground">Convert your text to natural-sounding audio. Free, fast, and easy!</p>
        </div>

        {/* Main Card */}
        <Card className="shadow-lg border-border/50">
          <CardHeader>
            <CardTitle>Convert Text to Voice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Text Area */}
            <div className="space-y-2">
              <label htmlFor="text" className="text-sm font-medium text-foreground">
                Enter Your Text
              </label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste your text here..."
                className="w-full h-32 p-4 border border-input rounded-lg bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">Character count: {text.length}</p>
            </div>

            {/* Language & Speed Controls */}
            <div className="grid grid-cols-2 gap-4">
              {/* Language Selector */}
              <div className="space-y-2">
                <label htmlFor="language" className="text-sm font-medium text-foreground">
                  Language
                </label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>

              {/* Speed Selector */}
              <div className="space-y-2">
                <label htmlFor="speed" className="text-sm font-medium text-foreground">
                  Speed
                </label>
                <select
                  id="speed"
                  value={speed}
                  onChange={(e) => setSpeed(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="normal">Normal</option>
                  <option value="slow">Slow</option>
                </select>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Loading Indicator */}
            {loading && <Loader />}

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleConvert}
                disabled={loading || !text.trim()}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Convert to Voice
              </Button>
              <Button onClick={handleReset} disabled={loading} variant="outline" size="lg">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            {/* Audio Player */}
            {audioUrl && <AudioPlayer audioUrl={audioUrl} onDownload={handleDownload} audioRef={audioRef} />}

            {/* Info Box */}
            <div className="p-4 bg-secondary/50 border border-border rounded-lg">
              <h3 className="font-semibold text-sm text-foreground mb-2">How it works:</h3>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Enter your text in the textarea above</li>
                <li>Select your preferred language and speed</li>
                <li>Click "Convert to Voice" to generate audio</li>
                <li>Play or download the generated MP3 file</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-muted-foreground">
          <p>100% Free • No API Keys Required • No Sign-up Needed</p>
        </div>
      </div>
    </main>
  )
}
