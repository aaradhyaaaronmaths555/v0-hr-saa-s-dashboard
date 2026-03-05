import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card
          key={i}
          className="relative overflow-hidden border-border bg-background shadow-sm"
        >
          <div className="absolute inset-x-0 top-0 h-1 animate-pulse bg-muted" />
          <CardContent className="flex items-start justify-between gap-2 p-3 pt-4 sm:gap-6 sm:p-6 sm:pt-7">
            <div className="flex flex-col gap-1 sm:gap-2">
              <div className="h-3 w-20 animate-pulse rounded bg-muted sm:h-4 sm:w-24" />
              <div className="h-7 w-12 animate-pulse rounded bg-muted sm:h-9 sm:w-16" />
              <div className="h-2.5 w-16 animate-pulse rounded bg-muted sm:h-3 sm:w-20" />
            </div>
            <div className="h-8 w-8 animate-pulse rounded-lg bg-muted sm:h-11 sm:w-11 sm:rounded-xl" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function SitesOverviewSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-32 animate-pulse rounded bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-background p-4 shadow-sm"
          >
            <div className="mb-3 flex items-center gap-2">
              <div className="h-4 w-4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            </div>
            <div className="mb-2 flex justify-between">
              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
              <div className="h-3 w-8 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function QuickActionsSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <div className="mr-1 h-4 w-24 animate-pulse rounded bg-muted" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  )
}

export function BannerSkeleton() {
  return <div className="h-14 animate-pulse rounded-xl bg-muted" />
}

export function ActivityCardSkeleton() {
  return (
    <Card className="border-border bg-background shadow-sm">
      <CardHeader className="px-6 pt-6 pb-2">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="flex flex-col gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="h-8 w-8 animate-pulse rounded-xl bg-muted" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-3 w-20 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function ExpirationsCardSkeleton() {
  return (
    <Card className="border-border bg-background shadow-sm">
      <CardHeader className="px-6 pt-6 pb-2">
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="flex flex-col gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="h-8 w-8 animate-pulse rounded-xl bg-muted" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-16 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-5 w-10 animate-pulse rounded-full bg-muted" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function PoliciesListSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-1 items-center gap-3 sm:w-auto">
          <div className="h-9 flex-1 animate-pulse rounded-lg bg-muted sm:w-72" />
          <div className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
          <div className="flex h-9 w-20 animate-pulse items-center rounded-lg bg-muted" />
        </div>
        <div className="h-9 w-28 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-border bg-background shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 items-start gap-4">
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function EmployeesTableSkeleton() {
  return (
    <div className="flex w-full flex-col gap-6">
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
      <div className="hidden overflow-hidden rounded-xl border border-border bg-background shadow-sm sm:block">
        <div className="w-full">
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
            <div className="w-28">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            </div>
            <div className="w-20">
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            </div>
            <div className="w-16" />
          </div>
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
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  )
}
