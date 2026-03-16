"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

function isValidDate(value: string) {
  return !Number.isNaN(new Date(value).getTime())
}

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
  const [fieldErrors, setFieldErrors] = useState<{
    status?: string
    dateClosed?: string
  }>({})

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
    setFieldErrors({})
    const formData = new FormData(event.currentTarget)
    const status = String(formData.get("status") ?? "New")
    const dateClosed = String(formData.get("dateClosed") ?? "")
    const correctiveAction = String(formData.get("correctiveAction") ?? "")
    const preventionSteps = String(formData.get("preventionSteps") ?? "")
    const nextFieldErrors: { status?: string; dateClosed?: string } = {}
    if (dateClosed && !isValidDate(dateClosed)) {
      nextFieldErrors.dateClosed = "Enter a valid close date."
    }
    if (status === "Closed") {
      if (!correctiveAction.trim() || !preventionSteps.trim() || !dateClosed) {
        nextFieldErrors.status =
          "To close an incident, include corrective action, prevention steps, and date closed."
      }
    }
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      setLoading(false)
      return
    }
    const payload = {
      incidentId: params.id,
      status,
      assignedTo: String(formData.get("assignedTo") ?? ""),
      correctiveAction,
      preventionSteps,
      dateClosed: dateClosed || undefined,
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

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-4 sm:p-6"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Input value={item?.incidentType ?? ""} className="w-full" disabled />
          </div>
          <div className="space-y-1">
            <Input
              value={item?.incidentDate ? new Date(item.incidentDate).toLocaleString("en-AU") : ""}
              className="w-full"
              disabled
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Input value={item?.employeesInvolved ?? ""} className="w-full" disabled />
          </div>
          <div className="space-y-1">
            <select
              name="status"
              defaultValue={item?.status ?? "New"}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="New">New</option>
              <option value="In review">In review</option>
              <option value="Actioned">Actioned</option>
              <option value="Closed">Closed</option>
            </select>
            {fieldErrors.status ? <p className="text-sm text-red-600">{fieldErrors.status}</p> : null}
          </div>
          <div className="space-y-1">
            <Input
              name="assignedTo"
              placeholder="Assigned person"
              defaultValue={item?.assignedTo ?? ""}
              className="w-full"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Textarea
              name="correctiveAction"
              placeholder="Corrective action summary"
              defaultValue={item?.correctiveAction ?? ""}
              className="w-full"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Textarea
              name="preventionSteps"
              placeholder="Prevention steps"
              defaultValue={item?.preventionSteps ?? ""}
              className="w-full"
            />
          </div>
          <div className="space-y-1">
            <Input
              name="dateClosed"
              type="date"
              defaultValue={item?.dateClosed ? item.dateClosed.slice(0, 10) : ""}
              className="w-full"
            />
            {fieldErrors.dateClosed ? <p className="text-sm text-red-600">{fieldErrors.dateClosed}</p> : null}
          </div>
          <div className="space-y-1">
            <Input name="comment" placeholder="Comment for timeline" className="w-full" />
          </div>
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
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
