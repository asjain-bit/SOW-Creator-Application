import type { Meta, StoryObj } from '@storybook/react'
import { Icon } from './Icon'

const meta: Meta<typeof Icon> = {
  title: 'Atoms/Icon',
  component: Icon,
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'select',
      options: ['sun', 'moon', 'laptop', 'search', 'check', 'alert', 'info', 'close', 'user', 'settings'],
    },
    size: { control: 'number' },
  },
}

export default meta
type Story = StoryObj<typeof Icon>

export const Default: Story = {
  args: {
    name: 'sun',
    size: 24,
  },
}

export const MoonVariant: Story = {
  args: {
    name: 'moon',
    size: 24,
  },
}

export const EdgeCases: Story = {
  args: {
    name: 'search',
    size: 48,
    className: 'text-error',
  },
}
