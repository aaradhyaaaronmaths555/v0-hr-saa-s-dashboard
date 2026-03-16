import { createClient } from "@/lib/supabase/server"
import { requireUserAndOrganisation } from "@/lib/supabase/auth-context"
import { jsonBadRequest, jsonCreated, jsonServerError } from "@/lib/api/responses"
import { getWriteClient } from "@/lib/supabase/write-client"
import {
  buildVisaTypeFromResidency,
  isResidencyStatus,
  type ResidencyStatus,
} from "@/lib/right-to-work/residency"

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

async function employeeExistsInOrg(supabase: any, employeeId: string, organisationId: string) {
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
    const { data, error } = await attempt()
    if (!error && data) return true
  }
  return false
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const auth = await requireUserAndOrganisation(supabase as never)
    if (!auth.ok) return auth.response
    const db = getWriteClient(supabase as never)

    const body = (await request.json()) as {
      employeeId?: string
      residencyStatus?: string
      visaSubtype?: string
      visaExpiryDate?: string
    }

    if (!body.employeeId) {
      return jsonBadRequest("Employee is required")
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

    const employeeInOrg = await employeeExistsInOrg(
      db,
      body.employeeId,
      auth.organisationId
    )
    if (!employeeInOrg) return jsonBadRequest("Invalid employee")

    const visaType = buildVisaTypeFromResidency(
      residencyStatus,
      body.visaSubtype ?? ""
    )
    const storedVisaExpiryDate = getStoredVisaExpiryDate(
      residencyStatus,
      body.visaExpiryDate
    )
    const { data, error } = await db
      .from("RightToWork")
      .insert({
        employeeId: body.employeeId,
        visaType,
        visaExpiryDate: storedVisaExpiryDate,
      })
      .select("*")
      .single()

    if (error) return jsonServerError(error.message, "Failed to create right to work record")
    return jsonCreated({ item: data })
  } catch (error) {
    return jsonServerError(error, "Failed to create right to work record")
  }
}
