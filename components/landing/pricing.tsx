import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

const features = [
  "Unlimited employees",
  "Onboarding checklists",
  "Policy acknowledgements",
  "Compliance tracking",
  "Automatic reminders",
  "Audit-ready reports",
]

export function Pricing() {
  return (
    <section id="pricing" className="bg-muted px-6 py-20">
      <div className="mx-auto max-w-md text-center">
        <h2 className="text-balance text-2xl font-bold text-foreground md:text-3xl">
          Simple, transparent pricing
        </h2>
        <p className="mt-3 text-muted-foreground">
          One plan. Everything included. Cancel anytime.
        </p>
        <Card className="mt-10 border-primary bg-background">
          <CardHeader className="text-center">
            <CardTitle className="text-foreground">Everything Plan</CardTitle>
            <div className="mt-2 flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-foreground">$69</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <ul className="flex flex-col gap-3 text-left">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-foreground">
                  <Check className="h-4 w-4 shrink-0 text-success" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link href="/login" className="w-full">
              <Button size="lg" className="w-full">
                Start 14-day free trial
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground">No credit card required</p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
