import { EmployeesTable } from "@/components/dashboard/employees-table"

export default function EmployeesPage() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Employees</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your team members, onboarding status, and compliance.
        </p>
      </div>
      <EmployeesTable />
    </div>
  )
}

