import type { Meta, StoryObj } from '@storybook/react'
import { DashboardScreen } from './DashboardScreen'

const meta: Meta<typeof DashboardScreen> = {
  title: 'Organisms/DashboardScreen',
  component: DashboardScreen,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof DashboardScreen>

export const Default: Story = {
  args: {
    userName: 'Ashika',
    userRole: 'PMO',
    userInitials: 'AJ',
  },
}
