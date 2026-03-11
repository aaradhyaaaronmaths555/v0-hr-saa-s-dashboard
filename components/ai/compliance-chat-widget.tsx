"use client"

import { useEffect, useMemo, useState } from "react"
import { MessageCircle, Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

function sessionStorageKey(userId: string | null, sessionId: string) {
  return `peopledesk_ai_chat_${userId ?? "anon"}_${sessionId}`
}

function getOrCreateSessionId() {
  const key = "peopledesk_ai_chat_session_id"
  const existing = sessionStorage.getItem(key)
  if (existing) return existing
  const value = crypto.randomUUID()
  sessionStorage.setItem(key, value)
  return value
}

export function ComplianceChatWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string>("")
  const [userId, setUserId] = useState<string | null>(null)

  const storageKey = useMemo(
    () => (sessionId ? sessionStorageKey(userId, sessionId) : ""),
    [userId, sessionId]
  )

  useEffect(() => {
    const supabase = createClient()
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUserId(user?.id ?? null)
      const id = getOrCreateSessionId()
      setSessionId(id)
      const key = sessionStorageKey(user?.id ?? null, id)
      const raw = sessionStorage.getItem(key)
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as ChatMessage[]
          if (Array.isArray(parsed)) setMessages(parsed)
        } catch {
          // ignore malformed cache
        }
      }
    }
    void init()
  }, [])

  useEffect(() => {
    if (!storageKey) return
    sessionStorage.setItem(storageKey, JSON.stringify(messages))
  }, [messages, storageKey])

  async function sendMessage() {
    const trimmed = input.trim()
    if (!trimmed || loading) return
    setError(null)

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }]
    setMessages(nextMessages)
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/ai-compliance-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      })
      const payload = (await res.json()) as { answer?: string; error?: string }
      if (!res.ok || !payload.answer) {
        setError(payload.error ?? "Assistant error. Please try again.")
        return
      }
      setMessages((prev) => [...prev, { role: "assistant", content: payload.answer! }])
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <div className="flex h-[520px] w-[360px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">AI Compliance Assistant</p>
              <p className="text-xs text-slate-500">Fair Work, NES, Awards, WHS</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close chat">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-3">
            {messages.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-xs text-slate-600">
                Ask anything about Australian HR compliance for SMBs.
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={
                    message.role === "user"
                      ? "ml-auto max-w-[85%] rounded-lg bg-primary px-3 py-2 text-sm text-white"
                      : "mr-auto max-w-[85%] rounded-lg bg-white px-3 py-2 text-sm text-slate-700"
                  }
                >
                  {message.content}
                </div>
              ))
            )}
            {loading && (
              <div className="mr-auto max-w-[85%] rounded-lg bg-white px-3 py-2 text-sm text-slate-500">
                Thinking...
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 bg-white p-3">
            {error ? <p className="mb-2 text-xs text-red-600">{error}</p> : null}
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    void sendMessage()
                  }
                }}
                placeholder="Ask a compliance question..."
                className="h-9 flex-1 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-primary"
              />
              <Button onClick={() => void sendMessage()} disabled={loading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button
          className="h-12 w-12 rounded-full shadow-lg"
          onClick={() => setOpen(true)}
          aria-label="Open AI compliance chat"
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      )}
    </div>
  )
}
