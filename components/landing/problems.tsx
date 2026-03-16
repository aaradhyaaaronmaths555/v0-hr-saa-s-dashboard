import { ShieldAlert, FileText, HelpCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const problems = [
  {
    icon: ShieldAlert,
    title: "Staff miss compliance training",
    description:
      "Important certifications expire and training deadlines slip through the cracks without a proper system.",
  },
  {
    icon: FileText,
    title: "Onboarding is done on paper or email",
    description:
      "New starters get lost in a mess of PDFs, printed forms, and scattered email chains.",
  },
  {
    icon: HelpCircle,
    title: "You don't know who signed what policy",
    description:
      "When audits come, you're scrambling to prove that staff acknowledged key workplace policies.",
  },
]

export function Problems() {
  return (
    <section className="bg-muted px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-balance text-2xl font-bold text-foreground md:text-3xl">
            Sound familiar?
          </h2>
          <p className="mt-3 text-muted-foreground">
            These are the problems small business owners face every day.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {problems.map((problem) => (
            <Card key={problem.title} className="border-border bg-background">
              <CardContent className="flex flex-col gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <problem.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{problem.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {problem.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
