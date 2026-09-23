import type { UploadedFile } from '@/components/molecules/CreateSOWModal'

export type SOWTab = 'overview' | 'form' | 'structure' | 'sow-draft' | 'audit-log'

export interface SOWSection {
  id: string
  title: string
  description?: string
  assumptions: string[]
  questions: string[]
}

export type SOWStatus = 'In Progress' | 'Completed' | 'Pending' | 'Not Started'

export interface CommitmentItem {
  id: string
  text: string
}

export interface SOWFormData {
  commitments: CommitmentItem[]
  clientName: string
  description: string
  businessOutcome: string
  importanceValue: string
  inScope: string
  outOfScope: string
  tags: string[]
  otherContext: string
}

export interface SOWDetailScreenProps {
  sowName?: string
  sowStatus?: SOWStatus
  uploadedFiles?: UploadedFile[]
  onBack?: () => void
  className?: string
}
