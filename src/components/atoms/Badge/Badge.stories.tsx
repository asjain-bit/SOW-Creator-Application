import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './Badge'

const meta: Meta<typeof Badge> = {
  title: 'Atoms/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'warning', 'error', 'info', 'default'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Badge>

export const Default: Story = {
  args: {
    children: 'Default Badge',
    variant: 'default',
  },
}

export const Success: Story = {
  args: {
    children: 'Active',
    variant: 'success',
  },
}

export const ErrorState: Story = {
  args: {
    children: 'Failed',
    variant: 'error',
  },
}

export const EdgeCases: Story = {
  args: {
    children: 'Very Long Status Text Label',
    variant: 'warning',
  },
}
