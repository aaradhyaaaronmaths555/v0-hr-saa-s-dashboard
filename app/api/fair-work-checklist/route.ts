import { createClient } from "@/lib/supabase/server"
import { fetchLiveComplianceData } from "@/lib/supabase/live-data"
import { requireUserAndOrganisation } from "@/lib/supabase/auth-context"
import { jsonBadRequest, jsonOk, jsonServerError } from "@/lib/api/responses"
import { getWriteClient } from "@/lib/supabase/write-client"

async function employeeExistsInOrg(supabase: any, employeeId: string, organisationId: string) {
  const { data: employee, error } = await supabase
    .from("Employee")
    .select("*")
    .eq("id", employeeId)
    .maybeSingle()
  if (error || !employee) return false
  const row = employee as Record<string, unknown>
  const org =
    (typeof row.organisationId === "string" ? row.organisationId : null) ??
    (typeof row.organisation_id === "string" ? row.organisation_id : null)
  return org === organisationId
}

function readEmployeeId(row: Record<string, unknown>): string {
  const camel = row.employeeId
  if (typeof camel === "string" && camel.length > 0) return camel
  const snake = row.employee_id
  if (typeof snake === "string" && snake.length > 0) return snake
  return ""
}

function readChecklistFlag(
  row: Record<string, unknown>,
  camelKey: string,
  snakeKey: string
): boolean {
  const camel = row[camelKey]
  if (typeof camel === "boolean") return camel
  const snake = row[snakeKey]
  if (typeof snake === "boolean") return snake
  return false
}

async function fetchChecklistRowsForEmployees(db: any, employeeIds: string[]) {
  if (employeeIds.length === 0) return [] as Record<string, unknown>[]

  const attempts = [
    () =>
      db
        .from("FairWorkChecklist")
        .select("*")
        .in("employeeId", employeeIds),
    () =>
      db
        .from("FairWorkChecklist")
        .select("*")
        .in("employee_id", employeeIds),
  ]

  for (const attempt of attempts) {
    const { data, error } = await attempt()
    if (!error) {
      return (data ?? []) as Record<string, unknown>[]
    }
  }
  return [] as Record<string, unknown>[]
}

async function getExistingChecklistRowByEmployeeId(db: any, employeeId: string) {
  const attempts = [
    () => db.from("FairWorkChecklist").select("*").eq("employeeId", employeeId).maybeSingle(),
    () => db.from("FairWorkChecklist").select("*").eq("employee_id", employeeId).maybeSingle(),
  ]
  for (const attempt of attempts) {
    const { data, error } = await attempt()
    if (!error && data) return data as Record<string, unknown>
  }
  return null
}

export async function GET() {
  try {
    const supabase = await createClient()
    const auth = await requireUserAndOrganisation(supabase as never)
    if (!auth.ok) return auth.response
    const db = getWriteClient(supabase as never)
    const data = await fetchLiveComplianceData(supabase as never)
    const employeeIds = data.employees.map((employee: { id: string }) => employee.id)
    const checklistRows = await fetchChecklistRowsForEmployees(db, employeeIds)

    const byEmployee = new Map<string, Record<string, unknown>>()
    for (const rawRow of checklistRows) {
      const row = rawRow as Record<string, unknown>
      const employeeId = readEmployeeId(row)
      if (!employeeId) continue
      byEmployee.set(employeeId, row)
    }

    const items = data.employees.map((employee: { id: string; name: string }) => {
      const row = byEmployee.get(employee.id)

      return {
        employeeId: employee.id,
        employeeName: employee.name,
        taxFileDeclaration: row
          ? readChecklistFlag(row, "taxFileDeclaration", "tax_file_declaration")
          : false,
        superChoiceForm: row
          ? readChecklistFlag(row, "superChoiceForm", "super_choice_form")
          : false,
        fairWorkInfoStatement: row
          ? readChecklistFlag(row, "fairWorkInfoStatement", "fair_work_info_statement")
          : false,
      }
    })

    return jsonOk({ items })
  } catch (error) {
    return jsonServerError(error, "Failed to load fair work checklist")
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const auth = await requireUserAndOrganisation(supabase as never)
    if (!auth.ok) return auth.response
    const db = getWriteClient(supabase as never)

    const body = (await request.json()) as {
      employeeId?: string
      taxFileDeclaration?: boolean
      superChoiceForm?: boolean
      fairWorkInfoStatement?: boolean
    }

    if (!body.employeeId) {
      return jsonBadRequest("Missing employeeId")
    }

    const employeeInOrg = await employeeExistsInOrg(
      db,
      body.employeeId,
      auth.organisationId
    )
    if (!employeeInOrg) {
      return jsonBadRequest("Invalid employee")
    }

    const existing = await getExistingChecklistRowByEmployeeId(db, body.employeeId)
    const taxFileDeclaration =
      typeof body.taxFileDeclaration === "boolean"
        ? body.taxFileDeclaration
        : existing
          ? readChecklistFlag(existing, "taxFileDeclaration", "tax_file_declaration")
          : false
    const superChoiceForm =
      typeof body.superChoiceForm === "boolean"
        ? body.superChoiceForm
        : existing
          ? readChecklistFlag(existing, "superChoiceForm", "super_choice_form")
          : false
    const fairWorkInfoStatement =
      typeof body.fairWorkInfoStatement === "boolean"
        ? body.fairWorkInfoStatement
        : existing
          ? readChecklistFlag(existing, "fairWorkInfoStatement", "fair_work_info_statement")
          : false

    const payloadVariants: Array<Record<string, unknown>> = [
      {
        employeeId: body.employeeId,
        taxFileDeclaration,
        superChoiceForm,
        fairWorkInfoStatement,
        updatedAt: new Date().toISOString(),
      },
      {
        employee_id: body.employeeId,
        tax_file_declaration: taxFileDeclaration,
        super_choice_form: superChoiceForm,
        fair_work_info_statement: fairWorkInfoStatement,
        updated_at: new Date().toISOString(),
      },
    ]
    const onConflictColumns = ["employeeId", "employee_id"]
    let lastError = "Failed to save fair work checklist"
    let saved = false
    for (const onConflict of onConflictColumns) {
      for (const payload of payloadVariants) {
        const { error } = await db
          .from("FairWorkChecklist")
          .upsert(payload, { onConflict })
        if (!error) {
          saved = true
          break
        }
        lastError = error.message || lastError
      }
      if (saved) break
    }
    if (!saved) return jsonServerError(lastError, "Failed to save fair work checklist")
    return jsonOk({ ok: true })
  } catch (error) {
    return jsonServerError(error, "Failed to save fair work checklist")
  }
}
