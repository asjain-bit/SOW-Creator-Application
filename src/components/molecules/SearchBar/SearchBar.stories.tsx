import type { Meta, StoryObj } from '@storybook/react'
import { SearchBar } from './SearchBar'

const meta: Meta<typeof SearchBar> = {
  title: 'Molecules/SearchBar',
  component: SearchBar,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof SearchBar>

export const Default: Story = {
  args: {
    placeholder: 'Search documentation...',
  },
}

export const Controlled: Story = {
  args: {
    value: 'Pre-filled search term',
  },
}

export const EdgeCases: Story = {
  args: {
    placeholder: 'Very wide search bar container mode',
    className: 'max-w-full',
  },
}
