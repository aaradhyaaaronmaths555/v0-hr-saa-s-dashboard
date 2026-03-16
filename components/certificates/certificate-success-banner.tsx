"use client"

import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"

type CertificateSuccessBannerProps = {
  success: string
}

export function CertificateSuccessBanner({ success }: CertificateSuccessBannerProps) {
  const router = useRouter()

  const message = useMemo(() => {
    if (success === "certificate-deleted") return "Certificate deleted successfully."
    if (success === "certificate-updated") return "Certificate updated successfully."
    return "Certificate added successfully."
  }, [success])

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/certificates")
    }, 5000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
      {message}
    </div>
  )
}
