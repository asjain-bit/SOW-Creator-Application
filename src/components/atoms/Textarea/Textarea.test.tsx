import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Textarea } from './Textarea'

describe('Textarea Component', () => {
  it('renders correctly with placeholder', () => {
    render(<Textarea placeholder="Enter description" />)
    expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument()
  })

  it('allows text input', async () => {
    const handleChange = vi.fn()
    render(<Textarea onChange={handleChange} placeholder="Type notes" />)
    const textarea = screen.getByPlaceholderText('Type notes')
    await userEvent.type(textarea, 'Line 1\nLine 2')
    expect(textarea).toHaveValue('Line 1\nLine 2')
    expect(handleChange).toHaveBeenCalled()
  })

  it('applies error styling', () => {
    render(<Textarea error placeholder="Error textarea" />)
    expect(screen.getByPlaceholderText('Error textarea')).toHaveClass(
      'border-[var(--status-error-border)]'
    )
  })
})
