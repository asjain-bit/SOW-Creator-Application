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
  const [type, setType] = useState<'assumption' | 'question'>('assumption')
  const [text, setText] = useState('')
  const [assignedTo, setAssignedTo] = useState(members[0] ?? 'm1')

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.35)',
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
          padding: '28px 28px 24px',
          width: 480,
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: '#0d212c', marginBottom: 4 }}>
          Add to {sectionTitle}
        </div>
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
          Add an assumption or question and assign it to a section member.
        </div>

        {/* Type toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {(['assumption', 'question'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 8,
                border: `1.5px solid ${type === t ? (t === 'assumption' ? '#00C4C4' : '#f59e0b') : '#e2e8f0'}`,
                background:
                  type === t
                    ? t === 'assumption'
                      ? 'rgba(0,196,196,0.08)'
                      : '#fffbeb'
                    : '#f8fafc',
                color: type === t ? (t === 'assumption' ? '#00a0a0' : '#d97706') : '#64748b',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Text */}
        <textarea
          placeholder={type === 'assumption' ? 'Describe the assumption…' : 'Write the question…'}
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

        {/* Assign to */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>
            Assign to
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {members.map((mid) => {
              const m = memberById(mid)
              const sel = assignedTo === mid
              return (
                <button
                  key={mid}
                  onClick={() => setAssignedTo(mid)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 10px',
                    borderRadius: 20,
                    border: `1.5px solid ${sel ? m.color : '#e2e8f0'}`,
                    background: sel ? `${m.color}15` : '#f8fafc',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600,
                    color: sel ? m.color : '#64748b',
                  }}
                >
                  <MemberAvatar memberId={mid} size={18} />
                  {m.name}
                </button>
              )
            })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
          <button
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
            onClick={() => {
              if (text.trim()) {
                onAdd({ type, text: text.trim(), assignedTo, answered: false })
                onClose()
              }
            }}
            style={{
              padding: '8px 20px',
              borderRadius: 8,
              border: 'none',
              background: '#00C4C4',
              fontSize: 13,
              fontWeight: 700,
              color: '#fff',
              cursor: 'pointer',
              opacity: text.trim() ? 1 : 0.5,
            }}
          >
            Add {type === 'assumption' ? 'Assumption' : 'Question'}
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
      {/* ── Progress summary strip ── */}
      {(() => {
        const totalSections = sections.length
        const sectionsWithItems = sections.filter((s) => s.items.length > 0)
        const completeSections = sections.filter(
          (s) => s.items.length > 0 && s.items.every((i) => i.answered)
        )
        const totalItems = sections.reduce((n, s) => n + s.items.length, 0)
        const answeredItems = sections.reduce(
          (n, s) => n + s.items.filter((i) => i.answered).length,
          0
        )
        const openItems = totalItems - answeredItems
        const secPct =
          totalSections > 0 ? Math.round((completeSections.length / totalSections) * 100) : 0
        const itemPct = totalItems > 0 ? Math.round((answeredItems / totalItems) * 100) : 0

        const kpis = [
          {
            label: 'Sections complete',
            value: `${completeSections.length} / ${totalSections}`,
            pct: secPct,
            color: '#00C4C4',
            sub: `${sectionsWithItems.length} have items`,
          },
          {
            label: 'Items answered',
            value: `${answeredItems} / ${totalItems}`,
            pct: itemPct,
            color: '#16a34a',
            sub: `${openItems} open`,
          },
          {
            label: 'Assumptions',
            value: (() => {
              const total = sections.reduce(
                (n, s) => n + s.items.filter((i) => i.type === 'assumption').length,
                0
              )
              const done = sections.reduce(
                (n, s) => n + s.items.filter((i) => i.type === 'assumption' && i.answered).length,
                0
              )
              return `${done} / ${total}`
            })(),
            pct: (() => {
              const total = sections.reduce(
                (n, s) => n + s.items.filter((i) => i.type === 'assumption').length,
                0
              )
              const done = sections.reduce(
                (n, s) => n + s.items.filter((i) => i.type === 'assumption' && i.answered).length,
                0
              )
              return total > 0 ? Math.round((done / total) * 100) : 0
            })(),
            color: '#8b5cf6',
            sub: 'answered',
          },
          {
            label: 'Questions',
            value: (() => {
              const total = sections.reduce(
                (n, s) => n + s.items.filter((i) => i.type === 'question').length,
                0
              )
              const done = sections.reduce(
                (n, s) => n + s.items.filter((i) => i.type === 'question' && i.answered).length,
                0
              )
              return `${done} / ${total}`
            })(),
            pct: (() => {
              const total = sections.reduce(
                (n, s) => n + s.items.filter((i) => i.type === 'question').length,
                0
              )
              const done = sections.reduce(
                (n, s) => n + s.items.filter((i) => i.type === 'question' && i.answered).length,
                0
              )
              return total > 0 ? Math.round((done / total) * 100) : 0
            })(),
            color: '#f59e0b',
            sub: 'answered',
          },
        ]

        return (
          <div
            style={{
              display: 'flex',
              gap: 1,
              borderBottom: '1px solid rgba(0,196,196,0.12)',
              background: 'rgba(248,252,252,0.7)',
              flexShrink: 0,
            }}
          >
            {kpis.map((k, ki) => (
              <div
                key={ki}
                style={{
                  flex: 1,
                  padding: '10px 18px',
                  borderRight: ki < kpis.length - 1 ? '1px solid rgba(0,196,196,0.1)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 5,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: '#94a3b8',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {k.label}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: k.color }}>{k.pct}%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      flex: 1,
                      height: 5,
                      borderRadius: 99,
                      background: 'rgba(0,0,0,0.07)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${k.pct}%`,
                        height: '100%',
                        borderRadius: 99,
                        background: k.color,
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#0d212c',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {k.value}
                  </span>
                </div>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>{k.sub}</span>
              </div>
            ))}
          </div>
        )
      })()}

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
          <div
            style={{
              padding: '16px 16px 10px',
              borderBottom: '1px solid rgba(0,196,196,0.1)',
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
                }}
              >
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() =>
                    allSelected ? clearSelection() : setSelected(new Set(allItemIds))
                  }
                  style={{ accentColor: '#00C4C4', width: 15, height: 15 }}
                />
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
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggle}
          style={{ width: 14, height: 14, accentColor: '#00C4C4', cursor: 'pointer' }}
        />
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
  const [activeSection, setActiveSection] = useState('ds1')
  const [version, setVersion] = useState('v1.1')
  const [versionOpen, setVersionOpen] = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [commentingId, setCommentingId] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')
  const [commentAssignee, setCommentAssignee] = useState('m1')
  const [comments, setComments] = useState<DraftComment[]>([])
  const versionRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const editRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    if (!versionOpen) return
    function handle(e: MouseEvent) {
      if (versionRef.current && !versionRef.current.contains(e.target as Node))
        setVersionOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [versionOpen])

  const scrollTo = (id: string) => {
    setActiveSection(id)
    const el = sectionRefs.current[id]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const versions = [
    { id: 'v1.1', label: 'v1.1 — Current Draft', editable: true },
    { id: 'v1.0', label: 'v1.0 — Initial Draft', editable: false },
    { id: 'v0.9', label: 'v0.9 — Working Copy', editable: false },
  ]
  const selectedVersion = versions.find((v) => v.id === version) ?? versions[0]
  const isEditable = selectedVersion.editable

  const saveEdit = (id: string) => {
    setEditingId(null)
  }

  const saveComment = () => {
    if (!commentingId || !commentText.trim()) return
    const m = SECTION_MEMBERS.find((x) => x.id === commentAssignee) ?? SECTION_MEMBERS[0]
    setComments((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sectionId: commentingId,
        text: commentText.trim(),
        assignee: m.name,
      },
    ])
    setCommentText('')
    setCommentingId(null)
  }

  /* Reusable row builder for table cells */
  const cell = (s: React.CSSProperties = {}): React.CSSProperties => ({
    padding: '8px 12px',
    color: '#374151',
    ...s,
  })
  const thStyle: React.CSSProperties = {
    padding: '8px 12px',
    textAlign: 'left',
    fontWeight: 700,
    color: '#0d212c',
    borderBottom: '1.5px solid rgba(0,196,196,0.25)',
    background: 'rgba(0,196,196,0.07)',
    fontSize: 12.5,
  }

  /* Section wrapper with hover actions */
  const SectionBlock = ({
    id,
    num,
    title,
    children,
  }: {
    id: string
    num: number
    title: string
    children: React.ReactNode
  }) => {
    const isHovered = hoveredId === id
    const isEdit = editingId === id
    const secComments = comments.filter((c) => c.sectionId === id)
    return (
      <div
        ref={(el) => {
          sectionRefs.current[id] = el
        }}
        onMouseEnter={() => setHoveredId(id)}
        onMouseLeave={() => setHoveredId(null)}
        style={{
          marginBottom: 36,
          scrollMarginTop: 20,
          position: 'relative',
          borderRadius: 10,
          border: isEdit ? '1.5px solid #00C4C4' : '1.5px solid transparent',
          padding: isEdit ? '14px 16px' : '0',
          transition: 'border-color 0.15s, padding 0.15s',
          background: isEdit ? 'rgba(0,196,196,0.02)' : 'transparent',
        }}
      >
        {/* Section heading */}
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#0d212c',
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'rgba(0,196,196,0.15)',
              color: '#00a0a0',
              fontSize: 11,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {num}
          </span>
          {title}
          {secComments.length > 0 && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                fontSize: 10,
                fontWeight: 700,
                color: '#d97706',
                background: '#fef3c7',
                border: '1px solid #fde68a',
                borderRadius: 10,
                padding: '1px 7px',
              }}
            >
              <svg
                width="9"
                height="9"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {secComments.length}
            </span>
          )}
        </div>
        {/* Content */}
        {children}
        {/* Saved comments */}
        {secComments.map((c) => (
          <div
            key={c.id}
            style={{
              marginTop: 10,
              padding: '10px 14px',
              borderRadius: 8,
              background: '#fffbeb',
              border: '1px solid #fde68a',
              fontSize: 12,
              color: '#92400e',
            }}
          >
            <span style={{ fontWeight: 700 }}>@{c.assignee}: </span>
            {c.text}
          </div>
        ))}
        {/* Hover action buttons (top-right of section) */}
        {isHovered && !isEdit && isEditable && (
          <div style={{ position: 'absolute', top: 0, right: 0, display: 'flex', gap: 4 }}>
            <button
              title="Edit section"
              onClick={() => {
                setEditingId(id)
                setCommentingId(null)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '5px 10px',
                borderRadius: 7,
                border: '1px solid rgba(0,196,196,0.3)',
                background: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                fontSize: 11,
                fontWeight: 600,
                color: '#007a7a',
                cursor: 'pointer',
              }}
            >
              <svg
                width="11"
                height="11"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit
            </button>
            <button
              title="Add comment"
              onClick={() => {
                setCommentingId(id)
                setEditingId(null)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '5px 10px',
                borderRadius: 7,
                border: '1px solid #fde68a',
                background: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                fontSize: 11,
                fontWeight: 600,
                color: '#d97706',
                cursor: 'pointer',
              }}
            >
              <svg
                width="11"
                height="11"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Comment
            </button>
          </div>
        )}
        {/* Inline edit Save/Cancel bar */}
        {isEdit && (
          <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' }}>
            <button
              onClick={() => setEditingId(null)}
              style={{
                padding: '6px 14px',
                borderRadius: 7,
                border: '1px solid #e2e8f0',
                background: '#fff',
                fontSize: 12,
                fontWeight: 600,
                color: '#64748b',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => saveEdit(id)}
              style={{
                padding: '6px 14px',
                borderRadius: 7,
                border: 'none',
                background: '#00C4C4',
                fontSize: 12,
                fontWeight: 700,
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Save
            </button>
          </div>
        )}
        {/* comment overlay rendered at root level below */}
      </div>
    )
  }

  const EditableP = ({ id, text }: { id: string; text: string }) => (
    <p
      ref={(el) => {
        editRefs.current[id] = el
      }}
      contentEditable={editingId === id}
      suppressContentEditableWarning
      style={{
        fontSize: 13.5,
        color: '#374151',
        lineHeight: 1.7,
        margin: '0 0 12px 0',
        outline: 'none',
        borderRadius: 4,
        padding: editingId === id ? '4px 6px' : 0,
        background: editingId === id ? 'rgba(0,196,196,0.04)' : 'transparent',
        transition: 'background 0.15s, padding 0.15s',
      }}
    >
      {text}
    </p>
  )

  return (
    <>
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Left nav */}
        <div
          style={{
            width: 250,
            flexShrink: 0,
            borderRight: '1px solid rgba(0,196,196,0.1)',
            overflowY: 'auto',
            padding: '14px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* Compact version selector */}
          <div ref={versionRef} style={{ position: 'relative', marginBottom: 10 }}>
            <button
              onClick={() => setVersionOpen((o) => !o)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                width: '100%',
                padding: '7px 10px',
                borderRadius: 8,
                border: '1px solid rgba(0,196,196,0.25)',
                background: versionOpen ? 'rgba(0,196,196,0.08)' : '#f8fafc',
                fontSize: 11.5,
                fontWeight: 600,
                color: '#0d212c',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <svg
                width="12"
                height="12"
                fill="none"
                stroke="#00C4C4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span
                style={{
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {selectedVersion.label}
              </span>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  padding: '1px 5px',
                  borderRadius: 4,
                  background: isEditable ? 'rgba(0,196,196,0.15)' : '#f1f5f9',
                  color: isEditable ? '#00a0a0' : '#94a3b8',
                  flexShrink: 0,
                }}
              >
                {isEditable ? 'Edit' : 'View'}
              </span>
              <svg
                width="9"
                height="9"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                style={{
                  flexShrink: 0,
                  transition: 'transform 0.15s',
                  transform: versionOpen ? 'rotate(180deg)' : 'none',
                }}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {versionOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: 4,
                  background: '#fff',
                  border: '1px solid rgba(0,196,196,0.2)',
                  borderRadius: 10,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  zIndex: 50,
                  overflow: 'hidden',
                }}
              >
                {versions.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setVersion(v.id)
                      setVersionOpen(false)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: 11.5,
                      fontWeight: v.id === version ? 700 : 500,
                      color: v.id === version ? '#00a0a0' : '#0d212c',
                      background: v.id === version ? 'rgba(0,196,196,0.06)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {v.label}
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 600,
                        padding: '1px 5px',
                        borderRadius: 4,
                        background: v.editable ? 'rgba(0,196,196,0.12)' : '#f1f5f9',
                        color: v.editable ? '#00a0a0' : '#94a3b8',
                      }}
                    >
                      {v.editable ? 'Edit' : 'View'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div style={{ height: 1, background: 'rgba(0,196,196,0.1)', marginBottom: 6 }} />
          {SOW_DRAFT_SECTIONS.map((sec) => {
            const isActive = activeSection === sec.id
            return (
              <button
                key={sec.id}
                onClick={() => scrollTo(sec.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: 'none',
                  background: isActive ? 'rgba(0,196,196,0.1)' : 'transparent',
                  color: isActive ? '#00a0a0' : '#374151',
                  fontSize: 12,
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.12s',
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: isActive ? '#00C4C4' : '#cbd5e1',
                    flexShrink: 0,
                  }}
                />
                {sec.title}
                {comments.filter((c) => c.sectionId === sec.id).length > 0 && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: '#fef3c7',
                      border: '1px solid #fde68a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 9,
                      fontWeight: 700,
                      color: '#d97706',
                    }}
                  >
                    {comments.filter((c) => c.sectionId === sec.id).length}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Document pane */}
        <div ref={rightRef} style={{ flex: 1, overflowY: 'auto', padding: '28px 36px' }}>
          {/* S0: Background */}
          <SectionBlock id="ds0" num={1} title="Background">
            <EditableP
              id="ds0"
              text="Meridian Healthcare is a leading mid-market healthcare provider operating 14 hospitals and 38 outpatient clinics across the Asia-Pacific region. Over the past three years, the organisation has undergone significant expansion through acquisitions, resulting in a fragmented procurement landscape with five distinct ERP environments, no unified vendor registry, and an estimated 23% of purchase orders processed manually."
            />
            <EditableP
              id="ds0b"
              text="In response to a CFO-led cost reduction mandate, the executive team commissioned an independent operational review in Q2 2026. The review identified procurement inefficiencies as the single largest controllable cost lever, with an addressable saving of USD 6–9 million annually through process standardisation and platform consolidation. This Statement of Work sets out the scope, approach, and commercial terms for the first phase of that transformation."
            />
          </SectionBlock>

          {/* S1: Executive Summary */}
          <SectionBlock id="ds1" num={2} title="Executive Summary">
            <EditableP
              id="ds1"
              text="This Statement of Work governs the end-to-end delivery of Meridian Healthcare's Procurement Platform Transformation engagement. The objective is to reduce the average procurement cycle from 45 days to under 27 days through the implementation of an automated procure-to-pay platform, vendor onboarding workflows, and a centralised analytics dashboard."
            />
            <EditableP
              id="ds1b"
              text="The engagement is structured across three phases over six months, covering 128 procurement staff across six regional offices. The executive sponsor — jointly the CFO and CPO — has formally signed off on the transformation roadmap and a budget allocation of USD 4.2 million within the FY2027 capital expenditure plan."
            />
          </SectionBlock>

          {/* S2: Objectives */}
          <SectionBlock id="ds2" num={3} title="Objectives">
            <EditableP
              id="ds2"
              text="The primary objectives of this engagement are to: (1) consolidate five ERP procurement modules into a single procure-to-pay platform, (2) reduce the average PO cycle time from 45 to 27 days, (3) establish a unified vendor registry with automated onboarding, and (4) deliver real-time spend analytics to the CFO's office."
            />
            <table
              style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, marginTop: 12 }}
            >
              <thead>
                <tr>
                  {['OBJ', 'Objective', 'Metric', 'Target'].map((h) => (
                    <th key={h} style={thStyle}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['O1', 'Platform Consolidation', 'Number of active ERP modules', 'From 5 to 1'],
                  ['O2', 'Cycle Time Reduction', 'Average PO cycle time', '45 → 27 days'],
                  ['O3', 'Vendor Onboarding', 'Onboarding lead time', '14 → 5 days'],
                  ['O4', 'Spend Visibility', '% spend captured in analytics', 'From 41% to 95%'],
                  ['O5', 'Compliance', '% POs with full audit trail', 'From 68% to 100%'],
                ].map((row) => (
                  <tr key={row[0]} style={{ borderBottom: '1px solid rgba(0,196,196,0.07)' }}>
                    {row.map((c, ci) => (
                      <td
                        key={ci}
                        style={cell(
                          ci === 0
                            ? { fontWeight: 700 }
                            : ci === 3
                              ? { fontWeight: 600, color: '#16a34a' }
                              : {}
                        )}
                      >
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionBlock>

          {/* S3: Scope of Work */}
          <SectionBlock id="ds3" num={4} title="Scope of Work">
            <EditableP
              id="ds3"
              text="Phase 1 focuses on three priority sub-processes: Purchase Order Automation, Vendor Onboarding, and Invoice Reconciliation. Sub-processes 4–6 are deferred to Phase 2 pending budget confirmation."
            />
            <table
              style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, marginTop: 12 }}
            >
              <thead>
                <tr>
                  {['#', 'Sub-Process', 'Phase', 'Status'].map((h) => (
                    <th key={h} style={thStyle}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['1', 'Purchase Order Automation', 'Phase 1', 'In Scope'],
                  ['2', 'Vendor Onboarding', 'Phase 1', 'In Scope'],
                  ['3', 'Invoice Reconciliation', 'Phase 1', 'In Scope'],
                  ['4', 'Contract Management', 'Phase 2', 'Deferred'],
                  ['5', 'Supplier Performance', 'Phase 2', 'Deferred'],
                  ['6', 'Spend Analytics', 'Phase 2', 'Deferred'],
                ].map((row) => (
                  <tr key={row[0]} style={{ borderBottom: '1px solid rgba(0,196,196,0.07)' }}>
                    {row.map((c, ci) => (
                      <td
                        key={ci}
                        style={cell(
                          ci === 3
                            ? { color: c === 'In Scope' ? '#16a34a' : '#94a3b8', fontWeight: 600 }
                            : ci === 0
                              ? { fontWeight: 700 }
                              : {}
                        )}
                      >
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionBlock>

          {/* S4: Out of Scope */}
          <SectionBlock id="ds4" num={5} title="Out of Scope">
            <EditableP
              id="ds4"
              text="The following items are explicitly out of scope for this engagement. Any requests to include them will be treated as a Change Request and priced separately."
            />
            <table
              style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, marginTop: 12 }}
            >
              <thead>
                <tr>
                  {['#', 'Item', 'Rationale'].map((h) => (
                    <th key={h} style={thStyle}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    '1',
                    'HR / Payroll module integration',
                    'Separate workstream under IT Transformation Programme',
                  ],
                  [
                    '2',
                    'ERP infrastructure migration',
                    'Owned by the internal IT team; handover point agreed at API boundary',
                  ],
                  [
                    '3',
                    'Legal contract authoring',
                    'Out of procurement scope; governed by Legal Operations team',
                  ],
                  [
                    '4',
                    'Physical inventory management',
                    'Addressed in separate Inventory Optimisation engagement',
                  ],
                  [
                    '5',
                    'Training content translation',
                    'Meridian internal L&D team to handle localisation post go-live',
                  ],
                ].map((row) => (
                  <tr key={row[0]} style={{ borderBottom: '1px solid rgba(0,196,196,0.07)' }}>
                    {row.map((c, ci) => (
                      <td key={ci} style={cell(ci === 0 ? { fontWeight: 700 } : {})}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionBlock>

          {/* S5: Requirements */}
          <SectionBlock id="ds5" num={6} title="Requirements">
            <EditableP
              id="ds5"
              text="The following functional and non-functional requirements have been validated with the client in the Discovery workshop held on 12 August 2026."
            />
            <table
              style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, marginTop: 12 }}
            >
              <thead>
                <tr>
                  {['ID', 'Requirement', 'Type', 'Priority'].map((h) => (
                    <th key={h} style={thStyle}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    'FR-01',
                    'System must support 3-way PO matching (PO / GRN / Invoice)',
                    'Functional',
                    'P1',
                  ],
                  [
                    'FR-02',
                    'Vendor portal must allow self-service document upload',
                    'Functional',
                    'P1',
                  ],
                  [
                    'FR-03',
                    'Automated escalation after 48-hour PO approval SLA breach',
                    'Functional',
                    'P1',
                  ],
                  [
                    'FR-04',
                    'Role-based access control for approvals (Level 1–4)',
                    'Functional',
                    'P1',
                  ],
                  [
                    'NFR-01',
                    'System uptime of 99.9% excluding scheduled maintenance',
                    'Non-Functional',
                    'P1',
                  ],
                  [
                    'NFR-02',
                    'Page load time < 2s at P95 under 500 concurrent users',
                    'Non-Functional',
                    'P2',
                  ],
                  [
                    'NFR-03',
                    'All data at rest and in transit encrypted (AES-256 / TLS 1.3)',
                    'Non-Functional',
                    'P1',
                  ],
                ].map((row) => (
                  <tr key={row[0]} style={{ borderBottom: '1px solid rgba(0,196,196,0.07)' }}>
                    {row.map((c, ci) => (
                      <td
                        key={ci}
                        style={cell(
                          ci === 0
                            ? { fontWeight: 700, fontFamily: 'monospace', fontSize: 11 }
                            : ci === 3
                              ? { fontWeight: 600, color: c === 'P1' ? '#dc2626' : '#d97706' }
                              : {}
                        )}
                      >
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionBlock>

          {/* S6: Approach & Methodology */}
          <SectionBlock id="ds6" num={7} title="Approach & Methodology">
            <EditableP
              id="ds6"
              text="We will follow an Agile-Waterfall hybrid methodology, with Discovery and Architecture conducted as fixed-scope waterfall phases, and Build & Test conducted in two-week sprints. This balances the need for upfront design rigour (given the regulatory environment) with flexibility during the build phase."
            />
            <table
              style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, marginTop: 12 }}
            >
              <thead>
                <tr>
                  {['Phase', 'Approach', 'Duration', 'Key Activity'].map((h) => (
                    <th key={h} style={thStyle}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    'Discovery',
                    'Waterfall',
                    '6 weeks',
                    'Stakeholder workshops, current-state mapping, solution design',
                  ],
                  [
                    'Architecture',
                    'Waterfall',
                    '4 weeks',
                    'System design, integration specification, security review',
                  ],
                  [
                    'Build',
                    'Agile (sprints)',
                    '10 weeks',
                    'Iterative feature development, unit testing, peer review',
                  ],
                  [
                    'Test & UAT',
                    'Agile',
                    '4 weeks',
                    'Functional testing, performance testing, user acceptance',
                  ],
                  [
                    'Hypercare',
                    'Fixed',
                    '4 weeks',
                    'Post go-live support, issue resolution, KPI baselining',
                  ],
                ].map((row) => (
                  <tr key={row[0]} style={{ borderBottom: '1px solid rgba(0,196,196,0.07)' }}>
                    {row.map((c, ci) => (
                      <td key={ci} style={cell(ci === 0 ? { fontWeight: 700 } : {})}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionBlock>

          {/* S7: Roles & Responsibilities */}
          <SectionBlock id="ds7" num={8} title="Roles & Responsibilities">
            <EditableP
              id="ds7"
              text="The following RACI matrix defines accountability across the engagement. C = Consulted, A = Accountable, R = Responsible, I = Informed."
            />
            <table
              style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, marginTop: 12 }}
            >
              <thead>
                <tr>
                  {['Activity', 'Consultant', 'PMO', 'IT', 'Finance', 'Legal'].map((h) => (
                    <th key={h} style={thStyle}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Solution Design', 'R/A', 'C', 'C', 'I', 'I'],
                  ['Platform Configuration', 'R/A', 'I', 'C', 'I', 'I'],
                  ['Data Migration', 'R', 'A', 'R', 'C', 'I'],
                  ['UAT Coordination', 'C', 'A', 'R', 'R', 'I'],
                  ['Change Management', 'R', 'A', 'C', 'I', 'I'],
                  ['Go-Live Sign-off', 'C', 'A', 'R', 'C', 'I'],
                  ['Legal Review', 'I', 'C', 'I', 'I', 'R/A'],
                ].map((row) => (
                  <tr key={row[0]} style={{ borderBottom: '1px solid rgba(0,196,196,0.07)' }}>
                    {row.map((c, ci) => (
                      <td
                        key={ci}
                        style={cell(
                          ci === 0
                            ? { fontWeight: 600 }
                            : {
                                textAlign: 'center',
                                fontWeight: c.includes('A') ? 700 : 400,
                                color: c.includes('R')
                                  ? '#00a0a0'
                                  : c.includes('A')
                                    ? '#7c3aed'
                                    : '#374151',
                              }
                        )}
                      >
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionBlock>

          {/* S8: Deliverables */}
          <SectionBlock id="ds8" num={9} title="Deliverables">
            <EditableP
              id="ds8"
              text="All deliverables are subject to formal client acceptance within 5 business days of submission. Non-response within this window constitutes deemed acceptance."
            />
            <table
              style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, marginTop: 12 }}
            >
              <thead>
                <tr>
                  {['Deliverable', 'Description', 'Target Date', 'Owner'].map((h) => (
                    <th key={h} style={thStyle}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['D1', 'Solution Design Document', '30 Nov 2026', 'Rohan Mehta'],
                  ['D2', 'Configured PO Automation Module', '31 Jan 2027', 'Priya Sharma'],
                  ['D3', 'Vendor Onboarding Portal', '28 Feb 2027', 'Karan Bose'],
                  ['D4', 'Invoice Reconciliation Engine', '31 Mar 2027', 'Rohan Mehta'],
                  ['D5', 'User & Admin Documentation', '14 Apr 2027', 'Priya Sharma'],
                  ['D6', 'Go-Live Readiness Sign-off', '30 Apr 2027', 'Ashika Jain'],
                ].map((row) => (
                  <tr key={row[0]} style={{ borderBottom: '1px solid rgba(0,196,196,0.07)' }}>
                    {row.map((c, ci) => (
                      <td key={ci} style={cell(ci === 0 ? { fontWeight: 700 } : {})}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionBlock>

          {/* S9: Timeline & Milestones */}
          <SectionBlock id="ds9" num={10} title="Timeline & Milestones">
            <EditableP
              id="ds9"
              text="The engagement runs from 1 November 2026 to 30 April 2027, structured across three phases with formal milestone gates at M2, M4, and M6."
            />
            <table
              style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, marginTop: 12 }}
            >
              <thead>
                <tr>
                  {['Milestone', 'Phase', 'Date', 'Exit Criteria', 'Owner'].map((h) => (
                    <th key={h} style={thStyle}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['M1', 'Kick-off', '1 Nov 2026', 'Project charter signed', 'Ashika Jain'],
                  ['M2', 'Discovery', '31 Jan 2027', 'Solution design approved', 'Rohan Mehta'],
                  ['M3', 'Build', '28 Feb 2027', 'PO & Vendor modules UAT passed', 'Priya Sharma'],
                  [
                    'M4',
                    'Integration',
                    '31 Mar 2027',
                    'Invoice engine integrated & tested',
                    'Karan Bose',
                  ],
                  ['M5', 'Training', '18 Apr 2027', 'All 128 staff trained', 'Ashika Jain'],
                  ['M6', 'Go-Live', '30 Apr 2027', 'Executive sign-off received', 'Ashika Jain'],
                ].map((row) => (
                  <tr key={row[0]} style={{ borderBottom: '1px solid rgba(0,196,196,0.07)' }}>
                    {row.map((c, ci) => (
                      <td key={ci} style={cell(ci === 0 ? { fontWeight: 700 } : {})}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionBlock>

          {/* S10: Commercials */}
          <SectionBlock id="ds10" num={11} title="Commercials">
            <EditableP
              id="ds10"
              text="This is a fixed-price engagement. All travel and expenses are included within the agreed cap per Schedule B. Milestone payments are triggered on formal client acceptance of the corresponding deliverable."
            />
            <table
              style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, marginTop: 12 }}
            >
              <thead>
                <tr>
                  {['Milestone', 'Payment (%)', 'Amount (USD)', 'Trigger'].map((h) => (
                    <th key={h} style={thStyle}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['M1 — Kick-off', '15%', '$630,000', 'Project charter signed'],
                  ['M2 — Discovery', '20%', '$840,000', 'Solution design approved'],
                  ['M3 — Build', '25%', '$1,050,000', 'UAT passed'],
                  ['M4 — Integration', '20%', '$840,000', 'Integration sign-off'],
                  ['M6 — Go-Live', '20%', '$840,000', 'Executive sign-off'],
                ].map((row) => (
                  <tr key={row[0]} style={{ borderBottom: '1px solid rgba(0,196,196,0.07)' }}>
                    {row.map((c, ci) => (
                      <td key={ci} style={cell(ci === 2 ? { fontWeight: 700 } : {})}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr style={{ background: 'rgba(0,196,196,0.05)' }}>
                  <td style={cell({ fontWeight: 800 })}>Total</td>
                  <td style={cell({ fontWeight: 800 })}>100%</td>
                  <td style={cell({ fontWeight: 800, color: '#00a0a0' })}>$4,200,000</td>
                  <td style={cell()}></td>
                </tr>
              </tbody>
            </table>
          </SectionBlock>

          {/* S11: Assumptions */}
          <SectionBlock id="ds11" num={12} title="Assumptions">
            <EditableP
              id="ds11"
              text="The following assumptions have been agreed with the client. If any assumption proves incorrect, a formal Change Request will be raised to assess impact on scope, timeline, and cost."
            />
            <table
              style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, marginTop: 12 }}
            >
              <thead>
                <tr>
                  {['#', 'Assumption', 'Owner'].map((h) => (
                    <th key={h} style={thStyle}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    'A1',
                    'All data migration will be HIPAA and PDPA compliant, verified by client Legal',
                    'Client',
                  ],
                  [
                    'A2',
                    'Source ERP data export in agreed CSV/XML format will be provided by 15 Nov 2026',
                    'Client IT',
                  ],
                  ['A3', 'No scope changes beyond agreed Change Request process', 'Ashika Jain'],
                  [
                    'A4',
                    'Client to provide dedicated UAT resources (min. 8 FTEs) for Phases 3–4',
                    'Client PMO',
                  ],
                  [
                    'A5',
                    'Network connectivity between all six offices to meet NFR-02 bandwidth requirements',
                    'Client IT',
                  ],
                  [
                    'A6',
                    'ERP migration workstream completes API boundary handover by 31 Jan 2027',
                    'Rohan Mehta',
                  ],
                ].map((row) => (
                  <tr key={row[0]} style={{ borderBottom: '1px solid rgba(0,196,196,0.07)' }}>
                    {row.map((c, ci) => (
                      <td key={ci} style={cell(ci === 0 ? { fontWeight: 700 } : {})}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionBlock>

          {/* S12: Risks & Mitigations */}
          <SectionBlock id="ds12" num={13} title="Risks & Mitigations">
            <EditableP
              id="ds12"
              text="The following risks have been identified during scoping. Each is tracked on the joint risk register maintained by the PMO."
            />
            <table
              style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, marginTop: 12 }}
            >
              <thead>
                <tr>
                  {['ID', 'Risk', 'Likelihood', 'Impact', 'Mitigation'].map((h) => (
                    <th key={h} style={thStyle}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    'R1',
                    'Key stakeholder unavailability delays Discovery workshops',
                    'Medium',
                    'High',
                    'Escalation path via CPO; weekly steering committee',
                  ],
                  [
                    'R2',
                    'Data quality issues in source ERP extend migration timeline',
                    'High',
                    'High',
                    'Data audit by 30 Oct 2026; cleanse budget reserved',
                  ],
                  [
                    'R3',
                    'Integration complexity with legacy billing system underestimated',
                    'Medium',
                    'High',
                    'Spike investigation in Sprint 1; time-boxed to 5 days',
                  ],
                  [
                    'R4',
                    'Change fatigue — low user adoption post go-live',
                    'Medium',
                    'Medium',
                    'Change management workstream; champion network in each office',
                  ],
                  [
                    'R5',
                    'Regulatory change affecting HIPAA requirements mid-project',
                    'Low',
                    'High',
                    'Monthly Legal review; contractual clause for compliance changes',
                  ],
                ].map((row) => (
                  <tr key={row[0]} style={{ borderBottom: '1px solid rgba(0,196,196,0.07)' }}>
                    {row.map((c, ci) => (
                      <td
                        key={ci}
                        style={cell(
                          ci === 0
                            ? { fontWeight: 700 }
                            : ci === 2
                              ? {
                                  fontWeight: 600,
                                  color:
                                    c === 'High'
                                      ? '#dc2626'
                                      : c === 'Medium'
                                        ? '#d97706'
                                        : '#16a34a',
                                }
                              : ci === 3
                                ? {
                                    fontWeight: 600,
                                    color:
                                      c === 'High'
                                        ? '#dc2626'
                                        : c === 'Medium'
                                          ? '#d97706'
                                          : '#16a34a',
                                  }
                                : {}
                        )}
                      >
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionBlock>

          {/* S13: Security */}
          <SectionBlock id="ds13" num={14} title="Security">
            <EditableP
              id="ds13"
              text="Security controls will be designed and implemented in alignment with ISO 27001, HIPAA Security Rule, and Meridian's internal Information Security Policy v3.2. The following controls are mandatory for go-live."
            />
            <table
              style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, marginTop: 12 }}
            >
              <thead>
                <tr>
                  {['Control', 'Standard', 'Implementation'].map((h) => (
                    <th key={h} style={thStyle}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    'Encryption at rest',
                    'AES-256',
                    'All PII and financial data in DB and file store',
                  ],
                  [
                    'Encryption in transit',
                    'TLS 1.3',
                    'All client-server and service-to-service communication',
                  ],
                  ['Authentication', 'SAML 2.0 / SSO', 'Federated via Meridian Azure AD'],
                  [
                    'Authorisation',
                    'RBAC (4 levels)',
                    'Configured in platform; reviewed quarterly',
                  ],
                  ['Audit logging', 'ISO 27001 A.12', 'All user actions logged; retained 7 years'],
                  ['Pen testing', 'OWASP Top 10', 'Before UAT and before go-live'],
                  [
                    'Vulnerability scanning',
                    'CVE feed',
                    'Weekly automated scan; P1 patched within 24h',
                  ],
                ].map((row) => (
                  <tr key={row[0]} style={{ borderBottom: '1px solid rgba(0,196,196,0.07)' }}>
                    {row.map((c, ci) => (
                      <td
                        key={ci}
                        style={cell(
                          ci === 1
                            ? { fontFamily: 'monospace', fontSize: 11, color: '#7c3aed' }
                            : {}
                        )}
                      >
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionBlock>

          {/* S14: Architecture */}
          <SectionBlock id="ds14" num={15} title="Architecture">
            <EditableP
              id="ds14"
              text="The solution is built on a three-tier, cloud-native architecture deployed on Azure (APAC East region). All components use managed services to minimise infrastructure overhead and maximise availability."
            />
            <table
              style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, marginTop: 12 }}
            >
              <thead>
                <tr>
                  {['Layer', 'Component', 'Technology', 'Notes'].map((h) => (
                    <th key={h} style={thStyle}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    'Presentation',
                    'Vendor & Staff Portal',
                    'React / Next.js',
                    'Hosted on Azure Static Web Apps',
                  ],
                  [
                    'API',
                    'Procure-to-Pay Engine',
                    'Node.js / FastAPI',
                    'Azure Container Apps; auto-scaling',
                  ],
                  [
                    'Integration',
                    'ERP Connector',
                    'MuleSoft ESB',
                    'Bi-directional sync with SAP & Oracle',
                  ],
                  [
                    'Data',
                    'Primary Database',
                    'Azure SQL (Business Critical)',
                    'Geo-redundant; daily backup',
                  ],
                  [
                    'Data',
                    'Document Store',
                    'Azure Blob Storage',
                    'Encrypted; lifecycle policy 7 years',
                  ],
                  ['Identity', 'IAM', 'Azure AD B2C + SAML', 'Federated SSO for all users'],
                  [
                    'Monitoring',
                    'Observability',
                    'Azure Monitor + Datadog',
                    'Alerts, dashboards, PagerDuty integration',
                  ],
                ].map((row) => (
                  <tr key={row[0]} style={{ borderBottom: '1px solid rgba(0,196,196,0.07)' }}>
                    {row.map((c, ci) => (
                      <td
                        key={ci}
                        style={cell(
                          ci === 2
                            ? { fontFamily: 'monospace', fontSize: 11, color: '#7c3aed' }
                            : {}
                        )}
                      >
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionBlock>

          {/* S15: Acceptance Criteria */}
          <SectionBlock id="ds15" num={16} title="Acceptance Criteria">
            <EditableP
              id="ds15"
              text="The following criteria must be met for each milestone to be formally accepted. The PMO will issue a signed acceptance certificate within 5 business days of receiving the deliverable."
            />
            <table
              style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, marginTop: 12 }}
            >
              <thead>
                <tr>
                  {['Milestone', 'Criteria', 'Verification Method'].map((h) => (
                    <th key={h} style={thStyle}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    'M2 — Discovery',
                    'Solution Design Document reviewed and signed off by CTO',
                    'Email sign-off from CTO within 5 business days',
                  ],
                  [
                    'M3 — Build',
                    'All P1 test cases pass with zero critical defects open',
                    'Test results report submitted by QA lead',
                  ],
                  [
                    'M4 — Integration',
                    'End-to-end PO cycle completes in < 27 days in staging environment',
                    'Performance test report, 1,000-transaction load test',
                  ],
                  [
                    'M5 — Training',
                    '≥ 90% of staff complete training and pass post-assessment',
                    'LMS completion report from Meridian L&D',
                  ],
                  [
                    'M6 — Go-Live',
                    'KPI baseline captured; zero P1 incidents in 10-day hypercare window',
                    'Hypercare report signed by PMO',
                  ],
                ].map((row) => (
                  <tr key={row[0]} style={{ borderBottom: '1px solid rgba(0,196,196,0.07)' }}>
                    {row.map((c, ci) => (
                      <td key={ci} style={cell(ci === 0 ? { fontWeight: 700 } : {})}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionBlock>

          {/* S16: Change Management */}
          <SectionBlock id="ds16" num={17} title="Change Management">
            <EditableP
              id="ds16"
              text="Any change to scope, timeline, or commercials must follow the Change Request process defined below. No informal scope changes are permitted."
            />
            <table
              style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, marginTop: 12 }}
            >
              <thead>
                <tr>
                  {['Step', 'Activity', 'Owner', 'SLA'].map((h) => (
                    <th key={h} style={thStyle}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['1', 'Raise CR Form (template in Schedule C)', 'Requestor', 'Any time'],
                  [
                    '2',
                    'Impact assessment (scope, cost, timeline)',
                    'Consultant PMO',
                    '3 business days',
                  ],
                  [
                    '3',
                    'CR presented to Steering Committee',
                    'Ashika Jain',
                    'Next scheduled SteerCo',
                  ],
                  [
                    '4',
                    'Client approval / rejection',
                    'Client Sponsor',
                    '2 business days post SteerCo',
                  ],
                  [
                    '5',
                    'CR incorporated into project baseline',
                    'Ashika Jain',
                    '1 business day post approval',
                  ],
                ].map((row) => (
                  <tr key={row[0]} style={{ borderBottom: '1px solid rgba(0,196,196,0.07)' }}>
                    {row.map((c, ci) => (
                      <td key={ci} style={cell(ci === 0 ? { fontWeight: 700 } : {})}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionBlock>

          {/* S17: Support & Handover */}
          <SectionBlock id="ds17" num={18} title="Support & Handover">
            <EditableP
              id="ds17"
              text="A structured hypercare period of 4 weeks post go-live is included in this SOW. Following hypercare, the engagement transitions to Meridian's internal IT operations team under the terms defined below."
            />
            <table
              style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, marginTop: 12 }}
            >
              <thead>
                <tr>
                  {['Phase', 'Duration', 'Coverage', 'Owner'].map((h) => (
                    <th key={h} style={thStyle}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    'Hypercare',
                    'Weeks 1–2 post go-live',
                    '24×7 on-call; P1 response 1h',
                    'Karan Bose',
                  ],
                  [
                    'Hypercare',
                    'Weeks 3–4 post go-live',
                    'Business hours; P1 response 4h',
                    'Priya Sharma',
                  ],
                  [
                    'Handover',
                    'End of Week 4',
                    'Knowledge transfer, runbooks, admin credentials',
                    'Rohan Mehta',
                  ],
                  [
                    'BAU Support',
                    'Post handover (out of scope)',
                    'Meridian IT BAU team; ServiceNow tickets',
                    'Meridian IT',
                  ],
                ].map((row) => (
                  <tr key={row[0]} style={{ borderBottom: '1px solid rgba(0,196,196,0.07)' }}>
                    {row.map((c, ci) => (
                      <td key={ci} style={cell({})}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionBlock>

          {/* S18: SLAs */}
          <SectionBlock id="ds18" num={19} title="SLAs">
            <EditableP
              id="ds18"
              text="The following SLAs apply during the hypercare period. Post-handover SLAs are governed by Meridian's internal IT BAU agreement."
            />
            <table
              style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, marginTop: 12 }}
            >
              <thead>
                <tr>
                  {['Priority', 'Definition', 'Response Time', 'Resolution Target'].map((h) => (
                    <th key={h} style={thStyle}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    'P1 — Critical',
                    'Platform down or major data integrity issue',
                    '1 hour (24×7 Weeks 1–2; 4h Weeks 3–4)',
                    '4 hours (8h Weeks 3–4)',
                  ],
                  [
                    'P2 — High',
                    'Core feature unavailable; significant user impact',
                    '4 business hours',
                    '1 business day',
                  ],
                  [
                    'P3 — Medium',
                    'Non-critical feature impaired; workaround available',
                    '1 business day',
                    '3 business days',
                  ],
                  [
                    'P4 — Low',
                    'Cosmetic or minor issue; no operational impact',
                    '3 business days',
                    '10 business days',
                  ],
                ].map((row) => (
                  <tr key={row[0]} style={{ borderBottom: '1px solid rgba(0,196,196,0.07)' }}>
                    {row.map((c, ci) => (
                      <td
                        key={ci}
                        style={cell(
                          ci === 0
                            ? {
                                fontWeight: 700,
                                color: c.startsWith('P1')
                                  ? '#dc2626'
                                  : c.startsWith('P2')
                                    ? '#d97706'
                                    : c.startsWith('P3')
                                      ? '#2563eb'
                                      : '#64748b',
                              }
                            : {}
                        )}
                      >
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionBlock>

          {/* S19: Terms & Conditions */}
          <SectionBlock id="ds19" num={20} title="Terms & Conditions">
            <EditableP
              id="ds19"
              text="This SOW is governed by the Master Services Agreement (MSA) dated 1 October 2026 between Ashika Jain Consulting and Meridian Healthcare. In the event of any conflict, the MSA takes precedence."
            />
            <table
              style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, marginTop: 12 }}
            >
              <thead>
                <tr>
                  {['Clause', 'Summary'].map((h) => (
                    <th key={h} style={thStyle}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    'Payment Terms',
                    'Net 30 from invoice date; late payment interest at 2% per month',
                  ],
                  [
                    'IP Ownership',
                    'All custom-built deliverables become client IP upon final payment; pre-existing consultant IP retained',
                  ],
                  [
                    'Confidentiality',
                    'Both parties bound by NDA (Schedule D); 3-year post-engagement term',
                  ],
                  [
                    'Liability Cap',
                    'Total liability limited to the value of fees paid under this SOW',
                  ],
                  [
                    'Termination for Convenience',
                    'Either party may terminate with 30 days written notice; fees for work completed to date are payable',
                  ],
                  [
                    'Force Majeure',
                    'Neither party liable for delays caused by events beyond reasonable control',
                  ],
                  [
                    'Governing Law',
                    'Laws of Singapore; disputes resolved by ICC arbitration in Singapore',
                  ],
                  [
                    'Variation',
                    'Any changes to these terms must be in writing and signed by both parties',
                  ],
                ].map((row) => (
                  <tr key={row[0]} style={{ borderBottom: '1px solid rgba(0,196,196,0.07)' }}>
                    {row.map((c, ci) => (
                      <td
                        key={ci}
                        style={cell(ci === 0 ? { fontWeight: 700, whiteSpace: 'nowrap' } : {})}
                      >
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionBlock>
        </div>
      </div>

      {/* Non-blocking comment panel — anchored top-right of right pane, no backdrop */}
      {commentingId && (
        <>
          {/* Invisible click-outside catcher */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 399 }}
            onClick={() => {
              setCommentingId(null)
              setCommentText('')
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: 120,
              right: 32,
              zIndex: 400,
              background: '#fff',
              borderRadius: 14,
              padding: '20px 22px',
              width: 320,
              boxShadow: '0 8px 32px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,196,196,0.18)',
              display: 'flex',
              flexDirection: 'column',
              gap: 11,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 2,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0d212c' }}>Add Comment</div>
              <button
                onClick={() => {
                  setCommentingId(null)
                  setCommentText('')
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  fontSize: 18,
                  lineHeight: 1,
                  padding: '0 4px',
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ fontSize: 11.5, color: '#64748b' }}>
              Section:{' '}
              <strong style={{ color: '#0d212c' }}>
                {SOW_DRAFT_SECTIONS.find((s) => s.id === commentingId)?.title}
              </strong>
            </div>
            <textarea
              autoFocus
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Type your comment here…"
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '10px 12px',
                fontSize: 13,
                fontFamily: 'inherit',
                resize: 'vertical',
                minHeight: 80,
                outline: 'none',
                background: '#f8fafc',
                lineHeight: 1.6,
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600, flexShrink: 0 }}>
                Assign to:
              </span>
              <select
                value={commentAssignee}
                onChange={(e) => setCommentAssignee(e.target.value)}
                style={{
                  flex: 1,
                  fontSize: 12.5,
                  border: '1px solid #e2e8f0',
                  borderRadius: 7,
                  padding: '6px 10px',
                  fontFamily: 'inherit',
                  background: '#fff',
                  cursor: 'pointer',
                }}
              >
                {SECTION_MEMBERS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
              <button
                onClick={() => {
                  setCommentingId(null)
                  setCommentText('')
                }}
                style={{
                  padding: '7px 16px',
                  borderRadius: 8,
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
                onClick={saveComment}
                style={{
                  padding: '7px 18px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#00C4C4',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                Save Comment
              </button>
            </div>
          </div>
        </>
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
        style={{ flex: 1, padding: '28px 36px', display: 'flex', flexDirection: 'column', gap: 16 }}
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
          padding: '28px 28px 24px',
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
    setDraftGenState('generating')
    setTimeout(() => {
      setDraftGenState('shimmer')
      setIsDraftUnlocked(true)
      setActiveTab('sow-draft')
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
      <div style={{ flexShrink: 0, padding: '12px 20px 0' }}>
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
              fontSize: 18,
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

        {/* Tab bar + CTA — free, no box */}
        <div>
          <div
            style={{
              display: 'flex',
              gap: 0,
              alignItems: 'center',
              borderBottom: '1px solid rgba(0,196,196,0.15)',
            }}
          >
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
            {/* CTA pinned to the right of the tab strip */}
            <div style={{ marginLeft: 'auto', paddingRight: 4 }}>
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
                      border: '1.5px solid rgba(234,88,12,0.4)',
                      background: 'rgba(234,88,12,0.08)',
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#c2410c',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLButtonElement).style.background =
                        'rgba(234,88,12,0.15)'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLButtonElement).style.background =
                        'rgba(234,88,12,0.08)'
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
                      fontWeight: 700,
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
              ) : (
                <button
                  onClick={showInviteToast}
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
                  Invite Participants
                </button>
              )}
            </div>
          </div>
        </div>
        {/* end glass card tabs wrapper */}
      </div>
      {/* end header area */}

      {/* ── Tab content ── */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: activeTab === 'structure' ? 'hidden' : 'auto',
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
        {activeTab === 'form' && <FormTab files={uploadedFiles} onSubmit={handleFormSubmit} />}
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
          <div style={{ padding: '28px 28px' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#0d212c', marginBottom: 16 }}>
              Audit Log
            </div>
            <div
              style={{
                background: '#fff',
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
