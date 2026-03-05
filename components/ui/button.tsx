import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-white hover:bg-primary-hover transition-colors focus-visible:ring-primary',
        destructive:
          'bg-danger text-white hover:bg-danger/90 transition-colors focus-visible:ring-danger/20',
        outline:
          'h-9 border border-border bg-white text-text-secondary hover:bg-neutral-bg transition-colors',
        secondary:
          'bg-neutral-bg text-text-primary hover:bg-border-strong',
        ghost:
          'hover:bg-slate-100 hover:text-slate-900',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 rounded-lg has-[>svg]:px-3',
        sm: 'h-9 rounded-lg gap-1.5 px-4 has-[>svg]:px-3',
        lg: 'h-10 rounded-lg px-6 has-[>svg]:px-4',
        icon: 'size-9 rounded-lg',
        'icon-sm': 'size-8 rounded-lg',
        'icon-lg': 'size-10 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
