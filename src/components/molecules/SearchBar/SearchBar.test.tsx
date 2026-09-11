import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SearchBar } from './SearchBar'

describe('SearchBar Component', () => {
  it('renders input with search icon and button', () => {
    render(<SearchBar placeholder="Search items..." />)
    expect(screen.getByPlaceholderText('Search items...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
  })

  it('triggers onSearch when submitted', async () => {
    const handleSearch = vi.fn()
    render(<SearchBar onSearch={handleSearch} placeholder="Type query" />)
    const input = screen.getByPlaceholderText('Type query')
    await userEvent.type(input, 'Next.js 15')
    await userEvent.click(screen.getByRole('button', { name: /search/i }))
    expect(handleSearch).toHaveBeenCalledWith('Next.js 15')
  })
})
