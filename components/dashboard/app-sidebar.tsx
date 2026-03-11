"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { getCertificatesAlertSummary } from "@/lib/certificates-data"
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  ShieldCheck,
  BarChart2,
  FileText,
  TriangleAlert,
  IdCard,
  ClipboardCheck,
} from "lucide-react"

export function AppSidebar() {
  const pathname = usePathname()
  const [certificateBadge, setCertificateBadge] = useState(0)
  const [certificateTooltip, setCertificateTooltip] = useState("")

  useEffect(() => {
    const loadBadge = async () => {
      const summary = await getCertificatesAlertSummary()
      setCertificateBadge(summary.totalFlagged)
      setCertificateTooltip(
        `30d: ${summary.dueIn30} | 60d: ${summary.dueIn60} | 90d: ${summary.dueIn90} | Exp: ${summary.expired}`
      )
    }
    void loadBadge()
  }, [])

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Employees", href: "/employees", icon: Users },
    { label: "Certificates", href: "/certificates", icon: ShieldCheck, badge: certificateBadge, badgeVariant: "red" as const },
    { label: "Policies", href: "/policies", icon: FileText, badge: 0, badgeVariant: "amber" as const },
    { label: "Onboarding", href: "/onboarding", icon: ClipboardList },
    { label: "WHS Incidents", href: "/whs-incidents", icon: TriangleAlert },
    { label: "Right to Work", href: "/right-to-work", icon: IdCard },
    { label: "Fair Work Checklist", href: "/fair-work-checklist", icon: ClipboardCheck },
    { label: "Reports", href: "/reports", icon: BarChart2 },
  ]

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
      <div className="px-6 py-5">
        <span className="text-lg font-bold text-text-primary">PeopleDesk</span>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 px-3">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href)
          const badgeCount = item.badge ?? 0
          const badgeVariant = "badgeVariant" in item ? item.badgeVariant : "red"

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors",
                isActive
                  ? "bg-primary-soft font-medium text-primary"
                  : "text-text-secondary hover:bg-neutral-bg hover:text-text-primary"
              )}
            >
              <span className="relative shrink-0">
                <item.icon className="h-4 w-4" />
                {badgeCount > 0 && (
                  <span
                    title={item.href === "/certificates" ? certificateTooltip : undefined}
                    className={cn(
                      "absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium",
                      badgeVariant === "red"
                        ? "bg-danger text-white"
                        : "bg-warning text-white"
                    )}
                  >
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                )}
              </span>
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-medium text-primary">
            AL
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text-primary">Alex Lee</p>
            <p className="truncate text-xs text-text-muted">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
