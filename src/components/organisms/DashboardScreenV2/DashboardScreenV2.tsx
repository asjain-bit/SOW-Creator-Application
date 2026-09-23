/**
 * DashboardScreenV2 — Organism
 * New SOW Creator dashboard with KPI cards (procur_AI card structure),
 * tabbed SOW table, search + status filter, sortable columns, pagination,
 * and "Create New SOW" CTA. All styling, colors, fonts and copy are
 * SOW Creator brand — only the layout structure is referenced from procur_AI.
 */

'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import {
  DashboardScreenV2Props,
  SOWItem,
  SOWStatus,
  KPIItem,
  ActiveNav,
} from './DashboardScreenV2.types'
import { CreateSOWModal } from '@/components/molecules/CreateSOWModal'
import type { UploadedFile } from '@/components/molecules/CreateSOWModal'

/* ─── Static Data ─────────────────────────────────────────────────────────── */

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

const KPIS: KPIItem[] = [
  {
    label: 'Total SOWs',
    value: '8',
    iconBg: '#e0f2fe',
    iconColor: '#0284c7',
    subLabel: 'vs last month',
    subValue: '+2',
    trend: '↗',
    trendColor: '#16a34a',
  },
  {
    label: 'In Progress',
    value: '3',
    iconBg: '#e0f2fe',
    iconColor: '#0284c7',
    subLabel: 'Active this week',
    subValue: '2',
  },
  {
    label: 'Pending Review',
    value: '2',
    iconBg: '#fef3c7',
    iconColor: '#d97706',
    subLabel: 'Awaiting sign-off',
    subValue: '2',
    trend: null,
  },
  {
    label: 'Completed',
    value: '2',
    iconBg: '#dcfce7',
    iconColor: '#16a34a',
    subLabel: 'This quarter',
    subValue: '2',
    trend: '↗',
    trendColor: '#16a34a',
  },
  {
    label: 'Not Started',
    value: '1',
    iconBg: '#f1f5f9',
    iconColor: '#64748b',
    subLabel: 'Drafts pending',
    subValue: '1',
  },
]

const STATUS_OPTIONS: SOWStatus[] = ['Completed', 'In Progress', 'Pending', 'Not Started']
const ROWS_PER_PAGE_OPTIONS = [5, 10, 25]

type SortCol = 'name' | 'client' | 'lastUpdated' | 'status' | null
type SortDir = 'asc' | 'desc'
type ActiveTab = 'my' | 'all'

/* ─── Status badge ────────────────────────────────────────────────────────── */

function StatusBadge({ status }: { status: SOWStatus }) {
  const styles: Record<SOWStatus, string> = {
    Completed: 'bg-[#dcfce7] text-[#16a34a] border border-green-200/50',
    'In Progress': 'bg-[#e0f2fe] text-[#0284c7] border border-blue-200/50',
    Pending: 'bg-[#fef3c7] text-[#d97706] border border-amber-200/50',
    'Not Started': 'bg-[#f1f5f9] text-[#64748b] border border-slate-200/50',
  }
  return (
    <span
      className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  )
}

/* ─── Filter Dropdown ─────────────────────────────────────────────────────── */

function FilterDropdown({
  label,
  options,
  active,
  onSelect,
}: {
  label: string
  options: string[]
  active: string | null
  onSelect: (val: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        style={
          open || active
            ? { background: 'rgba(0,196,196,0.12)', border: '1px solid rgba(0,196,196,0.4)' }
            : {
                background: 'rgba(255,255,255,0.6)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.8)',
              }
        }
        className="flex items-center gap-1.5 h-9 px-3 text-xs font-medium rounded-lg transition-all cursor-pointer text-[#64748b]"
      >
        {active ? `${label}: ${active}` : label}
        <svg
          className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div
          style={{
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.9)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          }}
          className="absolute top-[calc(100%+4px)] left-0 z-50 rounded-xl py-1.5 min-w-[160px]"
        >
          <div
            onClick={() => {
              onSelect(null)
              setOpen(false)
            }}
            className={`px-3 py-2 text-xs cursor-pointer rounded-md mx-1 transition-colors ${!active ? 'text-[#00C4C4] font-semibold bg-[#e6f9fa]' : 'text-[#64748b] hover:bg-[#f8fafc]'}`}
          >
            All
          </div>
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => {
                onSelect(opt)
                setOpen(false)
              }}
              className={`px-3 py-2 text-xs cursor-pointer rounded-md mx-1 transition-colors ${active === opt ? 'text-[#00C4C4] font-semibold bg-[#e6f9fa]' : 'text-[#0d212c] hover:bg-[#f8fafc]'}`}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Sort icon ───────────────────────────────────────────────────────────── */

function SortIcon({ col, sortCol, sortDir }: { col: SortCol; sortCol: SortCol; sortDir: SortDir }) {
  if (sortCol !== col) {
    return (
      <svg className="w-3 h-3 text-[#cbd5e1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"
        />
      </svg>
    )
  }
  return sortDir === 'asc' ? (
    <svg className="w-3 h-3 text-[#00C4C4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
    </svg>
  ) : (
    <svg className="w-3 h-3 text-[#00C4C4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

/* ─── Main Component ──────────────────────────────────────────────────────── */

export const DashboardScreenV2: React.FC<DashboardScreenV2Props> = ({
  userName = 'Ashika',
  userRole = 'PMO',
  userInitials = 'AJ',
  initialSOWs = DEFAULT_SOWS,
  onSignOut,
  onCreateSOW,
  onProceedToSOW,
  activeNav = 'dashboard',
  contentOverride,
  className = '',
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeTab, setActiveTab] = useState<ActiveTab>('my')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [sortCol, setSortCol] = useState<SortCol>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [openRpp, setOpenRpp] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [displayedRows, setDisplayedRows] = useState<SOWItem[]>(initialSOWs)
  const rppRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!openRpp) return
    function handle(e: MouseEvent) {
      if (rppRef.current && !rppRef.current.contains(e.target as Node)) setOpenRpp(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [openRpp])

  useEffect(() => {
    setIsSearching(true)
    const timer = setTimeout(
      () => {
        let rows = [...initialSOWs]
        if (search.trim()) {
          const q = search.toLowerCase()
          rows = rows.filter(
            (r) => r.name.toLowerCase().includes(q) || r.client.toLowerCase().includes(q)
          )
        }
        if (statusFilter) {
          rows = rows.filter((r) => r.status === statusFilter)
        }
        if (sortCol) {
          rows = rows.sort((a, b) => {
            const av = a[sortCol].toLowerCase()
            const bv = b[sortCol].toLowerCase()
            return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
          })
        }
        setDisplayedRows(rows)
        setPage(1)
        setIsSearching(false)
      },
      search.trim() ? 400 : 100
    )
    return () => clearTimeout(timer)
  }, [search, statusFilter, sortCol, sortDir, initialSOWs])

  const totalRows = displayedRows.length
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage))
  const paginatedRows = displayedRows.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  const handleSort = (col: SortCol) => {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortCol(col)
      setSortDir('asc')
    }
  }

  const completedCount = initialSOWs.filter((s) => s.status === 'Completed').length
  const inProgressCount = initialSOWs.filter((s) => s.status === 'In Progress').length

  return (
    <div
      className={`h-screen w-screen max-h-screen overflow-hidden flex flex-col font-sans relative ${className}`}
      data-testid="dashboard-screen-v2-container"
      style={{ background: '#e8f8f8' }}
    >
      {/* ─── ANIMATED RADIAL GRADIENT BACKGROUND ─────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {/* Base static gradient */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 75% 65% at 15% 18%, #00c4c472 0%, transparent 60%), radial-gradient(ellipse 55% 50% at 80% 14%, #1ad3db44 0%, transparent 55%), radial-gradient(ellipse 50% 55% at 68% 82%, #00a8a838 0%, transparent 52%), radial-gradient(ellipse 65% 45% at 38% 88%, #b2f0f055 0%, transparent 58%)',
          }}
        />
        {/* Slow colour-breathing overlay — hue-rotates across the teal range, no movement */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 90% 80% at 50% 40%, #00c4c422 0%, transparent 70%), radial-gradient(ellipse 60% 60% at 85% 70%, #008f8f28 0%, transparent 55%)',
            animation: 'bgBreathe 12s ease-in-out infinite alternate',
          }}
        />
        <style>{`
          @keyframes bgBreathe {
            0%   { filter: hue-rotate(0deg) brightness(1); opacity: 0.7; }
            50%  { filter: hue-rotate(12deg) brightness(1.06); opacity: 1; }
            100% { filter: hue-rotate(-8deg) brightness(0.97); opacity: 0.8; }
          }
        `}</style>
      </div>

      {/* All content sits above the animated background */}
      <div className="relative flex h-full gap-4 p-4" style={{ zIndex: 1 }}>
        {/* ─── LEFT SIDEBAR ─────────────────────────────────────────────── */}
        <nav
          className="flex flex-col shrink-0 rounded-2xl overflow-hidden"
          style={{
            width: 210,
            background: 'rgba(8,26,26,0.82)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(0,196,196,0.18)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.28), 1px 0 0 rgba(0,196,196,0.08) inset',
          }}
        >
          {/* Logo area */}
          <div
            className="flex items-center gap-2.5 px-5 py-5 shrink-0"
            style={{ borderBottom: '1px solid rgba(0,196,196,0.12)' }}
          >
            <Image
              src="/dark-logo.png"
              alt="M42 Logo"
              width={56}
              height={20}
              className="h-5 w-auto object-contain brightness-0 invert"
              priority
            />
            <span className="text-sm font-bold tracking-tight" style={{ color: '#e0fafa' }}>
              SOW Creator
            </span>
          </div>

          {/* Nav items */}
          <div className="flex flex-col gap-1 px-3 py-4 flex-1">
            {(
              [
                {
                  id: 'dashboard' as ActiveNav,
                  label: 'Dashboard',
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  ),
                },
                {
                  id: 'my-sows' as ActiveNav,
                  label: 'My SOWs',
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  ),
                },
                {
                  id: 'templates' as ActiveNav,
                  label: 'Templates',
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                      d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 14a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1v-5zm10 0a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5z"
                    />
                  ),
                },
                {
                  id: 'analytics' as ActiveNav,
                  label: 'Analytics',
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  ),
                },
              ] as { id: ActiveNav; label: string; icon: React.ReactNode }[]
            ).map(({ id, label, icon }) => {
              const isActive = activeNav === id
              return (
                <button
                  key={id}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left cursor-pointer transition-all"
                  style={
                    isActive
                      ? {
                          background: 'rgba(0,196,196,0.18)',
                          border: '1px solid rgba(0,196,196,0.28)',
                          color: '#7df0f0',
                        }
                      : {
                          background: 'transparent',
                          border: '1px solid transparent',
                          color: 'rgba(180,230,230,0.6)',
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      ;(e.currentTarget as HTMLButtonElement).style.background =
                        'rgba(0,196,196,0.08)'
                      ;(e.currentTarget as HTMLButtonElement).style.color = '#a8ecec'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                      ;(e.currentTarget as HTMLButtonElement).style.color = 'rgba(180,230,230,0.6)'
                    }
                  }}
                >
                  <svg
                    className="w-4.5 h-4.5 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {icon}
                  </svg>
                  <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    {label}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Bottom: notification + user + logout */}
          <div
            className="px-3 py-4 shrink-0"
            style={{ borderTop: '1px solid rgba(0,196,196,0.12)' }}
          >
            {/* Notification row */}
            <button
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl cursor-pointer transition-all mb-1 relative"
              style={{
                background: 'transparent',
                border: '1px solid transparent',
                color: 'rgba(180,230,230,0.6)',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,196,196,0.08)'
                ;(e.currentTarget as HTMLButtonElement).style.color = '#a8ecec'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                ;(e.currentTarget as HTMLButtonElement).style.color = 'rgba(180,230,230,0.6)'
              }}
            >
              <span className="relative shrink-0">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#00C4C4] rounded-full text-white text-[8px] font-bold flex items-center justify-center">
                  2
                </span>
              </span>
              <span className="text-sm font-medium">Notifications</span>
            </button>

            {/* User row */}
            <div
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1"
              style={{ background: 'rgba(0,196,196,0.08)' }}
            >
              <div className="w-7 h-7 rounded-full bg-[#00C4C4] text-white text-xs font-bold flex items-center justify-center shrink-0">
                {userInitials}
              </div>
              <div className="flex flex-col leading-tight min-w-0">
                <span className="text-xs font-semibold truncate" style={{ color: '#e0fafa' }}>
                  {userName}
                </span>
                <span className="text-[10px]" style={{ color: 'rgba(180,230,230,0.55)' }}>
                  {userRole}
                </span>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={onSignOut}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl cursor-pointer transition-all"
              style={{
                background: 'transparent',
                border: '1px solid transparent',
                color: 'rgba(180,230,230,0.5)',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)'
                ;(e.currentTarget as HTMLButtonElement).style.color = '#fca5a5'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                ;(e.currentTarget as HTMLButtonElement).style.color = 'rgba(180,230,230,0.5)'
              }}
            >
              <svg
                className="w-4.5 h-4.5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </nav>

        {/* ─── MAIN GLASS CONTENT BOX ───────────────────────────────────── */}
        <main
          style={{
            background: 'rgba(255,255,255,0.52)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.72)',
            boxShadow: '0 8px 40px rgba(0,196,196,0.10), 0 1px 0 rgba(255,255,255,0.8) inset',
          }}
          className="flex-1 rounded-2xl flex flex-col overflow-hidden min-h-0"
        >
          {/* When a content override is provided (e.g. SOW detail), render it directly */}
          {contentOverride ? (
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">{contentOverride}</div>
          ) : (
            /* Scrollable inner content */
            <div className="flex-1 overflow-y-auto p-6">
              {/* Greeting + Create SOW CTA */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h1 className="text-base font-bold text-[#0d212c]">Hi {userName} 👋</h1>
                  <p className="text-xs text-[#64748b] font-normal mt-0.5">
                    Here&apos;s your SOW overview for today.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(true)
                    onCreateSOW?.()
                  }}
                  className="flex items-center gap-2 bg-[#00C4C4] hover:bg-[#00a8a8] active:bg-[#008f8f] text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md transition-colors cursor-pointer border-0"
                  style={{ boxShadow: '0 4px 20px rgba(0,196,196,0.35)' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create New SOW
                </button>
              </div>

              {/* ─── KPI CARDS ──────────────────────────────────────────────── */}
              <p className="text-xs font-bold text-[#0d212c] mb-3 uppercase tracking-wide">
                My Overview
              </p>
              <div className="grid grid-cols-5 gap-3 mb-6">
                {KPIS.map((k, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(255,255,255,0.6)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255,255,255,0.8)',
                      boxShadow: '0 2px 12px rgba(0,196,196,0.07)',
                    }}
                    className="rounded-2xl p-4 flex flex-col"
                  >
                    {/* Icon + label + value row */}
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                        style={{ background: k.iconBg }}
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke={k.iconColor}
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="text-xs font-medium text-[#64748b] leading-tight">
                          {k.label}
                        </span>
                        <span className="text-2xl font-bold text-[#0d212c] leading-tight tracking-tight">
                          {k.value}
                        </span>
                      </div>
                    </div>
                    {/* Divider */}
                    <div className="h-px mb-3" style={{ background: 'rgba(0,196,196,0.15)' }} />
                    {/* Sub info */}
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-semibold text-[#94a3b8]">{k.subValue}</span>
                      {k.trend && (
                        <span className="text-sm font-semibold" style={{ color: k.trendColor }}>
                          {k.trend}
                        </span>
                      )}
                      <span className="text-xs text-[#94a3b8]">{k.subLabel}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* ─── TABS ───────────────────────────────────────────────────── */}
              <div
                className="flex gap-6 mb-4"
                style={{ borderBottom: '1px solid rgba(0,196,196,0.18)' }}
              >
                {(['my', 'all'] as ActiveTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2.5 text-sm font-medium cursor-pointer bg-transparent border-0 border-b-2 transition-all ${
                      activeTab === tab
                        ? 'border-[#00C4C4] text-[#00C4C4]'
                        : 'border-transparent text-[#94a3b8] hover:text-[#0d212c]'
                    }`}
                    style={{ marginBottom: -1 }}
                  >
                    {tab === 'my' ? 'My SOWs' : 'All SOWs'}
                    {tab === 'my' && (
                      <span
                        className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(0,196,196,0.12)', color: '#64748b' }}
                      >
                        {inProgressCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* ─── FILTER BAR ─────────────────────────────────────────────── */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {/* Search */}
                <div
                  style={{
                    background: 'rgba(255,255,255,0.6)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.8)',
                  }}
                  className="flex items-center gap-2 rounded-lg px-3 h-9 w-60 focus-within:ring-2 focus-within:ring-[#00C4C4]/20 transition-all"
                >
                  <svg
                    className="w-3.5 h-3.5 text-[#94a3b8] shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search SOW or client..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 border-0 outline-none bg-transparent text-sm text-[#0d212c] placeholder:text-[#94a3b8] font-normal"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="text-[#94a3b8] hover:text-[#0d212c] cursor-pointer"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                <FilterDropdown
                  label="Status"
                  options={STATUS_OPTIONS}
                  active={statusFilter}
                  onSelect={setStatusFilter}
                />

                {statusFilter && (
                  <button
                    onClick={() => setStatusFilter(null)}
                    className="flex items-center gap-1.5 px-3 h-9 text-xs font-semibold text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer border-0"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Clear filters
                  </button>
                )}
              </div>

              {/* ─── TABLE ──────────────────────────────────────────────────── */}
              <div
                style={{
                  background: 'rgba(255,255,255,0.55)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.75)',
                  borderRadius: 16,
                  overflow: 'hidden',
                }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse" style={{ minWidth: 700 }}>
                    <thead>
                      <tr
                        style={{
                          background: 'rgba(0,196,196,0.06)',
                          borderBottom: '1px solid rgba(0,196,196,0.12)',
                        }}
                      >
                        {[
                          { label: 'SOW Name', col: 'name' as SortCol, width: '35%' },
                          { label: 'Client', col: 'client' as SortCol, width: '20%' },
                          { label: 'Last Updated', col: 'lastUpdated' as SortCol, width: '20%' },
                          { label: 'Status', col: 'status' as SortCol, width: '15%' },
                          { label: '', col: null, width: '10%' },
                        ].map(({ label, col, width }) => (
                          <th
                            key={label || 'actions'}
                            onClick={col ? () => handleSort(col) : undefined}
                            style={{ width }}
                            className={`px-4 py-3 text-left text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider ${col ? 'cursor-pointer select-none hover:text-[#0d212c]' : ''}`}
                          >
                            {label && (
                              <span className="inline-flex items-center gap-1.5">
                                {label}
                                {col && <SortIcon col={col} sortCol={sortCol} sortDir={sortDir} />}
                              </span>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {isSearching ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <tr
                            key={`skel-${i}`}
                            style={{ borderBottom: '1px solid rgba(0,196,196,0.07)' }}
                          >
                            {[35, 20, 20, 15, 10].map((w, j) => (
                              <td key={j} className="px-4 py-3.5">
                                <div
                                  className="rounded animate-pulse"
                                  style={{
                                    height: 14,
                                    width: `${w * 0.7}%`,
                                    background: 'rgba(0,196,196,0.1)',
                                  }}
                                />
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : paginatedRows.length > 0 ? (
                        paginatedRows.map((row, idx) => (
                          <tr
                            key={row.id}
                            className="group transition-colors cursor-pointer"
                            style={{
                              borderBottom:
                                idx < paginatedRows.length - 1
                                  ? '1px solid rgba(0,196,196,0.08)'
                                  : undefined,
                            }}
                            onMouseEnter={(e) => {
                              ;(e.currentTarget as HTMLTableRowElement).style.background =
                                'rgba(0,196,196,0.05)'
                            }}
                            onMouseLeave={(e) => {
                              ;(e.currentTarget as HTMLTableRowElement).style.background = ''
                            }}
                          >
                            <td className="px-4 py-3.5 text-sm font-medium text-[#0d212c] max-w-0">
                              <span className="block truncate">{row.name}</span>
                            </td>
                            <td className="px-4 py-3.5 text-sm text-[#64748b]">{row.client}</td>
                            <td className="px-4 py-3.5 text-sm text-[#64748b] whitespace-nowrap">
                              {row.lastUpdated}
                            </td>
                            <td className="px-4 py-3.5">
                              <StatusBadge status={row.status} />
                            </td>
                            <td className="px-4 py-3.5">
                              <button className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs font-medium text-[#00C4C4] hover:text-[#00a8a8] cursor-pointer bg-transparent border-0">
                                Open
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-12 text-center">
                            <p className="text-sm font-medium text-[#94a3b8]">
                              No SOWs match your search.
                            </p>
                            <p className="text-xs text-[#cbd5e1] mt-1">
                              Try adjusting your filters or search term.
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ─── PAGINATION ─────────────────────────────────────────── */}
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{
                    borderTop: '1px solid rgba(0,196,196,0.1)',
                    background: 'rgba(255,255,255,0.3)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#94a3b8]">Rows per page:</span>
                    <div ref={rppRef} className="relative">
                      <button
                        onClick={() => setOpenRpp((v) => !v)}
                        style={
                          openRpp
                            ? {
                                background: 'rgba(0,196,196,0.12)',
                                border: '1px solid rgba(0,196,196,0.4)',
                              }
                            : {
                                background: 'rgba(255,255,255,0.6)',
                                border: '1px solid rgba(255,255,255,0.8)',
                              }
                        }
                        className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-lg transition-all cursor-pointer text-[#64748b]"
                      >
                        {rowsPerPage}
                        <svg
                          className={`w-3 h-3 transition-transform ${openRpp ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {openRpp && (
                        <div
                          style={{
                            background: 'rgba(255,255,255,0.9)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255,255,255,0.9)',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                          }}
                          className="absolute bottom-[calc(100%+4px)] left-0 rounded-xl py-1.5 z-50 min-w-[80px]"
                        >
                          {ROWS_PER_PAGE_OPTIONS.map((n) => (
                            <div
                              key={n}
                              onClick={() => {
                                setRowsPerPage(n)
                                setPage(1)
                                setOpenRpp(false)
                              }}
                              className={`px-3 py-2 text-xs cursor-pointer transition-colors ${rowsPerPage === n ? 'text-[#00C4C4] font-semibold' : 'text-[#0d212c] hover:bg-[#f8fafc]'}`}
                            >
                              {n}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-[#94a3b8]">
                      Showing {totalRows === 0 ? 0 : (page - 1) * rowsPerPage + 1}–
                      {Math.min(page * rowsPerPage, totalRows)} of {totalRows} SOWs
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => p - 1)}
                      disabled={page === 1}
                      style={{
                        background: 'rgba(255,255,255,0.6)',
                        border: '1px solid rgba(255,255,255,0.8)',
                      }}
                      className="flex items-center gap-1 h-8 px-3 text-xs font-medium rounded-lg text-[#64748b] cursor-pointer disabled:opacity-40 disabled:cursor-default transition-colors"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page === totalPages}
                      style={{
                        background: 'rgba(255,255,255,0.6)',
                        border: '1px solid rgba(255,255,255,0.8)',
                      }}
                      className="flex items-center gap-1 h-8 px-3 text-xs font-medium rounded-lg text-[#64748b] cursor-pointer disabled:opacity-40 disabled:cursor-default transition-colors"
                    >
                      Next
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}{' '}
          {/* end contentOverride conditional */}
        </main>
      </div>

      {/* Create SOW upload modal — only shown when no contentOverride */}
      {!contentOverride && (
        <CreateSOWModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onProceed={(uploadedFiles: UploadedFile[]) => {
            setShowCreateModal(false)
            onProceedToSOW?.(uploadedFiles)
          }}
        />
      )}
    </div>
  )
}
