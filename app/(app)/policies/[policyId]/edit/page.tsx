"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type PolicyItem = {
  id: string
  title: string
  description?: string | null
}

export default function EditPolicyPage() {
  const params = useParams<{ policyId: string }>()
  const router = useRouter()
  const [policy, setPolicy] = useState<PolicyItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<{
    title?: string
    description?: string
  }>({})

  useEffect(() => {
    const load = async () => {
      const response = await fetch(`/api/policies/${params.policyId}`)
      const payload = (await response.json().catch(() => ({}))) as {
        item?: PolicyItem
        error?: string
      }
      if (!response.ok || !payload.item) {
        setError(payload.error ?? "Failed to load policy")
      } else {
        setPolicy(payload.item)
      }
      setInitialLoading(false)
    }
    void load()
  }, [params.policyId])

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
    const response = await fetch(`/api/policies/${params.policyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string }
      setError(body.error ?? "Failed to update policy")
      setLoading(false)
      return
    }
    router.push("/policies?success=policy-updated")
  }

  if (initialLoading) return <p className="text-sm text-slate-600">Loading policy...</p>

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Edit Policy</h1>
        <p className="mt-1 text-sm text-slate-600">Update policy content.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-4 sm:p-6"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1 md:col-span-2">
            <Input
              name="title"
              placeholder="Policy title"
              defaultValue={policy?.title ?? ""}
              className="w-full"
              required
            />
            {fieldErrors.title ? <p className="text-sm text-red-600">{fieldErrors.title}</p> : null}
          </div>
          <div className="space-y-1 md:col-span-2">
            <Textarea
              name="description"
              placeholder="Policy description"
              defaultValue={policy?.description ?? ""}
              className="w-full"
            />
            {fieldErrors.description ? <p className="text-sm text-red-600">{fieldErrors.description}</p> : null}
          </div>
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/policies">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
