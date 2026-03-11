import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { fetchLiveComplianceData } from "@/lib/supabase/live-data"
import type { LivePolicy, LivePolicyAcknowledgement } from "@/lib/supabase/live-data"
import { SendRemindersButton } from "@/components/policies/send-reminders-button"

export default async function PoliciesPage() {
  const supabase = await createClient()
  const data = await fetchLiveComplianceData(supabase as never)

  const pendingByPolicy = new Map<string, number>()
  const totalByPolicy = new Map<string, number>()
  for (const policy of data.policies) {
    const policyAcks = data.acknowledgements.filter(
      (ack: LivePolicyAcknowledgement) => ack.policyId === policy.id
    )
    const acknowledgedEmployeeIds = new Set(
      policyAcks
        .filter((ack: LivePolicyAcknowledgement) => !!ack.acknowledgedAt)
        .map((ack: LivePolicyAcknowledgement) => ack.employeeId)
    )
    totalByPolicy.set(policy.id, data.employees.length)
    pendingByPolicy.set(policy.id, Math.max(data.employees.length - acknowledgedEmployeeIds.size, 0))
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
        <h1 className="text-2xl font-semibold text-slate-900">Policies</h1>
        <p className="mt-1 text-sm text-slate-600">Live policy and acknowledgement data from Supabase</p>
        </div>
        <SendRemindersButton />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Policy</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Pending</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.policies.map((policy: LivePolicy) => {
              const pending = pendingByPolicy.get(policy.id) ?? 0
              const total = totalByPolicy.get(policy.id) ?? 0
              return (
                <tr key={policy.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-800">{policy.title}</td>
                  <td className="px-4 py-3 text-slate-600">{policy.description ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-700">{pending}/{total}</td>
                  <td className="px-4 py-3">
                    <Badge variant={pending > 0 ? "warning" : "success"}>
                      {pending > 0 ? "Action Needed" : "Up to Date"}
                    </Badge>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {data.policies.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-slate-500">
            No policies found in Supabase yet.
          </div>
        )}
      </div>
    </div>
  )
}
