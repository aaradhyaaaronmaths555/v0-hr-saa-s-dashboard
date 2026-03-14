import type {
  LiveEmployee,
  LivePolicy,
  LivePolicyAcknowledgement,
} from "@/lib/supabase/live-data"

export type ReminderEventRow = {
  policyId: string
  employeeId: string
  sentAt: string
  status: string
}

export type PolicyCompletionStats = {
  acknowledgedCount: number
  totalEmployees: number
  completionPercentage: number
  outstandingEmployees: LiveEmployee[]
}

export function getAcknowledgedByPolicy(
  acknowledgements: LivePolicyAcknowledgement[]
): Map<string, Set<string>> {
  const output = new Map<string, Set<string>>()
  for (const acknowledgement of acknowledgements) {
    if (!acknowledgement.acknowledgedAt) continue
    const set = output.get(acknowledgement.policyId) ?? new Set<string>()
    set.add(acknowledgement.employeeId)
    output.set(acknowledgement.policyId, set)
  }
  return output
}

export function getPolicyCompletionStats(
  policyId: string,
  employees: LiveEmployee[],
  acknowledgements: LivePolicyAcknowledgement[]
): PolicyCompletionStats {
  const acknowledgedByPolicy = getAcknowledgedByPolicy(acknowledgements)
  const acknowledged = acknowledgedByPolicy.get(policyId) ?? new Set<string>()
  const totalEmployees = employees.length
  const acknowledgedCount = acknowledged.size
  const completionPercentage =
    totalEmployees > 0 ? Math.round((acknowledgedCount / totalEmployees) * 100) : 0
  const outstandingEmployees = employees.filter((employee) => !acknowledged.has(employee.id))

  return {
    acknowledgedCount,
    totalEmployees,
    completionPercentage,
    outstandingEmployees,
  }
}

export function getPolicyCompletionStatsMap(
  policies: LivePolicy[],
  employees: LiveEmployee[],
  acknowledgements: LivePolicyAcknowledgement[]
): Map<string, PolicyCompletionStats> {
  const acknowledgedByPolicy = getAcknowledgedByPolicy(acknowledgements)
  const output = new Map<string, PolicyCompletionStats>()

  for (const policy of policies) {
    const acknowledged = acknowledgedByPolicy.get(policy.id) ?? new Set<string>()
    const totalEmployees = employees.length
    const acknowledgedCount = acknowledged.size
    const completionPercentage =
      totalEmployees > 0 ? Math.round((acknowledgedCount / totalEmployees) * 100) : 0
    const outstandingEmployees = employees.filter((employee) => !acknowledged.has(employee.id))

    output.set(policy.id, {
      acknowledgedCount,
      totalEmployees,
      completionPercentage,
      outstandingEmployees,
    })
  }

  return output
}

export function getLatestReminderByEmployee(
  events: ReminderEventRow[]
): Map<string, string> {
  const latestByEmployee = new Map<string, string>()
  for (const event of events) {
    if (event.status !== "sent") continue
    const existing = latestByEmployee.get(event.employeeId)
    if (!existing || new Date(event.sentAt).getTime() > new Date(existing).getTime()) {
      latestByEmployee.set(event.employeeId, event.sentAt)
    }
  }
  return latestByEmployee
}

export function getNextRunFromCadence(cadenceDays: number): string {
  const nextRun = new Date()
  nextRun.setDate(nextRun.getDate() + cadenceDays)
  return nextRun.toISOString()
}
