import { createAdminClient } from "@/lib/supabase/admin"

export function getWriteClient(userScopedClient: any) {
  return createAdminClient() ?? userScopedClient
}
