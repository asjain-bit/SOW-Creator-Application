/**
 * SettingsPanel — Organism
 * Self-contained settings management section composing FormField, Input, Select, Button, and Toast.
 * Used in: AppShell, page demo
 */

'use client'

import React, { useState } from 'react'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Select } from '@/components/atoms/Select'
import { ThemeToggle } from '@/components/atoms/ThemeToggle'
import { AppDialog } from '@/components/molecules/AppDialog'
import { FormField } from '@/components/molecules/FormField'
import { Toast } from '@/components/molecules/Toast'
import { SettingsPanelProps } from './SettingsPanel.types'

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  initialName = 'Ashika Agent',
  initialEmail = 'ashika@example.com',
  onSave,
  className = '',
}) => {
  const [name, setName] = useState(initialName)
  const [email, setEmail] = useState(initialEmail)
  const [notifications, setNotifications] = useState('all')
  const [showToast, setShowToast] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setShowToast(true)
    onSave?.({ name, email })
    setIsSaving(false)
  }

  return (
    <div className={`p-6 rounded-[var(--radius-xl)] bg-[var(--bg-surface-1)] border border-[var(--border-default)] shadow-xs space-y-6 ${className}`}>
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <h2 className="text-xl font-bold font-serif text-[var(--text-primary)]">
            Account Preferences
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Manage your personal details, theme mode, and notification channels.
          </p>
        </div>
        <ThemeToggle />
      </div>

      {showToast ? (
        <Toast
          title="Settings Saved"
          message="Your account preferences have been successfully updated."
          variant="success"
          onDismiss={() => setShowToast(false)}
        />
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField id="settings-name" label="Full Name" required>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>

        <FormField id="settings-email" label="Email Address" required helperText="Used for system alerts">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormField>

        <FormField id="settings-notifications" label="Notification Frequency">
          <Select
            value={notifications}
            onChange={(e) => setNotifications(e.target.value)}
            options={[
              { value: 'all', label: 'All Notifications (Instant)' },
              { value: 'daily', label: 'Daily Digest' },
              { value: 'none', label: 'Mute All' },
            ]}
          />
        </FormField>

        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => setShowDialog(true)}
          >
            Reset Preferences
          </Button>

          <Button type="submit" variant="primary" isLoading={isSaving}>
            Save Changes
          </Button>
        </div>
      </form>

      <AppDialog
        isOpen={showDialog}
        title="Reset Account Preferences?"
        description="This will restore default settings for notifications and theme choices."
        onClose={() => setShowDialog(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setName('Ashika Agent')
                setEmail('ashika@example.com')
                setNotifications('all')
                setShowDialog(false)
                setShowToast(true)
              }}
            >
              Confirm Reset
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-secondary)]">
          Are you sure you want to proceed with resetting your profile preferences?
        </p>
      </AppDialog>
    </div>
  )
}
