/**
 * Shared data for ACQSC audit reports.
 * Replace with real API data in production.
 */

export const AUDIT_REPORT_META = {
  providerName: "Sunrise Aged Care Pty Ltd",
  facilityName: "Sunrise Aged Care — Melbourne CBD",
  reportDate: new Date().toLocaleDateString("en-AU", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }),
  generatedAt: new Date().toLocaleString("en-AU", {
    dateStyle: "medium",
    timeStyle: "medium",
  }),
}

// Section 1: Staff Compliance Summary
export const STAFF_COMPLIANCE_ROWS = [
  { employeeName: "Sarah Mitchell", role: "Front of House Manager", onboardingComplete: "Yes", certsValid: "Yes", policiesAcknowledged: "Yes (3/3)", overallStatus: "Compliant" },
  { employeeName: "James Thompson", role: "Waitstaff", onboardingComplete: "No (3/6)", certsValid: "Expiring", policiesAcknowledged: "Partial (2/3)", overallStatus: "Action Needed" },
  { employeeName: "Maria Lopez", role: "Head Chef", onboardingComplete: "Yes", certsValid: "Yes", policiesAcknowledged: "Yes (3/3)", overallStatus: "Compliant" },
  { employeeName: "Tom Bradley", role: "Kitchen Hand", onboardingComplete: "No (1/6)", certsValid: "No", policiesAcknowledged: "No (0/2)", overallStatus: "Non-Compliant" },
  { employeeName: "Rachel Park", role: "Venue Manager", onboardingComplete: "Yes", certsValid: "Yes", policiesAcknowledged: "Yes (3/3)", overallStatus: "Compliant" },
  { employeeName: "Lisa Kim", role: "Assistant Manager", onboardingComplete: "No (4/6)", certsValid: "Expiring", policiesAcknowledged: "Partial (2/3)", overallStatus: "Action Needed" },
  { employeeName: "David Chen", role: "Bar Supervisor", onboardingComplete: "Yes", certsValid: "Expiring", policiesAcknowledged: "Yes (2/2)", overallStatus: "Action Needed" },
  { employeeName: "Emma Wilson", role: "Commis Chef", onboardingComplete: "No (2/6)", certsValid: "No", policiesAcknowledged: "Partial (1/2)", overallStatus: "Non-Compliant" },
] as const

// Section 2: Certificate Register
export const CERTIFICATE_REGISTER_ROWS = [
  { employee: "Sarah Mitchell", certType: "First Aid", issueDate: "15 Mar 2023", expiryDate: "14 Mar 2026", status: "Valid" },
  { employee: "Sarah Mitchell", certType: "Police Check", issueDate: "12 Mar 2024", expiryDate: "11 Mar 2027", status: "Valid" },
  { employee: "James Thompson", certType: "NDIS Worker Screening", issueDate: "22 Nov 2023", expiryDate: "21 Nov 2025", status: "Expiring" },
  { employee: "Maria Lopez", certType: "Food Safety Certificate", issueDate: "09 Jan 2022", expiryDate: "08 Jan 2027", status: "Valid" },
  { employee: "Maria Lopez", certType: "Manual Handling", issueDate: "18 Jun 2023", expiryDate: "17 Jun 2026", status: "Valid" },
  { employee: "Tom Bradley", certType: "Police Check", issueDate: "05 Sep 2023", expiryDate: "04 Sep 2024", status: "Expired" },
  { employee: "Rachel Park", certType: "Manual Handling", issueDate: "10 Jul 2024", expiryDate: "09 Jul 2026", status: "Valid" },
  { employee: "Lisa Kim", certType: "First Aid", issueDate: "21 Nov 2023", expiryDate: "20 Nov 2025", status: "Expiring" },
  { employee: "David Chen", certType: "NDIS Worker Screening", issueDate: "03 Oct 2022", expiryDate: "02 Oct 2025", status: "Expiring" },
  { employee: "Emma Wilson", certType: "Food Safety Certificate", issueDate: "28 Jan 2024", expiryDate: "27 Jan 2025", status: "Expired" },
] as const

// Section 3: Policy Acknowledgement Log (per-employee per-policy)
export const POLICY_ACKNOWLEDGEMENT_ROWS = [
  { policyName: "Workplace Health & Safety", assignedTo: "All staff", acknowledgedBy: "Sarah Mitchell", date: "02 Mar 2026", status: "Acknowledged" },
  { policyName: "Workplace Health & Safety", assignedTo: "All staff", acknowledgedBy: "James Thompson", date: "01 Mar 2026", status: "Acknowledged" },
  { policyName: "Workplace Health & Safety", assignedTo: "All staff", acknowledgedBy: "Maria Lopez", date: "28 Feb 2026", status: "Acknowledged" },
  { policyName: "Workplace Health & Safety", assignedTo: "All staff", acknowledgedBy: "Tom Bradley", date: "—", status: "Pending" },
  { policyName: "Workplace Health & Safety", assignedTo: "All staff", acknowledgedBy: "Rachel Park", date: "26 Feb 2026", status: "Acknowledged" },
  { policyName: "Privacy Policy", assignedTo: "All staff", acknowledgedBy: "Sarah Mitchell", date: "02 Mar 2026", status: "Acknowledged" },
  { policyName: "Privacy Policy", assignedTo: "All staff", acknowledgedBy: "Lisa Kim", date: "01 Mar 2026", status: "Acknowledged" },
  { policyName: "Code of Conduct", assignedTo: "All staff", acknowledgedBy: "Sarah Mitchell", date: "28 Feb 2026", status: "Acknowledged" },
  { policyName: "Code of Conduct", assignedTo: "All staff", acknowledgedBy: "Maria Lopez", date: "27 Feb 2026", status: "Acknowledged" },
  { policyName: "Anti-Bullying Policy", assignedTo: "Front of House, Kitchen", acknowledgedBy: "Sarah Mitchell", date: "25 Feb 2026", status: "Acknowledged" },
  { policyName: "Food Safety Policy", assignedTo: "Kitchen staff", acknowledgedBy: "Maria Lopez", date: "24 Feb 2026", status: "Acknowledged" },
] as const

// Section 4: Audit Trail (timestamped compliance events)
export const AUDIT_TRAIL_ROWS = [
  { timestamp: "26 Feb 2026, 10:45", event: "Sarah Mitchell acknowledged Workplace Health & Safety Policy" },
  { timestamp: "26 Feb 2026, 09:30", event: "Compliance reminder sent to 4 staff (overdue acknowledgements)" },
  { timestamp: "25 Feb 2026, 14:20", event: "Sarah Mitchell acknowledged Anti-Bullying Policy" },
  { timestamp: "25 Feb 2026, 11:00", event: "David Chen — First Aid certificate renewal uploaded" },
  { timestamp: "24 Feb 2026, 16:00", event: "Maria Lopez acknowledged Food Safety Policy" },
  { timestamp: "24 Feb 2026, 09:15", event: "Lisa Kim acknowledged Code of Conduct" },
  { timestamp: "23 Feb 2026, 13:30", event: "James Thompson acknowledged Workplace Health & Safety Policy" },
  { timestamp: "22 Feb 2026, 10:00", event: "Rachel Park acknowledged Privacy Policy" },
  { timestamp: "21 Feb 2026, 15:45", event: "Emma Wilson — Food Safety Certificate expired (overdue)" },
  { timestamp: "20 Feb 2026, 11:20", event: "Compliance report generated — Audit Export" },
  { timestamp: "19 Feb 2026, 14:00", event: "Tom Bradley added to system — onboarding started" },
  { timestamp: "18 Feb 2026, 09:00", event: "Maria Lopez acknowledged Manual Handling requirement" },
] as const
