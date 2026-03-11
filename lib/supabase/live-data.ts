type AnyRecord = Record<string, unknown>

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
}

export type LiveCertificate = {
  id: string
  employeeId: string
  type: string
  expiryDate: string | null
  status: string
}

export type LivePolicy = {
  id: string
  title: string
  description: string | null
  organisationId: string
}

export type LivePolicyAcknowledgement = {
  id: string
  policyId: string
  employeeId: string
  acknowledgedAt: string | null
}

export async function getCurrentOrganisationId(supabase: any): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: userRow } = await supabase
    .from("User")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  if (!userRow) return null
  return readString(userRow, ["organisationId", "organisation_id"], "")
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

  const [employeesRes, certificatesRes, policiesRes, acknowledgementsRes] =
    await Promise.all([
      supabase.from("Employee").select("*"),
      supabase.from("Certificate").select("*"),
      supabase.from("Policy").select("*"),
      supabase.from("PolicyAcknowledgement").select("*"),
    ])

  const employees = (employeesRes.data ?? [])
    .map((row: AnyRecord): LiveEmployee => ({
      id: readString(row, ["id"]),
      name: readString(row, ["name"], "Unknown Employee"),
      email: readString(row, ["email"], ""),
      onboardingStatus: readString(row, ["onboardingStatus", "onboarding_status"], "Not Started"),
      organisationId: readString(row, ["organisationId", "organisation_id"], ""),
    }))
    .filter((row: LiveEmployee) => row.organisationId === organisationId)

  const employeeIds = new Set(employees.map((employee: LiveEmployee) => employee.id))

  const certificates = (certificatesRes.data ?? [])
    .map((row: AnyRecord): LiveCertificate => ({
      id: readString(row, ["id"]),
      employeeId: readString(row, ["employeeId", "employee_id"]),
      type: readString(row, ["type"], "Certificate"),
      expiryDate: readNullableString(row, ["expiryDate", "expiry_date"]),
      status: readString(row, ["status"], "Valid"),
    }))
    .filter((row: LiveCertificate) => employeeIds.has(row.employeeId))

  const policies = (policiesRes.data ?? [])
    .map((row: AnyRecord): LivePolicy => ({
      id: readString(row, ["id"]),
      title: readString(row, ["title"], "Untitled Policy"),
      description: readNullableString(row, ["description"]),
      organisationId: readString(row, ["organisationId", "organisation_id"], ""),
    }))
    .filter((row: LivePolicy) => row.organisationId === organisationId)

  const policyIds = new Set(policies.map((policy: LivePolicy) => policy.id))

  const acknowledgements = (acknowledgementsRes.data ?? [])
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

  return {
    organisationId,
    employees,
    certificates,
    policies,
    acknowledgements,
  }
}
