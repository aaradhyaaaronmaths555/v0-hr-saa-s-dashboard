"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { fetchLiveComplianceData, formatDate } from "@/lib/supabase/live-data"
import { Button } from "@/components/ui/button"
import type { LiveEmployee } from "@/lib/supabase/live-data"
import { getEmployeeComplianceScores } from "@/lib/compliance/metrics"

type AuditRow = {
  employee: string
  onboarding: string
  certCount: number
  acknowledgedPolicies: number
  complianceScore: number
  overall: "Compliant" | "Action Needed"
}

export default function AuditExportPage() {
  const searchParams = useSearchParams()
  const [rows, setRows] = useState<AuditRow[]>([])
  const [generatedAt, setGeneratedAt] = useState<string>("")

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const data = await fetchLiveComplianceData(supabase as never)
      const policyAckCount = new Map<string, number>()
      const certCount = new Map<string, number>()
      const scores = getEmployeeComplianceScores(
        data.employees,
        data.certificates,
        data.policies,
        data.acknowledgements
      )

      for (const ack of data.acknowledgements) {
        if (!ack.acknowledgedAt) continue
        policyAckCount.set(ack.employeeId, (policyAckCount.get(ack.employeeId) ?? 0) + 1)
      }
      for (const cert of data.certificates) {
        certCount.set(cert.employeeId, (certCount.get(cert.employeeId) ?? 0) + 1)
      }

      setRows(
        data.employees.map((employee: LiveEmployee) => ({
          employee: employee.name,
          onboarding: employee.onboardingStatus,
          certCount: certCount.get(employee.id) ?? 0,
          acknowledgedPolicies: policyAckCount.get(employee.id) ?? 0,
          complianceScore: scores.get(employee.id)?.score ?? 0,
          overall: (scores.get(employee.id)?.score ?? 0) >= 80 ? "Compliant" : "Action Needed",
        }))
      )
      setGeneratedAt(new Date().toLocaleString("en-AU"))
    }

    void load()
  }, [])

  useEffect(() => {
    if (searchParams.get("print") !== "1") return
    const timer = setTimeout(() => window.print(), 500)
    return () => clearTimeout(timer)
  }, [searchParams])

  return (
    <div className="min-h-svh bg-white px-8 py-6">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <h1 className="text-lg font-semibold text-slate-900">Fair Work Compliance Audit Export</h1>
        <Button onClick={() => window.print()}>Download PDF</Button>
      </div>

      <h2 className="text-xl font-semibold text-slate-900">Fair Work Compliance Summary</h2>
      <p className="mt-1 text-sm text-slate-600">Generated: {generatedAt || "Loading..."}</p>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="border-b border-slate-200 px-3 py-2">Employee</th>
              <th className="border-b border-slate-200 px-3 py-2">Onboarding</th>
              <th className="border-b border-slate-200 px-3 py-2">Certificates</th>
              <th className="border-b border-slate-200 px-3 py-2">Policy Acks</th>
              <th className="border-b border-slate-200 px-3 py-2">Compliance Score</th>
              <th className="border-b border-slate-200 px-3 py-2">Overall</th>
              <th className="border-b border-slate-200 px-3 py-2">Printed</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.employee} className="border-t border-slate-100">
                <td className="px-3 py-2 text-slate-900">{row.employee}</td>
                <td className="px-3 py-2 text-slate-700">{row.onboarding}</td>
                <td className="px-3 py-2 text-slate-700">{row.certCount}</td>
                <td className="px-3 py-2 text-slate-700">{row.acknowledgedPolicies}</td>
                <td className="px-3 py-2 text-slate-700">{row.complianceScore}%</td>
                <td className="px-3 py-2 text-slate-700">{row.overall}</td>
                <td className="px-3 py-2 text-slate-700">{formatDate(new Date().toISOString())}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
