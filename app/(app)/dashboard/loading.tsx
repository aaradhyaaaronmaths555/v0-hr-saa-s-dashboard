export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Stat Cards Skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-xl border border-border bg-background p-3 pt-4 shadow-sm sm:p-6 sm:pt-7"
          >
            <div className="absolute inset-x-0 top-0 h-1 animate-pulse bg-muted" />
            <div className="flex items-start justify-between gap-2 sm:gap-6">
              <div className="flex flex-col gap-1 sm:gap-2">
                <div className="h-3 w-20 animate-pulse rounded bg-muted sm:h-4 sm:w-24" />
                <div className="h-7 w-12 animate-pulse rounded bg-muted sm:h-9 sm:w-16" />
                <div className="h-2.5 w-16 animate-pulse rounded bg-muted sm:h-3 sm:w-20" />
              </div>
              <div className="h-8 w-8 animate-pulse rounded-lg bg-muted sm:h-11 sm:w-11 sm:rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <div className="flex items-center gap-2">
        <div className="mr-1 h-4 w-24 animate-pulse rounded bg-muted" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>

      {/* Banner Skeleton */}
      <div className="h-14 animate-pulse rounded-xl bg-muted" />

      {/* Two Column Grid Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity Skeleton */}
        <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
          <div className="mb-4 h-5 w-32 animate-pulse rounded bg-muted" />
          <div className="flex flex-col gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="h-8 w-8 animate-pulse rounded-xl bg-muted" />
                <div className="flex flex-1 flex-col gap-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Expirations Skeleton */}
        <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
          <div className="mb-4 h-5 w-40 animate-pulse rounded bg-muted" />
          <div className="flex flex-col gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="h-8 w-8 animate-pulse rounded-xl bg-muted" />
                <div className="flex flex-1 flex-col gap-2">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                </div>
                <div className="h-5 w-10 animate-pulse rounded-full bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
