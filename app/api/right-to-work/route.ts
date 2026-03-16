import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  getEmployeesForOrg,
  getRightToWorkForOrg,
} from "@/lib/supabase/live-data"
import { requireUserAndOrganisation } from "@/lib/supabase/auth-context"
import { jsonBadRequest, jsonServerError } from "@/lib/api/responses"
import { getWriteClient } from "@/lib/supabase/write-client"
import {
  buildVisaTypeFromResidency,
  isResidencyStatus,
  parseVisaTypeForResidency,
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

function rowOrganisationId(row: Record<string, unknown> | null | undefined): string {
  if (!row) return ""
  const camel = row.organisationId
  if (typeof camel === "string" && camel.length > 0) return camel
  const snake = row.organisation_id
  if (typeof snake === "string" && snake.length > 0) return snake
  return ""
}

export async function GET() {
  const supabase = await createClient()
  const auth = await requireUserAndOrganisation(supabase as never)
  if (!auth.ok) return auth.response

  const employees = await getEmployeesForOrg(supabase as never, auth.organisationId)
  const employeeIds = new Set(employees.map((employee) => employee.id))
  const visaRows = await getRightToWorkForOrg(supabase as never, employeeIds)
  const byEmployee = new Map(visaRows.map((row) => [row.employeeId, row] as const))

  const items = employees.map((employee) => {
    const visa = byEmployee.get(employee.id)
    const parsed = parseVisaTypeForResidency(visa?.visaType ?? "")
    return {
      id: visa?.id ?? null,
      employeeId: employee.id,
      employeeName: employee.name,
      residencyStatus: parsed.residencyStatus,
      visaSubtype: parsed.visaSubtype,
      visaExpiryDate: visa?.visaExpiryDate ?? null,
    }
  })

  return NextResponse.json({ items })
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

    const { data: employee, error: employeeError } = await db
      .from("Employee")
      .select("*")
      .eq("id", body.employeeId)
      .maybeSingle()
    if (employeeError || !employee) {
      return jsonBadRequest("Invalid employee")
    }
    if (
      rowOrganisationId(
        (employee ?? null) as Record<string, unknown> | null | undefined
      ) !== auth.organisationId
    ) {
      return jsonBadRequest("Invalid employee")
    }

    const visaType = buildVisaTypeFromResidency(
      residencyStatus,
      body.visaSubtype ?? ""
    )
    const storedVisaExpiryDate = getStoredVisaExpiryDate(
      residencyStatus,
      body.visaExpiryDate
    )
    const payloadVariants: Array<Record<string, unknown>> = [
      {
        employeeId: body.employeeId,
        visaType,
        visaExpiryDate: storedVisaExpiryDate,
        updatedAt: new Date().toISOString(),
      },
      {
        employee_id: body.employeeId,
        visa_type: visaType,
        visa_expiry_date: storedVisaExpiryDate,
        updated_at: new Date().toISOString(),
      },
      {
        employee_id: body.employeeId,
        visaType,
        visaExpiryDate: storedVisaExpiryDate,
        updatedAt: new Date().toISOString(),
      },
    ]

    const onConflictColumns = ["employeeId", "employee_id"]
    let savedItem: unknown = null
    let lastError = "Failed to save right to work record"
    for (const onConflict of onConflictColumns) {
      for (const payload of payloadVariants) {
        const { data, error } = await db
          .from("RightToWork")
          .upsert(payload, { onConflict })
          .select("*")
          .single()
        if (!error) {
          savedItem = data
          break
        }
        lastError = error.message || lastError
      }
      if (savedItem) break
    }

    if (!savedItem) return jsonServerError(lastError, "Failed to save right to work record")
    return NextResponse.json({ item: savedItem })
  } catch (error) {
    return jsonServerError(error, "Failed to save right to work record")
  }
}
