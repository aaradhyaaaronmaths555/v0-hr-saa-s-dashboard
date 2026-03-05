export default function PoliciesLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="h-4 w-64 animate-pulse rounded bg-muted" />
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-1 items-center gap-3 sm:w-auto">
          <div className="h-9 flex-1 animate-pulse rounded-lg bg-muted sm:w-72" />
          <div className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
          <div className="flex h-9 w-20 animate-pulse items-center rounded-lg bg-muted" />
        </div>
        <div className="h-9 w-28 animate-pulse rounded-lg bg-muted" />
      </div>

      {/* Policy Cards Skeleton */}
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-background p-6 shadow-sm"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 items-start gap-4">
                {/* Circular Progress Skeleton */}
                <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                    <div className="h-5 w-12 animate-pulse rounded-full bg-muted" />
                    <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
                  </div>
                  <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="h-3 w-28 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-24 animate-pulse rounded-lg bg-muted" />
                <div className="h-8 w-24 animate-pulse rounded-lg bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
