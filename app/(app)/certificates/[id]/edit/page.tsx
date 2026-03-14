"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type EmployeeOption = { id: string; name: string }
type CertificateItem = {
  id: string
  employee_id?: string
  employeeId?: string
  type: string
  expiry_date?: string | null
  expiryDate?: string | null
  status: string
}

export default function EditCertificatePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [certificate, setCertificate] = useState<CertificateItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const load = async () => {
      const [employeeRes, certificateRes] = await Promise.all([
        fetch("/api/employees"),
        fetch(`/api/certificates/${params.id}`),
      ])
      const employeeBody = (await employeeRes.json().catch(() => ({}))) as { items?: EmployeeOption[] }
      const certificateBody = (await certificateRes.json().catch(() => ({}))) as {
        item?: CertificateItem
        error?: string
      }
      setEmployees(employeeBody.items ?? [])
      if (!certificateRes.ok || !certificateBody.item) {
        setError(certificateBody.error ?? "Failed to load certificate")
      } else {
        setCertificate(certificateBody.item)
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
      employeeId: String(formData.get("employeeId") ?? ""),
      type: String(formData.get("type") ?? ""),
      expiryDate: String(formData.get("expiryDate") ?? "") || null,
      status: String(formData.get("status") ?? "Valid"),
    }

    const response = await fetch(`/api/certificates/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string }
      setError(body.error ?? "Failed to update certificate")
      setLoading(false)
      return
    }
    router.push("/certificates?success=certificate-updated")
  }

  if (initialLoading) return <p className="text-sm text-slate-600">Loading certificate...</p>

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Edit Certificate</h1>
        <p className="mt-1 text-sm text-slate-600">Update certificate details.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid max-w-xl gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <select
          name="employeeId"
          required
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          defaultValue={certificate?.employeeId ?? certificate?.employee_id ?? ""}
        >
          <option value="" disabled>
            Select employee
          </option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name}
            </option>
          ))}
        </select>
        <Input name="type" placeholder="Certificate type" defaultValue={certificate?.type ?? ""} required />
        <Input
          name="expiryDate"
          type="date"
          defaultValue={(certificate?.expiryDate ?? certificate?.expiry_date ?? "")?.slice(0, 10)}
        />
        <select
          name="status"
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          defaultValue={certificate?.status ?? "Valid"}
        >
          <option value="Valid">Valid</option>
          <option value="Expiring">Expiring</option>
          <option value="Expired">Expired</option>
        </select>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/certificates">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
