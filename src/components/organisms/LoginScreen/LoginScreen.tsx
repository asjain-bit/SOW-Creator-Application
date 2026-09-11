/**
 * LoginScreen — Organism
 * Full SOW Creator authentication & OTP verification screen matching exact attached reference images.
 * 
 * Features:
 * - Ambient background gradient canvas with rounded double-card layout
 * - Left Panel: SOW Creator logo pill, stacked 3-SOW document illustration, and "From ideas to approved SOWs" hero text
 * - Right Panel: Step 1 ("Welcome Back") & Step 2 ("Verify Your Email" matching attached image)
 * - Poppins font hierarchy: font-bold for titles (#0d212c), font-normal for subtitles (#64748b)
 * - 6-Digit OTP inputs with auto-focus, paste support, and 30s resend timer
 * - Minimal clean post-OTP loader (no M42 logo)
 */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { LoginScreenProps, LoginStep } from './LoginScreen.types'

const REGISTERED_EMAILS = [
  'ashika.jain@company.com',
  'user@company.com',
  'admin@company.com',
  'demo@sowcreator.com',
]

const VALID_OTP = '123456'

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  initialStep = 'email',
  initialEmail = 'ashika.jain@company.com',
}) => {
  const [step, setStep] = useState<LoginStep>(initialStep)
  const [email, setEmail] = useState<string>(initialEmail)
  const [emailError, setEmailError] = useState<string>('')
  
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [otpError, setOtpError] = useState<string>('')
  
  const [timerSeconds, setTimerSeconds] = useState<number>(30)
  const [timerActive, setTimerActive] = useState<boolean>(false)
  const [resendNotification, setResendNotification] = useState<string>('')

  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1)
      }, 1000)
    } else if (timerSeconds === 0) {
      setTimerActive(false)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerActive, timerSeconds])

  const validateEmail = (val: string): boolean => {
    const trimmed = val.trim()
    if (!trimmed) {
      setEmailError('Email address is required.')
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmed)) {
      setEmailError('Please enter a valid email address (e.g. user@company.com)')
      return false
    }
    if (!REGISTERED_EMAILS.includes(trimmed.toLowerCase())) {
      setEmailError('Email address not found. Please contact your administrator.')
      return false
    }
    setEmailError('')
    return true
  }

  const handleSendOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (validateEmail(email)) {
      setStep('otp')
      setOtpDigits(['', '', '', '', '', ''])
      setOtpError('')
      setTimerSeconds(30)
      setTimerActive(true)
      setResendNotification('')
    }
  }

  const handleOtpChange = (index: number, val: string) => {
    const digitsOnly = val.replace(/\D/g, '')
    
    if (digitsOnly.length > 1) {
      const newDigits = [...otpDigits]
      const pasted = digitsOnly.slice(0, 6).split('')
      pasted.forEach((char, idx) => {
        if (idx < 6) newDigits[idx] = char
      })
      setOtpDigits(newDigits)
      if (otpError) setOtpError('')
      const nextFocus = Math.min(pasted.length, 5)
      otpRefs.current[nextFocus]?.focus()
      return
    }

    const char = digitsOnly.slice(-1)
    const newDigits = [...otpDigits]
    newDigits[index] = char
    setOtpDigits(newDigits)
    if (otpError) setOtpError('')

    if (char && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const enteredCode = otpDigits.join('')
    if (enteredCode.length < 6) {
      setOtpError('Please enter all 6 digits of the OTP.')
      return
    }
    if (enteredCode !== VALID_OTP) {
      setOtpError('Incorrect OTP code. Please try again.')
      return
    }

    setOtpError('')
    setStep('loader')

    setTimeout(() => {
      setStep('success')
      if (onLoginSuccess) {
        onLoginSuccess(email)
      }
    }, 1200)
  }

  const handleResendOtp = () => {
    if (timerActive) return
    setOtpDigits(['', '', '', '', '', ''])
    setOtpError('')
    setTimerSeconds(30)
    setTimerActive(true)
    setResendNotification(`A new 6-digit OTP code has been sent to ${email}`)
    setTimeout(() => {
      otpRefs.current[0]?.focus()
    }, 100)
  }

  const formatTimer = (secs: number) => {
    const s = secs < 10 ? `0${secs}` : `${secs}`
    return `00:${s}`
  }

  return (
    <div
      className="relative min-h-screen w-screen bg-[#f8fafc] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-[var(--brand-cyan-100)]"
      data-testid="login-screen-container"
    >
      {/* Outer App Window Frame Card with enlarged dimensions */}
      <div className="w-full max-w-[1180px] bg-white/90 backdrop-blur-md rounded-[32px] border border-[#e2e8f0] shadow-2xl p-4 sm:p-5 flex flex-col lg:flex-row gap-5 min-h-[640px]">
        
        {/* ─── LEFT PANEL: GRADIENT & ILLUSTRATION (Middle aligned with reduced gaps) ─── */}
        <div className="flex-1 rounded-[28px] bg-gradient-to-br from-[#e0f2fe]/80 via-[#f0f9ff]/90 to-[#e6f9fa] border border-[#bae6fd]/50 p-8 sm:p-10 flex flex-col justify-center gap-5 sm:gap-6 relative overflow-hidden min-h-[500px]">
          
          {/* Top Header Brand Logo without background pill */}
          <div className="flex items-center gap-3 self-start relative z-10">
            <img
              src="/dark-logo.png"
              alt="M42 Logo"
              className="h-6 w-auto object-contain"
            />
            <span className="text-lg font-semibold text-[#0d212c] tracking-tight">
              SOW Creator
            </span>
          </div>

          {/* Graphic Stacked SOW Illustration (Left Aligned with Content, tight spacing) */}
          <div className="relative w-full max-w-[380px] self-start flex items-center justify-start py-1">
            <div className="relative w-full h-44 flex items-center justify-center">
              
              {/* Sheet 1: Left Approved Card */}
              <div className="absolute left-2 w-40 h-32 bg-white rounded-2xl border border-gray-100 shadow-md transform -rotate-6 p-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-500">SOW</span>
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[9px] font-bold">✓</span>
                  </div>
                  <div className="mt-2 w-full h-1.5 bg-gray-100 rounded-full" />
                  <div className="mt-1 w-3/4 h-1.5 bg-gray-100 rounded-full" />
                </div>
                <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#dcfce7] text-[#16a34a] self-start">
                  ✓ Approved
                </div>
              </div>

              {/* Sheet 3: Right Under Review Card */}
              <div className="absolute right-2 w-40 h-32 bg-white rounded-2xl border border-gray-100 shadow-md transform rotate-6 p-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-500">SOW</span>
                    <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-[9px] font-bold">💬</span>
                  </div>
                  <div className="mt-2 w-full h-1.5 bg-gray-100 rounded-full" />
                  <div className="mt-1 w-3/4 h-1.5 bg-gray-100 rounded-full" />
                </div>
                <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#ffedd5] text-[#c2410c] self-start">
                  ⏱ Under Review
                </div>
              </div>

              {/* Sheet 2: Center Main Active Card */}
              <div className="absolute z-10 w-48 h-36 bg-white rounded-2xl border border-gray-100 shadow-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0d212c]">SOW</span>
                    <div className="w-6 h-6 rounded-full bg-[#00C4C4] text-white flex items-center justify-center text-xs">
                      📄
                    </div>
                  </div>
                  <div className="mt-2 w-full h-2 bg-slate-100 rounded-full" />
                  <div className="mt-1.5 w-4/5 h-2 bg-slate-100 rounded-full" />
                  <div className="mt-1.5 w-2/3 h-2 bg-slate-100 rounded-full" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#e0f2fe] text-[#0284c7]">
                    📈 In Progress
                  </div>
                  <span className="text-[10px] font-serif italic text-gray-400">Signature</span>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Hero Text (Font weight -2 units: font-medium, subtitle in 1 single line) */}
          <div className="relative z-10 flex flex-col items-start text-left">
            <h1 className="text-xl sm:text-2xl font-medium text-[#0d212c] tracking-tight mb-1.5">
              From ideas to approved SOWs
            </h1>
            <p className="text-xs sm:text-sm text-[#64748b] font-normal leading-relaxed whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
              Create, collaborate, and track Statements of Work with the power of AI.
            </p>
          </div>
        </div>

        {/* ─── RIGHT PANEL: FORM CONTAINER (Increased width 470px to prevent email truncation) ──── */}
        <div className="w-full lg:w-[470px] shrink-0 bg-white rounded-[28px] p-8 sm:p-10 shadow-lg border border-gray-100 flex flex-col justify-between min-h-[500px]">
          
          <div className="my-auto flex flex-col w-full">
            
            {/* ─── STEP 1: WELCOME & EMAIL INPUT (Renamed from Welcome Back, weight reduced by 1 unit) ─── */}
            {step === 'email' && (
              <form onSubmit={handleSendOtp} className="flex flex-col gap-6" noValidate>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-semibold text-[#0d212c] tracking-tight">
                    Welcome
                  </h2>
                  <p className="mt-1 text-sm text-[#64748b] font-normal">
                    Enter your email address to sign in.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="email-input" className="text-xs font-medium text-[#0d212c]">
                    Email address
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-gray-400 pointer-events-none">
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      id="email-input"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (emailError) setEmailError('')
                      }}
                      placeholder="ashika.jain@company.com"
                      className={`w-full pl-11 pr-4 py-3 text-sm font-normal text-[#0d212c] bg-white border rounded-xl outline-none transition-all placeholder:text-gray-400 ${
                        emailError
                          ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                          : 'border-[#cbd5e1] hover:border-gray-300 focus:border-[#00C4C4] focus:ring-2 focus:ring-[#00C4C4]/20'
                      }`}
                    />
                  </div>

                  {emailError && (
                    <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-red-600">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{emailError}</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  id="send-otp-btn"
                  className="w-full bg-[#00C4C4] hover:bg-[#00a8a8] active:bg-[#008f8f] text-white font-bold text-base py-3.5 rounded-xl transition duration-150 shadow-md cursor-pointer border-0 mt-2"
                >
                  Send OTP
                </button>
              </form>
            )}

            {/* ─── STEP 2: VERIFY YOUR EMAIL (OTP INPUT - User email in dark grey without truncation) ─── */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6" noValidate>
                {/* Top Back Button */}
                <button
                  type="button"
                  onClick={() => {
                    setStep('email')
                    setOtpError('')
                  }}
                  className="self-start text-xs font-medium text-[#64748b] hover:text-[#0d212c] flex items-center gap-1 transition cursor-pointer bg-transparent border-0 -mt-2"
                >
                  <span>‹ Back</span>
                </button>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#0d212c] tracking-tight">
                    Verify Your Email
                  </h2>
                  <p className="mt-1.5 text-sm text-[#64748b] font-normal leading-relaxed">
                    We&apos;ve sent a 6-digit OTP to{' '}
                    <span className="text-[#0d212c] font-semibold">{email}</span>
                  </p>
                </div>

                {resendNotification && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{resendNotification}</span>
                  </div>
                )}

                {/* 6-Digit OTP Box Grid */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          otpRefs.current[index] = el
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className={`w-11 sm:w-12 h-13 sm:h-14 text-center font-bold text-xl text-[#0d212c] bg-white border rounded-xl outline-none transition-all ${
                          otpError
                            ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                            : index === 0 && !digit
                            ? 'border-[#00C4C4] ring-2 ring-[#00C4C4]/20'
                            : digit
                            ? 'border-gray-300 ring-2 ring-gray-100/70'
                            : 'border-[#cbd5e1] hover:border-gray-300 focus:border-[#00C4C4] focus:ring-2 focus:ring-[#00C4C4]/20'
                        }`}
                        data-testid={`otp-input-${index}`}
                      />
                    ))}
                  </div>

                  {otpError && (
                    <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-red-600">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{otpError}</span>
                    </div>
                  )}
                </div>

                {/* Resend OTP Timer Section */}
                <div className="text-xs text-[#64748b] font-normal">
                  Didn&apos;t receive the code?{' '}
                  {timerActive ? (
                    <span className="text-[#00C4C4] font-bold">
                      Resend OTP ({formatTimer(timerSeconds)})
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-[#00C4C4] hover:underline font-bold cursor-pointer bg-transparent border-0"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                {/* Submit OTP CTA */}
                <button
                  type="submit"
                  id="verify-otp-btn"
                  className="w-full bg-[#00C4C4] hover:bg-[#00a8a8] active:bg-[#008f8f] text-white font-bold text-base py-3.5 rounded-xl transition duration-150 shadow-md cursor-pointer border-0 mt-2"
                >
                  Verify &amp; Sign In
                </button>
              </form>
            )}

            {/* ─── STEP 3: POST-OTP MINIMAL LOADER ─────────────────────────── */}
            {step === 'loader' && (
              <div
                className="py-12 flex flex-col items-center justify-center text-center gap-5"
                data-testid="fullscreen-workspace-loader"
              >
                <div className="relative flex items-center justify-center w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-[#e0f2fe] border-t-[#00C4C4] animate-spin" />
                  <div className="w-8 h-8 rounded-full bg-[#f0f9ff] text-[#00C4C4] flex items-center justify-center font-bold text-sm shadow-2xs">
                    S
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-bold text-[#0d212c]">
                    Loading SOW Creator workspace...
                  </h3>
                  <p className="text-xs text-[#64748b] font-normal">
                    Please wait a moment while we set up your session
                  </p>
                </div>
              </div>
            )}

            {/* ─── STEP 4: SUCCESS STATE ────────────────────────────────────── */}
            {step === 'success' && (
              <div className="py-6 flex flex-col items-center justify-center text-center gap-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-bold">
                  ✓
                </div>
                <h3 className="text-2xl font-bold text-[#0d212c]">
                  Signed In Successfully!
                </h3>
                <p className="text-xs text-[#64748b] font-normal max-w-xs">
                  Welcome back, <strong className="text-[#0d212c] font-bold">{email}</strong>.
                </p>
              </div>
            )}

          </div>

          {/* Bottom Pinned Terms & Privacy Disclaimer */}
          <p className="text-[11px] text-center text-[#64748b] font-normal leading-relaxed shrink-0 mt-4">
            By continuing, you agree to our{' '}
            <a href="#terms" className="text-[#00C4C4] hover:underline font-semibold">
              Terms of Use
            </a>{' '}
            and{' '}
            <a href="#privacy" className="text-[#00C4C4] hover:underline font-semibold">
              Privacy Policy
            </a>
            .
          </p>
        </div>

      </div>
    </div>
  )
}
