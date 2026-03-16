import { createClient } from "@/lib/supabase/server"
import { requireUserAndOrganisation } from "@/lib/supabase/auth-context"
import { getWriteClient } from "@/lib/supabase/write-client"
import {
  jsonBadRequest,
  jsonCreated,
  jsonServerError,
} from "@/lib/api/responses"

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

    const employeeInOrg = await employeeExistsInOrg(
      db,
      body.employeeId,
      auth.organisationId
    )
    if (!employeeInOrg) return jsonBadRequest("Invalid employee")

    const issueDate = new Date().toISOString()
    const expiryDate = body.expiryDate

    const payloadVariants: Array<Record<string, unknown>> = [
      // Current app schema (snake_case)
      {
        employee_id: body.employeeId,
        type: body.type.trim(),
        expiry_date: body.expiryDate,
        status: body.status || "Valid",
      },
      // CamelCase variant
      {
        employeeId: body.employeeId,
        type: body.type.trim(),
        expiryDate: body.expiryDate,
        status: body.status || "Valid",
      },
      // Legacy schema with required issue/expiry
      {
        employeeId: body.employeeId,
        type: body.type.trim(),
        issueDate,
        expiryDate,
        fileUrl: null,
      },
      {
        employee_id: body.employeeId,
        type: body.type.trim(),
        issue_date: issueDate,
        expiry_date: expiryDate,
        file_url: null,
      },
    ]

    let createdItem: unknown = null
    let lastErrorMessage = "Failed to create certificate"
    for (const payload of payloadVariants) {
      const { data, error } = await db
        .from("Certificate")
        .insert(payload)
        .select("*")
        .single()
      if (!error) {
        createdItem = data
        break
      }
      lastErrorMessage = error.message || lastErrorMessage
    }
    if (!createdItem) return jsonServerError(lastErrorMessage, "Failed to create certificate")
    return jsonCreated({ item: createdItem })
  } catch (error) {
    return jsonServerError(error, "Failed to create certificate")
  }
}
