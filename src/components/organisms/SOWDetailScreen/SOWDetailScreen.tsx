/**
 * @layer organism
 * @description SOW Detail Screen — breadcrumb, tabs, and tab content.
 * Designed to render inside the DashboardScreenV2 app shell (no page wrapper).
 * Tabs: Overview | Form | Structure (unlocks after Form submit) | SOW Draft | Audit Log
 */

'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Check, X, ChevronDown, CheckCircle2, FileText, Clock, Layers } from 'lucide-react'
import { AuditLogView } from '../AuditLogView'
import type {
  SOWDetailScreenProps,
  SOWTab,
  SOWFormData,
  CommitmentItem,
  SOWSection,
  SectionItem,
  SectionMember,
} from './SOWDetailScreen.types'
import type { UploadedFile } from '@/components/molecules/CreateSOWModal'

/* ── Tab config ──────────────────────────────────────────────────────────── */

function buildTabs(structureUnlocked: boolean, draftUnlocked = false) {
  return [
    { id: 'overview' as SOWTab, label: 'Overview', locked: false },
    { id: 'form' as SOWTab, label: 'Form', locked: false },
    { id: 'structure' as SOWTab, label: 'Structure', locked: !structureUnlocked },
    { id: 'sow-draft' as SOWTab, label: 'SOW Draft', locked: !draftUnlocked },
    { id: 'audit-log' as SOWTab, label: 'Audit Log', locked: false },
  ]
}

/* ── Status badge colors ─────────────────────────────────────────────────── */

const STATUS_BG: Record<string, string> = {
  'In Progress': '#fef3c7',
  Completed: '#dcfce7',
  Pending: '#fef3c7',
  'Not Started': '#f1f5f9',
}
const STATUS_TEXT: Record<string, string> = {
  'In Progress': '#d97706',
  Completed: '#16a34a',
  Pending: '#d97706',
  'Not Started': '#64748b',
}

/* ── File icons (emoji) ──────────────────────────────────────────────────── */

const FILE_ICONS: Record<string, string> = {
  pdf: '📄',
  docx: '📝',
  doc: '📝',
  txt: '🗒️',
  png: '🖼️',
  jpg: '🖼️',
  jpeg: '🖼️',
  ppt: '📊',
  pptx: '📊',
}
function getFileExt(name: string) {
  return name.split('.').pop()?.toLowerCase() ?? ''
}

/* ── Shared UI pieces ────────────────────────────────────────────────────── */

function LockIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 14 14"
      fill="none"
      style={{ display: 'inline', marginLeft: 4, verticalAlign: 'middle' }}
    >
      <rect x="2.5" y="6" width="9" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SectionCard({ title, children }: { title?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.7)',
        border: '1px solid rgba(0,196,196,0.15)',
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 16,
      }}
    >
      {title && (
        <div
          style={{
            padding: '14px 20px 12px',
            borderBottom: '1px solid rgba(0,196,196,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {title}
        </div>
      )}
      <div style={{ padding: '16px 20px' }}>{children}</div>
    </div>
  )
}

/* ── Overview Tab ────────────────────────────────────────────────────────── */

function FilePreviewModal({ file, onClose }: { file: UploadedFile; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: '32px 36px',
          minWidth: 480,
          maxWidth: 640,
          width: '90vw',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28 }}>{FILE_ICONS[getFileExt(file.name)] ?? '📄'}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16, color: '#0d212c' }}>{file.name}</div>
              <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>
                {file.size} · {file.type.toUpperCase()}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              fontSize: 22,
              padding: 4,
            }}
          >
            ×
          </button>
        </div>
        <div
          style={{
            background: '#f8fafc',
            borderRadius: 10,
            padding: 24,
            minHeight: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            fontSize: 14,
          }}
        >
          Document preview will be available once processed by the AI engine.
        </div>
      </div>
    </div>
  )
}

function OverviewTab({ files }: { files: UploadedFile[] }) {
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null)
  return (
    <div style={{ padding: '20px 16px' }}>
      {/* ── KPI Cards Bar ── */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {/* 1. SOW Sources */}
        <div
          style={{
            background: 'rgba(255,255,255,0.6)',
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
              Total Documents
            </span>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: 'rgba(0,196,196,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={16} color="#00a0a0" />
            </div>
          </div>
          <div style={{ fontSize: 36, fontWeight: 600, color: '#0d212c', lineHeight: 1 }}>
            {files.length > 0 ? files.length : 2}
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
              RFP & Vendor MSA Attached · 4.2 MB
            </span>
          </div>
        </div>

        {/* 2. Commitments */}
        <div
          style={{
            background: 'rgba(255,255,255,0.6)',
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
              Extracted Commitments
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
              <CheckCircle2 size={16} color="#0284c7" />
            </div>
          </div>
          <div style={{ fontSize: 36, fontWeight: 600, color: '#0d212c', lineHeight: 1 }}>6</div>
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
              4 Open · 2 Completed
            </span>
          </div>
        </div>

        {/* 3. Sections of SOW */}
        <div
          style={{
            background: 'rgba(255,255,255,0.6)',
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
              SOW Sections
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
              <Layers size={16} color="#7c3aed" />
            </div>
          </div>
          <div style={{ fontSize: 36, fontWeight: 600, color: '#0d212c', lineHeight: 1 }}>6</div>
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
              4 Finalized · 2 In Progress
            </span>
          </div>
        </div>

        {/* 4. Review Status */}
        <div
          style={{
            background: 'rgba(255,255,255,0.6)',
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
              Review Status
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
          <div style={{ fontSize: 26, fontWeight: 600, color: '#d97706', lineHeight: 1.38 }}>
            Pending
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
              2 Stakeholders Awaiting
            </span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#0d212c', marginBottom: 2 }}>
          Uploaded Documents
        </div>
        <div style={{ fontSize: 13, color: '#64748b' }}>
          Click a document to preview its content.
        </div>
      </div>
      {files.length === 0 ? (
        <div style={{ color: '#94a3b8', fontSize: 14, padding: '40px 0', textAlign: 'center' }}>
          No documents uploaded.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {files.map((file) => (
            <button
              key={file.id}
              onClick={() => setPreviewFile(file)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.8)',
                border: '1px solid rgba(0,196,196,0.18)',
                borderRadius: 12,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
                boxShadow: '0 2px 8px rgba(0,196,196,0.04)',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#00C4C4'
                ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow =
                  '0 4px 14px rgba(0,196,196,0.14)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,196,196,0.18)'
                ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow =
                  '0 2px 8px rgba(0,196,196,0.04)'
              }}
            >
              <span style={{ fontSize: 24, flexShrink: 0 }}>
                {FILE_ICONS[getFileExt(file.name)] ?? '📄'}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 600,
                    color: '#0d212c',
                    fontSize: 13,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={file.name}
                >
                  {file.name}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                  {file.size} · {file.type.toUpperCase()}
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#00a0a0', fontWeight: 600, flexShrink: 0 }}>
                Preview →
              </div>
            </button>
          ))}
        </div>
      )}
      {previewFile && <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}
    </div>
  )
}

/* ── Form Tab ────────────────────────────────────────────────────────────── */

const MOCK_FORM_DATA: SOWFormData = {
  commitments: [
    {
      id: '1',
      text: 'Deliver a fully functional cloud-based procurement platform within agreed timelines.',
    },
    { id: '2', text: 'Provide post-go-live hypercare support for 30 days.' },
    { id: '3', text: 'Ensure 99.9% uptime SLA for production environment.' },
    { id: '4', text: 'Conduct 3 executive steering committee reviews during the engagement.' },
    { id: '5', text: 'Migrate all historical procurement data with zero data loss.' },
    { id: '6', text: 'Deliver role-based training sessions for all 120 procurement staff.' },
  ],
  clientName: 'Meridian Healthcare Group',
  description:
    'End-to-end digital transformation of procurement operations, replacing legacy manual workflows with an AI-powered platform that automates sourcing, vendor evaluation, and contract lifecycle management.',
  businessOutcome:
    'Reduce procurement cycle time by 40%, achieve 15% cost savings through AI-driven vendor recommendations, and improve compliance adherence to 98%+ across all procurement activities.',
  importanceValue:
    'Procurement inefficiencies currently cost Meridian an estimated $4.2M annually in delayed vendor onboarding, manual errors, and missed early-payment discounts. This solution directly addresses the root causes.',
  inScope:
    'Vendor portal setup, AI sourcing engine integration, contract repository migration, role-based access control, real-time spend analytics dashboard, and user training for 120 procurement staff.',
  outOfScope:
    'ERP system modifications, HR module integration, financial consolidation reporting, and any work outside the 6 defined procurement sub-processes listed in Appendix A.',
  tags: ['Procurement', 'Digital Transformation', 'AI/ML', 'Healthcare', 'Cloud Migration', 'SaaS'],
  otherContext:
    'Client has a hard deadline of Q2 2026 tied to their board-approved digital strategy. Existing legacy system (Ariba 2014) will be decommissioned concurrently. All data migration must be HIPAA compliant.',
}

function RichTextField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label
        style={{
          display: 'block',
          fontSize: 13,
          fontWeight: 600,
          color: '#0d212c',
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        style={{
          width: '100%',
          padding: '10px 12px',
          fontSize: 14,
          color: '#0d212c',
          background: '#fff',
          border: '1.5px solid #e2e8f0',
          borderRadius: 8,
          resize: 'vertical',
          fontFamily: 'inherit',
          lineHeight: 1.6,
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#00C4C4'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#e2e8f0'
        }}
      />
    </div>
  )
}

/* ── Form Loading Animation & Shimmer Skeleton ──────────────────────────── */

function FormGeneratingAnimation() {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        gap: 28,
      }}
    >
      <style>{`
        @keyframes sow-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes sow-pulse{0%,100%{opacity:.25;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}
        @keyframes sow-dot{0%,80%,100%{opacity:.2;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}
        @keyframes sow-shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
      `}</style>
      <div
        style={{
          position: 'relative',
          width: 140,
          height: 160,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ animation: 'sow-float 2.8s ease-in-out infinite' }}>
          <svg width="100" height="130" viewBox="0 0 100 130" fill="none">
            <rect
              x="12"
              y="8"
              width="68"
              height="96"
              rx="10"
              fill="rgba(0,196,196,0.08)"
              stroke="#00C4C4"
              strokeWidth="2"
            />
            {/* Form field lines inside icon */}
            <rect x="22" y="22" width="28" height="5" rx="2" fill="rgba(0,196,196,0.4)" />
            <rect
              x="22"
              y="32"
              width="48"
              height="12"
              rx="3"
              fill="rgba(0,196,196,0.15)"
              stroke="rgba(0,196,196,0.3)"
              strokeWidth="0.8"
            />
            <rect x="22" y="50" width="28" height="5" rx="2" fill="rgba(0,196,196,0.4)" />
            <rect
              x="22"
              y="60"
              width="48"
              height="12"
              rx="3"
              fill="rgba(0,196,196,0.15)"
              stroke="rgba(0,196,196,0.3)"
              strokeWidth="0.8"
            />
            <rect x="22" y="78" width="28" height="5" rx="2" fill="rgba(0,196,196,0.4)" />
            <rect
              x="22"
              y="88"
              width="48"
              height="12"
              rx="3"
              fill="rgba(0,196,196,0.15)"
              stroke="rgba(0,196,196,0.3)"
              strokeWidth="0.8"
            />
          </svg>
        </div>
        <div
          style={{
            position: 'absolute',
            top: 6,
            right: 14,
            animation: 'sow-pulse 1.6s ease-in-out infinite',
            animationDelay: '0s',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M9 1l2 6h6l-5 3.5 2 6L9 13l-5 3.5 2-6L1 7h6z" fill="#00C4C4" opacity=".7" />
          </svg>
        </div>
        <div
          style={{
            position: 'absolute',
            top: 28,
            left: 4,
            animation: 'sow-pulse 2s ease-in-out infinite',
            animationDelay: '.5s',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path
              d="M6 .5l1.5 4H12L8.5 7l1.5 4L6 8.5 2 11l1.5-4L0 4.5h4.5z"
              fill="#7ff0f0"
              opacity=".6"
            />
          </svg>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            right: 8,
            animation: 'sow-pulse 1.8s ease-in-out infinite',
            animationDelay: '.9s',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14">
            <path
              d="M7 .5l1.8 5H13L9 8l1.8 5L7 10 3.2 13 5 8 1 5.5h4.2z"
              fill="#00a0a0"
              opacity=".5"
            />
          </svg>
        </div>
      </div>
      <div style={{ textAlign: 'center', maxWidth: 380 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#0d212c', marginBottom: 10 }}>
          Analysing Documents for Form
        </div>
        <div style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.65, marginBottom: 18 }}>
          Our Intake Agent is analysing your uploaded files to pre-fill commitments, project scope,
          and business outcomes.
        </div>
        <div style={{ display: 'flex', gap: 7, justifyContent: 'center', marginBottom: 12 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                background: '#00C4C4',
                animation: 'sow-dot 1.4s ease-in-out infinite',
                animationDelay: `${i * 0.22}s`,
              }}
            />
          ))}
        </div>
        <div style={{ fontSize: 11, color: '#94a3b8' }}>This usually takes just a few seconds…</div>
      </div>
    </div>
  )
}

function ShimmerForm() {
  const sk: React.CSSProperties = {
    background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)',
    backgroundSize: '800px 100%',
    animation: 'sow-shimmer 1.5s infinite',
    borderRadius: 6,
  }

  return (
    <div style={{ padding: '20px 16px', maxWidth: 820 }}>
      {/* Commitments Card Shimmer */}
      <div
        style={{
          background: 'rgba(255,255,255,0.7)',
          border: '1px solid rgba(0,196,196,0.15)',
          borderRadius: 14,
          padding: '16px 20px',
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <div style={{ ...sk, height: 16, width: 140 }} />
          <div style={{ ...sk, height: 12, width: 180 }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          {[90, 75, 82, 68].map((w, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '10px 14px',
              }}
            >
              <div style={{ ...sk, width: 6, height: 6, borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ ...sk, height: 12, width: `${w}%`, flex: 1 }} />
              <div style={{ ...sk, width: 14, height: 14, borderRadius: 4, flexShrink: 0 }} />
            </div>
          ))}
        </div>
        <div style={{ ...sk, height: 38, width: '100%', borderRadius: 8 }} />
      </div>

      {/* Form Fields Shimmer */}
      {[140, 180, 160, 120, 150].map((labelW, i) => (
        <div
          key={i}
          style={{
            marginBottom: 18,
            background: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(0,196,196,0.12)',
            borderRadius: 12,
            padding: '16px 20px',
          }}
        >
          <div style={{ ...sk, height: 13, width: labelW, marginBottom: 10 }} />
          <div style={{ ...sk, height: i === 0 ? 38 : 72, width: '100%', borderRadius: 8 }} />
        </div>
      ))}
    </div>
  )
}

function FormTab({
  files: _files,
  onReady,
  onSubmit: _onSubmit,
}: {
  files: UploadedFile[]
  onReady?: () => void
  onSubmit: () => void
}) {
  const [loadingState, setLoadingState] = useState<'generating' | 'shimmer' | 'ready'>('generating')
  const [formData, setFormData] = useState<SOWFormData>({
    commitments: [],
    clientName: '',
    description: '',
    businessOutcome: '',
    importanceValue: '',
    inScope: '',
    outOfScope: '',
    tags: [],
    otherContext: '',
  })
  const [newCommitment, setNewCommitment] = useState('')
  const timer1Ref = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timer2Ref = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    timer1Ref.current = setTimeout(() => {
      setLoadingState('shimmer')
      timer2Ref.current = setTimeout(() => {
        setFormData(MOCK_FORM_DATA)
        setLoadingState('ready')
        onReady?.()
      }, 1500)
    }, 2500)
    return () => {
      if (timer1Ref.current) clearTimeout(timer1Ref.current)
      if (timer2Ref.current) clearTimeout(timer2Ref.current)
    }
  }, [])

  const addCommitment = () => {
    if (!newCommitment.trim()) return
    setFormData((prev) => ({
      ...prev,
      commitments: [...prev.commitments, { id: Date.now().toString(), text: newCommitment.trim() }],
    }))
    setNewCommitment('')
  }
  const removeCommitment = (id: string) =>
    setFormData((prev) => ({
      ...prev,
      commitments: prev.commitments.filter((c: CommitmentItem) => c.id !== id),
    }))
  const toggleTag = (tag: string) =>
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t: string) => t !== tag)
        : [...prev.tags, tag],
    }))

  if (loadingState === 'generating') {
    return <FormGeneratingAnimation />
  }

  if (loadingState === 'shimmer') {
    return <ShimmerForm />
  }

  return (
    <div style={{ padding: '20px 16px', maxWidth: 820 }}>
      {/* ── Commitments card ── */}
      <SectionCard
        title={
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0d212c' }}>
            Commitments
            <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 500, color: '#64748b' }}>
              List the key deliverables and obligations.
            </span>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          {formData.commitments.map((c: CommitmentItem) => (
            <div
              key={c.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '10px 14px',
              }}
            >
              <span style={{ color: '#00C4C4', fontSize: 16, marginTop: 1, flexShrink: 0 }}>•</span>
              <span style={{ flex: 1, fontSize: 14, color: '#0d212c', lineHeight: 1.5 }}>
                {c.text}
              </span>
              <button
                onClick={() => removeCommitment(c.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#cbd5e1',
                  fontSize: 18,
                  lineHeight: 1,
                  padding: '0 2px',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.color = '#ef4444'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.color = '#cbd5e1'
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={newCommitment}
            onChange={(e) => setNewCommitment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addCommitment()
            }}
            placeholder="Add a commitment and press Enter…"
            style={{
              flex: 1,
              padding: '9px 12px',
              fontSize: 14,
              background: '#fff',
              border: '1.5px solid #e2e8f0',
              borderRadius: 8,
              color: '#0d212c',
              outline: 'none',
              fontFamily: 'inherit',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#00C4C4'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0'
            }}
          />
          <button
            onClick={addCommitment}
            style={{
              padding: '9px 16px',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 13,
              color: '#64748b',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            + Add
          </button>
        </div>
      </SectionCard>

      {/* ── Fields card ── */}
      <SectionCard
        title={
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0d212c' }}>
            Fields
            <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 500, color: '#64748b' }}>
              Review and edit the AI-extracted details.
            </span>
          </div>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              color: '#0d212c',
              marginBottom: 6,
            }}
          >
            Client Name
          </label>
          <input
            value={formData.clientName}
            onChange={(e) => setFormData((prev) => ({ ...prev, clientName: e.target.value }))}
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: 14,
              color: '#0d212c',
              background: '#fff',
              border: '1.5px solid #e2e8f0',
              borderRadius: 8,
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#00C4C4'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0'
            }}
          />
        </div>
        <RichTextField
          label="Description"
          value={formData.description}
          onChange={(v) => setFormData((p) => ({ ...p, description: v }))}
        />
        <RichTextField
          label="Business Outcome"
          value={formData.businessOutcome}
          onChange={(v) => setFormData((p) => ({ ...p, businessOutcome: v }))}
        />
        <RichTextField
          label="Importance & Value of Solution"
          value={formData.importanceValue}
          onChange={(v) => setFormData((p) => ({ ...p, importanceValue: v }))}
        />
        <RichTextField
          label="In Scope"
          value={formData.inScope}
          onChange={(v) => setFormData((p) => ({ ...p, inScope: v }))}
        />
        <RichTextField
          label="Out of Scope"
          value={formData.outOfScope}
          onChange={(v) => setFormData((p) => ({ ...p, outOfScope: v }))}
        />

        {/* Tags */}
        <div style={{ marginBottom: 18 }}>
          <label
            style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              color: '#0d212c',
              marginBottom: 6,
            }}
          >
            Tags{' '}
            <span style={{ fontWeight: 400, color: '#94a3b8' }}>
              (AI-generated — select the ones that apply)
            </span>
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {MOCK_FORM_DATA.tags.map((tag) => {
              const selected = formData.tags.includes(tag)
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  style={{
                    padding: '5px 14px',
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    background: selected ? 'rgba(0,196,196,0.1)' : '#f8fafc',
                    border: selected ? '1.5px solid #00C4C4' : '1.5px solid #e2e8f0',
                    color: selected ? '#00a0a0' : '#64748b',
                  }}
                >
                  {tag}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              color: '#0d212c',
              marginBottom: 6,
            }}
          >
            Any Other Relevant Context
          </label>
          <textarea
            value={formData.otherContext}
            onChange={(e) => setFormData((p) => ({ ...p, otherContext: e.target.value }))}
            rows={3}
            placeholder="Add any additional context, constraints, or notes…"
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: 14,
              color: '#0d212c',
              background: '#fff',
              border: '1.5px solid #e2e8f0',
              borderRadius: 8,
              resize: 'vertical',
              fontFamily: 'inherit',
              lineHeight: 1.6,
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#00C4C4'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0'
            }}
          />
        </div>
      </SectionCard>
    </div>
  )
}

/* ── Add Section modal ───────────────────────────────────────────────────── */

function AddSectionModal({
  onClose,
  onAdd,
}: {
  onClose: () => void
  onAdd: (title: string, description: string) => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  const handleAdd = () => {
    if (!title.trim()) return
    onAdd(title.trim(), description.trim())
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: '20px 16px',
          width: 480,
          maxWidth: '90vw',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 22,
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0d212c' }}>Add Section</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
              Add a new section to the SOW structure.
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              fontSize: 20,
              padding: 4,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              color: '#0d212c',
              marginBottom: 6,
            }}
          >
            Section Title <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd()
            }}
            placeholder="e.g. Executive Summary"
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: 14,
              color: '#0d212c',
              background: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: 8,
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#00C4C4'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0'
            }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label
            style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              color: '#0d212c',
              marginBottom: 6,
            }}
          >
            Brief Description <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe the purpose and scope of this section…"
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: 14,
              color: '#0d212c',
              background: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: 8,
              resize: 'none',
              fontFamily: 'inherit',
              lineHeight: 1.6,
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#00C4C4'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0'
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 20px',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 13,
              color: '#64748b',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!title.trim()}
            style={{
              padding: '9px 20px',
              background: title.trim() ? '#00C4C4' : '#cbd5e1',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: title.trim() ? 'pointer' : 'not-allowed',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => {
              if (title.trim()) (e.currentTarget as HTMLButtonElement).style.background = '#00a8a8'
            }}
            onMouseLeave={(e) => {
              if (title.trim()) (e.currentTarget as HTMLButtonElement).style.background = '#00C4C4'
            }}
          >
            Add Section
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Structure Tab ───────────────────────────────────────────────────────── */

const SECTION_MEMBERS: SectionMember[] = [
  { id: 'm1', name: 'Ashika Jain', initials: 'AJ', color: '#00C4C4' },
  { id: 'm2', name: 'Rohan Mehta', initials: 'RM', color: '#8b5cf6' },
  { id: 'm3', name: 'Priya Sharma', initials: 'PS', color: '#f59e0b' },
  { id: 'm4', name: 'Karan Bose', initials: 'KB', color: '#ef4444' },
]

function memberById(id: string) {
  return SECTION_MEMBERS.find((m) => m.id === id) ?? SECTION_MEMBERS[0]
}

const INITIAL_SECTIONS: SOWSection[] = [
  {
    id: 's1',
    title: 'Executive Summary',
    assignedMembers: ['m1', 'm2', 'm3'],
    items: [
      {
        id: 'i1a',
        type: 'assumption',
        text: 'Procurement cycle is currently 45 days on average and will reduce to under 27 days post-implementation.',
        assignedTo: 'm1',
        answered: true,
      },
      {
        id: 'i1b',
        type: 'assumption',
        text: 'Client has 120+ procurement staff who will require role-based training across 6 regional offices.',
        assignedTo: 'm2',
        answered: true,
      },
      {
        id: 'i1c',
        type: 'assumption',
        text: 'All stakeholders have been identified and project governance structure is fully in place.',
        assignedTo: 'm3',
        answered: true,
      },
      {
        id: 'i1d',
        type: 'question',
        text: 'Has the executive sponsor formally signed off on the transformation roadmap and budget allocation?',
        assignedTo: 'm1',
        answered: true,
      },
      {
        id: 'i1e',
        type: 'question',
        text: 'Are there any board-level dependencies that could affect the go-live timeline in Q2 2026?',
        assignedTo: 'm2',
        answered: true,
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's2',
    title: 'Scope of Work',
    assignedMembers: ['m1', 'm4'],
    items: [
      {
        id: 'i2a',
        type: 'question',
        text: 'Which of the 6 procurement sub-processes listed in Appendix A are considered highest priority for Phase 1?',
        assignedTo: 'm1',
        answered: true,
      },
      {
        id: 'i2b',
        type: 'question',
        text: 'Is third-party vendor onboarding for Phase 1 capped at 50 vendors, or can that number flex based on business need?',
        assignedTo: 'm4',
        answered: false,
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's3',
    title: 'Deliverables',
    assignedMembers: ['m2', 'm3'],
    items: [
      {
        id: 'i3a',
        type: 'assumption',
        text: 'Cloud platform delivery is expected within 6 calendar months from project kick-off date.',
        assignedTo: 'm2',
        answered: false,
      },
      {
        id: 'i3b',
        type: 'question',
        text: "Does documentation scope include API reference for the client's internal developer team, or is it limited to user and admin guides?",
        assignedTo: 'm3',
        answered: false,
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's4',
    title: 'Timeline & Milestones',
    assignedMembers: ['m1', 'm2'],
    items: [],
    assumptions: [],
    questions: [],
  },
  {
    id: 's5',
    title: 'Commercials',
    assignedMembers: ['m1', 'm3'],
    items: [
      {
        id: 'i5a',
        type: 'assumption',
        text: 'Fixed price engagement with no scope creep clauses beyond the agreed Change Request process.',
        assignedTo: 'm1',
        answered: false,
      },
      {
        id: 'i5b',
        type: 'assumption',
        text: 'Travel and expenses are included in the fixed price up to the agreed cap specified in Schedule B.',
        assignedTo: 'm3',
        answered: false,
      },
      {
        id: 'i5c',
        type: 'question',
        text: 'Are milestone payments tied strictly to phase completion acceptance, or is a calendar date trigger also acceptable?',
        assignedTo: 'm1',
        answered: false,
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's6',
    title: 'Assumptions & Risks',
    assignedMembers: ['m2', 'm4'],
    items: [
      {
        id: 'i6a',
        type: 'assumption',
        text: 'All data migration must be HIPAA compliant — client will provide formal compliance sign-off before migration begins.',
        assignedTo: 'm2',
        answered: false,
      },
      {
        id: 'i6b',
        type: 'question',
        text: 'Has the client confirmed availability of key stakeholders for workshops within 5 business days of request?',
        assignedTo: 'm4',
        answered: false,
      },
    ],
    assumptions: [],
    questions: [],
  },
]

const INITIAL_SECTIONS_V2: SOWSection[] = [
  {
    id: 's1',
    title: 'Executive Summary',
    assignedMembers: ['m1', 'm2', 'm3'],
    items: [
      {
        id: 'i1a',
        type: 'assumption',
        text: 'Procurement cycle is currently 45 days on average and will reduce to under 27 days post-implementation.',
        assignedTo: 'm1',
        answered: true,
        response:
          'Confirmed. Current average is 44.5 days per Q3 benchmarking report. Target of ≤27 days is achievable with automation of approval workflows.',
      },
      {
        id: 'i1b',
        type: 'assumption',
        text: 'Client has 120+ procurement staff who will require role-based training across 6 regional offices.',
        assignedTo: 'm2',
        answered: true,
        response:
          'Verified with HR data. 128 staff total across 6 offices. Training plan drafted — 3-day onsite per office, staggered over 8 weeks.',
      },
      {
        id: 'i1c',
        type: 'assumption',
        text: 'All stakeholders have been identified and project governance structure is fully in place.',
        assignedTo: 'm3',
        answered: true,
        response:
          'Governance charter signed off 12 Sept. RACI published to all stakeholders. Weekly steering committee scheduled from Oct 1.',
      },
      {
        id: 'i1d',
        type: 'question',
        text: 'Has the executive sponsor formally signed off on the transformation roadmap and budget allocation?',
        assignedTo: 'm1',
        answered: true,
        response:
          'Yes — CFO and CPO co-signed the roadmap on 18 Sept 2026. Budget of $4.2M allocated in FY2027 capex plan.',
      },
      {
        id: 'i1e',
        type: 'question',
        text: 'Are there any board-level dependencies that could affect the go-live timeline in Q2 2026?',
        assignedTo: 'm2',
        answered: true,
        response:
          'No blocking board dependencies. M&A activity paused until H2 2027. ERP migration (separate workstream) will complete by Jan 2027 — no overlap risk.',
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's2',
    title: 'Scope of Work',
    assignedMembers: ['m1', 'm4'],
    items: [
      {
        id: 'i2a',
        type: 'question',
        text: 'Which of the 6 procurement sub-processes listed in Appendix A are considered highest priority for Phase 1?',
        assignedTo: 'm1',
        answered: true,
        response:
          'Priority sub-processes for Phase 1: (1) Purchase Order Automation, (2) Vendor Onboarding, (3) Invoice Reconciliation. Sub-processes 4–6 deferred to Phase 2.',
      },
      {
        id: 'i2b',
        type: 'question',
        text: 'Is third-party vendor onboarding for Phase 1 capped at 50 vendors, or can that number flex based on business need?',
        assignedTo: 'm4',
        answered: false,
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's3',
    title: 'Deliverables',
    assignedMembers: ['m2', 'm3'],
    items: [
      {
        id: 'i3a',
        type: 'assumption',
        text: 'Cloud platform delivery is expected within 6 calendar months from project kick-off date.',
        assignedTo: 'm2',
        answered: true,
        response:
          'Kick-off confirmed for 1 Nov 2026. Delivery target is 30 Apr 2027. Milestone gates at M2 (Jan), M4 (Mar), M6 (Apr).',
      },
      {
        id: 'i3b',
        type: 'question',
        text: "Does documentation scope include API reference for the client's internal developer team, or is it limited to user and admin guides?",
        assignedTo: 'm3',
        answered: false,
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's4',
    title: 'Timeline & Milestones',
    assignedMembers: ['m1', 'm2'],
    items: [],
    assumptions: [],
    questions: [],
  },
  {
    id: 's5',
    title: 'Commercials',
    assignedMembers: ['m1', 'm3'],
    items: [
      {
        id: 'i5a',
        type: 'assumption',
        text: 'Fixed price engagement with no scope creep clauses beyond the agreed Change Request process.',
        assignedTo: 'm1',
        answered: false,
      },
      {
        id: 'i5b',
        type: 'assumption',
        text: 'Travel and expenses are included in the fixed price up to the agreed cap specified in Schedule B.',
        assignedTo: 'm3',
        answered: false,
      },
      {
        id: 'i5c',
        type: 'question',
        text: 'Are milestone payments tied strictly to phase completion acceptance, or is a calendar date trigger also acceptable?',
        assignedTo: 'm1',
        answered: false,
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's6',
    title: 'Assumptions & Risks',
    assignedMembers: ['m2', 'm4'],
    items: [
      {
        id: 'i6a',
        type: 'assumption',
        text: 'All data migration must be HIPAA compliant — client will provide formal compliance sign-off before migration begins.',
        assignedTo: 'm2',
        answered: false,
      },
      {
        id: 'i6b',
        type: 'question',
        text: 'Has the client confirmed availability of key stakeholders for workshops within 5 business days of request?',
        assignedTo: 'm4',
        answered: false,
      },
    ],
    assumptions: [],
    questions: [],
  },
]

/* ── Member avatar chip ── */
function MemberAvatar({ memberId, size = 24 }: { memberId: string; size?: number }) {
  const m = memberById(memberId)
  return (
    <div
      title={m.name}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: m.color,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.38,
        fontWeight: 700,
        flexShrink: 0,
        border: '2px solid #fff',
      }}
    >
      {m.initials}
    </div>
  )
}

/* ── Add Item Modal ── */
function AddItemModal({
  sectionTitle,
  members,
  onClose,
  onAdd,
}: {
  sectionTitle: string
  members: string[]
  onClose: () => void
  onAdd: (item: Omit<SectionItem, 'id'>) => void
}) {
  const [type, setType] = useState<'question' | 'assumption'>('question')
  const [text, setText] = useState('')
  const [assignedTo, setAssignedTo] = useState<string>('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedMember = assignedTo ? memberById(assignedTo) : null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(3px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: '24px',
          width: 480,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close Cross Icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0d212c', marginBottom: 4 }}>
              Add to {sectionTitle}
            </div>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              Add a question or assumption and assign it to a section member.
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: 4,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#0d212c')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#94a3b8')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Radio buttons: Question first, Assumption at bottom (no highlight fill/stroke on card) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <label
            onClick={() => setType('question')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              borderRadius: 10,
              border: '1.5px solid #e2e8f0',
              background: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.12s ease',
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                border: `2px solid ${type === 'question' ? '#00C4C4' : '#cbd5e1'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {type === 'question' && (
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00C4C4' }} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0d212c' }}>Question</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>
                Clarification or inquiry required from team / vendor
              </div>
            </div>
          </label>

          <label
            onClick={() => setType('assumption')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              borderRadius: 10,
              border: '1.5px solid #e2e8f0',
              background: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.12s ease',
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                border: `2px solid ${type === 'assumption' ? '#00C4C4' : '#cbd5e1'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {type === 'assumption' && (
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00C4C4' }} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0d212c' }}>Assumption</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>
                Premise or condition taken as granted for this section
              </div>
            </div>
          </label>
        </div>

        {/* Textarea Description */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 600,
              color: '#64748b',
              marginBottom: 6,
            }}
          >
            {type === 'question' ? 'Question Text' : 'Assumption Description'}
          </label>
          <textarea
            placeholder={
              type === 'question'
                ? 'Enter the question to be answered…'
                : 'Enter the assumption details…'
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: 13,
              borderRadius: 8,
              border: '1.5px solid #e2e8f0',
              outline: 'none',
              resize: 'vertical',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              color: '#0d212c',
            }}
          />
        </div>

        {/* Assign to Dropdown Field (empty by default) */}
        <div ref={dropdownRef} style={{ position: 'relative', marginBottom: 24 }}>
          <label
            style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 600,
              color: '#64748b',
              marginBottom: 6,
            }}
          >
            Assign to
          </label>
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '9px 12px',
              borderRadius: 8,
              border: `1.5px solid ${dropdownOpen ? '#00C4C4' : '#e2e8f0'}`,
              background: '#ffffff',
              cursor: 'pointer',
            }}
          >
            {selectedMember ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: selectedMember.color,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  {selectedMember.initials}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0d212c' }}>
                  {selectedMember.name}
                </span>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>PMO Member</span>
              </div>
            ) : (
              <span style={{ fontSize: 13, color: '#94a3b8' }}>Select a section member…</span>
            )}
            <ChevronDown size={15} color="#64748b" />
          </button>

          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                right: 0,
                zIndex: 60,
                background: '#ffffff',
                border: '1px solid rgba(0,196,196,0.2)',
                borderRadius: 10,
                boxShadow: '0 8px 30px rgba(0,0,0,0.14)',
                padding: 6,
                maxHeight: 180,
                overflowY: 'auto',
              }}
            >
              {members.map((mid) => {
                const m = memberById(mid)
                const isSel = assignedTo === mid
                return (
                  <button
                    key={mid}
                    type="button"
                    onClick={() => {
                      setAssignedTo(mid)
                      setDropdownOpen(false)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 6,
                      border: 'none',
                      background: isSel ? 'rgba(0,196,196,0.08)' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: m.color,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      {m.initials}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0d212c' }}>
                        {m.name}
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>PMO Member</div>
                    </div>
                    {isSel && <Check size={14} color="#00C4C4" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              border: '1.5px solid #e2e8f0',
              background: '#f8fafc',
              fontSize: 13,
              fontWeight: 600,
              color: '#64748b',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (text.trim()) {
                onAdd({ type, text: text.trim(), assignedTo, answered: false })
                onClose()
              }
            }}
            disabled={!text.trim()}
            style={{
              padding: '8px 20px',
              borderRadius: 8,
              border: 'none',
              background: '#00C4C4',
              fontSize: 13,
              fontWeight: 700,
              color: '#fff',
              cursor: text.trim() ? 'pointer' : 'not-allowed',
              opacity: text.trim() ? 1 : 0.5,
            }}
          >
            Add Item
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Three-dot section menu ── */
function SectionDotMenu({ onRename, onDelete }: { onRename: () => void; onDelete: () => void }) {
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
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        style={{
          width: 24,
          height: 24,
          borderRadius: 6,
          border: 'none',
          background: open ? 'rgba(0,196,196,0.15)' : 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b',
          flexShrink: 0,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 'calc(100% + 4px)',
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            zIndex: 50,
            minWidth: 140,
            overflow: 'hidden',
          }}
        >
          {[
            {
              label: 'Rename',
              icon: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7',
              action: () => {
                setOpen(false)
                onRename()
              },
            },
            {
              label: 'Delete',
              icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
              action: () => {
                setOpen(false)
                onDelete()
              },
              danger: true,
            },
          ].map(({ label, icon, action, danger }) => (
            <button
              key={label}
              onClick={action}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '9px 14px',
                background: 'none',
                border: 'none',
                fontSize: 13,
                fontWeight: 500,
                color: danger ? '#ef4444' : '#374151',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.background = danger
                  ? '#fef2f2'
                  : '#f8fafc'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.background = 'none'
              }}
            >
              <svg
                width="13"
                height="13"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d={icon} />
              </svg>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function StructureTab({ initialSections = INITIAL_SECTIONS }: { initialSections?: SOWSection[] }) {
  const [sections, setSections] = useState<SOWSection[]>(initialSections)
  const [activeId, setActiveId] = useState<string>(initialSections[0].id)
  const [showAddSectionModal, setShowAddSectionModal] = useState(false)
  const [addItemFor, setAddItemFor] = useState<string | null>(null) // section id
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [hoveredSection, setHoveredSection] = useState<string | null>(null)
  const [assignDropdownOpen, setAssignDropdownOpen] = useState(false)
  const assignDropdownRef = useRef<HTMLDivElement>(null)
  const rightPaneRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const isUserScrolling = useRef(false)
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hasSelection = selected.size > 0

  // Close assign dropdown on outside click
  useEffect(() => {
    if (!assignDropdownOpen) return
    function handle(e: MouseEvent) {
      if (assignDropdownRef.current && !assignDropdownRef.current.contains(e.target as Node))
        setAssignDropdownOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [assignDropdownOpen])

  // Scroll spy via IntersectionObserver
  useEffect(() => {
    const root = rightPaneRef.current
    if (!root) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (isUserScrolling.current) return
        let best = ''
        let bestRatio = 0
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio
            best = entry.target.getAttribute('data-section-id') ?? ''
          }
        })
        if (best) setActiveId(best)
      },
      { root, threshold: [0, 0.2, 0.4, 0.6] }
    )
    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [sections])

  const scrollToSection = useCallback((id: string) => {
    const el = sectionRefs.current[id]
    if (!el || !rightPaneRef.current) return
    isUserScrolling.current = true
    setActiveId(id)
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
    scrollTimeout.current = setTimeout(() => {
      isUserScrolling.current = false
    }, 800)
  }, [])

  const addSection = (title: string) => {
    const s: SOWSection = {
      id: `s${Date.now()}`,
      title,
      assignedMembers: ['m1'],
      items: [],
      assumptions: [],
      questions: [],
    }
    setSections((prev) => [...prev, s])
  }

  const deleteSection = (id: string) => setSections((prev) => prev.filter((s) => s.id !== id))

  const addItemToSection = (secId: string, item: Omit<SectionItem, 'id'>) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === secId
          ? { ...s, items: [...s.items, { ...item, id: `i${Date.now()}`, answered: false }] }
          : s
      )
    )
  }

  const toggleSelect = (itemId: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(itemId) ? next.delete(itemId) : next.add(itemId)
      return next
    })
  }

  const clearSelection = () => setSelected(new Set())

  const bulkAssign = (memberId: string) => {
    setSections((prev) =>
      prev.map((s) => ({
        ...s,
        items: s.items.map((it) => (selected.has(it.id) ? { ...it, assignedTo: memberId } : it)),
      }))
    )
    clearSelection()
  }

  const bulkDelete = () => {
    setSections((prev) =>
      prev.map((s) => ({ ...s, items: s.items.filter((it) => !selected.has(it.id)) }))
    )
    clearSelection()
  }

  // All item ids across all sections (for "select all" within multi-select bar)
  const allItemIds = sections.flatMap((s) => s.items.map((i) => i.id))
  const allSelected = allItemIds.length > 0 && allItemIds.every((id) => selected.has(id))

  const kpiQuestions = (() => {
    const total = sections.reduce(
      (n, s) => n + s.items.filter((i) => i.type === 'question').length,
      0
    )
    const done = sections.reduce(
      (n, s) => n + s.items.filter((i) => i.type === 'question' && i.answered).length,
      0
    )
    return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 }
  })()
  const kpiAssumptions = (() => {
    const total = sections.reduce(
      (n, s) => n + s.items.filter((i) => i.type === 'assumption').length,
      0
    )
    const done = sections.reduce(
      (n, s) => n + s.items.filter((i) => i.type === 'assumption' && i.answered).length,
      0
    )
    return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 }
  })()
  const kpis = [
    {
      label: 'Questions',
      total: kpiQuestions.total,
      done: kpiQuestions.done,
      pct: kpiQuestions.pct,
      color: '#f59e0b',
    },
    {
      label: 'Assumptions',
      total: kpiAssumptions.total,
      done: kpiAssumptions.done,
      pct: kpiAssumptions.pct,
      color: '#8b5cf6',
    },
  ]

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      {/* ── Two-pane layout ── */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* ── Left pane ── */}
        <div
          style={{
            width: 264,
            flexShrink: 0,
            borderRight: '1px solid rgba(0,196,196,0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: 'rgba(248,252,252,0.6)',
          }}
        >
          {/* Mini KPIs */}
          <div
            style={{
              padding: '8px 12px',
              borderBottom: '1px solid rgba(0,196,196,0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
            }}
          >
            {kpis.map((k, ki) => (
              <div
                key={ki}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0' }}
              >
                <span style={{ fontSize: 12, fontWeight: 600, color: '#475569', flex: 1 }}>
                  {k.label}
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#0d212c' }}>
                  {k.done}/{k.total}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: k.color,
                    minWidth: 36,
                    textAlign: 'right',
                  }}
                >
                  {k.pct}%
                </span>
              </div>
            ))}
          </div>
          <div
            style={{
              padding: '8px 16px 6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Sections
            </span>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>{sections.length}</span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px' }}>
            {sections.map((sec, idx) => {
              const isActive = activeId === sec.id
              const isHovered = hoveredSection === sec.id
              return (
                <div
                  key={sec.id}
                  style={{ position: 'relative', marginBottom: 2 }}
                  onMouseEnter={() => setHoveredSection(sec.id)}
                  onMouseLeave={() => setHoveredSection(null)}
                >
                  <button
                    onClick={() => scrollToSection(sec.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 9,
                      width: '100%',
                      padding: '9px 10px',
                      borderRadius: 8,
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      background: isActive
                        ? 'rgba(0,196,196,0.12)'
                        : isHovered
                          ? 'rgba(0,196,196,0.06)'
                          : 'transparent',
                      color: isActive ? '#00a0a0' : '#64748b',
                      paddingRight: isHovered || isActive ? 38 : 10,
                    }}
                  >
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 700,
                        background: isActive ? '#00C4C4' : 'rgba(0,196,196,0.12)',
                        color: isActive ? '#fff' : '#64748b',
                        transition: 'all 0.15s',
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: isActive ? 600 : 500,
                        lineHeight: 1.3,
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {sec.title}
                    </span>
                  </button>
                  {/* Three-dot menu — visible on hover/active */}
                  {(isHovered || isActive) && (
                    <div
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 2,
                      }}
                    >
                      <SectionDotMenu
                        onRename={() => {
                          const t = window.prompt('Rename section:', sec.title)
                          if (t?.trim())
                            setSections((prev) =>
                              prev.map((s) => (s.id === sec.id ? { ...s, title: t.trim() } : s))
                            )
                        }}
                        onDelete={() => deleteSection(sec.id)}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Add section — centered at bottom */}
          <div style={{ padding: '10px 10px 14px', borderTop: '1px solid rgba(0,196,196,0.1)' }}>
            <button
              onClick={() => setShowAddSectionModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                width: '100%',
                padding: '9px 12px',
                borderRadius: 8,
                border: '1.5px dashed rgba(0,196,196,0.35)',
                background: 'transparent',
                cursor: 'pointer',
                color: '#00a0a0',
                fontSize: 13,
                fontWeight: 600,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,196,196,0.07)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Section
            </button>
          </div>
        </div>

        {/* ── Right pane ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Bulk-action bar (appears when items are selected) */}
          {hasSelection && (
            <div
              style={{
                padding: '10px 28px',
                background: 'rgba(0,196,196,0.08)',
                borderBottom: '1px solid rgba(0,196,196,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                flexShrink: 0,
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#00a0a0',
                  userSelect: 'none',
                }}
                onClick={() => (allSelected ? clearSelection() : setSelected(new Set(allItemIds)))}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    border: allSelected ? '1.5px solid #00C4C4' : '1.5px solid #cbd5e1',
                    background: allSelected ? '#00C4C4' : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                  }}
                >
                  {allSelected && <Check size={11} strokeWidth={3} color="#ffffff" />}
                </div>
                {selected.size} selected
              </label>
              <div style={{ height: 16, width: 1, background: 'rgba(0,196,196,0.25)' }} />
              {/* Assign to — dropdown */}
              <div ref={assignDropdownRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setAssignDropdownOpen((v) => !v)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 12px',
                    borderRadius: 8,
                    border: `1.5px solid ${assignDropdownOpen ? '#00C4C4' : 'rgba(0,196,196,0.3)'}`,
                    background: assignDropdownOpen ? 'rgba(0,196,196,0.1)' : 'rgba(0,196,196,0.05)',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#00a0a0',
                    cursor: 'pointer',
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87" />
                    <path d="M16 3.13a4 4 0 010 7.75" />
                  </svg>
                  Assign to
                  <svg
                    width="11"
                    height="11"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    viewBox="0 0 24 24"
                    style={{
                      transform: assignDropdownOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.15s',
                    }}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {assignDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      left: 0,
                      background: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 12,
                      boxShadow: '0 8px 28px rgba(0,0,0,0.12)',
                      zIndex: 100,
                      minWidth: 200,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        padding: '8px 12px 6px',
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      Select member
                    </div>
                    {SECTION_MEMBERS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          bulkAssign(m.id)
                          setAssignDropdownOpen(false)
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          width: '100%',
                          padding: '9px 14px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 13,
                          fontWeight: 500,
                          color: '#374151',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(e) => {
                          ;(e.currentTarget as HTMLButtonElement).style.background =
                            'rgba(0,196,196,0.06)'
                        }}
                        onMouseLeave={(e) => {
                          ;(e.currentTarget as HTMLButtonElement).style.background = 'none'
                        }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: m.color,
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 11,
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {m.initials}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#0d212c' }}>
                            {m.name}
                          </div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>PMO Member</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ height: 16, width: 1, background: 'rgba(0,196,196,0.25)' }} />
              <button
                onClick={bulkDelete}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#ef4444',
                  background: '#fef2f2',
                  border: 'none',
                  borderRadius: 7,
                  padding: '4px 10px',
                  cursor: 'pointer',
                }}
              >
                <svg
                  width="12"
                  height="12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
              <button
                onClick={clearSelection}
                style={{
                  marginLeft: 'auto',
                  fontSize: 12,
                  color: '#94a3b8',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                ✕ Clear
              </button>
            </div>
          )}

          <div ref={rightPaneRef} style={{ flex: 1, overflowY: 'auto', padding: '0 0 40px' }}>
            {sections.map((sec, idx) => {
              const assumptions = sec.items.filter((i) => i.type === 'assumption')
              const questions = sec.items.filter((i) => i.type === 'question')
              return (
                <div
                  key={sec.id}
                  ref={(el) => {
                    sectionRefs.current[sec.id] = el
                  }}
                  data-section-id={sec.id}
                  style={{
                    padding: '24px 28px',
                    borderBottom:
                      idx < sections.length - 1 ? '1px solid rgba(0,196,196,0.1)' : 'none',
                  }}
                >
                  {/* Section header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                    <span
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: 'rgba(0,196,196,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#00a0a0',
                        flexShrink: 0,
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#0d212c', flex: 1 }}>
                      {sec.title}
                    </span>
                    {/* Assigned members */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {sec.assignedMembers.map((mid, mi) => (
                        <div key={mid} style={{ marginLeft: mi > 0 ? -6 : 0 }}>
                          <MemberAvatar memberId={mid} size={26} />
                        </div>
                      ))}
                    </div>
                    {/* Add item CTA */}
                    <button
                      onClick={() => setAddItemFor(sec.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '5px 12px',
                        borderRadius: 7,
                        border: '1.5px solid rgba(0,196,196,0.3)',
                        background: 'rgba(0,196,196,0.05)',
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#00a0a0',
                        cursor: 'pointer',
                      }}
                    >
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.8"
                        strokeLinecap="round"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      Add
                    </button>
                  </div>

                  {/* Items list */}
                  {sec.items.length === 0 ? (
                    <div
                      style={{
                        fontSize: 13,
                        color: '#94a3b8',
                        padding: '14px 16px',
                        background: '#f8fafc',
                        borderRadius: 9,
                        border: '1px dashed #e2e8f0',
                        textAlign: 'center',
                      }}
                    >
                      No assumptions or questions yet. Click <strong>+ Add</strong> to add one.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {assumptions.map((item, ai) => (
                        <ItemRow
                          key={item.id}
                          item={item}
                          label={`Assumption ${ai + 1}`}
                          isSelected={selected.has(item.id)}
                          hasAnySelected={hasSelection}
                          onToggle={() => toggleSelect(item.id)}
                        />
                      ))}
                      {questions.map((item, qi) => (
                        <ItemRow
                          key={item.id}
                          item={item}
                          label={`Question ${qi + 1}`}
                          isSelected={selected.has(item.id)}
                          hasAnySelected={hasSelection}
                          onToggle={() => toggleSelect(item.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      {/* end two-pane layout */}

      {showAddSectionModal && (
        <AddSectionModal
          onClose={() => setShowAddSectionModal(false)}
          onAdd={(t, _d) => addSection(t)}
        />
      )}
      {addItemFor &&
        (() => {
          const sec = sections.find((s) => s.id === addItemFor)
          if (!sec) return null
          return (
            <AddItemModal
              sectionTitle={sec.title}
              members={sec.assignedMembers}
              onClose={() => setAddItemFor(null)}
              onAdd={(item) => addItemToSection(addItemFor, item)}
            />
          )
        })()}
    </div>
  )
}

/* ── Item row (assumption or question) ── */
function ItemRow({
  item,
  label,
  isSelected,
  hasAnySelected,
  onToggle,
}: {
  item: SectionItem
  label: string
  isSelected: boolean
  hasAnySelected: boolean
  onToggle: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const isAssumption = item.type === 'assumption'
  const m = memberById(item.assignedTo)
  const showCheckbox = hovered || isSelected || hasAnySelected

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 9,
        padding: '10px 13px',
        borderRadius: 9,
        border: `1px solid ${isSelected ? '#00C4C4' : 'rgba(0,196,196,0.18)'}`,
        background: isSelected ? 'rgba(0,196,196,0.06)' : 'rgba(0,196,196,0.04)',
        transition: 'border-color 0.12s, background 0.12s',
      }}
    >
      {/* Checkbox */}
      <div
        style={{
          width: 16,
          flexShrink: 0,
          marginTop: 2,
          opacity: showCheckbox ? 1 : 0,
          transition: 'opacity 0.1s',
        }}
      >
        <button
          type="button"
          onClick={onToggle}
          style={{
            width: 16,
            height: 16,
            borderRadius: 4,
            border: isSelected ? '1.5px solid #00C4C4' : '1.5px solid #cbd5e1',
            background: isSelected ? '#00C4C4' : '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
            transition: 'all 0.12s ease',
          }}
        >
          {isSelected && <Check size={11} strokeWidth={3} color="#ffffff" />}
        </button>
      </div>

      {/* Label tag */}
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#00a0a0',
          background: 'rgba(0,196,196,0.12)',
          padding: '2px 7px',
          borderRadius: 5,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          marginTop: 1,
        }}
      >
        {label}
      </span>

      {/* Text + optional response thread */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.55 }}>{item.text}</span>
        {item.response && (
          <div
            style={{
              marginTop: 8,
              paddingTop: 8,
              borderTop: '1px solid rgba(0,196,196,0.18)',
              display: 'flex',
              gap: 7,
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: '#00C4C4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: 1,
              }}
            >
              <svg
                width="9"
                height="9"
                fill="none"
                stroke="#fff"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <span style={{ fontSize: 12, color: '#0d7b7b', lineHeight: 1.55, fontStyle: 'italic' }}>
              {item.response}
            </span>
          </div>
        )}
      </div>

      {/* Assigned to */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, marginTop: 2 }}>
        <MemberAvatar memberId={item.assignedTo} size={20} />
        <span style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap' }}>
          {m.name.split(' ')[0]}
        </span>
      </div>
    </div>
  )
}

/* ── SOW Draft Tab ───────────────────────────────────────────────────────── */

const SOW_DRAFT_SECTIONS = [
  { id: 'ds0', title: 'Background' },
  { id: 'ds1', title: 'Executive Summary' },
  { id: 'ds2', title: 'Objectives' },
  { id: 'ds3', title: 'Scope of Work' },
  { id: 'ds4', title: 'Out of Scope' },
  { id: 'ds5', title: 'Requirements' },
  { id: 'ds6', title: 'Approach & Methodology' },
  { id: 'ds7', title: 'Roles & Responsibilities' },
  { id: 'ds8', title: 'Deliverables' },
  { id: 'ds9', title: 'Timeline & Milestones' },
  { id: 'ds10', title: 'Commercials' },
  { id: 'ds11', title: 'Assumptions' },
  { id: 'ds12', title: 'Risks & Mitigations' },
  { id: 'ds13', title: 'Security' },
  { id: 'ds14', title: 'Architecture' },
  { id: 'ds15', title: 'Acceptance Criteria' },
  { id: 'ds16', title: 'Change Management' },
  { id: 'ds17', title: 'Support & Handover' },
  { id: 'ds18', title: 'SLAs' },
  { id: 'ds19', title: 'Terms & Conditions' },
]

type DraftComment = { id: string; sectionId: string; text: string; assignee: string }

function SOWDraftTab() {
  // ── State ───────────────────────────────────────────────────────────────────
  const [activeSectionIdx, setActiveSectionIdx] = useState(0)
  const [hasUnsaved, setHasUnsaved] = useState(false)
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({})
  const editorRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [hoveredTocIdx, setHoveredTocIdx] = useState<number | null>(null)
  const [openMenuIdx, setOpenMenuIdx] = useState<number | null>(null)
  const [hoveredScoreIdx, setHoveredScoreIdx] = useState<number | null>(null)
  const [hoveredReviewerIdx, setHoveredReviewerIdx] = useState<number | null>(null)
  const [approvePopupIdx, setApprovePopupIdx] = useState<number | null>(null)
  const [rejectPopupIdx, setRejectPopupIdx] = useState<number | null>(null)
  const [addReviewerIdx, setAddReviewerIdx] = useState<number | null>(null)
  const [reviewerSearch, setReviewerSearch] = useState('')
  const [approvalComment, setApprovalComment] = useState('')
  const [toastMsg, setToastMsg] = useState('')

  // ── TOC data ────────────────────────────────────────────────────────────────
  type TocItem = {
    title: string
    score: number
    status: 'Pending' | 'Approved' | 'Rejected'
    reviewers: string[]
    fileName: string
  }

  const [tocItems, setTocItems] = useState<TocItem[]>([
    {
      title: 'Background',
      score: 72,
      status: 'Pending',
      reviewers: [],
      fileName: 'RFP_Document.pdf',
    },
    {
      title: 'Executive Summary',
      score: 88,
      status: 'Approved',
      reviewers: ['Ashika Jain'],
      fileName: 'RFP_Document.pdf',
    },
    {
      title: 'Objectives',
      score: 51,
      status: 'Pending',
      reviewers: [],
      fileName: 'Architecture_Guidelines.pdf',
    },
    {
      title: 'Scope of Work',
      score: 65,
      status: 'Pending',
      reviewers: ['Ashika Jain'],
      fileName: 'Architecture_Guidelines.pdf',
    },
    {
      title: 'Out of Scope',
      score: 79,
      status: 'Pending',
      reviewers: [],
      fileName: 'Architecture_Guidelines.pdf',
    },
    {
      title: 'Requirements',
      score: 91,
      status: 'Approved',
      reviewers: ['Rohan Mehta'],
      fileName: 'RFP_Document.pdf',
    },
    {
      title: 'Approach & Methodology',
      score: 81,
      status: 'Pending',
      reviewers: [],
      fileName: 'Architecture_Guidelines.pdf',
    },
    {
      title: 'Roles & Responsibilities',
      score: 69,
      status: 'Pending',
      reviewers: [],
      fileName: 'Architecture_Guidelines.pdf',
    },
    {
      title: 'Deliverables',
      score: 87,
      status: 'Pending',
      reviewers: ['Priya Sharma'],
      fileName: 'RFP_Document.pdf',
    },
    {
      title: 'Timeline & Milestones',
      score: 74,
      status: 'Pending',
      reviewers: [],
      fileName: 'Project_Plan.pdf',
    },
    {
      title: 'Commercials',
      score: 95,
      status: 'Approved',
      reviewers: ['Karan Bose'],
      fileName: 'Commercial_Proposal.pdf',
    },
    {
      title: 'Assumptions',
      score: 83,
      status: 'Pending',
      reviewers: ['Rohan Mehta'],
      fileName: 'Architecture_Guidelines.pdf',
    },
    {
      title: 'Risks & Mitigations',
      score: 86,
      status: 'Pending',
      reviewers: [],
      fileName: 'Risk_Register.pdf',
    },
    {
      title: 'Security',
      score: 62,
      status: 'Pending',
      reviewers: [],
      fileName: 'Security_Guidelines.pdf',
    },
    {
      title: 'Architecture',
      score: 77,
      status: 'Pending',
      reviewers: ['Priya Sharma'],
      fileName: 'Architecture_Guidelines.pdf',
    },
    {
      title: 'Acceptance Criteria',
      score: 93,
      status: 'Approved',
      reviewers: ['Ashika Jain'],
      fileName: 'RFP_Document.pdf',
    },
    {
      title: 'Change Management',
      score: 58,
      status: 'Pending',
      reviewers: [],
      fileName: 'Project_Plan.pdf',
    },
    {
      title: 'Support & Handover',
      score: 97,
      status: 'Approved',
      reviewers: ['Karan Bose'],
      fileName: 'Architecture_Guidelines.pdf',
    },
  ])

  // ── Generate document HTML ──────────────────────────────────────────────────
  const generateHtml = (items: TocItem[]) =>
    items
      .map((item, idx) => {
        let body = ''
        switch (item.title) {
          case 'Project Introduction':
            body = `<p style="margin-bottom:12px;line-height:1.7;color:#374151;">This is auto-generated detailed content for the <strong>Project Introduction</strong> section based on the extracted requirements from your RFP document. Our AI analysis indicates that this section requires further manual review to align perfectly with your internal compliance standards. Please review and modify as needed to ensure it meets your exact specifications.</p>
          <p style="margin-bottom:12px;line-height:1.7;color:#374151;">The proposed engagement covers a comprehensive digital transformation initiative designed to modernize existing technology infrastructure, improve operational efficiency, and create a scalable foundation for future business growth. The delivery team will collaborate closely with all relevant stakeholders to validate requirements and confirm assumptions throughout the engagement lifecycle.</p>`
            break
          case 'Project Scope':
            body = `<p style="margin-bottom:12px;line-height:1.7;color:#374151;">The scope of work is explicitly bounded to the backend infrastructure migration, API Gateway deployment, and database modernization. Clear demarcation of boundaries ensures that the project delivery remains strictly on schedule and within the agreed budget constraints.</p>
          <p style="margin-bottom:8px;line-height:1.7;color:#374151;"><strong>In-Scope Activities:</strong></p>
          <ul style="margin-bottom:16px;padding-left:24px;line-height:1.7;color:#374151;">
            <li>Migration of 5 core relational databases (MySQL/PostgreSQL) to a fully managed cloud SQL environment featuring automated daily snapshots and point-in-time recovery.</li>
            <li>Design and implementation of an enterprise-grade API Gateway featuring advanced rate limiting, robust JWT-based authentication, and granular analytics tracking.</li>
            <li>Containerization of 12 legacy backend services into optimized, scalable Docker images.</li>
            <li>Deployment of a comprehensive observability stack (monitoring, logging, and alerting) using industry-standard tools like Prometheus, Grafana, and ELK.</li>
          </ul>
          <p style="margin-bottom:8px;line-height:1.7;color:#374151;"><strong>Out of Scope:</strong></p>
          <ul style="margin-bottom:12px;padding-left:24px;line-height:1.7;color:#374151;">
            <li>Frontend application redesign or UI/UX modifications.</li>
            <li>Native mobile application development.</li>
            <li>Integration with third-party legacy ERP/CRM systems not listed in the initial RFP.</li>
          </ul>`
            break
          case 'Business Requirements':
            body = `<p style="margin-bottom:12px;line-height:1.7;color:#374151;">The following business requirements have been extracted and validated from the submitted RFP documentation. These requirements form the foundation of the proposed solution architecture and delivery approach.</p>
          <ul style="margin-bottom:16px;padding-left:24px;line-height:1.7;color:#374151;">
            <li><strong>Cost Optimization:</strong> Reduce operational expenditure by approximately 30% through dynamic cloud scaling and resource right-sizing.</li>
            <li><strong>High Availability:</strong> Achieve 99.99% uptime SLA by implementing cross-region failover and automated disaster recovery.</li>
            <li><strong>Security Posture:</strong> Achieve SOC2 and ISO 27001 compliance for the new infrastructure layer.</li>
            <li><strong>Developer Velocity:</strong> Establish zero-touch CI/CD pipelines for continuous integration and seamless deployments.</li>
          </ul>`
            break
          case 'Solution Approach':
            body = `<p style="margin-bottom:12px;line-height:1.7;color:#374151;">The proposed solution architecture is designed around a highly decoupled, event-driven microservices pattern hosted on a managed Kubernetes environment. This design prioritizes fault tolerance, horizontal scalability, and strict security compliance.</p>
          <ul style="margin-bottom:16px;padding-left:24px;line-height:1.7;color:#374151;">
            <li><strong>Edge &amp; Ingress Layer:</strong> A highly available Cloud Load Balancer integrated with a Web Application Firewall (WAF) to defend against DDoS attacks.</li>
            <li><strong>Compute Layer:</strong> Auto-scaling Kubernetes clusters spanning multiple availability zones.</li>
            <li><strong>Data &amp; Caching Layer:</strong> Managed PostgreSQL database cluster with read-replicas and a distributed Redis caching layer.</li>
            <li><strong>Event Streaming:</strong> Apache Kafka for asynchronous communication between microservices.</li>
          </ul>`
            break
          case 'Deliverables':
            body = `<p style="margin-bottom:12px;line-height:1.7;color:#374151;">The engagement will yield a series of concrete, verifiable deliverables across the project lifecycle. Acceptance of these deliverables will trigger subsequent project phases and associated commercial milestones.</p>
          <table border="1" style="width:100%;border-collapse:collapse;margin-bottom:16px;border:1px solid rgba(0,196,196,0.2);font-size:14px;">
            <thead><tr style="background:rgba(0,196,196,0.07);">
              <th style="padding:12px;border-bottom:1px solid rgba(0,196,196,0.2);text-align:left;">Deliverable</th>
              <th style="padding:12px;border-bottom:1px solid rgba(0,196,196,0.2);text-align:left;">Description</th>
            </tr></thead>
            <tbody>
              <tr><td style="padding:12px;border-bottom:1px solid rgba(0,196,196,0.1);"><strong>Architecture Design Document [Week 2]</strong></td><td style="padding:12px;border-bottom:1px solid rgba(0,196,196,0.1);">Comprehensive blueprint detailing network topology, component interactions, and security protocols.</td></tr>
              <tr><td style="padding:12px;border-bottom:1px solid rgba(0,196,196,0.1);"><strong>Infrastructure as Code Scripts [Week 4]</strong></td><td style="padding:12px;border-bottom:1px solid rgba(0,196,196,0.1);">Fully parameterized Terraform and Ansible scripts for automated cloud provisioning.</td></tr>
              <tr><td style="padding:12px;border-bottom:1px solid rgba(0,196,196,0.1);"><strong>Containerized Services [Week 8]</strong></td><td style="padding:12px;border-bottom:1px solid rgba(0,196,196,0.1);">12 migrated backend services packaged as Docker containers, deployed in QA environment.</td></tr>
              <tr><td style="padding:12px;"><strong>Final Handover Package [Week 12]</strong></td><td style="padding:12px;">Complete runbooks, operational manuals, disaster recovery procedures, and formal sign-off document.</td></tr>
            </tbody>
          </table>`
            break
          case 'Roles & Responsibilities':
            body = `<p style="margin-bottom:12px;line-height:1.7;color:#374151;">The following table outlines the roles and responsibilities of both the delivery team and the client organization throughout the project lifecycle.</p>
          <table border="1" style="width:100%;border-collapse:collapse;margin-bottom:16px;border:1px solid rgba(0,196,196,0.2);font-size:14px;">
            <thead><tr style="background:rgba(0,196,196,0.07);">
              <th style="padding:12px;border-bottom:1px solid rgba(0,196,196,0.2);text-align:left;">Role</th>
              <th style="padding:12px;border-bottom:1px solid rgba(0,196,196,0.2);text-align:left;">Responsibilities</th>
            </tr></thead>
            <tbody>
              <tr><td style="padding:12px;border-bottom:1px solid rgba(0,196,196,0.1);"><strong>Project Manager</strong></td><td style="padding:12px;border-bottom:1px solid rgba(0,196,196,0.1);">Overall project coordination, stakeholder communication, risk management, and milestone tracking.</td></tr>
              <tr><td style="padding:12px;border-bottom:1px solid rgba(0,196,196,0.1);"><strong>Solution Architect</strong></td><td style="padding:12px;border-bottom:1px solid rgba(0,196,196,0.1);">Technical design, architecture decisions, and quality assurance of all technical deliverables.</td></tr>
              <tr><td style="padding:12px;border-bottom:1px solid rgba(0,196,196,0.1);"><strong>Client PMO</strong></td><td style="padding:12px;border-bottom:1px solid rgba(0,196,196,0.1);">Approvals, resource allocation, stakeholder alignment, and UAT sign-off.</td></tr>
            </tbody>
          </table>`
            break
          case 'Commercial Terms':
            body = `<p style="margin-bottom:12px;line-height:1.7;color:#374151;">The total estimated cost for this project is based on a Time &amp; Materials (T&amp;M) model with a capped maximum budget of <strong>$145,000 USD</strong>. This covers all engineering, project management, and specialized architectural consulting hours required over the 12-week period.</p>
          <ul style="margin-bottom:16px;padding-left:24px;line-height:1.7;color:#374151;">
            <li><strong>Milestone 1 (20% - $29,000):</strong> Project kickoff and formal SOW signing.</li>
            <li><strong>Milestone 2 (30% - $43,500):</strong> Delivery and approval of the Architecture Design Document.</li>
            <li><strong>Milestone 3 (30% - $43,500):</strong> Successful completion of User Acceptance Testing.</li>
            <li><strong>Milestone 4 (20% - $29,000):</strong> Final go-live and knowledge transfer completion.</li>
          </ul>`
            break
          case 'Risks & Mitigations':
            body = `<p style="margin-bottom:12px;line-height:1.7;color:#374151;">To accurately scope this engagement, several assumptions have been made. Deviation from these assumptions may result in changes to the project timeline or budget, subject to the formal Change Request process.</p>
          <ul style="margin-bottom:16px;padding-left:24px;line-height:1.7;color:#374151;">
            <li><strong>Assumption 1:</strong> Client SMEs will be available for a minimum of 4 hours per week to clarify business logic and validate migration strategies.</li>
            <li><strong>Assumption 2:</strong> The existing legacy source code is fully accessible and accurately documented.</li>
            <li><strong>Risk:</strong> Delays in UAT sign-off by client stakeholders may push the final go-live date. <strong>Mitigation:</strong> Weekly status reports and early, frequent testing cycles will be employed to ensure alignment.</li>
          </ul>`
            break
          case 'Background':
            body = `<p style="margin-bottom:12px;line-height:1.7;color:#374151;">This Statement of Work has been prepared in response to the Request for Proposal (RFP) issued by the client organization. The engagement is aimed at addressing key technology modernization objectives identified through a series of discovery workshops and stakeholder interviews conducted prior to this submission.</p>
          <p style="margin-bottom:12px;line-height:1.7;color:#374151;">The client currently operates a fragmented technology landscape with multiple legacy systems that present challenges around scalability, data integrity, and operational efficiency. This engagement proposes a structured, phased approach to address these gaps while minimizing disruption to business-as-usual operations.</p>`
            break
          case 'Objectives':
            body = `<p style="margin-bottom:12px;line-height:1.7;color:#374151;">The primary objectives of this engagement are structured to address the core business challenges identified during the discovery phase. By executing on these objectives, the delivery team aims to deliver measurable improvements in performance, scalability, and cost efficiency.</p>
          <ul style="margin-bottom:16px;padding-left:24px;line-height:1.7;color:#374151;">
            <li><strong>Cost Optimization:</strong> Reduce operational expenditure by approximately 30% through dynamic cloud scaling and resource right-sizing.</li>
            <li><strong>High Availability &amp; Resilience:</strong> Improve system reliability to achieve a 99.99% uptime SLA by implementing cross-region failover and automated disaster recovery.</li>
            <li><strong>Application Modernization:</strong> Transition current monolithic application structure into a decoupled microservices architecture.</li>
            <li><strong>Operational Agility:</strong> Establish zero-touch CI/CD pipelines for continuous integration and seamless zero-downtime deployments.</li>
          </ul>`
            break
          case 'Out of Scope':
            body = `<p style="margin-bottom:12px;line-height:1.7;color:#374151;">The following items and activities are explicitly excluded from this Statement of Work. Any work falling within these categories will require a formal Change Request and may result in adjustments to cost and timeline.</p>
          <ul style="margin-bottom:16px;padding-left:24px;line-height:1.7;color:#374151;">
            <li>Frontend application redesign, web portal enhancements, or any UI/UX modifications.</li>
            <li>Native mobile application development or updates for iOS and Android platforms.</li>
            <li>Integration with third-party legacy ERP/CRM systems not explicitly listed in the initial RFP documentation.</li>
            <li>Data cleansing or manual data remediation prior to database migration.</li>
            <li>Ongoing managed services or post-go-live support beyond the defined hypercare period.</li>
          </ul>`
            break
          case 'Requirements':
            body = `<p style="margin-bottom:12px;line-height:1.7;color:#374151;">The following functional and non-functional requirements have been extracted and validated from the submitted RFP documentation. These requirements form the foundation of the proposed solution architecture.</p>
          <ul style="margin-bottom:16px;padding-left:24px;line-height:1.7;color:#374151;">
            <li><strong>FR-01:</strong> The system shall support concurrent access by a minimum of 5,000 active users without performance degradation.</li>
            <li><strong>FR-02:</strong> All data transmissions must be encrypted using TLS 1.3 or higher.</li>
            <li><strong>FR-03:</strong> The platform must provide role-based access control (RBAC) with granular permission management.</li>
            <li><strong>NFR-01:</strong> System response time for standard operations must not exceed 200ms at the 95th percentile.</li>
            <li><strong>NFR-02:</strong> The solution must be deployable across AWS, GCP, and Azure without vendor lock-in dependencies.</li>
          </ul>`
            break
          case 'Approach & Methodology':
            body = `<p style="margin-bottom:12px;line-height:1.7;color:#374151;">The delivery team will adopt an Agile-first approach, structured around two-week sprint cycles with continuous stakeholder involvement and feedback loops. This methodology ensures transparency, early risk identification, and rapid course correction when required.</p>
          <ul style="margin-bottom:16px;padding-left:24px;line-height:1.7;color:#374151;">
            <li><strong>Phase 1 — Discovery &amp; Design (Weeks 1–3):</strong> Requirements validation, architecture finalization, and approval of the Architecture Design Document (ADD).</li>
            <li><strong>Phase 2 — Infrastructure Provisioning (Weeks 4–6):</strong> Cloud environment setup, network configuration, and CI/CD pipeline establishment.</li>
            <li><strong>Phase 3 — Development &amp; Migration (Weeks 7–10):</strong> Service containerization, database migration, and integration testing.</li>
            <li><strong>Phase 4 — UAT &amp; Deployment (Weeks 11–14):</strong> User acceptance testing, performance tuning, production deployment, and knowledge transfer.</li>
          </ul>`
            break
          case 'Timeline & Milestones':
            body = `<p style="margin-bottom:12px;line-height:1.7;color:#374151;">The project is estimated to be completed over a period of 14 weeks, divided into four distinct delivery phases. This timeline is contingent upon timely approvals, resource availability from the client, and successful completion of UAT within the defined windows.</p>
          <table border="1" style="width:100%;border-collapse:collapse;margin-bottom:16px;border:1px solid rgba(0,196,196,0.2);font-size:14px;">
            <thead><tr style="background:rgba(0,196,196,0.07);">
              <th style="padding:12px;border-bottom:1px solid rgba(0,196,196,0.2);text-align:left;">Milestone</th>
              <th style="padding:12px;border-bottom:1px solid rgba(0,196,196,0.2);text-align:left;">Target Week</th>
              <th style="padding:12px;border-bottom:1px solid rgba(0,196,196,0.2);text-align:left;">Deliverable</th>
            </tr></thead>
            <tbody>
              <tr><td style="padding:12px;border-bottom:1px solid rgba(0,196,196,0.1);">M1 — Kickoff</td><td style="padding:12px;border-bottom:1px solid rgba(0,196,196,0.1);">Week 1</td><td style="padding:12px;border-bottom:1px solid rgba(0,196,196,0.1);">Project charter signed, team onboarded</td></tr>
              <tr><td style="padding:12px;border-bottom:1px solid rgba(0,196,196,0.1);">M2 — Architecture Sign-off</td><td style="padding:12px;border-bottom:1px solid rgba(0,196,196,0.1);">Week 3</td><td style="padding:12px;border-bottom:1px solid rgba(0,196,196,0.1);">Architecture Design Document approved</td></tr>
              <tr><td style="padding:12px;border-bottom:1px solid rgba(0,196,196,0.1);">M3 — Infrastructure Ready</td><td style="padding:12px;border-bottom:1px solid rgba(0,196,196,0.1);">Week 6</td><td style="padding:12px;border-bottom:1px solid rgba(0,196,196,0.1);">Cloud environments provisioned and validated</td></tr>
              <tr><td style="padding:12px;border-bottom:1px solid rgba(0,196,196,0.1);">M4 — UAT Complete</td><td style="padding:12px;border-bottom:1px solid rgba(0,196,196,0.1);">Week 12</td><td style="padding:12px;border-bottom:1px solid rgba(0,196,196,0.1);">All test cases passed, sign-off obtained</td></tr>
              <tr><td style="padding:12px;">M5 — Go-Live</td><td style="padding:12px;">Week 14</td><td style="padding:12px;">Production deployment and handover complete</td></tr>
            </tbody>
          </table>`
            break
          case 'Commercials':
            body = `<p style="margin-bottom:12px;line-height:1.7;color:#374151;">The total estimated cost for this engagement is based on a Time &amp; Materials (T&amp;M) model with a capped maximum budget of <strong>$145,000 USD</strong>. This covers all engineering, project management, and specialized architectural consulting hours required over the 14-week delivery period.</p>
          <ul style="margin-bottom:16px;padding-left:24px;line-height:1.7;color:#374151;">
            <li><strong>Milestone 1 (20% — $29,000):</strong> Project kickoff and formal SOW signing.</li>
            <li><strong>Milestone 2 (30% — $43,500):</strong> Delivery and approval of the Architecture Design Document.</li>
            <li><strong>Milestone 3 (30% — $43,500):</strong> Successful completion of User Acceptance Testing.</li>
            <li><strong>Milestone 4 (20% — $29,000):</strong> Final go-live and knowledge transfer completion.</li>
          </ul>
          <p style="margin-bottom:12px;line-height:1.7;color:#374151;"><em>Note: Cloud infrastructure consumption costs are explicitly excluded and will be billed directly to the client's corporate accounts.</em></p>`
            break
          case 'Assumptions':
            body = `<p style="margin-bottom:12px;line-height:1.7;color:#374151;">To accurately scope this engagement, the following assumptions have been made. Deviation from any of these may result in changes to the project timeline, cost, or scope, subject to the formal Change Request process.</p>
          <ul style="margin-bottom:16px;padding-left:24px;line-height:1.7;color:#374151;">
            <li>Client subject matter experts (SMEs) will be available for a minimum of 4 hours per week.</li>
            <li>The existing legacy source code is fully accessible and can be compiled without unavailable proprietary dependencies.</li>
            <li>Access credentials for all necessary environments will be provided within 3 business days of project kickoff.</li>
            <li>The client will provide timely feedback on deliverables within the agreed review windows of 5 business days.</li>
            <li>All required third-party software licenses are either already procured or will be made available by the client.</li>
          </ul>`
            break
          case 'Security':
            body = `<p style="margin-bottom:12px;line-height:1.7;color:#374151;">Security is a first-class concern throughout this engagement. All solution components will be designed, implemented, and tested in accordance with industry-standard security frameworks and the client's internal security policy.</p>
          <ul style="margin-bottom:16px;padding-left:24px;line-height:1.7;color:#374151;">
            <li><strong>Identity &amp; Access Management:</strong> Role-Based Access Control (RBAC) via Azure AD or Okta integration for Single Sign-On (SSO) across all infrastructure components.</li>
            <li><strong>Data Encryption:</strong> All data at rest encrypted using AES-256; all data in transit encrypted using TLS 1.3.</li>
            <li><strong>Vulnerability Management:</strong> Automated security scanning integrated into the CI/CD pipeline using OWASP ZAP and Snyk.</li>
            <li><strong>Compliance:</strong> Solution architecture designed to meet SOC2 Type II and ISO 27001 certification requirements.</li>
          </ul>`
            break
          case 'Architecture':
            body = `<p style="margin-bottom:12px;line-height:1.7;color:#374151;">The proposed solution architecture is designed around a highly decoupled, event-driven microservices pattern hosted on a managed Kubernetes environment. This design prioritizes fault tolerance, horizontal scalability, and strict security compliance.</p>
          <ul style="margin-bottom:16px;padding-left:24px;line-height:1.7;color:#374151;">
            <li><strong>Edge &amp; Ingress Layer:</strong> Cloud Load Balancer with WAF integration, routing through API Gateway for authentication and rate limiting.</li>
            <li><strong>Compute Layer:</strong> Auto-scaling Kubernetes clusters across multiple availability zones with dynamic workload distribution.</li>
            <li><strong>Data Layer:</strong> Managed PostgreSQL with read-replicas and distributed Redis caching for high-throughput read operations.</li>
            <li><strong>Event Streaming:</strong> Apache Kafka for reliable asynchronous communication between microservices.</li>
            <li><strong>Observability:</strong> Prometheus + Grafana for metrics, ELK stack for centralized logging, and PagerDuty for alerting.</li>
          </ul>`
            break
          case 'Acceptance Criteria':
            body = `<p style="margin-bottom:12px;line-height:1.7;color:#374151;">The project will be deemed complete and ready for final sign-off when all of the following acceptance criteria have been demonstrably met in the production environment.</p>
          <ul style="margin-bottom:16px;padding-left:24px;line-height:1.7;color:#374151;">
            <li>All backend services are deployed to the Kubernetes cluster and passing automated health checks.</li>
            <li>The API Gateway is routing traffic correctly, enforcing JWT authentication, and applying configured rate limits.</li>
            <li>The migrated cloud databases are fully synchronized and automated backup routines have been verified.</li>
            <li>Performance tests demonstrate the infrastructure handles 200% of current peak load with sub-200ms API response times.</li>
            <li>The client operations team has formally signed off on handover documentation and runbooks.</li>
          </ul>`
            break
          case 'Change Management':
            body = `<p style="margin-bottom:12px;line-height:1.7;color:#374151;">Any requests for changes to the agreed scope, timeline, or commercial terms must follow the formal Change Request (CR) process defined below. Unauthorized scope changes will not be accepted and will not form part of the delivery commitment.</p>
          <ul style="margin-bottom:16px;padding-left:24px;line-height:1.7;color:#374151;">
            <li><strong>Step 1:</strong> Client submits a Change Request Form describing the proposed change, business justification, and urgency.</li>
            <li><strong>Step 2:</strong> Delivery team assesses impact on scope, timeline, and cost within 5 business days.</li>
            <li><strong>Step 3:</strong> Impact assessment reviewed and approved by both parties' project sponsors.</li>
            <li><strong>Step 4:</strong> Approved CR formally incorporated into the amended SOW via a signed addendum.</li>
          </ul>`
            break
          case 'Support & Handover':
            body = `<p style="margin-bottom:12px;line-height:1.7;color:#374151;">Upon successful completion of the project, the delivery team will provide a structured handover to the client's internal operations team. A defined hypercare period will follow go-live to ensure operational stability and knowledge continuity.</p>
          <ul style="margin-bottom:16px;padding-left:24px;line-height:1.7;color:#374151;">
            <li><strong>Knowledge Transfer Sessions:</strong> Minimum 3 structured sessions covering infrastructure management, deployment procedures, and incident response.</li>
            <li><strong>Documentation Handover:</strong> Complete runbooks, architectural diagrams, API documentation, and disaster recovery playbooks.</li>
            <li><strong>Hypercare Period:</strong> 4 weeks of enhanced support post go-live with priority SLA (P1 — 2hr response, P2 — 8hr response).</li>
            <li><strong>Transition to BAU Support:</strong> Formal transition to client's BAU support model with clear RACI documented.</li>
          </ul>`
            break
          default:
            body = `<p style="margin-bottom:12px;line-height:1.7;color:#374151;">This is auto-generated content for the <strong>${item.title}</strong> section based on extracted requirements from your RFP document. Please review and modify as needed to ensure it meets your exact specifications.</p>`
        }
        return `<div id="sow-section-${idx}" class="sow-section" style="margin-bottom:0;">
        <h2 style="font-size:22px;font-weight:700;color:#0d212c;margin-bottom:16px;">${item.title}</h2>
        ${body}
        <div style="margin-top:16px;font-size:12px;color:#94a3b8;display:flex;align-items:center;gap:6px;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          Source: ${item.fileName}
        </div>
      </div>`
      })
      .join('\n<hr style="border:0;border-top:1px solid rgba(0,196,196,0.15);margin:32px 0;" />\n')

  const [contentHtml] = useState(() => generateHtml(tocItems))

  // ── Set initial editor content ──────────────────────────────────────────────
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML === '') {
      editorRef.current.innerHTML = contentHtml
    }
  }, [contentHtml])

  // ── Scroll-spy: update active section index ─────────────────────────────────
  useEffect(() => {
    const scrollArea = scrollAreaRef.current
    if (!scrollArea) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.id.replace('sow-section-', ''), 10)
            if (!isNaN(idx)) setActiveSectionIdx(idx)
          }
        })
      },
      { root: scrollArea, rootMargin: '-120px 0px -50% 0px', threshold: 0 }
    )
    tocItems.forEach((_, idx) => {
      const el = document.getElementById(`sow-section-${idx}`)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [tocItems.length])

  // ── Toolbar helpers ─────────────────────────────────────────────────────────
  const updateFormats = () => {
    const cmds = [
      'bold',
      'italic',
      'underline',
      'strikeThrough',
      'justifyLeft',
      'justifyCenter',
      'justifyRight',
      'insertUnorderedList',
      'insertOrderedList',
    ]
    const f: Record<string, boolean> = {}
    cmds.forEach((c) => {
      try {
        f[c] = document.queryCommandState(c)
      } catch {
        f[c] = false
      }
    })
    setActiveFormats(f)
  }

  const execCmd = (command: string, value?: string) => {
    if (command === 'fontSize') {
      document.execCommand('fontSize', false, '7')
      editorRef.current?.querySelectorAll('font[size="7"]').forEach((el) => {
        el.removeAttribute('size')
        ;(el as HTMLElement).style.fontSize = `${value}px`
      })
    } else if (command === 'createLink') {
      const url = prompt('Enter link URL:')
      if (url) document.execCommand('createLink', false, url)
    } else if (command === 'insertTable') {
      document.execCommand(
        'insertHTML',
        false,
        '<table border="1" style="width:100%;border-collapse:collapse;margin-bottom:16px;"><tr><td style="padding:8px;border:1px solid rgba(0,196,196,0.2);">Cell 1</td><td style="padding:8px;border:1px solid rgba(0,196,196,0.2);">Cell 2</td></tr><tr><td style="padding:8px;border:1px solid rgba(0,196,196,0.2);">Cell 3</td><td style="padding:8px;border:1px solid rgba(0,196,196,0.2);">Cell 4</td></tr></table>'
      )
    } else if (command === 'clearFormat') {
      document.execCommand('removeFormat', false, undefined)
    } else {
      document.execCommand(command, false, value)
    }
    updateFormats()
    editorRef.current?.focus()
    setHasUnsaved(true)
  }

  const TBtn = ({
    icon,
    command,
    value,
    title,
    isActive,
  }: {
    icon: React.ReactNode
    command: string
    value?: string
    title: string
    isActive?: boolean
  }) => (
    <button
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => execCmd(command, value)}
      style={{
        background: isActive ? 'rgba(0,196,196,0.12)' : 'transparent',
        border: 'none',
        borderRadius: 4,
        padding: '5px 7px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: isActive ? '#00a0a0' : '#475569',
        flexShrink: 0,
        lineHeight: 0,
      }}
    >
      {icon}
    </button>
  )

  const Sep = () => (
    <div
      style={{
        width: 1,
        height: 18,
        background: 'rgba(0,0,0,0.1)',
        margin: '0 6px',
        flexShrink: 0,
      }}
    />
  )

  // ── Reviewer helper ─────────────────────────────────────────────────────────
  const allMembers = SECTION_MEMBERS.map((m) => m.name)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  // ── Score color ─────────────────────────────────────────────────────────────
  const scoreColor = (s: number) => (s >= 90 ? '#16a34a' : s >= 60 ? '#d97706' : '#ef4444')
  const scoreBg = (s: number) =>
    s >= 90 ? 'rgba(22,163,74,0.1)' : s >= 60 ? 'rgba(217,119,6,0.1)' : 'rgba(239,68,68,0.1)'
  const scoreLabel = (s: number) =>
    s >= 90 ? 'High Confidence' : s >= 60 ? 'Medium Confidence' : 'Low Confidence'

  return (
    <>
      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            background: '#0d212c',
            color: '#fff',
            padding: '10px 18px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          }}
        >
          {toastMsg}
        </div>
      )}

      <div style={{ display: 'flex', height: '100%', minHeight: 0, overflow: 'hidden' }}>
        {/* ── Left TOC sidebar ──────────────────────────────────────────────── */}
        <div
          style={{
            width: 264,
            flexShrink: 0,
            borderRight: '1px solid rgba(0,196,196,0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: 'rgba(248,252,252,0.6)',
          }}
        >
          {/* Header: KPIs first */}
          <div
            style={{
              padding: '12px 14px 10px',
              borderBottom: '1px solid rgba(0,196,196,0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', gap: 8 }}>
              <div
                style={{
                  flex: 1,
                  background: 'rgba(0,196,196,0.08)',
                  borderRadius: 6,
                  padding: '6px 10px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 700, color: '#00C4C4', lineHeight: 1 }}>
                  {tocItems.length}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: '#64748b',
                    marginTop: 3,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Total Comments
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  background: 'rgba(245,158,11,0.08)',
                  borderRadius: 6,
                  padding: '6px 10px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 700, color: '#f59e0b', lineHeight: 1 }}>
                  {tocItems.filter((t) => t.status === 'Pending').length}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: '#64748b',
                    marginTop: 3,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Open Comments
                </div>
              </div>
            </div>
          </div>

          {/* Sections subheader */}
          <div
            style={{
              padding: '8px 14px 6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Sections
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>
              {tocItems.length}
            </span>
          </div>

          {/* Section list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
            {tocItems.map((item, idx) => {
              const isActive = activeSectionIdx === idx
              const isApproved = item.status === 'Approved'
              const isRejected = item.status === 'Rejected'
              const hasReviewer = item.reviewers.length > 0
              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredTocIdx(idx)}
                  onMouseLeave={() => setHoveredTocIdx(null)}
                  onClick={() => {
                    setActiveSectionIdx(idx)
                    const el = document.getElementById(`sow-section-${idx}`)
                    const scrollArea = scrollAreaRef.current
                    if (el && scrollArea) {
                      const saRect = scrollArea.getBoundingClientRect()
                      const elRect = el.getBoundingClientRect()
                      scrollArea.scrollTo({
                        top: scrollArea.scrollTop + elRect.top - saRect.top - 24,
                        behavior: 'smooth',
                      })
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 6,
                    marginBottom: 2,
                    cursor: 'pointer',
                    background: isActive ? 'rgba(0,196,196,0.1)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  {/* Left: numbered circle + title */}
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: isActive ? '#00C4C4' : 'rgba(148,163,184,0.15)',
                        border: isActive ? 'none' : '1.5px solid #cbd5e1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: isActive ? '#fff' : '#64748b',
                          lineHeight: 1,
                        }}
                      >
                        {idx + 1}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 12.5,
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? '#00a0a0' : '#374151',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.title}
                    </span>
                  </div>

                  {/* Right: score + reviewer + approved tick + menu */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    {/* Status icon */}
                    {isApproved ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#16a34a"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <title>Approved</title>
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    ) : isRejected ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <title>Rejected</title>
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                    ) : (
                      <>
                        {/* Score badge */}
                        <div
                          style={{ position: 'relative' }}
                          onMouseEnter={() => setHoveredScoreIdx(idx)}
                          onMouseLeave={() => setHoveredScoreIdx(null)}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '2px 7px',
                              borderRadius: 12,
                              background: scoreBg(item.score),
                              color: scoreColor(item.score),
                            }}
                          >
                            {item.score}%
                          </span>
                          {hoveredScoreIdx === idx && (
                            <div
                              style={{
                                position: 'absolute',
                                top: 'calc(100% + 6px)',
                                right: 0,
                                background: '#fff',
                                border: '1px solid rgba(0,196,196,0.2)',
                                borderRadius: 8,
                                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                                zIndex: 50,
                                width: 180,
                                padding: 10,
                                fontSize: 11,
                                color: '#374151',
                                lineHeight: 1.5,
                              }}
                            >
                              <div
                                style={{
                                  fontWeight: 700,
                                  color: scoreColor(item.score),
                                  marginBottom: 3,
                                }}
                              >
                                {scoreLabel(item.score)}
                              </div>
                              {item.score >= 90
                                ? 'Strong alignment with RFP requirements and thorough detail.'
                                : item.score >= 60
                                  ? 'Partial alignment with RFP. Some requirements may need elaboration.'
                                  : 'Weak alignment or missing critical details. Thorough review required.'}
                            </div>
                          )}
                        </div>

                        {/* Reviewer icon */}
                        {hasReviewer ? (
                          <div
                            style={{ position: 'relative' }}
                            onMouseEnter={() => setHoveredReviewerIdx(idx)}
                            onMouseLeave={() => setHoveredReviewerIdx(null)}
                          >
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#94a3b8"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              style={{ cursor: 'default' }}
                            >
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                            {hoveredReviewerIdx === idx && (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: 'calc(100% + 6px)',
                                  right: 0,
                                  background: '#fff',
                                  border: '1px solid rgba(0,196,196,0.2)',
                                  borderRadius: 8,
                                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                                  zIndex: 50,
                                  padding: '8px 12px',
                                  fontSize: 12,
                                  color: '#374151',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: 11,
                                    color: '#94a3b8',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    marginBottom: 2,
                                  }}
                                >
                                  Reviewer{item.reviewers.length > 1 ? 's' : ''}
                                </div>
                                {item.reviewers.join(', ')}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div
                            title="Assign Reviewer"
                            onClick={(e) => {
                              e.stopPropagation()
                              setAddReviewerIdx(idx)
                              setOpenMenuIdx(null)
                            }}
                            style={{
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              padding: 2,
                              borderRadius: 4,
                              color: '#00C4C4',
                            }}
                          >
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                              <circle cx="8.5" cy="7" r="4" />
                              <line x1="20" y1="8" x2="20" y2="14" />
                              <line x1="23" y1="11" x2="17" y2="11" />
                            </svg>
                          </div>
                        )}
                      </>
                    )}

                    {/* ⋯ menu */}
                    {(hoveredTocIdx === idx || openMenuIdx === idx) && (
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setOpenMenuIdx(openMenuIdx === idx ? null : idx)
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '2px 3px',
                            borderRadius: 4,
                            color: '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="5" r="1.5" />
                            <circle cx="12" cy="12" r="1.5" />
                            <circle cx="12" cy="19" r="1.5" />
                          </svg>
                        </button>
                        {openMenuIdx === idx && (
                          <>
                            <div
                              style={{ position: 'fixed', inset: 0, zIndex: 49 }}
                              onClick={() => setOpenMenuIdx(null)}
                            />
                            <div
                              style={{
                                position: 'absolute',
                                top: 'calc(100% + 4px)',
                                right: 0,
                                background: '#fff',
                                border: '1px solid rgba(0,196,196,0.2)',
                                borderRadius: 8,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                                zIndex: 50,
                                minWidth: 200,
                                padding: 6,
                              }}
                            >
                              {!isApproved && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setAddReviewerIdx(idx)
                                    setOpenMenuIdx(null)
                                  }}
                                  style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    padding: '9px 12px',
                                    background: 'transparent',
                                    border: 'none',
                                    borderRadius: 4,
                                    cursor: 'pointer',
                                    fontSize: 13,
                                    color: '#374151',
                                    textAlign: 'left',
                                  }}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.background = 'rgba(0,196,196,0.07)')
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.background = 'transparent')
                                  }
                                >
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="8.5" cy="7" r="4" />
                                    <line x1="20" y1="8" x2="20" y2="14" />
                                    <line x1="23" y1="11" x2="17" y2="11" />
                                  </svg>
                                  Add Reviewer
                                </button>
                              )}
                              {!isApproved && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setApprovePopupIdx(idx)
                                    setOpenMenuIdx(null)
                                  }}
                                  style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    padding: '9px 12px',
                                    background: 'transparent',
                                    border: 'none',
                                    borderRadius: 4,
                                    cursor: 'pointer',
                                    fontSize: 13,
                                    color: '#374151',
                                    textAlign: 'left',
                                  }}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.background = 'rgba(0,196,196,0.07)')
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.background = 'transparent')
                                  }
                                >
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                  Approve
                                </button>
                              )}
                              {!isRejected && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setRejectPopupIdx(idx)
                                    setOpenMenuIdx(null)
                                  }}
                                  style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    padding: '9px 12px',
                                    background: 'transparent',
                                    border: 'none',
                                    borderRadius: 4,
                                    cursor: 'pointer',
                                    fontSize: 13,
                                    color: '#ef4444',
                                    textAlign: 'left',
                                  }}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.background = 'rgba(239,68,68,0.06)')
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.background = 'transparent')
                                  }
                                >
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <polyline points="9 14 4 9 9 4" />
                                    <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
                                  </svg>
                                  Rework Required
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Right editor area ──────────────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Toolbar */}
          <div
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 0,
              padding: '5px 12px',
              borderBottom: '1px solid rgba(0,196,196,0.12)',
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(6px)',
              overflowX: 'auto',
              flexWrap: 'nowrap',
            }}
          >
            {/* Undo / Redo */}
            <TBtn
              title="Undo"
              command="undo"
              icon={
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 14 4 9 9 4" />
                  <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
                </svg>
              }
            />
            <TBtn
              title="Redo"
              command="redo"
              icon={
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 14 20 9 15 4" />
                  <path d="M4 20v-7a4 4 0 0 1 4-4h12" />
                </svg>
              }
            />
            <Sep />
            {/* Size / Style selects */}
            <select
              onMouseDown={(e) => e.stopPropagation()}
              onChange={(e) => execCmd('fontSize', e.target.value)}
              defaultValue="15"
              title="Font Size"
              style={{
                fontSize: 12,
                padding: '3px 6px',
                border: '1px solid rgba(0,0,0,0.13)',
                borderRadius: 4,
                background: '#fff',
                color: '#475569',
                cursor: 'pointer',
                marginRight: 4,
              }}
            >
              <option value="15" disabled hidden>
                Size
              </option>
              {[8, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              onMouseDown={(e) => e.stopPropagation()}
              onChange={(e) => execCmd('formatBlock', e.target.value)}
              defaultValue="P"
              title="Paragraph Style"
              style={{
                fontSize: 12,
                padding: '3px 6px',
                border: '1px solid rgba(0,0,0,0.13)',
                borderRadius: 4,
                background: '#fff',
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              <option value="P">Normal</option>
              <option value="H1">Heading 1</option>
              <option value="H2">Heading 2</option>
              <option value="H3">Heading 3</option>
              <option value="H4">Heading 4</option>
            </select>
            <Sep />
            {/* Lists + indent */}
            <TBtn
              title="Bullet List"
              command="insertUnorderedList"
              isActive={activeFormats['insertUnorderedList']}
              icon={
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <circle cx="3" cy="6" r="1" fill="currentColor" stroke="none" />
                  <circle cx="3" cy="12" r="1" fill="currentColor" stroke="none" />
                  <circle cx="3" cy="18" r="1" fill="currentColor" stroke="none" />
                </svg>
              }
            />
            <TBtn
              title="Numbered List"
              command="insertOrderedList"
              isActive={activeFormats['insertOrderedList']}
              icon={
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="10" y1="6" x2="21" y2="6" />
                  <line x1="10" y1="12" x2="21" y2="12" />
                  <line x1="10" y1="18" x2="21" y2="18" />
                  <path d="M4 6h1v4" stroke="currentColor" />
                  <path d="M4 10h2" stroke="currentColor" />
                  <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" stroke="currentColor" />
                </svg>
              }
            />
            <TBtn
              title="Indent"
              command="indent"
              icon={
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <polyline points="7 10 11 14 7 18" />
                  <line x1="11" y1="14" x2="21" y2="14" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              }
            />
            <TBtn
              title="Outdent"
              command="outdent"
              icon={
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <polyline points="11 10 7 14 11 18" />
                  <line x1="7" y1="14" x2="21" y2="14" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              }
            />
            <Sep />
            {/* Bold / Italic / Underline / Strikethrough */}
            <TBtn
              title="Bold"
              command="bold"
              isActive={activeFormats['bold']}
              icon={
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
                  <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
                </svg>
              }
            />
            <TBtn
              title="Italic"
              command="italic"
              isActive={activeFormats['italic']}
              icon={
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="19" y1="4" x2="10" y2="4" />
                  <line x1="14" y1="20" x2="5" y2="20" />
                  <line x1="15" y1="4" x2="9" y2="20" />
                </svg>
              }
            />
            <TBtn
              title="Underline"
              command="underline"
              isActive={activeFormats['underline']}
              icon={
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
                  <line x1="4" y1="21" x2="20" y2="21" />
                </svg>
              }
            />
            <TBtn
              title="Strikethrough"
              command="strikeThrough"
              isActive={activeFormats['strikeThrough']}
              icon={
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <path d="M16 6C16 6 14.5 4 12 4s-5 1.5-5 4c0 1.6 1 2.7 2.5 3.5" />
                  <path d="M8 18c0 0 1.5 2 4 2s5-1.5 5-4c0-1.6-1-2.7-2.5-3.5" />
                </svg>
              }
            />
            <Sep />
            {/* Color pickers */}
            <div
              title="Text Color"
              style={{ display: 'flex', alignItems: 'center', padding: '2px' }}
            >
              <input
                type="color"
                defaultValue="#1E293B"
                onMouseDown={(e) => e.stopPropagation()}
                onChange={(e) => execCmd('foreColor', e.target.value)}
                style={{
                  width: 24,
                  height: 24,
                  border: '1px solid rgba(0,0,0,0.13)',
                  borderRadius: 4,
                  padding: 2,
                  cursor: 'pointer',
                }}
              />
            </div>
            <div
              title="Highlight Color"
              style={{ display: 'flex', alignItems: 'center', padding: '2px', marginRight: 2 }}
            >
              <input
                type="color"
                defaultValue="#FFFFFF"
                onMouseDown={(e) => e.stopPropagation()}
                onChange={(e) => execCmd('hiliteColor', e.target.value)}
                style={{
                  width: 24,
                  height: 24,
                  border: '1px solid rgba(0,0,0,0.13)',
                  borderRadius: 4,
                  padding: 2,
                  cursor: 'pointer',
                }}
              />
            </div>
            <Sep />
            {/* Alignment */}
            <TBtn
              title="Align Left"
              command="justifyLeft"
              isActive={activeFormats['justifyLeft']}
              icon={
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="15" y2="12" />
                  <line x1="3" y1="18" x2="18" y2="18" />
                </svg>
              }
            />
            <TBtn
              title="Align Center"
              command="justifyCenter"
              isActive={activeFormats['justifyCenter']}
              icon={
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="6" y1="12" x2="18" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
              }
            />
            <TBtn
              title="Align Right"
              command="justifyRight"
              isActive={activeFormats['justifyRight']}
              icon={
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="9" y1="12" x2="21" y2="12" />
                  <line x1="6" y1="18" x2="21" y2="18" />
                </svg>
              }
            />
            <TBtn
              title="Justify"
              command="justifyFull"
              icon={
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              }
            />
            <Sep />
            {/* Link / Table */}
            <TBtn
              title="Insert Link"
              command="createLink"
              icon={
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              }
            />
            <TBtn
              title="Insert Table"
              command="insertTable"
              icon={
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="3" y1="15" x2="21" y2="15" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                  <line x1="15" y1="3" x2="15" y2="21" />
                </svg>
              }
            />
            <Sep />
            {/* Clear formatting */}
            <TBtn
              title="Clear Formatting"
              command="clearFormat"
              icon={
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 7h16" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                  <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12" />
                  <path d="M9 7V4h6v3" />
                </svg>
              }
            />
            <div style={{ flex: 1 }} />
            {/* Save */}
            <button
              onClick={() => {
                setHasUnsaved(false)
                showToast('Section saved successfully.')
              }}
              disabled={!hasUnsaved}
              style={{
                padding: '5px 14px',
                background: hasUnsaved ? '#0d212c' : '#cbd5e1',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: hasUnsaved ? 'pointer' : 'not-allowed',
                fontSize: 12.5,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                flexShrink: 0,
                transition: 'background 0.15s',
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Save
            </button>
          </div>

          {/* Scroll area */}
          <div
            ref={scrollAreaRef}
            id="sow-editor-scroll-area"
            style={{
              flex: 1,
              overflowY: 'auto',
              background: '#f1f5f9',
              padding: '28px 20px 64px',
              position: 'relative',
            }}
          >
            {/* Document card */}
            <div
              style={{
                margin: '0 auto',
                maxWidth: 820,
                background: '#fff',
                minHeight: 900,
                borderRadius: 4,
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                padding: '56px 64px',
              }}
            >
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={() => {
                  updateFormats()
                  setHasUnsaved(true)
                }}
                onKeyUp={updateFormats}
                onMouseUp={updateFormats}
                style={{
                  outline: 'none',
                  fontSize: 14.5,
                  lineHeight: 1.75,
                  color: '#374151',
                  minHeight: 600,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Approve popup ──────────────────────────────────────────────────────── */}
      {approvePopupIdx !== null && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(13,33,44,0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setApprovePopupIdx(null)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 14,
              width: 400,
              boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{ padding: '22px 28px 18px', borderBottom: '1px solid rgba(0,196,196,0.12)' }}
            >
              <div style={{ fontWeight: 700, fontSize: 16, color: '#0d212c' }}>Approve Section</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                &quot;{tocItems[approvePopupIdx]?.title}&quot;
              </div>
            </div>
            <div style={{ padding: '18px 28px' }}>
              <label
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: '#374151',
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                Comment (optional)
              </label>
              <textarea
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                placeholder="Looks good, approved."
                style={{
                  width: '100%',
                  minHeight: 80,
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(0,196,196,0.25)',
                  fontSize: 13,
                  resize: 'none',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <div
              style={{
                padding: '12px 28px 20px',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
              }}
            >
              <button
                onClick={() => {
                  setApprovePopupIdx(null)
                  setApprovalComment('')
                }}
                style={{
                  padding: '8px 18px',
                  background: 'transparent',
                  border: '1px solid rgba(0,196,196,0.25)',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setTocItems((prev) =>
                    prev.map((t, i) =>
                      i === approvePopupIdx ? { ...t, status: 'Approved' as const } : t
                    )
                  )
                  setApprovePopupIdx(null)
                  setApprovalComment('')
                  showToast('Section approved.')
                }}
                style={{
                  padding: '8px 18px',
                  background: '#16a34a',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#fff',
                }}
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject popup ───────────────────────────────────────────────────────── */}
      {rejectPopupIdx !== null && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(13,33,44,0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setRejectPopupIdx(null)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 14,
              width: 400,
              boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{ padding: '22px 28px 18px', borderBottom: '1px solid rgba(239,68,68,0.15)' }}
            >
              <div style={{ fontWeight: 700, fontSize: 16, color: '#0d212c' }}>Rework Required</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                &quot;{tocItems[rejectPopupIdx]?.title}&quot;
              </div>
            </div>
            <div style={{ padding: '18px 28px' }}>
              <label
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: '#374151',
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                Feedback for rework
              </label>
              <textarea
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                placeholder="Please clarify the scope boundaries and update…"
                style={{
                  width: '100%',
                  minHeight: 80,
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(239,68,68,0.25)',
                  fontSize: 13,
                  resize: 'none',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <div
              style={{
                padding: '12px 28px 20px',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
              }}
            >
              <button
                onClick={() => {
                  setRejectPopupIdx(null)
                  setApprovalComment('')
                }}
                style={{
                  padding: '8px 18px',
                  background: 'transparent',
                  border: '1px solid rgba(0,196,196,0.25)',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setTocItems((prev) =>
                    prev.map((t, i) =>
                      i === rejectPopupIdx ? { ...t, status: 'Rejected' as const } : t
                    )
                  )
                  setRejectPopupIdx(null)
                  setApprovalComment('')
                  showToast('Section marked for rework.')
                }}
                style={{
                  padding: '8px 18px',
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#fff',
                }}
              >
                Send for Rework
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Reviewer popup ─────────────────────────────────────────────────── */}
      {addReviewerIdx !== null && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(13,33,44,0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => {
            setAddReviewerIdx(null)
            setReviewerSearch('')
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 14,
              width: 380,
              boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{ padding: '22px 28px 16px', borderBottom: '1px solid rgba(0,196,196,0.12)' }}
            >
              <div style={{ fontWeight: 700, fontSize: 16, color: '#0d212c' }}>Assign Reviewer</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                &quot;{tocItems[addReviewerIdx]?.title}&quot;
              </div>
            </div>
            <div style={{ padding: '16px 28px 20px' }}>
              {allMembers.map((name) => {
                const already = tocItems[addReviewerIdx]?.reviewers.includes(name)
                const matches = name.toLowerCase().includes(reviewerSearch.toLowerCase())
                if (!matches) return null
                return (
                  <label
                    key={name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 0',
                      cursor: 'pointer',
                      fontSize: 13,
                      color: '#374151',
                    }}
                  >
                    <input
                      type="checkbox"
                      defaultChecked={already}
                      onChange={(e) => {
                        setTocItems((prev) =>
                          prev.map((t, i) => {
                            if (i !== addReviewerIdx) return t
                            return {
                              ...t,
                              reviewers: e.target.checked
                                ? [...t.reviewers.filter((r) => r !== name), name]
                                : t.reviewers.filter((r) => r !== name),
                            }
                          })
                        )
                      }}
                      style={{ accentColor: '#00C4C4', width: 15, height: 15 }}
                    />
                    {name}
                  </label>
                )
              })}
            </div>
            <div
              style={{
                padding: '0 28px 20px',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
              }}
            >
              <button
                onClick={() => {
                  setAddReviewerIdx(null)
                  setReviewerSearch('')
                }}
                style={{
                  padding: '8px 18px',
                  background: 'transparent',
                  border: '1px solid rgba(0,196,196,0.25)',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setAddReviewerIdx(null)
                  setReviewerSearch('')
                  showToast('Reviewer assigned.')
                }}
                style={{
                  padding: '8px 18px',
                  background: '#0d212c',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#fff',
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ── Generating Animation ────────────────────────────────────────────────── */

function GeneratingAnimation() {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        gap: 28,
      }}
    >
      <style>{`
        @keyframes sow-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes sow-pulse{0%,100%{opacity:.25;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}
        @keyframes sow-dot{0%,80%,100%{opacity:.2;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}
        @keyframes sow-shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
        @keyframes sow-line-grow{from{width:0}to{width:100%}}
      `}</style>
      <div
        style={{
          position: 'relative',
          width: 140,
          height: 160,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ animation: 'sow-float 2.8s ease-in-out infinite' }}>
          <svg width="100" height="130" viewBox="0 0 100 130" fill="none">
            <rect
              x="12"
              y="8"
              width="68"
              height="96"
              rx="10"
              fill="rgba(0,196,196,0.08)"
              stroke="#00C4C4"
              strokeWidth="2"
            />
            <rect x="22" y="24" width="48" height="5" rx="2.5" fill="rgba(0,196,196,0.4)" />
            <rect x="22" y="36" width="40" height="4" rx="2" fill="rgba(0,196,196,0.25)" />
            <rect x="22" y="46" width="44" height="4" rx="2" fill="rgba(0,196,196,0.22)" />
            <rect x="22" y="56" width="32" height="4" rx="2" fill="rgba(0,196,196,0.18)" />
            <rect
              x="22"
              y="70"
              width="54"
              height="24"
              rx="4"
              fill="rgba(0,196,196,0.06)"
              stroke="rgba(0,196,196,0.25)"
              strokeWidth="1"
            />
            <line x1="22" y1="82" x2="76" y2="82" stroke="rgba(0,196,196,0.2)" strokeWidth="1" />
            <line x1="40" y1="70" x2="40" y2="94" stroke="rgba(0,196,196,0.2)" strokeWidth="1" />
            <line x1="58" y1="70" x2="58" y2="94" stroke="rgba(0,196,196,0.2)" strokeWidth="1" />
          </svg>
        </div>
        <div
          style={{
            position: 'absolute',
            top: 6,
            right: 14,
            animation: 'sow-pulse 1.6s ease-in-out infinite',
            animationDelay: '0s',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M9 1l2 6h6l-5 3.5 2 6L9 13l-5 3.5 2-6L1 7h6z" fill="#00C4C4" opacity=".7" />
          </svg>
        </div>
        <div
          style={{
            position: 'absolute',
            top: 28,
            left: 4,
            animation: 'sow-pulse 2s ease-in-out infinite',
            animationDelay: '.5s',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path
              d="M6 .5l1.5 4H12L8.5 7l1.5 4L6 8.5 2 11l1.5-4L0 4.5h4.5z"
              fill="#7ff0f0"
              opacity=".6"
            />
          </svg>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            right: 8,
            animation: 'sow-pulse 1.8s ease-in-out infinite',
            animationDelay: '.9s',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14">
            <path
              d="M7 .5l1.8 5H13L9 8l1.8 5L7 10 3.2 13 5 8 1 5.5h4.2z"
              fill="#00a0a0"
              opacity=".5"
            />
          </svg>
        </div>
      </div>
      <div style={{ textAlign: 'center', maxWidth: 380 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#0d212c', marginBottom: 10 }}>
          Generating your SOW Draft
        </div>
        <div style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.65, marginBottom: 18 }}>
          Our AI is analysing your structure, assumptions, and responses to craft a complete
          Statement of Work.
        </div>
        <div style={{ display: 'flex', gap: 7, justifyContent: 'center', marginBottom: 12 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                background: '#00C4C4',
                animation: 'sow-dot 1.4s ease-in-out infinite',
                animationDelay: `${i * 0.22}s`,
              }}
            />
          ))}
        </div>
        <div style={{ fontSize: 11, color: '#94a3b8' }}>This usually takes just a few seconds…</div>
      </div>
    </div>
  )
}

/* ── Shimmer Skeleton ────────────────────────────────────────────────────── */

function ShimmerDraft() {
  const sk: React.CSSProperties = {
    background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)',
    backgroundSize: '800px 100%',
    animation: 'sow-shimmer 1.5s infinite',
    borderRadius: 5,
  }
  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
      <div
        style={{
          width: 220,
          flexShrink: 0,
          borderRight: '1px solid rgba(0,196,196,0.1)',
          padding: '16px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div style={{ ...sk, height: 26, borderRadius: 8, marginBottom: 4 }} />
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} style={{ ...sk, height: 26, borderRadius: 8 }} />
        ))}
      </div>
      <div
        style={{ flex: 1, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <div
          style={{
            paddingBottom: 20,
            borderBottom: '2px solid #f1f5f9',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ ...sk, height: 28, width: '50%' }} />
          <div style={{ ...sk, height: 14, width: '65%' }} />
          <div style={{ ...sk, height: 11, width: '42%' }} />
        </div>
        {[1, 2].map((s) => (
          <div
            key={s}
            style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 12 }}
          >
            <div style={{ ...sk, height: 20, width: '38%', borderRadius: 8 }} />
            <div style={{ ...sk, height: 11, width: '94%' }} />
            <div style={{ ...sk, height: 11, width: '87%' }} />
            <div style={{ ...sk, height: 11, width: '76%' }} />
            <div
              style={{
                marginTop: 8,
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                overflow: 'hidden',
              }}
            >
              {[0, 1, 2, 3].map((r) => (
                <div
                  key={r}
                  style={{
                    display: 'flex',
                    gap: 16,
                    padding: '9px 14px',
                    background: r === 0 ? '#f8fafc' : '#fff',
                    borderBottom: r < 3 ? '1px solid #f1f5f9' : 'none',
                  }}
                >
                  {[1, 2, 3].map((c) => (
                    <div key={c} style={{ ...sk, height: 9, flex: 1 }} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Send for Review Modal ───────────────────────────────────────────────── */

const REVIEWERS_DEFAULT = [
  { id: 'r1', name: 'Rohan Mehta', role: 'Technical Lead', initials: 'RM', color: '#8b5cf6' },
  { id: 'r2', name: 'Priya Sharma', role: 'Delivery Manager', initials: 'PS', color: '#f59e0b' },
  { id: 'r3', name: 'Karan Bose', role: 'PMO Analyst', initials: 'KB', color: '#ef4444' },
]

function SendForReviewModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void
  onConfirm: () => void
}) {
  const [reviewers, setReviewers] = useState(REVIEWERS_DEFAULT)
  const [newEmail, setNewEmail] = useState('')
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 500,
        background: 'rgba(0,0,0,0.38)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 18,
          padding: '20px 16px 16px',
          width: 440,
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: '#f1f5f9',
            border: 'none',
            borderRadius: 8,
            width: 28,
            height: 28,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            color: '#64748b',
          }}
        >
          ✕
        </button>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#0d212c', marginBottom: 4 }}>
          Send for Review
        </div>
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
          The following reviewers will receive this SOW for their input.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
          {reviewers.map((r) => (
            <div
              key={r.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: r.color,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {r.initials}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0d212c' }}>{r.name}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{r.role}</div>
              </div>
              <button
                onClick={() => setReviewers((prev) => prev.filter((x) => x.id !== r.id))}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  fontSize: 14,
                  padding: '2px 4px',
                }}
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
          <input
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newEmail.trim()) {
                setReviewers((prev) => [
                  ...prev,
                  {
                    id: `r${Date.now()}`,
                    name: newEmail.trim(),
                    role: 'Reviewer',
                    initials: newEmail.slice(0, 2).toUpperCase(),
                    color: '#00C4C4',
                  },
                ])
                setNewEmail('')
              }
            }}
            placeholder="Add reviewer by name or email…"
            style={{
              flex: 1,
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 13,
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          <button
            onClick={() => {
              if (!newEmail.trim()) return
              setReviewers((prev) => [
                ...prev,
                {
                  id: `r${Date.now()}`,
                  name: newEmail.trim(),
                  role: 'Reviewer',
                  initials: newEmail.slice(0, 2).toUpperCase(),
                  color: '#00C4C4',
                },
              ])
              setNewEmail('')
            }}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: '1.5px solid rgba(0,196,196,0.4)',
              background: 'rgba(0,196,196,0.08)',
              fontSize: 13,
              fontWeight: 700,
              color: '#007a7a',
              cursor: 'pointer',
            }}
          >
            Add
          </button>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 18px',
              borderRadius: 9,
              border: '1px solid #e2e8f0',
              background: '#fff',
              fontSize: 13,
              fontWeight: 600,
              color: '#64748b',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '9px 20px',
              borderRadius: 9,
              border: 'none',
              background: '#00C4C4',
              fontSize: 13,
              fontWeight: 700,
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Confirm &amp; Send
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Locked placeholder ──────────────────────────────────────────────────── */

function LockedTabState({ title, description }: { title: string; description: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 320,
        gap: 16,
        padding: '48px 24px',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="10" width="16" height="12" rx="2.5" stroke="#94a3b8" strokeWidth="1.8" />
          <path
            d="M8 10V7a4 4 0 0 1 8 0v3"
            stroke="#94a3b8"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="12" cy="16" r="1.5" fill="#94a3b8" />
        </svg>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#0d212c', marginBottom: 8 }}>
          {title}
        </div>
        <div style={{ fontSize: 14, color: '#64748b', maxWidth: 380, lineHeight: 1.6 }}>
          {description}
        </div>
      </div>
    </div>
  )
}

/* ── Main component ──────────────────────────────────────────────────────── */

export function SOWDetailScreen({
  sowName = 'Meridian Healthcare — Procurement Platform',
  sowStatus = 'In Progress',
  uploadedFiles = [],
  onBack,
  className,
  showGenerateDraft = false,
  sowVariant = 'v1',
}: SOWDetailScreenProps) {
  type DraftGenState = 'idle' | 'generating' | 'shimmer' | 'ready'
  const [activeTab, setActiveTab] = useState<SOWTab>(sowVariant === 'v2' ? 'structure' : 'overview')
  const [isStructureUnlocked, setIsStructureUnlocked] = useState(sowVariant === 'v2')
  const [isDraftUnlocked, setIsDraftUnlocked] = useState(false)
  const [isFormReady, setIsFormReady] = useState(false)
  const [hasInvitedParticipants, setHasInvitedParticipants] = useState(false)
  const [draftGenState, setDraftGenState] = useState<DraftGenState>('idle')
  const [inviteToast, setInviteToast] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewSentToast, setReviewSentToast] = useState(false)
  const inviteToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reviewToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showInviteToast = () => {
    setInviteToast(true)
    if (inviteToastTimer.current) clearTimeout(inviteToastTimer.current)
    inviteToastTimer.current = setTimeout(() => setInviteToast(false), 4000)
  }

  const handleGenerateDraft = () => {
    setIsDraftUnlocked(true)
    setActiveTab('sow-draft')
    setDraftGenState('generating')
    setTimeout(() => {
      setDraftGenState('shimmer')
      setTimeout(() => {
        setDraftGenState('ready')
      }, 2000)
    }, 3000)
  }

  const handleSendForReview = () => {
    setShowReviewModal(false)
    setReviewSentToast(true)
    if (reviewToastTimer.current) clearTimeout(reviewToastTimer.current)
    reviewToastTimer.current = setTimeout(() => setReviewSentToast(false), 4000)
  }

  const tabs = buildTabs(isStructureUnlocked, isDraftUnlocked)

  const handleFormSubmit = () => {
    setIsStructureUnlocked(true)
    setActiveTab('structure')
  }

  return (
    <>
      {/* ── Sticky header: breadcrumb + title + tabs ── */}
      {/* Invite success toast */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: '50%',
          transform: `translateX(-50%) translateY(${inviteToast ? 0 : -80}px)`,
          opacity: inviteToast ? 1 : 0,
          transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease',
          zIndex: 300,
          pointerEvents: inviteToast ? 'auto' : 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 20px',
          borderRadius: 12,
          background: '#16a34a',
          color: '#fff',
          fontSize: 13,
          fontWeight: 600,
          boxShadow: '0 8px 32px rgba(22,163,74,0.35)',
          whiteSpace: 'nowrap',
        }}
      >
        <svg
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M22 2L11 13" />
          <path d="M22 2L15 22 11 13 2 9l20-7z" />
        </svg>
        Participants invited successfully!
        <button
          onClick={() => setInviteToast(false)}
          style={{
            marginLeft: 8,
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: 6,
            color: '#fff',
            cursor: 'pointer',
            padding: '2px 7px',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          ✕
        </button>
      </div>

      {/* Header area */}
      <div style={{ flexShrink: 0, padding: '8px 0 0' }}>
        {/* Single-line header: glass back button + title + status badge (no background behind title) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          {/* Back button — glass-morphic box */}
          <button
            onClick={onBack}
            title="Back to My SOWs"
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              border: '1px solid rgba(255,255,255,0.6)',
              background: 'rgba(255,255,255,0.55)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'background 0.12s',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.8)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.55)'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 3L5 8l5 5"
                stroke="#0d212c"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {/* Title — directly on transparent background */}
          <h1
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 700,
              color: '#0d212c',
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {sowName}
          </h1>
          {/* Status badge — right after title */}
          <span
            style={{
              padding: '3px 10px',
              borderRadius: 20,
              fontSize: 11.5,
              fontWeight: 600,
              background: STATUS_BG[sowStatus] ?? '#f1f5f9',
              color: STATUS_TEXT[sowStatus] ?? '#64748b',
              flexShrink: 0,
            }}
          >
            {sowStatus}
          </span>
          <div style={{ flex: 1 }} />
        </div>
      </div>
      {/* end header area */}

      {/* ── Glass box: tab strip + content ── */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          margin: '0 0 0',
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border: '1px solid rgba(255,255,255,0.75)',
          borderRadius: 16,
          boxShadow: '0 4px 24px rgba(0,196,196,0.08), 0 1px 0 rgba(255,255,255,0.8) inset',
          overflow: activeTab === 'structure' ? 'hidden' : 'auto',
        }}
      >
        {/* Tab strip — top section of glass box */}
        <div
          style={{
            flexShrink: 0,
            background: 'rgba(255,255,255,0.35)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderBottom: '1px solid rgba(0,196,196,0.13)',
            borderRadius: '16px 16px 0 0',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 0,
              alignItems: 'center',
              borderBottom: 'none',
              padding: '4px 8px 0',
            }}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => !tab.locked && setActiveTab(tab.id)}
                  style={{
                    padding: '12px 18px',
                    background: 'none',
                    border: 'none',
                    borderBottom: isActive ? '2.5px solid #00C4C4' : '2.5px solid transparent',
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 500,
                    cursor: tab.locked ? 'not-allowed' : 'pointer',
                    color: isActive ? '#00a0a0' : tab.locked ? 'rgba(0,0,0,0.25)' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    transition: 'color 0.15s',
                    marginBottom: -1,
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={(e) => {
                    if (!tab.locked && !isActive)
                      (e.currentTarget as HTMLButtonElement).style.color = '#0d212c'
                  }}
                  onMouseLeave={(e) => {
                    if (!tab.locked && !isActive)
                      (e.currentTarget as HTMLButtonElement).style.color = '#64748b'
                  }}
                >
                  {tab.label}
                  {tab.locked && <LockIcon />}
                </button>
              )
            })}
            {/* CTA pinned to the right of the tab strip */}
            <div style={{ marginLeft: 'auto', paddingRight: 10 }}>
              {showGenerateDraft ? (
                draftGenState === 'ready' ? (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 14px',
                      borderRadius: 8,
                      border: '1.5px solid rgba(0,196,196,0.35)',
                      background: 'rgba(0,196,196,0.07)',
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#00a0a0',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLButtonElement).style.background =
                        'rgba(0,196,196,0.14)'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLButtonElement).style.background =
                        'rgba(0,196,196,0.07)'
                    }}
                  >
                    <svg
                      width="13"
                      height="13"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <path d="M22 2L11 13" />
                      <path d="M22 2L15 22 11 13 2 9l20-7z" />
                    </svg>
                    Send for Review
                  </button>
                ) : draftGenState === 'generating' || draftGenState === 'shimmer' ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 14px',
                      borderRadius: 8,
                      border: '1.5px solid rgba(0,196,196,0.2)',
                      background: 'rgba(0,196,196,0.05)',
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#94a3b8',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="#00C4C4"
                        strokeWidth="2"
                        strokeDasharray="40 20"
                      >
                        <animateTransform
                          attributeName="transform"
                          type="rotate"
                          from="0 12 12"
                          to="360 12 12"
                          dur="1s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    </svg>
                    Generating…
                  </div>
                ) : (
                  <button
                    onClick={handleGenerateDraft}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 14px',
                      borderRadius: 8,
                      border: '1.5px solid rgba(0,196,196,0.5)',
                      background: 'rgba(0,196,196,0.12)',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#007a7a',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLButtonElement).style.background =
                        'rgba(0,196,196,0.22)'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLButtonElement).style.background =
                        'rgba(0,196,196,0.12)'
                    }}
                  >
                    <svg
                      width="13"
                      height="13"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    Generate Draft
                  </button>
                )
              ) : activeTab === 'form' && isFormReady ? (
                <button
                  onClick={handleFormSubmit}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    borderRadius: 8,
                    border: '1.5px solid rgba(0,196,196,0.35)',
                    background: 'rgba(0,196,196,0.07)',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#00a0a0',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.background =
                      'rgba(0,196,196,0.14)'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.background =
                      'rgba(0,196,196,0.07)'
                  }}
                >
                  Submit Form
                  <svg
                    width="13"
                    height="13"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5l7 7-7 7" />
                  </svg>
                </button>
              ) : activeTab === 'structure' ? (
                !hasInvitedParticipants ? (
                  <button
                    onClick={() => {
                      showInviteToast()
                      setHasInvitedParticipants(true)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 14px',
                      borderRadius: 8,
                      border: '1.5px solid rgba(0,196,196,0.5)',
                      background: 'rgba(0,196,196,0.12)',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#007a7a',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLButtonElement).style.background =
                        'rgba(0,196,196,0.22)'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLButtonElement).style.background =
                        'rgba(0,196,196,0.12)'
                    }}
                  >
                    <svg
                      width="13"
                      height="13"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="8.5" cy="7" r="4" />
                      <line x1="20" y1="8" x2="20" y2="14" />
                      <line x1="17" y1="11" x2="23" y2="11" />
                    </svg>
                    Invite Participants
                  </button>
                ) : (
                  <button
                    onClick={handleGenerateDraft}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 14px',
                      borderRadius: 8,
                      border: '1.5px solid rgba(0,196,196,0.5)',
                      background: 'rgba(0,196,196,0.12)',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#007a7a',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLButtonElement).style.background =
                        'rgba(0,196,196,0.22)'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLButtonElement).style.background =
                        'rgba(0,196,196,0.12)'
                    }}
                  >
                    <svg
                      width="13"
                      height="13"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    Generate Draft
                  </button>
                )
              ) : null}
            </div>
          </div>
        </div>
        {/* end tab strip */}

        {/* Tab content — fills the rest of the glass box */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          {/* Generating overlay */}
          {draftGenState === 'generating' && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 50,
                background: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <GeneratingAnimation />
            </div>
          )}
          {activeTab === 'overview' && <OverviewTab files={uploadedFiles} />}
          {activeTab === 'form' && (
            <FormTab
              files={uploadedFiles}
              onReady={() => setIsFormReady(true)}
              onSubmit={handleFormSubmit}
            />
          )}
          {activeTab === 'structure' &&
            (isStructureUnlocked ? (
              <StructureTab
                initialSections={sowVariant === 'v2' ? INITIAL_SECTIONS_V2 : INITIAL_SECTIONS}
              />
            ) : (
              <LockedTabState
                title="Structure Not Yet Available"
                description="Submit the Form tab to unlock Structure, where you can review sections, assumptions, and questions."
              />
            ))}
          {activeTab === 'sow-draft' &&
            (isDraftUnlocked ? (
              draftGenState === 'shimmer' ? (
                <ShimmerDraft />
              ) : (
                <SOWDraftTab />
              )
            ) : (
              <LockedTabState
                title="SOW Draft Not Yet Available"
                description="Complete the Structure tab and click Generate Draft to unlock the SOW Draft."
              />
            ))}
          {activeTab === 'audit-log' && (
            <div
              style={{
                flex: 1,
                padding: '16px',
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <AuditLogView />
            </div>
          )}
        </div>
        {/* end tab content */}
      </div>
      {/* end glass box */}

      {/* Review sent toast */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: '50%',
          transform: `translateX(-50%) translateY(${reviewSentToast ? 0 : -80}px)`,
          opacity: reviewSentToast ? 1 : 0,
          transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease',
          zIndex: 400,
          pointerEvents: reviewSentToast ? 'auto' : 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 20px',
          borderRadius: 12,
          background: '#16a34a',
          color: '#fff',
          fontSize: 13,
          fontWeight: 600,
          boxShadow: '0 8px 32px rgba(22,163,74,0.35)',
          whiteSpace: 'nowrap',
        }}
      >
        <svg
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M22 2L11 13" />
          <path d="M22 2L15 22 11 13 2 9l20-7z" />
        </svg>
        SOW sent for review successfully!
        <button
          onClick={() => setReviewSentToast(false)}
          style={{
            marginLeft: 8,
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: 6,
            color: '#fff',
            cursor: 'pointer',
            padding: '2px 7px',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          ✕
        </button>
      </div>

      {/* Send for Review modal */}
      {showReviewModal && (
        <SendForReviewModal
          onClose={() => setShowReviewModal(false)}
          onConfirm={handleSendForReview}
        />
      )}
    </>
  )
}
