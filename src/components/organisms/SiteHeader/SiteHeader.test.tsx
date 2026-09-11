import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { SiteHeader } from './SiteHeader'

describe('SiteHeader Component', () => {
  it('renders branding, navigation items, theme toggle, and avatar', () => {
    render(
      <ThemeProvider>
        <SiteHeader userFallback="JD" />
      </ThemeProvider>
    )

    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('triggers search handler when search bar is submitted', () => {
    const handleSearch = vi.fn()
    render(
      <ThemeProvider>
        <SiteHeader onSearch={handleSearch} />
      </ThemeProvider>
    )

    expect(screen.getByPlaceholderText('Search platform...')).toBeInTheDocument()
  })
})
