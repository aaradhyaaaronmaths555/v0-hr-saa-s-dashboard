import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
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

  const { data, error } = await db.from("Policy").select("*").eq("id", id).maybeSingle()
  if (error) return jsonServerError(error, "Failed to load policy")
  if (!data) return jsonNotFound("Policy not found")
  if (rowOrganisationId(data as Record<string, unknown>) !== auth.organisationId) {
    return jsonNotFound("Policy not found")
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
      title?: string
      description?: string
    }

    if (!body.title?.trim()) {
      return jsonBadRequest("Policy title is required")
    }

    const description = body.description?.trim() || "Policy details pending."
    const updatePayloads: Array<Record<string, unknown>> = [
      {
        title: body.title.trim(),
        description: body.description?.trim() || null,
        updatedAt: new Date().toISOString(),
      },
      {
        title: body.title.trim(),
        description,
        category: "General",
        status: "Active",
        updatedAt: new Date().toISOString(),
      },
    ]
    const { data: existing, error: existingError } = await db
      .from("Policy")
      .select("*")
      .eq("id", id)
      .maybeSingle()
    if (existingError) return jsonServerError(existingError, "Failed to load policy")
    if (!existing) return jsonNotFound("Policy not found")
    if (rowOrganisationId(existing as Record<string, unknown>) !== auth.organisationId) {
      return jsonNotFound("Policy not found")
    }

    for (const payload of updatePayloads) {
      const { data, error } = await db
        .from("Policy")
        .update(payload)
        .eq("id", id)
        .select("*")
        .maybeSingle()
      if (!error && data) return NextResponse.json({ item: data })
    }
    return jsonNotFound("Policy not found")
  } catch (error) {
    return jsonServerError(error, "Failed to update policy")
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const auth = await requireUserAndOrganisation(supabase as never)
    if (!auth.ok) return auth.response
    const db = getWriteClient(supabase as never)

    const { data: existing, error: existingError } = await db
      .from("Policy")
      .select("*")
      .eq("id", id)
      .maybeSingle()
    if (existingError) return jsonServerError(existingError, "Failed to load policy")
    if (!existing) return jsonNotFound("Policy not found")
    if (rowOrganisationId(existing as Record<string, unknown>) !== auth.organisationId) {
      return jsonNotFound("Policy not found")
    }

    const relatedTables = [
      "PolicyAcknowledgement",
      "PolicyReminderEvent",
      "PolicyReminderSchedule",
    ]
    for (const table of relatedTables) {
      const { error } = await db.from(table).delete().eq("policyId", id)
      if (error && error.code !== "42P01") {
        return jsonServerError(error, "Failed to delete policy")
      }
    }

    const { error } = await db.from("Policy").delete().eq("id", id)
    if (error) return jsonServerError(error, "Failed to delete policy")

    revalidatePath("/policies")
    revalidatePath("/dashboard")
    revalidatePath("/reports")

    return jsonOk({ ok: true })
  } catch (error) {
    return jsonServerError(error, "Failed to delete policy")
  }
}
