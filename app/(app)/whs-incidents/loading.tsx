export default function WhsIncidentsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="h-8 w-72 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-[28rem] animate-pulse rounded bg-muted" />
      </div>

      <div className="rounded-xl border border-border bg-background p-4">
        <div className="grid gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-muted" />
          ))}
          <div className="h-10 w-40 animate-pulse rounded bg-muted" />
        </div>
      </div>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-background p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="h-5 w-48 animate-pulse rounded bg-muted" />
                <div className="h-4 w-72 animate-pulse rounded bg-muted" />
                <div className="h-4 w-56 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
