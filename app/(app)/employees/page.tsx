import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DeleteEmployeeButton } from "@/components/employees/delete-employee-button"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import {
  ComplianceStatusBadge,
  OnboardingStatusBadge,
} from "@/components/shared/status-badges"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  getCertificatesForOrg,
  getEmployeesForOrg,
  getPoliciesForOrg,
  getPolicyAcknowledgementsForOrg,
  initialsFromName,
} from "@/lib/supabase/live-data"
import { getCurrentUserAndOrganisation } from "@/lib/supabase/auth-context"
import type { LiveEmployee } from "@/lib/supabase/live-data"
import { getEmployeeComplianceScores } from "@/lib/compliance/metrics"

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string }>
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const supabase = await createClient()
  const auth = await getCurrentUserAndOrganisation(supabase as never)
  const organisationId = auth.organisationId
  const employees = await getEmployeesForOrg(supabase as never, organisationId)
  const employeeIds = new Set(employees.map((employee) => employee.id))
  const [certificates, policies] = await Promise.all([
    getCertificatesForOrg(supabase as never, employeeIds),
    getPoliciesForOrg(supabase as never, organisationId),
  ])
  const policyIds = new Set(policies.map((policy) => policy.id))
  const acknowledgements = await getPolicyAcknowledgementsForOrg(
    supabase as never,
    policyIds,
    employeeIds
  )
  const certEmployeeIds = new Set(certificates.map((cert) => cert.employeeId))
  const complianceScores = getEmployeeComplianceScores(
    employees,
    certificates,
    policies,
    acknowledgements
  )

  return (
    <div className="flex w-full flex-col gap-8">
      <PageHeader
        title="Employees"
        description="Keep your team records up to date so onboarding and compliance tasks stay on track."
        action={
          <Button asChild>
            <Link href="/employees/new">Add Employee</Link>
          </Button>
        }
      />
      {resolvedSearchParams?.success ? (
        <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm leading-6 text-green-700">
          {resolvedSearchParams.success === "employee-deleted"
            ? "Employee deleted successfully."
            : "Employee saved successfully."}
        </div>
      ) : null}

      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead className="hidden lg:table-cell">Email</TableHead>
            <TableHead className="hidden xl:table-cell">Onboarding</TableHead>
            <TableHead className="hidden xl:table-cell">Compliance</TableHead>
            <TableHead className="text-right">Compliance Score</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee: LiveEmployee) => {
            const hasCert = certEmployeeIds.has(employee.id)
            const score = complianceScores.get(employee.id)?.score ?? 0
            return (
              <TableRow key={employee.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary-soft text-xs font-medium text-primary">
                        {initialsFromName(employee.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-slate-800">{employee.name}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden max-w-[18rem] truncate lg:table-cell" title={employee.email || "—"}>
                  {employee.email || "—"}
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <OnboardingStatusBadge status={employee.onboardingStatus} />
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <ComplianceStatusBadge compliant={hasCert} />
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums text-slate-900">
                  {score}%
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap justify-end gap-2 sm:flex-nowrap">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <Link href={`/employees/${employee.id}/edit`}>Edit</Link>
                    </Button>
                    <DeleteEmployeeButton
                      employeeId={employee.id}
                      employeeName={employee.name}
                      compact
                    />
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {employees.length === 0 ? (
        <EmptyState
          title="No employees yet"
          description="Add your first employee to start onboarding, policy acknowledgements, and certificate tracking."
        />
      ) : null}
    </div>
  )
}
