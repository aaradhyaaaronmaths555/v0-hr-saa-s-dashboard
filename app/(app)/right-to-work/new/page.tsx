"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ResidencyStatus } from "@/lib/right-to-work/residency"

type EmployeeOption = { id: string; name: string }

function isValidDate(value: string) {
  return !Number.isNaN(new Date(value).getTime())
}

export default function NewRightToWorkRecordPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [residencyStatus, setResidencyStatus] = useState<ResidencyStatus>("Visa")
  const [fieldErrors, setFieldErrors] = useState<{
    employeeId?: string
    residencyStatus?: string
    visaSubtype?: string
    visaExpiryDate?: string
  }>({})

  useEffect(() => {
    const load = async () => {
      const response = await fetch("/api/employees")
      const payload = (await response.json().catch(() => ({}))) as { items?: EmployeeOption[] }
      setEmployees(payload.items ?? [])
    }
    void load()
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")
    setFieldErrors({})
    const formData = new FormData(event.currentTarget)
    const employeeId = String(formData.get("employeeId") ?? "")
    const visaSubtype = String(formData.get("visaSubtype") ?? "").trim()
    const visaExpiryDate = String(formData.get("visaExpiryDate") ?? "")
    const nextFieldErrors: {
      employeeId?: string
      residencyStatus?: string
      visaSubtype?: string
      visaExpiryDate?: string
    } = {}
    if (!employeeId) nextFieldErrors.employeeId = "Select an employee."
    if (!residencyStatus) {
      nextFieldErrors.residencyStatus = "Select residency status."
    }
    if (residencyStatus === "Visa" && !visaSubtype) {
      nextFieldErrors.visaSubtype = "Visa subtype is required for Visa."
    }
    if (
      residencyStatus === "Visa" &&
      (!visaExpiryDate || !isValidDate(visaExpiryDate))
    ) {
      nextFieldErrors.visaExpiryDate = "Enter a valid visa expiry date."
    }
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      setLoading(false)
      return
    }
    const payload = {
      employeeId,
      residencyStatus,
      visaSubtype,
      visaExpiryDate: residencyStatus === "Visa" ? visaExpiryDate : null,
    }

    const response = await fetch("/api/right-to-work-records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string }
      setError(body.error ?? "Failed to create Right to Work record")
      setLoading(false)
      return
    }
    router.push("/right-to-work?success=right-to-work-created")
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Add Right to Work Record</h1>
        <p className="mt-1 text-sm text-slate-600">
          Record whether an employee is Citizen, PR, or Visa holder.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-4 sm:p-6"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1 md:col-span-2">
            <select
              name="employeeId"
              required
              defaultValue=""
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="" disabled>
                Select employee
              </option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
            {fieldErrors.employeeId ? <p className="text-sm text-red-600">{fieldErrors.employeeId}</p> : null}
          </div>
          <div className="space-y-1">
            <select
              name="residencyStatus"
              value={residencyStatus}
              onChange={(event) => setResidencyStatus(event.target.value as ResidencyStatus)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="Citizen">Citizen</option>
              <option value="PR">PR</option>
              <option value="Visa">Visa</option>
            </select>
            {fieldErrors.residencyStatus ? (
              <p className="text-sm text-red-600">{fieldErrors.residencyStatus}</p>
            ) : null}
          </div>
          {residencyStatus === "Visa" ? (
            <>
              <div className="space-y-1">
                <Input
                  name="visaSubtype"
                  placeholder="Visa subtype (e.g. Subclass 482)"
                  className="w-full"
                  required
                />
                {fieldErrors.visaSubtype ? <p className="text-sm text-red-600">{fieldErrors.visaSubtype}</p> : null}
              </div>
              <div className="space-y-1">
                <Input name="visaExpiryDate" type="date" className="w-full" required />
                {fieldErrors.visaExpiryDate ? (
                  <p className="text-sm text-red-600">{fieldErrors.visaExpiryDate}</p>
                ) : null}
              </div>
            </>
          ) : null}
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Create Record"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/right-to-work">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
