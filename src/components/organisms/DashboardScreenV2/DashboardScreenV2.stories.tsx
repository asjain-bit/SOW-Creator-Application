import type { Meta, StoryObj } from '@storybook/react'
import { DashboardScreenV2 } from './DashboardScreenV2'

const meta: Meta<typeof DashboardScreenV2> = {
  title: 'Organisms/DashboardScreenV2',
  component: DashboardScreenV2,
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof DashboardScreenV2>

export const Default: Story = {
  args: {
    userName: 'Ashika',
    userRole: 'PMO',
    userInitials: 'AJ',
  },
}

export const EmptyState: Story = {
  args: {
    userName: 'Ashika',
    userRole: 'PMO',
    userInitials: 'AJ',
    initialSOWs: [],
  },
}
