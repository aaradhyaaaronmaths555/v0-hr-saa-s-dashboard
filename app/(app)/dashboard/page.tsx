import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { fetchLiveComplianceData } from "@/lib/supabase/live-data"
import {
  getDaysUntil,
  getEmployeeComplianceScores,
} from "@/lib/compliance/metrics"
import type {
  LiveEmployee,
  LivePolicyAcknowledgement,
} from "@/lib/supabase/live-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type RiskRow = {
  id: string
  category: "Certificates" | "Fair Work" | "Policies" | "WHS"
  title: string
  detail: string
  severity: "high" | "medium"
  actionLabel: string
  href: string
}

function getScoreLabel(score: number): { label: "Green" | "Amber" | "Red"; variant: "success" | "warning" | "destructive" } {
  if (score >= 80) return { label: "Green", variant: "success" }
  if (score >= 50) return { label: "Amber", variant: "warning" }
  return { label: "Red", variant: "destructive" }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const data = await fetchLiveComplianceData(supabase as never)

  const employeeById = new Map<string, LiveEmployee>(
    data.employees.map((employee: LiveEmployee) => [employee.id, employee] as const)
  )

  const { data: fairWorkRows } = await supabase.from("FairWorkChecklist").select("*")
  const { data: whsRows } = await supabase
    .from("WHSIncident")
    .select("*")
    .order("incidentDate", { ascending: false })
  const { data: policyRows } = await supabase.from("Policy").select("*")

  const scores = getEmployeeComplianceScores(
    data.employees,
    data.certificates,
    data.policies,
    data.acknowledgements
  )
  const scoreValues = [...scores.values()].map((item) => item.score)
  const employeeAverage =
    scoreValues.length > 0
      ? Math.round(scoreValues.reduce((sum, value) => sum + value, 0) / scoreValues.length)
      : 0

  const checklistByEmployee = new Map(
    (fairWorkRows ?? []).map((row: { employeeId: string }) => [row.employeeId, row])
  )
  const fairWorkRatios = data.employees.map((employee: LiveEmployee) => {
    const checklist = checklistByEmployee.get(employee.id) as
      | {
          taxFileDeclaration?: boolean
          superChoiceForm?: boolean
          fairWorkInfoStatement?: boolean
        }
      | undefined
    const completed =
      Number(!!checklist?.taxFileDeclaration) +
      Number(!!checklist?.superChoiceForm) +
      Number(!!checklist?.fairWorkInfoStatement)
    return Math.round((completed / 3) * 100)
  })
  const fairWorkAverage =
    fairWorkRatios.length > 0
      ? Math.round(
          fairWorkRatios.reduce((sum: number, value: number) => sum + value, 0) /
            fairWorkRatios.length
        )
      : 0

  const activeIncidentCount = ((whsRows ?? []) as Array<{ status?: string }>).filter(
    (item) => (item.status ?? "New") !== "Closed"
  ).length
  const incidentComponent = Math.max(100 - activeIncidentCount * 20, 0)
  const organisationScore = Math.round(
    employeeAverage * 0.5 + fairWorkAverage * 0.3 + incidentComponent * 0.2
  )
  const scoreLabel = getScoreLabel(organisationScore)

  const risks: RiskRow[] = []

  // 1) Expired/expiring certificates (0-30 days)
  for (const cert of data.certificates) {
    const employee = employeeById.get(cert.employeeId)
    if (!employee) continue
    const days = getDaysUntil(cert.expiryDate)
    const isExpired = cert.status === "Expired" || (days !== null && days < 0)
    const isExpiringSoon = days !== null && days >= 0 && days <= 30
    if (!isExpired && !isExpiringSoon) continue

    risks.push({
      id: `cert-${cert.id}`,
      category: "Certificates",
      title: `${employee.name} - ${cert.type}`,
      detail: isExpired
        ? "Certificate expired. Immediate follow-up required."
        : `Certificate expires in ${days} day${days === 1 ? "" : "s"}.`,
      severity: isExpired ? "high" : "medium",
      actionLabel: "Upload cert",
      href: "/certificates",
    })
  }

  // 2) Missing Fair Work checklist items
  for (const employee of data.employees) {
    const checklist = checklistByEmployee.get(employee.id) as
      | {
          taxFileDeclaration?: boolean
          superChoiceForm?: boolean
          fairWorkInfoStatement?: boolean
        }
      | undefined

    const missingItems: string[] = []
    if (!checklist?.taxFileDeclaration) missingItems.push("Tax file declaration")
    if (!checklist?.superChoiceForm) missingItems.push("Super choice form")
    if (!checklist?.fairWorkInfoStatement)
      missingItems.push("Fair Work info statement")

    if (missingItems.length === 0) continue
    risks.push({
      id: `fw-${employee.id}`,
      category: "Fair Work",
      title: `${employee.name} - Missing checklist items`,
      detail: missingItems.join(", "),
      severity: "high",
      actionLabel: "Complete checklist",
      href: "/fair-work-checklist",
    })
  }

  // 3) Policies unacknowledged past deadline
  // Deadline rule: 14 days from policy creation.
  const policyCreatedById = new Map(
    (policyRows ?? []).map((row: { id: string; createdAt?: string }) => [row.id, row.createdAt ?? null])
  )
  for (const policy of data.policies) {
    const createdAt = policyCreatedById.get(policy.id)
    if (!createdAt) continue
    const deadline = new Date(createdAt)
    deadline.setDate(deadline.getDate() + 14)
    if (deadline.getTime() > Date.now()) continue

    const acknowledged = new Set(
      data.acknowledgements
        .filter(
          (ack: LivePolicyAcknowledgement) =>
            ack.policyId === policy.id && !!ack.acknowledgedAt
        )
        .map((ack: LivePolicyAcknowledgement) => ack.employeeId)
    )
    const pendingCount = data.employees.filter(
      (employee: LiveEmployee) => !acknowledged.has(employee.id)
    ).length
    if (pendingCount === 0) continue

    risks.push({
      id: `policy-${policy.id}`,
      category: "Policies",
      title: `${policy.title} - ${pendingCount} pending`,
      detail: "Acknowledgement deadline passed.",
      severity: "high",
      actionLabel: "Send reminder",
      href: "/policies",
    })
  }

  // 4) WHS lifecycle risks
  for (const incident of (whsRows ?? []) as Array<{
    id: string
    incidentType?: string
    status?: string
    incidentDate?: string
    correctiveAction?: string
  }>) {
    const status = incident.status ?? "New"
    const loggedAt = incident.incidentDate ? new Date(incident.incidentDate) : null
    const ageDays =
      loggedAt && !Number.isNaN(loggedAt.getTime())
        ? Math.floor((Date.now() - loggedAt.getTime()) / 86400000)
        : 0
    const stuck = (status === "New" || status === "In review") && ageDays > 7
    const closedWithoutCorrective =
      status === "Closed" && !(incident.correctiveAction ?? "").trim()

    if (stuck) {
      risks.push({
        id: `whs-stuck-${incident.id}`,
        category: "WHS",
        title: `${incident.incidentType ?? "Incident"} is stuck in ${status}`,
        detail: `No progress for ${ageDays} days. Move to the next lifecycle step.`,
        severity: "high",
        actionLabel: "Update incident",
        href: "/whs-incidents",
      })
      continue
    }

    if (closedWithoutCorrective) {
      risks.push({
        id: `whs-close-gap-${incident.id}`,
        category: "WHS",
        title: `${incident.incidentType ?? "Incident"} closed without corrective action`,
        detail: "Add corrective action summary and prevention steps.",
        severity: "high",
        actionLabel: "Fix closure",
        href: "/whs-incidents",
      })
      continue
    }

    if (status !== "Closed") {
      risks.push({
        id: `whs-active-${incident.id}`,
        category: "WHS",
        title: incident.incidentType ?? "Active incident",
        detail: `Current status: ${status}.`,
        severity: "medium",
        actionLabel: "Progress lifecycle",
        href: "/whs-incidents",
      })
    }
  }

  const todayRisks = risks
    .sort((a, b) => (a.severity === "high" && b.severity !== "high" ? -1 : 1))
    .slice(0, 20)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Compliance Control Centre
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Are we compliant, and what needs action now?
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Organisation Compliance Score</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-slate-900">
              {organisationScore}
            </span>
            <span className="pb-1 text-sm text-slate-500">/100</span>
          </div>
          <Badge variant={scoreLabel.variant}>{scoreLabel.label}</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Today&apos;s Risks</CardTitle>
        </CardHeader>
        <CardContent>
          {todayRisks.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              No urgent risks found right now.
            </div>
          ) : (
            <div className="space-y-3">
              {todayRisks.map((risk) => (
                <div
                  key={risk.id}
                  className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={risk.severity === "high" ? "destructive" : "warning"}
                      >
                        {risk.category}
                      </Badge>
                      <span className="truncate text-sm font-medium text-slate-900">
                        {risk.title}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{risk.detail}</p>
                  </div>
                  <Button asChild className="shrink-0">
                    <Link href={risk.href}>{risk.actionLabel}</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

