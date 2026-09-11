/**
 * LoginScreen Storybook Stories
 */

import type { Meta, StoryObj } from '@storybook/react'
import { LoginScreen } from './LoginScreen'

const meta: Meta<typeof LoginScreen> = {
  title: 'Organisms/LoginScreen',
  component: LoginScreen,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof LoginScreen>

export const DefaultWelcomeStep: Story = {
  args: {
    showDevControls: true,
  },
}

export const VerifyOtpStep: Story = {
  args: {
    initialStep: 'otp',
    initialEmail: 'ashika.jain@company.com',
    showDevControls: true,
  },
}

export const PostOtpLoaderState: Story = {
  args: {
    initialStep: 'loader',
    showDevControls: true,
  },
}

export const SignedInSuccessState: Story = {
  args: {
    initialStep: 'success',
    initialEmail: 'ashika.jain@company.com',
    showDevControls: true,
  },
}
