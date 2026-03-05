export default function EmployeesLoading() {
  return (
    <div className="flex w-full flex-col gap-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-48 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-3 sm:w-auto">
            <div className="h-9 flex-1 animate-pulse rounded-lg bg-muted sm:w-72" />
            <div className="h-9 w-28 animate-pulse rounded-lg bg-muted" />
          </div>
          <div className="h-9 w-32 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>

      {/* Mobile Card Skeleton */}
      <div className="flex flex-col gap-3 sm:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-background p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="mt-1 h-4 w-4 animate-pulse rounded bg-muted" />
              <div className="flex-1 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                  </div>
                </div>
                <div className="h-3 w-40 animate-pulse rounded bg-muted" />
                <div className="flex items-center justify-between">
                  <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
                  <div className="h-8 w-12 animate-pulse rounded bg-muted" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="hidden overflow-hidden rounded-xl border border-border bg-background shadow-sm sm:block">
        <div className="w-full">
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-border px-2 py-3">
            <div className="w-10 px-2">
              <div className="h-4 w-4 animate-pulse rounded bg-muted" />
            </div>
            <div className="flex-1">
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            </div>
            <div className="w-32">
              <div className="h-4 w-12 animate-pulse rounded bg-muted" />
            </div>
            <div className="hidden w-28 md:block">
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            </div>
            <div className="hidden w-24 lg:block">
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            </div>
            <div className="w-28">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            </div>
            <div className="w-20">
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            </div>
            <div className="w-16" />
          </div>

          {/* Rows */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 border-b border-border px-2 py-3 ${
                i % 2 === 0 ? "bg-background" : "bg-muted/30"
              }`}
            >
              <div className="w-10 px-2">
                <div className="h-4 w-4 animate-pulse rounded bg-muted" />
              </div>
              <div className="flex flex-1 items-center gap-3">
                <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                <div className="h-4 w-28 animate-pulse rounded bg-muted" />
              </div>
              <div className="w-32">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </div>
              <div className="hidden w-28 md:block">
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              </div>
              <div className="hidden w-24 lg:block">
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              </div>
              <div className="w-28">
                <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
              </div>
              <div className="w-20">
                <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-muted" />
              </div>
              <div className="w-16">
                <div className="h-8 w-12 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  )
}
