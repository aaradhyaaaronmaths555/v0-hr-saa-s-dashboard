import { Suspense } from "react"
import { ComplianceHealthBanner } from "@/components/dashboard/compliance-health-banner"
import { StatCards } from "@/components/dashboard/stat-cards"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { OverdueAcknowledgementsBanner } from "@/components/dashboard/overdue-ack-banner"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { UpcomingExpirations } from "@/components/dashboard/upcoming-expirations"
import {
  StatCardsSkeleton,
  QuickActionsSkeleton,
  BannerSkeleton,
  ActivityCardSkeleton,
  ExpirationsCardSkeleton,
} from "@/components/skeletons"

export default function DashboardPage() {
  return (
    <div className="flex flex-col space-y-8">
      <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
      <Suspense fallback={<BannerSkeleton />}>
        <ComplianceHealthBanner />
      </Suspense>
      <Suspense fallback={<StatCardsSkeleton />}>
        <StatCards />
      </Suspense>
      <Suspense fallback={<QuickActionsSkeleton />}>
        <QuickActions />
      </Suspense>
      <Suspense fallback={<BannerSkeleton />}>
        <OverdueAcknowledgementsBanner />
      </Suspense>
      <div className="grid gap-8 lg:grid-cols-2">
        <Suspense fallback={<ActivityCardSkeleton />}>
          <RecentActivity />
        </Suspense>
        <Suspense fallback={<ExpirationsCardSkeleton />}>
          <UpcomingExpirations />
        </Suspense>
      </div>
    </div>
  )
}

