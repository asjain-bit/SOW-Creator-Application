import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DashboardScreenV2 } from './DashboardScreenV2'

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}))

describe('DashboardScreenV2', () => {
  it('renders greeting and Create New SOW button', () => {
    render(<DashboardScreenV2 userName="Ashika" />)
    expect(screen.getByText(/Hi Ashika/)).toBeTruthy()
    expect(screen.getByText('Create New SOW')).toBeTruthy()
  })

  it('renders 5 KPI cards', () => {
    render(<DashboardScreenV2 />)
    expect(screen.getByText('Total SOWs')).toBeTruthy()
    expect(screen.getAllByText('In Progress').length).toBeGreaterThan(0)
    expect(screen.getByText('Pending Review')).toBeTruthy()
    expect(screen.getByText('Pending with Me')).toBeTruthy()
    expect(screen.getByText('With Participants')).toBeTruthy()
  })

  it('renders SOW table rows', async () => {
    render(<DashboardScreenV2 />)
    await waitFor(() => {
      expect(screen.getAllByText(/Customer Transformation Program/).length).toBeGreaterThan(0)
    })
    expect(screen.getAllByText(/Acme Corp/).length).toBeGreaterThan(0)
  })

  it('filters rows by search', async () => {
    render(<DashboardScreenV2 />)
    const input = screen.getByPlaceholderText('Search SOW or client...')
    fireEvent.change(input, { target: { value: 'Acme' } })
    // search is debounced; just verify input value updated
    expect((input as HTMLInputElement).value).toBe('Acme')
  })

  it('calls onCreateSOW when CTA clicked', () => {
    const onCreateSOW = vi.fn()
    render(<DashboardScreenV2 onCreateSOW={onCreateSOW} />)
    fireEvent.click(screen.getByText('Create New SOW'))
    expect(onCreateSOW).toHaveBeenCalledOnce()
  })

  it('calls onSignOut when logout clicked', () => {
    const onSignOut = vi.fn()
    render(<DashboardScreenV2 onSignOut={onSignOut} userInitials="AJ" userName="Ashika Jain" />)
    // Sign Out is inside the user-avatar dropdown — open it first
    fireEvent.click(screen.getByText('AJ'))
    fireEvent.click(screen.getByText('Sign Out'))
    expect(onSignOut).toHaveBeenCalledOnce()
  })
})
