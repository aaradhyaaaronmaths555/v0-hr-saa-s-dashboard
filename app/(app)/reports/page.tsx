import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  fetchLiveComplianceData,
  getWHSIncidentsForOrg,
} from "@/lib/supabase/live-data"
import type { LiveEmployee } from "@/lib/supabase/live-data"
import { getEmployeeComplianceScores } from "@/lib/compliance/metrics"

export default async function ReportsPage({
  searchParams,
}: {
  searchParams?: Promise<{ prepare?: string }>
}) {
  const auditPreviewUrl = "/audit-export"
  const prepareHref = "/reports?prepare=1"
  const resolvedSearchParams = searchParams
    ? await searchParams
    : undefined
  const shouldPrepareAudit = resolvedSearchParams?.prepare === "1"
  const supabase = await createClient()
  const data = await fetchLiveComplianceData(supabase as never)
  const whsRows = data.organisationId
    ? await getWHSIncidentsForOrg(supabase as never, data.organisationId)
    : []
  const complianceScores = getEmployeeComplianceScores(
    data.employees,
    data.certificates,
    data.policies,
    data.acknowledgements
  )
  const scoreValues = [...complianceScores.values()].map((item) => item.score)
  const averageScore =
    scoreValues.length > 0
      ? Math.round(scoreValues.reduce((sum, value) => sum + value, 0) / scoreValues.length)
      : 0

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
    <div className="flex w-full flex-col gap-8">
      <PageHeader
        title="Reports"
        description="Review your compliance position and export an audit-ready snapshot for inspectors."
        action={
          <Button asChild>
            <Link href={prepareHref}>
              Prepare Audit Report
            </Link>
          </Button>
        }
      />

      {shouldPrepareAudit ? (
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                Audit Report Preview
              </h2>
              <p className="text-sm text-slate-600">
                Report is prepared on this page. Use the report&apos;s print button to download PDF.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/reports">Close Preview</Link>
            </Button>
          </div>
          <iframe
            src={auditPreviewUrl}
            title="Audit report preview"
            className="h-[75vh] w-full rounded-lg border border-slate-200"
          />
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Employees
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            {data.employees.length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Certificates
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            {data.certificates.length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Policy Acknowledgements
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            {data.acknowledgements.filter((ack) => !!ack.acknowledgedAt).length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Avg Compliance Score
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            {averageScore}%
          </p>
        </div>
      </section>

      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead className="hidden lg:table-cell">Onboarding</TableHead>
            <TableHead className="text-right">Certificates</TableHead>
            <TableHead className="text-right">Policy Acks</TableHead>
            <TableHead className="text-right">Compliance Score</TableHead>
            <TableHead>Overall</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.employees.map((employee: LiveEmployee) => {
            const certCount = certCountByEmployee.get(employee.id) ?? 0
            const ackCount = policyAcksByEmployee.get(employee.id) ?? 0
            const score = complianceScores.get(employee.id)?.score ?? 0
            const status = score >= 80 ? "Compliant" : "Action Needed"

            return (
              <TableRow key={employee.id}>
                <TableCell>{employeeById.get(employee.id)?.name}</TableCell>
                <TableCell className="hidden lg:table-cell">{employee.onboardingStatus}</TableCell>
                <TableCell className="text-right font-medium tabular-nums text-slate-900">
                  {certCount}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums text-slate-900">
                  {ackCount}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums text-slate-900">
                  {score}%
                </TableCell>
                <TableCell>
                  <Badge variant={status === "Compliant" ? "success" : "warning"}>
                    {status}
                  </Badge>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {data.employees.length === 0 ? (
        <EmptyState
          title="No report data yet"
          description="Add employees and compliance records first, then return here for reporting."
          actionLabel="Add Employee"
          actionHref="/employees/new"
        />
      ) : null}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            WHS Incident Lifecycle
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-700 sm:grid-cols-4 md:grid-cols-2 xl:grid-cols-4">
            <p>New: {whsStatusCounts.New}</p>
            <p>In review: {whsStatusCounts["In review"]}</p>
            <p>Actioned: {whsStatusCounts.Actioned}</p>
            <p>Closed: {whsStatusCounts.Closed}</p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">WHS Risk Flags</h2>
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
      </section>
    </div>
  )
}
