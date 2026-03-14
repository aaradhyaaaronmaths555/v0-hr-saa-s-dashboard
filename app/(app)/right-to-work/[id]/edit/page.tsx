"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type RightToWorkItem = {
  id: string
  employeeId: string
  visaType: string
  visaExpiryDate: string
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
      visaType: String(formData.get("visaType") ?? ""),
      visaExpiryDate: String(formData.get("visaExpiryDate") ?? ""),
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
          Update visa details for {item?.Employee?.name ?? "employee"}.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid max-w-xl gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <Input value={item?.Employee?.name ?? ""} disabled />
        <Input name="visaType" placeholder="Visa type" defaultValue={item?.visaType ?? ""} required />
        <Input
          name="visaExpiryDate"
          type="date"
          defaultValue={item?.visaExpiryDate ? item.visaExpiryDate.slice(0, 10) : ""}
          required
        />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex gap-2">
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
