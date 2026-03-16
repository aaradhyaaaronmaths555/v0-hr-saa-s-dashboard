export default function RightToWorkLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-96 animate-pulse rounded bg-muted" />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-background">
        <div className="border-b border-border p-4">
          <div className="flex gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 w-24 animate-pulse rounded bg-muted" />
            ))}
          </div>
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-9 w-48 animate-pulse rounded bg-muted" />
              <div className="h-9 w-40 animate-pulse rounded bg-muted" />
              <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
              <div className="ml-auto h-8 w-24 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
