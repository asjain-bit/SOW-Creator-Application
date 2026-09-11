/**
 * Toast — Molecule
 * Renders an inline notification message popup composing Icon and Button primitives.
 * Used in: AppShell, SettingsPanel, page demo
 */

import React from 'react'
import { Button } from '@/components/atoms/Button'
import { Icon, IconName } from '@/components/atoms/Icon'
import { ToastProps } from './Toast.types'

export const Toast: React.FC<ToastProps> = ({
  title,
  message,
  variant = 'info',
  onDismiss,
  className = '',
}) => {
  const getIconName = (): IconName => {
    switch (variant) {
      case 'success':
        return 'check'
      case 'warning':
      case 'error':
        return 'alert'
      case 'info':
      case 'default':
      default:
        return 'info'
    }
  }

  const getIconColorClass = () => {
    switch (variant) {
      case 'success':
        return 'text-[var(--text-success)]'
      case 'warning':
        return 'text-[var(--text-warning)]'
      case 'error':
        return 'text-[var(--text-error)]'
      case 'info':
      case 'default':
      default:
        return 'text-[var(--text-info)]'
    }
  }

  return (
    <div
      role="status"
      className={`flex items-start gap-3 p-4 rounded-[var(--radius-lg)] bg-[var(--bg-surface-1)] border border-[var(--border-default)] shadow-md text-[var(--text-primary)] w-full max-w-sm ${className}`}
    >
      <Icon name={getIconName()} size={18} className={`mt-0.5 shrink-0 ${getIconColorClass()}`} />
      <div className="flex-grow min-w-0">
        <h4 className="text-sm font-semibold leading-tight text-[var(--text-primary)]">
          {title}
        </h4>
        {message ? (
          <p className="text-xs text-[var(--text-secondary)] mt-1">{message}</p>
        ) : null}
      </div>
      {onDismiss ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          aria-label="Dismiss toast"
          className="h-6 w-6 p-0 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
        >
          <Icon name="close" size={14} />
        </Button>
      ) : null}
    </div>
  )
}
