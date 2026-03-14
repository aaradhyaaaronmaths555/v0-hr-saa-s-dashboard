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
    const formData = new FormData(event.currentTarget)
    const payload = {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
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

      <form onSubmit={handleSubmit} className="grid max-w-xl gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <Input name="title" placeholder="Policy title" defaultValue={policy?.title ?? ""} required />
        <Textarea
          name="description"
          placeholder="Policy description"
          defaultValue={policy?.description ?? ""}
        />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex gap-2">
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
