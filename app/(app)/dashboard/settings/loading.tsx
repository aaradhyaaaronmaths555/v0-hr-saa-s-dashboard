export default function SettingsLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="h-8 w-24 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-56 animate-pulse rounded bg-muted" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-20 animate-pulse rounded-lg bg-muted"
          />
        ))}
      </div>

      {/* Settings Card */}
      <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
        <div className="mb-6 h-5 w-32 animate-pulse rounded bg-muted" />
        
        <div className="flex flex-col gap-6">
          {/* Form Fields */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-9 w-full animate-pulse rounded-lg bg-muted" />
            </div>
          ))}

          {/* Toggle Section */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-3 w-48 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-6 w-11 animate-pulse rounded-full bg-muted" />
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <div className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
      </div>
    </div>
  )
}
