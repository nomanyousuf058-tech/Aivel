// components/ui/Button.tsx
'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'gradient' | 'glass'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

// Create a type that excludes conflicting props for motion.button
type ButtonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  animate?: boolean
  glow?: boolean
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 
  'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag' | 'onDragCapture'
>

const base = 'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden group'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl',
  secondary: 'bg-white/10 hover:bg-white/15 text-white border border-white/15 hover:border-white/25 backdrop-blur-sm',
  ghost: 'bg-transparent hover:bg-white/10 text-white',
  destructive: 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl',
  gradient: 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl',
  glass: 'glass hover:bg-white/10 text-white border border-white/20 hover:border-white/30 backdrop-blur-xl',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-base',
  lg: 'h-12 px-8 text-lg',
  xl: 'h-14 px-10 text-xl',
}

const glowEffects: Record<ButtonVariant, string> = {
  primary: 'hover:shadow-neon-blue',
  secondary: '',
  ghost: '',
  destructive: 'hover:shadow-neon-pink',
  gradient: 'hover:shadow-neon-purple',
  glass: '',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    isLoading,
    leftIcon,
    rightIcon,
    animate = true,
    glow = false,
    children,
    ...props
  }, ref) => {
    const buttonContent = (
      <>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
        
        <div className={cn(
          'flex items-center justify-center transition-opacity duration-300',
          isLoading && 'opacity-0'
        )}>
          {leftIcon && <span className="mr-2 -ml-1">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2 -mr-1">{rightIcon}</span>}
        </div>

        {/* Shimmer effect for gradient buttons */}
        {variant === 'gradient' && (
          <div className="absolute inset-0 -top-1 -bottom-1 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        )}
      </>
    )

    const buttonClassName = cn(
      base,
      variants[variant],
      sizes[size],
      glow && glowEffects[variant],
      className
    )

    if (animate) {
      return (
        <motion.button
          ref={ref}
          className={buttonClassName}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          aria-busy={isLoading}
          {...(props as any)} // Use type assertion to bypass TypeScript conflicts
        >
          {buttonContent}
        </motion.button>
      )
    }

    return (
      <button
        ref={ref}
        className={buttonClassName}
        aria-busy={isLoading}
        {...props}
      >
        {buttonContent}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button