import { createClient } from "@/lib/supabase/server"
import { requireUserAndOrganisation } from "@/lib/supabase/auth-context"
import { jsonBadRequest, jsonCreated, jsonServerError } from "@/lib/api/responses"
import { getWriteClient } from "@/lib/supabase/write-client"

function isValidDate(value: string) {
  return !Number.isNaN(new Date(value).getTime())
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
      visaType?: string
      visaExpiryDate?: string
    }

    if (!body.employeeId || !body.visaType?.trim() || !body.visaExpiryDate) {
      return jsonBadRequest("Employee, visa type and expiry date are required")
    }
    if (!isValidDate(body.visaExpiryDate)) {
      return jsonBadRequest("Invalid visa expiry date")
    }

    const employeeInOrg = await employeeExistsInOrg(
      db,
      body.employeeId,
      auth.organisationId
    )
    if (!employeeInOrg) return jsonBadRequest("Invalid employee")

    const { data, error } = await db
      .from("RightToWork")
      .insert({
        employeeId: body.employeeId,
        visaType: body.visaType.trim(),
        visaExpiryDate: body.visaExpiryDate,
      })
      .select("*")
      .single()

    if (error) return jsonServerError(error.message, "Failed to create right to work record")
    return jsonCreated({ item: data })
  } catch (error) {
    return jsonServerError(error, "Failed to create right to work record")
  }
}
