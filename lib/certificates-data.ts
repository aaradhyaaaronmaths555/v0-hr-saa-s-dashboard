/**
 * Shared certificate data and badge count for Certificates page and sidebar.
 * Replace with API calls in production.
 */

import {
  getMissingRequiredCerts,
  ROLE_REQUIRED_CREDENTIALS,
} from "./required-credentials"

export type CertStatus = "Valid" | "Expiring" | "Expired"

export type CertificateRow = {
  id: string
  employeeId: string
  employeeName: string
  employeeInitials: string
  employeeRole: string
  certificateType: string
  issueDate: string
  expiryDate: string
  daysRemaining: number
  status: CertStatus
}

export const EMPLOYEE_ROLES: Record<string, string> = {
  e1: "Personal Care Assistant",
  e2: "Support Worker",
  e3: "Enrolled Nurse",
  e4: "Personal Care Assistant",
  e5: "Registered Nurse",
  e6: "Support Worker",
  e7: "Support Worker",
  e8: "Personal Care Assistant",
}

export const CERTIFICATES: CertificateRow[] = [
  { id: "c1", employeeId: "e1", employeeName: "Sarah Mitchell", employeeInitials: "SM", employeeRole: "Personal Care Assistant", certificateType: "First Aid", issueDate: "15 Mar 2023", expiryDate: "14 Mar 2026", daysRemaining: 320, status: "Valid" },
  { id: "c2", employeeId: "e2", employeeName: "James Thompson", employeeInitials: "JT", employeeRole: "Support Worker", certificateType: "NDIS Worker Screening", issueDate: "22 Nov 2023", expiryDate: "21 Nov 2025", daysRemaining: 42, status: "Expiring" },
  { id: "c3", employeeId: "e3", employeeName: "Maria Lopez", employeeInitials: "ML", employeeRole: "Enrolled Nurse", certificateType: "Food Safety Certificate", issueDate: "09 Jan 2022", expiryDate: "08 Jan 2027", daysRemaining: 680, status: "Valid" },
  { id: "c4", employeeId: "e4", employeeName: "Tom Bradley", employeeInitials: "TB", employeeRole: "Personal Care Assistant", certificateType: "Police Check", issueDate: "05 Sep 2023", expiryDate: "04 Sep 2024", daysRemaining: -144, status: "Expired" },
  { id: "c5", employeeId: "e5", employeeName: "Rachel Park", employeeInitials: "RP", employeeRole: "Registered Nurse", certificateType: "Manual Handling", issueDate: "10 Jul 2024", expiryDate: "09 Jul 2026", daysRemaining: 499, status: "Valid" },
  { id: "c6", employeeId: "e6", employeeName: "Lisa Kim", employeeInitials: "LK", employeeRole: "Support Worker", certificateType: "First Aid", issueDate: "21 Nov 2023", expiryDate: "20 Nov 2025", daysRemaining: 48, status: "Expiring" },
  { id: "c7", employeeId: "e7", employeeName: "David Chen", employeeInitials: "DC", employeeRole: "Support Worker", certificateType: "NDIS Worker Screening", issueDate: "03 Oct 2022", expiryDate: "02 Oct 2025", daysRemaining: 12, status: "Expiring" },
  { id: "c8", employeeId: "e8", employeeName: "Emma Wilson", employeeInitials: "EW", employeeRole: "Personal Care Assistant", certificateType: "Food Safety Certificate", issueDate: "28 Jan 2024", expiryDate: "27 Jan 2025", daysRemaining: -30, status: "Expired" },
  { id: "c9", employeeId: "e3", employeeName: "Maria Lopez", employeeInitials: "ML", employeeRole: "Enrolled Nurse", certificateType: "Manual Handling", issueDate: "18 Jun 2023", expiryDate: "17 Jun 2026", daysRemaining: 478, status: "Valid" },
  { id: "c10", employeeId: "e1", employeeName: "Sarah Mitchell", employeeInitials: "SM", employeeRole: "Personal Care Assistant", certificateType: "Police Check", issueDate: "12 Mar 2024", expiryDate: "11 Mar 2027", daysRemaining: 714, status: "Valid" },
  { id: "c11", employeeId: "e1", employeeName: "Sarah Mitchell", employeeInitials: "SM", employeeRole: "Personal Care Assistant", certificateType: "Manual Handling", issueDate: "10 Jan 2024", expiryDate: "09 Jan 2027", daysRemaining: 680, status: "Valid" },
  { id: "c12", employeeId: "e1", employeeName: "Sarah Mitchell", employeeInitials: "SM", employeeRole: "Personal Care Assistant", certificateType: "Food Safety Certificate", issueDate: "05 Mar 2024", expiryDate: "04 Mar 2027", daysRemaining: 365, status: "Valid" },
  { id: "c13", employeeId: "e3", employeeName: "Maria Lopez", employeeInitials: "ML", employeeRole: "Enrolled Nurse", certificateType: "First Aid", issueDate: "01 Jun 2024", expiryDate: "31 May 2027", daysRemaining: 459, status: "Valid" },
  { id: "c14", employeeId: "e5", employeeName: "Rachel Park", employeeInitials: "RP", employeeRole: "Registered Nurse", certificateType: "First Aid", issueDate: "15 Feb 2024", expiryDate: "14 Feb 2027", daysRemaining: 354, status: "Valid" },
]

/** Certs expiring within 30 days (valid status, days 0-30) or already expired */
function getExpiringOrExpiredCount(certs: CertificateRow[]): number {
  return certs.filter(
    (c) =>
      c.status === "Expired" ||
      (c.status === "Expiring" && c.daysRemaining >= 0 && c.daysRemaining <= 30)
  ).length
}

/** Count of employees who have at least one missing required cert for their role */
function getEmployeesWithMissingRequiredCount(certs: CertificateRow[]): number {
  const byEmployee = new Map<string, { certificateType: string; status: string }[]>()
  const employeeRoles = new Map<string, string>()
  for (const c of certs) {
    if (!byEmployee.has(c.employeeId)) {
      byEmployee.set(c.employeeId, [])
      employeeRoles.set(c.employeeId, c.employeeRole)
    }
    byEmployee.get(c.employeeId)!.push({
      certificateType: c.certificateType,
      status: c.status,
    })
  }
  let count = 0
  for (const [empId, empCerts] of byEmployee) {
    const role = employeeRoles.get(empId) ?? ""
    const missing = getMissingRequiredCerts(role, empCerts)
    if (missing.length > 0) count++
  }
  return count
}

/** Badge count for Certificates nav: expiring/expired + employees with missing required certs */
export function getCertificatesBadgeCount(): number {
  const expiring = getExpiringOrExpiredCount(CERTIFICATES)
  const missing = getEmployeesWithMissingRequiredCount(CERTIFICATES)
  return expiring + missing
}
