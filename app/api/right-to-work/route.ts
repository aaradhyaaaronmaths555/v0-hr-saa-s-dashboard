import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { fetchLiveComplianceData } from "@/lib/supabase/live-data"
import { requireUserAndOrganisation } from "@/lib/supabase/auth-context"
import { jsonBadRequest, jsonServerError } from "@/lib/api/responses"
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

export async function GET() {
  const supabase = await createClient()
  const data = await fetchLiveComplianceData(supabase as never)

  const { data: visaRows, error } = await supabase.from("RightToWork").select("*")
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const byEmployee = new Map(
    (visaRows ?? []).map((row: { employeeId: string }) => [row.employeeId, row])
  )

  const items = data.employees.map((employee: { id: string; name: string }) => {
    const visa = byEmployee.get(employee.id) as
      | { id?: string; visaType?: string; visaExpiryDate?: string }
      | undefined
    return {
      id: visa?.id ?? null,
      employeeId: employee.id,
      employeeName: employee.name,
      visaType: visa?.visaType ?? "",
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
      visaType?: string
      visaExpiryDate?: string
    }

    if (!body.employeeId || !body.visaType?.trim() || !body.visaExpiryDate) {
      return jsonBadRequest("Missing required fields")
    }
    if (!isValidDate(body.visaExpiryDate)) {
      return jsonBadRequest("Invalid visa expiry date")
    }

    const employeeInOrg = await employeeExistsInOrg(
      db,
      body.employeeId,
      auth.organisationId
    )
    if (!employeeInOrg) {
      return jsonBadRequest("Invalid employee")
    }

    const payload = {
      employeeId: body.employeeId,
      visaType: body.visaType.trim(),
      visaExpiryDate: body.visaExpiryDate,
      updatedAt: new Date().toISOString(),
    }

    const { error } = await db
      .from("RightToWork")
      .upsert(payload, { onConflict: "employeeId" })

    if (error) return jsonServerError(error.message, "Failed to save right to work record")
    return NextResponse.json({ ok: true })
  } catch (error) {
    return jsonServerError(error, "Failed to save right to work record")
  }
}
