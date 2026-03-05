"use client"

import { useEffect, useMemo, useState } from "react"
import type { ChangeEvent } from "react"
import dynamic from "next/dynamic"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Plus,
  Search,
  Bell,
  Download,
  X,
  SearchX,
} from "lucide-react"

const EmployeeDrawer = dynamic(
  () => import("@/components/employees/employee-drawer"),
  { ssr: false }
)

import type {
  EmployeeRow,
  EmployeeDetails,
} from "@/components/employees/employee-drawer"

type OnboardingStatus = "Complete" | "In Progress" | "Not Started"
type ComplianceStatus = "green" | "amber" | "red"
type DepartmentFilter = "All" | "Front of House" | "Kitchen" | "Management" | "Non-Compliant Only"

const EMPLOYEES: EmployeeRow[] = [
  {
    id: "emp_001",
    name: "Sarah Mitchell",
    initials: "SM",
    role: "Front of House Manager",
    department: "Front of House",
    startDate: "12 Mar 2024",
    onboardingStatus: "Complete",
    complianceStatus: "green",
  },
  {
    id: "emp_002",
    name: "James Thompson",
    initials: "JT",
    role: "Waitstaff",
    department: "Front of House",
    startDate: "02 Feb 2024",
    onboardingStatus: "In Progress",
    complianceStatus: "amber",
  },
  {
    id: "emp_003",
    name: "Maria Lopez",
    initials: "ML",
    role: "Head Chef",
    department: "Kitchen",
    startDate: "18 Jan 2023",
    onboardingStatus: "Complete",
    complianceStatus: "green",
  },
  {
    id: "emp_004",
    name: "Tom Bradley",
    initials: "TB",
    role: "Kitchen Hand",
    department: "Kitchen",
    startDate: "05 Sep 2024",
    onboardingStatus: "Not Started",
    complianceStatus: "red",
  },
  {
    id: "emp_005",
    name: "Rachel Park",
    initials: "RP",
    role: "Venue Manager",
    department: "Management",
    startDate: "10 Jul 2022",
    onboardingStatus: "Complete",
    complianceStatus: "green",
  },
  {
    id: "emp_006",
    name: "Lisa Kim",
    initials: "LK",
    role: "Assistant Manager",
    department: "Management",
    startDate: "21 Nov 2024",
    onboardingStatus: "In Progress",
    complianceStatus: "amber",
  },
  {
    id: "emp_007",
    name: "David Chen",
    initials: "DC",
    role: "Bar Supervisor",
    department: "Front of House",
    startDate: "03 Oct 2023",
    onboardingStatus: "Complete",
    complianceStatus: "green",
  },
  {
    id: "emp_008",
    name: "Emma Wilson",
    initials: "EW",
    role: "Commis Chef",
    department: "Kitchen",
    startDate: "28 Jan 2025",
    onboardingStatus: "In Progress",
    complianceStatus: "amber",
  },
]

const EMPLOYEE_DETAILS: Record<string, EmployeeDetails> = {
  emp_001: {
    id: "emp_001",
    email: "sarah.mitchell@example.com",
    phone: "0401 234 567",
    onboardingCompleted: 6,
    onboardingTotal: 6,
    policies: [
      { name: "Workplace Health & Safety", acknowledged: true },
      { name: "Anti-Discrimination & Harassment", acknowledged: true },
      { name: "Social Media Usage", acknowledged: true },
    ],
    certificates: [
      { name: "First Aid", expiresOn: "14 Mar 2026", daysRemaining: 320, status: "valid" },
      { name: "Police Check", expiresOn: "11 Mar 2027", daysRemaining: 714, status: "valid" },
    ],
    timeline: [
      { id: "t1", type: "policy", title: "Acknowledged Social Media Usage", date: "Feb 28", icon: "check" },
      { id: "t2", type: "policy", title: "Acknowledged Anti-Discrimination Policy", date: "Feb 25", icon: "check" },
      { id: "t3", type: "certificate", title: "First Aid Certificate uploaded", date: "Feb 20", icon: "award" },
      { id: "t4", type: "policy", title: "Acknowledged WHS Policy", date: "Feb 15", icon: "check" },
      { id: "t5", type: "onboarding", title: "Completed onboarding", date: "Feb 10", icon: "check" },
      { id: "t6", type: "added", title: "Added to the system", date: "Mar 12, 2024", icon: "user" },
    ],
  },
  emp_002: {
    id: "emp_002",
    email: "james.thompson@example.com",
    phone: "0402 345 678",
    onboardingCompleted: 3,
    onboardingTotal: 6,
    policies: [
      { name: "Workplace Health & Safety", acknowledged: true },
      { name: "Food Safety Procedures", acknowledged: false },
      { name: "Anti-Discrimination & Harassment", acknowledged: false },
    ],
    certificates: [
      { name: "NDIS Worker Screening", expiresOn: "21 Nov 2025", daysRemaining: 42, status: "expiring" },
    ],
    timeline: [
      { id: "t1", type: "policy", title: "Acknowledged WHS Policy", date: "Feb 20", icon: "check" },
      { id: "t2", type: "onboarding", title: "Started onboarding", date: "Feb 10", icon: "clock" },
      { id: "t3", type: "added", title: "Added to the system", date: "Feb 02, 2024", icon: "user" },
    ],
  },
  emp_003: {
    id: "emp_003",
    email: "maria.lopez@example.com",
    phone: "0403 456 789",
    onboardingCompleted: 6,
    onboardingTotal: 6,
    policies: [
      { name: "Workplace Health & Safety", acknowledged: true },
      { name: "Food Safety Procedures", acknowledged: true },
    ],
    certificates: [
      { name: "Food Safety Certificate", expiresOn: "08 Jan 2027", daysRemaining: 680, status: "valid" },
      { name: "Manual Handling", expiresOn: "17 Jun 2026", daysRemaining: 478, status: "valid" },
    ],
    timeline: [
      { id: "t1", type: "certificate", title: "Food Safety Supervisor renewed", date: "Jan 09", icon: "award" },
      { id: "t2", type: "policy", title: "Acknowledged Food Safety Procedures", date: "Dec 15", icon: "check" },
      { id: "t3", type: "policy", title: "Acknowledged WHS Policy", date: "Dec 10", icon: "check" },
      { id: "t4", type: "onboarding", title: "Completed onboarding", date: "Feb 01, 2023", icon: "check" },
      { id: "t5", type: "added", title: "Added to the system", date: "Jan 18, 2023", icon: "user" },
    ],
  },
  emp_004: {
    id: "emp_004",
    email: "tom.bradley@example.com",
    phone: "0404 567 890",
    onboardingCompleted: 1,
    onboardingTotal: 6,
    policies: [
      { name: "Workplace Health & Safety", acknowledged: false },
      { name: "Food Safety Procedures", acknowledged: false },
    ],
    certificates: [
      { name: "Police Check", expiresOn: "04 Sep 2024", daysRemaining: -144, status: "expired" },
    ],
    timeline: [
      { id: "t1", type: "certificate", title: "RSA Certificate expired", date: "Mar 01", icon: "clock" },
      { id: "t2", type: "onboarding", title: "Started onboarding", date: "Sep 10, 2024", icon: "clock" },
      { id: "t3", type: "added", title: "Added to the system", date: "Sep 05, 2024", icon: "user" },
    ],
  },
  emp_005: {
    id: "emp_005",
    email: "rachel.park@example.com",
    phone: "0405 678 901",
    onboardingCompleted: 6,
    onboardingTotal: 6,
    policies: [
      { name: "Workplace Health & Safety", acknowledged: true },
      { name: "Anti-Discrimination & Harassment", acknowledged: true },
      { name: "Privacy & Confidentiality", acknowledged: true },
    ],
    certificates: [
      { name: "Manual Handling", expiresOn: "09 Jul 2026", daysRemaining: 499, status: "valid" },
    ],
    timeline: [
      { id: "t1", type: "policy", title: "Acknowledged Privacy Policy", date: "Feb 22", icon: "check" },
      { id: "t2", type: "policy", title: "Acknowledged Anti-Discrimination Policy", date: "Feb 18", icon: "check" },
      { id: "t3", type: "policy", title: "Acknowledged WHS Policy", date: "Feb 15", icon: "check" },
      { id: "t4", type: "certificate", title: "First Aid Certificate uploaded", date: "Aug 15, 2022", icon: "award" },
      { id: "t5", type: "onboarding", title: "Completed onboarding", date: "Jul 25, 2022", icon: "check" },
      { id: "t6", type: "added", title: "Added to the system", date: "Jul 10, 2022", icon: "user" },
    ],
  },
  emp_006: {
    id: "emp_006",
    email: "lisa.kim@example.com",
    phone: "0406 789 012",
    onboardingCompleted: 4,
    onboardingTotal: 6,
    policies: [
      { name: "Workplace Health & Safety", acknowledged: true },
      { name: "Anti-Discrimination & Harassment", acknowledged: true },
      { name: "Privacy & Confidentiality", acknowledged: false },
    ],
    certificates: [
      { name: "First Aid", expiresOn: "20 Nov 2025", daysRemaining: 48, status: "expiring" },
    ],
    timeline: [
      { id: "t1", type: "policy", title: "Acknowledged Anti-Discrimination Policy", date: "Feb 10", icon: "check" },
      { id: "t2", type: "policy", title: "Acknowledged WHS Policy", date: "Feb 05", icon: "check" },
      { id: "t3", type: "certificate", title: "Leadership Training completed", date: "Dec 18, 2024", icon: "award" },
      { id: "t4", type: "onboarding", title: "Started onboarding", date: "Nov 25, 2024", icon: "clock" },
      { id: "t5", type: "added", title: "Added to the system", date: "Nov 21, 2024", icon: "user" },
    ],
  },
  emp_007: {
    id: "emp_007",
    email: "david.chen@example.com",
    phone: "0407 890 123",
    onboardingCompleted: 5,
    onboardingTotal: 6,
    policies: [
      { name: "Workplace Health & Safety", acknowledged: true },
      { name: "Responsible Service of Alcohol", acknowledged: true },
    ],
    certificates: [
      { name: "NDIS Worker Screening", expiresOn: "02 Oct 2025", daysRemaining: 12, status: "expiring" },
    ],
    timeline: [
      { id: "t1", type: "certificate", title: "RSA Certificate renewed", date: "Jan 11", icon: "award" },
      { id: "t2", type: "policy", title: "Acknowledged RSA Policy", date: "Dec 20", icon: "check" },
      { id: "t3", type: "policy", title: "Acknowledged WHS Policy", date: "Dec 15", icon: "check" },
      { id: "t4", type: "onboarding", title: "Near completion", date: "Nov 01, 2023", icon: "clock" },
      { id: "t5", type: "added", title: "Added to the system", date: "Oct 03, 2023", icon: "user" },
    ],
  },
  emp_008: {
    id: "emp_008",
    email: "emma.wilson@example.com",
    phone: "0408 901 234",
    onboardingCompleted: 2,
    onboardingTotal: 6,
    policies: [
      { name: "Workplace Health & Safety", acknowledged: true },
      { name: "Food Safety Procedures", acknowledged: false },
    ],
    certificates: [
      { name: "Food Safety Certificate", expiresOn: "27 Jan 2025", daysRemaining: -30, status: "expired" },
    ],
    timeline: [
      { id: "t1", type: "policy", title: "Acknowledged WHS Policy", date: "Feb 15", icon: "check" },
      { id: "t2", type: "onboarding", title: "Started onboarding", date: "Feb 01", icon: "clock" },
      { id: "t3", type: "added", title: "Added to the system", date: "Jan 28, 2025", icon: "user" },
    ],
  },
}

function onboardingBadgeVariant(status: OnboardingStatus): "success" | "warning" | "neutral" {
  switch (status) {
    case "Complete": return "success"
    case "In Progress": return "warning"
    case "Not Started": return "neutral"
  }
}

function complianceBadgeConfig(status: ComplianceStatus): { label: string; icon: string; variant: "success" | "warning" | "destructive" } {
  switch (status) {
    case "green":
      return { label: "Compliant", icon: "✅", variant: "success" }
    case "amber":
      return { label: "Action Needed", icon: "⚠️", variant: "warning" }
    case "red":
      return { label: "Non-Compliant", icon: "🚨", variant: "destructive" }
  }
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index} className="hover:bg-transparent">
          <TableCell className="w-10">
            <div className="h-4 w-4 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            </div>
          </TableCell>
          <TableCell>
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell className="hidden md:table-cell">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell className="hidden sm:table-cell">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
          </TableCell>
          <TableCell>
            <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
          </TableCell>
          <TableCell className="text-right">
            <div className="ml-auto h-8 w-12 animate-pulse rounded bg-muted" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

function EmptyState({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <SearchX className="mb-4 h-12 w-12 text-slate-300" />
      <h3 className="text-base font-medium text-slate-500">
        No employees found
      </h3>
      <p className="mt-1 max-w-[280px] text-sm text-slate-400">
        We couldn&apos;t find any employees matching your search or filters. Try
        adjusting your criteria.
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-4"
        onClick={onClearFilters}
      >
        <X className="h-4 w-4" />
        Clear Filters
      </Button>
    </div>
  )
}

function FloatingActionBar({
  selectedCount,
  onClearSelection,
}: {
  selectedCount: number
  onClearSelection: () => void
}) {
  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 shadow-lg">
        <span className="text-sm font-medium text-foreground">
          {selectedCount} selected
        </span>
        <div className="h-4 w-px bg-border" />
        <Button type="button" variant="outline" size="sm">
          <Bell className="h-4 w-4" />
          Send Reminder
        </Button>
        <Button type="button" variant="outline" size="sm">
          <Download className="h-4 w-4" />
          Export
        </Button>
        <div className="h-4 w-px bg-border" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
        >
          <X className="h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>
  )
}

export default function EmployeesListPage() {
  const [query, setQuery] = useState("")
  const [department, setDepartment] = useState<DepartmentFilter>("All")
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  const nonCompliantCount = useMemo(
    () => EMPLOYEES.filter((e) => e.complianceStatus === "red").length,
    []
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return EMPLOYEES.filter((emp) => {
      const matchesQuery =
        !q ||
        emp.name.toLowerCase().includes(q) ||
        emp.role.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q)
      const matchesDepartment =
        department === "All"
          ? true
          : department === "Non-Compliant Only"
            ? emp.complianceStatus === "red"
            : emp.department === department
      return matchesQuery && matchesDepartment
    })
  }, [query, department])

  const selectedEmployee: EmployeeRow | null = useMemo(
    () => EMPLOYEES.find((emp) => emp.id === selectedEmployeeId) ?? null,
    [selectedEmployeeId],
  )

  const selectedDetails: EmployeeDetails | null = useMemo(() => {
    if (!selectedEmployeeId) return null
    return EMPLOYEE_DETAILS[selectedEmployeeId] ?? null
  }, [selectedEmployeeId])

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)
  }

  const handleDepartmentChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setDepartment(event.target.value as DepartmentFilter)
  }

  const handleClearFilters = () => {
    setQuery("")
    setDepartment("All")
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filtered.map((emp) => emp.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds)
    if (checked) {
      newSet.add(id)
    } else {
      newSet.delete(id)
    }
    setSelectedIds(newSet)
  }

  const handleClearSelection = () => {
    setSelectedIds(new Set())
  }

  const allSelected = filtered.length > 0 && filtered.every((emp) => selectedIds.has(emp.id))
  const someSelected = filtered.some((emp) => selectedIds.has(emp.id)) && !allSelected
  const hasFilters = query.trim() !== "" || department !== "All"

  const handleViewNonCompliant = () => {
    setDepartment("Non-Compliant Only")
  }

  return (
    <div className="flex w-full flex-col gap-6">
      {nonCompliantCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-danger bg-danger-bg px-4 py-3">
          <p className="flex-1 text-sm text-danger">
            <span className="font-medium">
              {nonCompliantCount} employee{nonCompliantCount === 1 ? "" : "s"} have
              expired certificates
            </span>
            {" "}and are currently active —
            <button
              type="button"
              onClick={handleViewNonCompliant}
              className="ml-1 font-medium text-primary hover:underline"
            >
              view them
            </button>
          </p>
        </div>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Employees</h1>
          <p className="mt-1 text-sm text-slate-600">
            Search, view, and manage your team.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
          <div className="flex w-full flex-1 items-center gap-3 sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={handleSearchChange}
                placeholder="Search employees..."
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 sm:text-sm">
              <span className="hidden sm:inline">Department</span>
              <select
                className="h-9 shrink-0 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 hover:bg-slate-50 sm:text-sm"
                value={department}
                onChange={handleDepartmentChange}
              >
                <option value="All">All</option>
                <option value="Front of House">Front of House</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Management">Management</option>
                <option value="Non-Compliant Only">Show Non-Compliant Only</option>
              </select>
            </div>
          </div>
          <Button type="button">
            <Plus className="h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Table View */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  ref={(el) => {
                    if (el) {
                      (el as HTMLButtonElement & { indeterminate?: boolean }).indeterminate = someSelected
                    }
                  }}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden md:table-cell">Department</TableHead>
              <TableHead className="hidden lg:table-cell">Start Date</TableHead>
              <TableHead>Onboarding Status</TableHead>
              <TableHead>Compliance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableSkeleton />
            ) : filtered.length > 0 ? (
              filtered.map((employee: EmployeeRow) => (
                <TableRow
                  key={employee.id}
                  className={selectedIds.has(employee.id) ? "bg-primary-soft/50" : ""}
                >
                  <TableCell className="w-10">
                    <Checkbox
                      checked={selectedIds.has(employee.id)}
                      onCheckedChange={(checked) =>
                        handleSelectRow(employee.id, !!checked)
                      }
                      aria-label={`Select ${employee.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary-soft text-xs font-medium text-primary">
                          {employee.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-700">
                          {employee.name}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {employee.role}
                  </TableCell>
                  <TableCell className="hidden text-slate-600 md:table-cell">
                    {employee.department}
                  </TableCell>
                  <TableCell className="hidden text-slate-600 lg:table-cell">
                    {employee.startDate}
                  </TableCell>
                  <TableCell>
                    <Badge variant={onboardingBadgeVariant(employee.onboardingStatus)}>
                      {employee.onboardingStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={complianceBadgeConfig(employee.complianceStatus).variant}>
                      {complianceBadgeConfig(employee.complianceStatus).icon}{" "}
                      {complianceBadgeConfig(employee.complianceStatus).label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => setSelectedEmployeeId(employee.id)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : null}
          </TableBody>
        </Table>

        {!isLoading && filtered.length === 0 && hasFilters && (
          <EmptyState onClearFilters={handleClearFilters} />
        )}

        {!isLoading && filtered.length === 0 && !hasFilters && (
          <div className="flex flex-col items-center justify-center py-16">
            <SearchX className="mb-4 h-12 w-12 text-slate-300" />
            <p className="text-base font-medium text-slate-500">No employees found.</p>
            <p className="mt-1 text-sm text-slate-400">Add your first employee to get started.</p>
          </div>
        )}

        {(isLoading || filtered.length > 0) && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-400 sm:px-6">
            <span>
              {isLoading ? (
                <span className="inline-block h-4 w-32 animate-pulse rounded bg-muted" />
              ) : (
                <>
                  Showing {filtered.length} employee
                  {filtered.length === 1 ? "" : "s"}
                </>
              )}
            </span>
          </div>
        )}
      </div>

      {selectedIds.size > 0 && (
        <FloatingActionBar
          selectedCount={selectedIds.size}
          onClearSelection={handleClearSelection}
        />
      )}

      <EmployeeDrawer
        open={!!selectedEmployee && !!selectedDetails}
        onOpenChange={(open) => {
          if (!open) setSelectedEmployeeId(null)
        }}
        employee={selectedEmployee}
        details={selectedDetails}
      />
    </div>
  )
}
