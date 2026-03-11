import { NextResponse } from "next/server"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

const SYSTEM_PROMPT =
  "You are an Australian HR compliance expert. Answer questions about Fair Work Act, NES, Modern Awards, WHS obligations, and HR best practices for Australian SMBs."

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY in environment variables." },
      { status: 500 }
    )
  }

  const body = (await request.json()) as { messages?: ChatMessage[] }
  const messages = Array.isArray(body.messages) ? body.messages : []
  if (messages.length === 0) {
    return NextResponse.json({ error: "No messages provided." }, { status: 400 })
  }

  const payload = {
    model: "gpt-4o",
    temperature: 0.2,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages,
    ],
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
    error?: { message?: string }
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: data.error?.message ?? "OpenAI request failed." },
      { status: response.status }
    )
  }

  const answer = data.choices?.[0]?.message?.content?.trim()
  if (!answer) {
    return NextResponse.json({ error: "No response returned by model." }, { status: 500 })
  }

  return NextResponse.json({ answer })
}
