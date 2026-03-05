export default function CertificatesLoading() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <div className="h-8 w-80 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-96 animate-pulse rounded bg-muted" />
      </div>
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-12 w-28 animate-pulse rounded-lg bg-muted"
          />
        ))}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <div className="h-9 flex-1 animate-pulse rounded-lg bg-muted sm:w-72" />
          <div className="h-9 w-36 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="h-9 w-40 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-background">
        <div className="border-b border-border p-4">
          <div className="flex gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 w-24 animate-pulse rounded bg-muted" />
            ))}
          </div>
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
              <div className="h-6 w-14 animate-pulse rounded-full bg-muted" />
              <div className="ml-auto h-8 w-24 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
