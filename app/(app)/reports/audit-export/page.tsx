import { createClient } from "@/lib/supabase/server"
import {
  fetchLiveComplianceData,
  formatDate,
  getPoliciesForOrg,
  getWHSIncidentsForOrg,
  type LiveCertificate,
  type LiveEmployee,
  type LivePolicy,
  type LivePolicyAcknowledgement,
} from "@/lib/supabase/live-data"
import { getDaysUntil } from "@/lib/compliance/metrics"
import { AuditPrintControls } from "@/components/reports/audit-print-controls"

function normalizeCertificateStatus(status: string, expiryDate: string | null) {
  const days = getDaysUntil(expiryDate)
  if (status === "Expired" || (days !== null && days < 0)) return "expired"
  if (days !== null && days <= 30) return "expiring soon"
  return "valid"
}

function parseEmployeesInvolved(value: string | null | undefined) {
  if (!value) return []
  return value
    .split(/[,;\n]/g)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
}

export default async function AuditExportPage({
  searchParams,
}: {
  searchParams?: Promise<{ print?: string }>
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const supabase = await createClient()
  const data = await fetchLiveComplianceData(supabase as never)

  const [incidents, policyRows] = data.organisationId
    ? await Promise.all([
        getWHSIncidentsForOrg(supabase as never, data.organisationId),
        getPoliciesForOrg(supabase as never, data.organisationId),
      ])
    : [[], []]

  const acknowledgementsByEmployee = new Map<string, LivePolicyAcknowledgement[]>()
  for (const ack of data.acknowledgements) {
    const list = acknowledgementsByEmployee.get(ack.employeeId) ?? []
    list.push(ack)
    acknowledgementsByEmployee.set(ack.employeeId, list)
  }

  const certificatesByEmployee = new Map<string, typeof data.certificates>()
  for (const cert of data.certificates) {
    const list = certificatesByEmployee.get(cert.employeeId) ?? []
    list.push(cert)
    certificatesByEmployee.set(cert.employeeId, list)
  }

  const policyById = new Map<string, string>()
  for (const policy of data.policies as LivePolicy[]) {
    policyById.set(policy.id, policy.title)
  }

  const incidentsByEmployee = new Map<string, Array<(typeof incidents)[number]>>()
  for (const incident of incidents) {
    const involved = parseEmployeesInvolved(incident.employeesInvolved)
    if (involved.length === 0) continue
    for (const employee of data.employees) {
      const name = employee.name.toLowerCase()
      if (!involved.some((item) => name.includes(item) || item.includes(name))) continue
      const list = incidentsByEmployee.get(employee.id) ?? []
      list.push(incident)
      incidentsByEmployee.set(employee.id, list)
    }
  }

  // Organisation summary
  let validCerts = 0
  let expiringCerts = 0
  let expiredCerts = 0
  for (const cert of data.certificates) {
    const status = normalizeCertificateStatus(cert.status, cert.expiryDate)
    if (status === "valid") validCerts += 1
    else if (status === "expiring soon") expiringCerts += 1
    else expiredCerts += 1
  }

  const policyCreatedById = new Map(
    policyRows.map((row) => [row.id, row.createdAt ?? null] as const)
  )
  let unackPastDeadline = 0
  for (const policy of data.policies as LivePolicy[]) {
    const createdAt = policyCreatedById.get(policy.id)
    if (!createdAt) continue
    const deadline = new Date(createdAt)
    deadline.setDate(deadline.getDate() + 14)
    if (deadline.getTime() > Date.now()) continue

    const acknowledged = new Set(
      data.acknowledgements
        .filter(
          (ack: LivePolicyAcknowledgement) =>
            ack.policyId === policy.id && !!ack.acknowledgedAt
        )
        .map((ack: LivePolicyAcknowledgement) => ack.employeeId)
    )
    unackPastDeadline += data.employees.filter(
      (employee: LiveEmployee) => !acknowledged.has(employee.id)
    ).length
  }

  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
  const incidentStatusCount = new Map<string, number>()
  for (const incident of incidents) {
    const incidentDate = incident.incidentDate ? new Date(incident.incidentDate) : null
    if (!incidentDate || Number.isNaN(incidentDate.getTime())) continue
    if (incidentDate < oneYearAgo) continue
    const status = incident.status ?? "Open"
    incidentStatusCount.set(status, (incidentStatusCount.get(status) ?? 0) + 1)
  }

  const autoPrint = resolvedSearchParams?.print === "1"
  const generatedAt = new Date().toLocaleString("en-AU")

  return (
    <div className="min-h-svh bg-white px-4 py-6 sm:px-6 lg:px-8">
      <AuditPrintControls autoPrint={autoPrint} />

      <h2 className="text-xl font-semibold text-slate-900">Evidence of Compliance</h2>
      <p className="mt-1 text-sm text-slate-600">Generated: {generatedAt}</p>

      <section className="mt-6 rounded-xl border border-slate-200 p-4">
        <h3 className="text-base font-semibold text-slate-900">Organisation Summary</h3>
        <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-700 sm:grid-cols-2">
          <p>Total employees: {data.employees.length}</p>
          <p>Certificates valid: {validCerts}</p>
          <p>Certificates expiring soon: {expiringCerts}</p>
          <p>Certificates expired: {expiredCerts}</p>
          <p>Unacknowledged policies past deadline: {unackPastDeadline}</p>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 p-4">
        <h3 className="text-base font-semibold text-slate-900">
          WHS Incidents (Last 12 Months)
        </h3>
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-700">
          {incidentStatusCount.size === 0 ? (
            <p>No incidents recorded in last 12 months.</p>
          ) : (
            [...incidentStatusCount.entries()].map(([status, count]) => (
              <p key={status}>
                {status}: {count}
              </p>
            ))
          )}
        </div>
      </section>

      <section className="mt-8">
        <h3 className="text-base font-semibold text-slate-900">
          Per Employee Compliance Evidence
        </h3>
        <div className="mt-4 space-y-4">
          {data.employees.map((employee: LiveEmployee) => {
            const certificates = certificatesByEmployee.get(employee.id) ?? []
            const acknowledgements = acknowledgementsByEmployee.get(employee.id) ?? []
            const employeeIncidents = incidentsByEmployee.get(employee.id) ?? []

            return (
              <div key={employee.id} className="rounded-xl border border-slate-200 p-4">
                <h4 className="text-sm font-semibold text-slate-900">
                  {employee.name}
                </h4>
                <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-slate-700 sm:grid-cols-3">
                  <p>Role: {employee.role ?? "—"}</p>
                  <p>Department: {employee.department ?? "—"}</p>
                  <p>Start date: {formatDate(employee.startDate)}</p>
                </div>

                <div className="mt-4">
                  <p className="text-sm font-medium text-slate-800">Certificates</p>
                  {certificates.length === 0 ? (
                    <p className="mt-1 text-sm text-slate-600">No certificates recorded.</p>
                  ) : (
                    <div className="mt-2 overflow-x-auto">
                      <table className="w-full border-collapse text-sm">
                        <thead className="bg-slate-50 text-left text-slate-600">
                          <tr>
                            <th className="border-b border-slate-200 px-2 py-1">Type</th>
                            <th className="border-b border-slate-200 px-2 py-1">Issue</th>
                            <th className="border-b border-slate-200 px-2 py-1">Expiry</th>
                            <th className="border-b border-slate-200 px-2 py-1">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {certificates.map((cert: LiveCertificate) => {
                            const status = normalizeCertificateStatus(
                              cert.status,
                              cert.expiryDate
                            )
                            return (
                              <tr key={cert.id} className="border-t border-slate-100">
                                <td className="px-2 py-1 text-slate-800">{cert.type}</td>
                                <td className="px-2 py-1 text-slate-700">
                                  {formatDate(cert.issueDate)}
                                </td>
                                <td className="px-2 py-1 text-slate-700">
                                  {formatDate(cert.expiryDate)}
                                </td>
                                <td className="px-2 py-1 text-slate-700">{status}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <p className="text-sm font-medium text-slate-800">
                    Policies Acknowledged
                  </p>
                  {acknowledgements.filter((ack) => !!ack.acknowledgedAt).length === 0 ? (
                    <p className="mt-1 text-sm text-slate-600">
                      No policy acknowledgements recorded.
                    </p>
                  ) : (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                      {acknowledgements
                        .filter((ack) => !!ack.acknowledgedAt)
                        .map((ack) => (
                          <li key={ack.id}>
                            {(policyById.get(ack.policyId) ?? "Policy")} -{" "}
                            {ack.acknowledgedAt
                              ? new Date(ack.acknowledgedAt).toLocaleString("en-AU")
                              : "—"}
                          </li>
                        ))}
                    </ul>
                  )}
                </div>

                <div className="mt-4">
                  <p className="text-sm font-medium text-slate-800">
                    WHS Incidents Involved
                  </p>
                  {employeeIncidents.length === 0 ? (
                    <p className="mt-1 text-sm text-slate-600">
                      No WHS incidents linked to this employee.
                    </p>
                  ) : (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                      {employeeIncidents.map((incident) => (
                        <li key={incident.id}>
                          {(incident.incidentType ?? "Incident")} -{" "}
                          {(incident.status ?? "Open")} -{" "}
                          {incident.incidentDate
                            ? new Date(incident.incidentDate).toLocaleDateString("en-AU")
                            : "Date unknown"}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <h3 className="text-base font-semibold text-amber-900">Outstanding Risks</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900">
          <li>Expired certificates: {expiredCerts}</li>
          <li>Certificates expiring soon: {expiringCerts}</li>
          <li>Unacknowledged policies past deadline: {unackPastDeadline}</li>
          <li>
            Open WHS incidents:{" "}
            {incidents.filter((item) => (item.status ?? "Open") !== "Closed")
              .length}
          </li>
        </ul>
      </section>

      <footer className="mt-8 border-t border-slate-200 pt-4 text-xs text-slate-500">
        This report is formatted for Fair Work and WHS inspection evidence review.
      </footer>
    </div>
  )
}
