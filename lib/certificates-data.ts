import { createClient } from "@/lib/supabase/client"
import { fetchLiveComplianceData } from "@/lib/supabase/live-data"
import { getCertificateAlertBuckets } from "@/lib/compliance/metrics"

export async function getCertificatesAlertSummary() {
  const supabase = createClient()
  const data = await fetchLiveComplianceData(supabase as never)
  return getCertificateAlertBuckets(data.certificates)
}
