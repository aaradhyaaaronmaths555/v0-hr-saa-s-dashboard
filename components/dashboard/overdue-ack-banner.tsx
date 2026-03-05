"use client"

import { useState } from "react"
import Link from "next/link"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function OverdueAcknowledgementsBanner() {
  const [open, setOpen] = useState(true)

  if (!open) return null

  return (
    <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 shadow-sm">
      <p className="flex-1 text-sm text-amber-800">
        {"⚠️ "}
        <span className="font-medium">3 employees</span> have overdue policy
        acknowledgements.
      </p>
      <Link
        href="/policies"
        className="flex shrink-0 items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
      >
        Send Reminder <span aria-hidden="true">→</span>
      </Link>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="-mr-2 h-9 w-9 rounded-lg text-slate-500 hover:text-slate-900"
        onClick={() => setOpen(false)}
        aria-label="Dismiss warning"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

