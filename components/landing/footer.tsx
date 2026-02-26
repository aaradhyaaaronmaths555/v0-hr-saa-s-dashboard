import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-16 text-center">
        <h2 className="text-balance text-2xl font-bold text-foreground md:text-3xl">
          Get started today
        </h2>
        <p className="max-w-md text-muted-foreground">
          14 days free. No credit card required. Set up your team in minutes.
        </p>
        <Link href="/login">
          <Button size="lg" className="h-12 px-8 text-base">
            Start free trial
          </Button>
        </Link>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <span className="text-xs font-bold text-primary-foreground">P</span>
            </div>
            <span className="text-sm font-medium text-foreground">PeopleDesk</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Built for small Australian businesses.
          </p>
        </div>
      </div>
    </footer>
  )
}
