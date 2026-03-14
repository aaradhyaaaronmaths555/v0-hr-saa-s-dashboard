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
  const { data: whsRows } = await supabase
    .from("WHSIncident")
    .select("id,incidentType,status,incidentDate,correctiveAction")
    .order("incidentDate", { ascending: false })
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

  const whsStatusCounts = {
    New: 0,
    "In review": 0,
    Actioned: 0,
    Closed: 0,
  }
  let whsStuckOver7 = 0
  let whsClosedWithoutCorrective = 0
  for (const incident of (whsRows ?? []) as Array<{
    status?: string
    incidentDate?: string
    correctiveAction?: string
  }>) {
    const status = incident.status ?? "New"
    if (status in whsStatusCounts) {
      whsStatusCounts[status as keyof typeof whsStatusCounts] += 1
    }
    const incidentDate = incident.incidentDate ? new Date(incident.incidentDate) : null
    const ageDays =
      incidentDate && !Number.isNaN(incidentDate.getTime())
        ? Math.floor((Date.now() - incidentDate.getTime()) / 86400000)
        : 0
    if ((status === "New" || status === "In review") && ageDays > 7) {
      whsStuckOver7 += 1
    }
    if (status === "Closed" && !(incident.correctiveAction ?? "").trim()) {
      whsClosedWithoutCorrective += 1
    }
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

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-base font-semibold text-slate-900">WHS Incident Lifecycle</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-700 sm:grid-cols-4">
          <p>New: {whsStatusCounts.New}</p>
          <p>In review: {whsStatusCounts["In review"]}</p>
          <p>Actioned: {whsStatusCounts.Actioned}</p>
          <p>Closed: {whsStatusCounts.Closed}</p>
        </div>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant={whsStuckOver7 > 0 ? "destructive" : "success"}>Stuck &gt; 7 days</Badge>
            <span className="text-slate-700">{whsStuckOver7} incidents</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={whsClosedWithoutCorrective > 0 ? "destructive" : "success"}
            >
              Closed without corrective action
            </Badge>
            <span className="text-slate-700">{whsClosedWithoutCorrective} incidents</span>
          </div>
        </div>
      </div>
    </div>
  )
}
