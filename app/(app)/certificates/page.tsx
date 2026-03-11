import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { fetchLiveComplianceData, formatDate } from "@/lib/supabase/live-data"
import type { LiveCertificate, LiveEmployee } from "@/lib/supabase/live-data"
import { getCertificateAlertBuckets } from "@/lib/compliance/metrics"

function daysRemaining(expiryDate: string | null): number | null {
  if (!expiryDate) return null
  const now = new Date()
  const end = new Date(expiryDate)
  if (Number.isNaN(end.getTime())) return null
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function certVariant(status: string): "success" | "warning" | "destructive" | "neutral" {
  if (status === "Valid") return "success"
  if (status === "Expiring") return "warning"
  if (status === "Expired") return "destructive"
  return "neutral"
}

export default async function CertificatesPage() {
  const supabase = await createClient()
  const data = await fetchLiveComplianceData(supabase as never)
  const employeeById = new Map<string, LiveEmployee>(
    data.employees.map((employee: LiveEmployee) => [employee.id, employee] as const)
  )
  const alertBuckets = getCertificateAlertBuckets(data.certificates)

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Certificates</h1>
        <p className="mt-1 text-sm text-slate-600">Live certificate records from Supabase</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Badge variant="destructive">Expired: {alertBuckets.expired}</Badge>
        <Badge variant="warning">Due in 30 days: {alertBuckets.dueIn30}</Badge>
        <Badge variant="warning">Due in 60 days: {alertBuckets.dueIn60}</Badge>
        <Badge variant="warning">Due in 90 days: {alertBuckets.dueIn90}</Badge>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Employee</th>
              <th className="px-4 py-3 font-medium">Certificate</th>
              <th className="px-4 py-3 font-medium">Expiry</th>
              <th className="px-4 py-3 font-medium">Days Left</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.certificates.map((cert: LiveCertificate) => {
              const employee = employeeById.get(cert.employeeId)
              const days = daysRemaining(cert.expiryDate)
              return (
                <tr key={cert.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-800">{employee?.name ?? "Unknown Employee"}</td>
                  <td className="px-4 py-3 text-slate-700">{cert.type}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(cert.expiryDate)}</td>
                  <td className="px-4 py-3 text-slate-600">{days ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={certVariant(cert.status)}>{cert.status}</Badge>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {data.certificates.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-slate-500">
            No certificates found in Supabase yet.
          </div>
        )}
      </div>
    </div>
  )
}
