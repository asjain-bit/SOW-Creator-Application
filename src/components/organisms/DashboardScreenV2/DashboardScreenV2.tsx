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
import {
  FileText,
  CheckCircle2,
  Layers,
  Clock,
  AlertTriangle,
  Calendar,
  Bell,
  ArrowLeft,
  MoreVertical,
  Pencil,
  Trash2,
  Plus,
  Users,
  LayoutTemplate,
  Bot,
  LayoutDashboard,
  Search,
  ChevronDown,
  Check,
  X,
  Shield,
  HelpCircle,
  Square,
  CheckSquare,
  Building2,
  ArrowRight,
} from 'lucide-react'
import type { UploadedFile } from '@/components/molecules/CreateSOWModal'
import { AuditLogView } from '../AuditLogView'
import { useToast } from '@/contexts/ToastContext'

/* ─── Static Data ─────────────────────────────────────────────────────────── */

const DEFAULT_SOWS: SOWItem[] = [
  {
    id: 'sow-1',
    name: 'Customer Transformation Program',
    client: 'Acme Corp',
    createdBy: 'Ashika Jain',
    createdDate: 'Aug 01, 2026',
    lastUpdated: 'Today, 10:24 AM',
    status: 'On Track',
    readiness: 85,
    openQuestions: 2,
    overdueQuestions: 0,
    reviewComments: 8,
    approval: 'Reviewer',
  },
  {
    id: 'sow-meridian',
    name: 'Procurement Platform Modernization',
    client: 'Meridian Healthcare',
    createdBy: 'Ashika Jain',
    createdDate: 'Sep 02, 2026',
    lastUpdated: 'Today, 9:10 AM',
    status: 'At Risk',
    readiness: 75,
    openQuestions: 3,
    overdueQuestions: 1,
    reviewComments: 11,
    approval: 'Awaiting Contributor',
  },
  {
    id: 'sow-2',
    name: 'Digital Workplace Enablement',
    client: 'Globex Inc',
    createdBy: 'Ashika Jain',
    createdDate: 'Aug 10, 2026',
    lastUpdated: 'Aug 28, 2026',
    status: 'On Track',
    readiness: 75,
    openQuestions: 1,
    overdueQuestions: 0,
    reviewComments: 5,
    approval: 'Awaiting Client',
  },
  {
    id: 'sow-3',
    name: 'Cloud Modernization Initiative',
    client: 'TechSphere',
    createdBy: 'Rohan Mehta',
    createdDate: 'Aug 05, 2026',
    lastUpdated: 'Aug 18, 2026',
    status: 'Deactivated',
    readiness: 35,
    openQuestions: 4,
    overdueQuestions: 2,
    reviewComments: 2,
    approval: 'Reviewer',
  },
  {
    id: 'sow-4',
    name: 'IT Infrastructure Revamp',
    client: 'Zenith Ltd',
    createdBy: 'Priya Sharma',
    createdDate: 'Jul 28, 2026',
    lastUpdated: 'Aug 12, 2026',
    status: 'At Risk',
    readiness: 60,
    openQuestions: 2,
    overdueQuestions: 1,
    reviewComments: 4,
    approval: 'Awaiting Client',
  },
  {
    id: 'sow-5',
    name: 'Data Analytics Platform',
    client: 'Orion Group',
    createdBy: 'Ashika Jain',
    createdDate: 'Jul 22, 2026',
    lastUpdated: 'Aug 10, 2026',
    status: 'On Track',
    readiness: 45,
    openQuestions: 5,
    overdueQuestions: 0,
    reviewComments: 3,
    approval: 'Awaiting Contributor',
  },
  {
    id: 'sow-6',
    name: 'Enterprise Security Architecture',
    client: 'CyberShield',
    createdBy: 'Rohan Mehta',
    createdDate: 'Jul 15, 2026',
    lastUpdated: 'Aug 05, 2026',
    status: 'Completed',
    readiness: 95,
    openQuestions: 0,
    overdueQuestions: 0,
    reviewComments: 7,
    approval: 'Reviewer',
  },
  {
    id: 'sow-7',
    name: 'AI Automation & Workflow Setup',
    client: 'Innovate LLC',
    createdBy: 'Priya Sharma',
    createdDate: 'Jul 10, 2026',
    lastUpdated: 'Jul 29, 2026',
    status: 'On Track',
    readiness: 50,
    openQuestions: 3,
    overdueQuestions: 1,
    reviewComments: 6,
    approval: 'Awaiting Client',
  },
  {
    id: 'sow-8',
    name: 'Modern Data Warehouse Migration',
    client: 'Apex Global',
    createdBy: 'Ashika Jain',
    createdDate: 'Jul 02, 2026',
    lastUpdated: 'Jul 21, 2026',
    status: 'At Risk',
    readiness: 40,
    openQuestions: 4,
    overdueQuestions: 0,
    reviewComments: 1,
    approval: 'Awaiting Contributor',
  },
  {
    id: 'sow-9',
    name: 'ERP Integration & Rollout',
    client: 'Nexus Corp',
    createdBy: 'Rohan Mehta',
    createdDate: 'Jun 25, 2026',
    lastUpdated: 'Jul 18, 2026',
    status: 'Completed',
    readiness: 100,
    openQuestions: 0,
    overdueQuestions: 0,
    reviewComments: 9,
    approval: 'Reviewer',
  },
  {
    id: 'sow-10',
    name: 'Supply Chain Digitization',
    client: 'LogiTech Pvt',
    createdBy: 'Priya Sharma',
    createdDate: 'Jun 18, 2026',
    lastUpdated: 'Jul 10, 2026',
    status: 'Deactivated',
    readiness: 25,
    openQuestions: 6,
    overdueQuestions: 3,
    reviewComments: 0,
    approval: 'Reviewer',
  },
  {
    id: 'sow-11',
    name: 'HR Systems Modernization',
    client: 'PeopleFirst',
    createdBy: 'Ashika Jain',
    createdDate: 'Jun 10, 2026',
    lastUpdated: 'Jul 05, 2026',
    status: 'On Track',
  },
  {
    id: 'sow-12',
    name: 'Customer 360 Analytics',
    client: 'RetailEdge',
    createdBy: 'Rohan Mehta',
    createdDate: 'Jun 03, 2026',
    lastUpdated: 'Jun 28, 2026',
    status: 'On Track',
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
    status: 'On Track',
  },
  {
    id: 'sow-15',
    name: 'Cybersecurity Risk Assessment',
    client: 'SafeNet Ltd',
    createdBy: 'Rohan Mehta',
    createdDate: 'May 12, 2026',
    lastUpdated: 'Jun 08, 2026',
    status: 'At Risk',
  },
]

const KPIS: KPIItem[] = [
  {
    label: "Active SOW's",
    value: '5',
    iconBg: '#e0f2fe',
    iconColor: '#0284c7',
    subLabel: 'vs last month',
    subValue: '+1',
    trend: '↗',
    trendColor: '#16a34a',
  },
  {
    label: 'Need Attention',
    value: '2',
    iconBg: '#fef3c7',
    iconColor: '#d97706',
    subLabel: 'Require PMO action',
    subValue: '2',
  },
  {
    label: 'At Risk',
    value: '1',
    iconBg: '#fee2e2',
    iconColor: '#ef4444',
    subLabel: 'Needs monitoring',
    subValue: '1',
    trend: '↗',
    trendColor: '#ef4444',
  },
]

const STATUS_OPTIONS: SOWStatus[] = ['On Track', 'At Risk', 'Completed', 'Deactivated']
const ROWS_PER_PAGE_OPTIONS = [5, 10, 25]

type SortCol = 'name' | 'client' | 'lastUpdated' | 'status' | 'readiness' | 'openQuestions' | 'reviewComments' | 'approval' | null
type SortDir = 'asc' | 'desc'
type ActiveTab = 'my' | 'all'

/* ─── Status badge ────────────────────────────────────────────────────────── */

function StatusBadge({ status }: { status: SOWStatus }) {
  const styles: Record<SOWStatus, string> = {
    'On Track': 'bg-[#dcfce7] text-[#15803d] border border-green-200/60',
    'At Risk': 'bg-[#fee2e2] text-[#dc2626] border border-red-200/60',
    Deactivated: 'bg-[#f1f5f9] text-[#64748b] border border-slate-200/60',
    Completed: 'bg-[#dcfce7] text-[#16a34a] border border-green-200/50',
    'In Progress': 'bg-[#e0f2fe] text-[#0284c7] border border-blue-200/50',
    Pending: 'bg-[#fef3c7] text-[#d97706] border border-amber-200/50',
    'Not Started': 'bg-[#f1f5f9] text-[#64748b] border border-slate-200/50',
  }
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] ?? 'bg-[#f1f5f9] text-[#64748b]'}`}
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

function SortIcon() {
  return (
    <svg className="w-3 h-3" style={{ color: '#94a3b8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"
      />
    </svg>
  )
}

/* ─── All SOWs View ──────────────────────────────────────────────────────── */

type AllSOWsSortCol =
  | 'name'
  | 'status'
  | 'readiness'
  | 'openQuestions'
  | 'reviewComments'
  | 'approval'
  | 'lastUpdated'
  | null

function AllSOWsView({
  sows,
  onOpenSOWV2,
  onOpenSOWContributor,
  onOpenSOWDeactivated,
  isContributor = false,
  isPMO = true,
  isAdmin = false,
  onDeactivateSOW,
  onReactivateSOW,
  notificationButton,
}: {
  sows: SOWItem[]
  onOpenSOWV2?: () => void
  onOpenSOWContributor?: () => void
  onOpenSOWDeactivated?: () => void
  isContributor?: boolean
  isPMO?: boolean
  isAdmin?: boolean
  onDeactivateSOW?: (sow: SOWItem) => void
  onReactivateSOW?: (sow: SOWItem) => void
  notificationButton?: React.ReactNode
}) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [sortCol, setSortCol] = useState<AllSOWsSortCol>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 12

  useEffect(() => {
    const handleCloseMenu = () => setActionMenuOpenId(null)
    window.addEventListener('click', handleCloseMenu)
    return () => window.removeEventListener('click', handleCloseMenu)
  }, [])

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
      return true
    })
    .sort((a, b) => {
      if (!sortCol) return 0
      const av = a[sortCol] ?? ''
      const bv = b[sortCol] ?? ''
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av
      }
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
    })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginatedRows = filtered.slice((page - 1) * pageSize, page * pageSize)

  const cols: { label: string; col: AllSOWsSortCol; width: string }[] = isAdmin
    ? [
        { label: 'SOW Name', col: null, width: '28%' },
        { label: 'Status', col: null, width: '14%' },
        { label: 'Readiness', col: 'readiness', width: '12%' },
        { label: 'PMO Name', col: null, width: '16%' },
        { label: 'Due Date', col: null, width: '15%' },
        { label: 'Updated On', col: null, width: '15%' },
      ]
    : [
        { label: 'SOW Name', col: null, width: '22%' },
        { label: 'Status', col: null, width: '12%' },
        { label: 'Readiness', col: 'readiness', width: '10%' },
        { label: 'Questions', col: 'openQuestions', width: '14%' },
        { label: 'Review', col: 'reviewComments', width: '11%' },
        { label: 'Approval', col: null, width: '12%' },
        { label: 'Updated On', col: null, width: '12%' },
        { label: 'Action', col: null, width: '7%' },
      ]

  return (
    <div
      style={{
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        height: '100%',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#0d212c', margin: 0, lineHeight: 1.15 }}>
            All SOWs
          </h1>
        </div>
        {/* Filter bar + Notification Bell */}
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
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: 12,
                color: '#0d212c',
                width: 170,
              }}
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('')
                  setPage(1)
                }}
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
            onSelect={(val) => {
              setStatusFilter(val)
              setPage(1)
            }}
          />
          {statusFilter && (
            <button
              onClick={() => {
                setStatusFilter(null)
                setPage(1)
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
                borderRadius: 8,
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
          {notificationButton}
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          background: 'rgba(255,255,255,0.6)',
          border: '1px solid rgba(255,255,255,0.85)',
          borderRadius: 14,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 2px 12px rgba(0,196,196,0.06)',
          height: 'auto',
          marginBottom: 20,
        }}
      >
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
                    key={label}
                    onClick={col ? () => handleSort(col) : undefined}
                    style={{
                      width,
                      padding: '10px 14px',
                      textAlign: 'left',
                      fontSize: 10,
                      fontWeight: 500,
                      color: '#475569',
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      cursor: col ? 'pointer' : 'default',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {label}
                      {col && <SortIcon />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
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
                paginatedRows.map((row, idx) => (
                  <tr
                    key={row.id}
                    onClick={() => {
                      if (row.status === 'Deactivated') {
                        onOpenSOWDeactivated?.()
                        return
                      }
                      if (isContributor) {
                        if (row.name.includes('Meridian Healthcare') || row.name.includes('Procurement Platform')) {
                          onOpenSOWContributor?.()
                        }
                        return
                      }
                      if (row.name.includes('Meridian Healthcare') || row.name.includes('Procurement Platform')) {
                        onOpenSOWContributor?.()
                      } else if (idx === 1 || row.name.includes('Digital Workplace Enablement')) {
                        onOpenSOWV2?.()
                      } else {
                        onOpenSOWV2?.()
                      }
                    }}
                    style={{
                      height: 62,
                      borderBottom:
                        idx < paginatedRows.length - 1 ? '1px solid rgba(0,196,196,0.07)' : undefined,
                      cursor: 'pointer',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLTableRowElement).style.background = '#f8fafc'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLTableRowElement).style.background = ''
                    }}
                  >
                    {/* SOW Name & Client */}
                    <td
                      style={{
                        padding: '10px 14px',
                        maxWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          display: 'block',
                          fontSize: 13,
                          fontWeight: 600,
                          color: '#0d212c',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {row.name}
                      </span>
                      <span
                        style={{
                          display: 'block',
                          fontSize: 11.5,
                          color: '#64748b',
                          marginTop: 2,
                        }}
                      >
                        {row.client}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '10px 14px' }}>
                      <StatusBadge status={row.status} />
                    </td>

                    {/* Readiness */}
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: 12.5, fontWeight: 500, color: '#0d212c' }}>
                        {row.readiness != null ? `${row.readiness}%` : '75%'}
                      </span>
                    </td>

                    {/* Non-Admin: Questions & Review */}
                    {!isAdmin && (
                      <>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ fontSize: 12.5, color: '#475569', fontWeight: 500 }}>
                            {row.totalQuestions ?? 4} Total • {row.openQuestions ?? 0} Open
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ fontSize: 12.5, color: '#475569', fontWeight: 500 }}>
                            {row.reviewComments ?? 0} comments
                          </span>
                        </td>
                      </>
                    )}

                    {/* Approval or PMO Name */}
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: 12.5, color: isAdmin ? '#0d212c' : '#475569', fontWeight: 500 }}>
                        {isAdmin ? (row.createdBy || 'Ashika Jain') : (row.approval === 'Reviewer' ? 'Awaiting Reviewer' : (row.approval ?? 'Awaiting Reviewer'))}
                      </span>
                    </td>

                    {/* Admin: Due Date */}
                    {isAdmin && (
                      <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: 12.5, color: '#dc2626', fontWeight: 500 }}>
                          {idx === 0 ? 'Oct 15, 2026' : idx === 1 ? 'Oct 22, 2026' : idx === 2 ? 'Nov 05, 2026' : 'Nov 18, 2026'}
                        </span>
                      </td>
                    )}

                    {/* Updated On */}
                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: 12, color: '#64748b', fontWeight: 400 }}>
                        {row.lastUpdated}
                      </span>
                    </td>

                    {/* Action (only for non-admin) */}
                    {!isAdmin && (
                      <td
                        style={{ padding: '10px 14px', position: 'relative' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setActionMenuOpenId((prev) => (prev === row.id ? null : row.id))
                          }}
                          title="Actions"
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            background: actionMenuOpenId === row.id ? '#f1f5f9' : 'transparent',
                            border: '1px solid ' + (actionMenuOpenId === row.id ? '#cbd5e1' : 'transparent'),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#64748b',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            if (actionMenuOpenId !== row.id) e.currentTarget.style.background = '#f8fafc'
                          }}
                          onMouseLeave={(e) => {
                            if (actionMenuOpenId !== row.id) e.currentTarget.style.background = 'transparent'
                          }}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="5" r="2.2" />
                            <circle cx="12" cy="12" r="2.2" />
                            <circle cx="12" cy="19" r="2.2" />
                          </svg>
                        </button>

                        {actionMenuOpenId === row.id && (
                          <div
                            style={{
                              position: 'absolute',
                              right: 12,
                              top: 42,
                              zIndex: 60,
                              background: '#ffffff',
                              borderRadius: 10,
                              border: '1px solid #e2e8f0',
                              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                              padding: '4px',
                              minWidth: 155,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 2,
                            }}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setActionMenuOpenId(null)
                                if (row.status === 'Deactivated') {
                                  onOpenSOWDeactivated?.()
                                } else if (row.name.includes('Meridian Healthcare') || row.name.includes('Procurement Platform')) {
                                  onOpenSOWContributor?.()
                                } else {
                                  onOpenSOWV2?.()
                                }
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '7px 10px',
                                borderRadius: 6,
                                border: 'none',
                                background: 'transparent',
                                fontSize: 12.5,
                                fontWeight: 500,
                                color: '#0d212c',
                                cursor: 'pointer',
                                textAlign: 'left',
                                width: '100%',
                                transition: 'background 0.12s',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                              View Details
                            </button>

                            {row.status === 'Deactivated' ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setActionMenuOpenId(null)
                                  onReactivateSOW?.(row)
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  padding: '7px 10px',
                                  borderRadius: 6,
                                  border: 'none',
                                  background: 'transparent',
                                  fontSize: 12.5,
                                  fontWeight: 500,
                                  color: '#16a34a',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  width: '100%',
                                  transition: 'background 0.12s',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = '#f0fdf4')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="23 4 23 10 17 10" />
                                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                                </svg>
                                Reactivate SOW
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setActionMenuOpenId(null)
                                  onDeactivateSOW?.(row)
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  padding: '7px 10px',
                                  borderRadius: 6,
                                  border: 'none',
                                  background: 'transparent',
                                  fontSize: 12.5,
                                  fontWeight: 500,
                                  color: '#dc2626',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  width: '100%',
                                  transition: 'background 0.12s',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10" />
                                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                                </svg>
                                Deactivate SOW
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        {/* Footer pagination */}
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
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length} SOWs
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                background: page === 1 ? '#f8fafc' : '#ffffff',
                color: page === 1 ? '#cbd5e1' : '#475569',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              ‹
            </button>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#475569', padding: '0 4px' }}>
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                background: page >= totalPages ? '#f8fafc' : '#ffffff',
                color: page >= totalPages ? '#cbd5e1' : '#475569',
                cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function NotificationsView({
  notifications,
  markRead,
  notificationButton,
  onBack,
}: {
  notifications: { id: string; title: string; description: string; time: string; unread: boolean }[]
  markRead: (id: string) => void
  notificationButton?: React.ReactNode
  onBack?: () => void
}) {
  return (
    <div style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(255,255,255,0.9)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#0d212c',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'all 0.15s',
              }}
              aria-label="Back"
            >
              <ArrowLeft size={18} strokeWidth={2} />
            </button>
          )}
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#0d212c', margin: 0, lineHeight: 1.15 }}>Notifications</h1>
        </div>
        {notificationButton}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.85)', borderRadius: 14, boxShadow: '0 2px 12px rgba(0,196,196,0.06)', padding: '16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => n.unread && markRead(n.id)}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 16,
              padding: '14px 18px',
              background: n.unread ? 'rgba(0,196,196,0.06)' : 'rgba(255,255,255,0.8)',
              borderRadius: 12,
              border: '1px solid ' + (n.unread ? 'rgba(0,196,196,0.2)' : 'rgba(255,255,255,0.9)'),
              cursor: n.unread ? 'pointer' : 'default',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0d212c', marginBottom: 4 }}>{n.title}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>{n.description}</div>
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap', flexShrink: 0 }}>{n.time}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface AgentItem {
  id: string
  name: string
  description: string
  status: 'Active' | 'Deactivated'
}

function AgentsView({ notificationButton }: { notificationButton?: React.ReactNode }) {
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 12

  const [agentsList, setAgentsList] = useState<AgentItem[]>([
    { id: '1', name: 'Intake & Context Agent', description: 'Captures and structures intake information and project context for SOW generation', status: 'Active' },
    { id: '2', name: 'SoW Domain Specialist', description: 'Applies domain expertise to validate and enrich SOW scope and requirements', status: 'Active' },
    { id: '3', name: 'Questionnaire & Section Design Agent', description: 'Designs questionnaires and structures SOW sections based on project type', status: 'Active' },
    { id: '4', name: 'Knowledge & Research Agent', description: 'Researches industry benchmarks and knowledge base to support SOW content', status: 'Active' },
    { id: '6', name: 'SoW Drafting Agent', description: 'Generates the full SOW draft using structured inputs and domain knowledge', status: 'Active' },
    { id: '7', name: 'SoW Supervisor Agent', description: 'Oversees SOW drafting quality and coordinates between specialized agents', status: 'Active' },
    { id: '8', name: 'Reviewer Supervisor', description: 'Manages the review workflow and aggregates feedback from review agents', status: 'Active' },
    { id: '9', name: 'Change Impact Agent', description: 'Assesses the impact of changes and updates to SOW scope or requirements', status: 'Active' },
    { id: '11', name: 'Quality Gate Agent', description: 'Validates SOW against quality standards and compliance requirements', status: 'Active' },
  ])

  const [actionMenuAgentId, setActionMenuAgentId] = useState<string | null>(null)
  const [editModalAgent, setEditModalAgent] = useState<AgentItem | null>(null)
  const [editAgentName, setEditAgentName] = useState('')
  const [editAgentDesc, setEditAgentDesc] = useState('')

  const [deactivateModalAgent, setDeactivateModalAgent] = useState<AgentItem | null>(null)
  const [reactivateModalAgent, setReactivateModalAgent] = useState<AgentItem | null>(null)

  const filtered = agentsList.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase()))
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginatedRows = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleUpdateAgent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editModalAgent || !editAgentName.trim()) return
    setAgentsList((prev) =>
      prev.map((a) =>
        a.id === editModalAgent.id
          ? { ...a, name: editAgentName.trim(), description: editAgentDesc.trim() }
          : a
      )
    )
    setEditModalAgent(null)
    showToast('Agent Updated', 'success')
  }

  return (
    <div style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box', overflowY: 'auto' }} onClick={() => setActionMenuAgentId(null)}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#0d212c', margin: 0, lineHeight: 1.15 }}>Agents</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.9)', borderRadius: 8, padding: '0 10px', height: 34 }}>
            <svg width="13" height="13" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search agents..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 12, color: '#0d212c', width: 170 }}
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('')
                  setPage(1)
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}
              >
                <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {notificationButton}
        </div>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.85)', borderRadius: 14, overflow: 'visible', boxShadow: '0 2px 12px rgba(0,196,196,0.06)', height: 'auto', marginBottom: 20, display: 'flex', flexDirection: 'column' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(0,196,196,0.1)', background: '#ffffff' }}>
              <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 500, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', width: '30%' }}>Agent Name</th>
              <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 500, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', width: '56%' }}>Description</th>
              <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 500, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', width: '14%' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((a, idx) => (
              <tr
                key={a.id}
                style={{ borderBottom: idx < paginatedRows.length - 1 ? '1px solid rgba(0,196,196,0.07)' : undefined, transition: 'background 0.12s', height: 52 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '')}
              >
                <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 500, color: '#0d212c' }}>{a.name}</td>
                <td style={{ padding: '10px 14px', fontSize: 12.5, color: '#64748b' }}>{a.description}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '3px 9px',
                      borderRadius: 20,
                      fontSize: 11.5,
                      fontWeight: 600,
                      background: a.status === 'Active' ? 'rgba(22,163,74,0.1)' : 'rgba(100,116,139,0.1)',
                      color: a.status === 'Active' ? '#16a34a' : '#64748b',
                      border: '1px solid ' + (a.status === 'Active' ? 'rgba(22,163,74,0.2)' : 'rgba(100,116,139,0.2)'),
                    }}
                  >
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Footer pagination */}
        <div
          style={{
            padding: '10px 14px',
            borderTop: '1px solid rgba(0,196,196,0.08)',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
            borderBottomLeftRadius: 14,
            borderBottomRightRadius: 14,
          }}
        >
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length} Agents
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                background: page === 1 ? '#f8fafc' : '#ffffff',
                color: page === 1 ? '#cbd5e1' : '#475569',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              ‹
            </button>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#475569', padding: '0 4px' }}>
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                background: page >= totalPages ? '#f8fafc' : '#ffffff',
                color: page >= totalPages ? '#cbd5e1' : '#475569',
                cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Edit Agent Modal */}
      {editModalAgent && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(3px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditModalAgent(null)
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 24,
              padding: '32px 28px',
              width: 500,
              maxWidth: '92vw',
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
            }}
          >
            <button
              onClick={() => setEditModalAgent(null)}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                padding: 4,
                display: 'flex',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div style={{ fontSize: 20, fontWeight: 700, color: '#0d212c', marginBottom: 4 }}>
              Edit Agent
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
              Update agent title and role description within the automated drafting pipeline.
            </div>

            <form onSubmit={handleUpdateAgent} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#0d212c', marginBottom: 6 }}>
                  Agent Name *
                </label>
                <input
                  type="text"
                  required
                  value={editAgentName}
                  onChange={(e) => setEditAgentName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1.5px solid #e2e8f0',
                    outline: 'none',
                    fontSize: 13,
                    color: '#0d212c',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#0d212c', marginBottom: 6 }}>
                  Description / Role Purpose *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editAgentDesc}
                  onChange={(e) => setEditAgentDesc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1.5px solid #e2e8f0',
                    outline: 'none',
                    fontSize: 13,
                    color: '#0d212c',
                    boxSizing: 'border-box',
                    resize: 'none',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setEditModalAgent(null)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: 10,
                    background: '#ffffff',
                    border: '1.5px solid #e2e8f0',
                    color: '#0d212c',
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: 10,
                    background: '#00C4C4',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(0,196,196,0.3)',
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate Agent Confirmation Modal */}
      {deactivateModalAgent && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(3px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeactivateModalAgent(null)
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 24,
              padding: '32px 28px',
              width: 440,
              maxWidth: '90vw',
              textAlign: 'center',
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
            }}
          >
            <button
              onClick={() => setDeactivateModalAgent(null)}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                padding: 4,
                display: 'flex',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
            </div>

            <div style={{ fontSize: 22, fontWeight: 700, color: '#0d212c', marginBottom: 8 }}>
              Deactivate Agent?
            </div>
            <div style={{ fontSize: 14, color: '#64748b', marginBottom: 26, lineHeight: 1.5 }}>
              Are you sure you want to deactivate <strong style={{ color: '#0d212c' }}>{deactivateModalAgent.name}</strong>? It will temporarily be excluded from automated workflows.
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setDeactivateModalAgent(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 12,
                  background: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  color: '#0d212c',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const targetId = deactivateModalAgent.id
                  setAgentsList((prev) =>
                    prev.map((a) => (a.id === targetId ? { ...a, status: 'Deactivated' } : a))
                  )
                  setDeactivateModalAgent(null)
                  showToast('Agent Deactivated', 'error')
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 12,
                  background: '#E60000',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(230,0,0,0.25)',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#cc0000')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#E60000')}
              >
                Deactivate Agent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reactivate Agent Confirmation Modal */}
      {reactivateModalAgent && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(3px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setReactivateModalAgent(null)
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 24,
              padding: '32px 28px',
              width: 440,
              maxWidth: '90vw',
              textAlign: 'center',
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
            }}
          >
            <button
              onClick={() => setReactivateModalAgent(null)}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                padding: 4,
                display: 'flex',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: 'rgba(0,196,196,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00C4C4" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
            </div>

            <div style={{ fontSize: 22, fontWeight: 700, color: '#0d212c', marginBottom: 8 }}>
              Reactivate Agent?
            </div>
            <div style={{ fontSize: 14, color: '#64748b', marginBottom: 26, lineHeight: 1.5 }}>
              Are you sure you want to reactivate <strong style={{ color: '#0d212c' }}>{reactivateModalAgent.name}</strong>? It will resume participating in automated workflows.
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setReactivateModalAgent(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 12,
                  background: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  color: '#0d212c',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const targetId = reactivateModalAgent.id
                  setAgentsList((prev) =>
                    prev.map((a) => (a.id === targetId ? { ...a, status: 'Active' } : a))
                  )
                  setReactivateModalAgent(null)
                  showToast('Agent Reactivated', 'success')
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 12,
                  background: '#00C4C4',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0,196,196,0.3)',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#00a8a8')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#00C4C4')}
              >
                Reactivate Agent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Types for Admin Views ───────────────────────────────────────────────── */

export interface SectionTemplateItem {
  id: string
  name: string
  requirement: 'Required' | 'Recommended' | 'Conditional'
  description: string
  status: 'Active' | 'Deactivated'
}

export type UserRole = 'PMO' | 'Contributor' | 'Reviewer' | 'Client'

export interface PlatformUserItem {
  id: string
  name: string
  email: string
  roles: UserRole[]
  assignedSOWs: number
  status: 'Active' | 'Inactive'
  lastActive: string
}

/* ─── 1. SOW Section Templates Dedicated Page ────────────────────────────── */

export function SectionTemplatesView({
  notificationButton,
}: {
  notificationButton?: React.ReactNode
}) {
  const { showToast } = useToast()

  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [sectionSearch, setSectionSearch] = useState('')
  const [sectionFilter, setSectionFilter] = useState<'All' | 'Required' | 'Recommended' | 'Conditional'>('All')
  const [sectionTemplates, setSectionTemplates] = useState<SectionTemplateItem[]>([
    {
      id: 'sec-1',
      name: 'Executive Summary & Background',
      requirement: 'Required',
      description: 'High-level business context, engagement purpose, strategic alignment, and project objectives.',
      status: 'Active',
    },
    {
      id: 'sec-2',
      name: 'Scope of Work & Requirements',
      requirement: 'Required',
      description: 'Granular technical & functional requirements, boundary conditions, inclusions and out-of-scope items.',
      status: 'Active',
    },
    {
      id: 'sec-3',
      name: 'Deliverables & Milestones',
      requirement: 'Required',
      description: 'Formal deliverable specifications, expected acceptance criteria, milestone timelines, and review stages.',
      status: 'Active',
    },
    {
      id: 'sec-4',
      name: 'Governance, RACI & Staffing',
      requirement: 'Required',
      description: 'Stakeholder matrices, assigned key roles, escalation hierarchies, and weekly cadence governance.',
      status: 'Active',
    },
    {
      id: 'sec-5',
      name: 'Commercials, Pricing & Payment Terms',
      requirement: 'Required',
      description: 'Fee structures (T&M or Fixed), billing milestone schedules, out-of-pocket policies, and payment terms.',
      status: 'Active',
    },
    {
      id: 'sec-6',
      name: 'Security, Compliance & Data Privacy',
      requirement: 'Recommended',
      description: 'DOH, ADHICS, HIPAA compliance mandates, data residency requirements, and security clearance checks.',
      status: 'Active',
    },
    {
      id: 'sec-7',
      name: 'Service Level Agreements (SLAs)',
      requirement: 'Recommended',
      description: 'System uptime guarantees, incident response time thresholds, SLA penalties, and credit calculations.',
      status: 'Active',
    },
    {
      id: 'sec-8',
      name: 'Change Control & Variation Procedure',
      requirement: 'Conditional',
      description: 'Formal process for scope amendments, impact evaluation, change request approvals, and budget adjustments.',
      status: 'Active',
    },
  ])

  // Modals & Menu State
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false)
  const [newSecName, setNewSecName] = useState('')
  const [newSecReq, setNewSecReq] = useState<'Required' | 'Recommended' | 'Conditional'>('Required')
  const [newSecDesc, setNewSecDesc] = useState('')

  const [templateFilterDropdownOpen, setTemplateFilterDropdownOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<SectionTemplateItem | null>(null)
  const [editSecName, setEditSecName] = useState('')
  const [editSecReq, setEditSecReq] = useState<'Required' | 'Recommended' | 'Conditional'>('Required')
  const [editSecDesc, setEditSecDesc] = useState('')

  const [deactivateSectionModal, setDeactivateSectionModal] = useState<SectionTemplateItem | null>(null)
  const [reactivateSectionModal, setReactivateSectionModal] = useState<SectionTemplateItem | null>(null)

  useEffect(() => {
    if (!menuOpenId && !templateFilterDropdownOpen) return
    const handleClose = () => {
      setMenuOpenId(null)
      setTemplateFilterDropdownOpen(false)
    }
    document.addEventListener('click', handleClose)
    return () => document.removeEventListener('click', handleClose)
  }, [menuOpenId, templateFilterDropdownOpen])

  const filteredSections = sectionTemplates.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(sectionSearch.toLowerCase()) ||
      s.description.toLowerCase().includes(sectionSearch.toLowerCase())
    const matchesFilter =
      sectionFilter === 'All' ? true : s.requirement === sectionFilter
    return matchesSearch && matchesFilter
  })

  const [page, setPage] = useState(1)
  const pageSize = 8
  const totalPages = Math.ceil(filteredSections.length / pageSize) || 1
  const paginatedSections = filteredSections.slice((page - 1) * pageSize, page * pageSize)

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSecName.trim()) return
    const newSec: SectionTemplateItem = {
      id: 'sec-' + Date.now(),
      name: newSecName.trim(),
      requirement: newSecReq,
      description: newSecDesc.trim() || 'Standard SOW template section.',
      status: 'Active',
    }
    setSectionTemplates((prev) => [newSec, ...prev])
    setNewSecName('')
    setNewSecDesc('')
    setNewSecReq('Required')
    setIsAddSectionOpen(false)
    showToast('Section Created', 'success')
  }

  const handleUpdateSection = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSection || !editSecName.trim()) return
    setSectionTemplates((prev) =>
      prev.map((s) =>
        s.id === editingSection.id
          ? {
              ...s,
              name: editSecName.trim(),
              requirement: editSecReq,
              description: editSecDesc.trim(),
            }
          : s
      )
    )
    setEditingSection(null)
    showToast('Section Updated', 'success')
  }

  const renderRequirementBadge = (req: 'Required' | 'Recommended' | 'Conditional') => {
    const bg =
      req === 'Required'
        ? 'rgba(0,196,196,0.1)'
        : req === 'Recommended'
        ? 'rgba(59,130,246,0.1)'
        : 'rgba(245,158,11,0.1)'
    const color =
      req === 'Required' ? '#008a8a' : req === 'Recommended' ? '#2563eb' : '#d97706'
    const border =
      req === 'Required'
        ? 'rgba(0,196,196,0.25)'
        : req === 'Recommended'
        ? 'rgba(59,130,246,0.25)'
        : 'rgba(245,158,11,0.25)'

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '3px 9px',
          borderRadius: 20,
          fontSize: 11.5,
          fontWeight: 600,
          background: bg,
          color: color,
          border: '1px solid ' + border,
        }}
      >
        {req}
      </span>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        overflowY: 'auto',
        position: 'relative',
      }}
    >
      {/* ─── Header Row (No subheading) ─────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          flexShrink: 0,
          gap: 12,
        }}
      >
        <h1
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: '#0d212c',
            margin: 0,
            lineHeight: 1.15,
          }}
        >
          Templates
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Requirement Filter Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setTemplateFilterDropdownOpen((v) => !v)
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 10,
                background: sectionFilter !== 'All' ? 'rgba(0,196,196,0.1)' : '#ffffff',
                color: sectionFilter !== 'All' ? '#008a8a' : '#0d212c',
                border: '1px solid ' + (sectionFilter !== 'All' ? 'rgba(0,196,196,0.3)' : '#e2e8f0'),
                fontSize: 12.5,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.12s',
              }}
            >
              <span>{sectionFilter !== 'All' ? 'Requirement: ' + sectionFilter : 'Filter'}</span>
              <ChevronDown size={12} strokeWidth={2} />
            </button>

            {templateFilterDropdownOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 6,
                  background: '#ffffff',
                  borderRadius: 12,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                  border: '1px solid #e2e8f0',
                  padding: 8,
                  zIndex: 99,
                  minWidth: 160,
                }}
              >
                {(['All', 'Required', 'Recommended', 'Conditional'] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setSectionFilter(opt)
                      setPage(1)
                      setTemplateFilterDropdownOpen(false)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: 6,
                      border: 'none',
                      background: sectionFilter === opt ? 'rgba(0,196,196,0.08)' : 'transparent',
                      color: sectionFilter === opt ? '#008a8a' : '#0d212c',
                      fontSize: 12.5,
                      fontWeight: sectionFilter === opt ? 600 : 400,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span>{opt === 'All' ? 'All Requirements' : opt}</span>
                    {sectionFilter === opt && <Check size={13} color="#008a8a" strokeWidth={2.5} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              padding: '6px 12px',
              gap: 8,
              width: 200,
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search sections..."
              value={sectionSearch}
              onChange={(e) => setSectionSearch(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: 13,
                color: '#0d212c',
                width: '100%',
                background: 'transparent',
              }}
            />
          </div>

          {/* View Mode Toggle: Table / Cards */}
          <div
            style={{
              display: 'flex',
              background: '#ffffff',
              borderRadius: 10,
              padding: 2,
              border: '1px solid #e2e8f0',
            }}
          >
            <button
              onClick={() => setViewMode('table')}
              title="Table View"
              style={{
                padding: '6px 9px',
                borderRadius: 7,
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'table' ? '#f1f5f9' : 'transparent',
                color: viewMode === 'table' ? '#0d212c' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.12s',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              title="Card View"
              style={{
                padding: '6px 9px',
                borderRadius: 7,
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'cards' ? '#f1f5f9' : 'transparent',
                color: viewMode === 'cards' ? '#0d212c' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.12s',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </button>
          </div>

          {/* Add Section Button */}
          <button
            onClick={() => {
              setNewSecName('')
              setNewSecDesc('')
              setNewSecReq('Required')
              setIsAddSectionOpen(true)
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              borderRadius: 10,
              background: '#00C4C4',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,196,196,0.25)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#00a8a8')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#00C4C4')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Section
          </button>

          {notificationButton}
        </div>
      </div>

      {/* ─── Main Content: Table View or Card View ───────────────────────── */}
      {viewMode === 'table' ? (
        <div
          style={{
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.9)',
            borderRadius: 14,
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            overflow: 'visible',
            display: 'flex',
            flexDirection: 'column',
            marginBottom: 16,
          }}
        >
          <div style={{ overflowX: 'auto', overflowY: 'visible', borderRadius: 14 }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'separate',
                borderSpacing: 0,
                textAlign: 'left',
                fontSize: 13,
              }}
            >
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '12px 16px', fontSize: 11.5, fontWeight: 500, textTransform: 'uppercase', color: '#64748b', borderBottom: '1px solid #e2e8f0', width: '24%' }}>
                    Section Name
                  </th>
                  <th style={{ padding: '12px 14px', fontSize: 11.5, fontWeight: 500, textTransform: 'uppercase', color: '#64748b', borderBottom: '1px solid #e2e8f0', width: '14%' }}>
                    Requirement
                  </th>
                  <th style={{ padding: '12px 14px', fontSize: 11.5, fontWeight: 500, textTransform: 'uppercase', color: '#64748b', borderBottom: '1px solid #e2e8f0', width: '42%' }}>
                    Description & Guidance
                  </th>
                  <th style={{ padding: '12px 14px', fontSize: 11.5, fontWeight: 500, textTransform: 'uppercase', color: '#64748b', borderBottom: '1px solid #e2e8f0', width: '10%' }}>
                    Status
                  </th>
                  <th style={{ padding: '12px 16px', fontSize: 11.5, fontWeight: 500, textTransform: 'uppercase', color: '#64748b', borderBottom: '1px solid #e2e8f0', width: '10%', textAlign: 'center' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedSections.map((sec, idx) => {
                  const isMenuOpen = menuOpenId === sec.id
                  return (
                    <tr
                      key={sec.id}
                      style={{
                        borderBottom: idx < paginatedSections.length - 1 ? '1px solid rgba(0,196,196,0.07)' : undefined,
                        transition: 'background 0.12s',
                        height: 54,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                    >
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500, color: '#0d212c' }}>
                        {sec.name}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {renderRequirementBadge(sec.requirement)}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 12.5, color: '#64748b', lineHeight: 1.45 }}>
                        {sec.description}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '3px 9px',
                            borderRadius: 20,
                            fontSize: 11.5,
                            fontWeight: 600,
                            background: sec.status === 'Active' ? 'rgba(22,163,74,0.1)' : 'rgba(100,116,139,0.1)',
                            color: sec.status === 'Active' ? '#16a34a' : '#64748b',
                            border: '1px solid ' + (sec.status === 'Active' ? 'rgba(22,163,74,0.2)' : 'rgba(100,116,139,0.2)'),
                          }}
                        >
                          {sec.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', position: 'relative' }}>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setMenuOpenId(isMenuOpen ? null : sec.id)
                            }}
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 6,
                              border: 'none',
                              background: 'transparent',
                              color: '#64748b',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              padding: 0,
                              transition: 'color 0.15s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#0d212c')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                            aria-label="Actions"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {/* 3-Dot Floating Menu Overlay */}
                          {isMenuOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                position: 'absolute',
                                right: 0,
                                top: 'calc(100% + 4px)',
                                background: '#ffffff',
                                borderRadius: 10,
                                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                border: '1px solid #e2e8f0',
                                padding: 4,
                                minWidth: 150,
                                zIndex: 100,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                              }}
                            >
                              <button
                                onClick={() => {
                                  setEditingSection(sec)
                                  setEditSecName(sec.name)
                                  setEditSecReq(sec.requirement)
                                  setEditSecDesc(sec.description)
                                  setMenuOpenId(null)
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  width: '100%',
                                  padding: '8px 10px',
                                  border: 'none',
                                  background: 'transparent',
                                  borderRadius: 6,
                                  fontSize: 12.5,
                                  fontWeight: 500,
                                  color: '#0d212c',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  transition: 'background 0.1s',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                              >
                                <Pencil size={13} strokeWidth={2} />
                                Edit
                              </button>

                              {sec.status === 'Active' ? (
                                <button
                                  onClick={() => {
                                    setDeactivateSectionModal(sec)
                                    setMenuOpenId(null)
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    width: '100%',
                                    padding: '8px 10px',
                                    border: 'none',
                                    background: 'transparent',
                                    borderRadius: 6,
                                    fontSize: 12.5,
                                    fontWeight: 500,
                                    color: '#dc2626',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'background 0.1s',
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
                                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                >
                                  <Trash2 size={13} strokeWidth={2} />
                                  Deactivate
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setReactivateSectionModal(sec)
                                    setMenuOpenId(null)
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    width: '100%',
                                    padding: '8px 10px',
                                    border: 'none',
                                    background: 'transparent',
                                    borderRadius: 6,
                                    fontSize: 12.5,
                                    fontWeight: 500,
                                    color: '#008a8a',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'background 0.1s',
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,196,196,0.08)')}
                                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                >
                                  <CheckCircle2 size={13} strokeWidth={2} />
                                  Reactivate
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar (Consistent with PMO Profile View) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 18px',
              borderTop: '1px solid #e2e8f0',
              background: '#ffffff',
              borderBottomLeftRadius: 14,
              borderBottomRightRadius: 14,
            }}
          >
            <span style={{ fontSize: 12, color: '#64748b' }}>
              Showing {filteredSections.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredSections.length)} of {filteredSections.length} Templates
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                  background: page === 1 ? '#f8fafc' : '#ffffff',
                  color: page === 1 ? '#cbd5e1' : '#475569',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                ‹
              </button>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#475569', padding: '0 4px' }}>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                  background: page >= totalPages ? '#f8fafc' : '#ffffff',
                  color: page >= totalPages ? '#cbd5e1' : '#475569',
                  cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                ›
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Card View */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
            marginBottom: 20,
          }}
        >
          {paginatedSections.map((sec) => {
            const isMenuOpen = menuOpenId === sec.id
            return (
              <div
                key={sec.id}
                style={{
                  background: 'rgba(255,255,255,0.75)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.9)',
                  borderRadius: 14,
                  padding: '16px 18px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  position: 'relative',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {renderRequirementBadge(sec.requirement)}

                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setMenuOpenId(isMenuOpen ? null : sec.id)
                      }}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        border: 'none',
                        background: 'transparent',
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      <MoreVertical size={16} />
                    </button>

                    {isMenuOpen && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: 'calc(100% + 4px)',
                          background: '#ffffff',
                          borderRadius: 10,
                          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                          border: '1px solid #e2e8f0',
                          padding: 4,
                          minWidth: 140,
                          zIndex: 100,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2,
                        }}
                      >
                        <button
                          onClick={() => {
                            setEditingSection(sec)
                            setEditSecName(sec.name)
                            setEditSecReq(sec.requirement)
                            setEditSecDesc(sec.description)
                            setMenuOpenId(null)
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            width: '100%',
                            padding: '7px 10px',
                            border: 'none',
                            background: 'transparent',
                            borderRadius: 6,
                            fontSize: 12.5,
                            fontWeight: 500,
                            color: '#0d212c',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                        >
                          <Pencil size={13} strokeWidth={2} />
                          Edit
                        </button>
                        {sec.status === 'Active' ? (
                          <button
                            onClick={() => {
                              setDeactivateSectionModal(sec)
                              setMenuOpenId(null)
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              width: '100%',
                              padding: '7px 10px',
                              border: 'none',
                              background: 'transparent',
                              borderRadius: 6,
                              fontSize: 12.5,
                              fontWeight: 500,
                              color: '#dc2626',
                              cursor: 'pointer',
                              textAlign: 'left',
                            }}
                          >
                            <Trash2 size={13} strokeWidth={2} />
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setReactivateSectionModal(sec)
                              setMenuOpenId(null)
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              width: '100%',
                              padding: '7px 10px',
                              border: 'none',
                              background: 'transparent',
                              borderRadius: 6,
                              fontSize: 12.5,
                              fontWeight: 500,
                              color: '#008a8a',
                              cursor: 'pointer',
                              textAlign: 'left',
                            }}
                          >
                            <CheckCircle2 size={13} strokeWidth={2} />
                            Reactivate
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0d212c', margin: '0 0 6px', lineHeight: 1.3 }}>
                    {sec.name}
                  </h3>
                  <p style={{ fontSize: 12.5, color: '#64748b', margin: 0, lineHeight: 1.45, minHeight: 52 }}>
                    {sec.description}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: sec.status === 'Active' ? '#16a34a' : '#64748b',
                    }}
                  >
                    ● {sec.status}
                  </span>

                  <button
                    onClick={() => {
                      setEditingSection(sec)
                      setEditSecName(sec.name)
                      setEditSecReq(sec.requirement)
                      setEditSecDesc(sec.description)
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#0d212c',
                      cursor: 'pointer',
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ─── MODAL: Add Section ────────────────────────────────────────────── */}
      {isAddSectionOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(3px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddSectionOpen(false)
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 24,
              padding: '32px 28px',
              width: 520,
              maxWidth: '92vw',
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
            }}
          >
            <button
              onClick={() => setIsAddSectionOpen(false)}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                padding: 4,
                display: 'flex',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div style={{ fontSize: 20, fontWeight: 700, color: '#0d212c', marginBottom: 4 }}>
              Add SOW Section Template
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
              Define a standardized section requirement for all future SOW generation runs.
            </div>

            <form onSubmit={handleCreateSection} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#0d212c', marginBottom: 6 }}>
                  Section Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Data Governance & Residency"
                  value={newSecName}
                  onChange={(e) => setNewSecName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1.5px solid #e2e8f0',
                    fontSize: 13,
                    color: '#0d212c',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#0d212c', marginBottom: 6 }}>
                  Requirement Level <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  value={newSecReq}
                  onChange={(e) => setNewSecReq(e.target.value as 'Required' | 'Recommended' | 'Conditional')}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1.5px solid #e2e8f0',
                    fontSize: 13,
                    color: '#0d212c',
                    outline: 'none',
                    boxSizing: 'border-box',
                    background: '#ffffff',
                    cursor: 'pointer',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
                >
                  <option value="Required">Required</option>
                  <option value="Recommended">Recommended</option>
                  <option value="Conditional">Conditional</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#0d212c', marginBottom: 6 }}>
                  Description & Guidance
                </label>
                <textarea
                  rows={3}
                  placeholder="Outline expected sub-clauses, criteria, or agent drafting rules..."
                  value={newSecDesc}
                  onChange={(e) => setNewSecDesc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1.5px solid #e2e8f0',
                    fontSize: 13,
                    color: '#0d212c',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsAddSectionOpen(false)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: 10,
                    background: '#ffffff',
                    border: '1.5px solid #e2e8f0',
                    color: '#0d212c',
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: 10,
                    background: '#00C4C4',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(0,196,196,0.3)',
                  }}
                >
                  Create Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: Edit Section ───────────────────────────────────────────── */}
      {editingSection && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(3px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingSection(null)
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 24,
              padding: '32px 28px',
              width: 520,
              maxWidth: '92vw',
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
            }}
          >
            <button
              onClick={() => setEditingSection(null)}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                padding: 4,
                display: 'flex',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div style={{ fontSize: 20, fontWeight: 700, color: '#0d212c', marginBottom: 20 }}>
              Edit Template
            </div>

            <form onSubmit={handleUpdateSection} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#0d212c', marginBottom: 6 }}>
                  Section Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editSecName}
                  onChange={(e) => setEditSecName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1.5px solid #e2e8f0',
                    fontSize: 13,
                    color: '#0d212c',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#0d212c', marginBottom: 6 }}>
                  Requirement Level <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  value={editSecReq}
                  onChange={(e) => setEditSecReq(e.target.value as 'Required' | 'Recommended' | 'Conditional')}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1.5px solid #e2e8f0',
                    fontSize: 13,
                    color: '#0d212c',
                    outline: 'none',
                    boxSizing: 'border-box',
                    background: '#ffffff',
                    cursor: 'pointer',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
                >
                  <option value="Required">Required</option>
                  <option value="Recommended">Recommended</option>
                  <option value="Conditional">Conditional</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#0d212c', marginBottom: 6 }}>
                  Description & Guidance
                </label>
                <textarea
                  rows={3}
                  value={editSecDesc}
                  onChange={(e) => setEditSecDesc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1.5px solid #e2e8f0',
                    fontSize: 13,
                    color: '#0d212c',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: 10,
                    background: '#ffffff',
                    border: '1.5px solid #e2e8f0',
                    color: '#0d212c',
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: 10,
                    background: '#00C4C4',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(0,196,196,0.3)',
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: Deactivate Section ─────────────────────────────────────── */}
      {deactivateSectionModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(3px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeactivateSectionModal(null)
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 24,
              padding: '32px 28px',
              width: 440,
              maxWidth: '90vw',
              textAlign: 'center',
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
            }}
          >
            <button
              onClick={() => setDeactivateSectionModal(null)}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                padding: 4,
                display: 'flex',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
            </div>

            <div style={{ fontSize: 22, fontWeight: 700, color: '#0d212c', marginBottom: 8 }}>
              Deactivate Section?
            </div>
            <div style={{ fontSize: 14, color: '#64748b', marginBottom: 26, lineHeight: 1.5 }}>
              Are you sure you want to deactivate <strong style={{ color: '#0d212c' }}>{deactivateSectionModal.name}</strong>? It will not be automatically included in future SOW drafts.
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setDeactivateSectionModal(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 12,
                  background: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  color: '#0d212c',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const targetId = deactivateSectionModal.id
                  setSectionTemplates((prev) =>
                    prev.map((s) => (s.id === targetId ? { ...s, status: 'Deactivated' } : s))
                  )
                  setDeactivateSectionModal(null)
                  showToast('Section Deactivated', 'error')
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 12,
                  background: '#E60000',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(230,0,0,0.25)',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#cc0000')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#E60000')}
              >
                Deactivate Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: Reactivate Section ─────────────────────────────────────── */}
      {reactivateSectionModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(3px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setReactivateSectionModal(null)
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 24,
              padding: '32px 28px',
              width: 440,
              maxWidth: '90vw',
              textAlign: 'center',
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
            }}
          >
            <button
              onClick={() => setReactivateSectionModal(null)}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                padding: 4,
                display: 'flex',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: 'rgba(0,196,196,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00C4C4" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
            </div>

            <div style={{ fontSize: 22, fontWeight: 700, color: '#0d212c', marginBottom: 8 }}>
              Reactivate Section?
            </div>
            <div style={{ fontSize: 14, color: '#64748b', marginBottom: 26, lineHeight: 1.5 }}>
              Are you sure you want to reactivate <strong style={{ color: '#0d212c' }}>{reactivateSectionModal.name}</strong>? It will resume being included in future SOW templates.
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setReactivateSectionModal(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 12,
                  background: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  color: '#0d212c',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const targetId = reactivateSectionModal.id
                  setSectionTemplates((prev) =>
                    prev.map((s) => (s.id === targetId ? { ...s, status: 'Active' } : s))
                  )
                  setReactivateSectionModal(null)
                  showToast('Section Reactivated', 'success')
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 12,
                  background: '#00C4C4',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0,196,196,0.3)',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#00a8a8')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#00C4C4')}
              >
                Reactivate Section
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── 2. Platform User Directory Dedicated Page ──────────────────────────── */

export function UserDirectoryView({
  notificationButton,
}: {
  notificationButton?: React.ReactNode
}) {
  const { showToast } = useToast()
  const [userSearch, setUserSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false)
  const [page, setPage] = useState(1)
  const pageSize = 12

  const [userList, setUserList] = useState<PlatformUserItem[]>([
    { id: 'u-1', name: 'Ashika Jain', email: 'ashika.jain@company.com', roles: ['PMO', 'Reviewer'], assignedSOWs: 16, status: 'Active', lastActive: 'Just now' },
    { id: 'u-2', name: 'Narendra Patel', email: 'npatel@gmail.com', roles: ['Contributor'], assignedSOWs: 4, status: 'Active', lastActive: '25 mins ago' },
    { id: 'u-3', name: 'Dr. Fatima Al Nuaimi', email: 'dr.fatima@m42.ae', roles: ['Reviewer', 'Contributor'], assignedSOWs: 6, status: 'Active', lastActive: '1 hour ago' },
    { id: 'u-4', name: 'Cleveland Clinic Abu Dhabi', email: 'procurement@ccad.ae', roles: ['Client'], assignedSOWs: 3, status: 'Active', lastActive: '3 hours ago' },
    { id: 'u-5', name: 'Tariq Mansoor', email: 'tmansoor@m42.ae', roles: ['PMO'], assignedSOWs: 8, status: 'Active', lastActive: 'Yesterday' },
    { id: 'u-6', name: 'Sarah Jenkins', email: 'sjenkins@m42.ae', roles: ['Contributor', 'Reviewer'], assignedSOWs: 5, status: 'Active', lastActive: '2 days ago' },
    { id: 'u-7', name: 'Danat Al Emarat Health', email: 'vendor.contracts@danat.ae', roles: ['Client'], assignedSOWs: 2, status: 'Inactive', lastActive: '5 days ago' },
    { id: 'u-8', name: 'Marcus Vance', email: 'mvance@m42.ae', roles: ['Reviewer'], assignedSOWs: 4, status: 'Active', lastActive: '3 days ago' },
    { id: 'u-9', name: 'Ishita Sharma', email: 'ishitawork@gmail.com', roles: ['Reviewer', 'Contributor'], assignedSOWs: 7, status: 'Active', lastActive: '2 hours ago' },
    { id: 'u-10', name: 'Riza Khan', email: 'riza@gmail.com', roles: ['Client'], assignedSOWs: 2, status: 'Active', lastActive: 'Yesterday' },
    { id: 'u-11', name: 'David Chen', email: 'david.chen@globex.com', roles: ['Contributor'], assignedSOWs: 3, status: 'Active', lastActive: '3 days ago' },
    { id: 'u-12', name: 'Sarah Al-Mansoor', email: 'sarah.m@m42.ae', roles: ['Reviewer', 'PMO'], assignedSOWs: 5, status: 'Active', lastActive: 'Yesterday' },
    { id: 'u-13', name: 'Amina Al Zaabi', email: 'azaabi@m42.ae', roles: ['PMO'], assignedSOWs: 9, status: 'Active', lastActive: '4 hours ago' },
    { id: 'u-14', name: 'Vikram Malhotra', email: 'vmalhotra@techcorp.com', roles: ['Contributor', 'Reviewer'], assignedSOWs: 6, status: 'Active', lastActive: '1 day ago' },
    { id: 'u-15', name: 'Healthpoint Hospital Procurement', email: 'procurement@healthpoint.ae', roles: ['Client'], assignedSOWs: 2, status: 'Active', lastActive: 'Yesterday' },
    { id: 'u-16', name: 'Dr. Zaid Qureshi', email: 'zqureshi@m42.ae', roles: ['Reviewer'], assignedSOWs: 8, status: 'Active', lastActive: '6 hours ago' },
    { id: 'u-17', name: 'Rashid Al Dhaheri', email: 'rdhaheri@m42.ae', roles: ['PMO'], assignedSOWs: 11, status: 'Active', lastActive: '2 days ago' },
    { id: 'u-18', name: 'Elena Rostova', email: 'erostova@biomed.com', roles: ['Contributor'], assignedSOWs: 4, status: 'Active', lastActive: '3 days ago' },
    { id: 'u-19', name: 'Mubadala Health Contracts', email: 'contracts@mubadalahealth.ae', roles: ['Client'], assignedSOWs: 5, status: 'Active', lastActive: '12 hours ago' },
    { id: 'u-20', name: 'Priya Sharma', email: 'psharma@m42.ae', roles: ['Contributor', 'PMO'], assignedSOWs: 7, status: 'Active', lastActive: 'Just now' },
    { id: 'u-21', name: 'Arthur Pendelton', email: 'apendelton@m42.ae', roles: ['Reviewer'], assignedSOWs: 3, status: 'Inactive', lastActive: '1 week ago' },
    { id: 'u-22', name: 'National Reference Laboratory', email: 'admin@nrl.ae', roles: ['Client'], assignedSOWs: 1, status: 'Active', lastActive: '4 days ago' },
    { id: 'u-23', name: 'Kareem Mansour', email: 'kmansour@techcloud.ae', roles: ['Contributor'], assignedSOWs: 5, status: 'Active', lastActive: 'Yesterday' },
    { id: 'u-24', name: 'Sophia Sterling', email: 'ssterling@m42.ae', roles: ['Reviewer', 'Contributor'], assignedSOWs: 6, status: 'Active', lastActive: '2 hours ago' },
  ])

  // Modals state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserRoles, setNewUserRoles] = useState<UserRole[]>(['Contributor'])
  const [newRoleDropdownOpen, setNewRoleDropdownOpen] = useState(false)
  const [newUserEmailError, setNewUserEmailError] = useState('')

  const [editingUser, setEditingUser] = useState<PlatformUserItem | null>(null)
  const [editUserName, setEditUserName] = useState('')
  const [editUserEmail, setEditUserEmail] = useState('')
  const [editUserRoles, setEditUserRoles] = useState<UserRole[]>([])
  const [editRoleDropdownOpen, setEditRoleDropdownOpen] = useState(false)
  const [editUserEmailError, setEditUserEmailError] = useState('')

  const [userMenuOpenId, setUserMenuOpenId] = useState<string | null>(null)
  const [userToDelete, setUserToDelete] = useState<PlatformUserItem | null>(null)

  useEffect(() => {
    if (!filterDropdownOpen && !userMenuOpenId && !newRoleDropdownOpen && !editRoleDropdownOpen) return
    const handleClose = () => {
      setFilterDropdownOpen(false)
      setUserMenuOpenId(null)
      setNewRoleDropdownOpen(false)
      setEditRoleDropdownOpen(false)
    }
    document.addEventListener('click', handleClose)
    return () => document.removeEventListener('click', handleClose)
  }, [filterDropdownOpen, userMenuOpenId, newRoleDropdownOpen, editRoleDropdownOpen])

  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUserName.trim()) return
    if (!emailRegex.test(newUserEmail.trim())) {
      setNewUserEmailError('Please enter a valid email address (e.g. user@company.com).')
      showToast('Please enter a valid email address', 'error')
      return
    }
    if (newUserRoles.length === 0) {
      showToast('Please select at least one role', 'error')
      return
    }

    const newUser: PlatformUserItem = {
      id: 'u-' + Date.now(),
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      roles: newUserRoles,
      assignedSOWs: 0,
      status: 'Active',
      lastActive: 'Just now',
    }
    setUserList((prev) => [newUser, ...prev])
    setIsAddUserOpen(false)
    setNewUserName('')
    setNewUserEmail('')
    setNewUserRoles(['Contributor'])
    setNewUserEmailError('')
    showToast('User Created', 'success')
  }

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser || !editUserName.trim()) return
    if (!emailRegex.test(editUserEmail.trim())) {
      setEditUserEmailError('Please enter a valid email address (e.g. user@company.com).')
      showToast('Please enter a valid email address', 'error')
      return
    }
    if (editUserRoles.length === 0) {
      showToast('Please select at least one role', 'error')
      return
    }

    setUserList((prev) =>
      prev.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              name: editUserName.trim(),
              email: editUserEmail.trim(),
              roles: editUserRoles,
            }
          : u
      )
    )
    setEditingUser(null)
    showToast('User Details Updated', 'success')
  }

  const handleDeleteUser = (id: string, name: string) => {
    setUserList((prev) => prev.filter((u) => u.id !== id))
    showToast('User Deleted', 'error')
  }

  const toggleNewRole = (r: UserRole) => {
    if (newUserRoles.includes(r)) {
      if (newUserRoles.length > 1) {
        setNewUserRoles(newUserRoles.filter((role) => role !== r))
      }
    } else {
      setNewUserRoles([...newUserRoles, r])
    }
  }

  const toggleEditRole = (r: UserRole) => {
    if (editUserRoles.includes(r)) {
      if (editUserRoles.length > 1) {
        setEditUserRoles(editUserRoles.filter((role) => role !== r))
      }
    } else {
      setEditUserRoles([...editUserRoles, r])
    }
  }

  const filteredUsers = userList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
    const matchesRole = !roleFilter || u.roles.includes(roleFilter as UserRole)
    const matchesStatus = !statusFilter || u.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1
  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize)

  const renderRoleChips = (roles: UserRole[]) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {roles.map((role) => {
        const bg =
          role === 'PMO'
            ? 'rgba(0,196,196,0.1)'
            : role === 'Contributor'
            ? 'rgba(59,130,246,0.1)'
            : role === 'Reviewer'
            ? 'rgba(139,92,246,0.1)'
            : 'rgba(245,158,11,0.1)'
        const color =
          role === 'PMO'
            ? '#008a8a'
            : role === 'Contributor'
            ? '#2563eb'
            : role === 'Reviewer'
            ? '#7c3aed'
            : '#d97706'
        const border =
          role === 'PMO'
            ? 'rgba(0,196,196,0.25)'
            : role === 'Contributor'
            ? 'rgba(59,130,246,0.25)'
            : role === 'Reviewer'
            ? 'rgba(139,92,246,0.25)'
            : 'rgba(245,158,11,0.25)'

        return (
          <span
            key={role}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '2px 8px',
              borderRadius: 12,
              fontSize: 11,
              fontWeight: 500,
              background: bg,
              color: color,
              border: '1px solid ' + border,
            }}
          >
            {role}
          </span>
        )
      })}
    </div>
  )

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        overflowY: 'auto',
      }}
    >
      {/* ─── Header Row ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          flexShrink: 0,
          gap: 12,
        }}
      >
        <h1
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: '#0d212c',
            margin: 0,
            lineHeight: 1.15,
          }}
        >
          Users
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Search Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              padding: '6px 12px',
              gap: 8,
              width: 240,
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <Search size={14} color="#94a3b8" strokeWidth={2.2} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={userSearch}
              onChange={(e) => {
                setUserSearch(e.target.value)
                setPage(1)
              }}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: 13,
                color: '#0d212c',
                width: '100%',
                background: 'transparent',
              }}
            />
          </div>

          {/* Filter Dropdown Button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setFilterDropdownOpen((v) => !v)
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 10,
                background: (roleFilter || statusFilter) ? 'rgba(0,196,196,0.1)' : '#ffffff',
                color: (roleFilter || statusFilter) ? '#008a8a' : '#0d212c',
                border: '1px solid ' + ((roleFilter || statusFilter) ? 'rgba(0,196,196,0.3)' : '#e2e8f0'),
                fontSize: 12.5,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.12s',
              }}
            >
              <span>{roleFilter ? 'Role: ' + roleFilter : statusFilter ? 'Status: ' + statusFilter : 'Filter'}</span>
              <ChevronDown size={12} strokeWidth={2} />
            </button>

            {filterDropdownOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 6px)',
                  background: '#ffffff',
                  borderRadius: 12,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                  border: '1px solid #e2e8f0',
                  padding: 12,
                  width: 200,
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>
                    Filter by Role
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {['All', 'PMO', 'Contributor', 'Reviewer', 'Client'].map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          setRoleFilter(r === 'All' ? null : r)
                          setPage(1)
                          setFilterDropdownOpen(false)
                        }}
                        style={{
                          padding: '6px 8px',
                          borderRadius: 6,
                          border: 'none',
                          background: (r === 'All' && !roleFilter) || roleFilter === r ? 'rgba(0,196,196,0.1)' : 'transparent',
                          color: (r === 'All' && !roleFilter) || roleFilter === r ? '#008a8a' : '#0d212c',
                          fontSize: 12.5,
                          fontWeight: (r === 'All' && !roleFilter) || roleFilter === r ? 600 : 500,
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>
                    Status
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {['All', 'Active', 'Inactive'].map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setStatusFilter(s === 'All' ? null : s)
                          setPage(1)
                          setFilterDropdownOpen(false)
                        }}
                        style={{
                          padding: '6px 8px',
                          borderRadius: 6,
                          border: 'none',
                          background: (s === 'All' && !statusFilter) || statusFilter === s ? 'rgba(0,196,196,0.1)' : 'transparent',
                          color: (s === 'All' && !statusFilter) || statusFilter === s ? '#008a8a' : '#0d212c',
                          fontSize: 12.5,
                          fontWeight: (s === 'All' && !statusFilter) || statusFilter === s ? 600 : 500,
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {(roleFilter || statusFilter) && (
                  <button
                    onClick={() => {
                      setRoleFilter(null)
                      setStatusFilter(null)
                      setPage(1)
                      setFilterDropdownOpen(false)
                    }}
                    style={{
                      padding: '6px',
                      borderRadius: 6,
                      border: '1px solid #fee2e2',
                      background: '#fef2f2',
                      color: '#dc2626',
                      fontSize: 11.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginTop: 4,
                    }}
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Add New User CTA */}
          <button
            onClick={() => {
              setNewUserName('')
              setNewUserEmail('')
              setNewUserRoles(['Contributor'])
              setNewUserEmailError('')
              setNewRoleDropdownOpen(false)
              setIsAddUserOpen(true)
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              borderRadius: 10,
              background: '#00C4C4',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,196,196,0.25)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#00a8a8')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#00C4C4')}
          >
            <Plus size={15} strokeWidth={2.4} />
            Add New User
          </button>

          {notificationButton}
        </div>
      </div>

      {/* ─── Table Card Container ───────────────────────────────────────── */}
      <div
        style={{
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.9)',
          borderRadius: 14,
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          marginBottom: 16,
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: 0,
              textAlign: 'left',
              fontSize: 13,
            }}
          >
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '12px 16px', fontSize: 11.5, fontWeight: 500, textTransform: 'uppercase', color: '#64748b', borderBottom: '1px solid #e2e8f0', width: '28%' }}>
                  Platform User
                </th>
                <th style={{ padding: '12px 14px', fontSize: 11.5, fontWeight: 500, textTransform: 'uppercase', color: '#64748b', borderBottom: '1px solid #e2e8f0', width: '24%' }}>
                  Role
                </th>
                <th style={{ padding: '12px 14px', fontSize: 11.5, fontWeight: 500, textTransform: 'uppercase', color: '#64748b', borderBottom: '1px solid #e2e8f0', width: '14%' }}>
                  Assigned SOWs
                </th>
                <th style={{ padding: '12px 14px', fontSize: 11.5, fontWeight: 500, textTransform: 'uppercase', color: '#64748b', borderBottom: '1px solid #e2e8f0', width: '12%' }}>
                  Status
                </th>
                <th style={{ padding: '12px 14px', fontSize: 11.5, fontWeight: 500, textTransform: 'uppercase', color: '#64748b', borderBottom: '1px solid #e2e8f0', width: '12%' }}>
                  Last Active
                </th>
                <th style={{ padding: '12px 16px', fontSize: 11.5, fontWeight: 500, textTransform: 'uppercase', color: '#64748b', borderBottom: '1px solid #e2e8f0', width: '10%', textAlign: 'center' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((u, idx) => {
                const initials = u.name
                  .split(' ')
                  .map((p) => p[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()

                return (
                  <tr
                    key={u.id}
                    style={{
                      borderBottom: idx < paginatedUsers.length - 1 ? '1px solid rgba(0,196,196,0.07)' : undefined,
                      transition: 'background 0.12s',
                      height: 54,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                  >
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background:
                              u.roles.includes('PMO')
                                ? 'linear-gradient(135deg, #00C4C4 0%, #008a8a 100%)'
                                : u.roles.includes('Contributor')
                                ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                                : u.roles.includes('Reviewer')
                                ? 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'
                                : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: 11.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {initials}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: '#0d212c' }}>{u.name}</div>
                          <div style={{ fontSize: 11.5, color: '#64748b' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {renderRoleChips(u.roles)}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: '#0d212c', fontWeight: 500 }}>
                      {u.assignedSOWs} SOWs
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '3px 9px',
                          borderRadius: 20,
                          fontSize: 11.5,
                          fontWeight: 600,
                          background: u.status === 'Active' ? 'rgba(22,163,74,0.1)' : 'rgba(100,116,139,0.1)',
                          color: u.status === 'Active' ? '#16a34a' : '#64748b',
                          border: '1px solid ' + (u.status === 'Active' ? 'rgba(22,163,74,0.2)' : 'rgba(100,116,139,0.2)'),
                        }}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 12.5, color: '#64748b' }}>
                      {u.lastActive}
                    </td>
                    <td style={{ padding: '10px 16px', textAlign: 'center', position: 'relative' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setUserMenuOpenId((prev) => (prev === u.id ? null : u.id))
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px 6px',
                            color: '#64748b',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 6,
                          }}
                          title="Actions"
                        >
                          <MoreVertical size={16} color="#64748b" />
                        </button>

                        {userMenuOpenId === u.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              position: 'absolute',
                              right: 0,
                              top: 'calc(100% + 4px)',
                              background: '#ffffff',
                              borderRadius: 10,
                              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                              border: '1px solid #e2e8f0',
                              padding: 6,
                              minWidth: 130,
                              zIndex: 100,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 2,
                            }}
                          >
                            <button
                              onClick={() => {
                                setUserMenuOpenId(null)
                                setEditingUser(u)
                                setEditUserName(u.name)
                                setEditUserEmail(u.email)
                                setEditUserRoles([...u.roles])
                                setEditUserEmailError('')
                                setEditRoleDropdownOpen(false)
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '8px 10px',
                                border: 'none',
                                background: 'transparent',
                                color: '#0d212c',
                                fontSize: 12.5,
                                fontWeight: 500,
                                borderRadius: 6,
                                cursor: 'pointer',
                                textAlign: 'left',
                                width: '100%',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            >
                              <Pencil size={13} color="#008a8a" />
                              Edit User
                            </button>
                            <button
                              onClick={() => {
                                setUserMenuOpenId(null)
                                setUserToDelete(u)
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '8px 10px',
                                border: 'none',
                                background: 'transparent',
                                color: '#dc2626',
                                fontSize: 12.5,
                                fontWeight: 500,
                                borderRadius: 6,
                                cursor: 'pointer',
                                textAlign: 'left',
                                width: '100%',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
                              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            >
                              <Trash2 size={13} color="#dc2626" />
                              Delete User
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar (Consistent with PMO Profile View) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            borderTop: '1px solid #e2e8f0',
            background: '#ffffff',
          }}
        >
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Showing {filteredUsers.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredUsers.length)} of {filteredUsers.length} Users
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                background: page === 1 ? '#f8fafc' : '#ffffff',
                color: page === 1 ? '#cbd5e1' : '#475569',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              ‹
            </button>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#475569', padding: '0 4px' }}>
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                background: page >= totalPages ? '#f8fafc' : '#ffffff',
                color: page >= totalPages ? '#cbd5e1' : '#475569',
                cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* ─── MODAL: Add New User ────────────────────────────────────────── */}
      {isAddUserOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(3px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddUserOpen(false)
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 24,
              padding: '32px 28px',
              width: 500,
              maxWidth: '92vw',
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
            }}
          >
            <button
              onClick={() => setIsAddUserOpen(false)}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                padding: 4,
                display: 'flex',
              }}
            >
              <X size={20} />
            </button>

            <div style={{ fontSize: 20, fontWeight: 700, color: '#0d212c', marginBottom: 4 }}>
              Add New User
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
              Create a user profile and assign role permissions across SOW workspaces.
            </div>

            <form noValidate onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#0d212c', marginBottom: 6 }}>
                  Full Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1.5px solid #e2e8f0',
                    background: '#ffffff',
                    fontSize: 13,
                    color: '#0d212c',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.15s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.background = '#f8fafc'
                    e.currentTarget.style.borderColor = '#cbd5e1'
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(203, 213, 225, 0.4)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.background = '#ffffff'
                    e.currentTarget.style.borderColor = '#e2e8f0'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#0d212c', marginBottom: 6 }}>
                  Email Address <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. sjenkins@m42.ae"
                  value={newUserEmail}
                  onChange={(e) => {
                    setNewUserEmail(e.target.value)
                    if (newUserEmailError) setNewUserEmailError('')
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.background = '#ffffff'
                    e.currentTarget.style.boxShadow = 'none'
                    const val = e.target.value.trim()
                    if (val && !emailRegex.test(val)) {
                      setNewUserEmailError('Please enter a valid email address (e.g. user@company.com).')
                      e.currentTarget.style.borderColor = '#dc2626'
                    } else {
                      e.currentTarget.style.borderColor = '#e2e8f0'
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1.5px solid ' + (newUserEmailError ? '#dc2626' : '#e2e8f0'),
                    background: '#ffffff',
                    fontSize: 13,
                    color: '#0d212c',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.15s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.background = '#f8fafc'
                    e.currentTarget.style.borderColor = newUserEmailError ? '#dc2626' : '#cbd5e1'
                    e.currentTarget.style.boxShadow = newUserEmailError ? '0 0 0 2px rgba(220, 38, 38, 0.2)' : '0 0 0 2px rgba(203, 213, 225, 0.4)'
                  }}
                />
                {newUserEmailError && (
                  <div style={{ fontSize: 12, color: '#dc2626', marginTop: 5, display: 'flex', alignItems: 'center', gap: 5, fontWeight: 500 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {newUserEmailError}
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#0d212c', marginBottom: 6 }}>
                  Assigned Roles (Multi-Role Allowed) <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setNewRoleDropdownOpen((prev) => !prev)
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1.5px solid #e2e8f0',
                      background: '#ffffff',
                      fontSize: 13,
                      color: newUserRoles.length > 0 ? '#0d212c' : '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'all 0.15s ease',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.background = '#f8fafc'
                      e.currentTarget.style.borderColor = '#cbd5e1'
                      e.currentTarget.style.boxShadow = '0 0 0 2px rgba(203, 213, 225, 0.4)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.background = '#ffffff'
                      e.currentTarget.style.borderColor = '#e2e8f0'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <span>{newUserRoles.length > 0 ? newUserRoles.join(', ') : 'Select roles...'}</span>
                    <ChevronDown size={14} color="#64748b" />
                  </button>

                  {newRoleDropdownOpen && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        right: 0,
                        background: '#ffffff',
                        borderRadius: 10,
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                        padding: '6px',
                        zIndex: 200,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                      }}
                    >
                      {(['PMO', 'Contributor', 'Reviewer', 'Client'] as UserRole[]).map((r) => {
                        const isSelected = newUserRoles.includes(r)
                        return (
                          <div
                            key={r}
                            onClick={() => toggleNewRole(r)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              padding: '8px 10px',
                              borderRadius: 6,
                              cursor: 'pointer',
                              background: isSelected ? 'rgba(0,196,196,0.06)' : 'transparent',
                              transition: 'background 0.1s',
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) e.currentTarget.style.background = '#f8fafc'
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) e.currentTarget.style.background = 'transparent'
                            }}
                          >
                            <div
                              style={{
                                width: 16,
                                height: 16,
                                borderRadius: 4,
                                border: '1.5px solid ' + (isSelected ? '#00C4C4' : '#cbd5e1'),
                                background: isSelected ? '#00C4C4' : '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              {isSelected && <Check size={12} color="#ffffff" strokeWidth={3} />}
                            </div>
                            <span style={{ fontSize: 13, fontWeight: isSelected ? 600 : 500, color: '#0d212c' }}>
                              {r}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: 10,
                    background: '#ffffff',
                    border: '1.5px solid #e2e8f0',
                    color: '#0d212c',
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: 10,
                    background: '#00C4C4',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(0,196,196,0.3)',
                  }}
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: Edit User ──────────────────────────────────────────── */}
      {editingUser && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(3px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingUser(null)
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 24,
              padding: '32px 28px',
              width: 500,
              maxWidth: '92vw',
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
            }}
          >
            <button
              onClick={() => setEditingUser(null)}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                padding: 4,
                display: 'flex',
              }}
            >
              <X size={20} />
            </button>

            <div style={{ fontSize: 20, fontWeight: 700, color: '#0d212c', marginBottom: 20 }}>
              Edit User Details
            </div>

            <form noValidate onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#0d212c', marginBottom: 6 }}>
                  Full Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1.5px solid #e2e8f0',
                    fontSize: 13,
                    color: '#0d212c',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#0d212c', marginBottom: 6 }}>
                  Email Address <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editUserEmail}
                  onChange={(e) => {
                    setEditUserEmail(e.target.value)
                    if (editUserEmailError) setEditUserEmailError('')
                  }}
                  onBlur={(e) => {
                    const val = e.target.value.trim()
                    if (val && !emailRegex.test(val)) {
                      setEditUserEmailError('Please enter a valid email address (e.g. user@company.com).')
                      e.currentTarget.style.borderColor = '#dc2626'
                    } else {
                      e.currentTarget.style.borderColor = '#e2e8f0'
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1.5px solid ' + (editUserEmailError ? '#dc2626' : '#e2e8f0'),
                    fontSize: 13,
                    color: '#0d212c',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = editUserEmailError ? '#dc2626' : '#e2e8f0')}
                />
                {editUserEmailError && (
                  <div style={{ fontSize: 12, color: '#dc2626', marginTop: 5, display: 'flex', alignItems: 'center', gap: 5, fontWeight: 500 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {editUserEmailError}
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#0d212c', marginBottom: 6 }}>
                  Assigned Roles (Multi-Role Allowed) <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditRoleDropdownOpen((prev) => !prev)
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1.5px solid #e2e8f0',
                      background: '#ffffff',
                      fontSize: 13,
                      color: editUserRoles.length > 0 ? '#0d212c' : '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
                  >
                    <span>{editUserRoles.length > 0 ? editUserRoles.join(', ') : 'Select roles...'}</span>
                    <ChevronDown size={14} color="#64748b" />
                  </button>

                  {editRoleDropdownOpen && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        right: 0,
                        background: '#ffffff',
                        borderRadius: 10,
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                        padding: '6px',
                        zIndex: 200,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                      }}
                    >
                      {(['PMO', 'Contributor', 'Reviewer', 'Client'] as UserRole[]).map((r) => {
                        const isSelected = editUserRoles.includes(r)
                        return (
                          <div
                            key={r}
                            onClick={() => toggleEditRole(r)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              padding: '8px 10px',
                              borderRadius: 6,
                              cursor: 'pointer',
                              background: isSelected ? 'rgba(0,196,196,0.06)' : 'transparent',
                              transition: 'background 0.1s',
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) e.currentTarget.style.background = '#f8fafc'
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) e.currentTarget.style.background = 'transparent'
                            }}
                          >
                            <div
                              style={{
                                width: 16,
                                height: 16,
                                borderRadius: 4,
                                border: '1.5px solid ' + (isSelected ? '#00C4C4' : '#cbd5e1'),
                                background: isSelected ? '#00C4C4' : '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              {isSelected && <Check size={12} color="#ffffff" strokeWidth={3} />}
                            </div>
                            <span style={{ fontSize: 13, fontWeight: isSelected ? 600 : 500, color: '#0d212c' }}>
                              {r}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: 10,
                    background: '#ffffff',
                    border: '1.5px solid #e2e8f0',
                    color: '#0d212c',
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: 10,
                    background: '#00C4C4',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(0,196,196,0.3)',
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: Delete User Confirmation (PMO Consistent Negative Popup) ─── */}
      {userToDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(3px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setUserToDelete(null)
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 24,
              padding: '32px 28px',
              width: 440,
              maxWidth: '90vw',
              textAlign: 'center',
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
            }}
          >
            <button
              onClick={() => setUserToDelete(null)}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                padding: 4,
                display: 'flex',
              }}
            >
              <X size={20} />
            </button>

            {/* Red Icon Circle */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <Trash2 size={26} color="#ef4444" strokeWidth={2.2} />
            </div>

            <div style={{ fontSize: 22, fontWeight: 700, color: '#0d212c', marginBottom: 8 }}>
              Delete User?
            </div>
            <div style={{ fontSize: 14, color: '#64748b', marginBottom: 26, lineHeight: 1.5 }}>
              Are you sure you want to delete <strong style={{ color: '#0d212c' }}>{userToDelete.name}</strong>? This action cannot be undone and will revoke all workspace access.
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 12,
                  background: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  color: '#0d212c',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDeleteUser(userToDelete.id, userToDelete.name)
                  setUserToDelete(null)
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 12,
                  background: '#E60000',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(230,0,0,0.25)',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#cc0000')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#E60000')}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── 3. Admin Home View (Overview & Visual SOW Workspace) ──────────────── */

function AdminHomeView({
  notificationButton,
  onNavigate,
}: {
  notificationButton?: React.ReactNode
  onNavigate?: (view: 'all-sows' | 'user-directory' | 'section-templates' | 'agents') => void
}) {
  const [adminSearch, setAdminSearch] = useState('')

  const recentSOWs = [
    {
      name: 'Customer Transformation Program',
      status: 'On Track',
      statusBg: '#dcfce7',
      statusColor: '#15803d',
      readiness: '85%',
      pmoName: 'Ashika Jain',
      dueDate: 'Oct 15, 2026',
      updatedOn: '2 hours ago',
    },
    {
      name: 'Procurement Platform Modernization',
      status: 'At Risk',
      statusBg: '#fee2e2',
      statusColor: '#dc2626',
      readiness: '75%',
      pmoName: 'Ashika Jain',
      dueDate: 'Oct 22, 2026',
      updatedOn: 'Yesterday',
    },
    {
      name: 'Digital Workplace Enablement',
      status: 'On Track',
      statusBg: '#dcfce7',
      statusColor: '#15803d',
      readiness: '75%',
      pmoName: 'Parag Sharma',
      dueDate: 'Nov 05, 2026',
      updatedOn: '3 days ago',
    },
    {
      name: 'Cloud Modernization Initiative',
      status: 'Deactivated',
      statusBg: '#f1f5f9',
      statusColor: '#64748b',
      readiness: '35%',
      pmoName: 'Ashika Jain',
      dueDate: 'Nov 18, 2026',
      updatedOn: '5 days ago',
    },
  ]

  const filteredRecentSOWs = recentSOWs.filter(
    (s) =>
      s.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
      s.pmoName.toLowerCase().includes(adminSearch.toLowerCase())
  )

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        overflowY: 'auto',
        paddingBottom: 24,
      }}
    >
      {/* ─── Top Greeting & Search Header (No Subtitle) ─────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          flexShrink: 0,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#0d212c',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Home
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {notificationButton}
        </div>
      </div>

      {/* ─── 4 Top KPI Cards (Exact PMO Card Layout & Structure) ────────── */}
      <div className="grid grid-cols-4 gap-3.5 mb-5" style={{ flexShrink: 0 }}>
        {/* KPI 1: Total Templates */}
        <div
          onClick={() => onNavigate?.('section-templates')}
          style={{
            background: 'rgba(255,255,255,0.8)',
            border: '1px solid rgba(255,255,255,0.9)',
            borderRadius: 16,
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            boxShadow: '0 2px 12px rgba(0,196,196,0.07)',
            cursor: 'pointer',
            transition: 'transform 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              TOTAL TEMPLATES
            </span>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LayoutTemplate size={16} color="#ef4444" strokeWidth={1.8} />
            </div>
          </div>
          <div style={{ fontSize: 36, fontWeight: 600, color: '#0d212c', lineHeight: 1 }}>8</div>
          <div style={{ height: 1, background: 'rgba(0,196,196,0.12)', width: '100%', margin: '4px 0 2px 0' }} />
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: '#64748b' }}>4 Required • 3 Recommended • 1 Conditional</span>
          </div>
        </div>

        {/* KPI 2: Active Agents */}
        <div
          onClick={() => onNavigate?.('agents')}
          style={{
            background: 'rgba(255,255,255,0.8)',
            border: '1px solid rgba(255,255,255,0.9)',
            borderRadius: 16,
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            boxShadow: '0 2px 12px rgba(0,196,196,0.07)',
            cursor: 'pointer',
            transition: 'transform 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              ACTIVE AGENTS
            </span>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={16} color="#16a34a" strokeWidth={1.8} />
            </div>
          </div>
          <div style={{ fontSize: 36, fontWeight: 600, color: '#0d212c', lineHeight: 1 }}>12</div>
          <div style={{ height: 1, background: 'rgba(0,196,196,0.12)', width: '100%', margin: '4px 0 2px 0' }} />
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: '#16a34a' }}>All agents active</span>
          </div>
        </div>

        {/* KPI 3: Active Users */}
        <div
          onClick={() => onNavigate?.('user-directory')}
          style={{
            background: 'rgba(255,255,255,0.8)',
            border: '1px solid rgba(255,255,255,0.9)',
            borderRadius: 16,
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            boxShadow: '0 2px 12px rgba(0,196,196,0.07)',
            cursor: 'pointer',
            transition: 'transform 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              ACTIVE USERS
            </span>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={16} color="#0284c7" strokeWidth={1.8} />
            </div>
          </div>
          <div style={{ fontSize: 36, fontWeight: 600, color: '#0d212c', lineHeight: 1 }}>24</div>
          <div style={{ height: 1, background: 'rgba(0,196,196,0.12)', width: '100%', margin: '4px 0 2px 0' }} />
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: '#0284c7' }}>Across all roles</span>
          </div>
        </div>

        {/* KPI 4: Active SOWs */}
        <div
          onClick={() => onNavigate?.('all-sows')}
          style={{
            background: 'rgba(255,255,255,0.8)',
            border: '1px solid rgba(255,255,255,0.9)',
            borderRadius: 16,
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            boxShadow: '0 2px 12px rgba(0,196,196,0.07)',
            cursor: 'pointer',
            transition: 'transform 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              ACTIVE SOWS
            </span>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={16} color="#ef4444" strokeWidth={1.8} />
            </div>
          </div>
          <div style={{ fontSize: 36, fontWeight: 600, color: '#0d212c', lineHeight: 1 }}>16</div>
          <div style={{ height: 1, background: 'rgba(0,196,196,0.12)', width: '100%', margin: '4px 0 2px 0' }} />
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: '#64748b' }}>5 In Progress • 4 On Track • 3 Pending</span>
          </div>
        </div>
      </div>

      {/* ─── Middle Section: 2 Cards (Titles & CTAs outside cards) ─────────── */}
      <div className="grid grid-cols-2 gap-4 mb-5" style={{ flexShrink: 0 }}>
        {/* Column 1: Template Overview */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0d212c', margin: 0 }}>
              Template Overview
            </h2>
            <button
              onClick={() => onNavigate?.('section-templates')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                background: 'none',
                border: 'none',
                color: '#00C4C4',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              View all templates →
            </button>
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.8)',
              border: '1px solid rgba(255,255,255,0.9)',
              borderRadius: 16,
              padding: '24px 28px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
              display: 'flex',
              alignItems: 'center',
              minHeight: 265,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, flex: 1 }}>
              {/* SVG Donut Ring */}
              <div style={{ position: 'relative', width: 190, height: 190, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="190" height="190" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                  {/* Circumference = 2 * PI * 38 ≈ 238.76 */}
                  {/* Required: 4/8 = 50% -> 119.38 */}
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#4ECCA3" strokeWidth="14" strokeDasharray="117.38 238.76" strokeDashoffset="0" />
                  {/* Recommended: 3/8 = 37.5% -> 89.53 */}
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#38BDF8" strokeWidth="14" strokeDasharray="87.53 238.76" strokeDashoffset="-119.38" />
                  {/* Conditional: 1/8 = 12.5% -> 29.85 */}
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#FACC15" strokeWidth="14" strokeDasharray="27.85 238.76" strokeDashoffset="-208.91" />
                </svg>
                {/* Center Counter */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#0d212c', lineHeight: 1 }}>
                    8
                  </div>
                  <div style={{ fontSize: 11.5, fontWeight: 500, color: '#64748b', marginTop: 3 }}>
                    Total Templates
                  </div>
                </div>
              </div>

              {/* Legend Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, paddingLeft: 12 }}>
                {[
                  { label: 'Required', count: 4, color: '#4ECCA3' },
                  { label: 'Recommended', count: 3, color: '#38BDF8' },
                  { label: 'Conditional', count: 1, color: '#FACC15' },
                  { label: 'Other', count: 0, color: '#C084FC' },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13.5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                      <span style={{ fontWeight: 500, color: '#475569' }}>{item.label}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: '#0d212c' }}>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Users Overview */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0d212c', margin: 0 }}>
              Users Overview
            </h2>
            <button
              onClick={() => onNavigate?.('user-directory')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                background: 'none',
                border: 'none',
                color: '#00C4C4',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              View all users →
            </button>
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.8)',
              border: '1px solid rgba(255,255,255,0.9)',
              borderRadius: 16,
              padding: '24px 28px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 265,
              justifyContent: 'center',
            }}
          >
            <div style={{ display: 'flex', height: 200, alignItems: 'flex-end', paddingTop: 0 }}>
              {/* Y Axis Labels */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: 160,
                  paddingBottom: 22,
                  marginRight: 12,
                  fontSize: 11,
                  color: '#94a3b8',
                  textAlign: 'right',
                  width: 18,
                }}
              >
                <span>10</span>
                <span>8</span>
                <span>6</span>
                <span>4</span>
                <span>2</span>
                <span>0</span>
              </div>

              {/* Bars Container */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 18,
                  flex: 1,
                  height: 160,
                  borderLeft: '1px solid #f1f5f9',
                  borderBottom: '1px solid #f1f5f9',
                  padding: '0 14px',
                  position: 'relative',
                }}
              >
                {[
                  { role: 'Contributor', val: 9, max: 10, color: '#38BDF8' },
                  { role: 'Reviewer', val: 7, max: 10, color: '#A78BFA' },
                  { role: 'PMO', val: 4, max: 10, color: '#34D399' },
                  { role: 'Client', val: 4, max: 10, color: '#FBBF24' },
                ].map((bar) => {
                  const heightPct = (bar.val / bar.max) * 100
                  return (
                    <div
                      key={bar.role}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        height: '100%',
                      }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#0d212c', marginBottom: 4 }}>
                        {bar.val}
                      </span>
                      <div
                        style={{
                          width: '70%',
                          maxWidth: 46,
                          height: `${heightPct}%`,
                          background: bar.color,
                          borderRadius: '6px 6px 0 0',
                          transition: 'height 0.3s ease',
                        }}
                      />
                      <span
                        style={{
                          fontSize: 11.5,
                          fontWeight: 500,
                          color: '#64748b',
                          marginTop: 6,
                          position: 'absolute',
                          bottom: -22,
                        }}
                      >
                        {bar.role}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom Section: Recent SOWs (Title on left, Search & View all on right with 12px gap) ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0d212c', margin: 0 }}>
            Recent SOWs
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: '6px 12px',
                width: 280,
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
              }}
            >
              <Search size={14} color="#94a3b8" />
              <input
                type="text"
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                placeholder="Search recent SOWs..."
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: 12.5,
                  color: '#0d212c',
                  width: '100%',
                }}
              />
            </div>
            <button
              onClick={() => onNavigate?.('all-sows')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                background: 'none',
                border: 'none',
                color: '#00C4C4',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              View all →
            </button>
          </div>
        </div>

        <div
          style={{
            background: 'rgba(255,255,255,0.8)',
            border: '1px solid rgba(255,255,255,0.9)',
            borderRadius: 16,
            padding: '20px 24px 18px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <th style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', width: '26%' }}>
                    SOW NAME
                  </th>
                  <th style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', width: '14%' }}>
                    STATUS
                  </th>
                  <th style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', width: '12%' }}>
                    READINESS
                  </th>
                  <th style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', width: '16%' }}>
                    PMO NAME
                  </th>
                  <th style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', width: '16%' }}>
                    DUE DATE
                  </th>
                  <th style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', width: '16%' }}>
                    UPDATED ON
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRecentSOWs.map((row, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: idx < filteredRecentSOWs.length - 1 ? '1px solid #f8fafc' : 'none',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 14px', fontSize: 13, fontWeight: 500, color: '#0d212c' }}>
                      {row.name}
                    </td>
                    <td style={{ padding: '14px 14px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '3px 12px',
                          borderRadius: 99,
                          fontSize: 12,
                          fontWeight: 500,
                          background: row.statusBg,
                          color: row.statusColor,
                        }}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 14px', fontSize: 13, fontWeight: 400, color: '#0d212c' }}>
                      {row.readiness}
                    </td>
                    <td style={{ padding: '14px 14px', fontSize: 13, color: '#0d212c', fontWeight: 400 }}>
                      {row.pmoName}
                    </td>
                    <td style={{ padding: '14px 14px', fontSize: 13, fontWeight: 400, color: '#dc2626' }}>
                      {row.dueDate}
                    </td>
                    <td style={{ padding: '14px 14px', fontSize: 12, color: '#64748b', fontWeight: 400 }}>
                      {row.updatedOn}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
  onOpenSOWDeactivated,
}) => {
  const [previewRole, setPreviewRole] = useState<'PMO' | 'Contributor' | 'Reviewer' | null>(null)
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false)
  const effectiveRole = previewRole || userRole
  const isAdmin = effectiveRole === 'Admin'
  const isContributor = effectiveRole === 'Contributor'
  const isClient = effectiveRole === 'Client'
  const isReviewer = effectiveRole === 'Reviewer'
  const isPMO = !isContributor && !isClient && !isReviewer && !isAdmin
  const { showToast } = useToast()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [homeView, setHomeView] = useState<'home' | 'all-sows' | 'audit-log' | 'agents' | 'notifications' | 'user-directory' | 'section-templates'>('home')
  const [activeTab, setActiveTab] = useState<ActiveTab>('my')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [sortCol, setSortCol] = useState<SortCol>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(7)
  const [openRpp, setOpenRpp] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [sowList, setSowList] = useState<SOWItem[]>(initialSOWs)
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null)
  const [deactivateModalSOW, setDeactivateModalSOW] = useState<SOWItem | null>(null)
  const [reactivateModalSOW, setReactivateModalSOW] = useState<SOWItem | null>(null)
  const [displayedRows, setDisplayedRows] = useState<SOWItem[]>(initialSOWs)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [dueTimeframe, setDueTimeframe] = useState('Next Week')
  const [dueDropdownOpen, setDueDropdownOpen] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'Meridian SOW generated', description: 'Drafting agent has successfully generated Meridian SOW.', time: '10 mins ago', unread: true },
    { id: '2', title: 'Vendor MSA updated', description: 'Rohan Mehta has uploaded a new version of Vendor MSA.', time: '2 hours ago', unread: true },
    { id: '3', title: 'Assignment added', description: 'You have been assigned to 2 questions in Meridian RFP.', time: '1 day ago', unread: false },
  ])
  const unreadCount = notifications.filter(n => n.unread).length
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n))
  }

  const renderNotificationButton = () => (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
        flexShrink: 0,
      }}
    >
      <button
        onClick={() => setHomeView('notifications')}
        style={{
          position: 'relative',
          overflow: 'visible',
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.7)',
          border: '1px solid rgba(255,255,255,0.9)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: homeView === 'notifications' ? '0 0 0 2px rgba(0,196,196,0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
          transition: 'all 0.15s',
          color: homeView === 'notifications' ? '#00C4C4' : '#0d212c',
          flexShrink: 0,
        }}
        aria-label="Notifications"
      >
        <Bell size={18} strokeWidth={2} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              minWidth: 15,
              height: 15,
              padding: '0 3.5px',
              background: '#e60000',
              borderRadius: '9999px',
              color: '#ffffff',
              fontSize: 9.5,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              zIndex: 10,
              pointerEvents: 'none',
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  )

  const rppRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!actionMenuOpenId && !dueDropdownOpen) return
    function handle(e: MouseEvent) {
      setActionMenuOpenId(null)
      setDueDropdownOpen(false)
    }
    document.addEventListener('click', handle)
    return () => document.removeEventListener('click', handle)
  }, [actionMenuOpenId, dueDropdownOpen])

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
        let rows = [...sowList]
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
            const av = a[sortCol] ?? ''
            const bv = b[sortCol] ?? ''
            if (typeof av === 'number' && typeof bv === 'number') {
              return sortDir === 'asc' ? av - bv : bv - av
            }
            return sortDir === 'asc'
              ? String(av).localeCompare(String(bv))
              : String(bv).localeCompare(String(av))
          })
        }
        setDisplayedRows(rows)
        setPage(1)
        setIsSearching(false)
      },
      search.trim() ? 400 : 100
    )
    return () => clearTimeout(timer)
  }, [search, statusFilter, sortCol, sortDir, sowList])

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
            zIndex: 100,
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
                  icon: <LayoutDashboard size={20} />,
                },
                {
                  id: 'my-sows' as ActiveNav,
                  label: 'All SOWs',
                  icon: <FileText size={20} />,
                },
                ...(isAdmin
                  ? [
                      {
                        id: 'user-directory' as ActiveNav,
                        label: 'Users',
                        icon: <Users size={20} />,
                      },
                      {
                        id: 'section-templates' as ActiveNav,
                        label: 'Templates',
                        icon: <LayoutTemplate size={20} />,
                      },
                      {
                        id: 'agents' as ActiveNav,
                        label: 'Agents',
                        icon: <Bot size={20} />,
                      },
                    ]
                  : []),
                ...((isPMO && !isAdmin)
                  ? [
                      {
                        id: 'agents' as ActiveNav,
                        label: 'Agents',
                        icon: <Bot size={20} />,
                      },
                    ]
                  : []),
              ] as { id: ActiveNav; label: string; icon: React.ReactNode; badge?: number }[]
            ).map(({ id, label, icon }) => {
              const isActive = contentOverride
                ? activeNav === id
                : id === 'dashboard'
                  ? homeView === 'home'
                  : id === 'my-sows'
                    ? homeView === 'all-sows'
                    : id === 'user-directory'
                      ? homeView === 'user-directory'
                      : id === 'section-templates'
                        ? homeView === 'section-templates'
                        : id === 'agents'
                          ? homeView === 'agents'
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
                    } else if (id === 'user-directory') {
                      setHomeView('user-directory')
                    } else if (id === 'section-templates') {
                      setHomeView('section-templates')
                    } else if (id === 'agents') {
                      setHomeView('agents')
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
                  <span className="relative flex items-center justify-center">
                    {icon}
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
                    background: '#ffffff',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    zIndex: 9999,
                    overflow: 'hidden',
                  }}
                >
                  {/* User info row */}
                  <div
                    style={{
                      padding: '12px 14px 10px',
                      borderBottom: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0d212c' }}>
                      {userName}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{userRole}</div>
                  </div>
                  {/* Logout option */}
                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      setShowLogoutConfirm(true)
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
                      color: '#ef4444',
                      fontSize: 13,
                      fontWeight: 400,
                      textAlign: 'left',
                      transition: 'color 0.15s',
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLButtonElement).style.color = '#dc2626'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLButtonElement).style.color = '#ef4444'
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
                    Logout
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
              <AllSOWsView
                sows={sowList}
                onOpenSOWV2={onOpenSOWV2}
                onOpenSOWContributor={onOpenSOWContributor}
                onOpenSOWDeactivated={onOpenSOWDeactivated}
                isContributor={isContributor || isClient}
                isPMO={isPMO}
                isAdmin={isAdmin}
                onDeactivateSOW={(sow) => setDeactivateModalSOW(sow)}
                onReactivateSOW={(sow) => setReactivateModalSOW(sow)}
                notificationButton={renderNotificationButton()}
              />
            </div>
          ) : homeView === 'agents' && (isPMO || isAdmin) ? (
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <AgentsView notificationButton={renderNotificationButton()} />
            </div>
          ) : homeView === 'notifications' ? (
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <NotificationsView
                notifications={notifications}
                markRead={markNotificationRead}
                notificationButton={renderNotificationButton()}
                onBack={() => setHomeView('home')}
              />
            </div>
          ) : homeView === 'audit-log' ? (
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <AuditLogView
                onBackToDashboard={() => setHomeView('home')}
                notificationButton={renderNotificationButton()}
              />
            </div>
          ) : homeView === 'user-directory' && isAdmin ? (
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <UserDirectoryView notificationButton={renderNotificationButton()} />
            </div>
          ) : homeView === 'section-templates' && isAdmin ? (
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <SectionTemplatesView notificationButton={renderNotificationButton()} />
            </div>
          ) : isAdmin ? (
            <div className="flex-1 overflow-y-auto p-0">
              <AdminHomeView
                notificationButton={renderNotificationButton()}
                onNavigate={(v) => setHomeView(v)}
              />
            </div>
          ) : (
            /* Scrollable inner content with consistent 12px padding all around */
            <div className="flex-1 overflow-y-auto p-0">
              {/* Greeting + Create SOW CTA */}
              <div className="flex items-center justify-between mb-5">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
                  <h1
                    style={{
                      fontSize: 24,
                      fontWeight: 600,
                      color: '#0d212c',
                      margin: 0,
                      lineHeight: 1.15,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span>Hi {userName} 👋</span>
                    {userRole === 'PMO' && !isContributor && !isReviewer && !isClient && (
                      <button
                        type="button"
                        onClick={() => setRoleDropdownOpen((prev) => !prev)}
                        title="Switch role preview"
                        style={{
                          background: 'rgba(0,196,196,0.08)',
                          border: '1px solid rgba(0,196,196,0.25)',
                          borderRadius: 8,
                          padding: '4px 8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#008b8b',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(0,196,196,0.15)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(0,196,196,0.08)'
                        }}
                      >
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#0d212c' }}>
                          {effectiveRole}
                        </span>
                        <ChevronDown
                          size={14}
                          color="#008b8b"
                          style={{
                            transform: roleDropdownOpen ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.15s',
                          }}
                        />
                      </button>
                    )}
                  </h1>

                  {roleDropdownOpen && userRole === 'PMO' && !isContributor && !isReviewer && !isClient && (
                    <>
                      <div
                        style={{ position: 'fixed', inset: 0, zIndex: 999 }}
                        onClick={() => setRoleDropdownOpen(false)}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 8px)',
                          left: 0,
                          zIndex: 1000,
                          width: 220,
                          background: '#ffffff',
                          borderRadius: 12,
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 12px 32px rgba(13,33,44,0.14)',
                          padding: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4,
                        }}
                      >
                        <div style={{ fontSize: 10.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', padding: '4px 8px' }}>
                          Preview role as
                        </div>
                        {(['PMO', 'Contributor', 'Reviewer'] as const).map((r) => {
                          const isSelected = effectiveRole === r
                          return (
                            <button
                              key={r}
                              type="button"
                              onClick={() => {
                                setPreviewRole(r)
                                setRoleDropdownOpen(false)
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '8px 10px',
                                borderRadius: 8,
                                border: 'none',
                                background: isSelected ? 'rgba(0,196,196,0.1)' : 'transparent',
                                color: isSelected ? '#007a7a' : '#0d212c',
                                fontSize: 13,
                                fontWeight: isSelected ? 700 : 500,
                                cursor: 'pointer',
                                textAlign: 'left',
                              }}
                              onMouseEnter={(e) => {
                                if (!isSelected) e.currentTarget.style.background = '#f8fafc'
                              }}
                              onMouseLeave={(e) => {
                                if (!isSelected) e.currentTarget.style.background = 'transparent'
                              }}
                            >
                              <span>Preview as {r}</span>
                              {isSelected && <Check size={14} color="#00C4C4" strokeWidth={2.5} />}
                            </button>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {renderNotificationButton()}
                  {!isContributor && !isClient && !isReviewer && (
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
              </div>

                  {/* ─── KPI CARDS ──────────────────────────────────────────────── */}
                  {isContributor ? (
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {/* 1. My Open Questions */}
                  <div
                    style={{
                      background: '#FFFFFFCC',
                      border: '1px solid rgba(255,255,255,0.85)',
                      borderRadius: 16,
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      boxShadow: '0 2px 12px rgba(0,196,196,0.07)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#94a3b8',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        MY OPEN QUESTIONS
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
                        <Clock size={16} color="#0284c7" />
                      </div>
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 600, color: '#0284c7', lineHeight: 1 }}>
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
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 500, color: '#64748b' }}>
                        Across active SOWs
                      </span>
                    </div>
                  </div>

                  {/* 2. Due Soon */}
                  <div
                    style={{
                      background: '#FFFFFFCC',
                      border: '1px solid rgba(255,255,255,0.85)',
                      borderRadius: 16,
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      boxShadow: '0 2px 12px rgba(0,196,196,0.07)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#94a3b8',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        DUE SOON
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
                        <Calendar size={16} color="#d97706" />
                      </div>
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 600, color: '#d97706', lineHeight: 1 }}>3</div>
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
                        Questions approaching due date
                      </span>
                    </div>
                  </div>

                  {/* 3. Overdue */}
                  <div
                    style={{
                      background: '#FFFFFFCC',
                      border: '1px solid rgba(255,255,255,0.85)',
                      borderRadius: 16,
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      boxShadow: '0 2px 12px rgba(0,196,196,0.07)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#94a3b8',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        OVERDUE
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
                        <AlertTriangle size={16} color="#ef4444" />
                      </div>
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 600, color: '#ef4444', lineHeight: 1 }}>1</div>
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
                        Requires immediate action
                      </span>
                    </div>
                  </div>

                  {/* 4. Completed */}
                  <div
                    style={{
                      background: '#FFFFFFCC',
                      border: '1px solid rgba(255,255,255,0.85)',
                      borderRadius: 16,
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      boxShadow: '0 2px 12px rgba(0,196,196,0.07)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#94a3b8',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        COMPLETED
                      </span>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 10,
                          background: '#dcfce7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CheckCircle2 size={16} color="#16a34a" />
                      </div>
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 600, color: '#16a34a', lineHeight: 1 }}>
                      24
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
                        Questions resolved
                      </span>
                    </div>
                  </div>
                </div>
              ) : isClient ? (
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {/* 1. Awaiting My Input */}
                  <div
                    style={{
                      background: '#ffffffcc',
                      border: '1px solid rgba(255,255,255,0.85)',
                      borderRadius: 16,
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      boxShadow: '0 2px 12px rgba(0,196,196,0.07)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#94a3b8',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        AWAITING MY INPUT
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
                        <Clock size={16} color="#0284c7" />
                      </div>
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 600, color: '#0284c7', lineHeight: 1 }}>2</div>
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
                        Questions assigned to you
                      </span>
                    </div>
                  </div>

                  {/* 2. Drafts to Review */}
                  <div
                    style={{
                      background: '#ffffffcc',
                      border: '1px solid rgba(255,255,255,0.85)',
                      borderRadius: 16,
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      boxShadow: '0 2px 12px rgba(0,196,196,0.07)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#94a3b8',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        DRAFTS TO REVIEW
                      </span>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 10,
                          background: '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <FileText size={16} color="#0d212c" />
                      </div>
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 600, color: '#0d212c', lineHeight: 1 }}>1</div>
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
                        Ready for review
                      </span>
                    </div>
                  </div>

                  {/* 3. Open Comments */}
                  <div
                    style={{
                      background: '#ffffffcc',
                      border: '1px solid rgba(255,255,255,0.85)',
                      borderRadius: 16,
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      boxShadow: '0 2px 12px rgba(0,196,196,0.07)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#94a3b8',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        OPEN COMMENTS
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
                        <Clock size={16} color="#d97706" />
                      </div>
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 600, color: '#d97706', lineHeight: 1 }}>5</div>
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
                        Need your response
                      </span>
                    </div>
                  </div>

                  {/* 4. Pending Approval */}
                  <div
                    style={{
                      background: '#ffffffcc',
                      border: '1px solid rgba(255,255,255,0.85)',
                      borderRadius: 16,
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      boxShadow: '0 2px 12px rgba(0,196,196,0.07)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#94a3b8',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        PENDING APPROVAL
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
                        <AlertTriangle size={16} color="#ef4444" />
                      </div>
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 600, color: '#ef4444', lineHeight: 1 }}>1</div>
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
                        Final decision required
                      </span>
                    </div>
                  </div>
                </div>
              ) : isReviewer ? (
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {/* 1. Pending Reviews */}
                  <div
                    style={{
                      background: '#ffffffcc',
                      border: '1px solid rgba(255,255,255,0.85)',
                      borderRadius: 16,
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      boxShadow: '0 2px 12px rgba(0,196,196,0.07)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#94a3b8',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        PENDING REVIEWS
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
                        <FileText size={16} color="#0284c7" />
                      </div>
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 600, color: '#0284c7', lineHeight: 1 }}>3</div>
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
                        Drafts awaiting review
                      </span>
                    </div>
                  </div>

                  {/* 2. Open Comments */}
                  <div
                    style={{
                      background: '#ffffffcc',
                      border: '1px solid rgba(255,255,255,0.85)',
                      borderRadius: 16,
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      boxShadow: '0 2px 12px rgba(0,196,196,0.07)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#94a3b8',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        OPEN COMMENTS
                      </span>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 10,
                          background: '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Clock size={16} color="#0d212c" />
                      </div>
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 600, color: '#0d212c', lineHeight: 1 }}>11</div>
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
                        Need resolution
                      </span>
                    </div>
                  </div>

                  {/* 3. Due For Review */}
                  <div
                    style={{
                      background: '#ffffffcc',
                      border: '1px solid rgba(255,255,255,0.85)',
                      borderRadius: 16,
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      boxShadow: '0 2px 12px rgba(0,196,196,0.07)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#94a3b8',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        DUE FOR REVIEW
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
                        <Calendar size={16} color="#d97706" />
                      </div>
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 600, color: '#d97706', lineHeight: 1 }}>2</div>
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
                        Approaching deadline
                      </span>
                    </div>
                  </div>

                  {/* 4. Overdue Reviews */}
                  <div
                    style={{
                      background: '#ffffffcc',
                      border: '1px solid rgba(255,255,255,0.85)',
                      borderRadius: 16,
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      boxShadow: '0 2px 12px rgba(0,196,196,0.07)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#94a3b8',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        OVERDUE REVIEWS
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
                        <AlertTriangle size={16} color="#ef4444" />
                      </div>
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 600, color: '#ef4444', lineHeight: 1 }}>1</div>
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
                        Past review SLA
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3 mb-6">
                {/* 1 — Active SOWs */}
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Active SOW&apos;s</span>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="16" height="16" fill="none" stroke="#0284c7" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 600, color: '#0d212c', lineHeight: 1 }}>5</div>
                  <div style={{ height: 1, background: 'rgba(0,196,196,0.12)', width: '100%', margin: '4px 0 2px 0' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 500, color: '#16a34a' }}>+1 this month ↗</span>
                  </div>
                </div>

                {/* 2 — Need Attention */}
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Need Attention</span>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="16" height="16" fill="none" stroke="#d97706" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 600, color: '#0d212c', lineHeight: 1 }}>2</div>
                  <div style={{ height: 1, background: 'rgba(0,196,196,0.12)', width: '100%', margin: '4px 0 2px 0' }} />
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 500, color: '#64748b' }}>Require PMO action</span>
                  </div>
                </div>

                {/* 3 — At Risk */}
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>At Risk</span>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="16" height="16" fill="none" stroke="#ef4444" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 600, color: '#0d212c', lineHeight: 1 }}>1</div>
                  <div style={{ height: 1, background: 'rgba(0,196,196,0.12)', width: '100%', margin: '4px 0 2px 0' }} />
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 500, color: '#64748b' }}>Needs monitoring</span>
                  </div>
                </div>

                {/* 4 — Total Clients */}
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Clients</span>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(0,196,196,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building2 size={16} color="#008a8a" strokeWidth={1.8} />
                    </div>
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 600, color: '#0d212c', lineHeight: 1 }}>12</div>
                  <div style={{ height: 1, background: 'rgba(0,196,196,0.12)', width: '100%', margin: '4px 0 2px 0' }} />
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 500, color: '#64748b' }}>Across active projects</span>
                  </div>
                </div>
              </div>
            )}

              {/* ─── BOTTOM: ACTIVE SOWs full width, then row below ────── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Active SOWs — full width */}
              <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
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
                          {(isPMO
                            ? [
                                ['SOW Name', null, '24%'],
                                ['Status', null, '14%'],
                                ['Readiness', 'readiness' as SortCol, '12%'],
                                ['Due Date', null, '14%'],
                                ['SOW Workflow', null, '14%'],
                                ['Updated On', null, '14%'],
                                ['Action', null, '8%'],
                              ]
                            : [
                                ['SOW Name', null, '28%'],
                                ['Status', null, '15%'],
                                ['Readiness', 'readiness' as SortCol, '13%'],
                                ['Due Date', null, '14%'],
                                ['SOW Workflow', null, '15%'],
                                ['Updated On', null, '15%'],
                              ]
                          ).map(([label, col, width]) => (
                            <th
                              key={String(label)}
                              onClick={col ? () => handleSort(col as SortCol) : undefined}
                              style={{
                                width: String(width),
                                padding: '10px 14px',
                                textAlign: 'left',
                                fontSize: 10,
                                fontWeight: 500,
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
                                  <SortIcon />
                                )}
                              </span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {isSearching ? (
                          Array.from({ length: 4 }).map((_, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(0,196,196,0.07)' }}>
                              {(isPMO ? [22, 12, 10, 14, 11, 12, 12, 7] : [24, 13, 11, 15, 12, 13, 12]).map((w, j) => (
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
                        ) : paginatedRows.slice(0, 4).length > 0 ? (
                          paginatedRows.slice(0, 4).map((row, idx) => (
                            <tr
                              key={row.id}
                              onClick={() => {
                                if (row.status === 'Deactivated') {
                                  onOpenSOWDeactivated?.()
                                  return
                                }
                                if (isContributor || isClient || isReviewer) {
                                  if (row.name.includes('Meridian Healthcare') || row.name.includes('Procurement Platform')) {
                                    onOpenSOWContributor?.()
                                  } else {
                                    onOpenSOWV2?.()
                                  }
                                  return
                                }
                                if (row.name.includes('Meridian Healthcare') || row.name.includes('Procurement Platform')) {
                                  onOpenSOWContributor?.()
                                } else if (idx === 1 || row.name.includes('Digital Workplace Enablement')) {
                                  onOpenSOWV2?.()
                                } else {
                                  onOpenSOWV2?.()
                                }
                              }}
                              style={{
                                height: 62,
                                borderBottom:
                                  idx < Math.min(paginatedRows.length, 4) - 1
                                    ? '1px solid rgba(0,196,196,0.07)'
                                    : undefined,
                                cursor: 'pointer',
                                transition: 'background 0.12s',
                              }}
                              onMouseEnter={(e) => {
                                ;(e.currentTarget as HTMLTableRowElement).style.background =
                                  '#f8fafc'
                              }}
                              onMouseLeave={(e) => {
                                ;(e.currentTarget as HTMLTableRowElement).style.background = ''
                              }}
                            >
                              {/* SOW Name + Client below */}
                              <td
                                style={{
                                  padding: '10px 14px',
                                  maxWidth: 0,
                                }}
                              >
                                <span
                                  style={{
                                    display: 'block',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: '#0d212c',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {row.name}
                                </span>
                                <span
                                  style={{
                                    display: 'block',
                                    fontSize: 11.5,
                                    color: '#64748b',
                                    marginTop: 2,
                                  }}
                                >
                                  {row.client}
                                </span>
                              </td>

                              {/* Status (immediately after SOW Name) */}
                              <td style={{ padding: '10px 14px' }}>
                                <StatusBadge status={row.status} />
                              </td>

                              {/* Readiness (only percentage text, no progress bar, font weight reduced by 1 unit) */}
                              <td style={{ padding: '10px 14px' }}>
                                <span style={{ fontSize: 12.5, fontWeight: 500, color: '#0d212c' }}>
                                  {row.readiness ?? 75}%
                                </span>
                              </td>

                              {/* Due Date */}
                              <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                                <span style={{ fontSize: 12.5, color: idx === 0 ? '#dc2626' : '#475569', fontWeight: idx === 0 ? 600 : 400 }}>
                                  {idx === 0 ? 'Today' : idx === 1 ? 'Oct 18, 2026' : idx === 2 ? 'Oct 22, 2026' : 'Nov 05, 2026'}
                                </span>
                              </td>

                              {/* SOW Workflow (text only) */}
                              <td style={{ padding: '10px 14px' }}>
                                <span style={{ fontSize: 12.5, color: '#0d212c', fontWeight: 500 }}>
                                  {row.workflowStage ?? (idx === 0 ? 'Review' : idx === 1 ? 'Questions' : idx === 2 ? 'Planning' : 'Draft')}
                                </span>
                              </td>

                              {/* Updated On */}
                              <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 400 }}>
                                  {row.lastUpdated}
                                </span>
                              </td>

                              {/* Action (3-dot menu for PMO only) */}
                              {isPMO && (
                                <td
                                  style={{ padding: '10px 14px', position: 'relative' }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setActionMenuOpenId((prev) => (prev === row.id ? null : row.id))
                                    }}
                                    title="Actions"
                                    style={{
                                      width: 28,
                                      height: 28,
                                      borderRadius: 6,
                                      background: actionMenuOpenId === row.id ? '#f1f5f9' : 'transparent',
                                      border: '1px solid ' + (actionMenuOpenId === row.id ? '#cbd5e1' : 'transparent'),
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      cursor: 'pointer',
                                      color: '#64748b',
                                      transition: 'all 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                      if (actionMenuOpenId !== row.id) e.currentTarget.style.background = '#f8fafc'
                                    }}
                                    onMouseLeave={(e) => {
                                      if (actionMenuOpenId !== row.id) e.currentTarget.style.background = 'transparent'
                                    }}
                                  >
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                                      <circle cx="12" cy="5" r="2.2" />
                                      <circle cx="12" cy="12" r="2.2" />
                                      <circle cx="12" cy="19" r="2.2" />
                                    </svg>
                                  </button>

                                  {actionMenuOpenId === row.id && (
                                    <div
                                      style={{
                                        position: 'absolute',
                                        right: 12,
                                        top: 42,
                                        zIndex: 60,
                                        background: '#ffffff',
                                        borderRadius: 10,
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                                        padding: '4px',
                                        minWidth: 155,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 2,
                                      }}
                                    >
                                      {/* Option 1: View Details */}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setActionMenuOpenId(null)
                                          if (row.status === 'Deactivated') {
                                            onOpenSOWDeactivated?.()
                                          } else if (row.name.includes('Meridian Healthcare') || row.name.includes('Procurement Platform')) {
                                            onOpenSOWContributor?.()
                                          } else {
                                            onOpenSOWV2?.()
                                          }
                                        }}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 8,
                                          padding: '7px 10px',
                                          borderRadius: 6,
                                          border: 'none',
                                          background: 'transparent',
                                          fontSize: 12.5,
                                          fontWeight: 500,
                                          color: '#0d212c',
                                          cursor: 'pointer',
                                          textAlign: 'left',
                                          width: '100%',
                                          transition: 'background 0.12s',
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                      >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                          <circle cx="12" cy="12" r="3" />
                                        </svg>
                                        View Details
                                      </button>

                                      {/* Option 2: Reactivate (if Deactivated) or Deactivate SOW */}
                                      {row.status === 'Deactivated' ? (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setActionMenuOpenId(null)
                                            setReactivateModalSOW(row)
                                          }}
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            padding: '7px 10px',
                                            borderRadius: 6,
                                            border: 'none',
                                            background: 'transparent',
                                            fontSize: 12.5,
                                            fontWeight: 500,
                                            color: '#16a34a',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            width: '100%',
                                            transition: 'background 0.12s',
                                          }}
                                          onMouseEnter={(e) => (e.currentTarget.style.background = '#f0fdf4')}
                                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                        >
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="23 4 23 10 17 10" />
                                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                                          </svg>
                                          Reactivate SOW
                                        </button>
                                      ) : (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setActionMenuOpenId(null)
                                            setDeactivateModalSOW(row)
                                          }}
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            padding: '7px 10px',
                                            borderRadius: 6,
                                            border: 'none',
                                            background: 'transparent',
                                            fontSize: 12.5,
                                            fontWeight: 500,
                                            color: '#dc2626',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            width: '100%',
                                            transition: 'background 0.12s',
                                          }}
                                          onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
                                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                        >
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                                          </svg>
                                          Deactivate SOW
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </td>
                              )}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={isPMO ? 8 : 7}
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
                        onClick={() => setHomeView('all-sows')}
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

              {/* Row: Due This Week + Workflow Pie Chart */}
              <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
                {/* Due This Week */}
                <div style={{ flex: '1 1 50%', width: '50%', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
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
                    </div>

                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setDueDropdownOpen((prev) => !prev)
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '5px 12px',
                          background: '#ffffff',
                          border: '1px solid rgba(0,0,0,0.1)',
                          borderRadius: 8,
                          fontSize: 12,
                          color: '#475569',
                          fontWeight: 500,
                          cursor: 'pointer',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                        }}
                      >
                        <span>{dueTimeframe}</span>
                        <ChevronDown size={12} strokeWidth={2} />
                      </button>

                      {dueDropdownOpen && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            position: 'absolute',
                            right: 0,
                            top: 'calc(100% + 4px)',
                            background: '#ffffff',
                            borderRadius: 8,
                            boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                            border: '1px solid #e2e8f0',
                            padding: 4,
                            minWidth: 120,
                            zIndex: 100,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                          }}
                        >
                          {['Today', 'Tomorrow', 'Next Week', 'Next Month'].map((tf) => (
                            <button
                              key={tf}
                              onClick={() => {
                                setDueTimeframe(tf)
                                setDueDropdownOpen(false)
                              }}
                              style={{
                                padding: '6px 10px',
                                borderRadius: 6,
                                border: 'none',
                                background: dueTimeframe === tf ? 'rgba(0,196,196,0.1)' : 'transparent',
                                color: dueTimeframe === tf ? '#008a8a' : '#0d212c',
                                fontSize: 12,
                                fontWeight: dueTimeframe === tf ? 600 : 500,
                                textAlign: 'left',
                                cursor: 'pointer',
                              }}
                              onMouseEnter={(e) => {
                                if (dueTimeframe !== tf) e.currentTarget.style.background = '#f8fafc'
                              }}
                              onMouseLeave={(e) => {
                                if (dueTimeframe !== tf) e.currentTarget.style.background = 'transparent'
                              }}
                            >
                              {tf}
                            </button>
                          ))}
                        </div>
                      )}
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
                      minHeight: 250,
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
                              width: '50%',
                              padding: '11px 14px',
                              textAlign: 'left',
                              fontSize: 10,
                              fontWeight: 500,
                              color: '#475569',
                              textTransform: 'uppercase',
                              letterSpacing: '0.07em',
                            }}
                          >
                            Sow
                          </th>
                          <th
                            style={{
                              width: '25%',
                              padding: '11px 14px',
                              textAlign: 'left',
                              fontSize: 10,
                              fontWeight: 500,
                              color: '#475569',
                              textTransform: 'uppercase',
                              letterSpacing: '0.07em',
                            }}
                          >
                            Questions
                          </th>
                          <th
                            style={{
                              width: '25%',
                              padding: '11px 14px',
                              textAlign: 'left',
                              fontSize: 10,
                              fontWeight: 500,
                              color: '#475569',
                              textTransform: 'uppercase',
                              letterSpacing: '0.07em',
                            }}
                          >
                            Review
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            name: 'Meridian Healthcare',
                            client: 'Meridian Health Systems',
                            questions: { total: 4, open: 2 },
                            reviewComments: 3,
                            urgency: 'high' as const,
                          },
                          {
                            name: 'Acme Corp Cloud Ops',
                            client: 'Acme Corp',
                            questions: { total: 2, open: 0 },
                            reviewComments: 1,
                            urgency: 'high' as const,
                          },
                          {
                            name: 'CyberShield Security Protocol',
                            client: 'CyberShield Inc',
                            questions: { total: 6, open: 3 },
                            reviewComments: 5,
                            urgency: 'high' as const,
                          },
                          {
                            name: 'TechSphere Enterprise AI',
                            client: 'TechSphere Global',
                            questions: { total: 1, open: 1 },
                            reviewComments: 2,
                            urgency: 'medium' as const,
                          },
                        ].map((item, idx, arr) => {
                          const urgencyColor =
                            item.urgency === 'high'
                              ? '#dc2626'
                              : item.urgency === 'medium'
                                ? '#d97706'
                                : '#64748b'
                          return (
                            <tr
                              key={idx}
                              style={{
                                height: 46,
                                borderBottom:
                                  idx < arr.length - 1
                                    ? '1px solid #f1f5f9'
                                    : undefined,
                                cursor: 'pointer',
                                transition: 'background 0.12s',
                              }}
                              onMouseEnter={(e) => {
                                ;(e.currentTarget as HTMLTableRowElement).style.background =
                                  '#f8fafc'
                              }}
                              onMouseLeave={(e) => {
                                ;(e.currentTarget as HTMLTableRowElement).style.background = ''
                              }}
                            >
                              <td style={{ padding: '8px 14px' }}>
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
                                        fontSize: 12.5,
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
                                        fontSize: 10.5,
                                        color: '#64748b',
                                        marginTop: 0,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      {item.client}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '8px 14px', whiteSpace: 'nowrap' }}>
                                <span style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>
                                  {item.questions.total} Total • {item.questions.open} Open
                                </span>
                              </td>
                              <td style={{ padding: '8px 14px', whiteSpace: 'nowrap' }}>
                                <span style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>
                                  {item.reviewComments} comments
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* SOW Workflow Status — Reference Donut Design */}
                <div style={{ flex: '1 1 50%', width: '50%', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 10,
                      height: 32,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: '#0d212c', lineHeight: 1.2 }}>
                        SOW Workflow Status
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '4px 10px',
                        background: '#ffffff',
                        border: '1px solid rgba(0,0,0,0.1)',
                        borderRadius: 8,
                        fontSize: 11.5,
                        color: '#475569',
                        fontWeight: 500,
                        cursor: 'pointer',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                      }}
                    >
                      <span>This Month</span>
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.6)',
                      border: '1px solid rgba(255,255,255,0.85)',
                      borderRadius: 14,
                      overflow: 'hidden',
                      boxShadow: '0 2px 12px rgba(0,196,196,0.06)',
                      padding: '14px 18px',
                      flex: 1,
                      minHeight: 250,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                    }}
                  >
                    {/* SVG Donut Chart */}
                    <div
                      style={{
                        width: 170,
                        height: 170,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                      }}
                    >
                      <svg width="170" height="170" viewBox="0 0 170 170">
                        {(() => {
                          const stages = [
                            { label: 'Context', count: 7, pct: 29, color: 'rgba(0, 196, 196, 0.65)', textColor: '#0f766e' },
                            { label: 'Planning', count: 5, pct: 21, color: 'rgba(74, 222, 128, 0.65)', textColor: '#166534' },
                            { label: 'Questions', count: 4, pct: 17, color: 'rgba(96, 165, 250, 0.65)', textColor: '#1e40af' },
                            { label: 'Draft', count: 3, pct: 13, color: 'rgba(192, 132, 252, 0.65)', textColor: '#6b21a8' },
                            { label: 'Review', count: 3, pct: 12, color: 'rgba(250, 204, 21, 0.65)', textColor: '#854d0e' },
                            { label: 'Approval', count: 2, pct: 8, color: 'rgba(248, 113, 113, 0.65)', textColor: '#991b1b' },
                          ]
                          const cx = 85
                          const cy = 85
                          const rIn = 45
                          const rOut = 77
                          const rMid = (rIn + rOut) / 2
                          const toRad = (deg: number) => (deg * Math.PI) / 180

                          let currAngle = -90
                          return (
                            <>
                              {stages.map((st) => {
                                const angleSpan = (st.count / 24) * 360
                                const startDeg = currAngle
                                const endDeg = currAngle + angleSpan
                                const midDeg = startDeg + angleSpan / 2
                                currAngle = endDeg

                                const gap = 1.2
                                const s = toRad(startDeg + gap)
                                const e = toRad(endDeg - gap)
                                const x1 = cx + rOut * Math.cos(s)
                                const y1 = cy + rOut * Math.sin(s)
                                const x2 = cx + rOut * Math.cos(e)
                                const y2 = cy + rOut * Math.sin(e)
                                const x3 = cx + rIn * Math.cos(e)
                                const y3 = cy + rIn * Math.sin(e)
                                const x4 = cx + rIn * Math.cos(s)
                                const y4 = cy + rIn * Math.sin(s)
                                const largeArc = angleSpan - 2 * gap > 180 ? 1 : 0
                                const pathD = `M ${x1} ${y1} A ${rOut} ${rOut} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${rIn} ${rIn} 0 ${largeArc} 0 ${x4} ${y4} Z`

                                const midRad = toRad(midDeg)
                                const lx = cx + rMid * Math.cos(midRad)
                                const ly = cy + rMid * Math.sin(midRad) + 3.5

                                return (
                                  <g key={st.label}>
                                    <path
                                      d={pathD}
                                      fill={st.color}
                                      style={{ transition: 'opacity 0.15s ease' }}
                                    />
                                    <text
                                      x={lx}
                                      y={ly}
                                      textAnchor="middle"
                                      fontSize="9.5"
                                      fontWeight="700"
                                      fill={st.textColor}
                                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                                    >
                                      {st.pct}%
                                    </text>
                                  </g>
                                )
                              })}

                              {/* Crisp white inner center hole */}
                              <circle cx={cx} cy={cy} r={rIn - 0.5} fill="#ffffff" />

                              {/* Center Donut Hole Text */}
                              <text
                                x={cx}
                                y={cy - 2}
                                textAnchor="middle"
                                fontSize="21"
                                fontWeight="700"
                                fill="#0d212c"
                              >
                                24
                              </text>
                              <text
                                x={cx}
                                y={cy + 14}
                                textAnchor="middle"
                                fontSize="10"
                                fontWeight="500"
                                fill="#64748b"
                              >
                                Total SOWs
                              </text>
                            </>
                          )
                        })()}
                      </svg>
                    </div>

                    {/* Legend list matching reference design with increased vertical gap */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        flex: 1,
                        minWidth: 0,
                        height: 195,
                        padding: '2px 0',
                      }}
                    >
                      {[
                        { label: 'Context', count: 7, pct: 29, color: 'rgba(0, 196, 196, 0.65)' },
                        { label: 'Planning', count: 5, pct: 21, color: 'rgba(74, 222, 128, 0.65)' },
                        { label: 'Questions', count: 4, pct: 17, color: 'rgba(96, 165, 250, 0.65)' },
                        { label: 'Draft', count: 3, pct: 13, color: 'rgba(192, 132, 252, 0.65)' },
                        { label: 'Review', count: 3, pct: 12, color: 'rgba(250, 204, 21, 0.65)' },
                        { label: 'Approval', count: 2, pct: 8, color: 'rgba(248, 113, 113, 0.65)' },
                        { label: 'Finalized', count: 0, pct: 0, color: 'rgba(203, 213, 225, 0.65)' },
                      ].map((item) => (
                        <div
                          key={item.label}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 10,
                            padding: '3px 0',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                            <div
                              style={{
                                width: 11,
                                height: 11,
                                borderRadius: '50%',
                                background: item.color,
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 500,
                                color: '#1e293b',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {item.label}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#0d212c' }}>
                              {item.count}
                            </span>
                            <span style={{ fontSize: 12, color: '#64748b' }}>({item.pct}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
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
            showToast('New SOW initiated with uploaded documents', 'success')
            onProceedToSOW?.(uploadedFiles)
          }}
        />
      )}

      {/* Deactivate SOW Confirmation Modal */}
      {deactivateModalSOW && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(3px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeactivateModalSOW(null)
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 24,
              padding: '32px 28px',
              width: 440,
              maxWidth: '90vw',
              textAlign: 'center',
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
            }}
          >
            <button
              onClick={() => setDeactivateModalSOW(null)}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                padding: 4,
                display: 'flex',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Icon Circle */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
            </div>

            <div style={{ fontSize: 22, fontWeight: 700, color: '#0d212c', marginBottom: 8 }}>
              Deactivate SOW?
            </div>
            <div style={{ fontSize: 14, color: '#64748b', marginBottom: 26, lineHeight: 1.5 }}>
              This will deactivate the SOW temporarily. Are you sure you want to proceed?
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setDeactivateModalSOW(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 12,
                  background: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  color: '#0d212c',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const target = deactivateModalSOW
                  setSowList((prev) =>
                    prev.map((s) => (s.id === target.id ? { ...s, status: 'Deactivated' } : s))
                  )
                  setDeactivateModalSOW(null)
                  showToast('SOW Deactivated', 'error')
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 12,
                  background: '#E60000',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(230,0,0,0.25)',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#cc0000')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#E60000')}
              >
                Deactivate SOW
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reactivate SOW Confirmation Modal */}
      {reactivateModalSOW && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(3px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setReactivateModalSOW(null)
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 24,
              padding: '32px 28px',
              width: 440,
              maxWidth: '90vw',
              textAlign: 'center',
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
            }}
          >
            <button
              onClick={() => setReactivateModalSOW(null)}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                padding: 4,
                display: 'flex',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Icon Circle */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: 'rgba(0,196,196,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00C4C4" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
            </div>

            <div style={{ fontSize: 22, fontWeight: 700, color: '#0d212c', marginBottom: 8 }}>
              Reactivate SOW?
            </div>
            <div style={{ fontSize: 14, color: '#64748b', marginBottom: 26, lineHeight: 1.5 }}>
              This will reactivate the SOW and make it active again. Are you sure you want to proceed?
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setReactivateModalSOW(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 12,
                  background: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  color: '#0d212c',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const target = reactivateModalSOW
                  setSowList((prev) =>
                    prev.map((s) => (s.id === target.id ? { ...s, status: 'On Track' } : s))
                  )
                  setReactivateModalSOW(null)
                  showToast('SOW Reactivated', 'success')
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 12,
                  background: '#00C4C4',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0,196,196,0.3)',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#00a8a8')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#00C4C4')}
              >
                Reactivate SOW
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowLogoutConfirm(false)
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 24,
              padding: '32px 24px',
              width: 420,
              maxWidth: '90vw',
              position: 'relative',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <button
              onClick={() => setShowLogoutConfirm(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>

            <div style={{ fontSize: 22, fontWeight: 800, color: '#0d212c', marginBottom: 8 }}>
              Confirm Logout
            </div>
            <div style={{ fontSize: 14, color: '#64748b', marginBottom: 32 }}>
              Are you sure you want to log out of SOW Creator?
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 12,
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  color: '#0d212c',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false)
                  onSignOut?.()
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 12,
                  background: '#e60000',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
