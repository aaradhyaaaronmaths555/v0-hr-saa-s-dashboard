"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type EmployeeItem = {
  id: string
  name: string
  email?: string | null
  onboarding_status?: string
  onboardingStatus?: string
}

export default function EditEmployeePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState("")
  const [employee, setEmployee] = useState<EmployeeItem | null>(null)

  useEffect(() => {
    const load = async () => {
      const response = await fetch(`/api/employees/${params.id}`)
      const payload = (await response.json().catch(() => ({}))) as {
        item?: EmployeeItem
        error?: string
      }
      if (!response.ok || !payload.item) {
        setError(payload.error ?? "Failed to load employee")
        setInitialLoading(false)
        return
      }
      setEmployee(payload.item)
      setInitialLoading(false)
    }
    void load()
  }, [params.id])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")
    const formData = new FormData(event.currentTarget)
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      onboardingStatus: String(formData.get("onboardingStatus") ?? "Not Started"),
    }
    const response = await fetch(`/api/employees/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string }
      setError(body.error ?? "Failed to update employee")
      setLoading(false)
      return
    }
    router.push("/employees?success=employee-updated")
  }

  if (initialLoading) return <p className="text-sm text-slate-600">Loading employee...</p>

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Edit Employee</h1>
        <p className="mt-1 text-sm text-slate-600">Update employee details.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid max-w-xl gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <Input name="name" placeholder="Full name" defaultValue={employee?.name ?? ""} required />
        <Input
          name="email"
          type="email"
          placeholder="Work email"
          defaultValue={employee?.email ?? ""}
        />
        <select
          name="onboardingStatus"
          defaultValue={employee?.onboardingStatus ?? employee?.onboarding_status ?? "Not Started"}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Complete">Complete</option>
        </select>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/employees">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
