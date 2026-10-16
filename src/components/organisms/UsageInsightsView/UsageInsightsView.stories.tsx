import type { Meta, StoryObj } from '@storybook/react'
import { UsageInsightsView } from './UsageInsightsView'

const meta: Meta<typeof UsageInsightsView> = {
  title: 'Organisms/UsageInsightsView',
  component: UsageInsightsView,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof UsageInsightsView>

export const Default: Story = {
  args: {
    sows: [
      { id: '1', name: 'Customer Transformation Program', client: 'Acme Corp', readiness: 85 },
      { id: '2', name: 'Procurement Platform Modernization', client: 'Meridian Healthcare', readiness: 62 },
      { id: '3', name: 'Cloud Modernization Initiative', client: 'TechSphere', readiness: 35 },
    ],
  },
}

export const EdgeCases: Story = { args: { sows: [] } }
