import { createClient } from "@/lib/supabase/server"
import { requireUserAndOrganisation } from "@/lib/supabase/auth-context"
import {
  jsonBadRequest,
  jsonOk,
  jsonNotFound,
  jsonServerError,
} from "@/lib/api/responses"
import {
  buildVisaTypeFromResidency,
  isResidencyStatus,
  parseVisaTypeForResidency,
  type ResidencyStatus,
} from "@/lib/right-to-work/residency"

type Params = { params: Promise<{ id: string }> }

function isValidDate(value: string) {
  return !Number.isNaN(new Date(value).getTime())
}

function getStoredVisaExpiryDate(
  residencyStatus: ResidencyStatus,
  visaExpiryDate?: string
): string {
  // Legacy schemas still enforce NOT NULL on visaExpiryDate.
  return residencyStatus === "Visa" ? String(visaExpiryDate) : "2099-12-31"
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
  try {
    const { id } = await params
    const supabase = await createClient()
    const auth = await requireUserAndOrganisation(supabase as never)
    if (!auth.ok) return auth.response
    const organisationId = auth.organisationId

    const { data, error } = await fetchRecordForOrg(supabase, id, organisationId)
    if (error) return jsonServerError(error.message, "Failed to load right to work record")
    if (!data) return jsonNotFound("Right to Work record not found")
    const parsed = parseVisaTypeForResidency(
      (data as { visaType?: string | null }).visaType ?? ""
    )
    return jsonOk({
      item: {
        ...data,
        residencyStatus: parsed.residencyStatus,
        visaSubtype: parsed.visaSubtype,
      },
    })
  } catch (error) {
    return jsonServerError(error, "Failed to load right to work record")
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const auth = await requireUserAndOrganisation(supabase as never)
    if (!auth.ok) return auth.response

    const body = (await request.json()) as {
      residencyStatus?: string
      visaSubtype?: string
      visaExpiryDate?: string
    }
    if (!isResidencyStatus(body.residencyStatus ?? "")) {
      return jsonBadRequest("Residency status must be Citizen, PR, or Visa")
    }
    const residencyStatus = body.residencyStatus as ResidencyStatus
    if (residencyStatus === "Visa") {
      if (!body.visaSubtype?.trim()) {
        return jsonBadRequest("Visa subtype is required when residency status is Visa")
      }
      if (!body.visaExpiryDate || !isValidDate(body.visaExpiryDate)) {
        return jsonBadRequest("A valid visa expiry date is required for Visa status")
      }
    }

    const existing = await fetchRecordForOrg(supabase, id, auth.organisationId)
    if (existing.error) return jsonServerError(existing.error.message, "Failed to load right to work record")
    if (!existing.data) return jsonNotFound("Right to Work record not found")

    const visaType = buildVisaTypeFromResidency(
      residencyStatus,
      body.visaSubtype ?? ""
    )
    const storedVisaExpiryDate = getStoredVisaExpiryDate(
      residencyStatus,
      body.visaExpiryDate
    )
    const { data, error } = await supabase
      .from("RightToWork")
      .update({
        visaType,
        visaExpiryDate: storedVisaExpiryDate,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single()

    if (error) return jsonServerError(error.message, "Failed to update right to work record")
    const parsed = parseVisaTypeForResidency(
      (data as { visaType?: string | null }).visaType ?? ""
    )
    return jsonOk({
      item: {
        ...data,
        residencyStatus: parsed.residencyStatus,
        visaSubtype: parsed.visaSubtype,
      },
    })
  } catch (error) {
    return jsonServerError(error, "Failed to update right to work record")
  }
}
