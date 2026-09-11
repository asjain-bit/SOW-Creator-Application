/**
 * SiteHeader — Organism
 * Main application navigation header section (logo, links, search, theme toggle, profile).
 * Used in: AppShell, page demo
 */

import React from 'react'
import { Avatar } from '@/components/atoms/Avatar'
import { Icon } from '@/components/atoms/Icon'
import { ThemeToggle } from '@/components/atoms/ThemeToggle'
import { SearchBar } from '@/components/molecules/SearchBar'
import { SiteHeaderProps } from './SiteHeader.types'

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  navItems = [
    { label: 'Dashboard', href: '#', active: true },
    { label: 'Projects', href: '#' },
    { label: 'Settings', href: '#' },
  ],
  onSearch,
  userFallback = 'AS',
  className = '',
}) => {
  return (
    <header
      className={`h-[56px] px-4 bg-[var(--bg-surface-1)] border-b border-[var(--border-default)] flex items-center justify-between gap-4 sticky top-0 z-40 ${className}`}
    >
      <div className="flex items-center gap-6">
        <a href="#" className="flex items-center gap-2 font-serif font-bold text-lg text-[var(--text-primary)]">
          <Icon name="laptop" size={22} className="text-[var(--text-accent)] shrink-0" />
          <span>Acme Corp</span>
        </a>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`px-3 py-1.5 text-xs font-semibold rounded-[var(--radius-md)] transition-colors ${
                item.active
                  ? 'bg-[var(--bg-selected)] text-[var(--text-accent)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="flex-grow max-w-sm hidden sm:block">
        <SearchBar placeholder="Search platform..." onSearch={onSearch} />
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Avatar fallback={userFallback} size="sm" />
      </div>
    </header>
  )
}
