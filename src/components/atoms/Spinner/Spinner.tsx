/**
 * Spinner — Atom
 * Renders an animated loading indicator primitive.
 * Used in: Button, AppDialog, DataTable
 */

import React from 'react'
import { SpinnerProps } from './Spinner.types'

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className = '',
  ...props
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4 border-2'
      case 'lg':
        return 'w-8 h-8 border-3'
      case 'md':
      default:
        return 'w-6 h-6 border-2'
    }
  }

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`inline-block border-current border-t-transparent text-[var(--action-primary-bg-default)] rounded-full animate-spin ${getSizeStyles()} ${className}`}
      data-testid="spinner"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}
