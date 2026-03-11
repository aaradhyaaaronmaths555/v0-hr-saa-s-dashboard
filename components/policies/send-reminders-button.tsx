"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"

type ReminderResponse = {
  summary?: {
    sent: number
    skipped: number
    failed: number
    total: number
  }
}

export function SendRemindersButton() {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState("")

  const handleSend = () => {
    setMessage("")
    startTransition(async () => {
      const response = await fetch("/api/policies/reminders", { method: "POST" })
      const payload = (await response.json()) as ReminderResponse
      if (!response.ok || !payload.summary) {
        setMessage("Failed to send reminders.")
        return
      }
      setMessage(
        `Reminders processed: ${payload.summary.sent} sent, ${payload.summary.skipped} skipped, ${payload.summary.failed} failed.`
      )
    })
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button type="button" variant="outline" onClick={handleSend} disabled={isPending}>
        {isPending ? "Sending reminders..." : "Send Policy Reminders"}
      </Button>
      {message ? <p className="text-xs text-slate-500">{message}</p> : null}
    </div>
  )
}
