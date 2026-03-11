"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  Bell,
  User,
  Settings,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  FileText,
  UserPlus,
  Clock,
  CheckCheck,
  Menu,
  LayoutDashboard,
  Users,
  ClipboardList,
  ShieldCheck,
  BarChart2,
  TriangleAlert,
  IdCard,
  ClipboardCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { getCertificatesAlertSummary } from "@/lib/certificates-data"

type Notification = {
  id: string
  icon: "check" | "alert" | "file" | "user" | "clock"
  message: string
  timestamp: string
  read: boolean
}

type NavLink = {
  label: string
  href: string
  icon: typeof LayoutDashboard
  badge?: number
  badgeVariant?: "red" | "amber"
}

const initialNotifications: Notification[] = [
  {
    id: "n1",
    icon: "check",
    message: "Sarah acknowledged WHS Policy",
    timestamp: "2 hours ago",
    read: false,
  },
  {
    id: "n2",
    icon: "alert",
    message: "John's certificate expiring in 3 days",
    timestamp: "4 hours ago",
    read: false,
  },
  {
    id: "n3",
    icon: "file",
    message: "New policy 'Code of Conduct' published",
    timestamp: "Yesterday",
    read: false,
  },
  {
    id: "n4",
    icon: "user",
    message: "Emma Wilson completed onboarding step 2",
    timestamp: "Yesterday",
    read: true,
  },
  {
    id: "n5",
    icon: "clock",
    message: "Reminder: 5 pending acknowledgements",
    timestamp: "2 days ago",
    read: true,
  },
]

function NotificationIcon({ type }: { type: Notification["icon"] }) {
  switch (type) {
    case "check":
      return <CheckCircle2 className="h-4 w-4 text-success" />
    case "alert":
      return <AlertTriangle className="h-4 w-4 text-warning" />
    case "file":
      return <FileText className="h-4 w-4 text-primary" />
    case "user":
      return <UserPlus className="h-4 w-4 text-primary" />
    case "clock":
      return <Clock className="h-4 w-4 text-muted-foreground" />
  }
}

function MobileSidebar({
  open,
  onOpenChange,
  onSignOut,
  navLinks,
  certificateTooltip,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSignOut: () => void
  navLinks: NavLink[]
  certificateTooltip: string
}) {
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0" fullScreenOnMobile={false}>
        <SheetHeader className="border-b border-slate-200 px-6 py-5">
          <SheetTitle asChild>
            <Link
              href="/dashboard"
              className="flex items-center gap-2"
              onClick={() => onOpenChange(false)}
            >
              <span className="text-lg font-bold text-slate-900">PeopleDesk</span>
            </Link>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          {navLinks.map((link: NavLink) => {
            const isActive =
              link.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname?.startsWith(link.href)
            const badgeCount = link.badge ?? 0
            const badgeVariant = "badgeVariant" in link ? link.badgeVariant : "red"

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors",
                  isActive
                    ? "bg-primary-soft font-medium text-primary"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <span className="relative shrink-0">
                  <link.icon className="h-4 w-4" />
                  {badgeCount > 0 && (
                    <span
                      title={link.href === "/certificates" ? certificateTooltip : undefined}
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
                {link.label}
              </Link>
            )
          })}
          <div className="mt-4 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() => {
                onOpenChange(false)
                onSignOut()
              }}
              className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-danger transition-colors hover:bg-danger-bg"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}

export function AppTopBar() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [certificateBadge, setCertificateBadge] = useState(0)
  const [certificateTooltip, setCertificateTooltip] = useState("")
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [notifOpen, setNotifOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    const loadBadge = async () => {
      const summary = await getCertificatesAlertSummary()
      setCertificateBadge(summary.totalFlagged)
      setCertificateTooltip(
        `30d: ${summary.dueIn30} | 60d: ${summary.dueIn60} | 90d: ${summary.dueIn90} | Exp: ${summary.expired}`
      )
    }
    void loadBadge()
  }, [])

  const navLinks = [
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

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    )
  }

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const router = useRouter()
  const handleSignOut = async () => {
    await createClient().auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-white">P</span>
            </div>
            <span className="hidden text-lg font-semibold text-slate-900 sm:inline">PeopleDesk</span>
          </Link>
        </div>

        {/* Middle: Navigation Links (hidden on mobile) */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link: NavLink) => {
            const isActive =
              link.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname?.startsWith(link.href)
            const badgeCount = link.badge ?? 0
            const badgeVariant = "badgeVariant" in link ? link.badgeVariant : "red"

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-primary font-medium"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                {link.label}
                {badgeCount > 0 && (
                  <span
                    title={link.href === "/certificates" ? certificateTooltip : undefined}
                    className={cn(
                      "flex h-4 min-w-4 items-center justify-center rounded-full px-1.5 text-[10px] font-medium",
                      badgeVariant === "red"
                        ? "bg-danger text-white"
                        : "bg-warning text-white"
                    )}
                  >
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right: Notifications + Divider + User Avatar with Dropdown */}
        <div className="flex items-center gap-1 sm:gap-2">
          {mounted ? (
            <Popover open={notifOpen} onOpenChange={setNotifOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-9 w-9 rounded-lg hover:bg-slate-100"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-medium text-white">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto px-2 py-1 text-xs text-primary hover:text-primary"
                      onClick={handleMarkAllRead}
                    >
                      <CheckCheck className="mr-1 h-3 w-3" />
                      Mark all as read
                    </Button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto scrollbar-hidden">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50",
                        !notification.read && "bg-primary/5"
                      )}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <NotificationIcon type={notification.icon} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className={cn(
                          "text-sm text-foreground",
                          !notification.read && "font-medium"
                        )}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {notification.timestamp}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="border-t border-border p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-muted-foreground"
                    onClick={() => setNotifOpen(false)}
                  >
                    View all notifications
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 rounded-lg hover:bg-slate-100"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-medium text-white">
                3
              </span>
            </Button>
          )}

          <Separator orientation="vertical" className="hidden h-6 sm:block" />

          {mounted ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-lg p-0 hover:bg-slate-100"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary-soft text-xs font-medium text-primary">
                      AL
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">Alex Lee</p>
                    <p className="text-xs text-muted-foreground">
                      alex.lee@company.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => handleSignOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary-soft text-xs font-medium text-primary">
                AL
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </header>

      <MobileSidebar
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
        onSignOut={handleSignOut}
        navLinks={navLinks}
        certificateTooltip={certificateTooltip}
      />
    </>
  )
}
