import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ThemeToggle } from './ThemeToggle'

describe('ThemeToggle Component', () => {
  it('cycles themes from system -> light -> dark -> system on click', async () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(screen.getByTestId('icon-system')).toBeInTheDocument()

    // Cycle to light
    await userEvent.click(button)
    expect(screen.getByTestId('icon-light')).toBeInTheDocument()

    // Cycle to dark
    await userEvent.click(button)
    expect(screen.getByTestId('icon-dark')).toBeInTheDocument()

    // Cycle back to system
    await userEvent.click(button)
    expect(screen.getByTestId('icon-system')).toBeInTheDocument()
  })
})
