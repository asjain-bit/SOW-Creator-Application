/**
 * DashboardScreen Types
 */

export type SOWStatus = 'Completed' | 'In Progress' | 'Pending' | 'Not Started'

export interface SOWItem {
  id: string
  name: string
  client: string
  lastUpdated: string
  status: SOWStatus
}

export interface DashboardScreenProps {
  /** User name to display in top header and greeting */
  userName?: string
  /** User role label */
  userRole?: string
  /** User initials for avatar badge */
  userInitials?: string
  /** Initial list of SOW items */
  initialSOWs?: SOWItem[]
  /** Callback triggered when user clicks Sign Out button */
  onSignOut?: () => void
  /** Callback triggered when "+ Create SOW" CTA is clicked */
  onCreateSOW?: () => void
  /** Additional CSS class names */
  className?: string
}
