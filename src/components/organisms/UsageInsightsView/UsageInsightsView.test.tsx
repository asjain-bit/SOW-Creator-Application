import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { UsageInsightsView } from './UsageInsightsView'

const sows = [
  { id: '1', name: 'Alpha SOW', readiness: 90 },
  { id: '2', name: 'Beta SOW', readiness: 40 },
]

describe('UsageInsightsView', () => {
  it('shows the header, KPI cards and readiness sections', () => {
    render(<UsageInsightsView sows={sows} />)
    expect(screen.getByText('Usage Insights')).toBeInTheDocument()
    expect(screen.getByText('SOWs Generated')).toBeInTheDocument()
    expect(screen.getByText('Alpha SOW')).toBeInTheDocument()
    expect(screen.getByText('Beta SOW')).toBeInTheDocument()
  })

  it('enables Recalculate only after an input changes', () => {
    render(<UsageInsightsView sows={sows} />)
    const btn = screen.getByRole('button', { name: /Recalculate/i })
    expect(btn).toBeDisabled()
    fireEvent.change(screen.getByLabelText(/Hours spent on current approach/), { target: { value: '5' } })
    expect(btn).toBeEnabled()
    fireEvent.click(btn)
    expect(screen.getByText(/Recalculating value\/ROI/i)).toBeInTheDocument()
    expect(btn).toBeDisabled()
  })
})
