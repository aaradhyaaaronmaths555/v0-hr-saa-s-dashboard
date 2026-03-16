import { createAdminClient } from "@/lib/supabase/admin"
import { jsonForbidden, jsonUnauthorized } from "@/lib/api/responses"

type AppUser = {
  id: string
  email?: string | null
}

type AuthContextErrorCode = "UNAUTHENTICATED" | "NO_ORGANISATION"

export class AuthContextError extends Error {
  code: AuthContextErrorCode

  constructor(code: AuthContextErrorCode, message: string) {
    super(message)
    this.code = code
  }
}

function readOrganisationId(row: Record<string, unknown> | null | undefined): string | null {
  if (!row) return null
  const camel = row.organisationId
  if (typeof camel === "string" && camel.length > 0) return camel
  const snake = row.organisation_id
  if (typeof snake === "string" && snake.length > 0) return snake
  return null
}

function readEmail(row: Record<string, unknown> | null | undefined): string | null {
  if (!row) return null
  const value = row.email
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function normalizeEmail(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim().toLowerCase()
  return trimmed.length > 0 ? trimmed : null
}

function emailsMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  const normalizedA = normalizeEmail(a)
  const normalizedB = normalizeEmail(b)
  return !!normalizedA && !!normalizedB && normalizedA === normalizedB
}

function readDisplayName(user: { email?: string | null; user_metadata?: Record<string, unknown> | null }) {
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>
  const rawName =
    typeof metadata.full_name === "string"
      ? metadata.full_name
      : typeof metadata.name === "string"
        ? metadata.name
        : ""
  const trimmed = rawName.trim()
  if (trimmed) return trimmed

  const email = user.email ?? ""
  const local = email.split("@")[0] ?? ""
  if (!local) return "Admin"
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

async function resolveUserRowByUserId(
  db: any,
  userId: string
): Promise<{ organisationId: string | null; email: string | null }> {
  const { data } = await db
    .from("User")
    .select("id, email, organisationId, organisation_id")
    .eq("id", userId)
    .maybeSingle()
  const row = (data ?? null) as Record<string, unknown> | null
  return {
    organisationId: readOrganisationId(row),
    email: readEmail(row),
  }
}

async function resolveOrganisationByExactEmail(db: any, email: string): Promise<string | null> {
  const { data } = await db
    .from("User")
    .select("id, email, organisationId, organisation_id")
    .eq("email", email)
    .limit(1)
    .maybeSingle()
  return readOrganisationId((data ?? null) as Record<string, unknown> | null)
}

async function syncUserIdToAuthId(db: any, email: string, authUserId: string) {
  const payloads = [{ id: authUserId }]
  for (const payload of payloads) {
    const { error } = await db
      .from("User")
      .update(payload)
      .eq("email", email)
      .neq("id", authUserId)
    if (!error) return
  }
}

async function createOrganisationAndUserForAuthUser(
  db: any,
  user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> | null }
): Promise<string | null> {
  const orgName = `${readDisplayName(user)} Organisation`
  const orgPayloads = [{ name: orgName }, { name: orgName, planStatus: "trial" }]
  let organisationId: string | null = null

  for (const payload of orgPayloads) {
    const { data, error } = await db
      .from("Organisation")
      .insert(payload)
      .select("id")
      .maybeSingle()
    if (!error && data && typeof data.id === "string" && data.id.length > 0) {
      organisationId = data.id
      break
    }
  }
  if (!organisationId) return null

  const userEmail =
    typeof user.email === "string" && user.email.trim()
      ? user.email.trim()
      : `${user.id}@placeholder.local`
  const userName = readDisplayName(user)
  const userPayloads = [
    {
      id: user.id,
      email: userEmail,
      name: userName,
      password: "managed-by-supabase-auth",
      role: "admin",
      organisationId,
    },
    {
      id: user.id,
      email: userEmail,
      name: userName,
      password: "managed-by-supabase-auth",
      role: "admin",
      organisation_id: organisationId,
    },
  ]

  for (const payload of userPayloads) {
    const { error } = await db.from("User").insert(payload)
    if (!error) return organisationId
  }

  return null
}

export async function getCurrentUserAndOrganisation(supabase: any): Promise<{
  user: AppUser
  organisationId: string
}> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new AuthContextError("UNAUTHENTICATED", "Unauthenticated")
  }
  const admin = createAdminClient()
  const db = admin ?? supabase

  const userRowById = await resolveUserRowByUserId(db, user.id)
  if (userRowById.organisationId && emailsMatch(userRowById.email, user.email ?? null)) {
    return {
      user: { id: user.id, email: user.email ?? null },
      organisationId: userRowById.organisationId,
    }
  }

  const exactEmail = typeof user.email === "string" ? user.email.trim() : ""
  if (exactEmail) {
    const emailOrganisationId = await resolveOrganisationByExactEmail(db, exactEmail)
    if (emailOrganisationId) {
      await syncUserIdToAuthId(db, exactEmail, user.id)
      return {
        user: { id: user.id, email: exactEmail },
        organisationId: emailOrganisationId,
      }
    }
  }

  const createdOrganisationId = await createOrganisationAndUserForAuthUser(db, {
    id: user.id,
    email: user.email ?? null,
    user_metadata: (user.user_metadata ?? {}) as Record<string, unknown>,
  })
  if (createdOrganisationId) {
    return {
      user: { id: user.id, email: user.email ?? null },
      organisationId: createdOrganisationId,
    }
  }

  throw new AuthContextError("NO_ORGANISATION", "No organisation linked to user")
}

export async function requireUserAndOrganisation(supabase: any) {
  try {
    const auth = await getCurrentUserAndOrganisation(supabase)
    return {
      ok: true as const,
      user: auth.user,
      organisationId: auth.organisationId,
    }
  } catch (error) {
    if (error instanceof AuthContextError && error.code === "UNAUTHENTICATED") {
      return {
        ok: false as const,
        response: jsonUnauthorized(),
      }
    }

    return {
      ok: false as const,
      response: jsonForbidden("No organisation linked to user"),
    }
  }
}
