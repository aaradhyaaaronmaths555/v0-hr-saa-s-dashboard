import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { requireUserAndOrganisation } from "@/lib/supabase/auth-context"
import { getWriteClient } from "@/lib/supabase/write-client"
import {
  jsonBadRequest,
  jsonCreated,
  jsonNotFound,
  jsonOk,
  jsonServerError,
} from "@/lib/api/responses"

const WORKFLOW_STATUSES = ["New", "In review", "Actioned", "Closed"] as const
type WorkflowStatus = (typeof WORKFLOW_STATUSES)[number]

const ALLOWED_TRANSITIONS: Record<WorkflowStatus, WorkflowStatus[]> = {
  New: ["In review"],
  "In review": ["Actioned", "New"],
  Actioned: ["Closed", "In review"],
  Closed: ["In review"],
}

function normalizeStatus(status: string | undefined): WorkflowStatus {
  if (status === "Open") return "New"
  if (status === "Investigating") return "In review"
  if (status === "Actioned" || status === "Closed" || status === "In review" || status === "New") {
    return status
  }
  return "New"
}

function getDayAge(iso: string | undefined) {
  if (!iso) return 0
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return 0
  return Math.floor((Date.now() - parsed.getTime()) / 86400000)
}

function hasText(value: string | undefined) {
  return !!value && value.trim().length > 0
}

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

export async function GET() {
  const supabase = await createClient()
  const auth = await requireUserAndOrganisation(supabase as never)
  if (!auth.ok) return auth.response
  const organisationId = auth.organisationId

  const { data: incidents, error } = await supabase
    .from("WHSIncident")
    .select("*")
    .eq("organisationId", organisationId)
    .order("incidentDate", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: timelineRows, error: timelineError } = await supabase
    .from("WHSIncidentTimeline")
    .select("*")
    .eq("organisationId", organisationId)
    .order("createdAt", { ascending: false })

  if (timelineError) {
    return NextResponse.json({ error: timelineError.message }, { status: 500 })
  }

  const items = (incidents ?? []).map(
    (item: {
      id: string
      status?: string
      incidentDate?: string
      correctiveAction?: string
    }) => {
      const status = normalizeStatus(item.status)
      const ageDays = getDayAge(item.incidentDate)
      const stuck = (status === "New" || status === "In review") && ageDays > 7
      const closedWithoutCorrective =
        status === "Closed" && !hasText(item.correctiveAction)
      return {
        ...item,
        riskFlags: {
          stuck,
          closedWithoutCorrective,
        },
      }
    }
  )

  return NextResponse.json({
    items,
    timeline: timelineRows ?? [],
  })
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const auth = await requireUserAndOrganisation(supabase as never)
    if (!auth.ok) return auth.response
    const db = getWriteClient(supabase as never)

    const body = (await request.json()) as {
      incidentType?: string
      incidentDate?: string
      employeesInvolved?: string
      correctiveAction?: string
      assignedTo?: string
    }

    if (!body.incidentType?.trim()) {
      return jsonBadRequest("incidentType is required")
    }
    if (!body.incidentDate || Number.isNaN(new Date(body.incidentDate).getTime())) {
      return jsonBadRequest("Valid incidentDate is required")
    }
    if (!body.employeesInvolved?.trim()) {
      return jsonBadRequest("employeesInvolved is required")
    }

    const payload = {
      organisationId: auth.organisationId,
      incidentType: body.incidentType.trim(),
      incidentDate: body.incidentDate,
      employeesInvolved: body.employeesInvolved.trim(),
      correctiveAction: body.correctiveAction ?? "",
      assignedTo: body.assignedTo ?? null,
      status: "New",
    }

    const { data, error } = await db
      .from("WHSIncident")
      .insert(payload)
      .select("*")
      .single()

    if (error) {
      return jsonServerError(error.message, "Failed to create WHS incident")
    }

    const { error: timelineError } = await db.from("WHSIncidentTimeline").insert({
      organisationId: auth.organisationId,
      incidentId: data.id,
      eventType: "status_changed",
      statusFrom: null,
      statusTo: "New",
      assignedTo: data.assignedTo ?? null,
      comment: "Incident created",
    })
    if (timelineError) {
      return jsonServerError(timelineError.message, "Failed to write incident timeline")
    }

    return jsonCreated({ item: data })
  } catch (error) {
    return jsonServerError(error, "Failed to create WHS incident")
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const auth = await requireUserAndOrganisation(supabase as never)
    if (!auth.ok) return auth.response

    const body = (await request.json()) as {
      incidentId?: string
      status?: WorkflowStatus
      correctiveAction?: string
      preventionSteps?: string
      dateClosed?: string
      assignedTo?: string
      comment?: string
    }

    if (!body.incidentId) {
      return jsonBadRequest("incidentId is required")
    }

    const { data: existing, error: existingError } = await supabase
      .from("WHSIncident")
      .select("*")
      .eq("id", body.incidentId)
      .eq("organisationId", auth.organisationId)
      .maybeSingle()

    if (existingError) {
      return jsonServerError(existingError.message, "Failed to load WHS incident")
    }
    if (!existing) {
      return jsonNotFound("Incident not found")
    }

  const currentStatus = (existing.status ?? "New") as WorkflowStatus
  const normalizedCurrentStatus = normalizeStatus(currentStatus)
  const nextStatus = body.status ?? normalizedCurrentStatus
  if (!WORKFLOW_STATUSES.includes(nextStatus)) {
    return jsonBadRequest("Invalid status")
  }
  if (
    nextStatus !== normalizedCurrentStatus &&
    !ALLOWED_TRANSITIONS[normalizedCurrentStatus].includes(nextStatus)
  ) {
    return jsonBadRequest(`Invalid transition from ${normalizedCurrentStatus} to ${nextStatus}`)
  }

  const effectiveCorrective = body.correctiveAction ?? existing.correctiveAction ?? ""
  const effectivePrevention = body.preventionSteps ?? existing.preventionSteps ?? ""
  const effectiveDateClosed = body.dateClosed ?? existing.dateClosed ?? null
  if (
    nextStatus === "Closed" &&
    (!hasText(effectiveCorrective) ||
      !hasText(effectivePrevention) ||
      !hasText(effectiveDateClosed ?? undefined))
  ) {
    return jsonBadRequest(
      "Before closing, provide corrective action summary, prevention steps, and date closed."
    )
  }

  const updatePayload: Record<string, unknown> = {
    status: nextStatus,
    updatedAt: new Date().toISOString(),
  }
  if (body.correctiveAction !== undefined) {
    updatePayload.correctiveAction = body.correctiveAction
  }
  if (body.preventionSteps !== undefined) {
    updatePayload.preventionSteps = body.preventionSteps
  }
  if (body.assignedTo !== undefined) {
    updatePayload.assignedTo = body.assignedTo || null
  }
  if (nextStatus === "Closed") {
    updatePayload.dateClosed = effectiveDateClosed
  } else if (body.dateClosed !== undefined) {
    updatePayload.dateClosed = body.dateClosed || null
  }

    const { data: updated, error: updateError } = await supabase
      .from("WHSIncident")
      .update(updatePayload)
      .eq("id", body.incidentId)
      .eq("organisationId", auth.organisationId)
      .select("*")
      .single()

    if (updateError) {
      return jsonServerError(updateError.message, "Failed to update WHS incident")
    }

  const timelineEvents: Array<Record<string, unknown>> = []
  if (nextStatus !== currentStatus) {
    timelineEvents.push({
      organisationId: auth.organisationId,
      incidentId: body.incidentId,
      eventType: "status_changed",
      statusFrom: normalizedCurrentStatus,
      statusTo: nextStatus,
      assignedTo: body.assignedTo ?? existing.assignedTo ?? null,
      comment: null,
    })
  }

  if (body.assignedTo !== undefined && body.assignedTo !== (existing.assignedTo ?? "")) {
    timelineEvents.push({
      organisationId: auth.organisationId,
      incidentId: body.incidentId,
      eventType: "assigned",
      statusFrom: null,
      statusTo: null,
      assignedTo: body.assignedTo || null,
      comment: `Assigned to ${body.assignedTo || "unassigned"}`,
    })
  }

  if (hasText(body.comment)) {
    timelineEvents.push({
      organisationId: auth.organisationId,
      incidentId: body.incidentId,
      eventType: "comment",
      statusFrom: null,
      statusTo: null,
      assignedTo: body.assignedTo ?? existing.assignedTo ?? null,
      comment: body.comment,
    })
  }

  if (
    body.correctiveAction !== undefined ||
    body.preventionSteps !== undefined ||
    body.dateClosed !== undefined
  ) {
    timelineEvents.push({
      organisationId: auth.organisationId,
      incidentId: body.incidentId,
      eventType: "details_updated",
      statusFrom: null,
      statusTo: null,
      assignedTo: body.assignedTo ?? existing.assignedTo ?? null,
      comment: "Incident details updated",
    })
  }

    if (timelineEvents.length > 0) {
      const { error: timelineError } = await supabase
        .from("WHSIncidentTimeline")
        .insert(timelineEvents)
      if (timelineError) {
        return jsonServerError(timelineError.message, "Failed to write incident timeline")
      }
    }

    return NextResponse.json({ item: updated })
  } catch (error) {
    return jsonServerError(error, "Failed to update WHS incident")
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const auth = await requireUserAndOrganisation(supabase as never)
    if (!auth.ok) return auth.response
    const db = getWriteClient(supabase as never)

    const body = (await request.json()) as {
      incidentId?: string
    }

    if (!body.incidentId) {
      return jsonBadRequest("incidentId is required")
    }

    const { data: existing, error: existingError } = await db
      .from("WHSIncident")
      .select("*")
      .eq("id", body.incidentId)
      .maybeSingle()

    if (existingError) {
      return jsonServerError(existingError.message, "Failed to load WHS incident")
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

    const timelineDeleteError = await deleteTimelineForIncident(db, body.incidentId)
    if (timelineDeleteError) {
      return jsonServerError(
        timelineDeleteError.message,
        "Failed to delete incident timeline"
      )
    }

    const { error: deleteError } = await db
      .from("WHSIncident")
      .delete()
      .eq("id", body.incidentId)

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
