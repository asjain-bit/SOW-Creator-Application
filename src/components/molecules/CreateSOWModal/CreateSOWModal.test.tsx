import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CreateSOWModal } from './CreateSOWModal'

describe('CreateSOWModal', () => {
  it('renders nothing when closed', () => {
    render(<CreateSOWModal isOpen={false} onClose={vi.fn()} onProceed={vi.fn()} />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('renders modal when open', () => {
    render(<CreateSOWModal isOpen onClose={vi.fn()} onProceed={vi.fn()} />)
    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByText('Create New SOW')).toBeTruthy()
  })

  it('calls onClose when Close button is clicked', () => {
    const onClose = vi.fn()
    render(<CreateSOWModal isOpen onClose={onClose} onProceed={vi.fn()} />)
    fireEvent.click(screen.getByLabelText('Close'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('Create SOW button is disabled when no files uploaded', () => {
    render(<CreateSOWModal isOpen onClose={vi.fn()} onProceed={vi.fn()} />)
    const btn = screen.getByText('Create SOW').closest('button')
    expect(btn?.disabled).toBe(true)
  })

  it('calls onClose on backdrop click', () => {
    const onClose = vi.fn()
    render(<CreateSOWModal isOpen onClose={onClose} onProceed={vi.fn()} />)
    const backdrop = screen.getByRole('dialog').parentElement
    if (backdrop) fireEvent.click(backdrop)
    expect(onClose).toHaveBeenCalled()
  })
})
