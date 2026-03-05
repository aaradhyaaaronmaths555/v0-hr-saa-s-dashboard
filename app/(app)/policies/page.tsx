import { Suspense } from "react"
import { PoliciesList } from "@/components/dashboard/policies-list"
import { PoliciesListSkeleton } from "@/components/skeletons"

export default function PoliciesPage() {
  return (
    <div className="flex flex-col space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Policies</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage company policies and track acknowledgements.
        </p>
      </div>
      <Suspense fallback={<PoliciesListSkeleton />}>
        <PoliciesList />
      </Suspense>
    </div>
  )
}

