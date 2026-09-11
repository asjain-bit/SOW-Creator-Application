import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '@/components/atoms/Button'
import { AppDialog } from './AppDialog'

const meta: Meta<typeof AppDialog> = {
  title: 'Molecules/AppDialog',
  component: AppDialog,
  tags: ['autodocs'],
  argTypes: {
    isOpen: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof AppDialog>

export const Default: Story = {
  args: {
    isOpen: true,
    title: 'Edit Profile Details',
    description: 'Update your display name and email preferences.',
    children: <p className="text-sm text-[var(--text-secondary)]">Profile settings form controls fit here.</p>,
    footer: (
      <>
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary">Save Changes</Button>
      </>
    ),
  },
}

export const EdgeCases: Story = {
  args: {
    isOpen: true,
    title: 'Long Scrollable Content Dialog',
    description: 'Demonstrates vertical scrolling within dialog body.',
    children: (
      <div className="space-y-4 text-sm text-[var(--text-secondary)]">
        {Array.from({ length: 10 }).map((_, i) => (
          <p key={i}>Paragraph {i + 1}: Detailed compliance notice text block for review.</p>
        ))}
      </div>
    ),
  },
}
