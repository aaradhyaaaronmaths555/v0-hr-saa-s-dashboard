import { createClient } from "@/lib/supabase/server"
import { fetchLiveComplianceData } from "@/lib/supabase/live-data"
import type {
  LiveEmployee,
  LivePolicy,
  LivePolicyAcknowledgement,
} from "@/lib/supabase/live-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, FileText, TriangleAlert, Inbox, BellRing } from "lucide-react"

type ActivityItem = {
  type: "ack" | "certificate" | "incident" | "reminder"
  text: string
  at: string
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Inbox className="mb-4 h-12 w-12 text-slate-300" />
      <h3 className="text-base font-medium text-slate-500">No recent activity</h3>
      <p className="mt-1 max-w-[200px] text-sm text-slate-400">
        Activity will appear here as your team interacts with the platform.
      </p>
    </div>
  )
}

function relativeTime(iso: string) {
  const ms = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(ms / 3600000)
  if (hours < 1) return "Just now"
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? "" : "s"} ago`
}

interface RecentActivityProps {
  showEmpty?: boolean
}

export async function RecentActivity({ showEmpty = false }: RecentActivityProps) {
  const supabase = await createClient()
  const data = await fetchLiveComplianceData(supabase as never)

  const employeeById = new Map(
    data.employees.map((employee: LiveEmployee) => [employee.id, employee.name] as const)
  )
  const policyById = new Map(
    data.policies.map((policy: LivePolicy) => [policy.id, policy.title] as const)
  )

  const { data: certificateRows } = await supabase
    .from("Certificate")
    .select("id,type,employeeId,createdAt")
    .order("createdAt", { ascending: false })
    .limit(10)

  const { data: incidentRows } = await supabase
    .from("WHSIncident")
    .select("id,incidentType,status,createdAt")
    .order("createdAt", { ascending: false })
    .limit(10)

  const { data: reminderRows } = await supabase
    .from("PolicyReminderEvent")
    .select("policyId,employeeId,sentAt,status")
    .eq("organisationId", data.organisationId)
    .eq("status", "sent")
    .order("sentAt", { ascending: false })
    .limit(10)

  const ackEvents: ActivityItem[] = data.acknowledgements
    .filter((ack: LivePolicyAcknowledgement) => !!ack.acknowledgedAt)
    .map((ack: LivePolicyAcknowledgement) => ({
      type: "ack",
      text: `${employeeById.get(ack.employeeId) ?? "Employee"} acknowledged ${policyById.get(ack.policyId) ?? "policy"}`,
      at: ack.acknowledgedAt!,
    }))

  const certificateEvents: ActivityItem[] = (certificateRows ?? []).map(
    (row: { type: string; employeeId: string; createdAt: string }) => ({
      type: "certificate",
      text: `${employeeById.get(row.employeeId) ?? "Employee"} uploaded/updated ${row.type} certificate`,
      at: row.createdAt,
    })
  )

  const incidentEvents: ActivityItem[] = (incidentRows ?? []).map(
    (row: { incidentType: string; status: string; createdAt: string }) => ({
      type: "incident",
      text: `WHS incident logged: ${row.incidentType} (${row.status})`,
      at: row.createdAt,
    })
  )

  const reminderEvents: ActivityItem[] = (reminderRows ?? []).map(
    (row: { policyId: string; employeeId: string; sentAt: string }) => ({
      type: "reminder",
      text: `Reminder sent to ${employeeById.get(row.employeeId) ?? "Employee"} for ${policyById.get(row.policyId) ?? "policy"}`,
      at: row.sentAt,
    })
  )

  const merged = [...ackEvents, ...certificateEvents, ...incidentEvents, ...reminderEvents]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 10)

  const displayActivities = showEmpty ? [] : merged

  return (
    <Card>
      <CardHeader className="border-b border-[#E2E8F0] pb-4">
        <CardTitle className="text-base font-semibold text-slate-800">
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayActivities.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-5">
            {displayActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                  {activity.type === "ack" && <CheckCircle2 className="h-4 w-4 text-success" />}
                  {activity.type === "certificate" && <FileText className="h-4 w-4 text-primary" />}
                  {activity.type === "incident" && <TriangleAlert className="h-4 w-4 text-warning" />}
                  {activity.type === "reminder" && <BellRing className="h-4 w-4 text-slate-600" />}
                </div>
                <div className="flex flex-1 flex-col gap-1 pt-0.5">
                  <span className="text-sm text-slate-600">{activity.text}</span>
                  <span className="text-xs text-slate-400">
                    {relativeTime(activity.at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
