"use client"

import { useState, useTransition } from "react"
import { Switch } from "@/components/ui/switch"

type Props = {
  policyId: string
  initialEnabled: boolean
}

export function AutoRemindToggle({ policyId, initialEnabled }: Props) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [isPending, startTransition] = useTransition()

  const handleChange = (checked: boolean) => {
    setEnabled(checked)
    startTransition(async () => {
      const response = await fetch("/api/policies/reminders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          policyId,
          autoRemindEnabled: checked,
        }),
      })

      if (!response.ok) {
        setEnabled(!checked)
      }
    })
  }

  return (
    <div className="inline-flex items-center gap-2 text-xs text-slate-600">
      <span>Auto-remind</span>
      <Switch
        checked={enabled}
        onCheckedChange={handleChange}
        disabled={isPending}
        aria-label="Toggle auto reminders"
      />
      <span>{enabled ? "On" : "Off"}</span>
    </div>
  )
}
