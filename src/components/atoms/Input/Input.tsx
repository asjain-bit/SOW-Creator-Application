/**
 * Input — Atom
 * Renders a single interactive form input element using design tokens.
 * Used in: FormField, SearchBar, SettingsPanel
 */

import React from 'react'
import { InputProps } from './Input.types'

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error = false, className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full h-10 px-3 py-2 text-sm rounded-[var(--radius-md)] bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-placeholder)] border transition-colors focus:outline-none focus:ring-2 disabled:bg-[var(--bg-disabled)] disabled:text-[var(--text-disabled)] disabled:cursor-not-allowed ${
          error
            ? 'border-[var(--status-error-border)] focus:ring-[var(--status-error-border)]'
            : 'border-[var(--border-default)] focus:border-[var(--border-focus)] focus:ring-[var(--border-focus)]'
        } ${className}`}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'
