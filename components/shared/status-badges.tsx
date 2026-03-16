import { Badge } from "@/components/ui/badge"

function onboardingVariant(status: string): "success" | "warning" | "neutral" {
  const normalized = status.trim().toLowerCase()
  if (normalized === "complete") return "success"
  if (normalized === "in progress") return "warning"
  return "neutral"
}

function certificateVariant(
  status: string
): "success" | "warning" | "destructive" | "neutral" {
  const normalized = status.trim().toLowerCase()
  if (normalized === "valid") return "success"
  if (normalized === "expiring") return "warning"
  if (normalized === "expired") return "destructive"
  return "neutral"
}

function whsVariant(
  status: string
): "success" | "warning" | "destructive" | "neutral" {
  const normalized = status.trim().toLowerCase()
  if (normalized === "closed") return "success"
  if (normalized === "actioned" || normalized === "in review") return "warning"
  if (normalized === "new") return "destructive"
  return "neutral"
}

function whsLabel(status: string): string {
  const normalized = status.trim().toLowerCase()
  if (normalized === "in review") return "In Review"
  if (normalized === "actioned") return "Actioned"
  if (normalized === "closed") return "Closed"
  if (normalized === "new") return "New"
  return status
}

export function OnboardingStatusBadge({ status }: { status: string }) {
  return <Badge variant={onboardingVariant(status)}>{status}</Badge>
}

export function CertificateStatusBadge({ status }: { status: string }) {
  return <Badge variant={certificateVariant(status)}>{status}</Badge>
}

export function ComplianceStatusBadge({ compliant }: { compliant: boolean }) {
  return (
    <Badge variant={compliant ? "success" : "warning"}>
      {compliant ? "Compliant" : "Action Needed"}
    </Badge>
  )
}

export function PolicyCompletionBadge({ pending }: { pending: number }) {
  return (
    <Badge variant={pending > 0 ? "warning" : "success"}>
      {pending > 0 ? "Action Needed" : "Up to Date"}
    </Badge>
  )
}

export function WhsIncidentStatusBadge({ status }: { status: string }) {
  return <Badge variant={whsVariant(status)}>{whsLabel(status)}</Badge>
}
