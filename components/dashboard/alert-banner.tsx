import Link from "next/link"
import { AlertTriangle, ArrowRight } from "lucide-react"

export function AlertBanner() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3">
      <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
      <p className="flex-1 text-sm text-warning-foreground">
        <span className="font-medium">3 employees</span> have overdue policy acknowledgements.
      </p>
      <Link
        href="/dashboard/policies"
        className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        Send reminder
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}
