/**
 * Role-specific required credentials for aged care.
 * Used by Certificates page for compliance checks.
 */

export const ROLE_REQUIRED_CREDENTIALS: Record<
  string,
  { label: string; matches: string[] }[]
> = {
  "Personal Care Assistant": [
    { label: "First Aid & CPR (3yr)", matches: ["First Aid", "First Aid & CPR", "CPR"] },
    { label: "Manual Handling", matches: ["Manual Handling"] },
    { label: "NDIS Worker Screening", matches: ["NDIS Worker Screening", "NDIS Worker Screening Check"] },
    { label: "Food Safety Certificate", matches: ["Food Safety", "Food Safety Certificate"] },
  ],
  "Enrolled Nurse": [
    { label: "AHPRA Registration (annual)", matches: ["AHPRA", "AHPRA Registration"] },
    { label: "First Aid & CPR", matches: ["First Aid", "First Aid & CPR", "CPR"] },
    { label: "Manual Handling", matches: ["Manual Handling"] },
  ],
  "Registered Nurse": [
    { label: "AHPRA Registration (annual)", matches: ["AHPRA", "AHPRA Registration"] },
    { label: "First Aid & CPR", matches: ["First Aid", "First Aid & CPR", "CPR"] },
  ],
  "Support Worker": [
    { label: "NDIS Worker Screening", matches: ["NDIS Worker Screening", "NDIS Worker Screening Check"] },
    { label: "First Aid & CPR", matches: ["First Aid", "First Aid & CPR", "CPR"] },
    { label: "Manual Handling", matches: ["Manual Handling"] },
  ],
}

export type AgedCareRole = keyof typeof ROLE_REQUIRED_CREDENTIALS

export function getRequiredCertsForRole(role: string): { label: string }[] {
  const required = ROLE_REQUIRED_CREDENTIALS[role]
  if (!required) return []
  return required.map((r) => ({ label: r.label }))
}

export function getRequiredCertLabels(role: string): string[] {
  const required = ROLE_REQUIRED_CREDENTIALS[role]
  if (!required) return []
  return required.map((r) => r.label)
}

/** Check if a certificate type satisfies a required credential (by matching labels) */
function certSatisfiesRequired(certType: string, required: { label: string; matches: string[] }): boolean {
  const certLower = certType.toLowerCase()
  return required.matches.some((m) => certLower.includes(m.toLowerCase()))
}

/** Cert is considered "held" if valid or expiring (not expired) */
export function isCertHeld(status: string): boolean {
  return status === "Valid" || status === "Expiring"
}

/**
 * Returns the list of required credential labels that the employee is missing.
 * employeeCerts: array of { certificateType, status } for that employee
 */
export function getMissingRequiredCerts(
  role: string,
  employeeCerts: { certificateType: string; status: string }[]
): string[] {
  const required = ROLE_REQUIRED_CREDENTIALS[role]
  if (!required) return []

  const missing: string[] = []
  for (const req of required) {
    const hasValidOrExpiring = employeeCerts.some(
      (c) => certSatisfiesRequired(c.certificateType, req) && isCertHeld(c.status)
    )
    if (!hasValidOrExpiring) {
      missing.push(req.label)
    }
  }
  return missing
}

/**
 * Count of employees (by unique employeeId) who have at least one missing required cert.
 */
export function countEmployeesWithMissingCerts(
  employeeData: { employeeId: string; role: string }[],
  certsByEmployee: Record<string, { certificateType: string; status: string }[]>
): number {
  const employeeIds = [...new Set(employeeData.map((e) => e.employeeId))]
  let count = 0
  for (const empId of employeeIds) {
    const emp = employeeData.find((e) => e.employeeId === empId)
    if (!emp) continue
    const certs = certsByEmployee[empId] ?? []
    const missing = getMissingRequiredCerts(emp.role, certs)
    if (missing.length > 0) count++
  }
  return count
}
