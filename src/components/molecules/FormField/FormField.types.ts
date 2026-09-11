import React from 'react'

export interface FormFieldProps {
  id: string
  label: string
  error?: string
  helperText?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}
