export type ResidencyStatus = "Citizen" | "PR" | "Visa"

const VALID_RESIDENCY_STATUSES: ResidencyStatus[] = ["Citizen", "PR", "Visa"]

export function isResidencyStatus(value: string): value is ResidencyStatus {
  return VALID_RESIDENCY_STATUSES.includes(value as ResidencyStatus)
}

export function parseVisaTypeForResidency(visaType: string | null | undefined): {
  residencyStatus: ResidencyStatus
  visaSubtype: string
} {
  const value = (visaType ?? "").trim()
  if (!value) return { residencyStatus: "Visa", visaSubtype: "" }
  if (/^citizen$/i.test(value)) return { residencyStatus: "Citizen", visaSubtype: "" }
  if (/^(pr|permanent resident|permanent residency)$/i.test(value)) {
    return { residencyStatus: "PR", visaSubtype: "" }
  }
  if (value.toLowerCase().startsWith("visa:")) {
    return { residencyStatus: "Visa", visaSubtype: value.slice(5).trim() }
  }
  return { residencyStatus: "Visa", visaSubtype: value }
}

export function buildVisaTypeFromResidency(
  residencyStatus: ResidencyStatus,
  visaSubtype: string
): string {
  if (residencyStatus === "Citizen") return "Citizen"
  if (residencyStatus === "PR") return "PR"
  return visaSubtype.trim()
}
