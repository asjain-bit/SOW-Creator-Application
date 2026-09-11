/**
 * ThemeToggle — Atom
 * Interactive toggle button that cycles theme mode: light -> dark -> system.
 * Used in: SiteHeader, AppShell, SettingsPanel
 */

'use client'

import React from 'react'
import { Icon } from '@/components/atoms/Icon'
import { useTheme } from '@/contexts/ThemeContext'
import { ThemeToggleProps } from './ThemeToggle.types'

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  ...props
}) => {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const handleCycleTheme = () => {
    if (theme === 'light') setTheme('dark')
    else if (theme === 'dark') setTheme('system')
    else setTheme('light')
  }

  const renderIcon = () => {
    if (theme === 'system') {
      return <Icon name="laptop" size={18} data-testid="icon-system" />
    }
    if (resolvedTheme === 'dark') {
      return <Icon name="moon" size={18} data-testid="icon-dark" />
    }
    return <Icon name="sun" size={18} data-testid="icon-light" />
  }

  return (
    <button
      onClick={handleCycleTheme}
      aria-label={`Current theme: ${theme}. Click to switch theme.`}
      title={`Theme: ${theme}`}
      className={`inline-flex items-center justify-center p-2 rounded-[var(--radius-md)] bg-[var(--bg-surface-2)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border-default)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] ${className}`}
      {...props}
    >
      {renderIcon()}
    </button>
  )
}
