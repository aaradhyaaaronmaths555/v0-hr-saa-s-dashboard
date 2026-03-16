"use client"

import { useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared/empty-state"

type ChecklistRow = {
  employeeId: string
  employeeName: string
  taxFileDeclaration: boolean
  superChoiceForm: boolean
  fairWorkInfoStatement: boolean
}

function completionPercent(row: ChecklistRow) {
  const completed = [
    row.taxFileDeclaration,
    row.superChoiceForm,
    row.fairWorkInfoStatement,
  ].filter(Boolean).length
  return Math.round((completed / 3) * 100)
}

export default function FairWorkChecklistPage() {
  const [rows, setRows] = useState<ChecklistRow[]>([])
  const [savingId, setSavingId] = useState<string | null>(null)
  const [message, setMessage] = useState<string>("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")
  const [isLoading, setIsLoading] = useState(true)
  const saveVersionByEmployeeRef = useRef<Map<string, number>>(new Map())

  async function loadRows() {
    try {
      setIsLoading(true)
      const res = await fetch("/api/fair-work-checklist", { cache: "no-store" })
      const payload = (await res.json().catch(() => ({}))) as {
        items?: ChecklistRow[]
        error?: string
      }
      if (!res.ok) {
        setMessageType("error")
        setMessage(payload.error ?? "We couldn't load the checklist right now. Please refresh.")
        setRows([])
        return
      }
      setRows(payload.items ?? [])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadRows()
  }, [])

  async function saveRow(
    employeeId: string,
    patch: Partial<
      Pick<
        ChecklistRow,
        "taxFileDeclaration" | "superChoiceForm" | "fairWorkInfoStatement"
      >
    >
  ) {
    const previousVersion = saveVersionByEmployeeRef.current.get(employeeId) ?? 0
    const saveVersion = previousVersion + 1
    saveVersionByEmployeeRef.current.set(employeeId, saveVersion)

    setSavingId(employeeId)
    setMessage("")
    setMessageType("success")

    const response = await fetch("/api/fair-work-checklist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId,
        ...patch,
      }),
    })

    // If a newer save was triggered for this employee, ignore this stale response.
    if ((saveVersionByEmployeeRef.current.get(employeeId) ?? 0) !== saveVersion) {
      return
    }

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string }
      setMessageType("error")
      setMessage(body.error ?? "Failed to save Fair Work checklist.")
      setSavingId(null)
      return
    }

    setMessageType("success")
    setMessage("Fair Work checklist saved successfully.")
    setSavingId(null)
  }

  function updateRowAndPersist(
    currentRow: ChecklistRow,
    patch: Partial<
      Pick<
        ChecklistRow,
        "taxFileDeclaration" | "superChoiceForm" | "fairWorkInfoStatement"
      >
    >
  ) {
    const nextRow: ChecklistRow = { ...currentRow, ...patch }
    setRows((prev) =>
      prev.map((item) => (item.employeeId === currentRow.employeeId ? nextRow : item))
    )
    void saveRow(currentRow.employeeId, patch)
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Fair Work Checklist</h1>
        <p className="mt-1 text-sm text-slate-600">
          Track Tax File Declaration, Super Choice Form, and Fair Work Information Statement per employee.
        </p>
      </div>
      {message ? (
        <div className="sticky top-3 z-20">
          <div
            className={`rounded-md border px-3 py-2 text-sm shadow-sm ${
              messageType === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message}
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {isLoading ? (
          <div className="p-4">
            <div className="space-y-2">
              <div className="h-10 animate-pulse rounded bg-slate-100" />
              <div className="h-10 animate-pulse rounded bg-slate-100" />
              <div className="h-10 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            title="No checklist records yet"
            description="Add employees first, then mark TFN, super choice, and Fair Work information completion."
            actionLabel="Add Employee"
            actionHref="/employees/new"
          />
        ) : (
          <>
            <div className="space-y-4 p-4 md:hidden">
              {rows.map((row) => (
                <div key={row.employeeId} className="space-y-3 rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-slate-900">{row.employeeName}</p>
                    <Badge variant={completionPercent(row) === 100 ? "success" : "warning"}>
                      {completionPercent(row)}%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <label className="space-y-1 text-xs text-slate-600">
                      <span>Tax File Declaration</span>
                      <select
                        value={row.taxFileDeclaration ? "yes" : "no"}
                        onChange={(event) =>
                          updateRowAndPersist(row, {
                            taxFileDeclaration: event.target.value === "yes",
                          })
                        }
                        className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                      >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </label>
                    <label className="space-y-1 text-xs text-slate-600">
                      <span>Super Choice Form</span>
                      <select
                        value={row.superChoiceForm ? "yes" : "no"}
                        onChange={(event) =>
                          updateRowAndPersist(row, {
                            superChoiceForm: event.target.value === "yes",
                          })
                        }
                        className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                      >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </label>
                    <label className="space-y-1 text-xs text-slate-600">
                      <span>Fair Work Info Statement</span>
                      <select
                        value={row.fairWorkInfoStatement ? "yes" : "no"}
                        onChange={(event) =>
                          updateRowAndPersist(row, {
                            fairWorkInfoStatement: event.target.value === "yes",
                          })
                        }
                        className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                      >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </label>
                  </div>
                  <p className="text-xs text-slate-600">
                    {savingId === row.employeeId ? "Saving..." : "Saved"}
                  </p>
                </div>
              ))}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Employee</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Tax File Declaration</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Super Choice Form</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Fair Work Info Statement</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide">Completion</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.employeeId} className="border-t border-slate-100 transition-colors hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-800">{row.employeeName}</td>
                      <td className="px-4 py-3">
                        <select
                          value={row.taxFileDeclaration ? "yes" : "no"}
                          onChange={(event) =>
                            updateRowAndPersist(row, {
                              taxFileDeclaration: event.target.value === "yes",
                            })
                          }
                          className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                        >
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={row.superChoiceForm ? "yes" : "no"}
                          onChange={(event) =>
                            updateRowAndPersist(row, {
                              superChoiceForm: event.target.value === "yes",
                            })
                          }
                          className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                        >
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={row.fairWorkInfoStatement ? "yes" : "no"}
                          onChange={(event) =>
                            updateRowAndPersist(row, {
                              fairWorkInfoStatement: event.target.value === "yes",
                            })
                          }
                          className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                        >
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant={completionPercent(row) === 100 ? "success" : "warning"}>
                          {completionPercent(row)}%
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-600">
                          {savingId === row.employeeId ? "Saving..." : "Saved"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
