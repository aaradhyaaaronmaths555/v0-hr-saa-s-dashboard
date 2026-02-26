import { Card, CardContent } from "@/components/ui/card"
import { Users, Clock, AlertTriangle, CheckCircle2 } from "lucide-react"

const stats = [
  {
    label: "Total Employees",
    value: "24",
    icon: Users,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
  },
  {
    label: "Pending Acknowledgements",
    value: "5",
    icon: Clock,
    iconColor: "text-warning",
    iconBg: "bg-warning/10",
  },
  {
    label: "Overdue Compliance",
    value: "2",
    icon: AlertTriangle,
    iconColor: "text-destructive",
    iconBg: "bg-destructive/10",
  },
  {
    label: "Fully Onboarded",
    value: "18",
    icon: CheckCircle2,
    iconColor: "text-success",
    iconBg: "bg-success/10",
  },
]

export function StatCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border bg-background">
          <CardContent className="flex items-center gap-4">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.iconBg}`}
            >
              <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-2xl font-bold text-foreground">{stat.value}</span>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
