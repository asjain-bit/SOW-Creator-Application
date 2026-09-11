/**
 * KPICard — Molecule
 * Renders a key metric display card composing Badge and Icon primitives.
 * Used in: SettingsPanel, page demo dashboard
 */

import React from 'react'
import { Badge } from '@/components/atoms/Badge'
import { Icon } from '@/components/atoms/Icon'
import { KPICardProps } from './KPICard.types'

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  changeVariant = 'success',
  iconName = 'laptop',
  className = '',
}) => {
  return (
    <div
      className={`p-5 rounded-[var(--radius-xl)] bg-[var(--bg-surface-1)] border border-[var(--border-default)] shadow-xs transition-all hover:border-[var(--border-strong)] flex flex-col justify-between ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
          {title}
        </span>
        <Icon name={iconName} size={20} className="text-[var(--text-accent)] shrink-0" />
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-2">
        <span className="text-2xl font-bold tracking-tight text-[var(--text-primary)] font-serif">
          {value}
        </span>
        {change ? <Badge variant={changeVariant}>{change}</Badge> : null}
      </div>
    </div>
  )
}
