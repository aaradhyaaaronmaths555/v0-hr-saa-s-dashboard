"use client"

import { useMemo, useState } from "react"
import type { ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Upload } from "lucide-react"
import { CERTIFICATES, type CertificateRow } from "@/lib/certificates-data"
import { getRequiredCertsForRole, getMissingRequiredCerts } from "@/lib/required-credentials"

type StatusFilter = "All" | "Valid" | "Expiring Soon" | "Expired"

function getDaysRemainingPillClasses(daysRemaining: number) {
  if (daysRemaining < 0) return "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500"
  if (daysRemaining > 60) return "rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
  if (daysRemaining > 30) return "rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700"
  return "rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700"
}

function getStatusPillClasses(daysRemaining: number) {
  if (daysRemaining < 0) return "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500"
  if (daysRemaining > 60) return "rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
  if (daysRemaining > 30) return "rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700"
  return "rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700"
}

function computeStats(certs: CertificateRow[]) {
  const total = certs.length
  const expired = certs.filter((c) => c.status === "Expired").length
  const valid = certs.filter((c) => c.status === "Valid").length
  const expiringThisMonth = certs.filter(
    (c) => c.status === "Expiring" && c.daysRemaining >= 0 && c.daysRemaining <= 30
  ).length
  return { total, expired, valid, expiringThisMonth }
}

/** Build certs-by-employee map for missing-required check */
function getCertsByEmployee(certs: CertificateRow[]): Map<string, { certificateType: string; status: string }[]> {
  const map = new Map<string, { certificateType: string; status: string }[]>()
  for (const c of certs) {
    const list = map.get(c.employeeId) ?? []
    list.push({ certificateType: c.certificateType, status: c.status })
    map.set(c.employeeId, list)
  }
  return map
}

function getEmployeesWithMissingRequiredCount(): number {
  const certsByEmp = getCertsByEmployee(CERTIFICATES)
  const empIds = [...new Set(CERTIFICATES.map((c) => c.employeeId))]
  let count = 0
  for (const empId of empIds) {
    const cert = CERTIFICATES.find((c) => c.employeeId === empId)!
    const empCerts = certsByEmp.get(empId) ?? []
    const missing = getMissingRequiredCerts(cert.employeeRole, empCerts)
    if (missing.length > 0) count++
  }
  return count
}

export default function CertificatesPage() {
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return CERTIFICATES.filter((cert) => {
      const matchesQuery =
        !q ||
        cert.employeeName.toLowerCase().includes(q) ||
        cert.certificateType.toLowerCase().includes(q)
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Valid" && cert.status === "Valid") ||
        (statusFilter === "Expiring Soon" && cert.status === "Expiring") ||
        (statusFilter === "Expired" && cert.status === "Expired")
      return matchesQuery && matchesStatus
    })
  }, [query, statusFilter])

  const stats = useMemo(() => computeStats(CERTIFICATES), [])
  const certsByEmployee = useMemo(() => getCertsByEmployee(CERTIFICATES), [])
  const missingByEmployee = useMemo(() => {
    const m = new Map<string, string[]>()
    for (const cert of CERTIFICATES) {
      if (m.has(cert.employeeId)) continue
      const empCerts = certsByEmployee.get(cert.employeeId) ?? []
      const missing = getMissingRequiredCerts(cert.employeeRole, empCerts)
      m.set(cert.employeeId, missing)
    }
    return m
  }, [certsByEmployee])

  return (
    <div className="flex w-full flex-col space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Certificate & Credential Tracker
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Track staff credentials and avoid compliance breaches
        </p>
      </div>

      {/* Summary bar — stat pills */}
      <div className="flex flex-wrap gap-3">
        <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 shadow-sm">
          <span className="text-sm font-normal text-slate-500">Total</span>
          <span className="text-sm font-bold text-slate-900">{stats.total}</span>
        </div>
        <div className="flex h-10 items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 shadow-sm">
          <span className="text-sm font-normal text-slate-500">Expiring This Month</span>
          <span className="text-sm font-bold text-amber-700">{stats.expiringThisMonth}</span>
        </div>
        <div className="flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 shadow-sm">
          <span className="text-sm font-normal text-slate-500">Expired</span>
          <span className="text-sm font-bold text-red-700">{stats.expired}</span>
        </div>
        <div className="flex h-10 items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 shadow-sm">
          <span className="text-sm font-normal text-slate-500">Valid</span>
          <span className="text-sm font-bold text-green-700">{stats.valid}</span>
        </div>
        <div className="flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 shadow-sm">
          <span className="text-sm font-normal text-slate-500">Missing Required</span>
          <span className="text-sm font-bold text-red-700">{getEmployeesWithMissingRequiredCount()}</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              placeholder="Search by name..."
              className="h-10 rounded-lg pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="h-10 w-full rounded-lg sm:w-44">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Valid">Valid</SelectItem>
              <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
              <SelectItem value="Expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="h-10 w-full rounded-lg text-sm sm:w-auto">
          <Upload className="h-4 w-4" />
          Upload Certificate
        </Button>
      </div>

      {/* Card list */}
      <div className="flex flex-col gap-3">
        {filtered.map((cert) => (
          <div
            key={cert.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[160px_1fr_auto]">
              {/* LEFT SECTION */}
              <div className="flex w-40 shrink-0 items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600">
                  {cert.employeeInitials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{cert.employeeName}</p>
                  <p className="truncate text-xs text-slate-400">{cert.employeeRole}</p>
                  {missingByEmployee.get(cert.employeeId)?.length ? (
                    <span className="mt-0.5 inline-block rounded-md bg-rose-50 px-2 py-0.5 text-xs text-rose-500">
                      Missing Required Cert
                    </span>
                  ) : null}
                </div>
              </div>

              {/* MIDDLE SECTION */}
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="text-sm font-semibold text-slate-800">
                  {cert.certificateType}
                  <span className="mx-2 font-normal text-slate-400">·</span>
                  <span className="font-normal text-slate-600">
                    {cert.issueDate} → {cert.expiryDate}
                  </span>
                </p>
                <p className="text-xs text-slate-500">
                  <span className="mr-1 text-slate-400">Required:</span>
                  {getRequiredCertsForRole(cert.employeeRole).length > 0
                    ? getRequiredCertsForRole(cert.employeeRole)
                        .map((r) => r.label)
                        .join(", ")
                    : "—"}
                </p>
              </div>

              {/* RIGHT SECTION */}
              <div className="flex flex-col items-end gap-2">
                <span className={getDaysRemainingPillClasses(cert.daysRemaining)}>
                  {cert.daysRemaining < 0 ? "Expired" : `${cert.daysRemaining} days`}
                </span>
                <span className={getStatusPillClasses(cert.daysRemaining)}>
                  {cert.status}
                </span>
                <Button
                  variant="outline"
                  className="h-7 rounded-lg border border-slate-200 px-3 text-xs text-slate-600 hover:bg-slate-50"
                >
                  Upload Renewal
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-slate-400">
        Showing {filtered.length} certificate{filtered.length === 1 ? "" : "s"}
      </p>
    </div>
  )
}
