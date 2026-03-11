import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { fetchLiveComplianceData } from "@/lib/supabase/live-data"
import type { LiveEmployee } from "@/lib/supabase/live-data"
import { getEmployeeComplianceScores } from "@/lib/compliance/metrics"

export default async function ReportsPage() {
  const supabase = await createClient()
  const data = await fetchLiveComplianceData(supabase as never)
  const complianceScores = getEmployeeComplianceScores(
    data.employees,
    data.certificates,
    data.policies,
    data.acknowledgements
  )

  const employeeById = new Map<string, LiveEmployee>(
    data.employees.map((employee: LiveEmployee) => [employee.id, employee] as const)
  )
  const certCountByEmployee = new Map<string, number>()
  for (const cert of data.certificates) {
    certCountByEmployee.set(cert.employeeId, (certCountByEmployee.get(cert.employeeId) ?? 0) + 1)
  }

  const policyAcksByEmployee = new Map<string, number>()
  for (const ack of data.acknowledgements) {
    if (!ack.acknowledgedAt) continue
    policyAcksByEmployee.set(ack.employeeId, (policyAcksByEmployee.get(ack.employeeId) ?? 0) + 1)
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Reports</h1>
          <p className="mt-1 text-sm text-slate-600">Live compliance summary from Supabase</p>
        </div>
        <Button asChild>
          <Link href="/reports/audit-export?print=1" target="_blank">
            Export Audit Report
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Employee</th>
              <th className="px-4 py-3 font-medium">Onboarding</th>
              <th className="px-4 py-3 font-medium">Certificates</th>
              <th className="px-4 py-3 font-medium">Policy Acks</th>
              <th className="px-4 py-3 font-medium">Compliance Score</th>
              <th className="px-4 py-3 font-medium">Overall</th>
            </tr>
          </thead>
          <tbody>
            {data.employees.map((employee: LiveEmployee) => {
              const certCount = certCountByEmployee.get(employee.id) ?? 0
              const ackCount = policyAcksByEmployee.get(employee.id) ?? 0
              const score = complianceScores.get(employee.id)?.score ?? 0
              const status =
                score >= 80
                  ? "Compliant"
                  : "Action Needed"

              return (
                <tr key={employee.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-800">{employeeById.get(employee.id)?.name}</td>
                  <td className="px-4 py-3 text-slate-700">{employee.onboardingStatus}</td>
                  <td className="px-4 py-3 text-slate-700">{certCount}</td>
                  <td className="px-4 py-3 text-slate-700">{ackCount}</td>
                  <td className="px-4 py-3 text-slate-700">{score}%</td>
                  <td className="px-4 py-3">
                    <Badge variant={status === "Compliant" ? "success" : "warning"}>{status}</Badge>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {data.employees.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-slate-500">
            No report data available yet.
          </div>
        )}
      </div>
    </div>
  )
}
