/**
 * Aged care onboarding compliance steps.
 * Steps 2, 3, 4 are non-negotiable gates — employee cannot be cleared for duty until complete.
 */

export const ONBOARDING_STEPS = [
  { id: 1, label: "Sign Employment Contract", sublabel: "E-sign placeholder", isGate: false },
  { id: 2, label: "NDIS Worker Screening Check submitted", sublabel: "Non-negotiable", isGate: true },
  { id: 3, label: "Police Check uploaded", sublabel: "Non-negotiable", isGate: true },
  { id: 4, label: "First Aid/CPR Certificate uploaded", sublabel: "Non-negotiable", isGate: true },
  { id: 5, label: "Complete WHS Induction", sublabel: "Policy acknowledgement", isGate: false },
  { id: 6, label: "Complete Manual Handling training", sublabel: "Training module", isGate: false },
  { id: 7, label: "Read and acknowledge Code of Conduct", sublabel: "Policy acknowledgement", isGate: false },
  { id: 8, label: "Emergency Procedures policy acknowledged", sublabel: "Policy acknowledgement", isGate: false },
] as const

export const TOTAL_STEPS = ONBOARDING_STEPS.length

export const GATE_STEP_IDS = [2, 3, 4] as const

/** Steps that must be complete for "Cleared for Duty" */
export function allStepsComplete(completedStepIds: number[]): boolean {
  return completedStepIds.length >= TOTAL_STEPS
}

/** Non-negotiable gates (2, 3, 4) — if any incomplete, show "Not Cleared for Duty" */
export function gatesComplete(completedStepIds: number[]): boolean {
  return GATE_STEP_IDS.every((id) => completedStepIds.includes(id))
}
