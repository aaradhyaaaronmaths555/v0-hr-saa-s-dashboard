"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ResidencyStatus } from "@/lib/right-to-work/residency"

function isValidDate(value: string) {
  return !Number.isNaN(new Date(value).getTime())
}

type RightToWorkItem = {
  id: string
  employeeId: string
  residencyStatus?: ResidencyStatus
  visaSubtype?: string
  visaType: string
  visaExpiryDate: string | null
  Employee?: {
    name?: string
  }
}

export default function EditRightToWorkRecordPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [item, setItem] = useState<RightToWorkItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState("")
  const [residencyStatus, setResidencyStatus] = useState<ResidencyStatus>("Visa")
  const [fieldErrors, setFieldErrors] = useState<{
    residencyStatus?: string
    visaSubtype?: string
    visaExpiryDate?: string
  }>({})

  useEffect(() => {
    const load = async () => {
      const response = await fetch(`/api/right-to-work-records/${params.id}`)
      const payload = (await response.json().catch(() => ({}))) as {
        item?: RightToWorkItem
        error?: string
      }
      if (!response.ok || !payload.item) {
        setError(payload.error ?? "Failed to load record")
      } else {
        setItem(payload.item)
        setResidencyStatus(payload.item.residencyStatus ?? "Visa")
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
    const visaSubtype = String(formData.get("visaSubtype") ?? "").trim()
    const visaExpiryDate = String(formData.get("visaExpiryDate") ?? "")
    const nextFieldErrors: {
      residencyStatus?: string
      visaSubtype?: string
      visaExpiryDate?: string
    } = {}
    if (!residencyStatus) {
      nextFieldErrors.residencyStatus = "Select residency status."
    }
    if (residencyStatus === "Visa" && !visaSubtype) {
      nextFieldErrors.visaSubtype = "Visa subtype is required for Visa."
    }
    if (
      residencyStatus === "Visa" &&
      (!visaExpiryDate || !isValidDate(visaExpiryDate))
    ) {
      nextFieldErrors.visaExpiryDate = "Enter a valid visa expiry date."
    }
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      setLoading(false)
      return
    }
    const payload = {
      residencyStatus,
      visaSubtype,
      visaExpiryDate: residencyStatus === "Visa" ? visaExpiryDate : null,
    }
    const response = await fetch(`/api/right-to-work-records/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string }
      setError(body.error ?? "Failed to update Right to Work record")
      setLoading(false)
      return
    }
    router.push("/right-to-work?success=right-to-work-updated")
  }

  if (initialLoading) return <p className="text-sm text-slate-600">Loading record...</p>

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Edit Right to Work Record</h1>
        <p className="mt-1 text-sm text-slate-600">
          Update residency and visa details for {item?.Employee?.name ?? "employee"}.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-4 sm:p-6"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1 md:col-span-2">
            <Input value={item?.Employee?.name ?? ""} className="w-full" disabled />
          </div>
          <div className="space-y-1">
            <select
              name="residencyStatus"
              value={residencyStatus}
              onChange={(event) => setResidencyStatus(event.target.value as ResidencyStatus)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="Citizen">Citizen</option>
              <option value="PR">PR</option>
              <option value="Visa">Visa</option>
            </select>
            {fieldErrors.residencyStatus ? (
              <p className="text-sm text-red-600">{fieldErrors.residencyStatus}</p>
            ) : null}
          </div>
          {residencyStatus === "Visa" ? (
            <>
              <div className="space-y-1">
                <Input
                  name="visaSubtype"
                  placeholder="Visa subtype (e.g. Subclass 482)"
                  defaultValue={item?.visaSubtype ?? ""}
                  className="w-full"
                  required
                />
                {fieldErrors.visaSubtype ? (
                  <p className="text-sm text-red-600">{fieldErrors.visaSubtype}</p>
                ) : null}
              </div>
              <div className="space-y-1">
                <Input
                  name="visaExpiryDate"
                  type="date"
                  defaultValue={item?.visaExpiryDate ? item.visaExpiryDate.slice(0, 10) : ""}
                  className="w-full"
                  required
                />
                {fieldErrors.visaExpiryDate ? (
                  <p className="text-sm text-red-600">{fieldErrors.visaExpiryDate}</p>
                ) : null}
              </div>
            </>
          ) : null}
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/right-to-work">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
