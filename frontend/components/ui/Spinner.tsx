import * as React from 'react'
import { cn } from '@/lib/utils'

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number
  stroke?: number
}

export default function Spinner({ size = 20, stroke = 2, className, ...props }: SpinnerProps) {
  return (
    <div
      className={cn('border-white border-t-transparent rounded-full animate-spin', className)}
      style={{ width: size, height: size, borderWidth: stroke }}
      {...props}
    />
  )
}





