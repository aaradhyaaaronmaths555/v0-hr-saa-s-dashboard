import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex h-6 items-center justify-center rounded-full border px-2.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-[color,background-color,border-color] overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-primary/20 bg-primary-soft text-primary [a&]:hover:bg-primary-soft/80',
        secondary:
          'border-border bg-neutral-bg text-neutral [a&]:hover:bg-border-strong',
        destructive:
          'border-danger/20 bg-danger-bg text-danger [a&]:hover:bg-danger-bg/80',
        outline:
          'border border-border bg-transparent text-text-secondary [a&]:hover:bg-neutral-bg',
        success:
          'border-success/20 bg-success-bg text-success [a&]:hover:bg-success-bg/80',
        warning:
          'border-warning/20 bg-warning-bg text-warning [a&]:hover:bg-warning-bg/80',
        neutral:
          'border-border bg-neutral-bg text-neutral [a&]:hover:bg-border-strong',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
