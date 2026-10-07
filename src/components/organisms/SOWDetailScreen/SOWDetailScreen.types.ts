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
  assignedTo: string | string[] // member id(s)
  answered: boolean
  response?: string // answer text shown as thread below the item
  inClientQueue?: boolean // flag for client queue
  isAiGenerated?: boolean
  isEdited?: boolean
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

export type SOWStatus = 'In Progress' | 'Completed' | 'Pending' | 'Not Started' | 'Deactivated' | 'At Risk' | 'On Track'

export interface CommitmentItem {
  id: string
  text: string
  citation?: string
  citationDoc?: string
  citationPage?: number
  citationSection?: string
  citationSnippet?: string
  isManuallyEdited?: boolean
  manuallyEdited?: boolean
}

export interface SOWFormData {
  commitments: CommitmentItem[]
  clientName: string
  clientNameCitation?: string
  description: string
  descriptionCitation?: string
  businessOutcome: string
  businessOutcomeCitation?: string
  importanceValue: string
  importanceValueCitation?: string
  inScope: string
  inScopeCitation?: string
  outOfScope: string
  outOfScopeCitation?: string
  tags: string[]
  otherContext: string
  otherContextCitation?: string
  manuallyEditedFields?: Record<string, boolean>
}

export interface SOWDetailScreenProps {
  sowName?: string
  sowStatus?: SOWStatus
  isDeactivated?: boolean
  uploadedFiles?: UploadedFile[]
  onBack?: () => void
  className?: string
  showGenerateDraft?: boolean
  sowVariant?: 'v1' | 'v2' | 'meridian'
  viewerRole?: 'pmo' | 'contributor' | 'reviewer' | 'admin' | 'client'
  currentMemberId?: string
  sowDeadline?: string
  onReactivateSOW?: () => void
  initialActiveRole?: 'pmo' | 'contributor' | 'reviewer'
  onActiveViewerRoleChange?: (role: 'pmo' | 'contributor' | 'reviewer') => void
}
