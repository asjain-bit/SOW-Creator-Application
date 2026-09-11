import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Icon } from './Icon'
import { IconName } from './Icon.types'

const allIcons: IconName[] = [
  'sun',
  'moon',
  'laptop',
  'search',
  'check',
  'alert',
  'info',
  'close',
  'user',
  'settings',
  'chevron-left',
  'chevron-right',
  'arrow-up',
  'arrow-down',
]

describe('Icon Component', () => {
  it.each(allIcons)('renders %s icon correctly', (name) => {
    render(<Icon name={name} />)
    expect(screen.getByTestId(`icon-${name}`)).toBeInTheDocument()
  })

  it('renders null for unknown icon name', () => {
    // @ts-expect-error testing invalid name fallback
    render(<Icon name="unknown-icon" />)
    expect(screen.queryByTestId('icon-unknown-icon')).not.toBeInTheDocument()
  })

  it('applies custom size and className', () => {
    render(<Icon name="moon" size={32} className="text-accent" />)
    const icon = screen.getByTestId('icon-moon')
    expect(icon).toHaveAttribute('width', '32')
    expect(icon).toHaveClass('text-accent')
  })
})
