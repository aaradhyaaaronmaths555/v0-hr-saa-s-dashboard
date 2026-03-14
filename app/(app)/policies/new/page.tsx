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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")
    const formData = new FormData(event.currentTarget)
    const payload = {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
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

      <form onSubmit={handleSubmit} className="grid max-w-xl gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <Input name="title" placeholder="Policy title" required />
        <Textarea name="description" placeholder="Policy description" />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex gap-2">
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
