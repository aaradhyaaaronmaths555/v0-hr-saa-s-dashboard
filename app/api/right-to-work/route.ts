import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { fetchLiveComplianceData } from "@/lib/supabase/live-data"

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
      | { visaType?: string; visaExpiryDate?: string }
      | undefined
    return {
      employeeId: employee.id,
      employeeName: employee.name,
      visaType: visa?.visaType ?? "",
      visaExpiryDate: visa?.visaExpiryDate ?? null,
    }
  })

  return NextResponse.json({ items })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = (await request.json()) as {
    employeeId?: string
    visaType?: string
    visaExpiryDate?: string
  }

  if (!body.employeeId || !body.visaType || !body.visaExpiryDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const payload = {
    employeeId: body.employeeId,
    visaType: body.visaType,
    visaExpiryDate: body.visaExpiryDate,
    updatedAt: new Date().toISOString(),
  }

  const { error } = await supabase
    .from("RightToWork")
    .upsert(payload, { onConflict: "employeeId" })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
