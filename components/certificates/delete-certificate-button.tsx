"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

type DeleteCertificateButtonProps = {
  certificateId: string
  certificateType: string
  compact?: boolean
}

export function DeleteCertificateButton({
  certificateId,
  certificateType,
  compact = false,
}: DeleteCertificateButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete certificate "${certificateType}"? This cannot be undone.`
    )
    if (!confirmed) return

    setLoading(true)
    const response = await fetch(`/api/certificates/${certificateId}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string }
      window.alert(payload.error ?? "Failed to delete certificate")
      setLoading(false)
      return
    }
    window.location.assign("/certificates?success=certificate-deleted")
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
