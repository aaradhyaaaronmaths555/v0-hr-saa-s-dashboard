"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function NewEmployeePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

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

    const response = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string }
      setError(body.error ?? "Failed to create employee")
      setLoading(false)
      return
    }
    router.push("/employees?success=employee-created")
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Add Employee</h1>
        <p className="mt-1 text-sm text-slate-600">Create a new employee record.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid max-w-xl gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <Input name="name" placeholder="Full name" required />
        <Input name="email" type="email" placeholder="Work email" />
        <select
          name="onboardingStatus"
          defaultValue="Not Started"
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Complete">Complete</option>
        </select>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Create Employee"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/employees">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
