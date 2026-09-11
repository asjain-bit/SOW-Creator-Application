import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { DashboardScreen } from './DashboardScreen'

describe('DashboardScreen Organism', () => {
  it('renders greeting, header, hero banner, and previous SOWs table correctly', () => {
    render(<DashboardScreen userName="Ashika" userRole="PMO" userInitials="AJ" />)

    // Header & Greeting
    expect(screen.getByText('SOW Creator')).toBeInTheDocument()
    expect(screen.getByText('Good morning,')).toBeInTheDocument()
    expect(screen.getByText('Ashika')).toBeInTheDocument()
    expect(screen.queryByText("Here's your SOW workspace.")).not.toBeInTheDocument()

    // Hero banner
    expect(screen.getByText('Create a new SOW')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Upload your project details and let AI help you get started with a structured SOW.'
      )
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create sow/i })).toBeInTheDocument()

    // Table content matching updated mockup
    expect(screen.getByText("All SOW's")).toBeInTheDocument()
    expect(screen.getByText('Customer Transformation Program')).toBeInTheDocument()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('Digital Workplace Enablement')).toBeInTheDocument()
    expect(screen.getByText('Cloud Modernization Initiative')).toBeInTheDocument()
    expect(screen.getByText('IT Infrastructure Revamp')).toBeInTheDocument()
    expect(screen.getByText('Data Analytics Platform')).toBeInTheDocument()
    expect(screen.getByText('Enterprise Security Architecture')).toBeInTheDocument()
    expect(screen.getByText('AI Automation & Workflow Setup')).toBeInTheDocument()
    expect(screen.getByText('Modern Data Warehouse Migration')).toBeInTheDocument()
  })

  it('filters SOWs when search query is entered', () => {
    render(<DashboardScreen />)

    const searchInput = screen.getByTestId('search-sows-input')
    fireEvent.change(searchInput, { target: { value: 'Acme' } })

    expect(screen.getByText('Customer Transformation Program')).toBeInTheDocument()
    expect(screen.queryByText('Digital Workplace Enablement')).not.toBeInTheDocument()
  })

  it('opens create modal when + Create SOW button is clicked', () => {
    render(<DashboardScreen />)

    const createBtn = screen.getByRole('button', { name: /create sow/i })
    fireEvent.click(createBtn)

    expect(screen.getByText('Create a New SOW')).toBeInTheDocument()
    expect(screen.getByLabelText('SOW Project Name')).toBeInTheDocument()
  })

  it('calls onSignOut when sign out button is clicked', () => {
    const handleSignOut = vi.fn()
    render(<DashboardScreen onSignOut={handleSignOut} />)

    const signOutBtn = screen.getByRole('button', { name: 'Sign Out' })
    fireEvent.click(signOutBtn)

    expect(handleSignOut).toHaveBeenCalledTimes(1)
  })
})
