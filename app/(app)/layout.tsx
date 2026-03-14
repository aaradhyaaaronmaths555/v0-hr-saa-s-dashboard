import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { AppTopBar } from "@/components/layout/app-top-bar"
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
        <AppTopBar />

        {/* Main Content */}
        <main className="min-h-[calc(100vh-4rem)] overflow-y-auto bg-slate-50">
          <div className="mx-auto max-w-7xl px-8 py-8">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
    </div>
  )
}
