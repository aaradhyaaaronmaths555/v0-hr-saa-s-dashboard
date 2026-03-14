"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type WhsItem = {
  id: string
  incidentType: string
  incidentDate: string
  employeesInvolved: string
  correctiveAction: string
  preventionSteps?: string | null
  assignedTo?: string | null
  dateClosed?: string | null
  status: string
}

export default function EditWhsIncidentPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [item, setItem] = useState<WhsItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const load = async () => {
      const response = await fetch(`/api/whs-incidents/${params.id}`)
      const payload = (await response.json().catch(() => ({}))) as {
        item?: WhsItem
        error?: string
      }
      if (!response.ok || !payload.item) {
        setError(payload.error ?? "Failed to load incident")
      } else {
        setItem(payload.item)
      }
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
      incidentId: params.id,
      status: String(formData.get("status") ?? "New"),
      assignedTo: String(formData.get("assignedTo") ?? ""),
      correctiveAction: String(formData.get("correctiveAction") ?? ""),
      preventionSteps: String(formData.get("preventionSteps") ?? ""),
      dateClosed: String(formData.get("dateClosed") ?? "") || undefined,
      comment: String(formData.get("comment") ?? "") || undefined,
    }

    const response = await fetch("/api/whs-incidents", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string }
      setError(body.error ?? "Failed to update incident")
      setLoading(false)
      return
    }
    router.push("/whs?success=incident-updated")
  }

  if (initialLoading) return <p className="text-sm text-slate-600">Loading incident...</p>

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Edit WHS Incident</h1>
        <p className="mt-1 text-sm text-slate-600">Update lifecycle and closure details.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid max-w-xl gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <Input value={item?.incidentType ?? ""} disabled />
        <Input value={item?.incidentDate ? new Date(item.incidentDate).toLocaleString("en-AU") : ""} disabled />
        <Input value={item?.employeesInvolved ?? ""} disabled />
        <select
          name="status"
          defaultValue={item?.status ?? "New"}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="New">New</option>
          <option value="In review">In review</option>
          <option value="Actioned">Actioned</option>
          <option value="Closed">Closed</option>
        </select>
        <Input name="assignedTo" placeholder="Assigned person" defaultValue={item?.assignedTo ?? ""} />
        <Textarea
          name="correctiveAction"
          placeholder="Corrective action summary"
          defaultValue={item?.correctiveAction ?? ""}
        />
        <Textarea
          name="preventionSteps"
          placeholder="Prevention steps"
          defaultValue={item?.preventionSteps ?? ""}
        />
        <Input
          name="dateClosed"
          type="date"
          defaultValue={item?.dateClosed ? item.dateClosed.slice(0, 10) : ""}
        />
        <Input name="comment" placeholder="Comment for timeline" />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/whs">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
