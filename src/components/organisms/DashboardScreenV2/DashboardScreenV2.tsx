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
import { FileText, CheckCircle2, Layers, Clock, AlertTriangle, Calendar, Bell, ArrowLeft } from 'lucide-react'
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
    readiness: 72,
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
    readiness: 90,
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
    status: 'In Progress',
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
    status: 'Pending',
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

const STATUS_OPTIONS: SOWStatus[] = ['On Track', 'At Risk', 'In Progress', 'Completed', 'Pending', 'Not Started', 'Deactivated']
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
  isContributor = false,
  isPMO = true,
  onDeactivateSOW,
  onReactivateSOW,
  notificationButton,
}: {
  sows: SOWItem[]
  onOpenSOWV2?: () => void
  onOpenSOWContributor?: () => void
  isContributor?: boolean
  isPMO?: boolean
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

  const cols: { label: string; col: AllSOWsSortCol; width: string }[] = [
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
                      fontWeight: 600,
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

                    {/* Questions */}
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: 12.5, color: '#475569', fontWeight: 500 }}>
                        {row.totalQuestions ?? 4} Total • {row.openQuestions ?? 0} Open
                      </span>
                    </td>

                    {/* Review */}
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: 12.5, color: '#475569', fontWeight: 500 }}>
                        {row.reviewComments ?? 0} comments
                      </span>
                    </td>

                    {/* Approval */}
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: 12.5, color: '#475569', fontWeight: 500 }}>
                        {row.approval === 'Reviewer' ? 'Awaiting Reviewer' : (row.approval ?? 'Awaiting Reviewer')}
                      </span>
                    </td>

                    {/* Updated On */}
                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: 12, color: '#64748b', fontWeight: 400 }}>
                        {row.lastUpdated}
                      </span>
                    </td>

                    {/* Action */}
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
                              if (row.name.includes('Meridian Healthcare') || row.name.includes('Procurement Platform')) {
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

function AgentsView({ notificationButton }: { notificationButton?: React.ReactNode }) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 12

  const AGENTS_LIST = [
    { id: '1', name: 'Intake & Context Agent', description: 'Captures and structures intake information and project context for SOW generation', status: 'Active' },
    { id: '2', name: 'SoW Domain Specialist', description: 'Applies domain expertise to validate and enrich SOW scope and requirements', status: 'Active' },
    { id: '3', name: 'Questionnaire & Section Design Agent', description: 'Designs questionnaires and structures SOW sections based on project type', status: 'Active' },
    { id: '4', name: 'Knowledge & Research Agent', description: 'Researches industry benchmarks and knowledge base to support SOW content', status: 'Active' },
    { id: '5', name: 'PMO HITL Gate', description: 'Human-in-the-loop checkpoint for PMO review and approval before proceeding', status: 'Active' },
    { id: '6', name: 'SoW Drafting Agent', description: 'Generates the full SOW draft using structured inputs and domain knowledge', status: 'Active' },
    { id: '7', name: 'SoW Supervisor Agent', description: 'Oversees SOW drafting quality and coordinates between specialized agents', status: 'Active' },
    { id: '8', name: 'Reviewer Supervisor', description: 'Manages the review workflow and aggregates feedback from review agents', status: 'Active' },
    { id: '9', name: 'Change Impact Agent', description: 'Assesses the impact of changes and updates to SOW scope or requirements', status: 'Active' },
    { id: '10', name: 'SoW Supervisor Agent', description: 'Final supervision pass to ensure SOW completeness and consistency', status: 'Active' },
    { id: '11', name: 'Quality Gate Agent', description: 'Validates SOW against quality standards and compliance requirements', status: 'Active' },
    { id: '12', name: 'PMO HITL Gate', description: 'Final human-in-the-loop checkpoint for PMO sign-off before client delivery', status: 'Active' },
  ]
  
  const filtered = AGENTS_LIST.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase()))
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginatedRows = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#0d212c', margin: 0, lineHeight: 1.15 }}>Active Agents</h1>
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
      <div style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.85)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,196,196,0.06)', height: 'auto', marginBottom: 20, display: 'flex', flexDirection: 'column' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(0,196,196,0.1)', background: '#ffffff' }}>
              <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', width: '28%' }}>Agent Name</th>
              <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', width: '58%' }}>Description</th>
              <th style={{ padding: '10px 14px', fontSize: 10, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', width: '14%' }}>Status</th>
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
                      gap: 5,
                      padding: '3px 9px',
                      borderRadius: 20,
                      fontSize: 11.5,
                      fontWeight: 600,
                      background: 'rgba(22,163,74,0.1)',
                      color: '#16a34a',
                      border: '1px solid rgba(22,163,74,0.2)',
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
  const isClient = userRole === 'Client'
  const isReviewer = userRole === 'Reviewer'
  const isPMO = !isContributor && !isClient && !isReviewer
  const { showToast } = useToast()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [homeView, setHomeView] = useState<'home' | 'all-sows' | 'audit-log' | 'agents' | 'notifications'>('home')
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
    <button
      onClick={() => setHomeView('notifications')}
      style={{
        position: 'relative',
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
            top: -2,
            right: -2,
            minWidth: 16,
            height: 16,
            padding: '0 4px',
            background: '#e60000',
            borderRadius: '9999px',
            color: '#ffffff',
            fontSize: 10,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}
        >
          {unreadCount}
        </span>
      )}
    </button>
  )

  const rppRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!actionMenuOpenId) return
    function handle(e: MouseEvent) {
      setActionMenuOpenId(null)
    }
    document.addEventListener('click', handle)
    return () => document.removeEventListener('click', handle)
  }, [actionMenuOpenId])

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
                ...(isPMO
                  ? [
                      {
                        id: 'agents' as ActiveNav,
                        label: 'Agents',
                        icon: (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.8"
                            d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                          />
                        ),
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
                isContributor={isContributor || isClient}
                isPMO={isPMO}
                onDeactivateSOW={(sow) => setDeactivateModalSOW(sow)}
                onReactivateSOW={(sow) => setReactivateModalSOW(sow)}
                notificationButton={renderNotificationButton()}
              />
            </div>
          ) : homeView === 'agents' && isPMO ? (
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
                <div className="grid grid-cols-3 gap-3 mb-6">
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
                                ['SOW Name', null, '22%'],
                                ['Status', null, '12%'],
                                ['Readiness', 'readiness' as SortCol, '10%'],
                                ['Questions', 'openQuestions' as SortCol, '14%'],
                                ['Review', 'reviewComments' as SortCol, '11%'],
                                ['Approval', null, '12%'],
                                ['Updated On', null, '12%'],
                                ['Action', null, '7%'],
                              ]
                            : [
                                ['SOW Name', null, '24%'],
                                ['Status', null, '13%'],
                                ['Readiness', 'readiness' as SortCol, '11%'],
                                ['Questions', 'openQuestions' as SortCol, '15%'],
                                ['Review', 'reviewComments' as SortCol, '12%'],
                                ['Approval', null, '13%'],
                                ['Updated On', null, '12%'],
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

                              {/* Questions (total count and open questions in text only, remove overdue) */}
                              <td style={{ padding: '10px 14px' }}>
                                <span style={{ fontSize: 12.5, color: '#475569', fontWeight: 500 }}>
                                  {row.totalQuestions ?? 4} Total • {row.openQuestions ?? 2} Open
                                </span>
                              </td>

                              {/* Review (number of comments, no icon) */}
                              <td style={{ padding: '10px 14px' }}>
                                <span style={{ fontSize: 12.5, color: '#475569', fontWeight: 500 }}>
                                  {row.reviewComments ?? 0} comments
                                </span>
                              </td>

                              {/* Approval (text only, no chip, awaiting reviewer) */}
                              <td style={{ padding: '10px 14px' }}>
                                <span style={{ fontSize: 12.5, color: '#475569', fontWeight: 500 }}>
                                  {row.approval === 'Reviewer' ? 'Awaiting Reviewer' : (row.approval ?? 'Awaiting Reviewer')}
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
                                          if (row.name.includes('Meridian Healthcare') || row.name.includes('Procurement Platform')) {
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
                                height: 58,
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
                              <td style={{ padding: '10px 14px' }}>
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
                              <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
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
                        4 items this week
                      </span>
                    </div>
                  </div>
                </div>

                {/* SOW Workflow Status — Reference Donut Design */}
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
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#0d212c', lineHeight: 1.2 }}>
                        SOW Workflow Status
                      </div>
                    </div>
                    <div
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
                      <span>This Month</span>
                      <svg
                        width="12"
                        height="12"
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
                      padding: '16px 20px',
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 20,
                    }}
                  >
                    {/* SVG Donut Chart */}
                    <div
                      style={{
                        width: 210,
                        height: 210,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                      }}
                    >
                      <svg width="210" height="210" viewBox="0 0 210 210">
                        {(() => {
                          const stages = [
                            { label: 'Context', count: 7, pct: 29, color: 'rgba(0, 196, 196, 0.65)', textColor: '#0f766e' },
                            { label: 'Planning', count: 5, pct: 21, color: 'rgba(74, 222, 128, 0.65)', textColor: '#166534' },
                            { label: 'Questions', count: 4, pct: 17, color: 'rgba(96, 165, 250, 0.65)', textColor: '#1e40af' },
                            { label: 'Draft', count: 3, pct: 13, color: 'rgba(192, 132, 252, 0.65)', textColor: '#6b21a8' },
                            { label: 'Review', count: 3, pct: 12, color: 'rgba(250, 204, 21, 0.65)', textColor: '#854d0e' },
                            { label: 'Approval', count: 2, pct: 8, color: 'rgba(248, 113, 113, 0.65)', textColor: '#991b1b' },
                          ]
                          const cx = 105
                          const cy = 105
                          const rIn = 58
                          const rOut = 96
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
                                const ly = cy + rMid * Math.sin(midRad) + 4

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
                                      fontSize="10.5"
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
                                fontSize="25"
                                fontWeight="700"
                                fill="#0d212c"
                              >
                                24
                              </text>
                              <text
                                x={cx}
                                y={cy + 15}
                                textAnchor="middle"
                                fontSize="11"
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

                    {/* Legend list matching reference design */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        flex: 1,
                        minWidth: 0,
                        height: 210,
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
                                fontSize: 12.5,
                                fontWeight: 500,
                                color: '#1e293b',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {item.label}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0d212c' }}>
                              {item.count}
                            </span>
                            <span style={{ fontSize: 11.5, color: '#64748b' }}>({item.pct}%)</span>
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
