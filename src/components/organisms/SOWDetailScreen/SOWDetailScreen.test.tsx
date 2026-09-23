import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SOWDetailScreen } from './SOWDetailScreen'

const mockFiles = [
  {
    id: '1',
    name: 'test.pdf',
    size: '1 MB',
    type: 'pdf',
    status: 'complete' as const,
    progress: 100,
  },
]

describe('SOWDetailScreen', () => {
  it('renders the SOW title', () => {
    render(<SOWDetailScreen sowName="Test SOW" />)
    expect(screen.getAllByText('Test SOW').length).toBeGreaterThan(0)
  })

  it('renders status badge', () => {
    render(<SOWDetailScreen sowStatus="In Progress" />)
    expect(screen.getByText('In Progress')).toBeTruthy()
  })

  it('renders all tab labels', () => {
    render(<SOWDetailScreen />)
    expect(screen.getByText('Overview')).toBeTruthy()
    expect(screen.getByText('Form')).toBeTruthy()
    expect(screen.getByText('Structure')).toBeTruthy()
    expect(screen.getByText('SOW Draft')).toBeTruthy()
    expect(screen.getByText('Audit Log')).toBeTruthy()
  })

  it('Overview tab is active by default', () => {
    render(<SOWDetailScreen uploadedFiles={mockFiles} />)
    expect(screen.getByText('Uploaded Documents')).toBeTruthy()
  })

  it('shows uploaded file name in Overview tab', () => {
    render(<SOWDetailScreen uploadedFiles={mockFiles} />)
    expect(screen.getByText('test.pdf')).toBeTruthy()
  })

  it('calls onBack when back button clicked', () => {
    const onBack = vi.fn()
    render(<SOWDetailScreen onBack={onBack} />)
    fireEvent.click(screen.getByTitle('Back to My SOWs'))
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('switches to Audit Log tab', () => {
    render(<SOWDetailScreen />)
    fireEvent.click(screen.getByText('Audit Log'))
    expect(screen.getByText('Audit Log', { selector: 'div' })).toBeTruthy()
  })
})
