import type {
  LiveCertificate,
  LiveEmployee,
  LivePolicy,
  LivePolicyAcknowledgement,
} from "@/lib/supabase/live-data"

export type CertificateAlertBuckets = {
  expired: number
  dueIn30: number
  dueIn60: number
  dueIn90: number
  totalFlagged: number
}

export type EmployeeComplianceScore = {
  employeeId: string
  score: number
  validCertificates: number
  totalCertificates: number
  acknowledgedPolicies: number
  totalPolicies: number
}

export function getDaysUntil(dateIso: string | null): number | null {
  if (!dateIso) return null
  const expiry = new Date(dateIso)
  if (Number.isNaN(expiry.getTime())) return null
  const now = new Date()
  return Math.ceil((expiry.getTime() - now.getTime()) / 86400000)
}

export function getCertificateAlertBuckets(
  certificates: LiveCertificate[]
): CertificateAlertBuckets {
  let expired = 0
  let dueIn30 = 0
  let dueIn60 = 0
  let dueIn90 = 0

  for (const cert of certificates) {
    const days = getDaysUntil(cert.expiryDate)
    if (cert.status === "Expired" || (days !== null && days < 0)) {
      expired += 1
      continue
    }
    if (days === null) continue
    if (days <= 30) {
      dueIn30 += 1
    } else if (days <= 60) {
      dueIn60 += 1
    } else if (days <= 90) {
      dueIn90 += 1
    }
  }

  return {
    expired,
    dueIn30,
    dueIn60,
    dueIn90,
    totalFlagged: expired + dueIn30 + dueIn60 + dueIn90,
  }
}

export function getEmployeeComplianceScores(
  employees: LiveEmployee[],
  certificates: LiveCertificate[],
  policies: LivePolicy[],
  acknowledgements: LivePolicyAcknowledgement[]
): Map<string, EmployeeComplianceScore> {
  const validCertByEmployee = new Map<string, number>()
  const totalCertByEmployee = new Map<string, number>()
  const ackByEmployee = new Map<string, number>()
  const totalPolicies = policies.length

  for (const cert of certificates) {
    totalCertByEmployee.set(
      cert.employeeId,
      (totalCertByEmployee.get(cert.employeeId) ?? 0) + 1
    )
    if (cert.status === "Valid") {
      validCertByEmployee.set(
        cert.employeeId,
        (validCertByEmployee.get(cert.employeeId) ?? 0) + 1
      )
    }
  }

  for (const ack of acknowledgements) {
    if (!ack.acknowledgedAt) continue
    ackByEmployee.set(ack.employeeId, (ackByEmployee.get(ack.employeeId) ?? 0) + 1)
  }

  const output = new Map<string, EmployeeComplianceScore>()
  for (const employee of employees) {
    const validCertificates = validCertByEmployee.get(employee.id) ?? 0
    const totalCertificates = totalCertByEmployee.get(employee.id) ?? 0
    const acknowledgedPolicies = ackByEmployee.get(employee.id) ?? 0

    const certRatio =
      totalCertificates > 0 ? validCertificates / totalCertificates : 0
    const policyRatio =
      totalPolicies > 0 ? acknowledgedPolicies / totalPolicies : 0
    const score = Math.round(((certRatio + policyRatio) / 2) * 100)

    output.set(employee.id, {
      employeeId: employee.id,
      score,
      validCertificates,
      totalCertificates,
      acknowledgedPolicies,
      totalPolicies,
    })
  }

  return output
}
