import { createClient } from "@/lib/supabase/server"
import { requireUserAndOrganisation } from "@/lib/supabase/auth-context"
import { jsonBadRequest, jsonCreated, jsonServerError } from "@/lib/api/responses"
import { getWriteClient } from "@/lib/supabase/write-client"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const auth = await requireUserAndOrganisation(supabase as never)
    if (!auth.ok) return auth.response
    const db = getWriteClient(supabase as never)

    const body = (await request.json()) as {
      title?: string
      description?: string
    }
    if (!body.title?.trim()) {
      return jsonBadRequest("Policy title is required")
    }

    const title = body.title.trim()
    const description = body.description?.trim() || "Policy details pending."

    const payloadVariants: Array<Record<string, unknown>> = [
      // Current app schema (snake_case)
      {
        organisation_id: auth.organisationId,
        title,
        description: body.description?.trim() || null,
      },
      // CamelCase variant
      {
        organisationId: auth.organisationId,
        title,
        description: body.description?.trim() || null,
      },
      // Legacy schema variant with required fields
      {
        organisationId: auth.organisationId,
        title,
        description,
        category: "General",
        status: "Active",
        deadline: null,
      },
      {
        organisation_id: auth.organisationId,
        title,
        description,
        category: "General",
        status: "Active",
        deadline: null,
      },
    ]

    let createdItem: unknown = null
    let lastErrorMessage = "Failed to create policy"
    for (const payload of payloadVariants) {
      const { data, error } = await db.from("Policy").insert(payload).select("*").single()
      if (!error) {
        createdItem = data
        break
      }
      lastErrorMessage = error.message || lastErrorMessage
    }

    if (!createdItem) return jsonServerError(lastErrorMessage, "Failed to create policy")
    return jsonCreated({ item: createdItem })
  } catch (error) {
    return jsonServerError(error, "Failed to create policy")
  }
}
