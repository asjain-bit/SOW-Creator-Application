import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { SettingsPanel } from './SettingsPanel'

describe('SettingsPanel Component', () => {
  it('renders settings fields, handles form submit, and dismisses toast', async () => {
    const handleSave = vi.fn()

    render(
      <ThemeProvider>
        <SettingsPanel onSave={handleSave} />
      </ThemeProvider>
    )

    expect(screen.getByText('Account Preferences')).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toHaveValue('Ashika Agent')

    const notificationSelect = screen.getByLabelText(/notification frequency/i)
    await userEvent.selectOptions(notificationSelect, 'daily')

    const saveBtn = screen.getByRole('button', { name: /save changes/i })
    await userEvent.click(saveBtn)

    expect(handleSave).toHaveBeenCalledWith({
      name: 'Ashika Agent',
      email: 'ashika@example.com',
    })

    const dismissToastBtn = screen.getByRole('button', { name: /dismiss toast/i })
    await userEvent.click(dismissToastBtn)
    expect(screen.queryByText('Settings Saved')).not.toBeInTheDocument()
  })

  it('opens confirmation dialog on reset click and confirms reset', async () => {
    render(
      <ThemeProvider>
        <SettingsPanel />
      </ThemeProvider>
    )

    const resetBtn = screen.getByRole('button', { name: /reset preferences/i })
    await userEvent.click(resetBtn)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Reset Account Preferences?')).toBeInTheDocument()

    const confirmBtn = screen.getByRole('button', { name: /confirm reset/i })
    await userEvent.click(confirmBtn)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
