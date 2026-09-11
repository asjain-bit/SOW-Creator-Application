import { BadgeVariant } from '@/components/atoms/Badge'

export interface ToastProps {
  id?: string
  title: string
  message?: string
  variant?: BadgeVariant
  onDismiss?: () => void
  className?: string
}
