import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { fetchLiveComplianceData } from "@/lib/supabase/live-data"
import type { LiveEmployee, LivePolicy } from "@/lib/supabase/live-data"
import { requireUserAndOrganisation } from "@/lib/supabase/auth-context"
import {
  jsonBadRequest,
  jsonForbidden,
  jsonNotFound,
  jsonServerError,
} from "@/lib/api/responses"
import {
  getAcknowledgedByPolicy,
  getNextRunFromCadence,
} from "@/lib/policies/reminders"

type ReminderMode = "send_now" | "run_scheduled"

type ReminderResult = {
  to: string
  policyId: string
  employeeId: string
  employee: string
  policy: string
  status: "sent" | "skipped" | "failed"
  error?: string
}

async function sendReminderEmail(
  policyId: string,
  employeeId: string,
  to: string,
  employeeName: string,
  policyTitle: string
): Promise<ReminderResult> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.REMINDER_FROM_EMAIL

  if (!to) {
    return {
      to,
      policyId,
      employeeId,
      employee: employeeName,
      policy: policyTitle,
      status: "skipped",
      error: "Missing employee email",
    }
  }

  if (!apiKey || !from) {
    // Safe fallback for local/dev environments without email provider configured.
    return {
      to,
      policyId,
      employeeId,
      employee: employeeName,
      policy: policyTitle,
      status: "skipped",
      error: "Email provider not configured (set RESEND_API_KEY and REMINDER_FROM_EMAIL)",
    }
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `Reminder: Please acknowledge "${policyTitle}"`,
        html: `<p>Hi ${employeeName},</p><p>This is a reminder to acknowledge the policy <strong>${policyTitle}</strong> in PeopleDesk.</p><p>Thanks.</p>`,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return {
        to,
        policyId,
        employeeId,
        employee: employeeName,
        policy: policyTitle,
        status: "failed",
        error: errorText,
      }
    }

    return {
      to,
      policyId,
      employeeId,
      employee: employeeName,
      policy: policyTitle,
      status: "sent",
    }
  } catch (error) {
    return {
      to,
      policyId,
      employeeId,
      employee: employeeName,
      policy: policyTitle,
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const auth = await requireUserAndOrganisation(supabase as never)
    if (!auth.ok) return auth.response

    const data = await fetchLiveComplianceData(supabase as never)
    if (!data.organisationId) {
      return jsonForbidden("No organisation linked to user")
    }

    const body = (await request.json().catch(() => ({}))) as {
      mode?: ReminderMode
      policyId?: string
    }
    const mode = body.mode ?? "send_now"
    if (mode !== "send_now" && mode !== "run_scheduled") {
      return jsonBadRequest("Invalid reminder mode")
    }

  const policyById = new Map<string, LivePolicy>(
    data.policies.map((policy: LivePolicy) => [policy.id, policy] as const)
  )
  const acknowledgedByPolicy = getAcknowledgedByPolicy(data.acknowledgements)
  const nowIso = new Date().toISOString()

    const { data: scheduleRowsRaw } = await supabase
      .from("PolicyReminderSchedule")
      .select("policyId,autoRemindEnabled,cadenceDays,deadlineAt,nextRunAt")
      .eq("organisationId", data.organisationId)

  const scheduleByPolicy = new Map<
    string,
    {
      autoRemindEnabled: boolean
      cadenceDays: number
      deadlineAt: string | null
      nextRunAt: string | null
    }
  >()
  for (const row of scheduleRowsRaw ?? []) {
    const policyId = (row as { policyId?: string }).policyId
    if (!policyId) continue
    scheduleByPolicy.set(policyId, {
      autoRemindEnabled: !!(row as { autoRemindEnabled?: boolean }).autoRemindEnabled,
      cadenceDays: (row as { cadenceDays?: number }).cadenceDays ?? 3,
      deadlineAt: (row as { deadlineAt?: string | null }).deadlineAt ?? null,
      nextRunAt: (row as { nextRunAt?: string | null }).nextRunAt ?? null,
    })
  }

    let targetPolicies = data.policies
    if (body.policyId) {
      targetPolicies = data.policies.filter(
        (policy: LivePolicy) => policy.id === body.policyId
      )
      if (targetPolicies.length === 0) {
        return jsonNotFound("Policy not found")
      }
    }

  if (mode === "run_scheduled") {
    const nowMs = Date.now()
    targetPolicies = targetPolicies.filter((policy: LivePolicy) => {
      const schedule = scheduleByPolicy.get(policy.id)
      if (!schedule || !schedule.autoRemindEnabled) return false
      if (!schedule.nextRunAt) return false
      if (new Date(schedule.nextRunAt).getTime() > nowMs) return false
      if (schedule.deadlineAt && new Date(schedule.deadlineAt).getTime() < nowMs) return false
      return true
    })
  }

    const results: ReminderResult[] = []
    const scheduleUpserts: Array<{
    organisationId: string
    policyId: string
    autoRemindEnabled: boolean
    cadenceDays: number
    deadlineAt: string | null
    nextRunAt: string | null
    lastRunAt: string
    updatedAt: string
  }> = []

    for (const policy of targetPolicies) {
    const acknowledged = acknowledgedByPolicy.get(policy.id) ?? new Set<string>()
    const outstandingEmployees = data.employees.filter(
      (employee: LiveEmployee) => !acknowledged.has(employee.id)
    )
    for (const employee of outstandingEmployees) {
      const policyTitle = policyById.get(policy.id)?.title ?? "Policy"
      const result = await sendReminderEmail(
        policy.id,
        employee.id,
        employee.email,
        employee.name,
        policyTitle
      )
      results.push(result)
    }

    if (mode === "run_scheduled") {
      const schedule = scheduleByPolicy.get(policy.id)
      const cadenceDays = schedule?.cadenceDays ?? 3
      const deadlineAt = schedule?.deadlineAt ?? null
      const hasOutstandingAfterRun = outstandingEmployees.length > 0
      const nextRunAt =
        hasOutstandingAfterRun &&
        (!deadlineAt || new Date(deadlineAt).getTime() >= Date.now())
          ? getNextRunFromCadence(cadenceDays)
          : null

      scheduleUpserts.push({
        organisationId: auth.organisationId,
        policyId: policy.id,
        autoRemindEnabled: true,
        cadenceDays,
        deadlineAt,
        nextRunAt,
        lastRunAt: nowIso,
        updatedAt: nowIso,
      })
    }
  }

    if (scheduleUpserts.length > 0) {
      const { error: scheduleError } = await supabase
        .from("PolicyReminderSchedule")
        .upsert(scheduleUpserts, { onConflict: "policyId" })
      if (scheduleError) {
        return jsonServerError(scheduleError.message, "Failed to update reminder schedule")
      }
    }

    if (results.length > 0) {
      const events = results.map((result) => ({
        organisationId: auth.organisationId,
        policyId: result.policyId,
        employeeId: result.employeeId,
        sentAt: nowIso,
        triggerType: mode === "run_scheduled" ? "scheduled" : "manual",
        status: result.status,
        errorMessage: result.error ?? null,
      }))
      const { error: eventError } = await supabase.from("PolicyReminderEvent").insert(events)
      if (eventError) {
        return jsonServerError(eventError.message, "Failed to save reminder events")
      }
    }

  const summary = {
    sent: results.filter((result) => result.status === "sent").length,
    skipped: results.filter((result) => result.status === "skipped").length,
    failed: results.filter((result) => result.status === "failed").length,
    total: results.length,
  }

    return NextResponse.json({
      ok: true,
      mode,
      summary,
      results,
    })
  } catch (error) {
    return jsonServerError(error, "Failed to process reminders")
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const auth = await requireUserAndOrganisation(supabase as never)
    if (!auth.ok) return auth.response
    const data = await fetchLiveComplianceData(supabase as never)
    if (!data.organisationId) {
      return jsonForbidden("No organisation linked to user")
    }

  const body = (await request.json()) as {
    policyId?: string
    autoRemindEnabled?: boolean
  }

    if (!body.policyId || typeof body.autoRemindEnabled !== "boolean") {
      return jsonBadRequest("Missing policyId or autoRemindEnabled")
    }

    const policy = data.policies.find((item: LivePolicy) => item.id === body.policyId)
    if (!policy) {
      return jsonNotFound("Policy not found")
    }

  const cadenceDays = 3
  const createdAt = policy.createdAt ? new Date(policy.createdAt) : new Date()
  const defaultDeadline = new Date(createdAt)
  defaultDeadline.setDate(defaultDeadline.getDate() + 30)
  const nowIso = new Date().toISOString()

    const payload = {
      organisationId: auth.organisationId,
      policyId: policy.id,
      autoRemindEnabled: body.autoRemindEnabled,
      cadenceDays,
      deadlineAt: defaultDeadline.toISOString(),
      nextRunAt: body.autoRemindEnabled ? getNextRunFromCadence(cadenceDays) : null,
      updatedAt: nowIso,
    }

    const { error } = await supabase
      .from("PolicyReminderSchedule")
      .upsert(payload, { onConflict: "policyId" })
    if (error) {
      return jsonServerError(error.message, "Failed to update reminder settings")
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return jsonServerError(error, "Failed to update reminder settings")
  }
}
