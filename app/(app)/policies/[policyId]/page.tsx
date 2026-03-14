import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { fetchLiveComplianceData, type LivePolicy } from "@/lib/supabase/live-data"
import { AutoRemindToggle } from "@/components/policies/auto-remind-toggle"
import { SendRemindersButton } from "@/components/policies/send-reminders-button"
import {
  getLatestReminderByEmployee,
  getPolicyCompletionStats,
  type ReminderEventRow,
} from "@/lib/policies/reminders"

export default async function PolicyDetailPage({
  params,
}: {
  params: { policyId: string }
}) {
  const supabase = await createClient()
  const data = await fetchLiveComplianceData(supabase as never)
  const policy = data.policies.find((item: LivePolicy) => item.id === params.policyId)
  if (!policy) return notFound()

  const completion = getPolicyCompletionStats(
    policy.id,
    data.employees,
    data.acknowledgements
  )

  const { data: eventRows } = await supabase
    .from("PolicyReminderEvent")
    .select("policyId,employeeId,sentAt,status")
    .eq("policyId", policy.id)
    .order("sentAt", { ascending: false })

  const { data: scheduleRow } = await supabase
    .from("PolicyReminderSchedule")
    .select("autoRemindEnabled,nextRunAt")
    .eq("policyId", policy.id)
    .maybeSingle()

  const latestReminderByEmployee = getLatestReminderByEmployee(
    (eventRows ?? []) as ReminderEventRow[]
  )

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/policies" className="text-sm text-slate-500 hover:underline">
            Back to policies
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">{policy.title}</h1>
          <p className="mt-1 text-sm text-slate-600">{policy.description ?? "No description"}</p>
        </div>
        <SendRemindersButton policyId={policy.id} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-slate-700">
            {completion.acknowledgedCount}/{completion.totalEmployees} employees (
            {completion.completionPercentage}%) have acknowledged
          </p>
          <AutoRemindToggle
            policyId={policy.id}
            initialEnabled={!!scheduleRow?.autoRemindEnabled}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Next scheduled run:{" "}
          {scheduleRow?.nextRunAt
            ? new Date(scheduleRow.nextRunAt).toLocaleString("en-AU")
            : "Not scheduled"}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-base font-semibold text-slate-900">Outstanding Employees</h2>
          <p className="text-xs text-slate-500">
            Employees who still need to acknowledge this policy.
          </p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Employee</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Last reminded</th>
            </tr>
          </thead>
          <tbody>
            {completion.outstandingEmployees.map((employee) => (
              <tr key={employee.id} className="border-t border-slate-100">
                <td className="px-4 py-3 text-slate-800">{employee.name}</td>
                <td className="px-4 py-3 text-slate-700">{employee.email || "—"}</td>
                <td className="px-4 py-3 text-slate-700">
                  {latestReminderByEmployee.get(employee.id)
                    ? new Date(latestReminderByEmployee.get(employee.id)!).toLocaleString("en-AU")
                    : "Never"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {completion.outstandingEmployees.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-slate-500">
            All employees have acknowledged this policy.
          </div>
        ) : null}
      </div>
    </div>
  )
}
