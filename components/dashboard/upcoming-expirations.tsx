import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
      return "bg-destructive/10 text-destructive border-destructive/20"
    case "warning":
      return "bg-warning/10 text-warning-foreground border-warning/20"
    default:
      return "bg-muted text-muted-foreground border-border"
  }
}

export function UpcomingExpirations() {
  return (
    <Card className="border-border bg-background">
      <CardHeader>
        <CardTitle className="text-base text-foreground">Upcoming Expirations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {expirations.map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="flex flex-1 flex-col gap-1">
                <span className="text-sm font-medium text-foreground">
                  {item.certification}
                </span>
                <span className="text-xs text-muted-foreground">{item.employee}</span>
              </div>
              <Badge
                variant="outline"
                className={getUrgencyStyles(item.urgency)}
              >
                {item.daysLeft}d
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
