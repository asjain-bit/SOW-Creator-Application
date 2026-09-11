/**
 * AppShell — Template
 * Main application layout skeleton structure providing topbar, leftbar, main, and rightbar slot regions.
 * Used in: src/app/page.tsx
 */

import React from 'react'
import { AppShellProps } from './AppShell.types'

export const AppShell: React.FC<AppShellProps> = ({
  topbar,
  leftbar,
  main,
  rightbar,
  leftbarCollapsed = false,
  showRightbar = true,
  className = '',
}) => {
  return (
    <div className={`min-h-screen flex flex-col bg-[var(--bg-default)] text-[var(--text-primary)] ${className}`}>
      {topbar ? <div className="h-[56px] shrink-0">{topbar}</div> : null}

      <div className="flex flex-grow overflow-hidden">
        {leftbar ? (
          <aside
            data-testid="app-shell-leftbar"
            className={`transition-all duration-200 border-r border-[var(--border-default)] bg-[var(--bg-sidebar)] shrink-0 ${
              leftbarCollapsed ? 'w-[48px]' : 'w-[165px]'
            }`}
          >
            {leftbar}
          </aside>
        ) : null}

        <main className="flex-grow overflow-y-auto p-6 bg-[var(--bg-default)]" data-testid="app-shell-main">
          {main}
        </main>

        {rightbar && showRightbar ? (
          <aside
            data-testid="app-shell-rightbar"
            className="w-[280px] border-l border-[var(--border-default)] bg-[var(--bg-surface-1)] p-4 shrink-0 overflow-y-auto hidden lg:block"
          >
            {rightbar}
          </aside>
        ) : null}
      </div>
    </div>
  )
}
