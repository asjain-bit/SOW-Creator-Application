/**
 * DashboardScreen — Organism
 * 1-to-1 Pixel-Perfect Replication of the SOW Creator Dashboard Screen.
 * 
 * Perfect Symmetrical Alignment:
 * - Top Header: SOW Creator logo pill & User Profile/Notification pills outside main box
 * - Left Nav Rail: Home icon button aligned with TOP of main white box; Logout button aligned with BOTTOM of main white box
 * - Main White Box: Fits seamlessly within 100vh viewport without outer page scroll
 * - Table: Internal scrolling inside the "All SOW's" table container
 */

'use client'

import React, { useState, useMemo } from 'react'
import Image from 'next/image'
import { DashboardScreenProps, SOWItem, SOWStatus } from './DashboardScreen.types'

const DEFAULT_SOWS: SOWItem[] = [
  {
    id: 'sow-1',
    name: 'Customer Transformation Program',
    client: 'Acme Corp',
    lastUpdated: 'Today, 10:24 AM',
    status: 'Completed',
  },
  {
    id: 'sow-2',
    name: 'Digital Workplace Enablement',
    client: 'Globex Inc',
    lastUpdated: 'Aug 28, 2026',
    status: 'In Progress',
  },
  {
    id: 'sow-3',
    name: 'Cloud Modernization Initiative',
    client: 'TechSphere',
    lastUpdated: 'Aug 18, 2026',
    status: 'In Progress',
  },
  {
    id: 'sow-4',
    name: 'IT Infrastructure Revamp',
    client: 'Zenith Ltd',
    lastUpdated: 'Aug 12, 2026',
    status: 'Pending',
  },
  {
    id: 'sow-5',
    name: 'Data Analytics Platform',
    client: 'Orion Group',
    lastUpdated: 'Aug 10, 2026',
    status: 'Not Started',
  },
  {
    id: 'sow-6',
    name: 'Enterprise Security Architecture',
    client: 'CyberShield',
    lastUpdated: 'Aug 05, 2026',
    status: 'Completed',
  },
  {
    id: 'sow-7',
    name: 'AI Automation & Workflow Setup',
    client: 'Innovate LLC',
    lastUpdated: 'Jul 29, 2026',
    status: 'In Progress',
  },
  {
    id: 'sow-8',
    name: 'Modern Data Warehouse Migration',
    client: 'Apex Global',
    lastUpdated: 'Jul 21, 2026',
    status: 'Pending',
  },
]

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  userName = 'Ashika',
  userRole = 'PMO',
  userInitials = 'AJ',
  initialSOWs = DEFAULT_SOWS,
  onSignOut,
  onCreateSOW,
  className = '',
}) => {
  const [sows, setSows] = useState<SOWItem[]>(initialSOWs)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(false)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)

  // Modal State for "+ Create SOW"
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [newSOWName, setNewSOWName] = useState<string>('')
  const [newClientName, setNewClientName] = useState<string>('')
  const [modalError, setModalError] = useState<string>('')

  // Filtered SOWs list based on search and status filter
  const filteredSOWs = useMemo(() => {
    return sows.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.client.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter =
        statusFilter === 'All' || item.status === statusFilter
      return matchesSearch && matchesFilter
    })
  }, [sows, searchTerm, statusFilter])

  // Handle new SOW form submission
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSOWName.trim()) {
      setModalError('Please enter an SOW name.')
      return
    }
    if (!newClientName.trim()) {
      setModalError('Please enter a client name.')
      return
    }

    const newEntry: SOWItem = {
      id: `sow-${Date.now()}`,
      name: newSOWName.trim(),
      client: newClientName.trim(),
      lastUpdated: 'Just now',
      status: 'In Progress',
    }

    setSows([newEntry, ...sows])
    setNewSOWName('')
    setNewClientName('')
    setModalError('')
    setIsModalOpen(false)
    if (onCreateSOW) onCreateSOW()
  }

  // Delete SOW item
  const handleDeleteSOW = (id: string) => {
    setSows((prev) => prev.filter((item) => item.id !== id))
    setActiveMenuId(null)
  }

  // Render status badge chip (font-semibold instead of font-bold)
  const renderStatusBadge = (status: SOWStatus) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-[#dcfce7] text-[#16a34a] border border-green-200/50 shadow-2xs">
            Completed
          </span>
        )
      case 'In Progress':
        return (
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-[#e0f2fe] text-[#0284c7] border border-blue-200/50 shadow-2xs">
            In Progress
          </span>
        )
      case 'Pending':
        return (
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-[#fef3c7] text-[#d97706] border border-amber-200/50 shadow-2xs">
            Pending
          </span>
        )
      case 'Not Started':
      default:
        return (
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-[#f1f5f9] text-[#64748b] border border-slate-200/50 shadow-2xs">
            Not Started
          </span>
        )
    }
  }

  return (
    <div
      className={`h-screen w-screen max-h-screen bg-[#f8fafc] overflow-hidden flex flex-col p-4 sm:p-6 lg:p-7 font-sans selection:bg-[var(--brand-cyan-100)] ${className}`}
      data-testid="dashboard-screen-container"
    >
      {/* ─── TOP HEADER BAR (OUTSIDE MAIN WHITE BOX) ─────────────────────── */}
      <header className="w-full flex items-center justify-between pb-3.5 shrink-0">
        {/* SOW Creator Pill Header with M42 Dark Logo (Font weight reduced by 1 unit to font-bold) */}
        <div className="bg-white border border-[#e2e8f0] rounded-full px-4 py-1.5 flex items-center gap-3 shadow-2xs">
          <Image
            src="/dark-logo.png"
            alt="M42 Logo"
            width={64}
            height={24}
            className="h-5 w-auto object-contain"
            priority
          />
          <span className="text-base font-bold text-[#0d212c] tracking-tight">
            SOW Creator
          </span>
        </div>

        {/* Profile & Notifications Header */}
        <div className="flex items-center gap-3">
          {/* Notification Bell Button */}
          <button
            type="button"
            aria-label="Notifications"
            className="w-9 h-9 rounded-full bg-white border border-gray-200 shadow-2xs hover:bg-gray-50 flex items-center justify-center relative cursor-pointer text-gray-600 transition"
          >
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white absolute top-1.5 right-1.5" />
          </button>

          {/* User Profile Pill with Avatar Image */}
          <div className="bg-white border border-gray-200 rounded-full pl-1.5 pr-4 py-1 flex items-center gap-3 shadow-2xs cursor-pointer hover:bg-gray-50 transition">
            <img
              src="/profile-user.png"
              alt="Ashika Jain Profile"
              className="w-8 h-8 rounded-full object-cover border border-gray-100 shadow-xs"
            />
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-[#0d212c] leading-tight">
                {userName} Jain
              </span>
              <span className="text-[10px] text-gray-500 font-medium leading-tight">
                {userRole}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ─── MAIN LAYOUT WRAPPER (Left Rail aligned with Main Content Box) ──── */}
      <div className="flex-1 flex flex-row items-stretch gap-2.5 sm:gap-3.5 min-h-0 overflow-hidden">
        
        {/* ─── LEFT NAVIGATION RAIL ────────────────────────────────────────── */}
        <aside className="w-12 sm:w-13 shrink-0 flex flex-col justify-between items-center py-0.5">
          {/* Home Icon: Aligned at top edge of main white card */}
          <button
            type="button"
            aria-label="Home"
            className="w-11 h-11 rounded-2xl bg-[#00C4C4] hover:bg-[#00a8a8] text-white shadow-md flex items-center justify-center cursor-pointer transition border-0"
          >
            <svg className="w-5.5 h-5.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </button>

          {/* Logout Icon: Aligned at bottom edge of main white card */}
          <button
            type="button"
            aria-label="Sign Out"
            onClick={onSignOut}
            title="Sign Out"
            className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-[#0d212c] hover:bg-gray-50 shadow-2xs flex items-center justify-center cursor-pointer transition"
          >
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </aside>

        {/* ─── MAIN WHITE CONTENT BOX ──────────────────────────────────────── */}
        <main className="flex-1 bg-white rounded-3xl border border-[#e2e8f0] shadow-sm p-4 sm:p-5 flex flex-col justify-between min-h-0 overflow-hidden">
          
          {/* GREETING TITLE (Font size reduced by 4 units, subtitle line removed) */}
          <section className="mb-2.5 shrink-0">
            <h1 className="text-lg sm:text-xl font-normal text-[#64748b] tracking-tight">
              Good morning, <strong className="font-bold text-[#0d212c]">{userName}</strong>
            </h1>
          </section>

          {/* ─── "CREATE A NEW SOW" HERO BANNER CARD ───────────────────────── */}
          <section className="bg-gradient-to-r from-[#e0f2fe]/80 via-[#f0f9ff]/90 to-[#e6f9fa] border border-[#bae6fd]/70 rounded-2xl px-5 py-3.5 sm:py-4 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xs mb-3.5 shrink-0">
            {/* Background vector curve overlays */}
            <div className="absolute -right-12 -top-12 w-64 h-64 bg-cyan-200/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-blue-200/20 rounded-full blur-2xl pointer-events-none" />

            {/* Banner Left Content */}
            <div className="relative z-10 flex flex-col items-start max-w-2xl text-left">
              <h2 className="text-lg sm:text-xl font-bold text-[#0d212c] tracking-tight mb-1">
                Create a new SOW
              </h2>
              {/* Single line description without wrapping */}
              <p className="text-xs sm:text-sm text-[#64748b] font-normal leading-relaxed whitespace-nowrap overflow-hidden text-ellipsis mb-3 max-w-full">
                Upload your project details and let AI help you get started with a structured SOW.
              </p>

              {/* + Create SOW CTA Button with #00C4C4 */}
              <button
                type="button"
                id="create-sow-cta-btn"
                onClick={() => setIsModalOpen(true)}
                className="bg-[#00C4C4] hover:bg-[#00a8a8] active:bg-[#008f8f] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-md transition duration-150 flex items-center gap-2 cursor-pointer border-0"
              >
                <svg className="w-4 h-4 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span>Create SOW</span>
              </button>
            </div>

            {/* Banner Right Enhanced Graphic Illustration (Multiple SOW cards) */}
            <div className="relative z-10 w-full max-w-[280px] flex items-center justify-center p-1">
              <div className="relative w-full h-28 flex items-center justify-center">
                {/* Back Card 1 */}
                <div className="absolute -left-2 w-28 h-20 bg-white rounded-xl border border-gray-100 shadow-sm transform -rotate-6 p-2 flex flex-col justify-between opacity-80">
                  <div className="text-[8px] font-bold text-gray-400">SOW #01</div>
                  <div className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[7px] font-semibold bg-[#dcfce7] text-[#16a34a] self-start">
                    ✓ Approved
                  </div>
                </div>

                {/* Back Card 2 */}
                <div className="absolute right-0 w-28 h-20 bg-white rounded-xl border border-gray-100 shadow-sm transform rotate-6 p-2 flex flex-col justify-between opacity-80">
                  <div className="text-[8px] font-bold text-gray-400">SOW #03</div>
                  <div className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[7px] font-semibold bg-[#ffedd5] text-[#c2410c] self-start">
                    ⏱ Review
                  </div>
                </div>

                {/* Main Front Active SOW Card */}
                <div className="absolute z-10 w-36 h-24 bg-white rounded-xl border border-gray-100 shadow-lg p-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-[#0d212c]">SOW #02</span>
                      <span className="text-[8px] font-semibold text-[#00C4C4]">AI Ready</span>
                    </div>
                    <div className="mt-1 w-full h-1 bg-slate-100 rounded-full" />
                    <div className="mt-1 w-3/4 h-1 bg-slate-100 rounded-full" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[7px] font-semibold bg-[#e0f2fe] text-[#0284c7]">
                      📈 In Progress
                    </div>
                    <span className="text-[7px] text-gray-400 font-medium">Verified</span>
                  </div>
                </div>

                {/* Large Cyan Circular + Action Button */}
                <div className="absolute -right-1 top-1 z-20 w-8 h-8 rounded-full bg-[#00C4C4] text-white shadow-md flex items-center justify-center border-0 cursor-pointer hover:scale-105 transition">
                  <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>

                {/* Dashed connector arc */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 280 112" fill="none">
                  <path d="M150 25 C 190 5, 230 15, 250 40" stroke="#00C4C4" strokeWidth="1.5" strokeDasharray="4 4" />
                </svg>
              </div>
            </div>
          </section>

          {/* ─── "ALL SOW'S" TABLE SECTION (Exact 16px gap spacing) ─── */}
          <section className="flex-1 flex flex-col min-h-0 overflow-hidden justify-start">
            
            {/* Header & Controls Row (Exact 16px gap below title controls: mb-4 = 16px) */}
            <div className="flex items-center justify-between gap-3 mb-4 shrink-0">
              <h3 className="text-base font-bold text-[#0d212c] tracking-tight">
                All SOW&apos;s
              </h3>

              {/* Search Bar & Filter Controls */}
              <div className="flex items-center gap-3">
                {/* Search Bar */}
                <div className="relative w-56">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search SOWs..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs font-medium text-[#0d212c] bg-white border border-[#e2e8f0] rounded-full outline-none placeholder:text-gray-400 focus:border-[var(--brand-cyan-500)] focus:ring-2 focus:ring-[var(--brand-cyan-100)] transition"
                    data-testid="search-sows-input"
                  />
                </div>

                {/* Filter Dropdown Toggle Button (Font weight reduced by 1 unit to font-semibold) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-[#0d212c] bg-white border border-[#e2e8f0] hover:bg-gray-50 rounded-full flex items-center gap-1.5 shadow-2xs cursor-pointer transition"
                    data-testid="filter-sows-btn"
                  >
                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span>Filter</span>
                  </button>

                  {/* Filter Popover */}
                  {showFilterDropdown && (
                    <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-30 p-2 flex flex-col gap-1">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1">
                        Filter Status
                      </div>
                      {['All', 'Completed', 'In Progress', 'Pending', 'Not Started'].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => {
                            setStatusFilter(st)
                            setShowFilterDropdown(false)
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition ${
                            statusFilter === st
                              ? 'bg-[var(--brand-cyan-50)] text-[var(--brand-cyan-700)] font-semibold'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SOW DATA TABLE - Height dynamically adjusted according to content */}
            <div className="border border-[#e2e8f0]/80 rounded-xl bg-white overflow-hidden h-auto shrink-0">
              <table className="w-full text-left border-collapse" data-testid="sows-table">
                <thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  <tr className="text-xs font-semibold text-[#64748b]">
                    <th className="py-2.5 px-4 font-semibold">SOW Name</th>
                    <th className="py-2.5 px-4 font-semibold">Client</th>
                    <th className="py-2.5 px-4 font-semibold">Last Updated</th>
                    <th className="py-2.5 px-4 font-semibold">Status</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]/60 text-xs font-medium text-[#0d212c]">
                  {filteredSOWs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400 font-medium">
                        No Statements of Work found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredSOWs.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* SOW Name (font-semibold instead of font-bold) */}
                        <td className="py-2.5 px-4 font-semibold text-[#0d212c]">
                          {item.name}
                        </td>
                        {/* Client */}
                        <td className="py-2.5 px-4 text-[#475569]">
                          {item.client}
                        </td>
                        {/* Last Updated */}
                        <td className="py-2.5 px-4 text-[#64748b]">
                          {item.lastUpdated}
                        </td>
                        {/* Status */}
                        <td className="py-2.5 px-4">
                          {renderStatusBadge(item.status)}
                        </td>
                        {/* Actions */}
                        <td className="py-2.5 px-4 text-right relative">
                          <button
                            type="button"
                            aria-label={`Actions for ${item.name}`}
                            onClick={() =>
                              setActiveMenuId(activeMenuId === item.id ? null : item.id)
                            }
                            className="p-1 rounded text-gray-400 hover:text-gray-700 transition cursor-pointer font-bold tracking-widest"
                          >
                            •••
                          </button>

                          {/* Row Actions Dropdown */}
                          {activeMenuId === item.id && (
                            <div className="absolute right-4 top-10 w-36 bg-white border border-gray-200 rounded-xl shadow-xl z-30 p-1 flex flex-col text-left">
                              <button
                                type="button"
                                onClick={() => setActiveMenuId(null)}
                                className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer"
                              >
                                View Details
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveMenuId(null)}
                                className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer"
                              >
                                Edit SOW
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSOW(item.id)}
                                className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg cursor-pointer font-semibold"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer & Pagination (Exact 16px gap above footer: mt-4 = 16px) */}
            <div className="flex items-center justify-between mt-4 text-xs text-[#64748b] font-medium shrink-0">
              <div>
                Showing {filteredSOWs.length} of {sows.length} SOWs
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Previous Page"
                  disabled
                  className="p-1 rounded text-gray-300 cursor-not-allowed"
                >
                  ‹
                </button>
                <div className="w-6 h-6 rounded-full bg-[#e0f2fe] text-[#0284c7] font-extrabold text-xs flex items-center justify-center shadow-2xs">
                  1
                </div>
                <button
                  type="button"
                  aria-label="Next Page"
                  disabled
                  className="p-1 rounded text-gray-300 cursor-not-allowed"
                >
                  ›
                </button>
              </div>
            </div>

          </section>
        </main>
      </div>

      {/* ─── "+ CREATE SOW" MODAL DIALOG ──────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-extrabold text-[#0d212c]">
                Create a New SOW
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1 cursor-pointer bg-transparent border-0"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600">
                  {modalError}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label htmlFor="sow-name-input" className="text-xs font-bold text-[#0d212c]">
                  SOW Project Name
                </label>
                <input
                  id="sow-name-input"
                  type="text"
                  value={newSOWName}
                  onChange={(e) => setNewSOWName(e.target.value)}
                  placeholder="e.g. Enterprise Cloud Migration"
                  className="w-full px-4 py-2.5 text-xs font-medium border border-gray-300 rounded-xl outline-none focus:border-[var(--brand-cyan-500)] focus:ring-2 focus:ring-[var(--brand-cyan-100)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="client-name-input" className="text-xs font-bold text-[#0d212c]">
                  Client Organization
                </label>
                <input
                  id="client-name-input"
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="e.g. Acme Corporation"
                  className="w-full px-4 py-2.5 text-xs font-medium border border-gray-300 rounded-xl outline-none focus:border-[var(--brand-cyan-500)] focus:ring-2 focus:ring-[var(--brand-cyan-100)]"
                />
              </div>

              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                <span className="w-5 h-5 rounded-full bg-[var(--brand-cyan-100)] text-[var(--brand-cyan-600)] flex items-center justify-center font-bold text-xs">
                  ✨
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  AI assistant will automatically generate SOW sections.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer bg-transparent border-0"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-[var(--brand-cyan-500)] hover:bg-[var(--brand-cyan-600)] rounded-xl shadow-md transition cursor-pointer border-0"
                >
                  Generate SOW
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
