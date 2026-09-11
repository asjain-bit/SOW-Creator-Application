import type { Preview } from '@storybook/react'
import React from 'react'
import { ThemeProvider } from '../src/contexts/ThemeContext'
import '../src/app/globals.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="p-6 bg-[var(--bg-default)] text-[var(--text-primary)] min-h-screen">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
}

export default preview
