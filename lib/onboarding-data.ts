/**
 * Dummy onboarding progress data.
 * Replace with API in production.
 */

export type OnboardingEmployee = {
  id: string
  name: string
  initials: string
  role: string
  startDate: string
  completedStepIds: number[]
}

export const ONBOARDING_EMPLOYEES: OnboardingEmployee[] = [
  { id: "e1", name: "Sarah Mitchell", initials: "SM", role: "Personal Care Assistant", startDate: "12 Mar 2024", completedStepIds: [1, 2, 3, 4, 5, 6, 7, 8] },
  { id: "e2", name: "James Thompson", initials: "JT", role: "Support Worker", startDate: "02 Feb 2024", completedStepIds: [1, 2, 3, 5, 6] },
  { id: "e3", name: "Maria Lopez", initials: "ML", role: "Enrolled Nurse", startDate: "18 Jan 2023", completedStepIds: [1, 2, 3, 4, 5, 6, 7, 8] },
  { id: "e4", name: "Tom Bradley", initials: "TB", role: "Personal Care Assistant", startDate: "05 Sep 2024", completedStepIds: [1] },
  { id: "e5", name: "Rachel Park", initials: "RP", role: "Registered Nurse", startDate: "10 Jul 2022", completedStepIds: [1, 2, 3, 4, 5, 6, 7, 8] },
  { id: "e6", name: "Lisa Kim", initials: "LK", role: "Support Worker", startDate: "21 Nov 2024", completedStepIds: [1, 2, 4, 5, 7] },
  { id: "e7", name: "David Chen", initials: "DC", role: "Support Worker", startDate: "03 Oct 2023", completedStepIds: [1, 2, 3, 4, 5, 6] },
  { id: "e8", name: "Emma Wilson", initials: "EW", role: "Personal Care Assistant", startDate: "28 Jan 2025", completedStepIds: [1, 2, 5, 6] },
]
