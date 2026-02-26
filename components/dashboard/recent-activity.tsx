import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, FileText, UserPlus, Bell } from "lucide-react"

const activities = [
  {
    icon: CheckCircle2,
    iconColor: "text-success",
    text: "Sarah M. completed onboarding",
    time: "2 hours ago",
  },
  {
    icon: FileText,
    iconColor: "text-primary",
    text: "New policy assigned to 12 staff",
    time: "4 hours ago",
  },
  {
    icon: UserPlus,
    iconColor: "text-primary",
    text: "James T. added as new employee",
    time: "Yesterday",
  },
  {
    icon: Bell,
    iconColor: "text-warning",
    text: "Reminder sent to 5 pending employees",
    time: "Yesterday",
  },
  {
    icon: CheckCircle2,
    iconColor: "text-success",
    text: "Lisa K. acknowledged WHS Policy",
    time: "2 days ago",
  },
]

export function RecentActivity() {
  return (
    <Card className="border-border bg-background">
      <CardHeader>
        <CardTitle className="text-base text-foreground">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start gap-3">
              <activity.icon
                className={`mt-0.5 h-4 w-4 shrink-0 ${activity.iconColor}`}
              />
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-sm text-foreground">{activity.text}</span>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
