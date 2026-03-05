"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle2,
  Clock,
  FileText,
  Shield,
  Calendar,
  AlertTriangle,
  UserPlus,
  Award,
  Upload,
} from "lucide-react"

type OnboardingStatus = "Complete" | "In Progress" | "Not Started"
type ComplianceStatus = "green" | "amber" | "red"

type TimelineEvent = {
  id: string
  type: "policy" | "certificate" | "onboarding" | "added"
  title: string
  date: string
  icon: "check" | "clock" | "award" | "user"
}

export type EmployeeRow = {
  id: string
  name: string
  initials: string
  role: string
  department: string
  startDate: string
  onboardingStatus: OnboardingStatus
  complianceStatus: ComplianceStatus
}

export type EmployeeDetails = {
  id: string
  email: string
  phone: string
  onboardingCompleted: number
  onboardingTotal: number
  policies: {
    name: string
    acknowledged: boolean
  }[]
  certificates: {
    name: string
    expiresOn: string
    daysRemaining: number
    status: "valid" | "expiring" | "expired"
  }[]
  timeline: TimelineEvent[]
}

function StatusBanner({ status }: { status: ComplianceStatus }) {
  const config = {
    green: {
      bg: "bg-success-bg",
      border: "border-success/30",
      icon: CheckCircle2,
      iconColor: "text-success",
      title: "Fully Compliant",
      description: "All policies acknowledged and certificates valid",
    },
    amber: {
      bg: "bg-warning-bg",
      border: "border-warning",
      icon: AlertTriangle,
      iconColor: "text-warning",
      title: "Action Required",
      description: "Some items need attention soon",
    },
    red: {
      bg: "bg-danger-bg",
      border: "border-danger/30",
      icon: AlertTriangle,
      iconColor: "text-danger",
      title: "Overdue Items",
      description: "Immediate action required",
    },
  }

  const { bg, border, icon: Icon, iconColor, title, description } = config[status]

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center gap-3 rounded-xl border ${border} ${bg} px-4 py-3`}
    >
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${bg}`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <div className="flex-1">
        <p className={`text-sm font-medium ${iconColor}`}>{title}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </motion.div>
  )
}

function AnimatedProgress({ value, delay = 0.3 }: { value: number; delay?: number }) {
  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <motion.div
        className="h-full bg-success"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, delay, ease: "easeOut" }}
      />
    </div>
  )
}

function TimelineIcon({ type }: { type: TimelineEvent["icon"] }) {
  switch (type) {
    case "check":
      return <CheckCircle2 className="h-3.5 w-3.5 text-success" />
    case "clock":
      return <Clock className="h-3.5 w-3.5 text-warning" />
    case "award":
      return <Award className="h-3.5 w-3.5 text-primary" />
    case "user":
      return <UserPlus className="h-3.5 w-3.5 text-slate-500" />
  }
}

function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="relative">
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-200" />
      <div className="space-y-4">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="relative flex items-start gap-3 pl-1"
          >
            <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white">
              <TimelineIcon type={event.icon} />
            </div>
            <div className="flex-1 pt-1">
              <p className="text-sm text-slate-700">{event.title}</p>
              <p className="text-xs text-slate-400">{event.date}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

interface EmployeeDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: EmployeeRow | null
  details: EmployeeDetails | null
}

export function EmployeeDrawer({
  open,
  onOpenChange,
  employee,
  details,
}: EmployeeDrawerProps) {
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (open) {
      setActiveTab("overview")
    }
  }, [open])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col overflow-hidden scrollbar-hidden">
        <SheetHeader>
          <SheetTitle>{employee?.name ?? "Employee details"}</SheetTitle>
          <SheetDescription>
            {employee?.role}
            {employee?.department ? ` • ${employee.department}` : null}
          </SheetDescription>
        </SheetHeader>

        {employee && details && (
          <>
            <div className="px-4 pt-2">
              <StatusBanner status={employee.complianceStatus} />
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex flex-1 flex-col overflow-hidden px-4 scrollbar-hidden"
            >
              <TabsList className="w-full">
                <TabsTrigger value="overview" className="flex-1">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="timeline" className="flex-1">
                  Timeline
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="overview"
                className="flex-1 overflow-y-auto pb-4 pt-4 scrollbar-hidden"
              >
                <div className="flex flex-col gap-6 text-sm">
                  <section className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Profile
                    </h3>
                    <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-4 rounded-lg bg-white px-3 py-2">
                        <span className="text-sm text-slate-500">Name</span>
                        <span className="text-sm font-medium text-slate-900">
                          {employee.name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4 rounded-lg bg-white px-3 py-2">
                        <span className="text-sm text-slate-500">Role</span>
                        <span className="text-sm text-slate-700">{employee.role}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 rounded-lg bg-white px-3 py-2">
                        <span className="text-sm text-slate-500">Department</span>
                        <span className="text-sm text-slate-700">
                          {employee.department}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4 rounded-lg bg-white px-3 py-2">
                        <span className="text-sm text-slate-500">Start date</span>
                        <span className="text-sm text-slate-700">
                          {employee.startDate}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4 rounded-lg bg-white px-3 py-2">
                        <span className="text-sm text-slate-500">Email</span>
                        <span className="text-sm text-slate-700">{details.email}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 rounded-lg bg-white px-3 py-2">
                        <span className="text-sm text-slate-500">Phone</span>
                        <span className="text-sm text-slate-700">{details.phone}</span>
                      </div>
                    </div>
                  </section>

                  <section className="my-6 border-t border-slate-100 pt-6 space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Onboarding
                    </h3>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>
                          {details.onboardingCompleted}/{details.onboardingTotal} steps
                          complete
                        </span>
                      </div>
                      <AnimatedProgress
                        value={
                          (details.onboardingCompleted / details.onboardingTotal) * 100
                        }
                      />
                    </div>
                  </section>

                  <section className="my-6 border-t border-slate-100 pt-6 space-y-3">
                    <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <FileText className="h-3.5 w-3.5" />
                      Policies
                    </h3>
                    <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      {details.policies.map((policy) => (
                        <div
                          key={policy.name}
                          className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2"
                        >
                          <span className="text-sm text-slate-700">{policy.name}</span>
                          {policy.acknowledged ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-success-bg px-2.5 py-0.5 text-xs font-medium text-success">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Acknowledged
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-warning-bg px-2.5 py-0.5 text-xs font-medium text-warning">
                              <Clock className="h-3.5 w-3.5" />
                              Pending
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="my-6 border-t border-slate-100 pt-6 space-y-3">
                    <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <Shield className="h-3.5 w-3.5" />
                      Certificates
                    </h3>
                    <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      {details.certificates.map((cert) => {
                        const daysPillClasses =
                          cert.daysRemaining < 0
                            ? "rounded-full bg-danger-bg px-2.5 py-0.5 text-xs font-medium text-danger"
                            : cert.daysRemaining > 60
                              ? "rounded-full bg-success-bg px-2.5 py-0.5 text-xs font-medium text-success"
                              : cert.daysRemaining > 30
                                ? "rounded-full bg-warning-bg px-2.5 py-0.5 text-xs font-medium text-warning"
                                : "rounded-full bg-danger-bg px-2.5 py-0.5 text-xs font-medium text-danger"
                        const statusClasses =
                          cert.status === "valid"
                            ? "rounded-full bg-success-bg px-2.5 py-0.5 text-xs font-medium text-success"
                            : cert.status === "expiring"
                              ? "rounded-full bg-warning-bg px-2.5 py-0.5 text-xs font-medium text-warning"
                              : "rounded-full bg-danger-bg px-2.5 py-0.5 text-xs font-medium text-danger"
                        return (
                          <div
                            key={cert.name}
                            className="flex flex-col gap-2 rounded-lg bg-white px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-medium text-slate-700">
                                {cert.name}
                              </span>
                              <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                                <Calendar className="h-3.5 w-3.5" />
                                Expires {cert.expiresOn}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={daysPillClasses}>
                                {cert.daysRemaining < 0
                                  ? "Expired"
                                  : `${cert.daysRemaining} days`}
                              </span>
                              <span className={statusClasses}>
                                {cert.status === "valid"
                                  ? "Valid"
                                  : cert.status === "expiring"
                                    ? "Expiring"
                                    : "Expired"}
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 gap-1.5 text-xs"
                              >
                                <Upload className="h-3 w-3" />
                                Upload Renewal
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </section>
                </div>
              </TabsContent>

              <TabsContent
                value="timeline"
                className="flex-1 overflow-y-auto pb-4 pt-4 scrollbar-hidden"
              >
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Activity History
                  </h3>
                  <Timeline events={details.timeline} />
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}

        <SheetFooter>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline">
              Send Reminder
            </Button>
            <Button type="button">Edit Employee</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default EmployeeDrawer
