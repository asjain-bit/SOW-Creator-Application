/**
 * DashboardScreenV2 Types
 */
import type React from 'react'
import type { UploadedFile } from '@/components/molecules/CreateSOWModal'

export type SOWStatus =
  | 'Completed'
  | 'In Progress'
  | 'Pending'
  | 'Not Started'
  | 'On Track'
  | 'At Risk'
  | 'Deactivated'

export interface SOWItem {
  id: string
  name: string
  client: string
  createdBy: string
  createdDate: string
  lastUpdated: string
  status: SOWStatus
  readiness?: number
  totalQuestions?: number
  openQuestions?: number
  overdueQuestions?: number
  reviewComments?: number
  approval?: string
  workflowStage?: string
  dueDate?: string
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

export type ActiveNav =
  | 'dashboard'
  | 'my-sows'
  | 'audit-log'
  | 'templates'
  | 'analytics'
  | 'notifications'
  | 'agents'
  | 'user-directory'
  | 'section-templates'

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
  onNavAuditLog?: () => void
  onOpenSOWV2?: () => void
  onOpenSOWContributor?: () => void
}
