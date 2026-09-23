/**
 * CreateSOWModal Types
 */

export type UploadStatus = 'idle' | 'uploading' | 'complete' | 'error'

export interface UploadedFile {
  id: string
  name: string
  size: string
  type: string
  status: UploadStatus
  progress: number
}

export interface CreateSOWModalProps {
  isOpen: boolean
  onClose: () => void
  /** Called with the uploaded files when user clicks the proceed CTA */
  onProceed: (files: UploadedFile[]) => void
}
