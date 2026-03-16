"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import type { ResidencyStatus } from "@/lib/right-to-work/residency"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type RightToWorkRow = {
  id: string | null
  employeeId: string
  employeeName: string
  residencyStatus: ResidencyStatus
  visaSubtype: string
  visaExpiryDate: string | null
}

function daysToExpiry(iso: string | null) {
  if (!iso) return null
  const expiry = new Date(iso)
  if (Number.isNaN(expiry.getTime())) return null
  return Math.ceil((expiry.getTime() - Date.now()) / 86400000)
}

function formatDate(iso: string | null) {
  if (!iso) return "—"
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return "—"
  return parsed.toLocaleDateString("en-AU")
}

type Props = {
  initialRows: RightToWorkRow[]
  showSuccess: boolean
}

export function RightToWorkClient({ initialRows, showSuccess }: Props) {
  const [rows, setRows] = useState<RightToWorkRow[]>(initialRows)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [message, setMessage] = useState<string>("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")

  async function saveRow(row: RightToWorkRow) {
    setSavingId(row.employeeId)
    setMessage("")
    setMessageType("success")
    const response = await fetch("/api/right-to-work", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: row.employeeId,
        residencyStatus: row.residencyStatus,
        visaSubtype: row.visaSubtype,
        visaExpiryDate:
          row.residencyStatus === "Visa" ? row.visaExpiryDate : null,
      }),
    })
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string }
      setMessageType("error")
      setMessage(
        body.error ??
          "We couldn't save this right-to-work record. Please check required fields and try again."
      )
      setSavingId(null)
      return
    }
    const body = (await response.json().catch(() => ({}))) as {
      item?: { id?: string; employeeId?: string; employee_id?: string }
    }
    const responseEmployeeId = body.item?.employeeId || body.item?.employee_id || row.employeeId
    setMessageType("success")
    setMessage("Right-to-work record saved successfully.")
    setRows((prev) =>
      prev.map((item) =>
        item.employeeId === responseEmployeeId
          ? {
              ...item,
              id: body.item?.id ?? item.id,
            }
          : item
      )
    )
    setSavingId(null)
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <PageHeader
        title="Right to Work Tracker"
        description="Track whether each employee is Citizen, PR, or Visa, and monitor visa expiries."
        action={
          <Button asChild>
            <Link href="/right-to-work/new">Add Right to Work Record</Link>
          </Button>
        }
      />
      {showSuccess || message ? (
        <div className="sticky top-3 z-20 flex flex-col gap-2">
          {showSuccess ? (
            <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm leading-6 text-green-700 shadow-sm">
              Right to Work record saved successfully.
            </div>
          ) : null}
          {message ? (
            <div
              className={`rounded-md border px-3 py-2 text-sm leading-6 shadow-sm ${
                messageType === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          ) : null}
        </div>
      ) : null}

      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Residency status</TableHead>
            <TableHead className="hidden lg:table-cell">Visa subtype</TableHead>
            <TableHead className="text-right">Expiry</TableHead>
            <TableHead className="hidden md:table-cell">Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => {
            const days = daysToExpiry(row.visaExpiryDate)
            const alert = days !== null && days <= 90
            return (
              <TableRow key={row.employeeId}>
                <TableCell className="text-slate-800">{row.employeeName}</TableCell>
                <TableCell>
                  <select
                    value={row.residencyStatus}
                    onChange={(event) =>
                      setRows((prev) =>
                        prev.map((item, i) =>
                          i === index
                            ? {
                                ...item,
                                residencyStatus: event.target.value as ResidencyStatus,
                                visaSubtype:
                                  event.target.value === "Visa" ? item.visaSubtype : "",
                                visaExpiryDate:
                                  event.target.value === "Visa" ? item.visaExpiryDate : null,
                              }
                            : item
                        )
                      )
                    }
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="Citizen">Citizen</option>
                    <option value="PR">PR</option>
                    <option value="Visa">Visa</option>
                  </select>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {row.residencyStatus === "Visa" ? (
                    <Input
                      value={row.visaSubtype}
                      onChange={(event) =>
                        setRows((prev) =>
                          prev.map((item, i) =>
                            i === index
                              ? {
                                  ...item,
                                  visaSubtype: event.target.value,
                                }
                              : item
                          )
                        )
                      }
                      placeholder="e.g. Subclass 482"
                    />
                  ) : (
                    <span className="text-sm text-slate-500">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {row.residencyStatus !== "Visa" ? (
                    <span className="text-sm text-slate-500">—</span>
                  ) : (
                    <>
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
                      <p className="mt-1 text-xs text-slate-500">{formatDate(row.visaExpiryDate)}</p>
                    </>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {row.residencyStatus === "Citizen" ? (
                    <Badge variant="success">Citizen</Badge>
                  ) : row.residencyStatus === "PR" ? (
                    <Badge variant="success">PR</Badge>
                  ) : !row.visaExpiryDate ? (
                    <Badge variant="neutral">Expiry Required</Badge>
                  ) : alert ? (
                    <Badge variant="destructive">
                      {days! < 0 ? "Expired" : `Expires in ${days} days`}
                    </Badge>
                  ) : (
                    <Badge variant="success">Valid</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void saveRow(row)}
                      disabled={savingId === row.employeeId}
                    >
                      {savingId === row.employeeId ? "Saving..." : "Save"}
                    </Button>
                    {row.id ? (
                      <Button type="button" variant="outline" size="sm" asChild>
                        <Link href={`/right-to-work/${row.id}/edit`}>Edit</Link>
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {rows.length === 0 ? (
        <EmptyState
          title="No employee records yet"
          description="Add employees first, then record visa details to manage right-to-work risks."
          actionLabel="Add Employee"
          actionHref="/employees/new"
        />
      ) : null}
    </div>
  )
}
