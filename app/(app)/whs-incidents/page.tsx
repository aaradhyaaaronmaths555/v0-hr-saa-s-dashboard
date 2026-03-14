"use client"

import { FormEvent, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

type Incident = {
  id: string
  incidentType: string
  incidentDate: string
  employeesInvolved: string
  correctiveAction: string
  preventionSteps?: string | null
  assignedTo?: string | null
  dateClosed?: string | null
  status: string
  riskFlags?: {
    stuck?: boolean
    closedWithoutCorrective?: boolean
  }
}

type TimelineEvent = {
  id: string
  incidentId: string
  eventType: string
  statusFrom?: string | null
  statusTo?: string | null
  comment?: string | null
  assignedTo?: string | null
  createdAt: string
}

type IncidentDraft = {
  status: string
  assignedTo: string
  correctiveAction: string
  preventionSteps: string
  dateClosed: string
  comment: string
}

export default function WhsIncidentsPage() {
  const searchParams = useSearchParams()
  const [items, setItems] = useState<Incident[]>([])
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [draftById, setDraftById] = useState<Record<string, IncidentDraft>>({})
  const [loading, setLoading] = useState(false)
  const [savingById, setSavingById] = useState<Record<string, boolean>>({})
  const [formMessage, setFormMessage] = useState("")

  async function loadIncidents() {
    const res = await fetch("/api/whs-incidents")
    const payload = (await res.json()) as { items?: Incident[]; timeline?: TimelineEvent[] }
    const loadedItems = payload.items ?? []
    setItems(loadedItems)
    setTimeline(payload.timeline ?? [])
    const nextDraftById: Record<string, IncidentDraft> = {}
    for (const incident of loadedItems) {
      nextDraftById[incident.id] = {
        status: incident.status,
        assignedTo: incident.assignedTo ?? "",
        correctiveAction: incident.correctiveAction ?? "",
        preventionSteps: incident.preventionSteps ?? "",
        dateClosed: incident.dateClosed ? incident.dateClosed.slice(0, 10) : "",
        comment: "",
      }
    }
    setDraftById(nextDraftById)
  }

  useEffect(() => {
    void loadIncidents()
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setFormMessage("")
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
      const errorPayload = (await response.json().catch(() => ({}))) as { error?: string }
      setFormMessage(errorPayload.error ?? "Failed to create incident.")
      setLoading(false)
      return
    }
    event.currentTarget.reset()
    await loadIncidents()
    setLoading(false)
  }

  function getNextStep(status: string) {
    if (status === "New") return "Assign owner and move to In review"
    if (status === "In review") return "Capture actions and move to Actioned"
    if (status === "Actioned") return "Verify controls and close with date"
    return "Monitor and reopen if risk returns"
  }

  function handleDraftChange(id: string, key: keyof IncidentDraft, value: string) {
    setDraftById((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [key]: value,
      },
    }))
  }

  async function handleSaveIncident(incidentId: string) {
    const draft = draftById[incidentId]
    if (!draft) return
    setSavingById((prev) => ({ ...prev, [incidentId]: true }))
    const response = await fetch("/api/whs-incidents", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        incidentId,
        status: draft.status,
        assignedTo: draft.assignedTo,
        correctiveAction: draft.correctiveAction,
        preventionSteps: draft.preventionSteps,
        dateClosed: draft.dateClosed || undefined,
        comment: draft.comment || undefined,
      }),
    })
    setSavingById((prev) => ({ ...prev, [incidentId]: false }))
    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string }
      setFormMessage(payload.error ?? "Failed to update incident.")
      return
    }
    setFormMessage("")
    await loadIncidents()
  }

  function timelineForIncident(incidentId: string) {
    return timeline.filter((event) => event.incidentId === incidentId)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">WHS Incident Reports</h1>
          <p className="mt-1 text-sm text-slate-600">
            Track incidents through a clear lifecycle and close with complete evidence.
          </p>
        </div>
        <Button asChild>
          <Link href="/whs/new">Add Incident</Link>
        </Button>
      </div>
      {searchParams.get("success") ? (
        <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          WHS incident saved successfully.
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <Input name="incidentType" placeholder="Incident type (e.g. Slip/Fall)" required />
        <Input name="incidentDate" type="datetime-local" required />
        <Input name="employeesInvolved" placeholder="Employees involved (comma separated)" required />
        <Input name="assignedTo" placeholder="Assigned person (owner)" />
        <Input name="correctiveAction" placeholder="Initial corrective action summary (optional)" />
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Submit Incident"}
        </Button>
        {formMessage ? <p className="text-xs text-red-600">{formMessage}</p> : null}
      </form>

      <div className="space-y-4">
        {items.map((incident) => {
          const draft = draftById[incident.id]
          const timelineItems = timelineForIncident(incident.id)
          return (
            <div key={incident.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">{incident.incidentType}</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Logged {new Date(incident.incidentDate).toLocaleString("en-AU")} -{" "}
                    {incident.employeesInvolved}
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    Next step: <span className="font-medium">{getNextStep(incident.status)}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      incident.status === "Closed"
                        ? "success"
                        : incident.status === "Actioned"
                          ? "warning"
                          : "destructive"
                    }
                  >
                    {incident.status}
                  </Badge>
                  {incident.riskFlags?.stuck ? (
                    <Badge variant="destructive">Stuck &gt; 7 days</Badge>
                  ) : null}
                  {incident.riskFlags?.closedWithoutCorrective ? (
                    <Badge variant="destructive">Closed without corrective action</Badge>
                  ) : null}
                  <Button type="button" variant="outline" size="sm" asChild>
                    <Link href={`/whs/${incident.id}/edit`}>Edit</Link>
                  </Button>
                </div>
              </div>

              {draft ? (
                <div className="mt-4 grid gap-3 rounded-lg border border-slate-200 p-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-xs text-slate-600">
                      Status
                      <select
                        value={draft.status}
                        onChange={(event) =>
                          handleDraftChange(incident.id, "status", event.target.value)
                        }
                        className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="New">New</option>
                        <option value="In review">In review</option>
                        <option value="Actioned">Actioned</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </label>
                    <label className="text-xs text-slate-600">
                      Assigned person
                      <Input
                        value={draft.assignedTo}
                        onChange={(event) =>
                          handleDraftChange(incident.id, "assignedTo", event.target.value)
                        }
                        className="mt-1"
                        placeholder="Assign owner"
                      />
                    </label>
                  </div>

                  <label className="text-xs text-slate-600">
                    Corrective action summary
                    <Textarea
                      value={draft.correctiveAction}
                      onChange={(event) =>
                        handleDraftChange(incident.id, "correctiveAction", event.target.value)
                      }
                      className="mt-1"
                      placeholder="What was done to address this incident?"
                    />
                  </label>

                  <label className="text-xs text-slate-600">
                    Prevention steps
                    <Textarea
                      value={draft.preventionSteps}
                      onChange={(event) =>
                        handleDraftChange(incident.id, "preventionSteps", event.target.value)
                      }
                      className="mt-1"
                      placeholder="What prevents this happening again?"
                    />
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-xs text-slate-600">
                      Date closed
                      <Input
                        type="date"
                        value={draft.dateClosed}
                        onChange={(event) =>
                          handleDraftChange(incident.id, "dateClosed", event.target.value)
                        }
                        className="mt-1"
                      />
                    </label>
                    <label className="text-xs text-slate-600">
                      Comment (timeline note)
                      <Input
                        value={draft.comment}
                        onChange={(event) =>
                          handleDraftChange(incident.id, "comment", event.target.value)
                        }
                        className="mt-1"
                        placeholder="Add progress note"
                      />
                    </label>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={() => void handleSaveIncident(incident.id)}
                      disabled={!!savingById[incident.id]}
                    >
                      {savingById[incident.id] ? "Saving..." : "Save update"}
                    </Button>
                  </div>
                </div>
              ) : null}

              <div className="mt-4 rounded-lg border border-slate-200 p-3">
                <p className="text-sm font-medium text-slate-800">Incident timeline</p>
                {timelineItems.length === 0 ? (
                  <p className="mt-1 text-sm text-slate-600">No timeline events yet.</p>
                ) : (
                  <ul className="mt-2 space-y-2 text-sm text-slate-700">
                    {timelineItems.map((event) => (
                      <li key={event.id} className="rounded border border-slate-100 bg-slate-50 p-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span>{new Date(event.createdAt).toLocaleString("en-AU")}</span>
                          <span className="capitalize">{event.eventType.replace("_", " ")}</span>
                          {event.statusFrom || event.statusTo ? (
                            <span>
                              {event.statusFrom ?? "—"} to {event.statusTo ?? "—"}
                            </span>
                          ) : null}
                        </div>
                        {event.comment ? <p className="mt-1">{event.comment}</p> : null}
                        {event.assignedTo ? (
                          <p className="mt-1 text-xs text-slate-500">Assigned: {event.assignedTo}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
