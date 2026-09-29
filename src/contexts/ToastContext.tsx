'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export type ToastType = 'success' | 'info' | 'warning' | 'error'

export interface ToastItem {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback(
    (message: string, type: ToastType = 'success', duration = 3500) => {
      const id = Math.random().toString(36).substring(2, 9)
      setToasts((prev) => [...prev, { id, message, type, duration }])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, duration)
    },
    []
  )

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Top Right Toaster matching reference UI */}
      <div
        style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 10,
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success'
          const isInfo = toast.type === 'info'
          const isWarning = toast.type === 'warning'
          const isError = toast.type === 'error'

          const bg = isSuccess
            ? '#f0fdf4'
            : isInfo
              ? '#f0fdfa'
              : isWarning
                ? '#fffbeb'
                : '#fef2f2'

          const borderColor = isSuccess
            ? '#86efac'
            : isInfo
              ? '#5eead4'
              : isWarning
                ? '#fde68a'
                : '#fca5a5'

          const textColor = isSuccess
            ? '#15803d'
            : isInfo
              ? '#0f766e'
              : isWarning
                ? '#b45309'
                : '#b91c1c'

          const shadow = isSuccess
            ? '0 6px 20px -2px rgba(34, 197, 94, 0.18), 0 2px 6px -1px rgba(0, 0, 0, 0.04)'
            : '0 6px 20px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)'

          return (
            <div
              key={toast.id}
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '11px 20px',
                borderRadius: 14,
                background: bg,
                border: `1.5px solid ${borderColor}`,
                boxShadow: shadow,
                fontSize: 14.5,
                fontWeight: 500,
                color: textColor,
                lineHeight: 1.4,
                animation: 'toastSlideInRight 0.24s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                maxWidth: '90vw',
                whiteSpace: 'nowrap',
              }}
            >
              {/* Minimal Icon */}
              {isWarning ? (
                <span style={{ color: '#d97706', display: 'flex', alignItems: 'center' }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </span>
              ) : isError ? (
                <span style={{ color: '#dc2626', display: 'flex', alignItems: 'center' }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </span>
              ) : isInfo ? (
                <span style={{ color: '#0d9488', display: 'flex', alignItems: 'center' }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </span>
              ) : (
                <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              )}
              <span>{toast.message}</span>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    return {
      showToast: (message: string, _type?: ToastType) => {
        // Fallback if rendered outside provider
        if (typeof window !== 'undefined') {
          console.log(`[Toast]: ${message}`)
        }
      },
    }
  }
  return context
}
