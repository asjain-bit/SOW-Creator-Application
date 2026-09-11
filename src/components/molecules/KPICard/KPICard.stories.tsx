import type { Meta, StoryObj } from '@storybook/react'
import { KPICard } from './KPICard'

const meta: Meta<typeof KPICard> = {
  title: 'Molecules/KPICard',
  component: KPICard,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof KPICard>

export const Default: Story = {
  args: {
    title: 'Monthly Recurring Revenue',
    value: '$48,250',
    change: '+12.5%',
    changeVariant: 'success',
    iconName: 'laptop',
  },
}

export const WarningState: Story = {
  args: {
    title: 'Error Rate',
    value: '2.4%',
    change: '+0.8%',
    changeVariant: 'error',
    iconName: 'alert',
  },
}

export const EdgeCases: Story = {
  args: {
    title: 'Active Sessions Without Change Badge',
    value: '1,892',
    iconName: 'user',
  },
}
