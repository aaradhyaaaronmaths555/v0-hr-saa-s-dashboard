import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { fetchLiveComplianceData, initialsFromName } from "@/lib/supabase/live-data"
import type { LiveEmployee } from "@/lib/supabase/live-data"
import { getEmployeeComplianceScores } from "@/lib/compliance/metrics"

function onboardingBadgeVariant(status: string): "success" | "warning" | "neutral" {
  if (status === "Complete") return "success"
  if (status === "In Progress") return "warning"
  return "neutral"
}

function complianceBadge(hasCertificate: boolean): "success" | "warning" {
  return hasCertificate ? "success" : "warning"
}

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string }>
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const supabase = await createClient()
  const data = await fetchLiveComplianceData(supabase as never)
  const certEmployeeIds = new Set(data.certificates.map((cert: { employeeId: string }) => cert.employeeId))
  const complianceScores = getEmployeeComplianceScores(
    data.employees,
    data.certificates,
    data.policies,
    data.acknowledgements
  )

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Employees</h1>
          <p className="mt-1 text-sm text-slate-600">Live employee data from Supabase</p>
        </div>
        <Button asChild>
          <Link href="/employees/new">Add Employee</Link>
        </Button>
      </div>
      {resolvedSearchParams?.success ? (
        <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          Employee saved successfully.
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Employee</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Onboarding</th>
              <th className="px-4 py-3 font-medium">Compliance</th>
              <th className="px-4 py-3 font-medium">Compliance Score</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.employees.map((employee: LiveEmployee) => {
              const hasCert = certEmployeeIds.has(employee.id)
              const score = complianceScores.get(employee.id)?.score ?? 0
              return (
                <tr key={employee.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary-soft text-xs font-medium text-primary">
                          {initialsFromName(employee.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-slate-800">{employee.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{employee.email || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={onboardingBadgeVariant(employee.onboardingStatus)}>
                      {employee.onboardingStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={complianceBadge(hasCert)}>
                      {hasCert ? "Compliant" : "Action Needed"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{score}%</td>
                  <td className="px-4 py-3">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <Link href={`/employees/${employee.id}/edit`}>Edit</Link>
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {data.employees.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-slate-500">
            No employees found in your organisation yet.
          </div>
        )}
      </div>
    </div>
  )
}
