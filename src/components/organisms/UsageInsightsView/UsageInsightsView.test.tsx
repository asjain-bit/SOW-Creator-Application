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
    fireEvent.change(screen.getByLabelText(/Manual hours per output/), { target: { value: '5' } })
    expect(btn).toBeEnabled()
    fireEvent.click(btn)
    expect(screen.getByText(/Recalculating value\/ROI/i)).toBeInTheDocument()
    expect(btn).toBeDisabled()
  })

  it('shows the web search credits card and token breakdown', () => {
    render(<UsageInsightsView sows={sows} />)
    expect(screen.getByText('Web Search Credits')).toBeInTheDocument()
    expect(screen.getByText('2,500')).toBeInTheDocument()
    expect(screen.getByLabelText(/Embedding token price/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Price per search credit/)).toBeInTheDocument()
  })

  it('lets the user pick a week from the current month', () => {
    render(<UsageInsightsView sows={sows} />)
    fireEvent.click(screen.getByRole('button', { name: /Oct 12 – Oct 18, 2026/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Oct 5 – Oct 11, 2026' }))
    expect(screen.getByRole('button', { name: /Oct 5 – Oct 11, 2026/ })).toBeInTheDocument()
  })

  it('hides Recalculate and locks the inputs for non-admin users', () => {
    render(<UsageInsightsView sows={sows} canRecalculate={false} />)
    expect(screen.queryByRole('button', { name: /Recalculate/i })).not.toBeInTheDocument()
    expect(screen.getByLabelText(/Manual hours per output/)).toHaveAttribute('readonly')
  })
})
