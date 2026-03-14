import { createAdminClient } from "@/lib/supabase/admin"

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

function inferOrgNameFromUser(user: AnyRecord): string {
  const metadata = (user.user_metadata ?? {}) as AnyRecord
  const fromMetadata = readString(metadata, ["organisation_name", "organization_name"], "")
  if (fromMetadata) return fromMetadata

  const email = readString(user, ["email"], "")
  const localPart = email.split("@")[0]?.trim()
  if (localPart) return `${localPart}'s Organisation`
  return "My Organisation"
}

function inferFullNameFromUser(user: AnyRecord): string {
  const metadata = (user.user_metadata ?? {}) as AnyRecord
  const fromMetadata = readString(metadata, ["full_name", "name"], "")
  if (fromMetadata) return fromMetadata
  return readString(user, ["email"], "User")
}

async function tryInsertUserRow(
  supabase: any,
  userId: string,
  email: string,
  fullName: string,
  organisationId: string
) {
  // Handle common schema variants:
  // - Supabase-auth style app user table (full_name + organisation_id)
  // - Prisma/camelCase mapping (fullName + organisationId)
  // - Legacy local-auth style table (name + password + role + organisationId)
  const fallbackPassword = `supabase-auth-${userId}`
  const attempts = [
    { id: userId, email, full_name: fullName, organisation_id: organisationId },
    { id: userId, email, fullName, organisationId },
    {
      id: userId,
      email,
      name: fullName,
      password: fallbackPassword,
      role: "admin",
      organisationId,
    },
    {
      id: userId,
      email,
      name: fullName,
      password: fallbackPassword,
      role: "admin",
      organisation_id: organisationId,
    },
  ]

  for (const payload of attempts) {
    const { error } = await supabase.from("User").insert(payload)
    if (!error) return true
  }
  return false
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

export async function getCurrentOrganisationId(supabase: any): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: userRowById } = await supabase
    .from("User")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()
  if (userRowById) {
    return readString(userRowById, ["organisationId", "organisation_id"], "")
  }

  const admin = createAdminClient()
  if (admin) {
    const { data: adminUserRowById } = await admin
      .from("User")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
    if (adminUserRowById) {
      return readString(adminUserRowById, ["organisationId", "organisation_id"], "")
    }
  }

  const email = readString(user as unknown as AnyRecord, ["email"], "")
  if (email) {
    const { data: userRowByEmail } = await supabase
      .from("User")
      .select("*")
      .eq("email", email)
      .maybeSingle()
    if (userRowByEmail) {
      return readString(userRowByEmail, ["organisationId", "organisation_id"], "")
    }

    if (admin) {
      const { data: adminUserRowByEmail } = await admin
        .from("User")
        .select("*")
        .eq("email", email)
        .maybeSingle()
      if (adminUserRowByEmail) {
        return readString(adminUserRowByEmail, ["organisationId", "organisation_id"], "")
      }
    }
  }

  // Self-heal missing link for users created before trigger setup.
  const organisationName = inferOrgNameFromUser(user as unknown as AnyRecord)
  const fullName = inferFullNameFromUser(user as unknown as AnyRecord)
  const writeClient = admin ?? supabase
  const { data: createdOrg } = await writeClient
    .from("Organisation")
    .insert({ name: organisationName })
    .select("id")
    .maybeSingle()

  const newOrganisationId = readString(
    (createdOrg ?? {}) as AnyRecord,
    ["id"],
    ""
  )
  if (!newOrganisationId || !email) return null

  const inserted = await tryInsertUserRow(
    writeClient,
    user.id,
    email,
    fullName,
    newOrganisationId
  )
  if (inserted) return newOrganisationId

  // If insert failed due to race/unique conflict, try email lookup one more time.
  const { data: retriedUserRow } = await writeClient
    .from("User")
    .select("*")
    .eq("email", email)
    .maybeSingle()
  if (retriedUserRow) {
    return readString(retriedUserRow, ["organisationId", "organisation_id"], "")
  }

  return null
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
      role: readNullableString(row, ["role", "position", "jobTitle", "job_title"]),
      department: readNullableString(row, ["department", "team"]),
      startDate: readNullableString(row, ["startDate", "start_date", "createdAt", "created_at"]),
    }))
    .filter((row: LiveEmployee) => row.organisationId === organisationId)

  const employeeIds = new Set(employees.map((employee: LiveEmployee) => employee.id))

  const certificates = (certificatesRes.data ?? [])
    .map((row: AnyRecord): LiveCertificate => ({
      id: readString(row, ["id"]),
      employeeId: readString(row, ["employeeId", "employee_id"]),
      type: readString(row, ["type"], "Certificate"),
      issueDate: readNullableString(row, ["issueDate", "issue_date", "createdAt", "created_at"]),
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
      createdAt: readNullableString(row, ["createdAt", "created_at"]),
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
