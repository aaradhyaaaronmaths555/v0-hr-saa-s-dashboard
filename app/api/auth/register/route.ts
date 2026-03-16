import { jsonBadRequest, jsonCreated, jsonServerError } from "@/lib/api/responses"
import { createAdminClient } from "@/lib/supabase/admin"

function normalizeEmail(value: string) {
  return value.trim().replace(/\s+/g, "").toLowerCase()
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function POST(request: Request) {
  try {
    const admin = createAdminClient()
    if (!admin) {
      return jsonServerError(
        "Service role key missing",
        "Registration is not configured correctly"
      )
    }

    const body = (await request.json().catch(() => ({}))) as {
      organisationName?: string
      name?: string
      email?: string
      password?: string
    }

    const organisationName = String(body.organisationName ?? "").trim()
    const name = String(body.name ?? "").trim()
    const email = normalizeEmail(String(body.email ?? ""))
    const password = String(body.password ?? "")

    if (!organisationName || !name || !email || !password) {
      return jsonBadRequest("Organisation name, full name, email, and password are required")
    }
    if (!isValidEmail(email)) {
      return jsonBadRequest("Please enter a valid email address")
    }
    if (password.length < 8) {
      return jsonBadRequest("Password must be at least 8 characters")
    }

    const { error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        organisation_name: organisationName,
        full_name: name,
      },
    })

    if (error) {
      if (
        error.message?.toLowerCase().includes("already") ||
        error.message?.toLowerCase().includes("exists")
      ) {
        return jsonBadRequest("An account with this email already exists")
      }
      return jsonBadRequest(error.message || "Failed to create account")
    }

    return jsonCreated({ ok: true })
  } catch (error) {
    return jsonServerError(error, "Failed to create account")
  }
}
