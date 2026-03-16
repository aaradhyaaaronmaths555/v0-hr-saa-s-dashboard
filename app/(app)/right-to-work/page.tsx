import { createClient } from "@/lib/supabase/server"
import {
  getEmployeesForOrg,
  getRightToWorkForOrg,
  type LiveEmployee,
} from "@/lib/supabase/live-data"
import { RightToWorkClient } from "@/components/right-to-work/right-to-work-client"
import { getCurrentUserAndOrganisation } from "@/lib/supabase/auth-context"
import { parseVisaTypeForResidency, type ResidencyStatus } from "@/lib/right-to-work/residency"

type RightToWorkRow = {
  id: string | null
  employeeId: string
  employeeName: string
  residencyStatus: ResidencyStatus
  visaSubtype: string
  visaExpiryDate: string | null
}

export default async function RightToWorkPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string }>
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const supabase = await createClient()
  const { organisationId } = await getCurrentUserAndOrganisation(supabase as never)
  const employees = organisationId
    ? await getEmployeesForOrg(supabase as never, organisationId)
    : []
  const employeeIds = new Set(employees.map((employee) => employee.id))
  const visaRows = organisationId
    ? await getRightToWorkForOrg(supabase as never, employeeIds)
    : []
  const visaByEmployeeId = new Map(
    visaRows.map((visa) => [visa.employeeId, visa] as const)
  )

  const rows: RightToWorkRow[] = employees.map((employee: LiveEmployee) => {
    const visa = visaByEmployeeId.get(employee.id)
    const parsed = parseVisaTypeForResidency(visa?.visaType ?? "")

    return {
      id: visa?.id ?? null,
      employeeId: employee.id,
      employeeName: employee.name,
      residencyStatus: parsed.residencyStatus,
      visaSubtype: parsed.visaSubtype,
      visaExpiryDate: visa?.visaExpiryDate ?? null,
    }
  })

  return (
    <RightToWorkClient
      initialRows={rows}
      showSuccess={!!resolvedSearchParams?.success}
    />
  )
}
