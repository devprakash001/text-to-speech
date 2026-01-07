import { type NextRequest, NextResponse } from "next/server"

async function generateTextToSpeech(text: string, language: string): Promise<Buffer> {
  try {
    const langCode = language === "hi" ? "hi" : "en"
    const encodedText = encodeURIComponent(text.substring(0, 100))

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const url = `https://translate.google.com/translate_tts?client=tw-ob&q=${encodedText}&tl=${langCode}`

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Referer: "https://translate.google.com/",
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(`[v0] TTS API error: ${response.status}`)
      throw new Error(`API returned ${response.status}`)
    }

    const arrayBuffer = await response.arrayBuffer()

    if (arrayBuffer.byteLength < 100) {
      console.error(`[v0] Invalid audio response: ${arrayBuffer.byteLength} bytes`)
      throw new Error("Invalid audio response")
    }

    return Buffer.from(arrayBuffer)
  } catch (error) {
    console.error("[v0] TTS generation error:", error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text, language, speed } = await request.json()

    console.log("[v0] TTS request received:", { text: text?.substring(0, 50), language, speed })

    // Validate input
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Text is required and cannot be empty" }, { status: 400 })
    }

    if (!["en", "hi"].includes(language)) {
      return NextResponse.json({ error: 'Language must be "en" or "hi"' }, { status: 400 })
    }

    if (!["normal", "slow"].includes(speed)) {
      return NextResponse.json({ error: 'Speed must be "normal" or "slow"' }, { status: 400 })
    }

    // Sanitize text to prevent injection
    const sanitizedText = text.substring(0, 5000)

    let audioBuffer: Buffer
    try {
      audioBuffer = await generateTextToSpeech(sanitizedText, language)
    } catch (error) {
      console.error("[v0] Audio generation failed:", error)
      return NextResponse.json(
        { error: "Failed to generate audio. Please try again or use shorter text." },
        { status: 500 },
      )
    }

    const base64Audio = audioBuffer.toString("base64")
    const audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`

    console.log("[v0] Audio generated successfully:", `(${audioBuffer.length} bytes)`)

    return NextResponse.json({
      success: true,
      audioUrl: audioDataUrl,
    })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "An error occurred. Please try again." }, { status: 500 })
  }
}
