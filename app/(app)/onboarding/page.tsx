import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { fetchLiveComplianceData } from "@/lib/supabase/live-data"
import type { LiveEmployee } from "@/lib/supabase/live-data"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"

function onboardingVariant(status: string): "success" | "warning" | "destructive" | "neutral" {
  if (status === "Complete") return "success"
  if (status === "In Progress") return "warning"
  if (status === "Not Started") return "destructive"
  return "neutral"
}

function estimateProgress(status: string): number {
  if (status === "Complete") return 100
  if (status === "In Progress") return 50
  return 0
}

export default async function OnboardingPage() {
  const supabase = await createClient()
  const data = await fetchLiveComplianceData(supabase as never)

  return (
    <div className="flex w-full flex-col gap-8">
      <PageHeader
        title="Onboarding"
        description="Track each employee's onboarding progress and focus on the next required step."
      />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Employee</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Progress</th>
            </tr>
          </thead>
          <tbody>
            {data.employees.map((employee: LiveEmployee) => (
              <tr key={employee.id} className="border-t border-slate-100">
                <td className="px-4 py-3 text-slate-800">{employee.name}</td>
                <td className="px-4 py-3">
                  <Badge variant={onboardingVariant(employee.onboardingStatus)}>
                    {employee.onboardingStatus}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-slate-700">{estimateProgress(employee.onboardingStatus)}%</td>
              </tr>
            ))}
          </tbody>
        </table>

        {data.employees.length === 0 ? (
          <EmptyState
            title="No onboarding records yet"
            description="Add your first employee to begin onboarding tracking and completion follow-up."
            actionLabel="Add Employee"
            actionHref="/employees/new"
          />
        ) : null}
      </div>
    </div>
  )
}
