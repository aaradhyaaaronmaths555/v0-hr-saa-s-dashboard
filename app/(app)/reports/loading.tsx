export default function ReportsLoading() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-96 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-background p-6 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 animate-pulse rounded-xl bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-48 animate-pulse rounded bg-muted" />
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              </div>
            </div>
            <div className="mt-4 h-3 w-32 animate-pulse rounded bg-muted" />
            <div className="mt-4 h-9 w-full animate-pulse rounded-lg bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
