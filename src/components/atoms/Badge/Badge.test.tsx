import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Badge } from './Badge'
import { BadgeVariant } from './Badge.types'

const variants: BadgeVariant[] = ['success', 'warning', 'error', 'info', 'default']

describe('Badge Component', () => {
  it.each(variants)('renders %s variant correctly', (variant) => {
    render(<Badge variant={variant}>Badge {variant}</Badge>)
    expect(screen.getByText(`Badge ${variant}`)).toBeInTheDocument()
  })
})
