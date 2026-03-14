"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

type RightToWorkRow = {
  id: string | null
  employeeId: string
  employeeName: string
  visaType: string
  visaExpiryDate: string | null
}

function daysToExpiry(iso: string | null) {
  if (!iso) return null
  const expiry = new Date(iso)
  if (Number.isNaN(expiry.getTime())) return null
  return Math.ceil((expiry.getTime() - Date.now()) / 86400000)
}

export default function RightToWorkPage() {
  const searchParams = useSearchParams()
  const [rows, setRows] = useState<RightToWorkRow[]>([])
  const [savingId, setSavingId] = useState<string | null>(null)
  const [message, setMessage] = useState<string>("")

  async function loadRows() {
    const res = await fetch("/api/right-to-work")
    const payload = (await res.json()) as { items?: RightToWorkRow[] }
    setRows(payload.items ?? [])
  }

  useEffect(() => {
    void loadRows()
  }, [])

  async function saveRow(row: RightToWorkRow) {
    setSavingId(row.employeeId)
    setMessage("")
    const response = await fetch("/api/right-to-work", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: row.employeeId,
        visaType: row.visaType,
        visaExpiryDate: row.visaExpiryDate,
      }),
    })
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string }
      setMessage(body.error ?? "Failed to save Right to Work record.")
      setSavingId(null)
      return
    }
    setMessage("Right to Work record saved successfully.")
    setSavingId(null)
    await loadRows()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Right to Work Tracker</h1>
          <p className="mt-1 text-sm text-slate-600">
            Track visa type and expiry dates. Alerts show when expiry is within 90 days.
          </p>
        </div>
        <Button asChild>
          <Link href="/right-to-work/new">Add Record</Link>
        </Button>
      </div>
      {searchParams.get("success") ? (
        <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          Right to Work record saved successfully.
        </div>
      ) : null}
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
              <th className="px-4 py-3 font-medium">Visa Type</th>
              <th className="px-4 py-3 font-medium">Visa Expiry</th>
              <th className="px-4 py-3 font-medium">Alert</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const days = daysToExpiry(row.visaExpiryDate)
              const alert = days !== null && days <= 90
              return (
                <tr key={row.employeeId} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-800">{row.employeeName}</td>
                  <td className="px-4 py-3">
                    <Input
                      value={row.visaType}
                      onChange={(event) =>
                        setRows((prev) =>
                          prev.map((item, i) =>
                            i === index ? { ...item, visaType: event.target.value } : item
                          )
                        )
                      }
                      placeholder="e.g. Temporary Skill Shortage"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="date"
                      value={row.visaExpiryDate ? row.visaExpiryDate.slice(0, 10) : ""}
                      onChange={(event) =>
                        setRows((prev) =>
                          prev.map((item, i) =>
                            i === index
                              ? {
                                  ...item,
                                  visaExpiryDate: event.target.value
                                    ? new Date(event.target.value).toISOString()
                                    : null,
                                }
                              : item
                          )
                        )
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    {alert ? (
                      <Badge variant="destructive">
                        {days! < 0 ? "Expired" : `Expires in ${days} days`}
                      </Badge>
                    ) : (
                      <Badge variant="success">Valid</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => void saveRow(row)}
                        disabled={savingId === row.employeeId}
                      >
                        {savingId === row.employeeId ? "Saving..." : "Save"}
                      </Button>
                      {row.id ? (
                        <Button type="button" variant="outline" asChild>
                          <Link href={`/right-to-work/${row.id}/edit`}>Edit</Link>
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
