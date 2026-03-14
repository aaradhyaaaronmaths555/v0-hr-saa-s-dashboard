import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { fetchLiveComplianceData } from "@/lib/supabase/live-data"
import type { LivePolicy } from "@/lib/supabase/live-data"
import { SendRemindersButton } from "@/components/policies/send-reminders-button"
import { AutoRemindToggle } from "@/components/policies/auto-remind-toggle"
import { getPolicyCompletionStatsMap } from "@/lib/policies/reminders"
import { Button } from "@/components/ui/button"

export default async function PoliciesPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string }>
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const supabase = await createClient()
  const data = await fetchLiveComplianceData(supabase as never)

  const completionByPolicy = getPolicyCompletionStatsMap(
    data.policies,
    data.employees,
    data.acknowledgements
  )
  const { data: scheduleRows } = await supabase
    .from("PolicyReminderSchedule")
    .select("policyId,autoRemindEnabled")
  const autoRemindByPolicy = new Map<string, boolean>(
    (scheduleRows ?? []).map(
      (row: { policyId?: string; autoRemindEnabled?: boolean }) =>
        [row.policyId ?? "", !!row.autoRemindEnabled] as const
    )
  )

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
        <h1 className="text-2xl font-semibold text-slate-900">Policies</h1>
        <p className="mt-1 text-sm text-slate-600">Live policy and acknowledgement data from Supabase</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/policies/new">Add Policy</Link>
          </Button>
          <SendRemindersButton />
        </div>
      </div>
      {resolvedSearchParams?.success ? (
        <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          Policy saved successfully.
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Policy</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Completion</th>
              <th className="px-4 py-3 font-medium">Pending</th>
              <th className="px-4 py-3 font-medium">Auto-remind</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.policies.map((policy: LivePolicy) => {
              const completion = completionByPolicy.get(policy.id)
              const total = completion?.totalEmployees ?? 0
              const acknowledged = completion?.acknowledgedCount ?? 0
              const pending = Math.max(total - acknowledged, 0)
              const completionText = `${acknowledged}/${total} employees (${completion?.completionPercentage ?? 0}%)`
              return (
                <tr key={policy.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-800">
                    <Link href={`/policies/${policy.id}`} className="font-medium hover:underline">
                      {policy.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{policy.description ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-700">{completionText}</td>
                  <td className="px-4 py-3 text-slate-700">{pending}/{total}</td>
                  <td className="px-4 py-3 text-slate-700">
                    <AutoRemindToggle
                      policyId={policy.id}
                      initialEnabled={autoRemindByPolicy.get(policy.id) ?? false}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={pending > 0 ? "warning" : "success"}>
                      {pending > 0 ? "Action Needed" : "Up to Date"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <Link href={`/policies/${policy.id}/edit`}>Edit</Link>
                    </Button>
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
