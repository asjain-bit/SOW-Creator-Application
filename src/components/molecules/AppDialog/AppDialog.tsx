/**
 * AppDialog — Molecule
 * Modal dialog window overlay composing Button and Icon primitives.
 * Used in: SettingsPanel, page demo
 */

'use client'

import React, { useEffect } from 'react'
import { Button } from '@/components/atoms/Button'
import { Icon } from '@/components/atoms/Icon'
import { AppDialogProps } from './AppDialog.types'

export const AppDialog: React.FC<AppDialogProps> = ({
  isOpen,
  title,
  description,
  onClose,
  children,
  footer,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-overlay)] backdrop-blur-xs animate-fade-in"
    >
      <div
        className="relative w-full max-w-lg bg-[var(--bg-modal)] rounded-[var(--radius-xl)] border border-[var(--border-default)] shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
          <div>
            <h3 id="dialog-title" className="text-lg font-bold text-[var(--text-primary)]">
              {title}
            </h3>
            {description ? (
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{description}</p>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close dialog"
            className="h-8 w-8 p-0 rounded-full"
          >
            <Icon name="close" size={16} />
          </Button>
        </div>

        {children ? <div className="p-6 overflow-y-auto max-h-[60vh]">{children}</div> : null}

        {footer ? (
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[var(--bg-surface-1)] border-t border-[var(--border-subtle)]">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}
