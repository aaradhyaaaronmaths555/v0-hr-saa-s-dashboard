"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { getCertificatesAlertSummary } from "@/lib/certificates-data"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
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
  LogOut,
  Menu,
} from "lucide-react"

export function AppSidebar() {
  const pathname = usePathname()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [certificateBadge, setCertificateBadge] = useState(0)
  const [certificateTooltip, setCertificateTooltip] = useState("")
  const [displayName, setDisplayName] = useState("Admin")
  const [displayRole, setDisplayRole] = useState("Admin")
  const [displayInitials, setDisplayInitials] = useState("AD")

  function initialsFromName(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return "AD"
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }

  function fallbackNameFromEmail(email: string | null | undefined) {
    if (!email) return "Admin"
    const local = email.split("@")[0] ?? ""
    if (!local) return "Admin"
    return local
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  }

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

  useEffect(() => {
    const loadCurrentUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const metadata = (user.user_metadata ?? {}) as Record<string, unknown>
      const maybeFullName =
        typeof metadata.full_name === "string"
          ? metadata.full_name
          : typeof metadata.name === "string"
            ? metadata.name
            : null
      const nextName = (maybeFullName ?? "").trim() || fallbackNameFromEmail(user.email)
      setDisplayName(nextName)
      setDisplayInitials(initialsFromName(nextName))

      const roleValue = metadata.role
      if (typeof roleValue === "string" && roleValue.trim()) {
        setDisplayRole(roleValue)
      }
    }
    void loadCurrentUser()
  }, [])

  const handleSignOut = async () => {
    window.location.assign("/auth/signout")
  }

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
    <>
      {/* Mobile/Tablet top bar */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-white/95 px-3 py-2 backdrop-blur lg:hidden">
        <div className="mx-auto flex h-10 w-full max-w-7xl items-center justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-primary">
              <span className="text-xs font-bold text-primary-foreground">P</span>
            </div>
            <span className="truncate text-base font-semibold text-text-primary">PeopleDesk</span>
          </div>

          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="h-9 px-2.5">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Open navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[88vw] max-w-sm p-0">
              <SheetHeader className="border-b border-border px-4 py-4">
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-1 flex-col gap-1 px-3 py-3">
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
                      onClick={() => setMobileNavOpen(false)}
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
                              badgeVariant === "red" ? "bg-danger text-white" : "bg-warning text-white"
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
              <div className="border-t border-border px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-medium text-primary">
                    {displayInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">{displayName}</p>
                    <p className="truncate text-xs text-text-muted">{displayRole}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4 w-full justify-start gap-2"
                  onClick={() => void handleSignOut()}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Desktop sidebar */}
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
                        badgeVariant === "red" ? "bg-danger text-white" : "bg-warning text-white"
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
              {displayInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">{displayName}</p>
              <p className="truncate text-xs text-text-muted">{displayRole}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="mt-4 w-full justify-start gap-2"
            onClick={() => void handleSignOut()}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>
    </>
  )
}
