import { createAdminClient } from "@/lib/supabase/admin"
import { getCurrentUserAndOrganisation } from "@/lib/supabase/auth-context"

type AnyRecord = Record<string, unknown>

function getReadClient(supabase: any) {
  return createAdminClient() ?? supabase
}

function readString(row: AnyRecord, keys: string[], fallback = ""): string {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === "string" && value.length > 0) return value
  }
  return fallback
}

function readNullableString(row: AnyRecord, keys: string[]): string | null {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === "string" && value.length > 0) return value
  }
  return null
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "NA"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

export function formatDate(date: string | null): string {
  if (!date) return "—"

  // Keep date-only values (YYYY-MM-DD) stable across timezones.
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1])
    const month = Number(dateOnlyMatch[2]) - 1
    const day = Number(dateOnlyMatch[3])
    const parsedDateOnly = new Date(year, month, day)
    if (Number.isNaN(parsedDateOnly.getTime())) return "—"
    return parsedDateOnly.toLocaleDateString("en-AU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return "—"
  return parsed.toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export type LiveEmployee = {
  id: string
  name: string
  email: string
  onboardingStatus: string
  organisationId: string
  role: string | null
  department: string | null
  startDate: string | null
}

export type LiveCertificate = {
  id: string
  employeeId: string
  type: string
  issueDate: string | null
  expiryDate: string | null
  status: string
}

export type LivePolicy = {
  id: string
  title: string
  description: string | null
  organisationId: string
  createdAt: string | null
}

export type LivePolicyAcknowledgement = {
  id: string
  policyId: string
  employeeId: string
  acknowledgedAt: string | null
}

type LiveWHSIncident = {
  id: string
  organisationId: string
  incidentType: string
  incidentDate: string | null
  employeesInvolved: string | null
  correctiveAction: string | null
  preventionSteps: string | null
  assignedTo: string | null
  dateClosed: string | null
  status: string
}

type LiveWHSIncidentTimeline = {
  id: string
  organisationId: string
  incidentId: string
  eventType: string
  statusFrom: string | null
  statusTo: string | null
  comment: string | null
  assignedTo: string | null
  createdAt: string | null
}

type LiveRightToWork = {
  id: string
  employeeId: string
  visaType: string
  visaExpiryDate: string | null
}

type LiveFairWorkChecklist = {
  id: string
  employeeId: string
  taxFileDeclaration: boolean
  superChoiceForm: boolean
  fairWorkInfoStatement: boolean
}

type LivePolicyReminderSchedule = {
  id: string
  organisationId: string
  policyId: string
  autoRemindEnabled: boolean
}

async function selectRowsByOrganisation(
  supabase: any,
  table: string,
  select: string,
  organisationId: string,
  orderBy?: string
) {
  const db = getReadClient(supabase)
  const attemptQuery = async (filterColumn: "organisation_id" | "organisationId") => {
    let query = db.from(table).select(select).eq("organisation_id", organisationId)
    if (filterColumn === "organisationId") {
      query = db.from(table).select(select).eq("organisationId", organisationId)
    }
    if (orderBy) query = query.order(orderBy, { ascending: true })
    return query
  }

  let bestRows: AnyRecord[] | null = null
  let hadSuccessfulQuery = false
  for (const filterColumn of ["organisation_id", "organisationId"] as const) {
    const { data, error } = await attemptQuery(filterColumn)
    if (!error) {
      hadSuccessfulQuery = true
      const rows = (data ?? []) as AnyRecord[]
      if (!bestRows || rows.length > bestRows.length) {
        bestRows = rows
      }
      continue
    }
  }

  if (hadSuccessfulQuery) {
    return bestRows ?? []
  }

  const { data } = await db.from(table).select(select)
  return ((data ?? []) as AnyRecord[]).filter(
    (row) => readString(row, ["organisation_id", "organisationId"], "") === organisationId
  )
}

async function selectRowsByIdSet(
  supabase: any,
  table: string,
  select: string,
  ids: Set<string>,
  candidateColumns: string[]
) {
  if (ids.size === 0) return [] as AnyRecord[]

  const db = getReadClient(supabase)
  const idValues = [...ids]
  let bestRows: AnyRecord[] | null = null

  for (const column of candidateColumns) {
    const { data, error } = await db.from(table).select(select).in(column, idValues)
    if (!error) {
      const rows = (data ?? []) as AnyRecord[]
      if (!bestRows || rows.length > bestRows.length) bestRows = rows
    }
  }

  if (bestRows) return bestRows

  const { data } = await db.from(table).select(select)
  return ((data ?? []) as AnyRecord[]).filter((row) =>
    candidateColumns.some((column) => {
      const value = row[column]
      return typeof value === "string" && ids.has(value)
    })
  )
}

export async function getEmployeesForOrg(supabase: any, organisationId: string) {
  const rows = await selectRowsByOrganisation(supabase, "Employee", "*", organisationId, "name")
  return rows.map((row: AnyRecord): LiveEmployee => ({
    id: readString(row, ["id"]),
    name: readString(row, ["name"], "Unknown Employee"),
    email: readString(row, ["email"], ""),
    onboardingStatus: readString(row, ["onboardingStatus", "onboarding_status"], "Not Started"),
    organisationId: readString(row, ["organisationId", "organisation_id"], organisationId),
    role: readNullableString(row, ["role", "position", "jobTitle", "job_title"]),
    department: readNullableString(row, ["department", "team"]),
    startDate: readNullableString(row, ["startDate", "start_date", "createdAt", "created_at"]),
  }))
}

export async function getCertificatesForOrg(
  supabase: any,
  employeeIds: Set<string>
) {
  const rows = await selectRowsByIdSet(
    supabase,
    "Certificate",
    "*",
    employeeIds,
    ["employeeId", "employee_id"]
  )
  return rows
    .map((row: AnyRecord): LiveCertificate => ({
      id: readString(row, ["id"]),
      employeeId: readString(row, ["employeeId", "employee_id"]),
      type: readString(row, ["type"], "Certificate"),
      issueDate: readNullableString(row, ["issueDate", "issue_date", "createdAt", "created_at"]),
      expiryDate: readNullableString(row, ["expiryDate", "expiry_date"]),
      status: readString(row, ["status"], "Valid"),
    }))
}

export async function getPoliciesForOrg(supabase: any, organisationId: string) {
  const rows = await selectRowsByOrganisation(supabase, "Policy", "*", organisationId)
  return rows.map((row: AnyRecord): LivePolicy => ({
    id: readString(row, ["id"]),
    title: readString(row, ["title"], "Untitled Policy"),
    description: readNullableString(row, ["description"]),
    organisationId: readString(row, ["organisationId", "organisation_id"], organisationId),
    createdAt: readNullableString(row, ["createdAt", "created_at"]),
  }))
}

export async function getPolicyAcknowledgementsForOrg(
  supabase: any,
  policyIds: Set<string>,
  employeeIds: Set<string>
) {
  const rows = await selectRowsByIdSet(
    supabase,
    "PolicyAcknowledgement",
    "*",
    policyIds,
    ["policyId", "policy_id"]
  )
  return rows
    .map((row: AnyRecord): LivePolicyAcknowledgement => ({
      id: readString(row, ["id"]),
      policyId: readString(row, ["policyId", "policy_id"]),
      employeeId: readString(row, ["employeeId", "employee_id"]),
      acknowledgedAt: readNullableString(row, ["acknowledgedAt", "acknowledged_at"]),
    }))
    .filter(
      (row: LivePolicyAcknowledgement) =>
        policyIds.has(row.policyId) && employeeIds.has(row.employeeId)
    )
}

export async function getWHSIncidentsForOrg(supabase: any, organisationId: string) {
  const rows = await selectRowsByOrganisation(
    supabase,
    "WHSIncident",
    "*",
    organisationId,
    "incidentDate"
  )
  return rows.map((row: AnyRecord): LiveWHSIncident => ({
    id: readString(row, ["id"]),
    organisationId: readString(row, ["organisationId", "organisation_id"], organisationId),
    incidentType: readString(row, ["incidentType", "incident_type"], "Incident"),
    incidentDate: readNullableString(row, ["incidentDate", "incident_date"]),
    employeesInvolved: readNullableString(row, ["employeesInvolved", "employees_involved"]),
    correctiveAction: readNullableString(row, ["correctiveAction", "corrective_action"]),
    preventionSteps: readNullableString(row, ["preventionSteps", "prevention_steps"]),
    assignedTo: readNullableString(row, ["assignedTo", "assigned_to"]),
    dateClosed: readNullableString(row, ["dateClosed", "date_closed"]),
    status: readString(row, ["status"], "New"),
  }))
}

export async function getWHSIncidentTimelineForOrg(supabase: any, organisationId: string) {
  const rows = await selectRowsByOrganisation(
    supabase,
    "WHSIncidentTimeline",
    "*",
    organisationId,
    "createdAt"
  )
  return rows.map((row: AnyRecord): LiveWHSIncidentTimeline => ({
    id: readString(row, ["id"]),
    organisationId: readString(row, ["organisationId", "organisation_id"], organisationId),
    incidentId: readString(row, ["incidentId", "incident_id"]),
    eventType: readString(row, ["eventType", "event_type"]),
    statusFrom: readNullableString(row, ["statusFrom", "status_from"]),
    statusTo: readNullableString(row, ["statusTo", "status_to"]),
    comment: readNullableString(row, ["comment"]),
    assignedTo: readNullableString(row, ["assignedTo", "assigned_to"]),
    createdAt: readNullableString(row, ["createdAt", "created_at"]),
  }))
}

export async function getRightToWorkForOrg(
  supabase: any,
  employeeIds: Set<string>
) {
  const rows = await selectRowsByIdSet(
    supabase,
    "RightToWork",
    "*",
    employeeIds,
    ["employeeId", "employee_id"]
  )
  return rows
    .map((row: AnyRecord): LiveRightToWork => ({
      id: readString(row, ["id"]),
      employeeId: readString(row, ["employeeId", "employee_id"]),
      visaType: readString(row, ["visaType", "visa_type"], ""),
      visaExpiryDate: readNullableString(row, ["visaExpiryDate", "visa_expiry_date"]),
    }))
}

export async function getFairWorkChecklistForOrg(
  supabase: any,
  employeeIds: Set<string>
) {
  const rows = await selectRowsByIdSet(
    supabase,
    "FairWorkChecklist",
    "*",
    employeeIds,
    ["employeeId", "employee_id"]
  )
  return rows
    .map((row: AnyRecord): LiveFairWorkChecklist => ({
      id: readString(row, ["id"]),
      employeeId: readString(row, ["employeeId", "employee_id"]),
      taxFileDeclaration: !!row.taxFileDeclaration || !!row.tax_file_declaration,
      superChoiceForm: !!row.superChoiceForm || !!row.super_choice_form,
      fairWorkInfoStatement:
        !!row.fairWorkInfoStatement || !!row.fair_work_info_statement,
    }))
}

export async function getPolicyReminderSchedulesForOrg(
  supabase: any,
  organisationId: string
) {
  const rows = await selectRowsByOrganisation(
    supabase,
    "PolicyReminderSchedule",
    "*",
    organisationId
  )
  return rows.map((row: AnyRecord): LivePolicyReminderSchedule => ({
    id: readString(row, ["id"]),
    organisationId: readString(row, ["organisationId", "organisation_id"], organisationId),
    policyId: readString(row, ["policyId", "policy_id"]),
    autoRemindEnabled: !!row.autoRemindEnabled || !!row.auto_remind_enabled,
  }))
}

export async function getCurrentOrganisationId(supabase: any): Promise<string | null> {
  try {
    const auth = await getCurrentUserAndOrganisation(supabase)
    return auth.organisationId
  } catch {
    return null
  }
}

export async function fetchLiveComplianceData(supabase: any) {
  const organisationId = await getCurrentOrganisationId(supabase)
  if (!organisationId) {
    return {
      organisationId: null,
      employees: [] as LiveEmployee[],
      certificates: [] as LiveCertificate[],
      policies: [] as LivePolicy[],
      acknowledgements: [] as LivePolicyAcknowledgement[],
    }
  }

  const employees = await getEmployeesForOrg(supabase, organisationId)
  const employeeIds = new Set(employees.map((employee: LiveEmployee) => employee.id))
  const [certificates, policies] = await Promise.all([
    getCertificatesForOrg(supabase, employeeIds),
    getPoliciesForOrg(supabase, organisationId),
  ])
  const policyIds = new Set(policies.map((policy: LivePolicy) => policy.id))
  const acknowledgements = await getPolicyAcknowledgementsForOrg(
    supabase,
    policyIds,
    employeeIds
  )

  return {
    organisationId,
    employees,
    certificates,
    policies,
    acknowledgements,
  }
}
