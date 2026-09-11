import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AppDialog } from './AppDialog'

describe('AppDialog Component', () => {
  it('does not render when isOpen is false', () => {
    render(<AppDialog isOpen={false} title="Hidden" onClose={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders title, description, children, and footer when isOpen is true', () => {
    render(
      <AppDialog
        isOpen={true}
        title="Confirm Action"
        description="Are you sure?"
        onClose={vi.fn()}
        footer={<button>Confirm</button>}
      >
        <p>Dialog Body Content</p>
      </AppDialog>
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Confirm Action')).toBeInTheDocument()
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
    expect(screen.getByText('Dialog Body Content')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
  })

  it('calls onClose when close button or Escape key is pressed', async () => {
    const handleClose = vi.fn()
    render(<AppDialog isOpen={true} title="Closeable" onClose={handleClose} />)
    await userEvent.click(screen.getByRole('button', { name: /close dialog/i }))
    expect(handleClose).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(handleClose).toHaveBeenCalledTimes(2)
  })
})
