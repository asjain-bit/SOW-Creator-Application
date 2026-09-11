import type { Meta, StoryObj } from '@storybook/react'
import { Toast } from './Toast'

const meta: Meta<typeof Toast> = {
  title: 'Molecules/Toast',
  component: Toast,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'warning', 'error', 'info', 'default'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Toast>

export const Default: Story = {
  args: {
    title: 'Notification',
    message: 'This is an informative toast notification message.',
    variant: 'info',
  },
}

export const Success: Story = {
  args: {
    title: 'Changes Saved',
    message: 'Your profile has been updated successfully.',
    variant: 'success',
  },
}

export const ErrorState: Story = {
  args: {
    title: 'Connection Error',
    message: 'Unable to reach the server. Please check your network.',
    variant: 'error',
  },
}

export const EdgeCases: Story = {
  args: {
    title: 'Toast without message',
    variant: 'warning',
  },
}
