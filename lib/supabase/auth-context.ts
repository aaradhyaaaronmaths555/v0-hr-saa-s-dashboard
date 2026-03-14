import { getCurrentOrganisationId } from "@/lib/supabase/live-data"
import { jsonForbidden, jsonUnauthorized } from "@/lib/api/responses"

export async function requireUserAndOrganisation(supabase: any) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      ok: false as const,
      response: jsonUnauthorized(),
    }
  }

  const organisationId = await getCurrentOrganisationId(supabase)
  if (!organisationId) {
    return {
      ok: false as const,
      response: jsonForbidden("No organisation linked to user"),
    }
  }

  return {
    ok: true as const,
    user,
    organisationId,
  }
}
