import type { Meta, StoryObj } from '@storybook/react'
import { Select } from './Select'

const options = [
  { value: 'light', label: 'Light Theme' },
  { value: 'dark', label: 'Dark Theme' },
  { value: 'system', label: 'System Preference' },
]

const meta: Meta<typeof Select> = {
  title: 'Atoms/Select',
  component: Select,
  tags: ['autodocs'],
  argTypes: {
    error: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof Select>

export const Default: Story = {
  args: {
    options,
    defaultValue: 'system',
  },
}

export const ErrorState: Story = {
  args: {
    options,
    error: true,
    defaultValue: 'light',
  },
}

export const EdgeCases: Story = {
  args: {
    options: [
      { value: 'disabled', label: 'Disabled Option', disabled: true },
      { value: 'normal', label: 'Normal Option' },
    ],
    disabled: true,
  },
}
