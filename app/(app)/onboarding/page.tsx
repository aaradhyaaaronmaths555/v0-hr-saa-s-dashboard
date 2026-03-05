"use client"

import { Fragment, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, ChevronDown, ChevronRight } from "lucide-react"
import {
  ONBOARDING_EMPLOYEES,
  type OnboardingEmployee,
} from "@/lib/onboarding-data"
import {
  ONBOARDING_STEPS,
  TOTAL_STEPS,
  allStepsComplete,
  gatesComplete,
} from "@/lib/onboarding-steps"
import { cn } from "@/lib/utils"

function StatusBadge({ employee }: { employee: OnboardingEmployee }) {
  if (allStepsComplete(employee.completedStepIds)) {
    return (
      <Badge className="rounded-full bg-success-bg px-2.5 py-0.5 text-xs font-medium text-success">
        Cleared for Duty ✓
      </Badge>
    )
  }
  if (!gatesComplete(employee.completedStepIds)) {
    return (
      <Badge variant="destructive" className="w-fit rounded-full px-2.5 py-0.5 text-xs">
        Not Cleared for Duty
      </Badge>
    )
  }
  return (
    <Badge variant="warning" className="w-fit rounded-full px-2.5 py-0.5 text-xs">
      In Progress
    </Badge>
  )
}

function StepChecklist({ employee }: { employee: OnboardingEmployee }) {
  return (
    <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Compliance Checklist
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {ONBOARDING_STEPS.map((step) => {
          const done = employee.completedStepIds.includes(step.id)
          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2",
                done ? "bg-white" : "bg-slate-100/80"
              )}
            >
              {done ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-slate-300" />
              )}
              <div className="min-w-0 flex-1">
                <span className={cn("text-sm", done ? "text-slate-700" : "text-slate-500")}>
                  {step.label}
                </span>
                {step.isGate && (
                  <span className="ml-1.5 text-xs text-danger">(required)</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="mx-auto flex max-w-6xl flex-col space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Onboarding</h1>
        <p className="mt-1 text-sm text-slate-600">
          Compliance gate checklist — all 8 steps must be complete before staff
          are cleared for duty. Steps 2–4 (NDIS, Police Check, First Aid) are
          non-negotiable.
        </p>
      </div>

      <Card>
        <CardHeader className="border-b border-[#E2E8F0] pb-4">
          <CardTitle className="text-base font-semibold text-slate-800">
            Employee Compliance Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10" />
                <TableHead>Employee</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {ONBOARDING_EMPLOYEES.map((employee) => {
                const completed = employee.completedStepIds.length
                const progress = (completed / TOTAL_STEPS) * 100
                const isExpanded = expandedId === employee.id

                return (
                  <Fragment key={employee.id}>
                    <TableRow
                      key={employee.id}
                      className="cursor-pointer transition-colors hover:bg-slate-50"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : employee.id)
                      }
                    >
                      <TableCell className="w-10">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            setExpandedId(isExpanded ? null : employee.id)
                          }}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-slate-500" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-slate-500" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary-soft text-xs font-medium text-primary">
                              {employee.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              {employee.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              Started {employee.startDate}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {employee.role}
                      </TableCell>
                      <TableCell>
                        <div className="flex min-w-[140px] items-center gap-3">
                          <Progress value={progress} className="h-2 flex-1" />
                          <span className="text-sm font-medium text-slate-700">
                            {completed}/{TOTAL_STEPS}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge employee={employee} />
                      </TableCell>
                      <TableCell className="w-10" />
                    </TableRow>
                    {isExpanded && (
                      <TableRow key={`${employee.id}-expand`} className="hover:bg-transparent">
                        <TableCell colSpan={6} className="bg-slate-50/50 p-4">
                          <StepChecklist employee={employee} />
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
