import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ThemeProvider, useTheme } from './ThemeContext'

function TestComponent() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button onClick={() => setTheme('light')}>Set Light</button>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('system')}>Set System</button>
    </div>
  )
}

describe('ThemeContext', () => {
  it('provides theme context and updates theme mode', async () => {
    let listener: ((e: MediaQueryListEvent) => void) | null = null
    const addListenerMock = vi.fn((event, fn) => {
      listener = fn
    })

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: addListenerMock,
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    expect(screen.getByTestId('theme')).toHaveTextContent('system')

    await userEvent.click(screen.getByRole('button', { name: /set light/i }))
    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    expect(screen.getByTestId('resolved')).toHaveTextContent('light')

    await userEvent.click(screen.getByRole('button', { name: /set dark/i }))
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(screen.getByTestId('resolved')).toHaveTextContent('dark')

    await userEvent.click(screen.getByRole('button', { name: /set system/i }))
    expect(screen.getByTestId('theme')).toHaveTextContent('system')

    if (listener) {
      act(() => {
        listener!({ matches: true } as MediaQueryListEvent)
      })
    }
  })

  it('throws error if useTheme is called outside ThemeProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<TestComponent />)).toThrow('useTheme must be used within a ThemeProvider')
    consoleSpy.mockRestore()
  })
})
