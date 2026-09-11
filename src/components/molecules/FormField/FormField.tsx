/**
 * FormField — Molecule
 * Wraps an input primitive (Input, Select, Textarea) with label, helper text, and error handling.
 * Used in: SettingsPanel, AppDialog
 */

import React from 'react'
import { FormFieldProps } from './FormField.types'

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  error,
  helperText,
  required = false,
  children,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      <label
        htmlFor={id}
        className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center justify-between"
      >
        <span>
          {label}
          {required ? <span className="text-[var(--text-error)] ml-1">*</span> : null}
        </span>
      </label>

      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<{ id?: string; error?: boolean }>, {
            id,
            error: !!error || (children.props as { error?: boolean }).error,
          })
        : children}

      {error ? (
        <p className="text-xs text-[var(--text-error)] font-medium mt-0.5" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{helperText}</p>
      ) : null}
    </div>
  )
}
