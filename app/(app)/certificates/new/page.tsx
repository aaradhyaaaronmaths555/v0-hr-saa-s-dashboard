"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type EmployeeOption = { id: string; name: string }

function isValidDate(value: string) {
  return !Number.isNaN(new Date(value).getTime())
}

export default function NewCertificatePage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<{
    employeeId?: string
    type?: string
    expiryDate?: string
  }>({})

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/employees")
      const body = (await res.json().catch(() => ({}))) as { items?: EmployeeOption[] }
      setEmployees(body.items ?? [])
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
    const type = String(formData.get("type") ?? "").trim()
    const expiryDate = String(formData.get("expiryDate") ?? "")
    const nextFieldErrors: {
      employeeId?: string
      type?: string
      expiryDate?: string
    } = {}
    if (!employeeId) nextFieldErrors.employeeId = "Select an employee."
    if (!type) nextFieldErrors.type = "Certificate type is required."
    if (!expiryDate) {
      nextFieldErrors.expiryDate = "Expiry date is required."
    } else if (!isValidDate(expiryDate)) {
      nextFieldErrors.expiryDate = "Enter a valid expiry date."
    }
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      setLoading(false)
      return
    }
    const payload = {
      employeeId,
      type,
      expiryDate: expiryDate || null,
      status: String(formData.get("status") ?? "Valid"),
    }

    const response = await fetch("/api/certificates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string }
      setError(body.error ?? "Failed to create certificate")
      setLoading(false)
      return
    }
    router.push("/certificates?success=certificate-created")
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Add Certificate</h1>
        <p className="mt-1 text-sm text-slate-600">Create a certificate record for an employee.</p>
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
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              defaultValue=""
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
          <div className="space-y-1 md:col-span-2">
            <Input name="type" placeholder="Certificate type" className="w-full" required />
            {fieldErrors.type ? <p className="text-sm text-red-600">{fieldErrors.type}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry date</Label>
            <Input id="expiryDate" name="expiryDate" type="date" className="w-full" required />
          </div>
          <div className="space-y-1">
            <select
              name="status"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              defaultValue="Valid"
            >
              <option value="Valid">Valid</option>
              <option value="Expiring">Expiring</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>
        {fieldErrors.expiryDate ? <p className="mt-1 text-sm text-red-600">{fieldErrors.expiryDate}</p> : null}

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Create Certificate"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/certificates">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
