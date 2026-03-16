import { UserPlus, ClipboardList, Bell } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Add your team",
    description: "Import your employees or add them one by one. It takes seconds, not hours.",
  },
  {
    number: "02",
    icon: ClipboardList,
    title: "Assign tasks, policies, or training",
    description:
      "Create onboarding checklists, assign policies to acknowledge, and track training requirements.",
  },
  {
    number: "03",
    icon: Bell,
    title: "Track and send reminders",
    description:
      "See who's done, who's overdue, and send automatic reminders. Never chase people again.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-balance text-2xl font-bold text-foreground md:text-3xl">
            How it works
          </h2>
          <p className="mt-3 text-muted-foreground">
            Get your team set up in three simple steps.
          </p>
        </div>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-primary/20">{step.number}</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <step.icon className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
