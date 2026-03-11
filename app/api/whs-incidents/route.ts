import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentOrganisationId } from "@/lib/supabase/live-data"

export async function GET() {
  const supabase = await createClient()
  const organisationId = await getCurrentOrganisationId(supabase as never)
  if (!organisationId) return NextResponse.json({ items: [] })

  const { data, error } = await supabase
    .from("WHSIncident")
    .select("*")
    .eq("organisationId", organisationId)
    .order("incidentDate", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ items: data ?? [] })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const organisationId = await getCurrentOrganisationId(supabase as never)
  if (!organisationId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })

  const body = (await request.json()) as {
    incidentType?: string
    incidentDate?: string
    employeesInvolved?: string
    correctiveAction?: string
    status?: string
  }

  const payload = {
    organisationId,
    incidentType: body.incidentType ?? "General",
    incidentDate: body.incidentDate ?? new Date().toISOString(),
    employeesInvolved: body.employeesInvolved ?? "",
    correctiveAction: body.correctiveAction ?? "",
    status: body.status ?? "Open",
  }

  const { data, error } = await supabase
    .from("WHSIncident")
    .insert(payload)
    .select("*")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ item: data }, { status: 201 })
}
