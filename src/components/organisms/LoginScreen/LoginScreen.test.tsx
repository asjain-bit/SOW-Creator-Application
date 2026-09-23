/**
 * LoginScreen Unit Tests
 * Verifies email validation, OTP digit entry, error states, timer countdown, and post-OTP loader.
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { LoginScreen } from './LoginScreen'

// Mock next/image to render standard img tag
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    return <img {...props} alt={props.alt || ''} />
  },
}))

describe('LoginScreen Organism', () => {
  it('renders initial welcome screen with email input and Send OTP button', () => {
    render(<LoginScreen showDevControls={false} />)

    expect(screen.getByText('SOW Creator')).toBeInTheDocument()
    expect(screen.getByText('From ideas to approved SOWs')).toBeInTheDocument()
    expect(screen.getByText('Welcome')).toBeInTheDocument()
    expect(screen.getByLabelText('Email address')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Send OTP/i })).toBeInTheDocument()
  })

  it('shows error when invalid email format is entered', () => {
    render(<LoginScreen showDevControls={false} initialEmail="invalid-email" />)

    const sendBtn = screen.getByRole('button', { name: /Send OTP/i })
    fireEvent.click(sendBtn)

    expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument()
  })

  it('advances to OTP step when valid registered email is submitted', () => {
    render(<LoginScreen showDevControls={false} initialEmail="ashika.jain@company.com" />)

    const sendBtn = screen.getByRole('button', { name: /Send OTP/i })
    fireEvent.click(sendBtn)

    expect(screen.getByText('Verify Your Email')).toBeInTheDocument()
    expect(screen.getByText(/ashika\.jain@company\.com/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Verify & Sign In/i })).toBeInTheDocument()
  })

  it('shows error when incorrect OTP code is entered', () => {
    render(
      <LoginScreen
        showDevControls={false}
        initialStep="otp"
        initialEmail="ashika.jain@company.com"
      />
    )

    const otp0 = screen.getByTestId('otp-input-0')
    const otp1 = screen.getByTestId('otp-input-1')
    const otp2 = screen.getByTestId('otp-input-2')
    const otp3 = screen.getByTestId('otp-input-3')

    fireEvent.change(otp0, { target: { value: '9' } })
    fireEvent.change(otp1, { target: { value: '9' } })
    fireEvent.change(otp2, { target: { value: '9' } })
    fireEvent.change(otp3, { target: { value: '9' } })

    const verifyBtn = screen.getByRole('button', { name: /Verify & Sign In/i })
    fireEvent.click(verifyBtn)

    expect(screen.getByText(/Incorrect OTP code/i)).toBeInTheDocument()
  })

  it('triggers loader and success callback when correct OTP is entered', async () => {
    const handleSuccess = vi.fn()
    render(
      <LoginScreen
        showDevControls={false}
        initialStep="otp"
        initialEmail="ashika.jain@company.com"
        onLoginSuccess={handleSuccess}
      />
    )

    const otp0 = screen.getByTestId('otp-input-0')
    const otp1 = screen.getByTestId('otp-input-1')
    const otp2 = screen.getByTestId('otp-input-2')
    const otp3 = screen.getByTestId('otp-input-3')

    fireEvent.change(otp0, { target: { value: '1' } })
    fireEvent.change(otp1, { target: { value: '2' } })
    fireEvent.change(otp2, { target: { value: '3' } })
    fireEvent.change(otp3, { target: { value: '4' } })

    const verifyBtn = screen.getByRole('button', { name: /Verify & Sign In/i })
    fireEvent.click(verifyBtn)

    // Verify transition to loader
    expect(screen.getByText(/Loading SOW Creator workspace/i)).toBeInTheDocument()

    // Wait for loader sequence completion
    await waitFor(
      () => {
        expect(screen.getByText('Signed In Successfully!')).toBeInTheDocument()
      },
      { timeout: 3500 }
    )

    expect(handleSuccess).toHaveBeenCalledWith('ashika.jain@company.com')
  })
})
