import { createClient } from "@/lib/supabase/server"
import { fetchLiveComplianceData } from "@/lib/supabase/live-data"
import type { LivePolicyAcknowledgement } from "@/lib/supabase/live-data"
import { getCertificateAlertBuckets } from "@/lib/compliance/metrics"
import { Card, CardContent } from "@/components/ui/card"
import { ShieldAlert, Users, FileWarning, TriangleAlert } from "lucide-react"

type CardRow = {
  label: string
  sublabel: string
  value: number
  suffix: string
  icon: typeof ShieldAlert
  iconColor: string
  iconBg: string
}

export async function StatCards() {
  const supabase = await createClient()
  const data = await fetchLiveComplianceData(supabase as never)
  const certAlerts = getCertificateAlertBuckets(data.certificates)

  const acknowledgedCount = data.acknowledgements.filter(
    (ack: LivePolicyAcknowledgement) => !!ack.acknowledgedAt
  ).length
  const totalPolicyAssignments = data.employees.length * data.policies.length
  const unacknowledgedPolicies = Math.max(
    totalPolicyAssignments - acknowledgedCount,
    0
  )

  const { data: whsRows } = await supabase
    .from("WHSIncident")
    .select("id,status")
    .neq("status", "Closed")

  const openIncidents = (whsRows ?? []).length

  const cards: CardRow[] = [
    {
      label: "Total Employees",
      sublabel: "Active employees in your organisation",
      value: data.employees.length,
      suffix: "employees",
      icon: Users,
      iconColor: "text-blue-700",
      iconBg: "bg-blue-50",
    },
    {
      label: "Certs Expiring Soon",
      sublabel: "Within 30 days (incl. overdue)",
      value: certAlerts.expired + certAlerts.dueIn30,
      suffix: "alerts",
      icon: ShieldAlert,
      iconColor: "text-amber-700",
      iconBg: "bg-amber-50",
    },
    {
      label: "Unacknowledged Policies",
      sublabel: "Policy acknowledgements still pending",
      value: unacknowledgedPolicies,
      suffix: "pending",
      icon: FileWarning,
      iconColor: "text-red-700",
      iconBg: "bg-red-50",
    },
    {
      label: "Open WHS Incidents",
      sublabel: "Incidents requiring follow-up",
      value: openIncidents,
      suffix: "open",
      icon: TriangleAlert,
      iconColor: "text-rose-700",
      iconBg: "bg-rose-50",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label}>
          <Card className="relative min-h-[120px] overflow-hidden border-slate-200 transition-all duration-200 hover:shadow-md">
            <CardContent className="flex items-start justify-between gap-4 p-6">
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-sm font-medium leading-tight text-slate-500">
                  {card.label}
                </span>
                <span className="flex flex-wrap items-baseline gap-x-1.5 text-2xl font-bold text-slate-900">
                  {card.value}
                  {card.suffix && (
                    <span className="text-base font-medium text-slate-500">
                      {card.suffix}
                    </span>
                  )}
                </span>
                <span className="text-xs text-slate-400">{card.sublabel}</span>
              </div>
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.iconBg}`}
                aria-hidden="true"
              >
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}

export default StatCards
