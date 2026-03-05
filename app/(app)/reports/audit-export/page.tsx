"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  AUDIT_REPORT_META,
  STAFF_COMPLIANCE_ROWS,
  CERTIFICATE_REGISTER_ROWS,
  POLICY_ACKNOWLEDGEMENT_ROWS,
  AUDIT_TRAIL_ROWS,
} from "@/lib/audit-report-data"
import { FileDown } from "lucide-react"

export default function AuditExportPage() {
  const searchParams = useSearchParams()

  const handlePrint = () => {
    window.print()
  }

  useEffect(() => {
    // Auto-trigger print when opened with ?print=1 (from Export Audit Report button)
    if (typeof window !== "undefined" && searchParams.get("print") === "1") {
      const timer = setTimeout(handlePrint, 600)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  return (
    <div className="min-h-svh bg-white">
      {/* Non-print: header with Download PDF button */}
      <div className="audit-report-no-print sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">
          ACQSC Compliance Audit Report
        </h1>
        <Button onClick={handlePrint} className="gap-2">
          <FileDown className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      {/* Print content */}
      <div className="audit-report-print px-8 py-8">
        {/* Header */}
        <header className="mb-8 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-white">P</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Compliance Report — {AUDIT_REPORT_META.facilityName}
              </h1>
              <p className="text-sm text-slate-600">
                Generated: {AUDIT_REPORT_META.generatedAt}
              </p>
            </div>
          </div>
        </header>

        {/* Report meta */}
        <div className="mb-8 flex flex-wrap gap-6 text-sm">
          <div>
            <span className="font-medium text-slate-500">Provider:</span>{" "}
            <span className="text-slate-900">{AUDIT_REPORT_META.providerName}</span>
          </div>
          <div>
            <span className="font-medium text-slate-500">Site:</span>{" "}
            <span className="text-slate-900">{AUDIT_REPORT_META.facilityName}</span>
          </div>
          <div>
            <span className="font-medium text-slate-500">Report date:</span>{" "}
            <span className="text-slate-900">{AUDIT_REPORT_META.reportDate}</span>
          </div>
        </div>

        {/* Section 1: Staff Compliance Summary */}
        <section className="mb-10">
          <h2 className="mb-4 border-b border-slate-200 pb-2 text-base font-semibold text-slate-900">
            Section 1: Staff Compliance Summary
          </h2>
          <div className="overflow-x-auto">
            <table className="audit-table w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">
                    Employee Name
                  </th>
                  <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">
                    Role
                  </th>
                  <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">
                    Onboarding Complete?
                  </th>
                  <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">
                    Certs Valid?
                  </th>
                  <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">
                    Policies Acknowledged?
                  </th>
                  <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">
                    Overall Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {STAFF_COMPLIANCE_ROWS.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                    <td className="border border-slate-200 px-3 py-2 text-slate-900">
                      {row.employeeName}
                    </td>
                    <td className="border border-slate-200 px-3 py-2 text-slate-700">
                      {row.role}
                    </td>
                    <td className="border border-slate-200 px-3 py-2 text-slate-700">
                      {row.onboardingComplete}
                    </td>
                    <td className="border border-slate-200 px-3 py-2 text-slate-700">
                      {row.certsValid}
                    </td>
                    <td className="border border-slate-200 px-3 py-2 text-slate-700">
                      {row.policiesAcknowledged}
                    </td>
                    <td className="border border-slate-200 px-3 py-2 text-slate-700">
                      {row.overallStatus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 2: Certificate Register */}
        <section className="mb-10">
          <h2 className="mb-4 border-b border-slate-200 pb-2 text-base font-semibold text-slate-900">
            Section 2: Certificate Register
          </h2>
          <div className="overflow-x-auto">
            <table className="audit-table w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">
                    Employee
                  </th>
                  <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">
                    Cert Type
                  </th>
                  <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">
                    Issue Date
                  </th>
                  <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">
                    Expiry Date
                  </th>
                  <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {CERTIFICATE_REGISTER_ROWS.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                    <td className="border border-slate-200 px-3 py-2 text-slate-900">
                      {row.employee}
                    </td>
                    <td className="border border-slate-200 px-3 py-2 text-slate-700">
                      {row.certType}
                    </td>
                    <td className="border border-slate-200 px-3 py-2 text-slate-700">
                      {row.issueDate}
                    </td>
                    <td className="border border-slate-200 px-3 py-2 text-slate-700">
                      {row.expiryDate}
                    </td>
                    <td className="border border-slate-200 px-3 py-2 text-slate-700">
                      {row.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: Policy Acknowledgement Log */}
        <section className="mb-10">
          <h2 className="mb-4 border-b border-slate-200 pb-2 text-base font-semibold text-slate-900">
            Section 3: Policy Acknowledgement Log
          </h2>
          <div className="overflow-x-auto">
            <table className="audit-table w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">
                    Policy Name
                  </th>
                  <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">
                    Assigned To
                  </th>
                  <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">
                    Acknowledged By
                  </th>
                  <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">
                    Date
                  </th>
                  <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {POLICY_ACKNOWLEDGEMENT_ROWS.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                    <td className="border border-slate-200 px-3 py-2 text-slate-900">
                      {row.policyName}
                    </td>
                    <td className="border border-slate-200 px-3 py-2 text-slate-700">
                      {row.assignedTo}
                    </td>
                    <td className="border border-slate-200 px-3 py-2 text-slate-700">
                      {row.acknowledgedBy}
                    </td>
                    <td className="border border-slate-200 px-3 py-2 text-slate-700">
                      {row.date}
                    </td>
                    <td className="border border-slate-200 px-3 py-2 text-slate-700">
                      {row.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4: Audit Trail */}
        <section className="mb-10">
          <h2 className="mb-4 border-b border-slate-200 pb-2 text-base font-semibold text-slate-900">
            Section 4: Audit Trail
          </h2>
          <p className="mb-4 text-sm text-slate-600">
            Timestamped log of all compliance events (acknowledgements, reminders
            sent, certificate uploads).
          </p>
          <div className="overflow-x-auto">
            <table className="audit-table w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">
                    Timestamp
                  </th>
                  <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">
                    Event
                  </th>
                </tr>
              </thead>
              <tbody>
                {AUDIT_TRAIL_ROWS.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                    <td className="border border-slate-200 px-3 py-2 text-slate-700">
                      {row.timestamp}
                    </td>
                    <td className="border border-slate-200 px-3 py-2 text-slate-900">
                      {row.event}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
          This report was auto-generated by PeopleDesk for ACQSC audit preparation.
        </footer>
      </div>
    </div>
  )
}
