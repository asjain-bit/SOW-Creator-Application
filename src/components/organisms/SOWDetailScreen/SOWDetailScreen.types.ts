import type { UploadedFile } from '@/components/molecules/CreateSOWModal'

export type SOWTab = 'overview' | 'form' | 'structure' | 'sow-draft' | 'audit-log'

export interface SectionMember {
  id: string
  name: string
  initials: string
  color: string
}

export interface SectionItem {
  id: string
  type: 'assumption' | 'question'
  text: string
  assignedTo: string // member id
  answered: boolean
  response?: string // answer text shown as thread below the item
}

export interface SOWSection {
  id: string
  title: string
  description?: string
  assignedMembers: string[] // member ids
  items: SectionItem[]
  /** @deprecated use items */
  assumptions: string[]
  /** @deprecated use items */
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
  showGenerateDraft?: boolean
  sowVariant?: 'v1' | 'v2' | 'meridian'
  viewerRole?: 'pmo' | 'contributor'
  currentMemberId?: string
}
