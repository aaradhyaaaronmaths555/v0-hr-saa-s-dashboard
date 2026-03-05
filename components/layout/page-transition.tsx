"use client"

import { usePathname } from "next/navigation"
import type { PropsWithChildren } from "react"

export function PageTransition({ children }: PropsWithChildren) {
  const pathname = usePathname()

  return (
    <div
      key={pathname}
      className="animate-fade-in-up"
    >
      {children}
    </div>
  )
}

