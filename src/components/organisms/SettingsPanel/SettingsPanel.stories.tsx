import type { Meta, StoryObj } from '@storybook/react'
import { SettingsPanel } from './SettingsPanel'

const meta: Meta<typeof SettingsPanel> = {
  title: 'Organisms/SettingsPanel',
  component: SettingsPanel,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof SettingsPanel>

export const Default: Story = {
  args: {
    initialName: 'Jane Doe',
    initialEmail: 'jane.doe@example.com',
  },
}

export const EdgeCases: Story = {
  args: {
    initialName: 'A Very Long Custom User Display Name Exceeding Standard Width Boundaries',
    initialEmail: 'user.with.extremely.long.email.address.for.testing@subdomain.domain.co.uk',
  },
}
