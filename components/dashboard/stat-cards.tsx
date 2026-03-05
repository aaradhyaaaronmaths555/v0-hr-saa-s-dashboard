"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { ShieldAlert, UserX, FileWarning, ShieldCheck } from "lucide-react"

// Compliance-first metrics (dummy data — replace with real API)
const complianceStats = {
  certificatesExpiringSoon: 5,
  certificatesNextExpiryDays: 12,
  staffNotOnboarded: 2,
  policiesAwaitingAcknowledgement: 14,
  auditReadyScore: 87,
}

function MotionNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (isInView) {
      const duration = 1500
      const startTime = Date.now()
      const startValue = 0

      const animate = () => {
        const now = Date.now()
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        const current = Math.round(startValue + (value - startValue) * easeOutQuart)
        setDisplayValue(current)
        if (progress < 1) requestAnimationFrame(animate)
      }
      requestAnimationFrame(animate)
    }
  }, [isInView, value])

  return <span ref={ref}>{displayValue}</span>
}

const cards = [
  {
    label: "Certificates Expiring Soon",
    sublabel: `Next expires in ${complianceStats.certificatesNextExpiryDays} days`,
    value: complianceStats.certificatesExpiringSoon,
    suffix: "in next 30 days",
    icon: ShieldAlert,
    iconColor: "text-amber-700",
    iconBg: "bg-amber-50",
  },
  {
    label: "Staff Not Yet Onboarded",
    sublabel: complianceStats.staffNotOnboarded > 0 ? "Requires action" : "All staff onboarded",
    value: complianceStats.staffNotOnboarded,
    suffix: complianceStats.staffNotOnboarded === 1 ? "person" : "people",
    icon: UserX,
    iconColor: complianceStats.staffNotOnboarded > 0 ? "text-red-700" : "text-green-700",
    iconBg: complianceStats.staffNotOnboarded > 0 ? "bg-red-50" : "bg-green-50",
  },
  {
    label: "Policies Awaiting Acknowledgement",
    sublabel: "Staff have not yet signed",
    value: complianceStats.policiesAwaitingAcknowledgement,
    suffix: "pending",
    icon: FileWarning,
    iconColor: "text-red-700",
    iconBg: "bg-red-50",
    showRedDot: true,
  },
  {
    label: "Audit Ready Score",
    sublabel: "Overall compliance",
    value: complianceStats.auditReadyScore,
    suffix: "compliant",
    icon: ShieldCheck,
    iconColor: "text-green-700",
    iconBg: "bg-green-50",
    isPercentage: true,
  },
] as const

export function StatCards() {
  return (
    <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <Card className="relative min-h-[120px] overflow-hidden border-slate-200 transition-all duration-200 hover:shadow-md">
            <CardContent className="flex items-start justify-between gap-4 p-6">
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-sm font-medium leading-tight text-slate-500">
                  {card.label}
                </span>
                <span className="flex flex-wrap items-baseline gap-x-1.5 text-2xl font-bold text-slate-900">
                  {!card.isPercentage && card.showRedDot && card.value > 0 && (
                    <span className="relative inline-flex h-2 w-2 shrink-0 self-center" title="Action required">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                    </span>
                  )}
                  <MotionNumber value={card.value} />
                  {card.suffix && (
                    <span className="text-base font-medium text-slate-500">
                      {card.isPercentage ? "% " : ""}{card.suffix}
                    </span>
                  )}
                </span>
                <span className="text-xs text-slate-400">{card.sublabel}</span>
              </div>
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.iconBg}`}
                aria-hidden="true"
              >
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

export default StatCards
