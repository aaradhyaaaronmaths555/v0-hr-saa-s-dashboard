"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

function isValidDate(value: string) {
  return !Number.isNaN(new Date(value).getTime())
}

export default function NewWhsIncidentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<{
    incidentType?: string
    incidentDate?: string
    employeesInvolved?: string
  }>({})

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")
    setFieldErrors({})
    const formData = new FormData(event.currentTarget)
    const incidentType = String(formData.get("incidentType") ?? "").trim()
    const incidentDate = String(formData.get("incidentDate") ?? "")
    const employeesInvolved = String(formData.get("employeesInvolved") ?? "").trim()
    const nextFieldErrors: {
      incidentType?: string
      incidentDate?: string
      employeesInvolved?: string
    } = {}
    if (!incidentType) nextFieldErrors.incidentType = "Incident type is required."
    if (!incidentDate || !isValidDate(incidentDate)) {
      nextFieldErrors.incidentDate = "Enter a valid incident date and time."
    }
    if (!employeesInvolved) {
      nextFieldErrors.employeesInvolved = "List at least one employee involved."
    }
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      setLoading(false)
      return
    }
    const payload = {
      incidentType,
      incidentDate,
      employeesInvolved,
      correctiveAction: String(formData.get("correctiveAction") ?? ""),
      assignedTo: String(formData.get("assignedTo") ?? ""),
    }
    const response = await fetch("/api/whs-incidents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string }
      setError(body.error ?? "Failed to create incident")
      setLoading(false)
      return
    }
    router.push("/whs?success=incident-created")
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Add WHS Incident</h1>
        <p className="mt-1 text-sm text-slate-600">Create a new WHS incident record.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-4 sm:p-6"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Input name="incidentType" placeholder="Incident type" className="w-full" required />
            {fieldErrors.incidentType ? <p className="text-sm text-red-600">{fieldErrors.incidentType}</p> : null}
          </div>
          <div className="space-y-1">
            <Input name="incidentDate" type="datetime-local" className="w-full" required />
            {fieldErrors.incidentDate ? <p className="text-sm text-red-600">{fieldErrors.incidentDate}</p> : null}
          </div>
          <div className="space-y-1 md:col-span-2">
            <Input
              name="employeesInvolved"
              placeholder="Employees involved (comma separated)"
              className="w-full"
              required
            />
            {fieldErrors.employeesInvolved ? (
              <p className="text-sm text-red-600">{fieldErrors.employeesInvolved}</p>
            ) : null}
          </div>
          <div className="space-y-1">
            <Input name="assignedTo" placeholder="Assigned person" className="w-full" />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Textarea name="correctiveAction" placeholder="Corrective action summary" className="w-full" />
          </div>
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Create Incident"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/whs">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
