import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { PageTransition } from "@/components/layout/page-transition"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-svh bg-background">
      {/* Fixed Left Sidebar */}
      <AppSidebar />

      {/* Content area — ml-64 to account for fixed sidebar on lg+ */}
      <div className="lg:ml-64">
        {/* Main Content */}
        <main className="min-h-svh overflow-y-auto bg-slate-50 pt-14 lg:pt-0">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
    </div>
  )
}
