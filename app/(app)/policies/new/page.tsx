"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function NewPolicyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<{
    title?: string
    description?: string
  }>({})

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")
    setFieldErrors({})
    const formData = new FormData(event.currentTarget)
    const title = String(formData.get("title") ?? "").trim()
    const description = String(formData.get("description") ?? "").trim()
    const nextFieldErrors: { title?: string; description?: string } = {}
    if (!title) nextFieldErrors.title = "Policy title is required."
    if (description && description.length > 5000) {
      nextFieldErrors.description = "Description is too long."
    }
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      setLoading(false)
      return
    }
    const payload = {
      title,
      description,
    }
    const response = await fetch("/api/policies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string }
      setError(body.error ?? "Failed to create policy")
      setLoading(false)
      return
    }
    router.push("/policies?success=policy-created")
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Add Policy</h1>
        <p className="mt-1 text-sm text-slate-600">Create a policy for organisation-wide acknowledgement.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-4 sm:p-6"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1 md:col-span-2">
            <Input name="title" placeholder="Policy title" className="w-full" required />
            {fieldErrors.title ? <p className="text-sm text-red-600">{fieldErrors.title}</p> : null}
          </div>
          <div className="space-y-1 md:col-span-2">
            <Textarea name="description" placeholder="Policy description" className="w-full" />
            {fieldErrors.description ? <p className="text-sm text-red-600">{fieldErrors.description}</p> : null}
          </div>
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Create Policy"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/policies">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
