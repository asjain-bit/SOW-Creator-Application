import type { Meta, StoryObj } from '@storybook/react'
import { AppShell } from './AppShell'

const meta: Meta<typeof AppShell> = {
  title: 'Templates/AppShell',
  component: AppShell,
  tags: ['autodocs'],
  argTypes: {
    leftbarCollapsed: { control: 'boolean' },
    showRightbar: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof AppShell>

export const Default: Story = {
  args: {
    topbar: <div className="p-4 bg-[var(--bg-surface-1)] border-b border-[var(--border-default)] font-bold">Top Bar Slot</div>,
    leftbar: <div className="p-4">Leftbar Nav Slot</div>,
    main: <div className="p-6">Main Content Area Slot</div>,
    rightbar: <div className="p-4">Rightbar Widget Slot</div>,
  },
}

export const LeftbarCollapsed: Story = {
  args: {
    ...Default.args,
    leftbarCollapsed: true,
  },
}

export const HideRightbar: Story = {
  args: {
    ...Default.args,
    showRightbar: false,
  },
}

export const EdgeCases: Story = {
  args: {
    main: <div className="p-4 font-bold text-error">AppShell with only main slot populated</div>,
  },
}
