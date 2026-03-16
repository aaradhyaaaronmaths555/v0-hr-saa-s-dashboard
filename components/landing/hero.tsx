import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20 md:py-24">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 md:flex-row md:gap-14">
        <div className="flex flex-1 flex-col gap-6">
          <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
            HR sorted for your team in minutes
          </h1>
          <p className="max-w-lg text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Track onboarding, policies, and compliance without spreadsheets. Built for small Australian businesses.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/login">
              <Button size="lg" className="h-12 px-8 text-base">
                Start free trial
              </Button>
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              See how it works
            </Link>
          </div>
        </div>
        <div className="flex flex-1 justify-center">
          <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-border shadow-lg">
            <Image
              src="/images/dashboard-mockup.jpg"
              alt="PeopleDesk dashboard showing employee management interface"
              width={600}
              height={400}
              className="h-auto w-full"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
