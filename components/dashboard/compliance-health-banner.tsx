"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

type Variant = "green" | "amber" | "red"

const variants = {
  green: {
    message: "All staff compliant — audit ready ✓",
    className: "border-success/30 bg-success-bg text-success",
  },
  amber: {
    message: "3 certificates expiring in 14 days — action needed",
    className: "border-warning/30 bg-warning-bg text-warning",
  },
  red: {
    message: "2 staff working without completed onboarding — urgent",
    className: "border-danger/30 bg-danger-bg text-danger",
  },
} as const

// Dummy logic — replace with real compliance data
function getBannerState(): Variant {
  const staffNotOnboarded = 2
  const certificatesExpiringSoon = 3
  if (staffNotOnboarded > 0) return "red"
  if (certificatesExpiringSoon > 0) return "amber"
  return "green"
}

export function ComplianceHealthBanner() {
  const [open, setOpen] = useState(true)
  const variant = getBannerState()
  const config = variants[variant]

  if (!open) return null

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-5 py-4 shadow-sm ${config.className}`}
      role="status"
    >
      <p className="flex-1 text-sm font-medium">{config.message}</p>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="-mr-2 h-9 w-9 shrink-0 rounded-lg opacity-80 hover:opacity-100"
        onClick={() => setOpen(false)}
        aria-label="Dismiss banner"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
