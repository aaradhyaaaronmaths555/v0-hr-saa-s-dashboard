import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireUserAndOrganisation } from "@/lib/supabase/auth-context"
import { getWriteClient } from "@/lib/supabase/write-client"
import { getEmployeesForOrg } from "@/lib/supabase/live-data"
import {
  jsonBadRequest,
  jsonCreated,
  jsonServerError,
} from "@/lib/api/responses"

export async function GET() {
  const supabase = await createClient()
  const auth = await requireUserAndOrganisation(supabase as never)
  if (!auth.ok) return auth.response
  const organisationId = auth.organisationId

  try {
    const employees = await getEmployeesForOrg(supabase as never, organisationId)
    const items = employees.map((employee) => ({
      id: employee.id,
      name: employee.name?.trim() || "Unnamed Employee",
    }))
    return NextResponse.json({ items })
  } catch (error) {
    return jsonServerError(error, "Failed to load employees")
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const auth = await requireUserAndOrganisation(supabase as never)
    if (!auth.ok) return auth.response
    const db = getWriteClient(supabase as never)

    const body = (await request.json()) as {
      name?: string
      email?: string
      onboardingStatus?: string
    }

    if (!body.name?.trim()) {
      return jsonBadRequest("Name is required")
    }

    const safeName = body.name.trim()
    const safeEmail = body.email?.trim() || `${safeName.toLowerCase().replace(/\s+/g, ".")}@example.local`
    const onboardingStatus = body.onboardingStatus?.trim() || "Not Started"
    const nowIso = new Date().toISOString()

    const payloadVariants: Array<Record<string, unknown>> = [
      // Current app schema (snake_case)
      {
        organisation_id: auth.organisationId,
        name: safeName,
        email: body.email?.trim() || null,
        onboarding_status: onboardingStatus,
      },
      // CamelCase variant
      {
        organisationId: auth.organisationId,
        name: safeName,
        email: body.email?.trim() || null,
        onboardingStatus,
      },
      // Legacy schema variant with required fields
      {
        organisationId: auth.organisationId,
        name: safeName,
        email: safeEmail,
        phone: null,
        role: "Employee",
        department: "General",
        startDate: nowIso,
        onboardingSteps: [],
      },
      // Legacy + snake org key variant
      {
        organisation_id: auth.organisationId,
        name: safeName,
        email: safeEmail,
        phone: null,
        role: "Employee",
        department: "General",
        startDate: nowIso,
        onboardingSteps: [],
      },
    ]

    let createdItem: unknown = null
    let lastErrorMessage = "Failed to create employee"
    for (const payload of payloadVariants) {
      const { data, error } = await db.from("Employee").insert(payload).select("*").single()
      if (!error) {
        createdItem = data
        break
      }
      lastErrorMessage = error.message || lastErrorMessage
    }

    if (!createdItem) return jsonServerError(lastErrorMessage, "Failed to create employee")
    return jsonCreated({ item: createdItem })
  } catch (error) {
    return jsonServerError(error, "Failed to create employee")
  }
}
