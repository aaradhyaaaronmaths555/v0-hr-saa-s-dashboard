import { createClient } from "@/lib/supabase/client"
import { fetchLiveComplianceData } from "@/lib/supabase/live-data"

export async function getAuditReportMeta() {
  return {
    providerName: "PeopleDesk Organisation",
    facilityName: "PeopleDesk",
    reportDate: new Date().toLocaleDateString("en-AU"),
    generatedAt: new Date().toLocaleString("en-AU"),
  }
}

export async function getAuditSummaryRows() {
  const supabase = createClient()
  const data = await fetchLiveComplianceData(supabase as never)
  const certCount = new Map<string, number>()
  const ackCount = new Map<string, number>()

  for (const cert of data.certificates) {
    certCount.set(cert.employeeId, (certCount.get(cert.employeeId) ?? 0) + 1)
  }
  for (const ack of data.acknowledgements) {
    if (!ack.acknowledgedAt) continue
    ackCount.set(ack.employeeId, (ackCount.get(ack.employeeId) ?? 0) + 1)
  }

  return data.employees.map((employee: { id: string; name: string; onboardingStatus: string }) => ({
    employeeName: employee.name,
    onboardingComplete: employee.onboardingStatus,
    certificates: certCount.get(employee.id) ?? 0,
    policiesAcknowledged: ackCount.get(employee.id) ?? 0,
  }))
}
