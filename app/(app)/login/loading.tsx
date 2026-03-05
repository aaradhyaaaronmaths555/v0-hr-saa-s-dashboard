export default function LoginLoading() {
  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
          <div className="flex flex-col gap-4">
            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <div className="h-4 w-12 animate-pulse rounded bg-muted" />
              <div className="h-9 w-full animate-pulse rounded-lg bg-muted" />
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-9 w-full animate-pulse rounded-lg bg-muted" />
            </div>

            {/* Button */}
            <div className="mt-2 h-9 w-full animate-pulse rounded-lg bg-muted" />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-center">
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  )
}
