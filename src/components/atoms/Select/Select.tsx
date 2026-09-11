/**
 * Select — Atom
 * Renders a standard native select dropdown primitive using design tokens.
 * Used in: FormField, SettingsPanel, DataTable
 */

import React from 'react'
import { SelectProps } from './Select.types'

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, error = false, className = '', ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`w-full h-10 px-3 py-2 text-sm rounded-[var(--radius-md)] bg-[var(--bg-input)] text-[var(--text-primary)] border transition-colors focus:outline-none focus:ring-2 disabled:bg-[var(--bg-disabled)] disabled:text-[var(--text-disabled)] disabled:cursor-not-allowed ${
          error
            ? 'border-[var(--status-error-border)] focus:ring-[var(--status-error-border)]'
            : 'border-[var(--border-default)] focus:border-[var(--border-focus)] focus:ring-[var(--border-focus)]'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
    )
  }
)

Select.displayName = 'Select'
