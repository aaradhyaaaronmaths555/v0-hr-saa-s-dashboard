"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export function AuditPrintControls({ autoPrint }: { autoPrint: boolean }) {
  useEffect(() => {
    if (!autoPrint) return
    const timer = setTimeout(() => window.print(), 500)
    return () => clearTimeout(timer)
  }, [autoPrint])

  return (
    <div className="mb-6 flex items-center justify-between print:hidden">
      <h1 className="text-lg font-semibold text-slate-900">
        Fair Work & WHS Audit Report
      </h1>
      <Button onClick={() => window.print()}>Download PDF</Button>
    </div>
  )
}
