import type { Meta, StoryObj } from '@storybook/react'
import { CreateSOWModal } from './CreateSOWModal'

const meta: Meta<typeof CreateSOWModal> = {
  title: 'Molecules/CreateSOWModal',
  component: CreateSOWModal,
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof CreateSOWModal>

export const Open: Story = {
  args: { isOpen: true, onClose: () => {}, onProceed: () => {} },
}

export const Closed: Story = {
  args: { isOpen: false, onClose: () => {}, onProceed: () => {} },
}
