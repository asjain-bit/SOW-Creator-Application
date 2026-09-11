import type { Meta, StoryObj } from '@storybook/react'
import { Textarea } from './Textarea'

const meta: Meta<typeof Textarea> = {
  title: 'Atoms/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  argTypes: {
    error: { control: 'boolean' },
    disabled: { control: 'boolean' },
    rows: { control: 'number' },
  },
}

export default meta
type Story = StoryObj<typeof Textarea>

export const Default: Story = {
  args: {
    placeholder: 'Write long text here...',
    rows: 3,
  },
}

export const ErrorState: Story = {
  args: {
    placeholder: 'Invalid text area input',
    error: true,
    value: 'Some invalid details',
  },
}

export const EdgeCases: Story = {
  args: {
    disabled: true,
    value: 'Readonly / Disabled content display',
  },
}
