/**
 * @layer organism
 * @description SOW Detail Screen — breadcrumb, tabs, and tab content.
 * Designed to render inside the DashboardScreenV2 app shell (no page wrapper).
 * Tabs: Overview | Form | Structure (unlocks after Form submit) | SOW Draft | Audit Log
 */

'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import type {
  SOWDetailScreenProps,
  SOWTab,
  SOWFormData,
  CommitmentItem,
  SOWSection,
} from './SOWDetailScreen.types'
import type { UploadedFile } from '@/components/molecules/CreateSOWModal'

/* ── Tab config ──────────────────────────────────────────────────────────── */

function buildTabs(structureUnlocked: boolean) {
  return [
    { id: 'overview' as SOWTab, label: 'Overview', locked: false },
    { id: 'form' as SOWTab, label: 'Form', locked: false },
    { id: 'structure' as SOWTab, label: 'Structure', locked: !structureUnlocked },
    { id: 'sow-draft' as SOWTab, label: 'SOW Draft', locked: true },
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
    <div style={{ padding: '24px 28px' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#0d212c', marginBottom: 4 }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {files.map((file) => (
            <button
              key={file.id}
              onClick={() => setPreviewFile(file)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 18px',
                background: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(0,196,196,0.15)',
                borderRadius: 10,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#00C4C4'
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow =
                  '0 2px 12px rgba(0,196,196,0.12)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,196,196,0.15)'
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
              }}
            >
              <span style={{ fontSize: 24, flexShrink: 0 }}>
                {FILE_ICONS[getFileExt(file.name)] ?? '📄'}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 500,
                    color: '#0d212c',
                    fontSize: 14,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {file.name}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{file.size}</div>
              </div>
              <div style={{ fontSize: 12, color: '#00a0a0', fontWeight: 500, flexShrink: 0 }}>
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

function FormTab({ files: _files, onSubmit }: { files: UploadedFile[]; onSubmit: () => void }) {
  const [isLoading, setIsLoading] = useState(true)
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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setFormData(MOCK_FORM_DATA)
      setIsLoading(false)
    }, 5000)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
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

  if (isLoading) {
    return (
      <div style={{ padding: '32px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <div
            style={{
              width: 18,
              height: 18,
              border: '2.5px solid #00C4C4',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <span style={{ fontSize: 14, color: '#64748b' }}>
            Intake Agent is analysing your documents…
          </span>
        </div>
        {[180, 120, 200, 150, 180].map((w, i) => (
          <div
            key={i}
            style={{
              marginBottom: 20,
              background: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(0,196,196,0.12)',
              borderRadius: 12,
              padding: '16px 20px',
            }}
          >
            <div
              style={{
                height: 12,
                width: w,
                background: 'rgba(0,196,196,0.15)',
                borderRadius: 6,
                marginBottom: 10,
                animation: 'pulse 1.4s ease-in-out infinite',
              }}
            />
            <div
              style={{
                height: 72,
                background: 'rgba(0,196,196,0.08)',
                borderRadius: 8,
                animation: 'pulse 1.4s ease-in-out infinite',
                animationDelay: `${i * 0.15}s`,
              }}
            />
          </div>
        ))}
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:0.5}50%{opacity:1}}`}</style>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px 28px', maxWidth: 820 }}>
      {/* ── AI Agent block ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(0,196,196,0.08) 0%, rgba(0,168,168,0.05) 100%)',
          border: '1px solid rgba(0,196,196,0.25)',
          borderRadius: 14,
          padding: '16px 20px',
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* AI avatar */}
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'rgba(0,196,196,0.18)',
              border: '1px solid rgba(0,196,196,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00a0a0"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              <path d="M16 3.5A4 4 0 0 1 19.5 7" />
              <path d="M8 3.5A4 4 0 0 0 4.5 7" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0d212c', marginBottom: 3 }}>
              Intake Agent
              <span
                style={{
                  marginLeft: 8,
                  padding: '2px 8px',
                  background: 'rgba(0,196,196,0.15)',
                  color: '#00a0a0',
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                Done
              </span>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#64748b' }}>
              <span>
                📎 Sources referred: <strong style={{ color: '#0d212c' }}>1 document</strong>
              </span>
              <span>·</span>
              <span>
                ✓ Commitments found:{' '}
                <strong style={{ color: '#0d212c' }}>{MOCK_FORM_DATA.commitments.length}</strong>
              </span>
              <span>·</span>
              <span>
                📋 Fields extracted: <strong style={{ color: '#0d212c' }}>8</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Submit CTA */}
        <button
          onClick={onSubmit}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 22px',
            background: '#00C4C4',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: '0 4px 16px rgba(0,196,196,0.3)',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = '#00a8a8'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = '#00C4C4'
          }}
        >
          Submit Form
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

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
          padding: '28px 32px',
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

const INITIAL_SECTIONS: SOWSection[] = [
  {
    id: 's1',
    title: 'Executive Summary',
    description: 'High-level overview of the engagement, objectives, and expected outcomes.',
    assumptions: [
      'Procurement cycle is currently 45 days on average and will reduce to under 27 days post-implementation.',
      'Client has 120+ procurement staff who will require role-based training.',
      'All stakeholders have been identified and project governance is in place.',
    ],
    questions: [],
  },
  {
    id: 's2',
    title: 'Scope of Work',
    description: 'Detailed description of in-scope and out-of-scope work items.',
    assumptions: [
      'In-scope covers 6 defined procurement sub-processes as listed in Appendix A.',
      'ERP system modifications and HR module integration are explicitly excluded.',
      'Third-party vendor onboarding is in scope for up to 50 vendors in Phase 1.',
    ],
    questions: [],
  },
  {
    id: 's3',
    title: 'Deliverables',
    description: 'List of tangible outputs and artifacts the engagement will produce.',
    assumptions: [
      'Cloud platform delivery is expected within 6 calendar months from kick-off.',
      'Post go-live hypercare support is committed for 30 days.',
      'Documentation includes user guides, admin manuals, and API reference.',
    ],
    questions: [],
  },
  {
    id: 's4',
    title: 'Timeline & Milestones',
    description: 'Project schedule with key milestones, gates, and critical path.',
    assumptions: [
      'Q2 2026 is a hard board-approved deadline — timeline cannot slip.',
      'Legacy system (Ariba 2014) will be decommissioned concurrently with go-live.',
      'Milestone payments are tied to phase completions, not calendar dates.',
    ],
    questions: [],
  },
  {
    id: 's5',
    title: 'Commercials',
    description: 'Pricing, payment schedule, and commercial terms for the engagement.',
    assumptions: [
      'Fixed price engagement with no scope creep clauses beyond Change Request process.',
      'Payment milestones: 20% on kick-off, 30% on UAT, 50% on go-live acceptance.',
      'Travel and expenses are included in the fixed price up to an agreed cap.',
    ],
    questions: [],
  },
  {
    id: 's6',
    title: 'Assumptions & Risks',
    description: 'Known assumptions and risk register for the engagement.',
    assumptions: [
      'All data migration must be HIPAA compliant — client will provide compliance sign-off.',
      'Third-party vendor integration dependencies are outside the project critical path.',
      'Client will make key stakeholders available for workshops within 5 business days of request.',
    ],
    questions: [],
  },
]

function StructureTab() {
  const [sections, setSections] = useState<SOWSection[]>(INITIAL_SECTIONS)
  const [activeId, setActiveId] = useState<string>(INITIAL_SECTIONS[0].id)
  const [showAddModal, setShowAddModal] = useState(false)
  const rightPaneRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const isUserScrolling = useRef(false)
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Scroll spy via IntersectionObserver
  useEffect(() => {
    const root = rightPaneRef.current
    if (!root) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (isUserScrolling.current) return
        // Pick the entry that is most visible
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

  const addSection = (title: string, description: string) => {
    const newSection: SOWSection = {
      id: `s${Date.now()}`,
      title,
      description: description || undefined,
      assumptions: [],
      questions: [],
    }
    setSections((prev) => [...prev, newSection])
  }

  return (
    <div style={{ display: 'flex', height: '100%', minHeight: 0, overflow: 'hidden' }}>
      {/* ── Left pane: section list ── */}
      <div
        style={{
          width: 232,
          flexShrink: 0,
          borderRight: '1px solid rgba(0,196,196,0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: 'rgba(248,252,252,0.6)',
        }}
      >
        <div style={{ padding: '18px 16px 10px', borderBottom: '1px solid rgba(0,196,196,0.1)' }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Sections
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px' }}>
          {sections.map((sec, idx) => (
            <button
              key={sec.id}
              onClick={() => scrollToSection(sec.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '9px 10px',
                borderRadius: 8,
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.15s',
                marginBottom: 2,
                background: activeId === sec.id ? 'rgba(0,196,196,0.12)' : 'transparent',
                color: activeId === sec.id ? '#00a0a0' : '#64748b',
              }}
              onMouseEnter={(e) => {
                if (activeId !== sec.id)
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,196,196,0.06)'
              }}
              onMouseLeave={(e) => {
                if (activeId !== sec.id)
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
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
                  background: activeId === sec.id ? '#00C4C4' : 'rgba(0,196,196,0.12)',
                  color: activeId === sec.id ? '#fff' : '#64748b',
                  transition: 'all 0.15s',
                }}
              >
                {idx + 1}
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: activeId === sec.id ? 600 : 500,
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
          ))}
        </div>

        {/* Add section button */}
        <div style={{ padding: '10px 10px 14px', borderTop: '1px solid rgba(0,196,196,0.1)' }}>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
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

      {/* ── Right pane: scrollable section content ── */}
      <div ref={rightPaneRef} style={{ flex: 1, overflowY: 'auto', padding: '0 0 40px' }}>
        {sections.map((sec, idx) => (
          <div
            key={sec.id}
            ref={(el) => {
              sectionRefs.current[sec.id] = el
            }}
            data-section-id={sec.id}
            style={{
              padding: '28px 32px',
              borderBottom: idx < sections.length - 1 ? '1px solid rgba(0,196,196,0.1)' : 'none',
            }}
          >
            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'rgba(0,196,196,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#00a0a0',
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                {idx + 1}
              </span>
              <div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: '#0d212c',
                    marginBottom: sec.description ? 4 : 0,
                  }}
                >
                  {sec.title}
                </div>
                {sec.description && (
                  <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                    {sec.description}
                  </div>
                )}
              </div>
            </div>

            {/* Assumptions */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#00a0a0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  Assumptions
                </div>
                <span
                  style={{
                    fontSize: 11,
                    padding: '1px 7px',
                    background: 'rgba(0,196,196,0.1)',
                    color: '#00a0a0',
                    borderRadius: 20,
                    fontWeight: 600,
                  }}
                >
                  {sec.assumptions.length}
                </span>
              </div>
              {sec.assumptions.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {sec.assumptions.map((a, ai) => (
                    <div
                      key={ai}
                      style={{
                        display: 'flex',
                        gap: 10,
                        padding: '10px 14px',
                        background: 'rgba(0,196,196,0.05)',
                        border: '1px solid rgba(0,196,196,0.15)',
                        borderRadius: 8,
                      }}
                    >
                      <span style={{ color: '#00C4C4', flexShrink: 0, marginTop: 1 }}>•</span>
                      <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.55 }}>{a}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    fontSize: 13,
                    color: '#94a3b8',
                    padding: '12px 14px',
                    background: '#f8fafc',
                    borderRadius: 8,
                    border: '1px dashed #e2e8f0',
                  }}
                >
                  No assumptions identified yet.
                </div>
              )}
            </div>

            {/* Questions */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  Questions
                </div>
                <span
                  style={{
                    fontSize: 11,
                    padding: '1px 7px',
                    background: '#f1f5f9',
                    color: '#94a3b8',
                    borderRadius: 20,
                    fontWeight: 600,
                  }}
                >
                  {sec.questions.length}
                </span>
              </div>
              {sec.questions.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {sec.questions.map((q, qi) => (
                    <div
                      key={qi}
                      style={{
                        display: 'flex',
                        gap: 10,
                        padding: '10px 14px',
                        background: '#fefce8',
                        border: '1px solid #fde68a',
                        borderRadius: 8,
                      }}
                    >
                      <span
                        style={{ color: '#d97706', flexShrink: 0, fontWeight: 600, fontSize: 13 }}
                      >
                        Q{qi + 1}
                      </span>
                      <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.55 }}>{q}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    fontSize: 13,
                    color: '#94a3b8',
                    padding: '12px 14px',
                    background: '#f8fafc',
                    borderRadius: 8,
                    border: '1px dashed #e2e8f0',
                  }}
                >
                  No questions generated yet. Questions will appear here after AI review.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <AddSectionModal onClose={() => setShowAddModal(false)} onAdd={addSection} />
      )}
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
}: SOWDetailScreenProps) {
  const [activeTab, setActiveTab] = useState<SOWTab>('overview')
  const [isStructureUnlocked, setIsStructureUnlocked] = useState(false)

  const tabs = buildTabs(isStructureUnlocked)

  const handleFormSubmit = () => {
    setIsStructureUnlocked(true)
    setActiveTab('structure')
  }

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        fontFamily: 'inherit',
        minHeight: 0,
      }}
    >
      {/* ── Sticky header: breadcrumb + title + tabs ── */}
      <div
        style={{ flexShrink: 0, borderBottom: '1px solid rgba(0,196,196,0.15)', padding: '0 28px' }}
      >
        {/* Breadcrumb */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            paddingTop: 18,
            paddingBottom: 10,
          }}
        >
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              fontSize: 13,
              padding: 0,
              fontFamily: 'inherit',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.color = '#00a0a0'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M9 3L4 7l5 4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            My SOWs
          </button>
          <span style={{ color: 'rgba(0,0,0,0.2)', fontSize: 13 }}>/</span>
          <span style={{ fontSize: 13, color: '#0d212c', fontWeight: 500 }}>{sowName}</span>
        </div>

        {/* Title + status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 18 }}>
          <h1
            style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0d212c', lineHeight: 1.2 }}
          >
            {sowName}
          </h1>
          <span
            style={{
              padding: '3px 10px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              background: STATUS_BG[sowStatus] ?? '#f1f5f9',
              color: STATUS_TEXT[sowStatus] ?? '#64748b',
            }}
          >
            {sowStatus}
          </span>
          {isStructureUnlocked && (
            <span
              style={{
                padding: '3px 10px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                background: '#dcfce7',
                color: '#16a34a',
                marginLeft: 4,
              }}
            >
              ✓ Form Submitted
            </span>
          )}
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 0 }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => !tab.locked && setActiveTab(tab.id)}
                style={{
                  padding: '10px 18px',
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
        </div>
      </div>

      {/* ── Tab content ── */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: activeTab === 'structure' ? 'hidden' : 'auto',
        }}
      >
        {activeTab === 'overview' && <OverviewTab files={uploadedFiles} />}
        {activeTab === 'form' && <FormTab files={uploadedFiles} onSubmit={handleFormSubmit} />}
        {activeTab === 'structure' &&
          (isStructureUnlocked ? (
            <StructureTab />
          ) : (
            <LockedTabState
              title="Structure Not Yet Available"
              description="Submit the Form tab to unlock Structure, where you can review sections, assumptions, and questions."
            />
          ))}
        {activeTab === 'sow-draft' && (
          <LockedTabState
            title="SOW Draft Not Yet Available"
            description="Complete the Structure tab to unlock the SOW Draft, where you can review, edit, and export the final statement of work."
          />
        )}
        {activeTab === 'audit-log' && (
          <div style={{ padding: '28px 28px' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#0d212c', marginBottom: 16 }}>
              Audit Log
            </div>
            <div
              style={{
                background: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(0,196,196,0.15)',
                borderRadius: 10,
                padding: '20px 24px',
                color: '#64748b',
                fontSize: 14,
              }}
            >
              No activity recorded yet. Actions taken on this SOW will appear here.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
