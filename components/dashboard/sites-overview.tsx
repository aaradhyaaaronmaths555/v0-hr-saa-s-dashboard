"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { MapPin } from "lucide-react"

// Dummy site data — replace with real API
const sites = [
  { id: "melbourne-cbd", name: "Melbourne CBD", compliance: 94 },
  { id: "regional-vic", name: "Regional Victoria", compliance: 87 },
  { id: "geelong", name: "Geelong", compliance: 72 },
  { id: "ballarat", name: "Ballarat", compliance: 98 },
]

function getProgressColor(compliance: number) {
  if (compliance >= 90) return "bg-success"
  if (compliance >= 70) return "bg-warning"
  return "bg-danger"
}

export function SitesOverview() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedSiteId = searchParams.get("site")

  const handleSiteClick = (siteId: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (siteId) {
      params.set("site", siteId)
    } else {
      params.delete("site")
    }
    router.push(`/dashboard?${params.toString()}`, { scroll: false })
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between border-b border-[#E2E8F0] pb-4">
        <h2 className="text-base font-semibold text-slate-800">Sites Overview</h2>
        {selectedSiteId && (
          <button
            type="button"
            onClick={() => handleSiteClick(null)}
            className="text-sm font-medium text-primary hover:underline"
          >
            Clear filter
          </button>
        )}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {sites.map((site) => {
          const isSelected = selectedSiteId === site.id
          const progressColor = getProgressColor(site.compliance)

          return (
            <Card
              key={site.id}
              role="button"
              tabIndex={0}
              onClick={() => handleSiteClick(isSelected ? null : site.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  handleSiteClick(isSelected ? null : site.id)
                }
              }}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                isSelected && "ring-2 ring-primary ring-offset-2"
              )}
              aria-pressed={isSelected}
              aria-label={`Filter by ${site.name}, ${site.compliance}% compliant`}
            >
              <CardHeader className="pb-2 pt-0">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-slate-500" />
                  <CardTitle className="text-base font-semibold leading-tight text-slate-900">
                    {site.name}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pb-0">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Compliance</span>
                  <span
                    className={cn(
                      "font-medium",
                      site.compliance >= 90 && "text-success",
                      site.compliance >= 70 && site.compliance < 90 && "text-warning",
                      site.compliance < 70 && "text-danger"
                    )}
                  >
                    {site.compliance}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn("h-full rounded-full transition-all", progressColor)}
                    style={{ width: `${site.compliance}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
