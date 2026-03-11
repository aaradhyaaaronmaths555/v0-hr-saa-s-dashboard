import { createClient } from "@/lib/supabase/client"
import { fetchLiveComplianceData, initialsFromName } from "@/lib/supabase/live-data"

export type OnboardingEmployee = {
  id: string
  name: string
  initials: string
  role: string
  startDate: string
  completedStepIds: number[]
}

export async function getOnboardingEmployees(): Promise<OnboardingEmployee[]> {
  const supabase = createClient()
  const data = await fetchLiveComplianceData(supabase as never)

  return data.employees.map((employee: { id: string; name: string; onboardingStatus: string }) => {
    const completedStepIds =
      employee.onboardingStatus === "Complete"
        ? [1, 2, 3, 4, 5, 6, 7, 8]
        : employee.onboardingStatus === "In Progress"
          ? [1, 2, 3, 5]
          : [1]

    return {
      id: employee.id,
      name: employee.name,
      initials: initialsFromName(employee.name),
      role: "Employee",
      startDate: "—",
      completedStepIds,
    }
  })
}
