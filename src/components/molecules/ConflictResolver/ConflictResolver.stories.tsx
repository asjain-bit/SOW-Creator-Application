import type { Meta, StoryObj } from '@storybook/react'
import { ConflictResolver } from './ConflictResolver'
import { buildDocumentQuestions } from './ConflictResolver.utils'

const names = ['Synthetic_MSA.pdf', 'Synthetic_SOW_Draft.docx']

const meta: Meta<typeof ConflictResolver> = {
  title: 'Molecules/ConflictResolver',
  component: ConflictResolver,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ConflictResolver>

export const Default: Story = {
  args: {
    isOpen: true,
    fileNames: names,
    questions: buildDocumentQuestions(names),
    onComplete: () => {},
    onClose: () => {},
  },
}
