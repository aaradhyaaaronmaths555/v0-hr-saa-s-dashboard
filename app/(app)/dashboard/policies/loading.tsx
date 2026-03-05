export default function DashboardPoliciesLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="h-8 w-24 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-56 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-72 animate-pulse rounded-lg bg-muted" />
          <div className="h-9 w-28 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>

      {/* Policy Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-background p-6 shadow-sm"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-2">
                  <div className="h-5 w-40 animate-pulse rounded bg-muted" />
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-12 animate-pulse rounded-full bg-muted" />
                    <div className="h-4 w-16 animate-pulse rounded-full bg-muted" />
                  </div>
                </div>
                <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
              </div>
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
              <div className="flex items-center justify-between">
                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                <div className="h-8 w-24 animate-pulse rounded-lg bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
