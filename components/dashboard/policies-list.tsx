"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Plus, Send, Eye, Check, Clock } from "lucide-react"

type PolicyStatus = "Active" | "Draft" | "Overdue"

interface PolicyEmployee {
  name: string
  acknowledged: boolean
}

interface Policy {
  id: number
  name: string
  dateAdded: string
  assignedTo: string
  acknowledged: number
  total: number
  status: PolicyStatus
  employees: PolicyEmployee[]
}

const policies: Policy[] = [
  {
    id: 1,
    name: "Workplace Health & Safety Policy",
    dateAdded: "15 Jan 2026",
    assignedTo: "All staff",
    acknowledged: 14,
    total: 18,
    status: "Active",
    employees: [
      { name: "Sarah Mitchell", acknowledged: true },
      { name: "James Thompson", acknowledged: true },
      { name: "Maria Lopez", acknowledged: true },
      { name: "Tom Bradley", acknowledged: false },
      { name: "Rachel Park", acknowledged: true },
      { name: "Lisa Kim", acknowledged: false },
      { name: "David Chen", acknowledged: true },
      { name: "Emma Wilson", acknowledged: true },
    ],
  },
  {
    id: 2,
    name: "Anti-Discrimination & Harassment Policy",
    dateAdded: "20 Jan 2026",
    assignedTo: "All staff",
    acknowledged: 18,
    total: 18,
    status: "Active",
    employees: [
      { name: "Sarah Mitchell", acknowledged: true },
      { name: "James Thompson", acknowledged: true },
      { name: "Maria Lopez", acknowledged: true },
      { name: "Tom Bradley", acknowledged: true },
    ],
  },
  {
    id: 3,
    name: "Food Safety Procedures",
    dateAdded: "1 Feb 2026",
    assignedTo: "Hospitality",
    acknowledged: 6,
    total: 10,
    status: "Overdue",
    employees: [
      { name: "Maria Lopez", acknowledged: true },
      { name: "Tom Bradley", acknowledged: false },
      { name: "David Chen", acknowledged: true },
      { name: "Ben Nguyen", acknowledged: false },
    ],
  },
  {
    id: 4,
    name: "Privacy & Confidentiality Agreement",
    dateAdded: "10 Feb 2026",
    assignedTo: "Clinic",
    acknowledged: 3,
    total: 4,
    status: "Active",
    employees: [
      { name: "Rachel Park", acknowledged: true },
      { name: "Lisa Kim", acknowledged: true },
      { name: "Sophie Taylor", acknowledged: true },
      { name: "Dr. Mark Allen", acknowledged: false },
    ],
  },
  {
    id: 5,
    name: "Social Media Usage Policy",
    dateAdded: "18 Feb 2026",
    assignedTo: "All staff",
    acknowledged: 0,
    total: 18,
    status: "Draft",
    employees: [],
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

export function PoliciesList() {
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null)

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div />
          <Button>
            <Plus className="h-4 w-4" />
            Add Policy
          </Button>
        </div>
        <div className="flex flex-col gap-3">
          {policies.map((policy) => (
            <Card key={policy.id} className="border-border bg-background">
              <CardContent>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-1 flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">
                        {policy.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className={getStatusStyles(policy.status)}
                      >
                        {policy.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span>Added {policy.dateAdded}</span>
                      <span>Assigned to: {policy.assignedTo}</span>
                      <span>
                        {policy.acknowledged}/{policy.total} acknowledged
                      </span>
                    </div>
                    {policy.total > 0 && (
                      <div className="mt-1.5 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{
                            width: `${(policy.acknowledged / policy.total) * 100}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {policy.status !== "Draft" && (
                      <Button variant="outline" size="sm">
                        <Send className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Send Reminder</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
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
          ))}
        </div>
      </div>

      <Dialog
        open={!!selectedPolicy}
        onOpenChange={(open) => !open && setSelectedPolicy(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">{selectedPolicy?.name}</DialogTitle>
            <DialogDescription>
              {selectedPolicy?.acknowledged}/{selectedPolicy?.total} employees have
              acknowledged this policy.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            {selectedPolicy?.employees.map((emp, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
              >
                <span className="text-sm font-medium text-foreground">{emp.name}</span>
                {emp.acknowledged ? (
                  <div className="flex items-center gap-1.5 text-success">
                    <Check className="h-4 w-4" />
                    <span className="text-xs font-medium">Acknowledged</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs font-medium">Pending</span>
                  </div>
                )}
              </div>
            ))}
            {selectedPolicy &&
              selectedPolicy.employees.some((e) => !e.acknowledged) && (
                <Button className="mt-2">
                  <Send className="h-4 w-4" />
                  Send reminder to pending
                </Button>
              )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
