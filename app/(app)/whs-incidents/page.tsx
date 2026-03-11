"use client"

import { FormEvent, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

type Incident = {
  id: string
  incidentType: string
  incidentDate: string
  employeesInvolved: string
  correctiveAction: string
  status: string
}

export default function WhsIncidentsPage() {
  const [items, setItems] = useState<Incident[]>([])
  const [loading, setLoading] = useState(false)

  async function loadIncidents() {
    const res = await fetch("/api/whs-incidents")
    const payload = (await res.json()) as { items?: Incident[] }
    setItems(payload.items ?? [])
  }

  useEffect(() => {
    void loadIncidents()
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    const formData = new FormData(event.currentTarget)
    const payload = {
      incidentType: String(formData.get("incidentType") ?? ""),
      incidentDate: String(formData.get("incidentDate") ?? ""),
      employeesInvolved: String(formData.get("employeesInvolved") ?? ""),
      correctiveAction: String(formData.get("correctiveAction") ?? ""),
      status: String(formData.get("status") ?? "Open"),
    }
    await fetch("/api/whs-incidents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    event.currentTarget.reset()
    await loadIncidents()
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">WHS Incident Reports</h1>
        <p className="mt-1 text-sm text-slate-600">
          Capture WHS incidents and corrective actions for AU compliance.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <Input name="incidentType" placeholder="Incident type (e.g. Slip/Fall)" required />
        <Input name="incidentDate" type="datetime-local" required />
        <Input name="employeesInvolved" placeholder="Employees involved (comma separated)" required />
        <Input name="correctiveAction" placeholder="Corrective action taken" required />
        <select
          name="status"
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          defaultValue="Open"
        >
          <option value="Open">Open</option>
          <option value="Investigating">Investigating</option>
          <option value="Closed">Closed</option>
        </select>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Submit Incident"}
        </Button>
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Employees</th>
              <th className="px-4 py-3 font-medium">Corrective Action</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((incident) => (
              <tr key={incident.id} className="border-t border-slate-100">
                <td className="px-4 py-3 text-slate-800">{incident.incidentType}</td>
                <td className="px-4 py-3 text-slate-700">
                  {new Date(incident.incidentDate).toLocaleString("en-AU")}
                </td>
                <td className="px-4 py-3 text-slate-700">{incident.employeesInvolved}</td>
                <td className="px-4 py-3 text-slate-700">{incident.correctiveAction}</td>
                <td className="px-4 py-3">
                  <Badge variant={incident.status === "Closed" ? "success" : "warning"}>
                    {incident.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
