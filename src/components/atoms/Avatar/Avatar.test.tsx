import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Avatar } from './Avatar'

describe('Avatar Component', () => {
  it('renders fallback text when no src is provided', () => {
    render(<Avatar fallback="JD" />)
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('renders image when src is valid', () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="Jane Doe" />)
    const img = screen.getByAltText('Jane Doe')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg')
  })

  it('shows fallback when image fails to load', () => {
    render(<Avatar src="https://invalid.com/broken.jpg" fallback="AB" alt="User" />)
    const img = screen.getByAltText('User')
    fireEvent.error(img)
    expect(screen.getByText('AB')).toBeInTheDocument()
  })
})
