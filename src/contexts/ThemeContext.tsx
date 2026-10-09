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
  const [theme, setThemeState] = useState<Theme>('light')
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light')

  useEffect(() => {
    // Strictly enforce custom light theme across the entire application
    try {
      if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.setItem === 'function') {
        window.localStorage.setItem('theme', 'light')
      }
    } catch {
      // Safe fallback if localStorage is disabled or restricted
    }

    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', 'light')
      document.documentElement.style.colorScheme = 'light'
    }
  }, [])

  const setTheme = (newTheme: Theme) => {
    // Application is strictly locked to custom light theme only
    const target = newTheme === 'light' ? 'light' : 'light'
    setThemeState(target)
    setResolvedTheme(target)
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', target)
      document.documentElement.style.colorScheme = target
    }
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
