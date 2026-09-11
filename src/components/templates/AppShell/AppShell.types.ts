import React from 'react'

export interface AppShellProps {
  topbar?: React.ReactNode
  leftbar?: React.ReactNode
  main: React.ReactNode
  rightbar?: React.ReactNode
  leftbarCollapsed?: boolean
  onToggleLeftbar?: () => void
  showRightbar?: boolean
  className?: string
}
