"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ShieldCheck, Clock, FileText, Send, FileDown } from "lucide-react"
import { cn } from "@/lib/utils"

// Dummy data for Compliance Summary
const COMPLIANCE_ROWS = [
  { employee: "Sarah Mitchell", onboarding: "Complete", certsStatus: "Valid", policies: "3/3", overall: "Compliant" },
  { employee: "James Thompson", onboarding: "In Progress", certsStatus: "Expiring", policies: "2/3", overall: "Action Needed" },
  { employee: "Maria Lopez", onboarding: "Complete", certsStatus: "Valid", policies: "3/3", overall: "Compliant" },
  { employee: "Tom Bradley", onboarding: "Not Started", certsStatus: "Expired", policies: "0/2", overall: "Non-Compliant" },
  { employee: "Rachel Park", onboarding: "Complete", certsStatus: "Valid", policies: "3/3", overall: "Compliant" },
  { employee: "Lisa Kim", onboarding: "In Progress", certsStatus: "Expiring", policies: "2/3", overall: "Action Needed" },
  { employee: "David Chen", onboarding: "Complete", certsStatus: "Expiring", policies: "2/2", overall: "Action Needed" },
  { employee: "Emma Wilson", onboarding: "In Progress", certsStatus: "Expired", policies: "1/2", overall: "Non-Compliant" },
]

// Dummy data for Certificate Expiry (sorted by urgency)
const CERT_EXPIRY_ROWS = [
  { employee: "David Chen", certificate: "NDIS Worker Screening", expiryDate: "02 Oct 2025", daysLeft: 12 },
  { employee: "James Thompson", certificate: "NDIS Worker Screening", expiryDate: "21 Nov 2025", daysLeft: 42 },
  { employee: "Lisa Kim", certificate: "First Aid", expiryDate: "20 Nov 2025", daysLeft: 48 },
  { employee: "Sarah Mitchell", certificate: "First Aid", expiryDate: "14 Mar 2026", daysLeft: 320 },
  { employee: "Maria Lopez", certificate: "Food Safety", expiryDate: "08 Jan 2027", daysLeft: 680 },
]

// Dummy data for Policy Acknowledgement
const POLICY_ACK_ROWS = [
  { policy: "Workplace Health & Safety", acknowledged: 14, total: 18, pending: 4 },
  { policy: "Privacy Policy", acknowledged: 16, total: 18, pending: 2 },
  { policy: "Code of Conduct", acknowledged: 12, total: 18, pending: 6 },
  { policy: "Anti-Bullying Policy", acknowledged: 7, total: 12, pending: 5 },
  { policy: "Food Safety Policy", acknowledged: 6, total: 10, pending: 4 },
]

function formatLastGenerated(ms: number | null) {
  if (!ms) return "Never"
  const d = new Date(ms)
  return d.toLocaleString("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export default function ReportsPage() {
  const [expandedReport, setExpandedReport] = useState<"compliance" | "certificates" | "policies" | null>(null)
  const [certDaysFilter, setCertDaysFilter] = useState<30 | 60 | 90>(30)
  const [lastGenerated, setLastGenerated] = useState<{
    compliance: number | null
    certificates: number | null
    policies: number | null
  }>({ compliance: null, certificates: null, policies: null })

  const handleGenerate = (report: "compliance" | "certificates" | "policies") => {
    setExpandedReport((prev) => (prev === report ? null : report))
    setLastGenerated((prev) => ({
      ...prev,
      [report]: Date.now(),
    }))
  }

  const getOverallBadgeVariant = (overall: string): "success" | "warning" | "destructive" => {
    if (overall === "Compliant") return "success"
    if (overall === "Action Needed") return "warning"
    return "destructive"
  }

  const getDaysLeftClass = (days: number) => {
    if (days < 0) return "text-danger"
    if (days <= 30) return "text-warning"
    return "text-slate-500"
  }

  const filteredCertRows = CERT_EXPIRY_ROWS.filter(
    (r) => r.daysLeft <= certDaysFilter && r.daysLeft >= 0
  ).sort((a, b) => a.daysLeft - b.daysLeft)

  const handleExportAuditReport = () => {
    const w = window.open("/reports/audit-export?print=1", "_blank", "width=900,height=800")
    if (w) w.focus()
  }

  return (
    <div className="flex w-full flex-col space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Compliance Reports</h1>
          <p className="mt-1 text-sm text-slate-600">
            Generate and export audit-ready reports for your aged care facility
          </p>
        </div>
        <Button onClick={handleExportAuditReport} className="gap-2 shrink-0">
          <FileDown className="h-4 w-4" />
          Export Audit Report
        </Button>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {/* 1. Compliance Summary Report */}
        <Card className="flex flex-col">
          <CardContent className="flex flex-1 flex-col gap-4 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-soft">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-slate-900">
                  Compliance Summary Report
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Full compliance status for all staff — certificates, policies,
                  and onboarding
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Last generated: {formatLastGenerated(lastGenerated.compliance)}
            </p>
            <Button
              className="w-full"
              onClick={() => handleGenerate("compliance")}
            >
              Generate Report
            </Button>
            {expandedReport === "compliance" && (
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Employee</TableHead>
                        <TableHead>Onboarding</TableHead>
                        <TableHead>Certs Status</TableHead>
                        <TableHead>Policies</TableHead>
                        <TableHead>Overall</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {COMPLIANCE_ROWS.map((row) => (
                        <TableRow key={row.employee}>
                          <TableCell className="font-medium text-slate-700">{row.employee}</TableCell>
                          <TableCell className="text-slate-600">{row.onboarding}</TableCell>
                          <TableCell className="text-slate-600">{row.certsStatus}</TableCell>
                          <TableCell className="text-slate-600">{row.policies}</TableCell>
                          <TableCell>
                            <Badge variant={getOverallBadgeVariant(row.overall)}>
                              {row.overall}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 2. Certificate Expiry Report */}
        <Card className="flex flex-col border-border bg-background shadow-sm">
          <CardContent className="flex flex-1 flex-col gap-4 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-warning/10">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground">
                  Certificate Expiry Report
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  All certificates expiring in the next 30, 60, or 90 days
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Last generated: {formatLastGenerated(lastGenerated.certificates)}
            </p>
            <div className="flex rounded-lg border border-border p-1">
              {([30, 60, 90] as const).map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setCertDaysFilter(days)}
                  className={cn(
                    "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    certDaysFilter === days
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {days} days
                </button>
              ))}
            </div>
            <Button
              className="w-full"
              onClick={() => handleGenerate("certificates")}
            >
              Generate Report
            </Button>
            {expandedReport === "certificates" && (
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Employee</TableHead>
                        <TableHead>Certificate</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead>Days Left</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCertRows.length > 0 ? (
                        filteredCertRows.map((row) => (
                          <TableRow key={`${row.employee}-${row.certificate}`}>
                            <TableCell className="font-medium text-slate-700">{row.employee}</TableCell>
                            <TableCell className="text-slate-600">{row.certificate}</TableCell>
                            <TableCell className="text-slate-600">{row.expiryDate}</TableCell>
                            <TableCell className={cn("font-medium", getDaysLeftClass(row.daysLeft))}>
                              {row.daysLeft} days
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="py-8 text-center text-sm text-slate-500">
                            No certificates expiring in the next {certDaysFilter} days
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 3. Policy Acknowledgement Report */}
        <Card className="flex flex-col">
          <CardContent className="flex flex-1 flex-col gap-4 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-soft">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-slate-900">
                  Policy Acknowledgement Report
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  See who has and hasn&apos;t acknowledged each policy
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Last generated: {formatLastGenerated(lastGenerated.policies)}
            </p>
            <Button
              className="w-full"
              onClick={() => handleGenerate("policies")}
            >
              Generate Report
            </Button>
            {expandedReport === "policies" && (
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Policy</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Pending</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {POLICY_ACK_ROWS.map((row) => (
                        <TableRow key={row.policy}>
                          <TableCell className="font-medium text-slate-700">{row.policy}</TableCell>
                          <TableCell className="text-slate-600">
                            {row.acknowledged}/{row.total}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {row.pending} pending
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                <Button variant="outline" size="sm" className="w-full">
                  <Send className="h-4 w-4" />
                  Send Reminder to Pending
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
