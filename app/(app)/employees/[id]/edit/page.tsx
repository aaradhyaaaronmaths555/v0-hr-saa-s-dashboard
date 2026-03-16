"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

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
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string
    email?: string
  }>({})

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
    setFieldErrors({})
    const formData = new FormData(event.currentTarget)
    const name = String(formData.get("name") ?? "").trim()
    const email = String(formData.get("email") ?? "").trim()
    const nextFieldErrors: { name?: string; email?: string } = {}
    if (!name) nextFieldErrors.name = "Name is required."
    if (email && !isValidEmail(email)) nextFieldErrors.email = "Enter a valid email address."
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      setLoading(false)
      return
    }
    const payload = {
      name,
      email,
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

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-4 sm:p-6"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1 md:col-span-2">
            <Input
              name="name"
              placeholder="Full name"
              defaultValue={employee?.name ?? ""}
              className="w-full"
              required
            />
            {fieldErrors.name ? <p className="text-sm text-red-600">{fieldErrors.name}</p> : null}
          </div>
          <div className="space-y-1 md:col-span-2">
            <Input
              name="email"
              type="email"
              placeholder="Work email"
              defaultValue={employee?.email ?? ""}
              className="w-full"
            />
            {fieldErrors.email ? <p className="text-sm text-red-600">{fieldErrors.email}</p> : null}
          </div>
          <div className="space-y-1">
            <select
              name="onboardingStatus"
              defaultValue={employee?.onboardingStatus ?? employee?.onboarding_status ?? "Not Started"}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Complete">Complete</option>
            </select>
          </div>
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
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
