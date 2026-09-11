import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Input } from '@/components/atoms/Input'
import { FormField } from './FormField'

describe('FormField Component', () => {
  it('renders label and passes id to child input', () => {
    render(
      <FormField id="email-field" label="Email Address" required>
        <Input placeholder="user@example.com" />
      </FormField>
    )

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('user@example.com')).toHaveAttribute('id', 'email-field')
  })

  it('renders error text when error prop is provided', () => {
    render(
      <FormField id="username" label="Username" error="Username is required">
        <Input />
      </FormField>
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Username is required')
  })

  it('renders helper text when no error is present', () => {
    render(
      <FormField id="pass" label="Password" helperText="Must be 8+ chars">
        <Input type="password" />
      </FormField>
    )

    expect(screen.getByText('Must be 8+ chars')).toBeInTheDocument()
  })
})
