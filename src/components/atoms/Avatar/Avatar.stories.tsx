import type { Meta, StoryObj } from '@storybook/react'
import { Avatar } from './Avatar'

const meta: Meta<typeof Avatar> = {
  title: 'Atoms/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Avatar>

export const Default: Story = {
  args: {
    fallback: 'AK',
    size: 'md',
  },
}

export const WithImage: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    alt: 'Profile',
    fallback: 'PR',
  },
}

export const EdgeCases: Story = {
  args: {
    src: 'https://broken-link.example.com/404.jpg',
    fallback: 'FB',
    size: 'lg',
  },
}
