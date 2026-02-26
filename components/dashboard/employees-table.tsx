"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Plus, Eye } from "lucide-react"

type OnboardingStatus = "Complete" | "In Progress" | "Not Started"
type ComplianceStatus = "green" | "yellow" | "red"

interface Employee {
  id: number
  name: string
  role: string
  department: string
  onboarding: OnboardingStatus
  compliance: ComplianceStatus
}

const employees: Employee[] = [
  { id: 1, name: "Sarah Mitchell", role: "Front of House Manager", department: "Hospitality", onboarding: "Complete", compliance: "green" },
  { id: 2, name: "James Thompson", role: "Care Assistant", department: "Aged Care", onboarding: "In Progress", compliance: "yellow" },
  { id: 3, name: "Maria Lopez", role: "Chef", department: "Hospitality", onboarding: "Complete", compliance: "green" },
  { id: 4, name: "Tom Bradley", role: "Bartender", department: "Hospitality", onboarding: "Not Started", compliance: "red" },
  { id: 5, name: "Rachel Park", role: "Registered Nurse", department: "Clinic", onboarding: "Complete", compliance: "green" },
  { id: 6, name: "Lisa Kim", role: "Receptionist", department: "Clinic", onboarding: "In Progress", compliance: "yellow" },
  { id: 7, name: "David Chen", role: "Kitchen Hand", department: "Hospitality", onboarding: "Complete", compliance: "green" },
  { id: 8, name: "Emma Wilson", role: "Care Coordinator", department: "Aged Care", onboarding: "Complete", compliance: "green" },
  { id: 9, name: "Ben Nguyen", role: "Waiter", department: "Hospitality", onboarding: "Not Started", compliance: "red" },
  { id: 10, name: "Sophie Taylor", role: "Practice Manager", department: "Clinic", onboarding: "Complete", compliance: "green" },
]

function getOnboardingBadgeStyles(status: OnboardingStatus) {
  switch (status) {
    case "Complete":
      return "bg-success/10 text-success border-success/20"
    case "In Progress":
      return "bg-warning/10 text-warning-foreground border-warning/20"
    case "Not Started":
      return "bg-muted text-muted-foreground border-border"
  }
}

function getComplianceDot(status: ComplianceStatus) {
  switch (status) {
    case "green":
      return "bg-success"
    case "yellow":
      return "bg-warning"
    case "red":
      return "bg-destructive"
  }
}

export function EmployeesTable() {
  const [search, setSearch] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")

  const filtered = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.role.toLowerCase().includes(search.toLowerCase())
    const matchesDepartment =
      departmentFilter === "all" || emp.department === departmentFilter
    return matchesSearch && matchesDepartment
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              <SelectItem value="Hospitality">Hospitality</SelectItem>
              <SelectItem value="Aged Care">Aged Care</SelectItem>
              <SelectItem value="Clinic">Clinic</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>
      <div className="rounded-lg border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden md:table-cell">Department</TableHead>
              <TableHead>Onboarding</TableHead>
              <TableHead>Compliance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((employee, index) => (
              <TableRow
                key={employee.id}
                className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}
              >
                <TableCell className="font-medium text-foreground">
                  {employee.name}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {employee.role}
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">
                  {employee.department}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getOnboardingBadgeStyles(employee.onboarding)}
                  >
                    {employee.onboarding}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${getComplianceDot(employee.compliance)}`}
                    />
                    <span className="sr-only">
                      {employee.compliance === "green"
                        ? "Compliant"
                        : employee.compliance === "yellow"
                          ? "Attention needed"
                          : "Non-compliant"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View {employee.name}</span>
                    <span className="hidden sm:inline">View</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No employees found matching your search.
          </div>
        )}
      </div>
    </div>
  )
}
