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

async function fetchRecordForOrg(supabase: any, id: string, organisationId: string) {
  const { data: record, error } = await supabase
    .from("RightToWork")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  if (error || !record) return { data: null, error }

  const employeeId =
    (record as { employeeId?: string; employee_id?: string }).employeeId ??
    (record as { employeeId?: string; employee_id?: string }).employee_id
  if (!employeeId) return { data: null, error: null }

  const attempts = [
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

  for (const attempt of attempts) {
    const ownership = await attempt()
    if (!ownership.error && ownership.data) return { data: record, error: null }
  }
  return { data: null, error: null }
}

export async function GET(_: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const organisationId = await getCurrentOrganisationId(supabase as never)
  if (!organisationId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })

  const { data, error } = await fetchRecordForOrg(supabase, id, organisationId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Right to Work record not found" }, { status: 404 })
  return NextResponse.json({ item: data })
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const auth = await requireUserAndOrganisation(supabase as never)
    if (!auth.ok) return auth.response

    const body = (await request.json()) as {
      visaType?: string
      visaExpiryDate?: string
    }
    if (!body.visaType?.trim() || !body.visaExpiryDate) {
      return jsonBadRequest("Visa type and expiry date are required")
    }
    if (!isValidDate(body.visaExpiryDate)) {
      return jsonBadRequest("Invalid visa expiry date")
    }

    const existing = await fetchRecordForOrg(supabase, id, auth.organisationId)
    if (existing.error) return jsonServerError(existing.error.message, "Failed to load right to work record")
    if (!existing.data) return jsonNotFound("Right to Work record not found")

    const { data, error } = await supabase
      .from("RightToWork")
      .update({
        visaType: body.visaType.trim(),
        visaExpiryDate: body.visaExpiryDate,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single()

    if (error) return jsonServerError(error.message, "Failed to update right to work record")
    return NextResponse.json({ item: data })
  } catch (error) {
    return jsonServerError(error, "Failed to update right to work record")
  }
}
