import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { requireUserAndOrganisation } from "@/lib/supabase/auth-context"
import { getWriteClient } from "@/lib/supabase/write-client"
import {
  jsonNotFound,
  jsonOk,
  jsonServerError,
} from "@/lib/api/responses"

type Params = { params: Promise<{ id: string }> }

function readOrganisationId(row: Record<string, unknown> | null | undefined): string {
  if (!row) return ""
  const camel = row.organisationId
  if (typeof camel === "string" && camel.length > 0) return camel
  const snake = row.organisation_id
  if (typeof snake === "string" && snake.length > 0) return snake
  return ""
}

async function deleteTimelineForIncident(db: any, incidentId: string) {
  const attempts = [
    () => db.from("WHSIncidentTimeline").delete().eq("incidentId", incidentId),
    () => db.from("WHSIncidentTimeline").delete().eq("incident_id", incidentId),
  ]
  for (const attempt of attempts) {
    const { error } = await attempt()
    if (!error) return null
    if (error.code === "42P01" || error.code === "42703") continue
    return error
  }
  return null
}

export async function GET(_: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const auth = await requireUserAndOrganisation(supabase as never)
  if (!auth.ok) return auth.response
  const db = getWriteClient(supabase as never)

  const { data, error } = await db
    .from("WHSIncident")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) return jsonServerError(error.message, "Failed to load incident")
  if (!data) return jsonNotFound("Incident not found")
  if (
    readOrganisationId(
      (data ?? null) as Record<string, unknown> | null | undefined
    ) !== auth.organisationId
  ) {
    return jsonNotFound("Incident not found")
  }
  return NextResponse.json({ item: data })
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const auth = await requireUserAndOrganisation(supabase as never)
    if (!auth.ok) return auth.response
    const db = getWriteClient(supabase as never)

    const { data: existing, error: existingError } = await db
      .from("WHSIncident")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (existingError) {
      return jsonServerError(existingError.message, "Failed to load incident")
    }
    if (!existing) {
      return jsonNotFound("Incident not found")
    }
    if (
      readOrganisationId(
        (existing ?? null) as Record<string, unknown> | null | undefined
      ) !== auth.organisationId
    ) {
      return jsonNotFound("Incident not found")
    }

    const timelineDeleteError = await deleteTimelineForIncident(db, id)
    if (timelineDeleteError) {
      return jsonServerError(
        timelineDeleteError.message,
        "Failed to delete incident timeline"
      )
    }

    const { error: deleteError } = await db.from("WHSIncident").delete().eq("id", id)
    if (deleteError) {
      return jsonServerError(deleteError.message, "Failed to delete incident")
    }

    revalidatePath("/whs")
    revalidatePath("/whs-incidents")
    revalidatePath("/dashboard")
    revalidatePath("/reports")

    return jsonOk({ ok: true })
  } catch (error) {
    return jsonServerError(error, "Failed to delete incident")
  }
}
