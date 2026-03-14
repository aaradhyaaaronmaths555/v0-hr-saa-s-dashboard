"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

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

  async function loadRows() {
    const res = await fetch("/api/fair-work-checklist")
    const payload = (await res.json()) as { items?: ChecklistRow[] }
    setRows(payload.items ?? [])
  }

  useEffect(() => {
    void loadRows()
  }, [])

  async function saveRow(row: ChecklistRow) {
    setSavingId(row.employeeId)
    setMessage("")
    const response = await fetch("/api/fair-work-checklist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: row.employeeId,
        taxFileDeclaration: row.taxFileDeclaration,
        superChoiceForm: row.superChoiceForm,
        fairWorkInfoStatement: row.fairWorkInfoStatement,
      }),
    })
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string }
      setMessage(body.error ?? "Failed to save Fair Work checklist.")
      setSavingId(null)
      return
    }
    setMessage("Fair Work checklist saved successfully.")
    setSavingId(null)
    await loadRows()
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Fair Work Checklist</h1>
        <p className="mt-1 text-sm text-slate-600">
          Track Tax File Declaration, Super Choice Form, and Fair Work Information Statement per employee.
        </p>
      </div>
      {message ? (
        <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
          {message}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Employee</th>
              <th className="px-4 py-3 font-medium">Tax File Declaration</th>
              <th className="px-4 py-3 font-medium">Super Choice Form</th>
              <th className="px-4 py-3 font-medium">Fair Work Info Statement</th>
              <th className="px-4 py-3 font-medium">Completion</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.employeeId} className="border-t border-slate-100">
                <td className="px-4 py-3 text-slate-800">{row.employeeName}</td>
                <td className="px-4 py-3">
                  <Checkbox
                    checked={row.taxFileDeclaration}
                    onCheckedChange={(checked) =>
                      setRows((prev) =>
                        prev.map((item, i) =>
                          i === index ? { ...item, taxFileDeclaration: !!checked } : item
                        )
                      )
                    }
                  />
                </td>
                <td className="px-4 py-3">
                  <Checkbox
                    checked={row.superChoiceForm}
                    onCheckedChange={(checked) =>
                      setRows((prev) =>
                        prev.map((item, i) =>
                          i === index ? { ...item, superChoiceForm: !!checked } : item
                        )
                      )
                    }
                  />
                </td>
                <td className="px-4 py-3">
                  <Checkbox
                    checked={row.fairWorkInfoStatement}
                    onCheckedChange={(checked) =>
                      setRows((prev) =>
                        prev.map((item, i) =>
                          i === index ? { ...item, fairWorkInfoStatement: !!checked } : item
                        )
                      )
                    }
                  />
                </td>
                <td className="px-4 py-3">
                  <Badge variant={completionPercent(row) === 100 ? "success" : "warning"}>
                    {completionPercent(row)}%
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void saveRow(row)}
                    disabled={savingId === row.employeeId}
                  >
                    {savingId === row.employeeId ? "Saving..." : "Save"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
