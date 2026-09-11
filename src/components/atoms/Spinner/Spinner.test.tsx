import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Spinner } from './Spinner'

describe('Spinner Component', () => {
  it('renders loading status correctly', () => {
    render(<Spinner />)
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
  })

  it('applies correct size styles', () => {
    render(<Spinner size="lg" />)
    expect(screen.getByTestId('spinner')).toHaveClass('w-8 h-8')
  })
})
