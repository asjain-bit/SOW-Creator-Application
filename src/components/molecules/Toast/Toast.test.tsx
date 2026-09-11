import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Toast } from './Toast'

describe('Toast Component', () => {
  it('renders title and message correctly for all variants', () => {
    const { rerender } = render(<Toast title="Info Toast" variant="info" />)
    expect(screen.getByText('Info Toast')).toBeInTheDocument()

    rerender(<Toast title="Success Toast" variant="success" message="Success details" />)
    expect(screen.getByText('Success Toast')).toBeInTheDocument()
    expect(screen.getByText('Success details')).toBeInTheDocument()

    rerender(<Toast title="Warning Toast" variant="warning" />)
    expect(screen.getByText('Warning Toast')).toBeInTheDocument()

    rerender(<Toast title="Error Toast" variant="error" />)
    expect(screen.getByText('Error Toast')).toBeInTheDocument()
  })

  it('calls onDismiss when close button is clicked', async () => {
    const handleDismiss = vi.fn()
    render(<Toast title="Warning" onDismiss={handleDismiss} />)
    const closeBtn = screen.getByRole('button', { name: /dismiss toast/i })
    await userEvent.click(closeBtn)
    expect(handleDismiss).toHaveBeenCalledTimes(1)
  })
})
