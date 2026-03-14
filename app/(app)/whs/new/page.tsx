"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function NewWhsIncidentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")
    const formData = new FormData(event.currentTarget)
    const payload = {
      incidentType: String(formData.get("incidentType") ?? ""),
      incidentDate: String(formData.get("incidentDate") ?? ""),
      employeesInvolved: String(formData.get("employeesInvolved") ?? ""),
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

      <form onSubmit={handleSubmit} className="grid max-w-xl gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <Input name="incidentType" placeholder="Incident type" required />
        <Input name="incidentDate" type="datetime-local" required />
        <Input name="employeesInvolved" placeholder="Employees involved (comma separated)" required />
        <Input name="assignedTo" placeholder="Assigned person" />
        <Textarea name="correctiveAction" placeholder="Corrective action summary" />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex gap-2">
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
