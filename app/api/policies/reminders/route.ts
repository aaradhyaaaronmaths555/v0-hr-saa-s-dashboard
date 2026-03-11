import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { fetchLiveComplianceData } from "@/lib/supabase/live-data"
import type { LivePolicy } from "@/lib/supabase/live-data"

type ReminderResult = {
  to: string
  employee: string
  policy: string
  status: "sent" | "skipped" | "failed"
  error?: string
}

async function sendReminderEmail(
  to: string,
  employeeName: string,
  policyTitle: string
): Promise<ReminderResult> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.REMINDER_FROM_EMAIL

  if (!to) {
    return {
      to,
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
        employee: employeeName,
        policy: policyTitle,
        status: "failed",
        error: errorText,
      }
    }

    return {
      to,
      employee: employeeName,
      policy: policyTitle,
      status: "sent",
    }
  } catch (error) {
    return {
      to,
      employee: employeeName,
      policy: policyTitle,
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function POST() {
  const supabase = await createClient()
  const data = await fetchLiveComplianceData(supabase as never)

  const policyById = new Map<string, LivePolicy>(
    data.policies.map((policy: LivePolicy) => [policy.id, policy] as const)
  )
  const acknowledgementsByPolicy = new Map<string, Set<string>>()

  for (const acknowledgement of data.acknowledgements) {
    if (!acknowledgement.acknowledgedAt) continue
    const set = acknowledgementsByPolicy.get(acknowledgement.policyId) ?? new Set<string>()
    set.add(acknowledgement.employeeId)
    acknowledgementsByPolicy.set(acknowledgement.policyId, set)
  }

  const results: ReminderResult[] = []

  for (const policy of data.policies) {
    const acknowledged = acknowledgementsByPolicy.get(policy.id) ?? new Set<string>()
    for (const employee of data.employees) {
      if (acknowledged.has(employee.id)) continue
      const policyTitle = policyById.get(policy.id)?.title ?? "Policy"
      const result = await sendReminderEmail(employee.email, employee.name, policyTitle)
      results.push(result)
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
    summary,
    results,
  })
}
