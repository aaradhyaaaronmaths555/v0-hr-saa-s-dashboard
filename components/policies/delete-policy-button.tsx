"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

type DeletePolicyButtonProps = {
  policyId: string
  policyTitle: string
  compact?: boolean
}

export function DeletePolicyButton({
  policyId,
  policyTitle,
  compact = false,
}: DeletePolicyButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete policy "${policyTitle}"? This cannot be undone.`
    )
    if (!confirmed) return

    setLoading(true)
    const response = await fetch(`/api/policies/${policyId}`, { method: "DELETE" })
    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string }
      window.alert(payload.error ?? "Failed to delete policy")
      setLoading(false)
      return
    }
    window.location.assign("/policies?success=policy-deleted")
  }

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      onClick={() => void handleDelete()}
      disabled={loading}
    >
      {loading ? "Deleting..." : compact ? "Del" : "Delete"}
    </Button>
  )
}
