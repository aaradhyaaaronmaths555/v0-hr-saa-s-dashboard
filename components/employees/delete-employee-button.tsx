"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

type DeleteEmployeeButtonProps = {
  employeeId: string
  employeeName: string
  compact?: boolean
}

export function DeleteEmployeeButton({
  employeeId,
  employeeName,
  compact = false,
}: DeleteEmployeeButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete employee "${employeeName}"? This will also remove related compliance records.`
    )
    if (!confirmed) return

    setLoading(true)
    const response = await fetch(`/api/employees/${employeeId}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string }
      window.alert(payload.error ?? "Failed to delete employee")
      setLoading(false)
      return
    }
    window.location.assign("/employees?success=employee-deleted")
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
