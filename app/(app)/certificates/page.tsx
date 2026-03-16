import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CertificateSuccessBanner } from "@/components/certificates/certificate-success-banner"
import { DeleteCertificateButton } from "@/components/certificates/delete-certificate-button"
import { CertificateStatusBadge } from "@/components/shared/status-badges"
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
  formatDate,
  getCertificatesForOrg,
  getEmployeesForOrg,
} from "@/lib/supabase/live-data"
import type { LiveCertificate, LiveEmployee } from "@/lib/supabase/live-data"
import { getCertificateAlertBuckets } from "@/lib/compliance/metrics"
import { getCurrentUserAndOrganisation } from "@/lib/supabase/auth-context"

function daysRemaining(expiryDate: string | null): number | null {
  if (!expiryDate) return null
  const now = new Date()
  const end = new Date(expiryDate)
  if (Number.isNaN(end.getTime())) return null
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export default async function CertificatesPage({
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
  const certificates = await getCertificatesForOrg(supabase as never, employeeIds)
  const employeeById = new Map<string, LiveEmployee>(
    employees.map((employee: LiveEmployee) => [employee.id, employee] as const)
  )
  const alertBuckets = getCertificateAlertBuckets(certificates)

  return (
    <div className="flex w-full flex-col gap-8">
      <PageHeader
        title="Certificates"
        description="Track licences and qualifications so you can spot expiries before they become a risk."
        action={
          <Button asChild>
            <Link href="/certificates/new">Upload Certificate</Link>
          </Button>
        }
      />
      {resolvedSearchParams?.success ? (
        <CertificateSuccessBanner success={resolvedSearchParams.success} />
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          Expiry Risk Summary
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Focus on expired and near-expiry certificates first.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Badge variant="destructive" className="text-sm font-medium">
            Expired: {alertBuckets.expired}
          </Badge>
          <Badge variant="warning" className="text-sm font-medium">
            Due in 30 days: {alertBuckets.dueIn30}
          </Badge>
          <Badge variant="warning" className="text-sm font-medium">
            Due in 60 days: {alertBuckets.dueIn60}
          </Badge>
          <Badge variant="warning" className="text-sm font-medium">
            Due in 90 days: {alertBuckets.dueIn90}
          </Badge>
        </div>
      </section>

      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Certificate</TableHead>
            <TableHead className="hidden xl:table-cell text-right">Issue Date</TableHead>
            <TableHead className="text-right">Expiry Date</TableHead>
            <TableHead className="text-right">Days Left</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {certificates.map((cert: LiveCertificate) => {
            const employee = employeeById.get(cert.employeeId)
            const days = daysRemaining(cert.expiryDate)
            return (
              <TableRow key={cert.id}>
                <TableCell>{employee?.name ?? "Unknown Employee"}</TableCell>
                <TableCell>{cert.type}</TableCell>
                <TableCell className="hidden text-right tabular-nums xl:table-cell">
                  {formatDate(cert.issueDate)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {cert.expiryDate ? (
                    formatDate(cert.expiryDate)
                  ) : (
                    <span className="font-medium text-red-600">Expiry required</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums text-slate-900">
                  {days ?? "—"}
                </TableCell>
                <TableCell>
                  <CertificateStatusBadge status={cert.status} />
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <Link href={`/certificates/${cert.id}/edit`}>Edit</Link>
                    </Button>
                    <DeleteCertificateButton
                      certificateId={cert.id}
                      certificateType={cert.type}
                      compact
                    />
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {certificates.length === 0 ? (
        <EmptyState
          title="No certificates yet"
          description="Upload your first certificate to start expiry alerts and compliance monitoring."
        />
      ) : null}
    </div>
  )
}
