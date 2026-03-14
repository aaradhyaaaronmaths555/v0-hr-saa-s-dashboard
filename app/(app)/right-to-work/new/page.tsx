"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type EmployeeOption = { id: string; name: string }

export default function NewRightToWorkRecordPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

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
    const formData = new FormData(event.currentTarget)
    const payload = {
      employeeId: String(formData.get("employeeId") ?? ""),
      visaType: String(formData.get("visaType") ?? ""),
      visaExpiryDate: String(formData.get("visaExpiryDate") ?? ""),
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
        <p className="mt-1 text-sm text-slate-600">Create a visa record for an employee.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid max-w-xl gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <select
          name="employeeId"
          required
          defaultValue=""
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
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
        <Input name="visaType" placeholder="Visa type" required />
        <Input name="visaExpiryDate" type="date" required />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex gap-2">
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
