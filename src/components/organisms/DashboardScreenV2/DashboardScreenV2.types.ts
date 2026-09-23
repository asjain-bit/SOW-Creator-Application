/**
 * DashboardScreenV2 Types
 */
import type React from 'react'
import type { UploadedFile } from '@/components/molecules/CreateSOWModal'

export type SOWStatus = 'Completed' | 'In Progress' | 'Pending' | 'Not Started'

export interface SOWItem {
  id: string
  name: string
  client: string
  createdBy: string
  createdDate: string
  lastUpdated: string
  status: SOWStatus
}

export interface KPIItem {
  label: string
  value: string | number
  iconBg: string
  iconColor: string
  subLabel: string
  subValue: string
  trend?: '↗' | '↘' | null
  trendColor?: string
}

export type ActiveNav = 'dashboard' | 'my-sows' | 'templates' | 'analytics' | 'notifications'

export interface DashboardScreenV2Props {
  userName?: string
  userRole?: string
  userInitials?: string
  userImage?: string
  initialSOWs?: SOWItem[]
  onSignOut?: () => void
  onCreateSOW?: () => void
  onProceedToSOW?: (files: UploadedFile[]) => void
  activeNav?: ActiveNav
  contentOverride?: React.ReactNode
  className?: string
  onNavHome?: () => void
  onNavAllSOWs?: () => void
  onOpenSOWV2?: () => void
}
