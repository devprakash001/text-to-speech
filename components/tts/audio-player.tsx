"use client"

import type React from "react"

import { useState, type RefObject } from "react"
import { Button } from "@/components/ui/button"
import { Download, Play, Pause } from "lucide-react"

interface AudioPlayerProps {
  audioUrl: string
  onDownload: () => void
  audioRef: RefObject<HTMLAudioElement>
}

export default function AudioPlayer({ audioUrl, onDownload, audioRef }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  const handlePlayPause = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
  }

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    audioRef.current.currentTime = percent * duration
  }

  return (
    <div className="space-y-4 p-4 bg-secondary/30 border border-border rounded-lg">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Player Controls */}
      <div className="flex items-center gap-4">
        <Button
          onClick={handlePlayPause}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          size="lg"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </Button>

        {/* Progress Bar */}
        <div className="flex-1 space-y-2">
          <div
            onClick={handleProgressClick}
            className="w-full h-2 bg-input rounded-full cursor-pointer hover:h-3 transition-all"
          >
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <Button onClick={onDownload} variant="outline" className="w-full bg-transparent" size="lg">
        <Download className="w-4 h-4 mr-2" />
        Download MP3
      </Button>
    </div>
  )
}
