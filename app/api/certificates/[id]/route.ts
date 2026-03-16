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

function isValidDate(value: string) {
  return !Number.isNaN(new Date(value).getTime())
}

function rowOrganisationId(row: Record<string, unknown> | null | undefined): string {
  if (!row) return ""
  const camel = row.organisationId
  if (typeof camel === "string" && camel.length > 0) return camel
  const snake = row.organisation_id
  if (typeof snake === "string" && snake.length > 0) return snake
  return ""
}

async function fetchCertificateForOrg(
  db: any,
  id: string,
  organisationId: string
) {
  const { data: cert, error: certError } = await db
    .from("Certificate")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  if (certError || !cert) return { data: null, error: certError }

  const employeeId =
    (cert as { employeeId?: string; employee_id?: string }).employeeId ??
    (cert as { employeeId?: string; employee_id?: string }).employee_id
  if (!employeeId) return { data: null, error: null }

  const { data: employee, error: employeeError } = await db
    .from("Employee")
    .select("*")
    .eq("id", employeeId)
    .maybeSingle()
  if (employeeError || !employee) return { data: null, error: employeeError }

  if (
    rowOrganisationId(
      (employee ?? null) as Record<string, unknown> | null | undefined
    ) === organisationId
  ) {
    return { data: cert, error: null }
  }
  return { data: null, error: null }
}

export async function GET(_: Request, { params }: Params) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const auth = await requireUserAndOrganisation(supabase as never)
    if (!auth.ok) return auth.response
    const db = getWriteClient(supabase as never)
    const organisationId = auth.organisationId

    const { data, error } = await fetchCertificateForOrg(db, id, organisationId)
    if (error) return jsonServerError(error.message, "Failed to load certificate")
    if (!data) return jsonNotFound("Certificate not found")
    return jsonOk({ item: data })
  } catch (error) {
    return jsonServerError(error, "Failed to load certificate")
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const auth = await requireUserAndOrganisation(supabase as never)
    if (!auth.ok) return auth.response
    const db = getWriteClient(supabase as never)

    const body = (await request.json()) as {
      employeeId?: string
      type?: string
      expiryDate?: string
      status?: string
    }
    if (!body.employeeId || !body.type?.trim()) {
      return jsonBadRequest("Employee and certificate type are required")
    }
    if (!body.expiryDate) {
      return jsonBadRequest("Expiry date is required")
    }
    if (!isValidDate(body.expiryDate)) {
      return jsonBadRequest("Invalid expiry date")
    }

    const { data: employee, error: employeeError } = await db
      .from("Employee")
      .select("*")
      .eq("id", body.employeeId)
      .maybeSingle()
    if (employeeError || !employee) return jsonBadRequest("Invalid employee")
    if (
      rowOrganisationId(
        (employee ?? null) as Record<string, unknown> | null | undefined
      ) !== auth.organisationId
    ) {
      return jsonBadRequest("Invalid employee")
    }

    const existing = await fetchCertificateForOrg(db, id, auth.organisationId)
    if (existing.error) return jsonServerError(existing.error.message, "Failed to load certificate")
    if (!existing.data) return jsonNotFound("Certificate not found")

    const issueDate = new Date().toISOString()
    const expiryDate = body.expiryDate
    const updatePayloads: Array<Record<string, unknown>> = [
      {
        employee_id: body.employeeId,
        type: body.type.trim(),
        expiry_date: body.expiryDate,
        status: body.status || "Valid",
        updatedAt: new Date().toISOString(),
      },
      {
        employeeId: body.employeeId,
        type: body.type.trim(),
        expiryDate: body.expiryDate,
        status: body.status || "Valid",
        updatedAt: new Date().toISOString(),
      },
      {
        employeeId: body.employeeId,
        type: body.type.trim(),
        issueDate,
        expiryDate,
      },
    ]

    for (const payload of updatePayloads) {
      const { data, error } = await db
        .from("Certificate")
        .update(payload)
        .eq("id", id)
        .select("*")
        .single()
      if (!error && data) return jsonOk({ item: data })
    }
    return jsonServerError("Failed to update certificate", "Failed to update certificate")
  } catch (error) {
    return jsonServerError(error, "Failed to update certificate")
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const auth = await requireUserAndOrganisation(supabase as never)
    if (!auth.ok) return auth.response
    const db = getWriteClient(supabase as never)

    const existing = await fetchCertificateForOrg(db, id, auth.organisationId)
    if (existing.error) return jsonServerError(existing.error.message, "Failed to load certificate")
    if (!existing.data) return jsonNotFound("Certificate not found")

    const { error } = await db.from("Certificate").delete().eq("id", id)
    if (error) return jsonServerError(error.message, "Failed to delete certificate")

    return jsonOk({ ok: true })
  } catch (error) {
    return jsonServerError(error, "Failed to delete certificate")
  }
}
