import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Input } from './Input'

describe('Input Component', () => {
  it('renders correctly with placeholder', () => {
    render(<Input placeholder="Enter username" />)
    const input = screen.getByPlaceholderText('Enter username')
    expect(input).toBeInTheDocument()
  })

  it('handles user typing', async () => {
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} placeholder="Type here" />)
    const input = screen.getByPlaceholderText('Type here')
    await userEvent.type(input, 'Hello')
    expect(input).toHaveValue('Hello')
    expect(handleChange).toHaveBeenCalled()
  })

  it('renders error state border class', () => {
    render(<Input error placeholder="Error state" />)
    const input = screen.getByPlaceholderText('Error state')
    expect(input).toHaveClass('border-[var(--status-error-border)]')
  })
})
