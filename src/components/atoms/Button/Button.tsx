/**
 * Button — Atom
 * Renders an interactive action button using design tokens.
 * Used in: SearchBar, FormField, Toast, AppDialog, SiteHeader, SettingsPanel
 */

import React from 'react'
import { ButtonProps } from './Button.types'

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  className = '',
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-[var(--bg-surface-2)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border-default)]'
      case 'destructive':
        return 'bg-[var(--action-destructive-bg-default)] text-[var(--action-destructive-text)] hover:bg-[var(--action-destructive-bg-hover)]'
      case 'ghost':
        return 'bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
      case 'primary':
      default:
        return 'bg-[var(--action-primary-bg-default)] text-[var(--action-primary-text)] hover:bg-[var(--action-primary-bg-hover)] active:bg-[var(--action-primary-bg-pressed)]'
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'h-8 px-3 text-xs'
      case 'lg':
        return 'h-12 px-6 text-base'
      case 'md':
      default:
        return 'h-10 px-4 text-sm'
    }
  }

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center font-medium rounded-[var(--radius-md)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] disabled:opacity-50 disabled:cursor-not-allowed ${getVariantStyles()} ${getSizeStyles()} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" data-testid="button-spinner" />
      ) : null}
      {children}
    </button>
  )
}
