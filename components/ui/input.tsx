import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-text-primary placeholder:text-text-muted selection:bg-primary-soft selection:text-text-primary border-border h-9 w-full min-w-0 rounded-lg border bg-white px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary',
        'aria-invalid:ring-danger/20 aria-invalid:border-danger',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
