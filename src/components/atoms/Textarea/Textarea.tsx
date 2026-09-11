/**
 * Textarea — Atom
 * Renders a multiline text area input primitive using design tokens.
 * Used in: FormField, SettingsPanel
 */

import React from 'react'
import { TextareaProps } from './Textarea.types'

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error = false, className = '', rows = 3, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={`w-full px-3 py-2 text-sm rounded-[var(--radius-md)] bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-placeholder)] border transition-colors focus:outline-none focus:ring-2 disabled:bg-[var(--bg-disabled)] disabled:text-[var(--text-disabled)] disabled:cursor-not-allowed ${
          error
            ? 'border-[var(--status-error-border)] focus:ring-[var(--status-error-border)]'
            : 'border-[var(--border-default)] focus:border-[var(--border-focus)] focus:ring-[var(--border-focus)]'
        } ${className}`}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'
