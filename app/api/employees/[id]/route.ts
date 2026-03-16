import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireUserAndOrganisation } from "@/lib/supabase/auth-context"
import { getWriteClient } from "@/lib/supabase/write-client"
import {
  jsonBadRequest,
  jsonOk,
  jsonNotFound,
  jsonServerError,
} from "@/lib/api/responses"

type Params = { params: Promise<{ id: string }> }

function rowOrganisationId(row: Record<string, unknown> | null | undefined): string {
  if (!row) return ""
  const camel = row.organisationId
  if (typeof camel === "string" && camel.length > 0) return camel
  const snake = row.organisation_id
  if (typeof snake === "string" && snake.length > 0) return snake
  return ""
}

export async function GET(_: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const auth = await requireUserAndOrganisation(supabase as never)
  if (!auth.ok) return auth.response
  const db = getWriteClient(supabase as never)

  const { data, error } = await db.from("Employee").select("*").eq("id", id).maybeSingle()
  if (error) return jsonServerError(error, "Failed to load employee")
  if (!data) return jsonNotFound("Employee not found")

  if (rowOrganisationId(data as Record<string, unknown>) !== auth.organisationId) {
    return jsonNotFound("Employee not found")
  }

  return NextResponse.json({ item: data })
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params
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

    const updatePayloads: Array<Record<string, unknown>> = [
      {
        name: body.name.trim(),
        email: body.email?.trim() || null,
        onboarding_status: body.onboardingStatus?.trim() || "Not Started",
        updatedAt: new Date().toISOString(),
      },
      {
        name: body.name.trim(),
        email: body.email?.trim() || null,
        onboardingStatus: body.onboardingStatus?.trim() || "Not Started",
        updatedAt: new Date().toISOString(),
      },
      {
        name: body.name.trim(),
        email: body.email?.trim() || `${body.name.trim().toLowerCase().replace(/\s+/g, ".")}@example.local`,
        updatedAt: new Date().toISOString(),
      },
    ]

    const { data: existing, error: existingError } = await db
      .from("Employee")
      .select("*")
      .eq("id", id)
      .maybeSingle()
    if (existingError) return jsonServerError(existingError, "Failed to load employee")
    if (!existing) return jsonNotFound("Employee not found")
    if (rowOrganisationId(existing as Record<string, unknown>) !== auth.organisationId) {
      return jsonNotFound("Employee not found")
    }

    for (const payload of updatePayloads) {
      const { data, error } = await db
        .from("Employee")
        .update(payload)
        .eq("id", id)
        .select("*")
        .maybeSingle()
      if (!error && data) return NextResponse.json({ item: data })
    }

    return jsonNotFound("Employee not found")
  } catch (error) {
    return jsonServerError(error, "Failed to update employee")
  }
}

async function safeDeleteByEmployeeId(db: any, table: string, employeeId: string) {
  const attempts = [
    () => db.from(table).delete().eq("employeeId", employeeId),
    () => db.from(table).delete().eq("employee_id", employeeId),
  ]
  for (const attempt of attempts) {
    const { error } = await attempt()
    if (!error) return null
    if (error.code === "42P01" || error.code === "42703") continue
    return error
  }
  return null
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const auth = await requireUserAndOrganisation(supabase as never)
    if (!auth.ok) return auth.response
    const db = getWriteClient(supabase as never)

    const { data: existing, error: existingError } = await db
      .from("Employee")
      .select("*")
      .eq("id", id)
      .maybeSingle()
    if (existingError) return jsonServerError(existingError, "Failed to load employee")
    if (!existing) return jsonNotFound("Employee not found")
    if (rowOrganisationId(existing as Record<string, unknown>) !== auth.organisationId) {
      return jsonNotFound("Employee not found")
    }

    const relatedTables = ["Certificate", "PolicyAcknowledgement", "RightToWork", "FairWorkChecklist"]
    for (const table of relatedTables) {
      const error = await safeDeleteByEmployeeId(db, table, id)
      if (error) return jsonServerError(error.message, `Failed to delete related ${table} records`)
    }

    const { error: deleteError } = await db.from("Employee").delete().eq("id", id)
    if (deleteError) return jsonServerError(deleteError, "Failed to delete employee")

    return jsonOk({ ok: true })
  } catch (error) {
    return jsonServerError(error, "Failed to delete employee")
  }
}
