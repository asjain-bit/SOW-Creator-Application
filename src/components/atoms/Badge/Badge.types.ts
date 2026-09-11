import React from 'react'

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  children: React.ReactNode
}
