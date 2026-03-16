"use client"

import { FormEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { WhsIncidentStatusBadge } from "@/components/shared/status-badges"

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

function buildDraftById(items: Incident[]) {
  const nextDraftById: Record<string, IncidentDraft> = {}
  for (const incident of items) {
    nextDraftById[incident.id] = {
      status: incident.status,
      assignedTo: incident.assignedTo ?? "",
      correctiveAction: incident.correctiveAction ?? "",
      preventionSteps: incident.preventionSteps ?? "",
      dateClosed: incident.dateClosed ? incident.dateClosed.slice(0, 10) : "",
      comment: "",
    }
  }
  return nextDraftById
}

type Props = {
  initialItems: Incident[]
  initialTimeline: TimelineEvent[]
  showSuccess: boolean
}

export function WhsIncidentsClient({
  initialItems,
  initialTimeline,
  showSuccess,
}: Props) {
  const [items, setItems] = useState<Incident[]>(initialItems)
  const [timeline, setTimeline] = useState<TimelineEvent[]>(initialTimeline)
  const [draftById, setDraftById] = useState<Record<string, IncidentDraft>>(
    buildDraftById(initialItems)
  )
  const [loading, setLoading] = useState(false)
  const [savingById, setSavingById] = useState<Record<string, boolean>>({})
  const [deletingById, setDeletingById] = useState<Record<string, boolean>>({})
  const [formMessage, setFormMessage] = useState("")
  const [formMessageType, setFormMessageType] = useState<"success" | "error">("error")

  async function loadIncidents() {
    const res = await fetch("/api/whs-incidents")
    const payload = (await res.json()) as { items?: Incident[]; timeline?: TimelineEvent[] }
    const loadedItems = payload.items ?? []
    setItems(loadedItems)
    setTimeline(payload.timeline ?? [])
    setDraftById(buildDraftById(loadedItems))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setFormMessage("")
    setFormMessageType("error")
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
      setFormMessageType("error")
      setFormMessage(
        errorPayload.error ??
          "We couldn't create this incident report. Please check the fields and try again."
      )
      setLoading(false)
      return
    }
    event.currentTarget.reset()
    await loadIncidents()
    setFormMessageType("success")
    setFormMessage("Incident reported successfully.")
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
      setFormMessageType("error")
      setFormMessage(payload.error ?? "We couldn't save this incident update.")
      return
    }
    setFormMessageType("success")
    setFormMessage("Incident updated successfully.")
    await loadIncidents()
  }

  async function handleDeleteIncident(incidentId: string, incidentType: string) {
    const confirmed = window.confirm(
      `Delete incident "${incidentType}"? This cannot be undone.`
    )
    if (!confirmed) return

    setDeletingById((prev) => ({ ...prev, [incidentId]: true }))
    const response = await fetch(`/api/whs-incidents/${incidentId}`, {
      method: "DELETE",
    })
    setDeletingById((prev) => ({ ...prev, [incidentId]: false }))
    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string }
      setFormMessageType("error")
      setFormMessage(payload.error ?? "We couldn't delete this incident.")
      return
    }
    setItems((prev) => prev.filter((item) => item.id !== incidentId))
    setTimeline((prev) => prev.filter((event) => event.incidentId !== incidentId))
    setDraftById((prev) => {
      const next = { ...prev }
      delete next[incidentId]
      return next
    })
    setFormMessageType("success")
    setFormMessage("Incident deleted successfully.")
  }

  function timelineForIncident(incidentId: string) {
    return timeline.filter((event) => event.incidentId === incidentId)
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="WHS Incident Reports"
        description="Record incidents quickly, then move each one through review, action, and closure."
      />
      {showSuccess ? (
        <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm leading-6 text-green-700">
          WHS incident saved successfully.
        </div>
      ) : null}
      {formMessage ? (
        <div
          className={`rounded-md border px-3 py-2 text-sm leading-6 ${
            formMessageType === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {formMessage}
        </div>
      ) : null}

      <form
        id="new-incident-form"
        onSubmit={handleSubmit}
        className="w-full rounded-xl border border-slate-200 bg-white p-4 sm:p-6"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input name="incidentType" placeholder="Incident type (e.g. Slip/Fall)" className="w-full" required />
          <Input name="incidentDate" type="datetime-local" className="w-full" required />
          <Input
            name="employeesInvolved"
            placeholder="Employees involved (comma separated)"
            className="w-full md:col-span-2"
            required
          />
          <Input name="assignedTo" placeholder="Assigned person (owner)" className="w-full" />
          <Input
            name="correctiveAction"
            placeholder="Initial corrective action summary (optional)"
            className="w-full"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Submit Incident"}
        </Button>
      </form>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {items.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white xl:col-span-2">
            <EmptyState
              title="No incidents reported"
              description="If an incident occurs, report it straight away so actions and evidence are tracked."
              actionLabel="Use Incident Form"
              actionHref="#new-incident-form"
            />
          </div>
        ) : null}
        {items.map((incident) => {
          const draft = draftById[incident.id]
          const timelineItems = timelineForIncident(incident.id)
          return (
            <div key={incident.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                    {incident.incidentType}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Logged {new Date(incident.incidentDate).toLocaleString("en-AU")} -{" "}
                    {incident.employeesInvolved}
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    Next step: <span className="font-medium">{getNextStep(incident.status)}</span>
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <WhsIncidentStatusBadge status={incident.status} />
                  {incident.riskFlags?.stuck ? (
                    <Badge variant="destructive">Stuck &gt; 7 days</Badge>
                  ) : null}
                  {incident.riskFlags?.closedWithoutCorrective ? (
                    <Badge variant="destructive">Closed without corrective action</Badge>
                  ) : null}
                  <Button type="button" variant="outline" size="sm" asChild>
                    <Link href={`/whs/${incident.id}/edit`}>Edit</Link>
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => void handleDeleteIncident(incident.id, incident.incidentType)}
                    disabled={!!deletingById[incident.id]}
                  >
                    {deletingById[incident.id] ? "Deleting..." : "Delete"}
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
                <p className="text-base font-semibold tracking-tight text-slate-900">
                  Incident timeline
                </p>
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
