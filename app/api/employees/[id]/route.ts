import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentOrganisationId } from "@/lib/supabase/live-data"
import { requireUserAndOrganisation } from "@/lib/supabase/auth-context"
import {
  jsonBadRequest,
  jsonNotFound,
  jsonServerError,
} from "@/lib/api/responses"

type Params = { params: Promise<{ id: string }> }

export async function GET(_: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const organisationId = await getCurrentOrganisationId(supabase as never)
  if (!organisationId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })

  const attempts = [
    () => supabase.from("Employee").select("*").eq("id", id).eq("organisation_id", organisationId).maybeSingle(),
    () => supabase.from("Employee").select("*").eq("id", id).eq("organisationId", organisationId).maybeSingle(),
  ]

  for (const attempt of attempts) {
    const { data, error } = await attempt()
    if (!error && data) return NextResponse.json({ item: data })
  }
  return NextResponse.json({ error: "Employee not found" }, { status: 404 })
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const auth = await requireUserAndOrganisation(supabase as never)
    if (!auth.ok) return auth.response

    const body = (await request.json()) as {
      name?: string
      email?: string
      onboardingStatus?: string
    }

    if (!body.name?.trim()) {
      return jsonBadRequest("Name is required")
    }

    const updatePayloads: Array<Record<string, unknown>> = [
      {
        name: body.name.trim(),
        email: body.email?.trim() || null,
        onboarding_status: body.onboardingStatus?.trim() || "Not Started",
        updatedAt: new Date().toISOString(),
      },
      {
        name: body.name.trim(),
        email: body.email?.trim() || null,
        onboardingStatus: body.onboardingStatus?.trim() || "Not Started",
        updatedAt: new Date().toISOString(),
      },
      {
        name: body.name.trim(),
        email: body.email?.trim() || `${body.name.trim().toLowerCase().replace(/\s+/g, ".")}@example.local`,
        updatedAt: new Date().toISOString(),
      },
    ]

    const whereAttempts = [
      (payload: Record<string, unknown>) =>
        supabase.from("Employee").update(payload).eq("id", id).eq("organisation_id", auth.organisationId).select("*").maybeSingle(),
      (payload: Record<string, unknown>) =>
        supabase.from("Employee").update(payload).eq("id", id).eq("organisationId", auth.organisationId).select("*").maybeSingle(),
    ]

    for (const payload of updatePayloads) {
      for (const whereAttempt of whereAttempts) {
        const { data, error } = await whereAttempt(payload)
        if (!error && data) return NextResponse.json({ item: data })
      }
    }

    return jsonNotFound("Employee not found")
  } catch (error) {
    return jsonServerError(error, "Failed to update employee")
  }
}
