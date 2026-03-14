import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { fetchLiveComplianceData } from "@/lib/supabase/live-data"
import { requireUserAndOrganisation } from "@/lib/supabase/auth-context"
import { jsonBadRequest, jsonServerError } from "@/lib/api/responses"

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

  const { data: checklistRows, error } = await supabase
    .from("FairWorkChecklist")
    .select("*")
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const byEmployee = new Map(
    (checklistRows ?? []).map((row: { employeeId: string }) => [row.employeeId, row])
  )

  const items = data.employees.map((employee: { id: string; name: string }) => {
    const row = byEmployee.get(employee.id) as
      | {
          taxFileDeclaration?: boolean
          superChoiceForm?: boolean
          fairWorkInfoStatement?: boolean
        }
      | undefined

    return {
      employeeId: employee.id,
      employeeName: employee.name,
      taxFileDeclaration: row?.taxFileDeclaration ?? false,
      superChoiceForm: row?.superChoiceForm ?? false,
      fairWorkInfoStatement: row?.fairWorkInfoStatement ?? false,
    }
  })

  return NextResponse.json({ items })
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const auth = await requireUserAndOrganisation(supabase as never)
    if (!auth.ok) return auth.response

    const body = (await request.json()) as {
      employeeId?: string
      taxFileDeclaration?: boolean
      superChoiceForm?: boolean
      fairWorkInfoStatement?: boolean
    }

    if (!body.employeeId) {
      return jsonBadRequest("Missing employeeId")
    }

    const employeeInOrg = await employeeExistsInOrg(
      supabase,
      body.employeeId,
      auth.organisationId
    )
    if (!employeeInOrg) {
      return jsonBadRequest("Invalid employee")
    }

    const payload = {
      employeeId: body.employeeId,
      taxFileDeclaration: !!body.taxFileDeclaration,
      superChoiceForm: !!body.superChoiceForm,
      fairWorkInfoStatement: !!body.fairWorkInfoStatement,
      updatedAt: new Date().toISOString(),
    }

    const { error } = await supabase
      .from("FairWorkChecklist")
      .upsert(payload, { onConflict: "employeeId" })

    if (error) return jsonServerError(error.message, "Failed to save fair work checklist")
    return NextResponse.json({ ok: true })
  } catch (error) {
    return jsonServerError(error, "Failed to save fair work checklist")
  }
}
