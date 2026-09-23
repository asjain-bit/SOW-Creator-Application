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
import { AuditLogView } from '../AuditLogView'

/* ─── Static Data ─────────────────────────────────────────────────────────── */

const DEFAULT_SOWS: SOWItem[] = [
  {
    id: 'sow-1',
    name: 'Customer Transformation Program',
    client: 'Acme Corp',
    createdBy: 'Ashika Jain',
    createdDate: 'Aug 01, 2026',
    lastUpdated: 'Today, 10:24 AM',
    status: 'Completed',
  },
  {
    id: 'sow-2',
    name: 'Digital Workplace Enablement',
    client: 'Globex Inc',
    createdBy: 'Ashika Jain',
    createdDate: 'Aug 10, 2026',
    lastUpdated: 'Aug 28, 2026',
    status: 'In Progress',
  },
  {
    id: 'sow-3',
    name: 'Cloud Modernization Initiative',
    client: 'TechSphere',
    createdBy: 'Rohan Mehta',
    createdDate: 'Aug 05, 2026',
    lastUpdated: 'Aug 18, 2026',
    status: 'In Progress',
  },
  {
    id: 'sow-4',
    name: 'IT Infrastructure Revamp',
    client: 'Zenith Ltd',
    createdBy: 'Priya Sharma',
    createdDate: 'Jul 28, 2026',
    lastUpdated: 'Aug 12, 2026',
    status: 'Pending',
  },
  {
    id: 'sow-5',
    name: 'Data Analytics Platform',
    client: 'Orion Group',
    createdBy: 'Ashika Jain',
    createdDate: 'Jul 22, 2026',
    lastUpdated: 'Aug 10, 2026',
    status: 'Not Started',
  },
  {
    id: 'sow-6',
    name: 'Enterprise Security Architecture',
    client: 'CyberShield',
    createdBy: 'Rohan Mehta',
    createdDate: 'Jul 15, 2026',
    lastUpdated: 'Aug 05, 2026',
    status: 'Completed',
  },
  {
    id: 'sow-7',
    name: 'AI Automation & Workflow Setup',
    client: 'Innovate LLC',
    createdBy: 'Priya Sharma',
    createdDate: 'Jul 10, 2026',
    lastUpdated: 'Jul 29, 2026',
    status: 'In Progress',
  },
  {
    id: 'sow-8',
    name: 'Modern Data Warehouse Migration',
    client: 'Apex Global',
    createdBy: 'Ashika Jain',
    createdDate: 'Jul 02, 2026',
    lastUpdated: 'Jul 21, 2026',
    status: 'Pending',
  },
  {
    id: 'sow-9',
    name: 'ERP Integration & Rollout',
    client: 'Nexus Corp',
    createdBy: 'Rohan Mehta',
    createdDate: 'Jun 25, 2026',
    lastUpdated: 'Jul 18, 2026',
    status: 'Completed',
  },
  {
    id: 'sow-10',
    name: 'Supply Chain Digitization',
    client: 'LogiTech Pvt',
    createdBy: 'Priya Sharma',
    createdDate: 'Jun 18, 2026',
    lastUpdated: 'Jul 10, 2026',
    status: 'In Progress',
  },
  {
    id: 'sow-11',
    name: 'HR Systems Modernization',
    client: 'PeopleFirst',
    createdBy: 'Ashika Jain',
    createdDate: 'Jun 10, 2026',
    lastUpdated: 'Jul 05, 2026',
    status: 'Pending',
  },
  {
    id: 'sow-12',
    name: 'Customer 360 Analytics',
    client: 'RetailEdge',
    createdBy: 'Rohan Mehta',
    createdDate: 'Jun 03, 2026',
    lastUpdated: 'Jun 28, 2026',
    status: 'Not Started',
  },
  {
    id: 'sow-13',
    name: 'DevOps Transformation',
    client: 'BuildFast Inc',
    createdBy: 'Priya Sharma',
    createdDate: 'May 27, 2026',
    lastUpdated: 'Jun 20, 2026',
    status: 'Completed',
  },
  {
    id: 'sow-14',
    name: 'Salesforce CRM Implementation',
    client: 'GrowthHive',
    createdBy: 'Ashika Jain',
    createdDate: 'May 20, 2026',
    lastUpdated: 'Jun 14, 2026',
    status: 'In Progress',
  },
  {
    id: 'sow-15',
    name: 'Cybersecurity Risk Assessment',
    client: 'SafeNet Ltd',
    createdBy: 'Rohan Mehta',
    createdDate: 'May 12, 2026',
    lastUpdated: 'Jun 08, 2026',
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
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-normal ${styles[status]}`}
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
        className="flex items-center gap-1.5 h-9 px-3 text-xs font-normal rounded-lg transition-all cursor-pointer text-[#64748b]"
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
      <svg className="w-3 h-3 text-[#64748b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

/* ─── All SOWs View ──────────────────────────────────────────────────────── */

type AllSOWsSortCol =
  'name' | 'client' | 'createdBy' | 'createdDate' | 'lastUpdated' | 'status' | null

function AllSOWsView({ sows, onOpenSOWV2 }: { sows: SOWItem[]; onOpenSOWV2?: () => void }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [creatorFilter, setCreatorFilter] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState<string | null>(null)
  const [sortCol, setSortCol] = useState<AllSOWsSortCol>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const creators = Array.from(new Set(sows.map((s) => s.createdBy))).sort()
  const dateOptions = ['Last 7 days', 'Last 30 days', 'Last 3 months', 'Last 6 months']

  const handleSort = (col: AllSOWsSortCol) => {
    if (sortCol === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortCol(col)
      setSortDir('asc')
    }
  }

  const filtered = sows
    .filter((r) => {
      if (search.trim()) {
        const q = search.toLowerCase()
        if (!r.name.toLowerCase().includes(q) && !r.client.toLowerCase().includes(q)) return false
      }
      if (statusFilter && r.status !== statusFilter) return false
      if (creatorFilter && r.createdBy !== creatorFilter) return false
      return true
    })
    .sort((a, b) => {
      if (!sortCol) return 0
      const av = a[sortCol].toLowerCase()
      const bv = b[sortCol].toLowerCase()
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })

  const cols: { label: string; col: AllSOWsSortCol; width: string }[] = [
    { label: 'SOW Name', col: 'name', width: '28%' },
    { label: 'Client', col: 'client', width: '14%' },
    { label: 'Created By', col: 'createdBy', width: '14%' },
    { label: 'Created Date', col: 'createdDate', width: '14%' },
    { label: 'Last Updated', col: 'lastUpdated', width: '14%' },
    { label: 'Status', col: 'status', width: '12%' },
    { label: '', col: null, width: '4%' },
  ]

  return (
    <div
      style={{
        padding: '24px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0d212c', margin: 0 }}>All SOWs</h2>
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: '#64748b',
              background: 'rgba(0,196,196,0.1)',
              borderRadius: 8,
              padding: '3px 10px',
            }}
          >
            {filtered.length} of {sows.length}
          </span>
        </div>
        {/* Filter bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Search */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(255,255,255,0.9)',
              borderRadius: 9,
              padding: '0 11px',
              height: 34,
            }}
          >
            <svg
              width="13"
              height="13"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search SOW or client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: 12,
                color: '#0d212c',
                width: 180,
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: 0,
                  display: 'flex',
                }}
              >
                <svg
                  width="11"
                  height="11"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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
          <FilterDropdown
            label="Created By"
            options={creators}
            active={creatorFilter}
            onSelect={setCreatorFilter}
          />
          <FilterDropdown
            label="Created Date"
            options={dateOptions}
            active={dateFilter}
            onSelect={setDateFilter}
          />
          {(statusFilter || creatorFilter || dateFilter) && (
            <button
              onClick={() => {
                setStatusFilter(null)
                setCreatorFilter(null)
                setDateFilter(null)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '0 12px',
                height: 34,
                fontSize: 12,
                fontWeight: 600,
                color: '#ef4444',
                background: '#fef2f2',
                border: 'none',
                borderRadius: 9,
                cursor: 'pointer',
              }}
            >
              <svg
                width="11"
                height="11"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          background: 'rgba(255,255,255,0.6)',
          border: '1px solid rgba(255,255,255,0.85)',
          borderRadius: 14,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 2px 12px rgba(0,196,196,0.06)',
        }}
      >
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
              <tr
                style={{
                  background: '#ffffff',
                  borderBottom: '1px solid rgba(0,196,196,0.1)',
                }}
              >
                {cols.map(({ label, col, width }) => (
                  <th
                    key={label || '__actions'}
                    onClick={col ? () => handleSort(col) : undefined}
                    style={{
                      width,
                      padding: '11px 14px',
                      textAlign: 'left',
                      fontSize: 10,
                      fontWeight: 600,
                      color: '#475569',
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      cursor: col ? 'pointer' : 'default',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {label && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {label}
                        {col && (
                          <SortIcon
                            col={col as SortCol}
                            sortCol={sortCol as SortCol}
                            sortDir={sortDir}
                          />
                        )}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: '48px 14px',
                      textAlign: 'center',
                      fontSize: 13,
                      color: '#94a3b8',
                    }}
                  >
                    No SOWs match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((row, idx) => (
                  <tr
                    key={row.id}
                    onClick={() => {
                      if (idx === 1) onOpenSOWV2?.()
                    }}
                    style={{
                      borderBottom:
                        idx < filtered.length - 1 ? '1px solid rgba(0,196,196,0.07)' : undefined,
                      cursor: idx === 1 ? 'pointer' : 'default',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLTableRowElement).style.background =
                        'rgba(0,196,196,0.04)'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLTableRowElement).style.background = ''
                    }}
                  >
                    <td
                      style={{
                        padding: '11px 14px',
                        fontSize: 13,
                        fontWeight: 500,
                        color: '#0d212c',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {row.name}
                    </td>
                    <td
                      style={{
                        padding: '11px 14px',
                        fontSize: 12,
                        color: '#64748b',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {row.client}
                    </td>
                    <td
                      style={{
                        padding: '11px 14px',
                        fontSize: 12,
                        color: '#64748b',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {row.createdBy}
                    </td>
                    <td
                      style={{
                        padding: '11px 14px',
                        fontSize: 12,
                        color: '#94a3b8',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {row.createdDate}
                    </td>
                    <td
                      style={{
                        padding: '11px 14px',
                        fontSize: 12,
                        color: '#94a3b8',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {row.lastUpdated}
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <StatusBadge status={row.status} />
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <button
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#00C4C4',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          opacity: 0,
                          transition: 'opacity 0.12s',
                        }}
                        onMouseEnter={(e) => {
                          ;(e.currentTarget as HTMLButtonElement).style.opacity = '1'
                        }}
                        onMouseLeave={(e) => {
                          ;(e.currentTarget as HTMLButtonElement).style.opacity = '0'
                        }}
                      >
                        Open{' '}
                        <svg
                          width="10"
                          height="10"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Footer count */}
        <div
          style={{
            padding: '10px 14px',
            borderTop: '1px solid rgba(0,196,196,0.08)',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: 12, color: '#94a3b8' }}>
            Showing {filtered.length} of {sows.length} SOWs
          </span>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Component ──────────────────────────────────────────────────────── */

export const DashboardScreenV2: React.FC<DashboardScreenV2Props> = ({
  userName = 'Ashika',
  userRole = 'PMO',
  userInitials = 'AJ',
  userImage = '/profile-user.png',
  initialSOWs = DEFAULT_SOWS,
  onSignOut,
  onCreateSOW,
  onProceedToSOW,
  activeNav = 'dashboard',
  contentOverride,
  className = '',
  onNavHome,
  onNavAllSOWs,
  onNavAuditLog,
  onOpenSOWV2,
  onOpenSOWContributor,
}) => {
  const isContributor = userRole === 'Contributor'
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [homeView, setHomeView] = useState<'home' | 'all-sows' | 'audit-log'>('home')
  const [activeTab, setActiveTab] = useState<ActiveTab>('my')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [sortCol, setSortCol] = useState<SortCol>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(7)
  const [openRpp, setOpenRpp] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [displayedRows, setDisplayedRows] = useState<SOWItem[]>(initialSOWs)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const rppRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!openRpp) return
    function handle(e: MouseEvent) {
      if (rppRef.current && !rppRef.current.contains(e.target as Node)) setOpenRpp(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [openRpp])

  useEffect(() => {
    if (!userMenuOpen) return
    function handle(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [userMenuOpen])

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
      style={{ background: '#f6fbfb' }}
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
        {/* Base static gradient - lightened for clarity */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 75% 65% at 15% 18%, rgba(0, 196, 196, 0.16) 0%, transparent 60%), radial-gradient(ellipse 55% 50% at 80% 14%, rgba(26, 211, 219, 0.12) 0%, transparent 55%), radial-gradient(ellipse 50% 55% at 68% 82%, rgba(0, 168, 168, 0.08) 0%, transparent 52%), radial-gradient(ellipse 65% 45% at 38% 88%, rgba(178, 240, 240, 0.22) 0%, transparent 58%)',
          }}
        />
        {/* Slow colour-breathing overlay — subtle teal range */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 90% 80% at 50% 40%, rgba(0, 196, 196, 0.08) 0%, transparent 70%), radial-gradient(ellipse 60% 60% at 85% 70%, rgba(0, 143, 143, 0.06) 0%, transparent 55%)',
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
      <div
        className="relative flex h-full"
        style={{
          zIndex: 1,
          paddingTop: 20,
          paddingBottom: 12,
          paddingLeft: 12,
          paddingRight: 12,
          gap: 20,
        }}
      >
        {/* ─── LEFT SIDEBAR ─────────────────────────────────────────────── */}
        <nav
          className="flex flex-col shrink-0 rounded-2xl relative"
          style={{
            width: 96,
            background: '#04232D',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.28)',
          }}
        >
          {/* Logo area — centered, no text */}
          <div
            className="flex items-center justify-center py-5 shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Image
              src="/m42-white-logo.png"
              alt="M42 Logo"
              width={40}
              height={20}
              className="h-5 w-auto object-contain"
              priority
            />
          </div>

          {/* Nav items — icon above label, centered */}
          <div className="flex flex-col gap-1.5 px-2 py-4 flex-1">
            {(
              [
                {
                  id: 'dashboard' as ActiveNav,
                  label: 'Home',
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
                  label: 'All SOWs',
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
                  id: 'notifications' as ActiveNav,
                  label: 'Notifications',
                  badge: 2,
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  ),
                },
              ] as { id: ActiveNav; label: string; icon: React.ReactNode; badge?: number }[]
            ).map(({ id, label, icon, badge }) => {
              const isActive = contentOverride
                ? activeNav === id
                : id === 'dashboard'
                  ? homeView === 'home'
                  : id === 'my-sows'
                    ? homeView === 'all-sows'
                    : activeNav === id
              return (
                <button
                  key={id}
                  onClick={() => {
                    if (id === 'dashboard') {
                      setHomeView('home')
                      onNavHome?.()
                    } else if (id === 'my-sows') {
                      setHomeView('all-sows')
                      onNavAllSOWs?.()
                    }
                  }}
                  className="flex flex-col items-center justify-center w-full py-2.5 px-1 rounded-xl cursor-pointer transition-all gap-1.5 relative border-0"
                  style={
                    isActive
                      ? {
                          background: '#053546',
                          border: 'none',
                          color: '#ffffff',
                        }
                      : {
                          background: 'transparent',
                          border: 'none',
                          color: '#99A2A8',
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      ;(e.currentTarget as HTMLButtonElement).style.background =
                        'rgba(5,53,70,0.45)'
                      ;(e.currentTarget as HTMLButtonElement).style.color = '#ffffff'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                      ;(e.currentTarget as HTMLButtonElement).style.color = '#99A2A8'
                    }
                  }}
                >
                  <span className="relative">
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {icon}
                    </svg>
                    {badge != null && (
                      <span
                        className="absolute -top-1 -right-1.5 w-4 h-4 bg-[#00C4C4] rounded-full text-white flex items-center justify-center shadow-xs"
                        style={{ fontSize: 9, fontWeight: 600 }}
                      >
                        {badge}
                      </span>
                    )}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: isActive ? 600 : 400,
                      lineHeight: 1.1,
                      textAlign: 'center',
                      color: 'inherit',
                    }}
                  >
                    {label}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Bottom: user avatar & name (no fill, no stroke) */}
          <div
            className="px-2 py-4 shrink-0 flex flex-col gap-1"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
          >
            {/* User avatar — click opens sign-out dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex flex-col items-center justify-center w-full py-2 rounded-xl cursor-pointer transition-all gap-1.5 border-0"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#99A2A8',
                }}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                  <Image
                    src={userImage || '/profile-user.png'}
                    alt={userName}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                  <span className="sr-only">{userInitials}</span>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 400,
                    lineHeight: 1.1,
                    color: '#99A2A8',
                    textAlign: 'center',
                    wordBreak: 'break-word',
                  }}
                >
                  {userName}
                </span>
              </button>

              {/* Sign-out dropdown positioned to the right of nav to avoid clipping */}
              {userMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    left: 'calc(100% + 12px)',
                    bottom: 0,
                    minWidth: 160,
                    background: '#04232D',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid #053546',
                    borderRadius: 12,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    zIndex: 200,
                    overflow: 'hidden',
                  }}
                >
                  {/* User info row */}
                  <div
                    style={{
                      padding: '12px 14px 10px',
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#ffffff' }}>
                      {userName}
                    </div>
                    <div style={{ fontSize: 11, color: '#99A2A8', marginTop: 1 }}>{userRole}</div>
                  </div>
                  {/* Sign out option */}
                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      onSignOut?.()
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      width: '100%',
                      padding: '10px 14px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#fca5a5',
                      fontSize: 13,
                      fontWeight: 400,
                      textAlign: 'left',
                      transition: 'background 0.15s',
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLButtonElement).style.background =
                        'rgba(239,68,68,0.12)'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLButtonElement).style.background = 'none'
                    }}
                  >
                    <svg
                      width="15"
                      height="15"
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
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* ─── MAIN CONTENT (BOUNDING BOX REMOVED) ───────────────────────── */}
        <main
          style={{
            background: 'transparent',
            border: 'none',
            boxShadow: 'none',
          }}
          className="flex-1 flex flex-col overflow-hidden min-h-0"
        >
          {/* When a content override is provided (e.g. SOW detail), render it directly */}
          {contentOverride ? (
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">{contentOverride}</div>
          ) : homeView === 'all-sows' ? (
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <AllSOWsView sows={initialSOWs} onOpenSOWV2={onOpenSOWV2} />
            </div>
          ) : homeView === 'audit-log' ? (
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <AuditLogView onBackToDashboard={() => setHomeView('home')} />
            </div>
          ) : (
            /* Scrollable inner content with consistent 12px padding all around */
            <div className="flex-1 overflow-y-auto p-0">
              {/* Greeting + Create SOW CTA */}
              <div className="flex items-center justify-between mb-5">
                <h1
                  style={{
                    fontSize: 24,
                    fontWeight: 600,
                    color: '#0d212c',
                    margin: 0,
                    lineHeight: 1.15,
                  }}
                >
                  Hi {userName} 👋
                </h1>
                {!isContributor && (
                  <button
                    onClick={() => {
                      setShowCreateModal(true)
                      onCreateSOW?.()
                    }}
                    className="flex items-center gap-2 bg-[#00C4C4] hover:bg-[#00a8a8] active:bg-[#008f8f] text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md transition-colors cursor-pointer border-0"
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
                )}
              </div>

              {/* ─── KPI CARDS ──────────────────────────────────────────────── */}
              <div className="grid grid-cols-5 gap-3 mb-6">
                {/* 1 — Total SOWs */}
                <div
                  style={{
                    background: 'rgba(255,255,255,0.8)',
                    border: '1px solid rgba(255,255,255,0.9)',
                    borderRadius: 16,
                    padding: '16px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    boxShadow: '0 2px 12px rgba(0,196,196,0.07)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      Total SOWs
                    </span>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        background: '#e0f2fe',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="#0284c7"
                        strokeWidth="1.8"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 600, color: '#0d212c', lineHeight: 1 }}>
                    8
                  </div>
                  <div
                    style={{
                      height: 1,
                      background: 'rgba(0,196,196,0.12)',
                      width: '100%',
                      margin: '4px 0 2px 0',
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 500, color: '#16a34a' }}>
                      +2 this month ↗
                    </span>
                  </div>
                </div>

                {/* 2 — In Progress */}
                <div
                  style={{
                    background: 'rgba(255,255,255,0.8)',
                    border: '1px solid rgba(255,255,255,0.9)',
                    borderRadius: 16,
                    padding: '16px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    boxShadow: '0 2px 12px rgba(0,196,196,0.07)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      In Progress
                    </span>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        background: '#e0f9f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="#00a8a8"
                        strokeWidth="1.8"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </div>
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 600, color: '#0d212c', lineHeight: 1 }}>
                    3
                  </div>
                  <div
                    style={{
                      height: 1,
                      background: 'rgba(0,196,196,0.12)',
                      width: '100%',
                      margin: '4px 0 2px 0',
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 500, color: '#16a34a' }}>
                      +1 from last month ↗
                    </span>
                  </div>
                </div>

                {/* 3 — Pending with Me */}
                <div
                  style={{
                    background: 'rgba(255,255,255,0.8)',
                    border: '1px solid rgba(255,255,255,0.9)',
                    borderRadius: 16,
                    padding: '16px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    boxShadow: '0 2px 12px rgba(0,196,196,0.07)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      Pending with Me
                    </span>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        background: '#fee2e2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="#dc2626"
                        strokeWidth="1.8"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 600, color: '#dc2626', lineHeight: 1 }}>
                    4
                  </div>
                  <div
                    style={{
                      height: 1,
                      background: 'rgba(0,196,196,0.12)',
                      width: '100%',
                      margin: '4px 0 2px 0',
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 500, color: '#64748b' }}>
                      Average of questions answered 68%
                    </span>
                  </div>
                </div>

                {/* 4 — Pending with Participants */}
                <div
                  style={{
                    background: 'rgba(255,255,255,0.8)',
                    border: '1px solid rgba(255,255,255,0.9)',
                    borderRadius: 16,
                    padding: '16px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    boxShadow: '0 2px 12px rgba(0,196,196,0.07)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      With Participants
                    </span>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        background: '#f3e8ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="#7c3aed"
                        strokeWidth="1.8"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 600, color: '#0d212c', lineHeight: 1 }}>
                    2
                  </div>
                  <div
                    style={{
                      height: 1,
                      background: 'rgba(0,196,196,0.12)',
                      width: '100%',
                      margin: '4px 0 2px 0',
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 500, color: '#64748b' }}>
                      12 Total of all SOW questions open
                    </span>
                  </div>
                </div>

                {/* 5 — Pending Review */}
                <div
                  style={{
                    background: 'rgba(255,255,255,0.8)',
                    border: '1px solid rgba(255,255,255,0.9)',
                    borderRadius: 16,
                    padding: '16px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    boxShadow: '0 2px 12px rgba(0,196,196,0.07)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      Pending Review
                    </span>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        background: '#fef3c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="#d97706"
                        strokeWidth="1.8"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                        />
                      </svg>
                    </div>
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 600, color: '#0d212c', lineHeight: 1 }}>
                    2
                  </div>
                  <div
                    style={{
                      height: 1,
                      background: 'rgba(0,196,196,0.12)',
                      width: '100%',
                      margin: '4px 0 2px 0',
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 500, color: '#16a34a' }}>
                      +1 this month ↗
                    </span>
                  </div>
                </div>
              </div>

              {/* ─── BOTTOM: ACTIVE SOWs (3/5) + DUE THIS WEEK (2/5) ────── */}
              <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
                {/* Active SOWs — 3/5 */}
                <div style={{ flex: 3, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  {/* Section header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 12,
                      height: 36,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 600, color: '#0d212c' }}>
                        Active SOWs
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 400,
                          color: '#64748b',
                          background: 'rgba(0,196,196,0.1)',
                          borderRadius: 6,
                          padding: '2px 8px',
                        }}
                      >
                        {displayedRows.length}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {/* Search */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          background: 'rgba(255,255,255,0.7)',
                          border: '1px solid rgba(255,255,255,0.9)',
                          borderRadius: 8,
                          padding: '0 10px',
                          height: 32,
                        }}
                      >
                        <svg
                          width="13"
                          height="13"
                          fill="none"
                          stroke="#94a3b8"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                        <input
                          type="text"
                          placeholder="Search SOW or client..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          style={{
                            border: 'none',
                            outline: 'none',
                            background: 'transparent',
                            fontSize: 12,
                            color: '#0d212c',
                            width: 160,
                          }}
                        />
                        {search && (
                          <button
                            onClick={() => setSearch('')}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#94a3b8',
                              padding: 0,
                              display: 'flex',
                            }}
                          >
                            <svg
                              width="12"
                              height="12"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
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
                    </div>
                  </div>

                  {/* Table */}
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.6)',
                      border: '1px solid rgba(255,255,255,0.85)',
                      borderRadius: 14,
                      overflow: 'hidden',
                      boxShadow: '0 2px 12px rgba(0,196,196,0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      flex: 1,
                    }}
                  >
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr
                          style={{
                            background: '#ffffff',
                            borderBottom: '1px solid rgba(0,196,196,0.1)',
                          }}
                        >
                          {[
                            ['SOW Name', 'name' as SortCol, '38%'],
                            ['Client', 'client' as SortCol, '22%'],
                            ['Updated', 'lastUpdated' as SortCol, '22%'],
                            ['Status', 'status' as SortCol, '18%'],
                          ].map(([label, col, width]) => (
                            <th
                              key={String(label)}
                              onClick={col ? () => handleSort(col as SortCol) : undefined}
                              style={{
                                width: String(width),
                                padding: '10px 14px',
                                textAlign: 'left',
                                fontSize: 10,
                                fontWeight: 600,
                                color: '#475569',
                                textTransform: 'uppercase',
                                letterSpacing: '0.07em',
                                cursor: col ? 'pointer' : 'default',
                                userSelect: 'none',
                              }}
                            >
                              <span
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                              >
                                {label}
                                {col && (
                                  <SortIcon
                                    col={col as SortCol}
                                    sortCol={sortCol}
                                    sortDir={sortDir}
                                  />
                                )}
                              </span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {isSearching ? (
                          Array.from({ length: 7 }).map((_, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(0,196,196,0.07)' }}>
                              {[38, 22, 22, 18].map((w, j) => (
                                <td key={j} style={{ padding: '11px 14px' }}>
                                  <div
                                    style={{
                                      height: 12,
                                      width: `${w * 0.65}%`,
                                      background: 'rgba(0,196,196,0.1)',
                                      borderRadius: 4,
                                      animation: 'pulse 1.5s infinite',
                                    }}
                                  />
                                </td>
                              ))}
                            </tr>
                          ))
                        ) : paginatedRows.slice(0, 7).length > 0 ? (
                          paginatedRows.slice(0, 7).map((row, idx) => (
                            <tr
                              key={row.id}
                              onClick={() => {
                                if (isContributor && idx === 0) onOpenSOWContributor?.()
                              }}
                              style={{
                                height: 60,
                                borderBottom:
                                  idx < Math.min(paginatedRows.length, 7) - 1
                                    ? '1px solid rgba(0,196,196,0.07)'
                                    : undefined,
                                cursor: 'pointer',
                                transition: 'background 0.12s',
                              }}
                              onMouseEnter={(e) => {
                                ;(e.currentTarget as HTMLTableRowElement).style.background =
                                  'rgba(0,196,196,0.04)'
                              }}
                              onMouseLeave={(e) => {
                                ;(e.currentTarget as HTMLTableRowElement).style.background = ''
                              }}
                            >
                              <td
                                style={{
                                  padding: '11px 14px',
                                  fontSize: 13,
                                  fontWeight: 500,
                                  color: '#0d212c',
                                  maxWidth: 0,
                                }}
                              >
                                <span
                                  style={{
                                    display: 'block',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {row.name}
                                </span>
                              </td>
                              <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b' }}>
                                {row.client}
                              </td>
                              <td
                                style={{
                                  padding: '11px 14px',
                                  fontSize: 12,
                                  color: '#94a3b8',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {row.lastUpdated}
                              </td>
                              <td style={{ padding: '11px 14px' }}>
                                <StatusBadge status={row.status} />
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={4}
                              style={{
                                padding: '32px 14px',
                                textAlign: 'center',
                                fontSize: 13,
                                color: '#94a3b8',
                              }}
                            >
                              No SOWs match your search.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    {/* View All footer */}
                    <div
                      style={{
                        padding: '10px 14px',
                        borderTop: '1px solid rgba(0,196,196,0.08)',
                        display: 'flex',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <button
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#00C4C4',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        View All SOWs
                        <svg
                          width="12"
                          height="12"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Due This Week — 2/5 */}
                <div style={{ flex: 2, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 12,
                      height: 36,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 600, color: '#0d212c' }}>
                        Due This Week
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-normal bg-[#fee2e2] text-[#dc2626] border border-red-200/60">
                        3 urgent
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.6)',
                      border: '1px solid rgba(255,255,255,0.85)',
                      borderRadius: 14,
                      overflow: 'hidden',
                      boxShadow: '0 2px 12px rgba(0,196,196,0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      flex: 1,
                    }}
                  >
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr
                          style={{
                            background: '#ffffff',
                            borderBottom: '1px solid rgba(0,196,196,0.1)',
                          }}
                        >
                          <th
                            style={{
                              width: '76%',
                              padding: '10px 14px',
                              textAlign: 'left',
                              fontSize: 10,
                              fontWeight: 600,
                              color: '#475569',
                              textTransform: 'uppercase',
                              letterSpacing: '0.07em',
                            }}
                          >
                            Sow
                          </th>
                          <th
                            style={{
                              width: '24%',
                              padding: '10px 14px',
                              textAlign: 'left',
                              fontSize: 10,
                              fontWeight: 600,
                              color: '#475569',
                              textTransform: 'uppercase',
                              letterSpacing: '0.07em',
                            }}
                          >
                            Due Day
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            name: 'Meridian Healthcare',
                            action: 'SOW Draft review',
                            due: 'Today',
                            urgency: 'high' as const,
                          },
                          {
                            name: 'Acme Corp',
                            action: 'Approve Form submission',
                            due: 'Tomorrow',
                            urgency: 'high' as const,
                          },
                          {
                            name: 'CyberShield',
                            action: 'Security compliance review',
                            due: 'Tomorrow',
                            urgency: 'high' as const,
                          },
                          {
                            name: 'TechSphere',
                            action: 'Answer 4 open questions',
                            due: 'Wed',
                            urgency: 'medium' as const,
                          },
                          {
                            name: 'Globex Inc',
                            action: 'Complete SOW Structure',
                            due: 'Thu',
                            urgency: 'medium' as const,
                          },
                          {
                            name: 'Orion Group',
                            action: 'Budget & pricing sign-off',
                            due: 'Thu',
                            urgency: 'medium' as const,
                          },
                          {
                            name: 'Zenith Ltd',
                            action: 'Final sign-off pending',
                            due: 'Fri',
                            urgency: 'low' as const,
                          },
                        ].map((item, idx, arr) => {
                          const urgencyColor =
                            item.urgency === 'high'
                              ? '#dc2626'
                              : item.urgency === 'medium'
                                ? '#d97706'
                                : '#64748b'
                          const chipStyles =
                            item.urgency === 'high'
                              ? 'bg-[#fee2e2] text-[#dc2626] border border-red-200/60'
                              : item.urgency === 'medium'
                                ? 'bg-[#fef3c7] text-[#d97706] border border-amber-200/60'
                                : 'bg-[#f1f5f9] text-[#64748b] border border-slate-200/60'
                          return (
                            <tr
                              key={idx}
                              style={{
                                height: 60,
                                borderBottom:
                                  idx < arr.length - 1
                                    ? '1px solid rgba(0,196,196,0.07)'
                                    : undefined,
                                cursor: 'pointer',
                                transition: 'background 0.12s',
                              }}
                              onMouseEnter={(e) => {
                                ;(e.currentTarget as HTMLTableRowElement).style.background =
                                  'rgba(0,196,196,0.04)'
                              }}
                              onMouseLeave={(e) => {
                                ;(e.currentTarget as HTMLTableRowElement).style.background = ''
                              }}
                            >
                              <td style={{ padding: '11px 14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                                  <div
                                    style={{
                                      width: 6,
                                      height: 6,
                                      borderRadius: '50%',
                                      background: urgencyColor,
                                      flexShrink: 0,
                                    }}
                                  />
                                  <div style={{ minWidth: 0, overflow: 'hidden' }}>
                                    <div
                                      style={{
                                        fontSize: 13,
                                        fontWeight: 500,
                                        color: '#0d212c',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      {item.name}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: 11,
                                        color: '#64748b',
                                        marginTop: 1,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      {item.action}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-normal shrink-0 ${chipStyles}`}
                                >
                                  {item.due}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                    {/* Matching footer */}
                    <div
                      style={{
                        padding: '10px 14px',
                        borderTop: '1px solid rgba(0,196,196,0.08)',
                        display: 'flex',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 500, color: '#94a3b8' }}>
                        7 items this week
                      </span>
                    </div>
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
