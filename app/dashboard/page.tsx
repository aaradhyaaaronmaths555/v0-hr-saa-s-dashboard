import { StatCards } from "@/components/dashboard/stat-cards"
import { AlertBanner } from "@/components/dashboard/alert-banner"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { UpcomingExpirations } from "@/components/dashboard/upcoming-expirations"

export default function DashboardPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {"Here's what's happening with your team today."}
        </p>
      </div>
      <StatCards />
      <AlertBanner />
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivity />
        <UpcomingExpirations />
      </div>
    </div>
  )
}
