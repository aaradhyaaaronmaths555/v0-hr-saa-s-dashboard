"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Send, Check, Clock, History } from "lucide-react"

interface PolicyEmployee {
  name: string
  acknowledged: boolean
  dateAcknowledged?: string
}

export interface AuditTrailEntry {
  staffName: string
  action: "Acknowledged" | "Reminded"
  dateTime: string
}

type PolicyStatus = "Active" | "Draft" | "Overdue"

export interface Policy {
  id: number
  title: string
  description: string
  dateAdded: string
  category: string
  assignedTo: string
  acknowledged: number
  total: number
  status: PolicyStatus
  employees: PolicyEmployee[]
  complianceDeadline?: string
  lastAcknowledged?: string
  auditTrail?: AuditTrailEntry[]
}

interface PolicyDetailsDialogProps {
  policy: Policy | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PolicyDetailsDialog({
  policy,
  open,
  onOpenChange,
}: PolicyDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">{policy?.title}</DialogTitle>
          {policy && (
            <DialogDescription asChild>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{policy.description}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="text-[11px] font-medium">
                    {policy.category}
                  </Badge>
                  <span>Added {policy.dateAdded}</span>
                  <span>Assigned to: {policy.assignedTo}</span>
                </div>
              </div>
            </DialogDescription>
          )}
        </DialogHeader>
        {policy && (
          <div className="flex flex-col gap-4">
            <Tabs defaultValue="acknowledgements" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="acknowledgements">Acknowledgements</TabsTrigger>
                <TabsTrigger value="audit-trail">
                  <History className="h-3.5 w-3.5" />
                  Audit Trail
                </TabsTrigger>
              </TabsList>

              <TabsContent value="acknowledgements" className="mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                      <span>
                        Acknowledged ({policy.employees.filter((e) => e.acknowledged).length})
                      </span>
                    </div>
                    <div className="space-y-2 rounded-xl border border-border bg-muted/40 p-3">
                      {policy.employees
                        .filter((e) => e.acknowledged)
                        .map((emp) => (
                          <div
                            key={emp.name}
                            className="flex items-center justify-between gap-2 rounded-lg bg-background px-3 py-2"
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-foreground">
                                {emp.name}
                              </span>
                              {emp.dateAcknowledged && (
                                <span className="text-xs text-muted-foreground">
                                  Acknowledged {emp.dateAcknowledged}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-success">
                              <Check className="h-4 w-4" />
                              <span className="text-xs font-medium">Done</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                      <span>
                        Pending ({policy.employees.filter((e) => !e.acknowledged).length})
                      </span>
                    </div>
                    <div className="space-y-2 rounded-xl border border-border bg-muted/40 p-3">
                      {policy.employees
                        .filter((e) => !e.acknowledged)
                        .map((emp) => (
                          <div
                            key={emp.name}
                            className="flex items-center justify-between gap-2 rounded-lg bg-background px-3 py-2"
                          >
                            <span className="text-sm font-medium text-foreground">
                              {emp.name}
                            </span>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span className="text-xs font-medium">Pending</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="audit-trail" className="mt-4">
                {policy.auditTrail && policy.auditTrail.length > 0 ? (
                  <div className="overflow-hidden rounded-xl border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead>Staff name</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Date and time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {policy.auditTrail.map((entry, index) => (
                          <TableRow
                            key={`${entry.staffName}-${entry.dateTime}-${index}`}
                            className={
                              index % 2 === 0 ? "bg-background" : "bg-muted/30"
                            }
                          >
                            <TableCell className="font-medium">
                              {entry.staffName}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  entry.action === "Acknowledged"
                                    ? "bg-success/10 text-success border-success/20"
                                    : "bg-muted text-muted-foreground border-border"
                                }
                              >
                                {entry.action}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {entry.dateTime}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="rounded-xl border border-border bg-muted/30 py-8 text-center text-sm text-muted-foreground">
                    No audit trail entries yet.
                  </p>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-end">
              {policy.employees.some((e) => !e.acknowledged) && (
                <Button type="button">
                  <Send className="h-4 w-4" />
                  Send Reminder to Pending
                </Button>
              )}
              <Button type="button" variant="outline">
                Download Report
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default PolicyDetailsDialog
