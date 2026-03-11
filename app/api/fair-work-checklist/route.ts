import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { fetchLiveComplianceData } from "@/lib/supabase/live-data"

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
  const supabase = await createClient()
  const body = (await request.json()) as {
    employeeId?: string
    taxFileDeclaration?: boolean
    superChoiceForm?: boolean
    fairWorkInfoStatement?: boolean
  }

  if (!body.employeeId) {
    return NextResponse.json({ error: "Missing employeeId" }, { status: 400 })
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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
