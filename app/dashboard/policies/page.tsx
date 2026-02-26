import { PoliciesList } from "@/components/dashboard/policies-list"

export default function PoliciesPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Policies</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create and manage workplace policies. Track employee acknowledgements.
        </p>
      </div>
      <PoliciesList />
    </div>
  )
}
