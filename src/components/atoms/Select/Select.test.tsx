import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Select } from './Select'

const sampleOptions = [
  { value: 'opt1', label: 'Option 1' },
  { value: 'opt2', label: 'Option 2' },
]

describe('Select Component', () => {
  it('renders options correctly', () => {
    render(<Select options={sampleOptions} aria-label="Sample select" />)
    expect(screen.getByRole('combobox', { name: 'Sample select' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Option 1' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Option 2' })).toBeInTheDocument()
  })

  it('handles value change', async () => {
    const handleChange = vi.fn()
    render(<Select options={sampleOptions} onChange={handleChange} aria-label="Sample select" />)
    const select = screen.getByRole('combobox')
    await userEvent.selectOptions(select, 'opt2')
    expect(select).toHaveValue('opt2')
    expect(handleChange).toHaveBeenCalled()
  })

  it('renders error border', () => {
    render(<Select options={sampleOptions} error aria-label="Error select" />)
    expect(screen.getByRole('combobox')).toHaveClass('border-[var(--status-error-border)]')
  })
})
