import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, FileText, UserPlus, Bell, Inbox } from "lucide-react"

type Activity = {
  icon: typeof CheckCircle2
  iconColor: string
  text: string
  time: string
}

const activities: Activity[] = [
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

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Inbox className="mb-4 h-12 w-12 text-slate-300" />
      <h3 className="text-base font-medium text-slate-500">No recent activity</h3>
      <p className="mt-1 max-w-[200px] text-sm text-slate-400">
        Activity will appear here as your team interacts with the platform.
      </p>
    </div>
  )
}

interface RecentActivityProps {
  showEmpty?: boolean
}

export function RecentActivity({ showEmpty = false }: RecentActivityProps) {
  const displayActivities = showEmpty ? [] : activities

  return (
    <Card>
      <CardHeader className="border-b border-[#E2E8F0] pb-4">
        <CardTitle className="text-base font-semibold text-slate-800">
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayActivities.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-5">
            {displayActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                  <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
                </div>
                <div className="flex flex-1 flex-col gap-1 pt-0.5">
                  <span className="text-sm text-slate-600">{activity.text}</span>
                  <span className="text-xs text-slate-400">
                    {activity.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
