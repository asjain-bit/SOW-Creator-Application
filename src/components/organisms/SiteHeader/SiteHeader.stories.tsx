import type { Meta, StoryObj } from '@storybook/react'
import { SiteHeader } from './SiteHeader'

const meta: Meta<typeof SiteHeader> = {
  title: 'Organisms/SiteHeader',
  component: SiteHeader,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof SiteHeader>

export const Default: Story = {
  args: {
    userFallback: 'AK',
  },
}

export const CustomNav: Story = {
  args: {
    navItems: [
      { label: 'Overview', href: '#', active: true },
      { label: 'Analytics', href: '#' },
      { label: 'Integrations', href: '#' },
      { label: 'Billing', href: '#' },
    ],
    userFallback: 'CEO',
  },
}

export const EdgeCases: Story = {
  args: {
    navItems: [],
    userFallback: 'AN',
  },
}
