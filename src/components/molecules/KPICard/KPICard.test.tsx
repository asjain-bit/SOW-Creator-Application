import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { KPICard } from './KPICard'

describe('KPICard Component', () => {
  it('renders title, value, and change badge correctly', () => {
    render(<KPICard title="Total Users" value="12,450" change="+14%" changeVariant="success" />)
    expect(screen.getByText('Total Users')).toBeInTheDocument()
    expect(screen.getByText('12,450')).toBeInTheDocument()
    expect(screen.getByText('+14%')).toBeInTheDocument()
  })
})
