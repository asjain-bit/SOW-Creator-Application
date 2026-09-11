import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AppShell } from './AppShell'

describe('AppShell Component', () => {
  it('renders topbar, leftbar, main, and rightbar slots', () => {
    render(
      <AppShell
        topbar={<div>Top Navigation Bar</div>}
        leftbar={<div>Sidebar Navigation</div>}
        main={<div>Main Content Area</div>}
        rightbar={<div>Right Widget Sidebar</div>}
      />
    )

    expect(screen.getByText('Top Navigation Bar')).toBeInTheDocument()
    expect(screen.getByTestId('app-shell-leftbar')).toHaveTextContent('Sidebar Navigation')
    expect(screen.getByTestId('app-shell-main')).toHaveTextContent('Main Content Area')
    expect(screen.getByTestId('app-shell-rightbar')).toHaveTextContent('Right Widget Sidebar')
  })

  it('adjusts leftbar width class when leftbarCollapsed is true', () => {
    render(
      <AppShell
        leftbar={<div>Icon Nav</div>}
        main={<div>Content</div>}
        leftbarCollapsed={true}
      />
    )

    expect(screen.getByTestId('app-shell-leftbar')).toHaveClass('w-[48px]')
  })

  it('hides rightbar when showRightbar is false', () => {
    render(
      <AppShell
        main={<div>Content</div>}
        rightbar={<div>Hidden Rightbar</div>}
        showRightbar={false}
      />
    )

    expect(screen.queryByTestId('app-shell-rightbar')).not.toBeInTheDocument()
  })
})
