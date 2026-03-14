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

type SendRemindersButtonProps = {
  policyId?: string
}

export function SendRemindersButton({ policyId }: SendRemindersButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState("")

  const handleSend = () => {
    setMessage("")
    startTransition(async () => {
      const response = await fetch("/api/policies/reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "send_now",
          policyId,
        }),
      })
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
      <Button type="button" onClick={handleSend} disabled={isPending}>
        {isPending ? "Sending reminders..." : "Send reminders"}
      </Button>
      {message ? <p className="text-xs text-slate-500">{message}</p> : null}
    </div>
  )
}
