"use client"

import { useMemo, useState } from "react"
import type { ChangeEvent } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Send, Eye, Search, LayoutGrid, List, Download } from "lucide-react"
import type { Policy } from "@/components/policies/policy-details-dialog"
import { cn } from "@/lib/utils"

const PolicyDetailsDialog = dynamic(
  () => import("@/components/policies/policy-details-dialog"),
  { ssr: false }
)

type PolicyStatus = "Active" | "Draft" | "Overdue"
type StatusFilter = "All" | PolicyStatus
type ViewMode = "grid" | "list"

function getDeadlineColorClass(deadlineStr: string): string {
  const deadline = new Date(deadlineStr)
  const now = new Date()
  const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (daysLeft < 0) return "text-danger"
  if (daysLeft <= 30) return "text-warning"
  return "text-text-muted"
}

const policies: Policy[] = [
  {
    id: 1,
    title: "Workplace Health & Safety Policy",
    description: "Core WHS obligations and safe work practices.",
    dateAdded: "15 Jan 2026",
    category: "WHS",
    assignedTo: "All staff",
    acknowledged: 14,
    total: 18,
    status: "Active",
    complianceDeadline: "15 Apr 2026",
    lastAcknowledged: "2 days ago",
    employees: [
      {
        name: "Sarah Mitchell",
        acknowledged: true,
        dateAcknowledged: "02 Mar 2026",
      },
      {
        name: "James Thompson",
        acknowledged: true,
        dateAcknowledged: "01 Mar 2026",
      },
      {
        name: "Maria Lopez",
        acknowledged: true,
        dateAcknowledged: "28 Feb 2026",
      },
      { name: "Tom Bradley", acknowledged: false },
      {
        name: "Rachel Park",
        acknowledged: true,
        dateAcknowledged: "26 Feb 2026",
      },
      { name: "Lisa Kim", acknowledged: false },
      {
        name: "David Chen",
        acknowledged: true,
        dateAcknowledged: "25 Feb 2026",
      },
      {
        name: "Emma Wilson",
        acknowledged: true,
        dateAcknowledged: "24 Feb 2026",
      },
    ],
    auditTrail: [
      { staffName: "Sarah Mitchell", action: "Acknowledged", dateTime: "2 Mar 2026, 10:42 AM" },
      { staffName: "James Thompson", action: "Reminded", dateTime: "1 Mar 2026, 3:15 PM" },
      { staffName: "James Thompson", action: "Acknowledged", dateTime: "1 Mar 2026, 4:02 PM" },
      { staffName: "Maria Lopez", action: "Acknowledged", dateTime: "28 Feb 2026, 9:18 AM" },
      { staffName: "Rachel Park", action: "Acknowledged", dateTime: "26 Feb 2026, 11:30 AM" },
      { staffName: "David Chen", action: "Reminded", dateTime: "25 Feb 2026, 2:00 PM" },
      { staffName: "David Chen", action: "Acknowledged", dateTime: "25 Feb 2026, 5:45 PM" },
      { staffName: "Emma Wilson", action: "Acknowledged", dateTime: "24 Feb 2026, 8:22 AM" },
    ],
  },
  {
    id: 2,
    title: "Privacy Policy",
    description: "How we collect, use, and store personal information.",
    dateAdded: "20 Jan 2026",
    category: "Privacy",
    assignedTo: "All staff",
    acknowledged: 16,
    total: 18,
    status: "Active",
    complianceDeadline: "30 May 2026",
    lastAcknowledged: "1 week ago",
    employees: [
      {
        name: "Sarah Mitchell",
        acknowledged: true,
        dateAcknowledged: "20 Feb 2026",
      },
      {
        name: "James Thompson",
        acknowledged: true,
        dateAcknowledged: "19 Feb 2026",
      },
      {
        name: "Maria Lopez",
        acknowledged: true,
        dateAcknowledged: "19 Feb 2026",
      },
      {
        name: "Tom Bradley",
        acknowledged: true,
        dateAcknowledged: "18 Feb 2026",
      },
    ],
    auditTrail: [
      { staffName: "Sarah Mitchell", action: "Acknowledged", dateTime: "20 Feb 2026, 9:00 AM" },
      { staffName: "James Thompson", action: "Acknowledged", dateTime: "19 Feb 2026, 2:30 PM" },
      { staffName: "Maria Lopez", action: "Acknowledged", dateTime: "19 Feb 2026, 11:15 AM" },
      { staffName: "Tom Bradley", action: "Reminded", dateTime: "18 Feb 2026, 10:00 AM" },
      { staffName: "Tom Bradley", action: "Acknowledged", dateTime: "18 Feb 2026, 4:20 PM" },
    ],
  },
  {
    id: 3,
    title: "Code of Conduct",
    description: "Expected workplace behaviours and professional standards.",
    dateAdded: "25 Jan 2026",
    category: "HR",
    assignedTo: "All staff",
    acknowledged: 12,
    total: 18,
    status: "Overdue",
    complianceDeadline: "01 Feb 2026",
    lastAcknowledged: "3 weeks ago",
    employees: [
      {
        name: "Maria Lopez",
        acknowledged: true,
        dateAcknowledged: "10 Feb 2026",
      },
      { name: "Tom Bradley", acknowledged: false },
      {
        name: "David Chen",
        acknowledged: true,
        dateAcknowledged: "09 Feb 2026",
      },
      { name: "Ben Nguyen", acknowledged: false },
    ],
    auditTrail: [
      { staffName: "Maria Lopez", action: "Acknowledged", dateTime: "10 Feb 2026, 8:45 AM" },
      { staffName: "David Chen", action: "Acknowledged", dateTime: "09 Feb 2026, 1:12 PM" },
      { staffName: "Tom Bradley", action: "Reminded", dateTime: "05 Feb 2026, 9:30 AM" },
      { staffName: "Ben Nguyen", action: "Reminded", dateTime: "03 Feb 2026, 2:00 PM" },
    ],
  },
  {
    id: 4,
    title: "Anti-Bullying Policy",
    description: "Guidelines to prevent and address workplace bullying.",
    dateAdded: "10 Feb 2026",
    category: "HR",
    assignedTo: "Supervisors & managers",
    acknowledged: 7,
    total: 12,
    status: "Draft",
    complianceDeadline: "20 Jun 2026",
    lastAcknowledged: "5 days ago",
    employees: [
      {
        name: "Rachel Park",
        acknowledged: true,
        dateAcknowledged: "12 Feb 2026",
      },
      {
        name: "Lisa Kim",
        acknowledged: true,
        dateAcknowledged: "11 Feb 2026",
      },
      {
        name: "Sophie Taylor",
        acknowledged: true,
        dateAcknowledged: "11 Feb 2026",
      },
      { name: "Dr. Mark Allen", acknowledged: false },
    ],
    auditTrail: [
      { staffName: "Rachel Park", action: "Acknowledged", dateTime: "12 Feb 2026, 10:00 AM" },
      { staffName: "Lisa Kim", action: "Acknowledged", dateTime: "11 Feb 2026, 3:45 PM" },
      { staffName: "Sophie Taylor", action: "Acknowledged", dateTime: "11 Feb 2026, 11:20 AM" },
    ],
  },
  {
    id: 5,
    title: "Food Safety Policy",
    description: "Food handling, storage, and hygiene requirements.",
    dateAdded: "18 Feb 2026",
    category: "Compliance",
    assignedTo: "All staff",
    acknowledged: 6,
    total: 10,
    status: "Overdue",
    complianceDeadline: "15 Jan 2026",
    lastAcknowledged: "2 weeks ago",
    employees: [
      {
        name: "Maria Lopez",
        acknowledged: true,
        dateAcknowledged: "05 Feb 2026",
      },
      { name: "Tom Bradley", acknowledged: false },
      {
        name: "David Chen",
        acknowledged: true,
        dateAcknowledged: "04 Feb 2026",
      },
      { name: "Ben Nguyen", acknowledged: false },
    ],
    auditTrail: [
      { staffName: "Maria Lopez", action: "Acknowledged", dateTime: "05 Feb 2026, 9:30 AM" },
      { staffName: "David Chen", action: "Acknowledged", dateTime: "04 Feb 2026, 2:15 PM" },
      { staffName: "Tom Bradley", action: "Reminded", dateTime: "28 Jan 2026, 10:00 AM" },
      { staffName: "Ben Nguyen", action: "Reminded", dateTime: "25 Jan 2026, 11:45 AM" },
      { staffName: "Emma Wilson", action: "Reminded", dateTime: "20 Jan 2026, 3:00 PM" },
    ],
  },
]

function getStatusStyles(status: PolicyStatus) {
  switch (status) {
    case "Active":
      return "bg-success/10 text-success border-success/20"
    case "Draft":
      return "bg-muted text-muted-foreground border-border"
    case "Overdue":
      return "bg-destructive/10 text-destructive border-destructive/20"
  }
}

function CircularProgress({ value, size = 40 }: { value: number; size?: number }) {
  const strokeWidth = 4
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-primary/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-semibold text-foreground">
          {Math.round(value)}%
        </span>
      </div>
    </div>
  )
}

function OverdueBadge() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-destructive" />
    </span>
  )
}

const auditSummaryRows = policies.map((p) => ({
  name: p.title,
  completion: p.total > 0 ? Math.round((p.acknowledged / p.total) * 100) : 0,
  status: p.status,
  deadline: p.complianceDeadline ?? "—",
}))

export function PoliciesList() {
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null)
  const [auditReportOpen, setAuditReportOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  const filteredPolicies = useMemo(() => {
    const q = query.trim().toLowerCase()
    return policies.filter((policy) => {
      const matchesQuery =
        !q ||
        policy.title.toLowerCase().includes(q) ||
        policy.description.toLowerCase().includes(q) ||
        policy.category.toLowerCase().includes(q) ||
        policy.assignedTo.toLowerCase().includes(q)
      const matchesStatus =
        statusFilter === "All" || policy.status === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [query, statusFilter])

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)
  }

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(event.target.value as StatusFilter)
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full flex-1 items-center gap-3 sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={handleSearchChange}
                placeholder="Search policies..."
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
              <span className="hidden sm:inline">Status</span>
              <select
                className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground h-9 shrink-0 rounded-lg border px-3 text-xs sm:text-sm"
                value={statusFilter}
                onChange={handleStatusChange}
              >
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
            <div className="flex items-center rounded-lg border border-border p-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon-sm"
                className="h-7 w-7"
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon-sm"
                className="h-7 w-7"
                onClick={() => setViewMode("list")}
                aria-label="List view"
              >
                <List className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAuditReportOpen(true)}
            >
              <Download className="h-4 w-4" />
              Download Audit Report
            </Button>
            <Button type="button">
              <Plus className="h-4 w-4" />
              Add Policy
            </Button>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="flex flex-col gap-4">
            {filteredPolicies.map((policy) => {
              const progress =
                policy.total > 0
                  ? (policy.acknowledged / policy.total) * 100
                  : 0
              return (
                <Card
                  key={policy.id}
                  className="border-border bg-background shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                >
                  <CardContent>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-1 items-start gap-4">
                        <CircularProgress value={progress} />
                        <div className="flex flex-1 flex-col gap-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            {policy.status === "Overdue" && <OverdueBadge />}
                            <h3 className="text-sm font-semibold text-foreground">
                              {policy.title}
                            </h3>
                            <Badge
                              variant="secondary"
                              className="text-[11px] font-medium"
                            >
                              {policy.category}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={getStatusStyles(policy.status)}
                            >
                              {policy.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {policy.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                            <span>Assigned to: {policy.assignedTo}</span>
                            <span>
                              {policy.acknowledged}/{policy.total} acknowledged
                            </span>
                            {policy.lastAcknowledged && (
                              <span>Last acknowledged {policy.lastAcknowledged}</span>
                            )}
                            {policy.complianceDeadline && (
                              <span
                                className={cn(
                                  "font-medium",
                                  getDeadlineColorClass(policy.complianceDeadline)
                                )}
                              >
                                Deadline: {policy.complianceDeadline}
                              </span>
                            )}
                            <span className="ml-auto text-[11px] sm:ml-0">
                              Added {policy.dateAdded}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {policy.status !== "Draft" && (
                          <Button variant="outline" size="sm">
                            <Send className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Send Reminder</span>
                          </Button>
                        )}
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => setSelectedPolicy(policy)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">View Details</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Policy</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Assigned To</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPolicies.map((policy, index) => {
                  const progress =
                    policy.total > 0
                      ? (policy.acknowledged / policy.total) * 100
                      : 0
                  return (
                    <TableRow
                      key={policy.id}
                      className={`${
                        index % 2 === 0 ? "bg-background" : "bg-muted/30"
                      } transition-colors hover:bg-muted/60`}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {policy.status === "Overdue" && <OverdueBadge />}
                          <span className="text-sm font-medium text-foreground">
                            {policy.title}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="secondary" className="text-[11px] font-medium">
                          {policy.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusStyles(policy.status)}
                        >
                          {policy.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        {policy.assignedTo}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CircularProgress value={progress} size={32} />
                          <span className="text-xs text-muted-foreground">
                            {policy.acknowledged}/{policy.total}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPolicy(policy)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {filteredPolicies.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No policies found matching your search.
          </div>
        )}
      </div>

      <PolicyDetailsDialog
        policy={selectedPolicy}
        open={!!selectedPolicy}
        onOpenChange={(open) => !open && setSelectedPolicy(null)}
      />

      <Dialog open={auditReportOpen} onOpenChange={setAuditReportOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Compliance Audit Summary</DialogTitle>
          </DialogHeader>
          <div className="overflow-hidden rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Policy Name</TableHead>
                  <TableHead>Completion %</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deadline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditSummaryRows.map((row, index) => (
                  <TableRow
                    key={row.name}
                    className={
                      index % 2 === 0 ? "bg-background" : "bg-muted/30"
                    }
                  >
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>{row.completion}%</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusStyles(row.status as PolicyStatus)}
                      >
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={cn(
                        row.deadline !== "—" &&
                          getDeadlineColorClass(row.deadline)
                      )}
                    >
                      {row.deadline}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" disabled aria-disabled="true">
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
