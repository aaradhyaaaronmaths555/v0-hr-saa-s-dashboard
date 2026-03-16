import { createClient } from "@/lib/supabase/server"
import {
  getWHSIncidentsForOrg,
  getWHSIncidentTimelineForOrg,
} from "@/lib/supabase/live-data"
import { WhsIncidentsClient } from "@/components/whs/whs-incidents-client"
import { getCurrentUserAndOrganisation } from "@/lib/supabase/auth-context"

type Incident = {
  id: string
  incidentType: string
  incidentDate: string
  employeesInvolved: string
  correctiveAction: string
  preventionSteps?: string | null
  assignedTo?: string | null
  dateClosed?: string | null
  status: string
  riskFlags?: {
    stuck?: boolean
    closedWithoutCorrective?: boolean
  }
}

type TimelineEvent = {
  id: string
  incidentId: string
  eventType: string
  statusFrom?: string | null
  statusTo?: string | null
  comment?: string | null
  assignedTo?: string | null
  createdAt: string
}

export default async function WhsIncidentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string }>
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const supabase = await createClient()
  const { organisationId } = await getCurrentUserAndOrganisation(supabase as never)

  const incidents = organisationId
    ? ((await getWHSIncidentsForOrg(supabase as never, organisationId)) as Incident[])
    : []
  const timelineRows = organisationId
    ? ((await getWHSIncidentTimelineForOrg(
        supabase as never,
        organisationId
      )) as TimelineEvent[])
    : []

  const withRiskFlags = incidents.map((incident) => {
    const status = incident.status ?? "New"
    const incidentDate = incident.incidentDate ? new Date(incident.incidentDate) : null
    const ageDays =
      incidentDate && !Number.isNaN(incidentDate.getTime())
        ? Math.floor((Date.now() - incidentDate.getTime()) / 86400000)
        : 0
    return {
      ...incident,
      riskFlags: {
        stuck: (status === "New" || status === "In review") && ageDays > 7,
        closedWithoutCorrective:
          status === "Closed" && !(incident.correctiveAction ?? "").trim(),
      },
    }
  })

  return (
    <WhsIncidentsClient
      initialItems={withRiskFlags}
      initialTimeline={timelineRows}
      showSuccess={!!resolvedSearchParams?.success}
    />
  )
}
