"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type EmployeeOption = { id: string; name: string }

export default function NewCertificatePage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

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
    const formData = new FormData(event.currentTarget)
    const payload = {
      employeeId: String(formData.get("employeeId") ?? ""),
      type: String(formData.get("type") ?? ""),
      expiryDate: String(formData.get("expiryDate") ?? "") || null,
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

      <form onSubmit={handleSubmit} className="grid max-w-xl gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <select
          name="employeeId"
          required
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
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
        <Input name="type" placeholder="Certificate type" required />
        <Input name="expiryDate" type="date" />
        <select
          name="status"
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          defaultValue="Valid"
        >
          <option value="Valid">Valid</option>
          <option value="Expiring">Expiring</option>
          <option value="Expired">Expired</option>
        </select>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex gap-2">
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
