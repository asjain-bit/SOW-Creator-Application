import type { Meta, StoryObj } from '@storybook/react'
import { SOWDetailScreen } from './SOWDetailScreen'

const meta: Meta<typeof SOWDetailScreen> = {
  title: 'Organisms/SOWDetailScreen',
  component: SOWDetailScreen,
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof SOWDetailScreen>

export const Default: Story = {
  args: {
    sowName: 'Meridian Healthcare — Procurement Platform',
    sowStatus: 'In Progress',
    uploadedFiles: [
      {
        id: '1',
        name: 'SOW_Draft_v1.pdf',
        size: '2.4 MB',
        type: 'pdf',
        status: 'complete',
        progress: 100,
      },
      {
        id: '2',
        name: 'Requirements.docx',
        size: '1.1 MB',
        type: 'docx',
        status: 'complete',
        progress: 100,
      },
    ],
  },
}

export const NoFiles: Story = {
  args: {
    sowName: 'Tech Modernization Initiative',
    sowStatus: 'Not Started',
    uploadedFiles: [],
  },
}

export const Completed: Story = {
  args: {
    sowName: 'Retail Analytics Platform',
    sowStatus: 'Completed',
    uploadedFiles: [
      {
        id: '1',
        name: 'Final_SOW.pdf',
        size: '3.8 MB',
        type: 'pdf',
        status: 'complete',
        progress: 100,
      },
    ],
  },
}
