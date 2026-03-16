import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import {
  formatDate,
  getEmployeesForOrg,
  getPoliciesForOrg,
  getPolicyAcknowledgementsForOrg,
  getPolicyReminderSchedulesForOrg,
} from "@/lib/supabase/live-data"
import type { LivePolicy } from "@/lib/supabase/live-data"
import { SendRemindersButton } from "@/components/policies/send-reminders-button"
import { AutoRemindToggle } from "@/components/policies/auto-remind-toggle"
import { DeletePolicyButton } from "@/components/policies/delete-policy-button"
import { getPolicyCompletionStatsMap } from "@/lib/policies/reminders"
import { Button } from "@/components/ui/button"
import { getCurrentUserAndOrganisation } from "@/lib/supabase/auth-context"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { PolicyCompletionBadge } from "@/components/shared/status-badges"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function PoliciesPage({
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
  const policies = organisationId
    ? await getPoliciesForOrg(supabase as never, organisationId)
    : []
  const employeeIds = new Set(employees.map((employee) => employee.id))
  const policyIds = new Set(policies.map((policy) => policy.id))
  const acknowledgements = await getPolicyAcknowledgementsForOrg(
    supabase as never,
    policyIds,
    employeeIds
  )

  const completionByPolicy = getPolicyCompletionStatsMap(
    policies,
    employees,
    acknowledgements
  )
  const scheduleRows = organisationId
    ? await getPolicyReminderSchedulesForOrg(supabase as never, organisationId)
    : []
  const autoRemindByPolicy = new Map<string, boolean>(
    (scheduleRows ?? []).map(
      (row: { policyId?: string; autoRemindEnabled?: boolean }) =>
        [row.policyId ?? "", !!row.autoRemindEnabled] as const
    )
  )

  return (
    <div className="flex w-full flex-col gap-8">
      <PageHeader
        title="Policies"
        description="Publish clear policies, track acknowledgements, and follow up with reminders."
        action={
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
            <Button asChild>
              <Link href="/policies/new">Create Policy</Link>
            </Button>
            <SendRemindersButton />
          </div>
        }
      />
      {resolvedSearchParams?.success ? (
        <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm leading-6 text-green-700">
          {resolvedSearchParams.success === "policy-deleted"
            ? "Policy deleted successfully."
            : "Policy saved successfully."}
        </div>
      ) : null}

      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Policy</TableHead>
            <TableHead className="hidden lg:table-cell">Description</TableHead>
            <TableHead className="hidden xl:table-cell text-right">Created</TableHead>
            <TableHead>Completion</TableHead>
            <TableHead className="text-right">Pending</TableHead>
            <TableHead className="hidden lg:table-cell">Auto-remind</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {policies.map((policy: LivePolicy) => {
            const completion = completionByPolicy.get(policy.id)
            const total = completion?.totalEmployees ?? 0
            const acknowledged = completion?.acknowledgedCount ?? 0
            const pending = Math.max(total - acknowledged, 0)
            const completionText = `${acknowledged}/${total} employees (${completion?.completionPercentage ?? 0}%)`
            return (
              <TableRow key={policy.id}>
                <TableCell className="text-slate-800">
                  <Link href={`/policies/${policy.id}`} className="font-medium hover:underline">
                    {policy.title}
                  </Link>
                </TableCell>
                <TableCell className="hidden lg:table-cell">{policy.description ?? "—"}</TableCell>
                <TableCell className="hidden text-right tabular-nums xl:table-cell">
                  {formatDate(policy.createdAt)}
                </TableCell>
                <TableCell className="font-medium text-slate-900">{completionText}</TableCell>
                <TableCell className="text-right font-medium tabular-nums text-slate-900">
                  {pending}/{total}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <AutoRemindToggle
                    policyId={policy.id}
                    initialEnabled={autoRemindByPolicy.get(policy.id) ?? false}
                  />
                </TableCell>
                <TableCell>
                  <PolicyCompletionBadge pending={pending} />
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <Link href={`/policies/${policy.id}/edit`}>Edit</Link>
                    </Button>
                    <DeletePolicyButton policyId={policy.id} policyTitle={policy.title} compact />
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {policies.length === 0 ? (
        <EmptyState
          title="No policies yet"
          description="Create your first policy so employees can review and acknowledge it."
          actionLabel="Create Policy"
          actionHref="/policies/new"
        />
      ) : null}
    </div>
  )
}
