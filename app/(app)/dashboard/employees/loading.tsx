export default function DashboardEmployeesLoading() {
  return (
    <div className="flex w-full flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-48 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-72 animate-pulse rounded-lg bg-muted" />
          <div className="h-9 w-32 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-border px-4 py-3">
          <div className="flex-1">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          </div>
          <div className="w-32">
            <div className="h-4 w-12 animate-pulse rounded bg-muted" />
          </div>
          <div className="w-28">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          </div>
          <div className="w-28">
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          </div>
          <div className="w-16" />
        </div>

        {/* Rows */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-0"
          >
            <div className="flex flex-1 items-center gap-3">
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
              <div className="h-4 w-28 animate-pulse rounded bg-muted" />
            </div>
            <div className="w-32">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            </div>
            <div className="w-28">
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            </div>
            <div className="w-28">
              <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
            </div>
            <div className="w-16">
              <div className="h-8 w-12 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
