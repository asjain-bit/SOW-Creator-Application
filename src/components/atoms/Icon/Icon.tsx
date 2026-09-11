/**
 * Icon — Atom
 * Renders an inline vector icon primitive using lucide-react.
 * Used in: Button, Badge, ThemeToggle, SearchBar, Toast, KPICard, SiteHeader, DataTable
 */

import React from 'react'
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  Laptop,
  Moon,
  Search,
  Settings,
  Sun,
  User,
  X,
} from 'lucide-react'
import { IconProps } from './Icon.types'

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  className = '',
  ...props
}) => {
  const numericSize = typeof size === 'number' ? size : parseInt(size, 10) || 20

  const getLucideIcon = () => {
    switch (name) {
      case 'sun':
        return Sun
      case 'moon':
        return Moon
      case 'laptop':
        return Laptop
      case 'search':
        return Search
      case 'check':
        return Check
      case 'alert':
        return AlertCircle
      case 'info':
        return Info
      case 'close':
        return X
      case 'user':
        return User
      case 'settings':
        return Settings
      case 'chevron-left':
        return ChevronLeft
      case 'chevron-right':
        return ChevronRight
      case 'arrow-up':
        return ArrowUp
      case 'arrow-down':
        return ArrowDown
      default:
        return null
    }
  }

  const LucideComponent = getLucideIcon()
  if (!LucideComponent) return null

  return (
    <LucideComponent
      size={numericSize}
      strokeWidth={2}
      className={`inline-block ${className}`}
      data-testid={`icon-${name}`}
      {...props}
    />
  )
}
