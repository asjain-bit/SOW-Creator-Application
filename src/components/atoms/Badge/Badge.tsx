/**
 * Badge — Atom
 * Renders a small status indicator chip primitive using design tokens.
 * Used in: Toast, KPICard, DataTable
 */

import React from 'react'
import { BadgeProps } from './Badge.types'

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className = '',
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'bg-[var(--status-success-bg)] text-[var(--status-success-text)] border-[var(--status-success-border)]'
      case 'warning':
        return 'bg-[var(--status-warning-bg)] text-[var(--status-warning-text)] border-[var(--status-warning-border)]'
      case 'error':
        return 'bg-[var(--status-error-bg)] text-[var(--status-error-text)] border-[var(--status-error-border)]'
      case 'info':
        return 'bg-[var(--status-info-bg)] text-[var(--status-info-text)] border-[var(--status-info-border)]'
      case 'default':
      default:
        return 'bg-[var(--bg-surface-2)] text-[var(--text-primary)] border-[var(--border-default)]'
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getVariantStyles()} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
