"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { getCertificatesBadgeCount } from "@/lib/certificates-data"
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  ShieldCheck,
  BarChart2,
  FileText,
} from "lucide-react"

const PENDING_ACKNOWLEDGEMENTS_COUNT = 14

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Employees", href: "/employees", icon: Users },
  { label: "Certificates", href: "/certificates", icon: ShieldCheck, badge: getCertificatesBadgeCount(), badgeVariant: "red" as const },
  { label: "Policies", href: "/policies", icon: FileText, badge: PENDING_ACKNOWLEDGEMENTS_COUNT, badgeVariant: "amber" as const },
  { label: "Onboarding", href: "/onboarding", icon: ClipboardList },
  { label: "Reports", href: "/reports", icon: BarChart2 },
]

export function AppSidebar() {
  const pathname = usePathname()

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
          const badgeCount = "badge" in item ? item.badge : 0
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
