'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: ResolvedTheme
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.getItem === 'function') {
        const stored = window.localStorage.getItem('theme') as Theme | null
        if (stored && ['light', 'dark', 'system'].includes(stored)) {
          setThemeState(stored)
        }
      }
    } catch {
      // Safe fallback if localStorage is disabled or restricted
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const getSystemTheme = (): ResolvedTheme => {
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return 'light'
    }

    const activeTheme = theme === 'system' ? getSystemTheme() : theme
    setResolvedTheme(activeTheme)
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', activeTheme)
    }

    try {
      if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.setItem === 'function') {
        window.localStorage.setItem('theme', theme)
      }
    } catch {
      // Safe fallback
    }
  }, [theme, mounted])

  useEffect(() => {
    if (theme !== 'system' || typeof window === 'undefined' || !window.matchMedia) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      const activeTheme: ResolvedTheme = e.matches ? 'dark' : 'light'
      setResolvedTheme(activeTheme)
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', activeTheme)
      }
    }

    mediaQuery.addEventListener?.('change', handleChange)
    return () => mediaQuery.removeEventListener?.('change', handleChange)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
