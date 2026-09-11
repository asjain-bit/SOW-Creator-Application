import type { Meta, StoryObj } from '@storybook/react'
import { Input } from '@/components/atoms/Input'
import { FormField } from './FormField'

const meta: Meta<typeof FormField> = {
  title: 'Molecules/FormField',
  component: FormField,
  tags: ['autodocs'],
  argTypes: {
    required: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof FormField>

export const Default: Story = {
  args: {
    id: 'email',
    label: 'Email Address',
    helperText: 'We will never share your email.',
    required: true,
    children: <Input placeholder="john@example.com" />,
  },
}

export const ErrorState: Story = {
  args: {
    id: 'password',
    label: 'Password',
    error: 'Password must contain at least 8 characters.',
    children: <Input type="password" value="123" />,
  },
}

export const EdgeCases: Story = {
  args: {
    id: 'long-label',
    label: 'Very Long Field Label With Detailed Explanation Of What Information Belongs Here',
    helperText: 'Secondary long helper text explaining compliance guidelines.',
    children: <Input placeholder="Sample" />,
  },
}
