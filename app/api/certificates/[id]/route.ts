import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentOrganisationId } from "@/lib/supabase/live-data"
import { requireUserAndOrganisation } from "@/lib/supabase/auth-context"
import {
  jsonBadRequest,
  jsonNotFound,
  jsonServerError,
} from "@/lib/api/responses"

type Params = { params: Promise<{ id: string }> }

function isValidDate(value: string) {
  return !Number.isNaN(new Date(value).getTime())
}

async function fetchCertificateForOrg(
  supabase: any,
  id: string,
  organisationId: string
) {
  const { data: cert, error: certError } = await supabase
    .from("Certificate")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  if (certError || !cert) return { data: null, error: certError }

  const employeeId =
    (cert as { employeeId?: string; employee_id?: string }).employeeId ??
    (cert as { employeeId?: string; employee_id?: string }).employee_id
  if (!employeeId) return { data: null, error: null }

  const ownershipAttempts = [
    () =>
      supabase
        .from("Employee")
        .select("id")
        .eq("id", employeeId)
        .eq("organisation_id", organisationId)
        .maybeSingle(),
    () =>
      supabase
        .from("Employee")
        .select("id")
        .eq("id", employeeId)
        .eq("organisationId", organisationId)
        .maybeSingle(),
  ]
  for (const attempt of ownershipAttempts) {
    const { data: employee, error } = await attempt()
    if (!error && employee) return { data: cert, error: null }
  }
  return { data: null, error: null }
}

export async function GET(_: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const organisationId = await getCurrentOrganisationId(supabase as never)
  if (!organisationId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })

  const { data, error } = await fetchCertificateForOrg(supabase, id, organisationId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
  return NextResponse.json({ item: data })
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const auth = await requireUserAndOrganisation(supabase as never)
    if (!auth.ok) return auth.response

    const body = (await request.json()) as {
      employeeId?: string
      type?: string
      expiryDate?: string
      status?: string
    }
    if (!body.employeeId || !body.type?.trim()) {
      return jsonBadRequest("Employee and certificate type are required")
    }
    if (body.expiryDate && !isValidDate(body.expiryDate)) {
      return jsonBadRequest("Invalid expiry date")
    }

    const ownershipAttempts = [
      () =>
        supabase
          .from("Employee")
          .select("id")
          .eq("id", body.employeeId)
          .eq("organisation_id", auth.organisationId)
          .maybeSingle(),
      () =>
        supabase
          .from("Employee")
          .select("id")
          .eq("id", body.employeeId)
          .eq("organisationId", auth.organisationId)
          .maybeSingle(),
    ]
    let hasEmployee = false
    for (const attempt of ownershipAttempts) {
      const { data, error } = await attempt()
      if (!error && data) {
        hasEmployee = true
        break
      }
    }
    if (!hasEmployee) return jsonBadRequest("Invalid employee")

    const existing = await fetchCertificateForOrg(supabase, id, auth.organisationId)
    if (existing.error) return jsonServerError(existing.error.message, "Failed to load certificate")
    if (!existing.data) return jsonNotFound("Certificate not found")

    const issueDate = new Date().toISOString()
    const expiryDate =
      body.expiryDate ||
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    const updatePayloads: Array<Record<string, unknown>> = [
      {
        employee_id: body.employeeId,
        type: body.type.trim(),
        expiry_date: body.expiryDate || null,
        status: body.status || "Valid",
        updatedAt: new Date().toISOString(),
      },
      {
        employeeId: body.employeeId,
        type: body.type.trim(),
        expiryDate: body.expiryDate || null,
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
      const { data, error } = await supabase
        .from("Certificate")
        .update(payload)
        .eq("id", id)
        .select("*")
        .single()
      if (!error && data) return NextResponse.json({ item: data })
    }
    return jsonServerError("Failed to update certificate", "Failed to update certificate")
  } catch (error) {
    return jsonServerError(error, "Failed to update certificate")
  }
}
