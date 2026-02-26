import { StatCards } from "@/components/dashboard/stat-cards"
import { AlertBanner } from "@/components/dashboard/alert-banner"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { UpcomingExpirations } from "@/components/dashboard/upcoming-expirations"

export default function DashboardPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-2 text-base text-muted-foreground">
          {"Here's what's happening with your team today."}
        </p>
      </div>
      <StatCards />
      <AlertBanner />
      <div className="grid gap-8 lg:grid-cols-2">
        <RecentActivity />
        <UpcomingExpirations />
      </div>
    </div>
  )
}
