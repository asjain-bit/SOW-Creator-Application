import { BadgeVariant } from '@/components/atoms/Badge'
import { IconName } from '@/components/atoms/Icon'

export interface KPICardProps {
  title: string
  value: string | number
  change?: string
  changeVariant?: BadgeVariant
  iconName?: IconName
  className?: string
}
