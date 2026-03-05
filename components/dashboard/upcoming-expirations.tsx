import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"

const expirations = [
  {
    certification: "First Aid Certificate",
    employee: "James T.",
    daysLeft: 14,
    urgency: "warning" as const,
  },
  {
    certification: "Food Safety Training",
    employee: "Maria L.",
    daysLeft: 21,
    urgency: "default" as const,
  },
  {
    certification: "RSA Certificate",
    employee: "Tom B.",
    daysLeft: 7,
    urgency: "destructive" as const,
  },
  {
    certification: "Working with Children Check",
    employee: "Rachel P.",
    daysLeft: 30,
    urgency: "default" as const,
  },
]

function getUrgencyStyles(urgency: "warning" | "destructive" | "default") {
  switch (urgency) {
    case "destructive":
      return "rounded-full bg-danger-bg px-2.5 py-0.5 text-xs font-medium text-danger"
    case "warning":
      return "rounded-full bg-warning-bg px-2.5 py-0.5 text-xs font-medium text-warning"
    default:
      return "rounded-full bg-neutral-bg px-2.5 py-0.5 text-xs font-medium text-text-secondary"
  }
}

export function UpcomingExpirations() {
  return (
    <Card>
      <CardHeader className="border-b border-[#E2E8F0] pb-4">
        <CardTitle className="text-base font-semibold text-slate-800">Upcoming Expirations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-5">
          {expirations.map((item, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <Calendar className="h-4 w-4 text-slate-500" />
              </div>
              <div className="flex flex-1 flex-col gap-1 pt-0.5">
                <span className="text-sm font-medium text-slate-700">
                  {item.certification}
                </span>
                <span className="text-xs text-slate-400">{item.employee}</span>
              </div>
              <span className={getUrgencyStyles(item.urgency)}>
                {item.daysLeft}d
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
