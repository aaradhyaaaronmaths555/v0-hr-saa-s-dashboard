import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { UserPlus, FileUp, FilePlus } from "lucide-react"

const actions = [
  {
    label: "Add Employee",
    icon: UserPlus,
    href: "/employees",
  },
  {
    label: "Upload Certificate",
    icon: FileUp,
    href: "/certificates",
  },
  {
    label: "Create Policy",
    icon: FilePlus,
    href: "/policies",
  },
]

export function QuickActions() {
  return (
    <div className="flex items-center gap-2">
      <span className="mr-1 text-sm font-medium text-slate-500">
        Quick Actions
      </span>
      {actions.map((action) => (
        <Tooltip key={action.label}>
          <TooltipTrigger asChild>
            <Button asChild type="button" variant="outline" size="icon" className="h-9 w-9">
              <Link href={action.href}>
                <action.icon className="h-4 w-4" />
                <span className="sr-only">{action.label}</span>
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8}>
            {action.label}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}
