/**
 * @layer organism
 * @description SOW Detail Screen — breadcrumb, tabs, and tab content.
 * Designed to render inside the DashboardScreenV2 app shell (no page wrapper).
 * Tabs: Overview | Form | Structure (unlocks after Form submit) | SOW Draft | Audit Log
 */

'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  Check,
  X,
  ChevronDown,
  CheckCircle2,
  FileText,
  Clock,
  Layers,
  MessageSquare,
  Users,
  User,
  ExternalLink,
  RefreshCw,
  UploadCloud,
  Trash2,
  Edit2,
  Shield,
  Info,
  AlertTriangle,
  Eye,
  Plus,
  ArrowRight,
  Sparkles,
  FileCheck,
  CheckSquare,
  Download,
  RotateCcw,
  History,
} from 'lucide-react'
import { AuditLogView, addGlobalAuditLog } from '../AuditLogView'
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
import { useToast } from '@/contexts/ToastContext'

/* ── Tab config ──────────────────────────────────────────────────────────── */

function buildTabs(structureUnlocked: boolean, draftUnlocked = false) {
  return [
    { id: 'overview' as SOWTab, label: 'Overview', locked: false },
    { id: 'form' as SOWTab, label: 'Context', locked: false },
    { id: 'structure' as SOWTab, label: 'Planning', locked: !structureUnlocked },
    { id: 'sow-draft' as SOWTab, label: 'Draft', locked: !draftUnlocked },
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

function FileIconElement({ ext }: { ext: string }) {
  const e = ext.toLowerCase();
  if (e === 'pdf' || e === 'docx' || e === 'doc' || e === 'txt') {
    return <img src="/icons/pdf-icon.png" alt="PDF" style={{ width: 28, height: 28, objectFit: 'contain' }} />;
  }
  if (e === 'png' || e === 'jpg' || e === 'jpeg') return <img src="/icons/jpg-icon.png" alt="Image" style={{ width: 28, height: 28, objectFit: 'contain' }} />;
  if (e === 'xls' || e === 'xlsx') return <img src="/icons/xls-icon.png" alt="Excel" style={{ width: 28, height: 28, objectFit: 'contain' }} />;
  return <img src="/icons/pdf-icon.png" alt="Document" style={{ width: 28, height: 28, objectFit: 'contain' }} />;
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
            <FileIconElement ext={getFileExt(file.name)} />
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

function SOWWorkflowStepper({ isDraftGenerated = false }: { isDraftGenerated?: boolean }) {
  const steps = [
    { label: 'Context', status: 'done', sublabel: 'Completed', stepIndex: 1 },
    { label: 'Planning', status: 'done', sublabel: 'Completed', stepIndex: 2 },
    {
      label: 'Questions',
      status: isDraftGenerated ? 'done' : 'active',
      sublabel: isDraftGenerated ? 'Completed' : 'In Progress',
      stepIndex: 3,
    },
    {
      label: 'Draft',
      status: isDraftGenerated ? 'active' : 'pending',
      sublabel: isDraftGenerated ? 'In Progress' : 'Not Started',
      stepIndex: 4,
    },
    { label: 'Review', status: 'pending', sublabel: 'Not Started', stepIndex: 5 },
    { label: 'Approval', status: 'pending', sublabel: 'Not Started', stepIndex: 6 },
    { label: 'Finalized', status: 'pending', sublabel: 'Not Started', stepIndex: 7 },
  ];

  const greenLineIdx = isDraftGenerated ? 3 : 2;

  return (
    <div style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: '16px 8px 12px' }}>
      <div style={{ marginBottom: 24 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#0d212c' }}>SOW Workflow</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
        {steps.map((s, idx) => {
          const isDone = s.status === 'done';
          const isActive = s.status === 'active';
          return (
            <React.Fragment key={s.label}>
              {/* Step item */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80, zIndex: 1 }}>
                {isDone ? (
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(16,185,129,0.3)',
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                ) : isActive ? (
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: '#00C4C4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontSize: 13,
                      fontWeight: 700,
                      boxShadow: '0 2px 8px rgba(0,196,196,0.35)',
                    }}
                  >
                    {s.stepIndex}
                  </div>
                ) : (
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: '#eef2f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748b',
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {s.stepIndex}
                  </div>
                )}

                {/* Text below */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, marginTop: 10 }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: isDone ? '#16a34a' : isActive ? '#00a0a0' : '#475569',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {s.label}
                  </span>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 500,
                      color: isActive ? '#00a0a0' : '#94a3b8',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {s.sublabel}
                  </span>
                </div>
              </div>

              {/* Connecting line between steps */}
              {idx < steps.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    marginTop: 15,
                    height: idx < greenLineIdx ? 3 : 0,
                    background: idx < greenLineIdx ? '#10b981' : 'transparent',
                    borderTop: idx >= greenLineIdx ? '2px dotted #cbd5e1' : 'none',
                    borderRadius: idx < greenLineIdx ? 2 : 0,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  )
}

function OverviewTab({ files, isDraftGenerated }: { files: UploadedFile[]; isDraftGenerated?: boolean }) {
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null)
  return (
    <div style={{ padding: '20px 16px' }}>
      {/* ── SOW Workflow Stepper (Above Uploaded Documents) ── */}
      <div style={{ marginBottom: 24 }}>
        <SOWWorkflowStepper isDraftGenerated={isDraftGenerated} />
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
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#cbd5e1'
                ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow =
                  '0 4px 12px rgba(0,0,0,0.06)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#e2e8f0'
                ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow =
                  '0 1px 3px rgba(0,0,0,0.04)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, flexShrink: 0 }}>
                <FileIconElement ext={getFileExt(file.name)} />
              </div>
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

/* ── Form Tab & Context Provenance Tools ──────────────────────────────────── */

export interface ContextCitationTarget {
  title: string
  sourceDoc: string
  page: number
  section: string
  highlightSnippet: string
}

export interface TraceRecord {
  fieldKey: string
  fieldLabel: string
  sourceDoc: {
    fileName: string
    page: number
    section: string
    quote: string
    addedBy: string
    timestamp: string
  }
  contextItem: {
    title: string
    source: string
    summary: string
    addedBy: string
    timestamp: string
  }
  questionAnswer: {
    question: string
    context: string
    answer: string
    addedBy: string
    timestamp: string
  }
  draftStatement: {
    title: string
    meta: string
    statement: string
    createdBy: string
    timestamp: string
  }
  isManuallyEdited?: boolean
  manualEditBy?: string
  manualEditTimestamp?: string
}

const TRACE_DATA_MAP: Record<string, TraceRecord> = {
  clientName: {
    fieldKey: 'clientName',
    fieldLabel: 'Client Name',
    sourceDoc: {
      fileName: 'Clinical_Safety_Case_Hazard_Log.pdf',
      page: 1,
      section: '1. Purpose and scope',
      quote: 'Hippocratic AI – response to M42 Vendor Architecture & Due-Diligence Questionnaire (Round 1) for proposed M42 deployment.',
      addedBy: 'Sarah Khan',
      timestamp: '08 Oct 2026, 11:24',
    },
    contextItem: {
      title: 'Client Organization & Scope',
      source: 'From client requirements',
      summary: 'M42 Health Platform confirming deployment scope across primary hospitals and clinical operations.',
      addedBy: 'Mike Chen',
      timestamp: '08 Oct 2026, 13:17',
    },
    questionAnswer: {
      question: 'Q01. What is the official contracting entity name?',
      context: 'From stakeholder kickoff',
      answer: 'M42 Health Platform (in partnership with Hippocratic AI deployment teams).',
      addedBy: 'Priya Nair',
      timestamp: '08 Oct 2026, 15:03',
    },
    draftStatement: {
      title: 'Draft Statement',
      meta: 'Generated using client input and template',
      statement: 'M42 Health Platform will serve as the primary healthcare network and contracting entity for this deployment.',
      createdBy: 'AI Assistant',
      timestamp: '08 Oct 2026, 15:12',
    },
  },
  description: {
    fieldKey: 'description',
    fieldLabel: 'Description',
    sourceDoc: {
      fileName: 'Clinical_Safety_Case_Hazard_Log.pdf',
      page: 1,
      section: '2. Safety-assurance approach',
      quote: 'The Polaris constellation pairs a primary conversational agent with specialist support models (medication, labs, nutrition, protocol, escalation) that check outputs to raise accuracy and reduce hallucination.',
      addedBy: 'Sarah Khan',
      timestamp: '08 Oct 2026, 11:24',
    },
    contextItem: {
      title: 'Deployment Scope and Architecture',
      source: 'From client requirements',
      summary: 'End-to-end digital transformation of clinical and procurement operations pairing conversational voice agents with specialist models.',
      addedBy: 'Mike Chen',
      timestamp: '08 Oct 2026, 13:17',
    },
    questionAnswer: {
      question: 'Q12. What is the expected deployment scope and core architecture?',
      context: 'From client Q&A session',
      answer: 'Deployment of Polaris constellation generative AI agents with specialist safety supervisor models supporting non-diagnostic workflows.',
      addedBy: 'Priya Nair',
      timestamp: '08 Oct 2026, 15:03',
    },
    draftStatement: {
      title: 'Draft Statement',
      meta: 'Generated using client input and template',
      statement: 'End-to-end digital transformation of clinical and procurement operations, pairing conversational AI agents with specialist safety supervisor models to automate patient-facing workflows and vendor lifecycle management.',
      createdBy: 'AI Assistant',
      timestamp: '08 Oct 2026, 15:12',
    },
  },
  businessOutcome: {
    fieldKey: 'businessOutcome',
    fieldLabel: 'Business Outcome',
    sourceDoc: {
      fileName: 'Clinical_Safety_Case_Hazard_Log.pdf',
      page: 1,
      section: '3. Harm-severity scale & 4. Starting hazard log',
      quote: 'Harm-severity scale: S4 Severe (could cause death/permanent injury), S3 Moderate, S2 Minor, S1 Negligible. Residual risk rated Low across operational and procurement workflows.',
      addedBy: 'Sarah Khan',
      timestamp: '08 Oct 2026, 11:24',
    },
    contextItem: {
      title: 'Target Operational & Safety Metrics',
      source: 'From client requirements',
      summary: 'Reduce cycle time by 40%, achieve 15% cost savings, and maintain zero S4/S3 unescalated clinical incidents.',
      addedBy: 'Mike Chen',
      timestamp: '08 Oct 2026, 13:17',
    },
    questionAnswer: {
      question: 'Q08. What are the primary KPIs for success?',
      context: 'From client Q&A session',
      answer: '40% reduction in turnaround time, 15% efficiency savings, and 100% compliance with clinical safety triage benchmarks.',
      addedBy: 'Priya Nair',
      timestamp: '08 Oct 2026, 15:03',
    },
    draftStatement: {
      title: 'Draft Statement',
      meta: 'Generated using client input and template',
      statement: 'Reduce procurement cycle time by 40%, achieve 15% cost savings through AI-driven vendor recommendations, and maintain zero S4 severe safety incidents across all healthcare operations.',
      createdBy: 'AI Assistant',
      timestamp: '08 Oct 2026, 15:12',
    },
  },
  importanceValue: {
    fieldKey: 'importanceValue',
    fieldLabel: 'Importance & Value of Solution',
    sourceDoc: {
      fileName: 'Clinical_Safety_Case_Hazard_Log.pdf',
      page: 1,
      section: '1. Purpose and scope',
      quote: 'This document summarises how Hippocratic AI identifies, controls and monitors hazards... structured on ISO 14971 risk-management principles so M42 clinical safety officers can review in a familiar form.',
      addedBy: 'Sarah Khan',
      timestamp: '08 Oct 2026, 11:24',
    },
    contextItem: {
      title: 'Value Proposition & Risk Mitigation',
      source: 'From client requirements',
      summary: 'Procurement and operational inefficiencies currently cost M42 an estimated $4.2M annually. Polaris addresses root causes with rigorous clinical safety.',
      addedBy: 'Mike Chen',
      timestamp: '08 Oct 2026, 13:17',
    },
    questionAnswer: {
      question: 'Q04. Why is this initiative urgent for M42?',
      context: 'From executive briefing',
      answer: 'Mitigating $4.2M in annual operational drag and upgrading legacy communication systems before Q2 2026.',
      addedBy: 'Priya Nair',
      timestamp: '08 Oct 2026, 15:03',
    },
    draftStatement: {
      title: 'Draft Statement',
      meta: 'Generated using client input and template',
      statement: 'Procurement and operational inefficiencies currently cost M42 an estimated $4.2M annually in delayed onboarding and manual overhead. Implementing Polaris constellation architecture directly resolves these bottlenecks.',
      createdBy: 'AI Assistant',
      timestamp: '08 Oct 2026, 15:12',
    },
  },
  inScope: {
    fieldKey: 'inScope',
    fieldLabel: 'In Scope',
    sourceDoc: {
      fileName: 'Clinical_Safety_Case_Hazard_Log.pdf',
      page: 1,
      section: '1. Purpose & 2. Safety-assurance approach',
      quote: 'Intended use: Hippocratic AI agents perform non-diagnostic, patient-facing tasks. Multi-stage testing with 7.7K+ clinicians and 775K+ test calls with escalation to human nurses.',
      addedBy: 'Sarah Khan',
      timestamp: '08 Oct 2026, 11:24',
    },
    contextItem: {
      title: 'Agreed In-Scope Deliverables',
      source: 'From client requirements',
      summary: 'Vendor portal setup, AI sourcing engine integration, contract repository migration, role-based access control, real-time spend analytics, and clinical safety monitoring.',
      addedBy: 'Mike Chen',
      timestamp: '08 Oct 2026, 13:17',
    },
    questionAnswer: {
      question: 'Q15. Which modules are explicitly in scope for Phase 1?',
      context: 'From technical architecture review',
      answer: 'Portal setup, Polaris engine integration, role-based access control, spend analytics, and human clinical supervision escalation hooks.',
      addedBy: 'Priya Nair',
      timestamp: '08 Oct 2026, 15:03',
    },
    draftStatement: {
      title: 'Draft Statement',
      meta: 'Generated using client input and template',
      statement: 'Vendor portal setup, AI sourcing engine integration, contract repository migration, role-based access control, real-time spend analytics dashboard, and clinical safety monitoring protocols.',
      createdBy: 'AI Assistant',
      timestamp: '08 Oct 2026, 15:12',
    },
  },
  outOfScope: {
    fieldKey: 'outOfScope',
    fieldLabel: 'Out of Scope',
    sourceDoc: {
      fileName: 'Clinical_Safety_Case_Hazard_Log.pdf',
      page: 1,
      section: '1. Purpose and scope (Intended use)',
      quote: 'Intended use (public position). Hippocratic AI agents perform non-diagnostic, patient-facing tasks. They do not diagnose or prescribe, and are not deployed for hospice, mental-health disorders, or children under two.',
      addedBy: 'Sarah Khan',
      timestamp: '08 Oct 2026, 11:24',
    },
    contextItem: {
      title: 'Explicit Boundaries & Exclusions',
      source: 'From client requirements',
      summary: 'Direct diagnostic or prescribing tasks, hospice, psychiatric disorders, and children under two are strictly excluded.',
      addedBy: 'Mike Chen',
      timestamp: '08 Oct 2026, 13:17',
    },
    questionAnswer: {
      question: 'Q16. What clinical tasks are prohibited for this AI system?',
      context: 'From Clinical Safety Board review',
      answer: 'No diagnostic or prescribing capabilities; exclusions for hospice, mental health, and pediatric patients under age 2.',
      addedBy: 'Priya Nair',
      timestamp: '08 Oct 2026, 15:03',
    },
    draftStatement: {
      title: 'Draft Statement',
      meta: 'Generated using client input and template',
      statement: 'Direct diagnostic or prescribing services, hospice or mental-health disorder deployments, and any operations outside the agreed non-diagnostic patient-facing scope.',
      createdBy: 'AI Assistant',
      timestamp: '08 Oct 2026, 15:12',
    },
  },
  otherContext: {
    fieldKey: 'otherContext',
    fieldLabel: 'Any Other Relevant Context',
    sourceDoc: {
      fileName: 'Clinical_Safety_Case_Hazard_Log.pdf',
      page: 2,
      section: '6. Regulatory positioning in the UAE',
      quote: 'Documented in a regulatory classification memo against UAE MOHAP SaMD guidance and the DoH Abu Dhabi Policy on Use of AI in the Healthcare Sector, submitted to M42 before go-live.',
      addedBy: 'Sarah Khan',
      timestamp: '08 Oct 2026, 11:24',
    },
    contextItem: {
      title: 'UAE Regulatory & Compliance Directives',
      source: 'From client requirements',
      summary: 'Full compliance with UAE MOHAP SaMD guidelines, DoH Abu Dhabi AI policies, and ISO 14971 medical device risk management standards.',
      addedBy: 'Mike Chen',
      timestamp: '08 Oct 2026, 13:17',
    },
    questionAnswer: {
      question: 'Q22. What local health authority regulations must be met before go-live?',
      context: 'From legal & compliance alignment',
      answer: 'UAE MOHAP SaMD guidance and DoH Abu Dhabi AI in Healthcare Sector policy approval.',
      addedBy: 'Priya Nair',
      timestamp: '08 Oct 2026, 15:03',
    },
    draftStatement: {
      title: 'Draft Statement',
      meta: 'Generated using client input and template',
      statement: 'Deployment must comply with UAE MOHAP SaMD guidance and DoH Abu Dhabi AI policies. All data processing and integration contract tests must be HIPAA and local regulation compliant.',
      createdBy: 'AI Assistant',
      timestamp: '08 Oct 2026, 15:12',
    },
  },
}

/* ── Document Citation Preview Modal ──────────────────────────────────────── */

export function DocumentCitationPreviewModal({
  citation,
  onClose,
}: {
  citation: ContextCitationTarget
  onClose: () => void
}) {
  useEffect(() => {
    if (citation.page === 2) {
      const timer = setTimeout(() => {
        const page2El = document.getElementById('citation-doc-page-2')
        if (page2El) {
          page2El.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [citation.page])

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
      onWheel={(e) => e.stopPropagation()}
    >
      <div
        style={{
          background: '#ffffff',
          width: '1080px',
          maxWidth: '96vw',
          height: '92vh',
          borderRadius: '16px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header — Clean with Cross Icon only */}
        <div
          style={{
            padding: '16px 22px',
            background: '#ffffff',
            color: '#0d212c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={18} color="#00a0a0" />
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0d212c' }}>
              {citation.sourceDoc || 'Attachment A: Clinical Safety Case & Hazard Log'}
            </div>
          </div>

          {/* Cross icon only without hover animation */}
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              width: 32,
              height: 32,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Document Body View — Continuous Scroll of All Pages */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            background: '#f1f5f9',
            padding: '24px 20px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '980px',
              margin: '0 auto',
              minHeight: '100%',
              boxSizing: 'border-box',
              background: '#ffffff',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              padding: '40px 52px',
              fontFamily: 'Inter, system-ui, sans-serif',
              color: '#1e293b',
              lineHeight: 1.6,
            }}
          >
            {/* ── PAGE 1 CONTENT ── */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', borderBottom: '1px solid #e2e8f0', paddingBottom: 6, marginBottom: 20 }}>
                <span>Hippocratic AI | Attachment A</span>
                <span>Confidential – Prepared for M42 due diligence – Page 1</span>
              </div>

              <div style={{ fontSize: 12, fontWeight: 700, color: '#00a0a0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Attachment A
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '4px 0 12px' }}>
                Clinical Safety Case &amp; Hazard Log
              </h1>
              <div style={{ fontSize: 13, color: '#475569', marginBottom: 20 }}>
                Hippocratic AI – response to M42 Vendor Architecture &amp; Due-Diligence Questionnaire (Round 1)
              </div>

              {/* Metadata Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24, fontSize: 12.5 }}>
                <tbody>
                  <tr style={{ background: '#f8fafc', color: '#0f172a', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', width: '30%', border: '1px solid #e2e8f0' }}>Item</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid #e2e8f0' }}>Detail</th>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 600, background: '#f8fafc', border: '1px solid #e2e8f0' }}>Questionnaire reference</td>
                    <td style={{ padding: '8px 12px', border: '1px solid #e2e8f0' }}>1.2 (also supports 1.3, 1.7)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 600, background: '#f8fafc', border: '1px solid #e2e8f0' }}>Version / date</td>
                    <td style={{ padding: '8px 12px', border: '1px solid #e2e8f0' }}>v1.0 – 28 September 2026</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 600, background: '#f8fafc', border: '1px solid #e2e8f0' }}>Classification</td>
                    <td style={{ padding: '8px 12px', border: '1px solid #e2e8f0' }}>Confidential – prepared for M42 due diligence</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 12px', fontWeight: 600, background: '#f8fafc', border: '1px solid #e2e8f0' }}>Status</td>
                    <td style={{ padding: '8px 12px', border: '1px solid #e2e8f0' }}>Prepared for submission</td>
                  </tr>
                </tbody>
              </table>

              {/* Basis notice */}
              <div style={{ background: '#f1f5f9', borderLeft: '4px solid #00C4C4', padding: '10px 14px', fontSize: 12, color: '#334155', marginBottom: 24 }}>
                <strong>Basis of this document:</strong> Statements about Hippocratic AI capabilities are drawn from its published materials (listed under Sources). Where specific values are not published, they reflect standard healthcare-SaaS industry practice and are recorded in the Assumptions Register of the accompanying tracker.
              </div>

              {/* Section 1 */}
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '20px 0 8px' }}>
                1. Purpose and scope
              </h2>
              <p style={{ fontSize: 13, color: '#334155', marginBottom: 12 }}>
                This document summarises how Hippocratic AI identifies, controls and monitors hazards that could lead to patient harm from its generative AI voice agents, and sets out a starting hazard log for the proposed M42 deployment. It is structured on ISO 14971 risk-management principles so M42 clinical safety officers can review it in a familiar form. Hippocratic AI&apos;s full internal risk register is available to M42 under mutual NDA and remains the controlling record.
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: '#334155',
                  marginBottom: 20,
                  background: citation.section?.includes('1') ? '#fef08a' : 'transparent',
                  padding: citation.section?.includes('1') ? '6px 10px' : '0',
                  borderRadius: 6,
                  border: citation.section?.includes('1') ? '1px solid #facc15' : 'none',
                }}
              >
                <strong style={{ color: '#0f172a' }}>Intended use (public position).</strong> Hippocratic AI agents perform non-diagnostic, patient-facing tasks. They do not diagnose or prescribe, and are not deployed for hospice, mental-health disorders, or children under two.
              </p>

              {/* Section 2 */}
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '20px 0 8px' }}>
                2. Safety-assurance approach
              </h2>
              <p style={{ fontSize: 13, color: '#334155', marginBottom: 10 }}>
                Hippocratic AI publicly describes a five-phase safety process:
              </p>
              <ul
                style={{
                  paddingLeft: 22,
                  fontSize: 13,
                  color: '#334155',
                  marginBottom: 16,
                  background: citation.section?.includes('2') ? '#fef08a' : 'transparent',
                  borderRadius: 6,
                  paddingTop: citation.section?.includes('2') ? 8 : 0,
                  paddingBottom: citation.section?.includes('2') ? 8 : 0,
                  border: citation.section?.includes('2') ? '1px solid #facc15' : 'none',
                }}
              >
                <li style={{ marginBottom: 6 }}>
                  <strong>Phase 1 – Architecture.</strong> The Polaris constellation pairs a primary conversational agent with specialist support models (e.g., medication, labs, nutrition, protocol, escalation) that check outputs to raise accuracy and reduce hallucination.
                </li>
                <li style={{ marginBottom: 6 }}>
                  <strong>Phase 2 – Output testing.</strong> U.S.-licensed clinicians evaluate the agent by posing as patients; the company reports 7.7K+ clinicians and 775K+ test calls.
                </li>
                <li style={{ marginBottom: 6 }}>
                  <strong>Phase 3 – Human clinical supervision</strong> of live operation.
                </li>
                <li style={{ marginBottom: 6 }}>
                  <strong>Phase 4 – Escalation to human nurses</strong> when clinical triggers are detected.
                </li>
                <li style={{ marginBottom: 6 }}>
                  <strong>Phase 5 – Cross-validation</strong> that real-world performance matches simulated testing, using production volume.
                </li>
              </ul>
              <p style={{ fontSize: 12.5, color: '#475569', marginBottom: 20 }}>
                The RWE-LLM study (medRxiv, 2025) documents a four-stage framework (pre-implementation, tiered review, resolution, continuous monitoring) with nurse review and physician adjudication of flagged calls across severity categories.
              </p>

              {/* Section 3 */}
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '20px 0 8px' }}>
                3. Harm-severity scale (proposed for M42)
              </h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#0d212c', color: '#ffffff' }}>
                    <th style={{ padding: '6px 10px', textAlign: 'left', width: '22%' }}>Level</th>
                    <th style={{ padding: '6px 10px', textAlign: 'left', width: '45%' }}>Definition</th>
                    <th style={{ padding: '6px 10px', textAlign: 'left' }}>Example</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '6px 10px', fontWeight: 600, color: '#ef4444' }}>S4 – Severe</td>
                    <td style={{ padding: '6px 10px' }}>Could cause death or serious permanent injury</td>
                    <td style={{ padding: '6px 10px', color: '#64748b' }}>Failure to escalate chest-pain symptoms during a post-discharge call</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <td style={{ padding: '6px 10px', fontWeight: 600, color: '#f59e0b' }}>S3 – Moderate</td>
                    <td style={{ padding: '6px 10px' }}>Could cause temporary injury needing intervention</td>
                    <td style={{ padding: '6px 10px', color: '#64748b' }}>Incorrect reinforcement of a medication timing instruction</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '6px 10px', fontWeight: 600, color: '#3b82f6' }}>S2 – Minor</td>
                    <td style={{ padding: '6px 10px' }}>Could cause minor, self-limiting harm or distress</td>
                    <td style={{ padding: '6px 10px', color: '#64748b' }}>Confusing appointment preparation instructions</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 10px', fontWeight: 600, color: '#64748b' }}>S1 – Negligible</td>
                    <td style={{ padding: '6px 10px' }}>No clinical impact; experience issue</td>
                    <td style={{ padding: '6px 10px', color: '#64748b' }}>Awkward phrasing, repeated question</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ── PAGE 2 SEPARATOR & CONTENT ── */}
            <div
              id="citation-doc-page-2"
              style={{
                margin: '36px 0 28px',
                paddingTop: 24,
                borderTop: '2px dashed #cbd5e1',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', borderBottom: '1px solid #e2e8f0', paddingBottom: 6, marginBottom: 20 }}>
                <span>Hippocratic AI | Attachment A</span>
                <span>Confidential – Prepared for M42 due diligence – Page 2</span>
              </div>

              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '10px 0 12px' }}>
                4. Starting hazard log (M42 deployment)
              </h2>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
                Residual risk is rated after controls on a Low / Medium / High scale; ratings are re-scored jointly with M42 clinical safety leads at the quarterly review.
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24, fontSize: 11.5 }}>
                <thead>
                  <tr style={{ background: '#0d212c', color: '#ffffff' }}>
                    <th style={{ padding: '6px 8px', textAlign: 'left', width: '7%' }}>ID</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left', width: '20%' }}>Hazard</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left', width: '20%' }}>Cause</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left', width: '35%' }}>Controls</th>
                    <th style={{ padding: '6px 8px', textAlign: 'center', width: '8%' }}>Sev.</th>
                    <th style={{ padding: '6px 8px', textAlign: 'center', width: '10%' }}>Residual</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '6px 8px', fontWeight: 700 }}>H-01</td>
                    <td style={{ padding: '6px 8px' }}>Missed escalation of red-flag symptom</td>
                    <td style={{ padding: '6px 8px', color: '#64748b' }}>Patient downplays symptoms; ASR error</td>
                    <td style={{ padding: '6px 8px' }}>Clinical-escalation supervisor model; probing behaviour; conservative thresholds; escalation to M42 nurse queue; call sampling</td>
                    <td style={{ padding: '6px 8px', textAlign: 'center', color: '#ef4444', fontWeight: 600 }}>S4</td>
                    <td style={{ padding: '6px 8px', textAlign: 'center', color: '#16a34a', fontWeight: 600 }}>Low</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <td style={{ padding: '6px 8px', fontWeight: 700 }}>H-02</td>
                    <td style={{ padding: '6px 8px' }}>Incorrect medication information</td>
                    <td style={{ padding: '6px 8px', color: '#64748b' }}>Hallucination; stale med list</td>
                    <td style={{ padding: '6px 8px' }}>Medication supervisor model; EHR as source of truth; agent does not change doses; escalation for discrepancies</td>
                    <td style={{ padding: '6px 8px', textAlign: 'center', color: '#f59e0b', fontWeight: 600 }}>S3</td>
                    <td style={{ padding: '6px 8px', textAlign: 'center', color: '#16a34a', fontWeight: 600 }}>Low</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '6px 8px', fontWeight: 700 }}>H-03</td>
                    <td style={{ padding: '6px 8px' }}>PHI disclosed to wrong person</td>
                    <td style={{ padding: '6px 8px', color: '#64748b' }}>Failed identity verification</td>
                    <td style={{ padding: '6px 8px' }}>Identity verification before any PHI; caregiver-consent rules; privacy supervisor</td>
                    <td style={{ padding: '6px 8px', textAlign: 'center', color: '#3b82f6', fontWeight: 600 }}>S2</td>
                    <td style={{ padding: '6px 8px', textAlign: 'center', color: '#16a34a', fontWeight: 600 }}>Low</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <td style={{ padding: '6px 8px', fontWeight: 700 }}>H-04</td>
                    <td style={{ padding: '6px 8px' }}>Misunderstanding in Arabic dialect</td>
                    <td style={{ padding: '6px 8px', color: '#64748b' }}>Dialect/code-switching; audio quality</td>
                    <td style={{ padding: '6px 8px' }}>Emirati Arabic support (public); contextual ASR; clarification and read-back; local validation with M42 clinicians</td>
                    <td style={{ padding: '6px 8px', textAlign: 'center', color: '#f59e0b', fontWeight: 600 }}>S3</td>
                    <td style={{ padding: '6px 8px', textAlign: 'center', color: '#ea580c', fontWeight: 600 }}>Medium (Low after local val.)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '6px 8px', fontWeight: 700 }}>H-05</td>
                    <td style={{ padding: '6px 8px' }}>Scope creep into diagnosis</td>
                    <td style={{ padding: '6px 8px', color: '#64748b' }}>Patient asks for diagnosis/prescription</td>
                    <td style={{ padding: '6px 8px' }}>Hard scope constraints; redirect to clinician; supervisor checks</td>
                    <td style={{ padding: '6px 8px', textAlign: 'center', color: '#f59e0b', fontWeight: 600 }}>S3</td>
                    <td style={{ padding: '6px 8px', textAlign: 'center', color: '#16a34a', fontWeight: 600 }}>Low</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <td style={{ padding: '6px 8px', fontWeight: 700 }}>H-06</td>
                    <td style={{ padding: '6px 8px' }}>Safeguarding cue missed</td>
                    <td style={{ padding: '6px 8px', color: '#64748b' }}>Self-harm or abuse disclosure</td>
                    <td style={{ padding: '6px 8px' }}>Escalation skills for suicidal ideation and child-protection alerts (Polaris 5.0); immediate human handoff protocol agreed with M42</td>
                    <td style={{ padding: '6px 8px', textAlign: 'center', color: '#ef4444', fontWeight: 600 }}>S4</td>
                    <td style={{ padding: '6px 8px', textAlign: 'center', color: '#16a34a', fontWeight: 600 }}>Low</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '6px 8px', fontWeight: 700 }}>H-07</td>
                    <td style={{ padding: '6px 8px' }}>Dependency outage mid-call</td>
                    <td style={{ padding: '6px 8px', color: '#64748b' }}>Telephony/ASR/model/EHR failure</td>
                    <td style={{ padding: '6px 8px' }}>Fail-safe: no clinical guidance without supervisor checks; graceful call end with callback; queued write-backs (see Attachment Q)</td>
                    <td style={{ padding: '6px 8px', textAlign: 'center', color: '#3b82f6', fontWeight: 600 }}>S2</td>
                    <td style={{ padding: '6px 8px', textAlign: 'center', color: '#16a34a', fontWeight: 600 }}>Low</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 8px', fontWeight: 700 }}>H-08</td>
                    <td style={{ padding: '6px 8px' }}>Write-back of wrong data to EHR</td>
                    <td style={{ padding: '6px 8px', color: '#64748b' }}>Mapping error</td>
                    <td style={{ padding: '6px 8px' }}>Integration contract tests; clinician review of documented outcomes; reconciliation reports</td>
                    <td style={{ padding: '6px 8px', textAlign: 'center', color: '#f59e0b', fontWeight: 600 }}>S3</td>
                    <td style={{ padding: '6px 8px', textAlign: 'center', color: '#16a34a', fontWeight: 600 }}>Low</td>
                  </tr>
                </tbody>
              </table>

              {/* Section 5 & 6 */}
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '16px 0 8px' }}>
                5. Monitoring and review
              </h2>
              <ul style={{ paddingLeft: 20, fontSize: 12.5, color: '#334155', marginBottom: 16 }}>
                <li>Hippocratic AI states that 0.5%–1% of all live calls are sampled for safety review.</li>
                <li>Monthly joint safety review with M42 (escalation rates, flagged calls, near-misses), and a quarterly hazard-log refresh.</li>
                <li>Any S3/S4 event triggers the incident process in Attachment P.</li>
              </ul>

              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '16px 0 8px' }}>
                6. Regulatory positioning in the UAE
              </h2>
              <p
                style={{
                  fontSize: 12.5,
                  color: '#334155',
                  marginBottom: 16,
                  background: citation.section?.includes('6') ? '#fef08a' : 'transparent',
                  padding: citation.section?.includes('6') ? '6px 10px' : '0',
                  borderRadius: 6,
                  border: citation.section?.includes('6') ? '1px solid #facc15' : 'none',
                }}
              >
                Because the agents are non-diagnostic, Hippocratic AI&apos;s position is that they are not Software as a Medical Device. This position will be documented in a regulatory classification memo against UAE MOHAP SaMD guidance and the DoH Abu Dhabi Policy on Use of AI in the Healthcare Sector, submitted to M42 before go-live.
              </p>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12, marginTop: 16 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  Sources (verify against these authoritative references):
                </div>
                <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>
                  • Hippocratic AI Safety page – https://hippocraticai.com/safety/<br />
                  • Bhimani et al., &ldquo;Real-World Evaluation of Large Language Models in Healthcare (RWE-LLM)&rdquo;, medRxiv (2025)<br />
                  • ISO 14971:2019 Medical devices – Application of risk management<br />
                  • Department of Health – Abu Dhabi – https://www.doh.gov.ae/
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

/* ── Field Provenance Trace Drawer ────────────────────────────────────────── */

export function FieldTraceDrawer({
  traceData,
  onClose,
  onOpenCitation,
}: {
  traceData: TraceRecord
  onClose: () => void
  onOpenCitation: (doc: ContextCitationTarget) => void
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const historyItems: {
    id: string
    when: string
    who: string
    role: string
    content: string
    isLatest: boolean
    canViewPage?: boolean
  }[] = []

  if (traceData.isManuallyEdited) {
    historyItems.push({
      id: 'manual',
      when: traceData.manualEditTimestamp || 'Oct 06, 2026, 11:20 AM',
      who: traceData.manualEditBy || 'Ashika Jain (PMO)',
      role: 'Manual Edit',
      content: traceData.draftStatement?.statement || traceData.contextItem?.summary || 'Updated field content directly during review.',
      isLatest: true,
    })
  }

  if (traceData.contextItem) {
    historyItems.push({
      id: 'context',
      when: traceData.contextItem.timestamp || 'Oct 05, 2026, 04:15 PM',
      who: traceData.contextItem.addedBy || 'AI Extraction System',
      role: 'Context Extraction',
      content: traceData.contextItem.summary || traceData.contextItem.title,
      isLatest: !traceData.isManuallyEdited,
    })
  }

  if (traceData.sourceDoc) {
    historyItems.push({
      id: 'source',
      when: traceData.sourceDoc.timestamp || 'Oct 05, 2026, 09:30 AM',
      who: traceData.sourceDoc.addedBy || 'Source Document',
      role: `Source Citation (${traceData.sourceDoc.fileName}, p. ${traceData.sourceDoc.page})`,
      content: traceData.sourceDoc.quote || `Extracted from ${traceData.sourceDoc.fileName}`,
      isLatest: false,
      canViewPage: true,
    })
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        width: 440,
        maxWidth: '100%',
        height: '100%',
        background: '#ffffff',
        borderLeft: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-4px 0 16px rgba(0,0,0,0.06)',
        borderTopRightRadius: 0,
        borderBottomRightRadius: 16,
        zIndex: 50,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Drawer Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#0d212c' }}>
            View trace
          </span>
          <span style={{ fontSize: 13, color: '#64748b' }}>
            &mdash; {traceData.fieldLabel}
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b',
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Minimal Context History List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#fafbfc' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, position: 'relative' }}>
          {/* Subtle timeline track */}
          <div
            style={{
              position: 'absolute',
              left: 7,
              top: 14,
              bottom: 14,
              width: 1.5,
              background: '#e2e8f0',
              zIndex: 1,
            }}
          />

          {historyItems.map((item) => (
            <div key={item.id} style={{ display: 'flex', gap: 14, position: 'relative', zIndex: 2 }}>
              {/* Timeline node */}
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: '#ffffff',
                  border: item.isLatest ? '2.5px solid #00a0a0' : '2px solid #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2,
                }}
              />

              {/* Content Details */}
              <div
                style={{
                  flex: 1,
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: '12px 14px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 6,
                    gap: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0d212c' }}>
                      {item.who}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: '#64748b',
                        background: '#f1f5f9',
                        padding: '1px 6px',
                        borderRadius: 4,
                      }}
                    >
                      {item.role}
                    </span>
                  </div>
                  <span style={{ fontSize: 11.5, color: '#94a3b8' }}>
                    {item.when}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: 12.5,
                    color: '#334155',
                    lineHeight: 1.55,
                    background: '#f8fafc',
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: '1px solid #f1f5f9',
                  }}
                >
                  {item.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Statement-Level Item Trace Modal (Planning / Structure Tab) ─────────── */

export function ItemTraceModal({
  item,
  label,
  onClose,
  onOpenCitation,
}: {
  item: SectionItem
  label: string
  onClose: () => void
  onOpenCitation?: (target: ContextCitationTarget) => void
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Mock authentic revision logs representing the statement lifecycle
  const revisions = [
    {
      version: 3,
      isCurrent: true,
      tag: 'Latest Revision',
      author: item.response ? 'Ashika Jain' : 'Narendra',
      role: item.response ? 'PMO Lead' : 'Contributor',
      avatarColor: item.response ? '#00C4C4' : '#10b981',
      initials: item.response ? 'AJ' : 'NA',
      timestamp: 'Today, 15:42',
      changeReason: item.response
        ? 'Captured validated stakeholder response and refined requirement scope'
        : 'Updated question phrasing for clarity and client alignment',
      content: item.text,
      response: item.response,
    },
    {
      version: 2,
      isCurrent: false,
      tag: 'Revision 2',
      author: 'Marcus Brody',
      role: 'Compliance Lead',
      avatarColor: '#ec4899',
      initials: 'MB',
      timestamp: 'Yesterday, 11:20',
      changeReason: 'Refined compliance requirements and verified HL7/FHIR cross-reference',
      content: item.text.includes('?')
        ? item.text.replace(/\?$/, ' with mandatory data governance checks?')
        : item.text + ' (subject to data governance audit)',
      response: undefined,
    },
    {
      version: 1,
      isCurrent: false,
      tag: 'Initial AI Extraction',
      author: 'AI Extraction Agent',
      role: 'RFP Parser v2.4',
      avatarColor: '#8b5cf6',
      initials: 'AI',
      timestamp: 'Oct 2, 2026, 09:30',
      changeReason: 'Initial extraction from Scope_Requirements_RFP.pdf (Section 3.2)',
      content: item.text.length > 55 ? item.text.slice(0, 50) + '... [Original RFP extract]' : item.text,
      sourceDoc: 'Clinical Safety Case & Hazard Log Attachment A.pdf',
      page: 1,
      response: undefined,
    },
  ]

  const totalModifications = revisions.length - 1

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          width: 620,
          maxWidth: '94vw',
          maxHeight: '88vh',
          borderRadius: 16,
          boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#fafafa',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(0,196,196,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00a0a0',
              }}
            >
              <History size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#0d212c' }}>
                  Statement Traceability
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#00a0a0',
                    background: 'rgba(0,196,196,0.12)',
                    padding: '2px 8px',
                    borderRadius: 12,
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#64748b',
                    background: '#f1f5f9',
                    padding: '2px 8px',
                    borderRadius: 12,
                  }}
                >
                  Changed {totalModifications} {totalModifications === 1 ? 'time' : 'times'} ({revisions.length} versions)
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                Full provenance audit log, modification history and editor timestamps
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: 8,
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b',
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Scrollable Revision Timeline */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', background: '#f8fafc' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, position: 'relative' }}>
            {/* Subtle timeline track */}
            <div
              style={{
                position: 'absolute',
                left: 7,
                top: 14,
                bottom: 14,
                width: 1.5,
                background: '#e2e8f0',
                zIndex: 1,
              }}
            />

            {revisions.map((rev) => (
              <div key={rev.version} style={{ display: 'flex', gap: 14, position: 'relative', zIndex: 2 }}>
                {/* Timeline node */}
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: '#ffffff',
                    border: rev.isCurrent ? '2.5px solid #00a0a0' : '2px solid #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                />

                {/* Content Details */}
                <div
                  style={{
                    flex: 1,
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    padding: '12px 14px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 6,
                      gap: 8,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0d212c' }}>
                        {rev.author}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: '#64748b',
                          background: '#f1f5f9',
                          padding: '1px 6px',
                          borderRadius: 4,
                        }}
                      >
                        {rev.role}
                      </span>
                      {rev.isCurrent && (
                        <span
                          style={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 4,
                            background: '#dcfce7',
                            color: '#15803d',
                          }}
                        >
                          Current
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: 11.5, color: '#94a3b8' }}>
                      {rev.timestamp}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: 12.5,
                      color: '#334155',
                      lineHeight: 1.55,
                      background: '#f8fafc',
                      padding: '8px 10px',
                      borderRadius: 6,
                      border: '1px solid #f1f5f9',
                    }}
                  >
                    <div>{rev.content}</div>
                    {rev.response && (
                      <div style={{ marginTop: 6, color: '#007a7a', fontWeight: 500 }}>
                        {rev.response}
                      </div>
                    )}
                    {rev.changeReason && (
                      <div style={{ marginTop: 4, fontSize: 11.5, color: '#64748b', fontStyle: 'italic' }}>
                        {rev.changeReason}
                      </div>
                    )}
                  </div>

                  {rev.sourceDoc && (
                    <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() =>
                          onOpenCitation?.({
                            title: item.text,
                            sourceDoc: rev.sourceDoc!,
                            page: rev.page || 1,
                            section: 'Clinical Safety Case & Hazard Log',
                            highlightSnippet: 'Clinical Safety Case',
                          })
                        }
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '3px 8px',
                          borderRadius: 5,
                          background: 'rgba(37,99,235,0.08)',
                          border: '1px solid rgba(37,99,235,0.25)',
                          color: '#2563eb',
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <FileText size={11} />
                        View Source Document ({rev.sourceDoc})
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 24px',
            borderTop: '1px solid #e2e8f0',
            background: '#fafafa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: 12, color: '#64748b' }}>
            Statement UID: <code style={{ fontSize: 11, background: '#e2e8f0', padding: '1px 5px', borderRadius: 4 }}>{item.id}</code>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '7px 18px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#0d212c',
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Draft Section Trace Modal (Draft Tab) ───────────────────────────────── */

export function DraftSectionTraceModal({
  sectionTitle,
  sectionIdx,
  onClose,
  onOpenCitation,
}: {
  sectionTitle: string
  sectionIdx: number
  onClose: () => void
  onOpenCitation?: (target: ContextCitationTarget) => void
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const draftSectionRevisions = [
    {
      version: 3,
      isCurrent: true,
      tag: 'Latest Review Edit',
      author: 'Ashika Jain',
      role: 'PMO Lead',
      initials: 'AJ',
      avatarColor: '#00C4C4',
      timestamp: 'Today, 16:15',
      summary: 'Updated deliverable deadlines, SLA terms, and compliance sign-off requirements.',
      diffSummary: '+3 clauses updated, SLA response hours refined.',
    },
    {
      version: 2,
      isCurrent: false,
      tag: 'Reviewer Feedback',
      author: 'Ishita',
      role: 'Reviewer',
      initials: 'IR',
      avatarColor: '#8b5cf6',
      timestamp: 'Yesterday, 14:02',
      summary: 'Reviewed against RFP specifications and added cross-reference to Attachment A.',
      diffSummary: 'Resolved comment c1 and confirmed Phase 1 milestones.',
    },
    {
      version: 1,
      isCurrent: false,
      tag: 'AI Agent Generation',
      author: 'AI SOW Agent',
      role: 'Deep Extraction v3',
      initials: 'AI',
      avatarColor: '#0284c7',
      timestamp: 'Oct 3, 2026, 10:15',
      summary: 'Synthesized initial draft from RFP_Document.pdf & Project_Plan.pdf.',
      diffSummary: 'Initial section generation (1,420 words).',
    },
  ]

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          width: 600,
          maxWidth: '94vw',
          maxHeight: '85vh',
          borderRadius: 16,
          boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#fafafa',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(0,196,196,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00a0a0',
              }}
            >
              <History size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#0d212c' }}>
                  Section Trace: {sectionTitle}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#00a0a0',
                    background: 'rgba(0,196,196,0.12)',
                    padding: '2px 8px',
                    borderRadius: 12,
                  }}
                >
                  3 Changes Logged
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                Audit history of edits, AI generation, and reviewer modifications
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: 8,
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b',
            }}
          >
            <X size={15} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', background: '#fafbfc' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                left: 7,
                top: 14,
                bottom: 14,
                width: 1.5,
                background: '#e2e8f0',
                zIndex: 1,
              }}
            />

            {draftSectionRevisions.map((rev) => (
              <div key={rev.version} style={{ display: 'flex', gap: 14, position: 'relative', zIndex: 2 }}>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: '#ffffff',
                    border: rev.isCurrent ? '2.5px solid #00a0a0' : '2px solid #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                />

                <div
                  style={{
                    flex: 1,
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    padding: '12px 14px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 6,
                      gap: 8,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0d212c' }}>
                        {rev.author}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: '#64748b',
                          background: '#f1f5f9',
                          padding: '1px 6px',
                          borderRadius: 4,
                        }}
                      >
                        {rev.role}
                      </span>
                    </div>
                    <span style={{ fontSize: 11.5, color: '#94a3b8' }}>
                      {rev.timestamp}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: 12.5,
                      color: '#334155',
                      lineHeight: 1.55,
                      background: '#f8fafc',
                      padding: '8px 10px',
                      borderRadius: 6,
                      border: '1px solid #f1f5f9',
                    }}
                  >
                    <div>{rev.summary}</div>
                    {rev.diffSummary && (
                      <div style={{ marginTop: 4, fontSize: 11.5, color: '#64748b' }}>
                        {rev.diffSummary}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            padding: '12px 24px',
            borderTop: '1px solid #e2e8f0',
            background: '#fafafa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '7px 18px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#0d212c',
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Reviewer & Participants Modal ─────────────────────────────────────────── */

const REVIEWERS_DEFAULT = [
  { id: 'r1', name: 'Dr. Sultan Al Hashimi', role: 'Clinical Safety Lead', initials: 'SH', color: '#00C4C4' },
  { id: 'r2', name: 'Fatima Al Mansoori', role: 'Compliance Officer', initials: 'FM', color: '#8b5cf6' },
  { id: 'r3', name: 'Karan Bose', role: 'PMO Analyst', initials: 'KB', color: '#ef4444' },
]

export function ReviewerAndParticipantsModal({
  onClose,
  initialTab = 'reviewers',
  onConfirmReviewers,
}: {
  onClose: () => void
  initialTab?: 'reviewers' | 'participants'
  onConfirmReviewers?: (count: number) => void
}) {
  const [modalTab, setModalTab] = useState<'reviewers' | 'participants'>(initialTab)
  const [activeCategory, setActiveCategory] = useState<'all' | 'reviewers' | 'contributors' | 'clients' | 'pmo'>('all')
  const [reviewers, setReviewers] = useState(REVIEWERS_DEFAULT)
  const [selectedIds, setSelectedIds] = useState<string[]>(REVIEWERS_DEFAULT.map((r) => r.id))
  const [newEmail, setNewEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const { showToast } = useToast()

  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const PARTICIPANTS = [
    { id: '1', name: 'Sarah Khan', role: 'Clinical Safety Lead', type: 'reviewers', email: 'sarah.khan@m42.ae', initials: 'SK', color: '#8b5cf6', status: 'Active' },
    { id: '2', name: 'Marcus Brody', role: 'Compliance Officer', type: 'reviewers', email: 'marcus.brody@m42.ae', initials: 'MB', color: '#ec4899', status: 'Active' },
    { id: '3', name: 'Priya Nair', role: 'Legal & Risk Lead', type: 'reviewers', email: 'priya.nair@m42.ae', initials: 'PN', color: '#3b82f6', status: 'Pending Review' },
    { id: '4', name: 'Mike Chen', role: 'Solutions Architect', type: 'contributors', email: 'mike.chen@hippocratic.ai', initials: 'MC', color: '#10b981', status: 'Active' },
    { id: '5', name: 'Emily Davis', role: 'Senior Cloud Engineer', type: 'contributors', email: 'emily.davis@hippocratic.ai', initials: 'ED', color: '#f59e0b', status: 'Active' },
    { id: '6', name: 'David Kim', role: 'Integration Lead', type: 'contributors', email: 'david.kim@hippocratic.ai', initials: 'DK', color: '#6366f1', status: 'Active' },
    { id: '7', name: 'Dr. Sultan Al Hashimi', role: 'M42 Healthcare Director', type: 'clients', email: 'sultan.hashimi@m42.ae', initials: 'SH', color: '#0ea5e9', status: 'Client Stakeholder' },
    { id: '8', name: 'Fatima Al Mansoori', role: 'Head of Procurement', type: 'clients', email: 'fatima.mansoori@m42.ae', initials: 'FM', color: '#14b8a6', status: 'Client Stakeholder' },
    { id: '9', name: 'Ashika Jain', role: 'Lead PMO Manager', type: 'pmo', email: 'ashika.jain@organization.com', initials: 'AJ', color: '#00C4C4', status: 'Owner / PMO' },
  ]

  const filtered = activeCategory === 'all' ? PARTICIPANTS : PARTICIPANTS.filter((p) => p.type === activeCategory)

  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/

  const handleAddReviewer = () => {
    const trimmed = newEmail.trim()
    if (!trimmed) {
      setEmailError('Please enter an email address')
      return
    }
    if (!emailRegex.test(trimmed)) {
      setEmailError('Please enter a valid email address (e.g. user@organization.com)')
      return
    }
    const newId = `r${Date.now()}`
    setReviewers((prev) => [
      ...prev,
      {
        id: newId,
        name: trimmed.split('@')[0].replace('.', ' '),
        role: 'Reviewer',
        initials: trimmed.slice(0, 2).toUpperCase(),
        color: '#00C4C4',
      },
    ])
    setSelectedIds((prev) => [...prev, newId])
    setNewEmail('')
    setEmailError('')
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleSaveReviewers = () => {
    showToast(`${selectedIds.length} reviewer${selectedIds.length === 1 ? '' : 's'} assigned successfully!`, 'success')
    onConfirmReviewers?.(selectedIds.length)
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          width: '640px',
          maxWidth: '94vw',
          height: '660px',
          maxHeight: '92vh',
          borderRadius: '16px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0d212c' }}>
            Reviewer &amp; Participants
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: 8,
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Top Navigation Tabs: Assign Reviewers (1st) | Participants (2nd) */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #f1f5f9',
            background: '#fafbfc',
            padding: '0 24px',
            gap: 24,
          }}
        >
          <button
            type="button"
            onClick={() => setModalTab('reviewers')}
            style={{
              padding: '12px 2px',
              border: 'none',
              borderBottom: modalTab === 'reviewers' ? '2.5px solid #00C4C4' : '2.5px solid transparent',
              background: 'transparent',
              fontSize: 13.5,
              fontWeight: modalTab === 'reviewers' ? 700 : 500,
              color: modalTab === 'reviewers' ? '#007a7a' : '#64748b',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Assign Reviewers
          </button>
          <button
            type="button"
            onClick={() => setModalTab('participants')}
            style={{
              padding: '12px 2px',
              border: 'none',
              borderBottom: modalTab === 'participants' ? '2.5px solid #00C4C4' : '2.5px solid transparent',
              background: 'transparent',
              fontSize: 13.5,
              fontWeight: modalTab === 'participants' ? 700 : 500,
              color: modalTab === 'participants' ? '#007a7a' : '#64748b',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Participants
          </button>
        </div>

        {modalTab === 'reviewers' ? (
          /* ── Assign Reviewers Tab (1st Tab) ── */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '20px 24px' }}>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>
              Select the reviewers who will receive access to this SOW draft.
            </div>

            {/* Reviewers List with Horizontal Separators (No bounding box / stroke / fill) */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', paddingRight: 4, marginBottom: 16 }}>
              {reviewers.map((r) => {
                const isChecked = selectedIds.includes(r.id)
                return (
                  <div
                    key={r.id}
                    onClick={() => toggleSelect(r.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 4px',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    {/* Styled Lucide Checkbox */}
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        background: isChecked ? '#00C4C4' : '#ffffff',
                        border: isChecked ? '1.5px solid #00C4C4' : '1.5px solid #cbd5e1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                        flexShrink: 0,
                      }}
                    >
                      {isChecked && <Check size={12} color="#ffffff" strokeWidth={3} />}
                    </div>

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
                        fontSize: 12.5,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {r.initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0d212c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.name}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{r.role}</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setReviewers((prev) => prev.filter((x) => x.id !== r.id))
                        setSelectedIds((prev) => prev.filter((x) => x !== r.id))
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#cbd5e1',
                        fontSize: 14,
                        padding: '2px 4px',
                      }}
                      title="Remove"
                      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#ef4444')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#cbd5e1')}
                    >
                      ✕
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Add Reviewer Input with Validation */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={newEmail}
                  onChange={(e) => {
                    setNewEmail(e.target.value)
                    if (emailError) setEmailError('')
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddReviewer()
                    }
                  }}
                  placeholder="Enter reviewer email (e.g. name@company.com)…"
                  style={{
                    flex: 1,
                    border: emailError ? '1.5px solid #ef4444' : '1.5px solid #e2e8f0',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontSize: 13,
                    outline: 'none',
                    fontFamily: 'inherit',
                    background: '#ffffff',
                    transition: 'all 0.15s ease',
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddReviewer}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#00C4C4',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#ffffff',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 8px rgba(0,196,196,0.3)',
                  }}
                >
                  + Add
                </button>
              </div>
              {emailError && (
                <div style={{ fontSize: 11.5, color: '#dc2626', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
                  <AlertTriangle size={12} />
                  {emailError}
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
              <button
                type="button"
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
                type="button"
                onClick={handleSaveReviewers}
                style={{
                  padding: '9px 20px',
                  borderRadius: 9,
                  border: 'none',
                  background: '#00C4C4',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#fff',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,196,196,0.3)',
                }}
              >
                Save Reviewers ({selectedIds.length})
              </button>
            </div>
          </div>
        ) : (
          /* ── Participants Tab (2nd Tab) ── */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Category Filter Tabs */}
            <div
              style={{
                display: 'flex',
                gap: 6,
                padding: '12px 24px',
                borderBottom: '1px solid #f1f5f9',
                background: '#ffffff',
                overflowX: 'auto',
              }}
            >
              {[
                { id: 'all', label: `All (${PARTICIPANTS.length})` },
                { id: 'reviewers', label: `Reviewers (3)` },
                { id: 'contributors', label: `Contributors (3)` },
                { id: 'clients', label: `Clients (2)` },
                { id: 'pmo', label: `PMO (1)` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id as 'all' | 'reviewers' | 'contributors' | 'clients' | 'pmo')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    background: activeCategory === tab.id ? '#00C4C4' : '#f1f5f9',
                    color: activeCategory === tab.id ? '#ffffff' : '#64748b',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Participants List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '4px 24px', display: 'flex', flexDirection: 'column' }}>
              {filtered.map((user) => {
                const roleLabel =
                  user.type === 'reviewers'
                    ? 'Reviewer'
                    : user.type === 'contributors'
                    ? 'Contributor'
                    : user.type === 'clients'
                    ? 'Client'
                    : 'PMO'

                const hasEditAccess = user.type !== 'reviewers'

                return (
                  <div
                    key={user.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '14px 0',
                      background: '#ffffff',
                      borderBottom: '1px solid #f1f5f9',
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        background: user.color,
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 13,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {user.initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: '#0d212c' }}>
                          {user.name}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 500,
                            padding: '1px 7px',
                            borderRadius: 4,
                            background:
                              user.type === 'reviewers'
                                ? '#f3e8ff'
                                : user.type === 'contributors'
                                ? '#ecfdf5'
                                : user.type === 'clients'
                                ? '#e0f2fe'
                                : '#ccfbf1',
                            color:
                              user.type === 'reviewers'
                                ? '#7e22ce'
                                : user.type === 'contributors'
                                ? '#047857'
                                : user.type === 'clients'
                                ? '#0369a1'
                                : '#0f766e',
                          }}
                        >
                          {roleLabel}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        {user.email}
                      </div>
                    </div>

                    {/* Right side: Simple text access indicator */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: hasEditAccess ? '#047857' : '#64748b',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {hasEditAccess ? 'Edit Access' : 'View Access'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: '12px 24px',
                borderTop: '1px solid #f1f5f9',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '7px 18px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: '#0d212c',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export const SOWParticipantsModal = ReviewerAndParticipantsModal

/* ── Context Field Header (Matches User Image 1 Placement) ─────────────────── */

function ContextFieldHeader({
  label,
  citation,
  isManuallyEdited = false,
  onOpenCitation,
  onOpenTrace,
}: {
  label: string
  citation?: {
    sourceDoc: string
    page: number
    section: string
    highlightSnippet: string
  }
  isManuallyEdited?: boolean
  onOpenCitation?: () => void
  onOpenTrace?: () => void
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
        padding: '2px 0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
        <label
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: '#0d212c',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </label>

        {/* Source Citation or Manually Edited Chip */}
        {isManuallyEdited ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              fontWeight: 600,
              color: '#b45309',
              background: '#fef3c7',
              border: '1px solid #fde68a',
              padding: '2px 8px',
              borderRadius: 6,
              whiteSpace: 'nowrap',
            }}
          >
            <Edit2 size={11} />
            Manually Edited
          </span>
        ) : citation ? (
          <button
            type="button"
            onClick={onOpenCitation}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 500,
              color: '#475569',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              padding: '3.5px 10px',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title="Click to preview citation with highlighted text in document"
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.background = '#f1f5f9'
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#94a3b8'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.background = '#f8fafc'
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#cbd5e1'
            }}
          >
            <FileText size={13} strokeWidth={1.75} color="#64748b" />
            <span>{citation.sourceDoc} (Page {citation.page}{citation.section ? ` • ${citation.section}` : ''})</span>
          </button>
        ) : null}
      </div>

      {/* Right Actions: View Trace — Text only, no stroke, no fill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          type="button"
          onClick={onOpenTrace}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11.5,
            fontWeight: 600,
            color: '#008b8b',
            background: 'none',
            border: 'none',
            padding: '2px 4px',
            cursor: 'pointer',
            transition: 'opacity 0.15s ease',
          }}
          title="View provenance audit trail & AI extraction history"
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.opacity = '0.75'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.opacity = '1'
          }}
        >
          <Clock size={12} />
          View trace
        </button>
      </div>
    </div>
  )
}

/* ── Context Rich Text Field ──────────────────────────────────────────────── */

function ContextRichTextField({
  label,
  value,
  onChange,
  fieldKey,
  citation,
  isManuallyEdited = false,
  isEditable = true,
  onOpenCitation,
  onOpenTrace,
  rows = 3,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  fieldKey: string
  citation?: {
    sourceDoc: string
    page: number
    section: string
    highlightSnippet: string
  }
  isManuallyEdited?: boolean
  isEditable?: boolean
  onOpenCitation: (doc: ContextCitationTarget) => void
  onOpenTrace: (fieldKey: string) => void
  rows?: number
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <ContextFieldHeader
        label={label}
        citation={citation}
        isManuallyEdited={isManuallyEdited}
        onOpenCitation={() =>
          citation &&
          onOpenCitation({
            title: label,
            sourceDoc: citation.sourceDoc,
            page: citation.page,
            section: citation.section,
            highlightSnippet: citation.highlightSnippet,
          })
        }
        onOpenTrace={() => onOpenTrace(fieldKey)}
      />
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={!isEditable}
        rows={rows}
        style={{
          width: '100%',
          padding: '10px 12px',
          fontSize: 14,
          color: '#0d212c',
          background: isEditable ? '#ffffff' : '#f8fafc',
          border: '1.5px solid #e2e8f0',
          borderRadius: 8,
          resize: isEditable ? 'vertical' : 'none',
          fontFamily: 'inherit',
          lineHeight: 1.6,
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s',
          cursor: isEditable ? 'text' : 'default',
        }}
        onFocus={(e) => {
          if (isEditable) e.target.style.borderColor = '#cbd5e1'
        }}
        onBlur={(e) => {
          if (isEditable) e.target.style.borderColor = '#e2e8f0'
        }}
      />
    </div>
  )
}

/* ── Document Uploader Card (For Bottom of Context Tab) ───────────────────── */

function DocumentUploaderCard({
  files,
  onAddFiles,
  onRemoveFile,
  isEditable = true,
}: {
  files: UploadedFile[]
  onAddFiles: (files: UploadedFile[]) => void
  onRemoveFile: (id: string) => void
  isEditable?: boolean
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (!isEditable) return
    const dropped = Array.from(e.dataTransfer.files)
    if (dropped.length > 0) {
      const newFiles: UploadedFile[] = dropped.map((f) => ({
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
        type: f.name.split('.').pop() || 'doc',
        file: f,
        status: 'complete',
        progress: 100,
      }))
      onAddFiles(newFiles)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const selected = Array.from(e.target.files)
    const newFiles: UploadedFile[] = selected.map((f) => ({
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: f.name,
      size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
      type: f.name.split('.').pop() || 'doc',
      file: f,
      status: 'complete',
      progress: 100,
    }))
    onAddFiles(newFiles)
  }

  return (
    <div
      style={{
        marginTop: 24,
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        padding: '20px 22px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0d212c', display: 'flex', alignItems: 'center', gap: 6 }}>
            <UploadCloud size={17} color="#00a0a0" />
            Reference Document Repository
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
            Upload supplementary RFP, questionnaire, or vendor contracts to strengthen AI extraction accuracy.
          </div>
        </div>
      </div>

      {isEditable && (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: isDragging ? '2px dashed #00C4C4' : '2px dashed #cbd5e1',
            borderRadius: 12,
            padding: '22px 16px',
            textAlign: 'center',
            background: isDragging ? 'rgba(0,196,196,0.04)' : '#f8fafc',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            marginBottom: files.length > 0 ? 16 : 0,
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            multiple
            accept=".pdf,.docx,.xlsx,.txt"
            style={{ display: 'none' }}
          />
          <UploadCloud size={28} color={isDragging ? '#00C4C4' : '#94a3b8'} style={{ margin: '0 auto 8px' }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0d212c' }}>
            Click or drag &amp; drop files here
          </div>
          <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>
            Supported formats: PDF, DOCX, XLSX, TXT (up to 25MB each)
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
          {files.map((file) => (
            <div
              key={file.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <FileText size={16} color="#00a0a0" />
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: '#0d212c',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {file.name}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                    {file.size} • {file.type.toUpperCase()}
                  </div>
                </div>
              </div>
              {isEditable && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveFile(file.id)
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    padding: 4,
                  }}
                  title="Remove file"
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#ef4444')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#94a3b8')}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Default Mock Form Data ──────────────────────────────────────────────── */

const MOCK_FORM_DATA: SOWFormData = {
  commitments: [
    {
      id: '1',
      text: 'Deliver a fully functional cloud-based platform within agreed clinical timelines.',
      citation: 'Attachment A: Clinical Safety Case (Page 1 • Section 1)',
      citationSnippet: 'Hippocratic AI agents perform non-diagnostic, patient-facing tasks. They do not diagnose or prescribe...',
      citationPage: 1,
    },
    {
      id: '2',
      text: 'Provide post-go-live hypercare support with continuous human clinical supervision.',
      citation: 'Attachment A: Clinical Safety Case (Page 1 • Section 2)',
      citationSnippet: 'Phase 3 – Human clinical supervision of live operation. Phase 4 – Escalation to human nurses...',
      citationPage: 1,
    },
    {
      id: '3',
      text: 'Ensure 99.9% uptime SLA for production environment with robust fail-safe architecture.',
      citation: 'Attachment A: Clinical Safety Case (Page 2 • Table H-07)',
      citationSnippet: 'H-07 Dependency outage mid-call: Fail-safe: no clinical guidance without supervisor checks...',
      citationPage: 2,
    },
    {
      id: '4',
      text: 'Conduct executive steering reviews and quarterly safety hazard log refreshes.',
      citation: 'Attachment A: Clinical Safety Case (Page 2 • Section 5)',
      citationSnippet: 'monthly joint safety review with M42 (escalation rates, flagged calls, near-misses), and a quarterly hazard-log refresh.',
      citationPage: 2,
    },
    {
      id: '5',
      text: 'Migrate all historical clinical context and data with zero loss and PHI protection.',
      citation: 'Attachment A: Clinical Safety Case (Page 2 • Table H-03)',
      citationSnippet: 'H-03 PHI disclosed to wrong person: Identity verification before any PHI; caregiver-consent rules; privacy supervisor',
      citationPage: 2,
    },
    {
      id: '6',
      text: 'Deliver role-based training sessions for all 120 clinical and procurement staff.',
      citation: 'Attachment A: Clinical Safety Case (Page 1 • Section 2)',
      citationSnippet: 'Phase 2 – Output testing. U.S.-licensed clinicians evaluate the agent by posing as patients; the company reports 7.7K+ clinicians and 775K+ test calls.',
      citationPage: 1,
    },
  ],
  clientName: 'M42 Health Platform',
  description:
    'End-to-end digital transformation of clinical and procurement operations, pairing conversational AI agents with specialist safety supervisor models to automate patient-facing workflows and vendor lifecycle management.',
  businessOutcome:
    'Reduce procurement cycle time by 40%, achieve 15% cost savings through AI-driven vendor recommendations, and maintain zero S4 severe safety incidents across all healthcare operations.',
  importanceValue:
    'Procurement and operational inefficiencies currently cost M42 an estimated $4.2M annually in delayed onboarding and manual overhead. Implementing Polaris constellation architecture directly resolves these bottlenecks.',
  inScope:
    'Vendor portal setup, AI sourcing engine integration, contract repository migration, role-based access control, real-time spend analytics dashboard, and clinical safety monitoring protocols.',
  outOfScope:
    'Direct diagnostic or prescribing services, hospice or mental-health disorder deployments, and any operations outside the agreed non-diagnostic patient-facing scope.',
  tags: ['Procurement', 'Digital Transformation', 'AI/ML', 'Healthcare', 'Cloud Migration', 'SaaS', 'Clinical Safety'],
  otherContext:
    'Deployment must comply with UAE MOHAP SaMD guidance and DoH Abu Dhabi AI policies. All data processing and integration contract tests must be HIPAA and local regulation compliant.',
}

/* ── Form Generating Animation & Shimmer ─────────────────────────────────── */

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
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M9 1l2 6h6l-5 3.5 2 6L9 13l-5 3.5 2-6L1 7h6z" fill="#00C4C4" opacity=".7" />
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
    <div style={{ padding: '20px 16px', maxWidth: 840 }}>
      <div
        style={{
          background: 'rgba(255,255,255,0.7)',
          border: '1px solid rgba(0,196,196,0.15)',
          borderRadius: 14,
          padding: '16px 20px',
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
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

/* ── Form Tab Component (Full Interactive Implementation) ─────────────────── */

function FormTab({
  files: initialFiles,
  showUploadedDocs = false,
  onReady,
  onSubmit: _onSubmit,
  skipLoading = false,
  onDirtyChange,
  formVersions = [],
  isEditable = true,
}: {
  files: UploadedFile[]
  showUploadedDocs?: boolean
  onReady?: () => void
  onSubmit: () => void
  skipLoading?: boolean
  onDirtyChange?: (dirty: boolean) => void
  formVersions?: { id: string; timestamp: string }[]
  isEditable?: boolean
}) {
  const [extraFiles, setExtraFiles] = useState<UploadedFile[]>(initialFiles || [])
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null)
  const [citationModalTarget, setCitationModalTarget] = useState<ContextCitationTarget | null>(null)
  const [activeTraceTarget, setActiveTraceTarget] = useState<TraceRecord | null>(null)
  const [customTagInput, setCustomTagInput] = useState('')

  const [loadingState, setLoadingState] = useState<'generating' | 'shimmer' | 'ready'>(
    skipLoading ? 'ready' : 'generating'
  )
  const [formData, setFormData] = useState<SOWFormData>(
    skipLoading
      ? MOCK_FORM_DATA
      : {
          commitments: [],
          clientName: '',
          description: '',
          businessOutcome: '',
          importanceValue: '',
          inScope: '',
          outOfScope: '',
          tags: [],
          otherContext: '',
        }
  )
  const [newCommitment, setNewCommitment] = useState('')
  const timer1Ref = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timer2Ref = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (skipLoading) {
      onReady?.()
      return
    }
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

  const initialDataRef = useRef<SOWFormData | null>(null)

  useEffect(() => {
    if (loadingState === 'ready') {
      if (!initialDataRef.current) {
        initialDataRef.current = formData
      } else if (formData !== initialDataRef.current) {
        onDirtyChange?.(true)
      }
    }
  }, [formData, loadingState, onDirtyChange])

  // Field change handlers that set manuallyEdited flag
  const handleFieldChange = (key: keyof SOWFormData, val: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: val,
      manuallyEditedFields: {
        ...(prev.manuallyEditedFields || {}),
        [key]: true,
      },
    }))
  }

  const handleCommitmentTextChange = (id: string, text: string) => {
    setFormData((prev) => ({
      ...prev,
      commitments: prev.commitments.map((c) =>
        c.id === id ? { ...c, text, manuallyEdited: true } : c
      ),
    }))
  }

  const addCommitment = () => {
    if (!newCommitment.trim()) return
    setFormData((prev) => ({
      ...prev,
      commitments: [
        ...prev.commitments,
        {
          id: Date.now().toString(),
          text: newCommitment.trim(),
          citation: 'Manual Input (PMO Added)',
          manuallyEdited: true,
          citationPage: 1,
        },
      ],
    }))
    setNewCommitment('')
  }

  const removeCommitment = (id: string) =>
    setFormData((prev) => ({
      ...prev,
      commitments: prev.commitments.filter((c: CommitmentItem) => c.id !== id),
    }))

  const handleAddCustomTag = () => {
    if (!customTagInput.trim()) return
    const tag = customTagInput.trim()
    if (!formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }))
    }
    setCustomTagInput('')
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }))
  }

  const openTraceForField = (fieldKey: string) => {
    const baseTrace = TRACE_DATA_MAP[fieldKey] || {
      fieldKey,
      fieldLabel: fieldKey,
      sourceDoc: {
        fileName: 'Clinical_Safety_Case_Hazard_Log.pdf',
        page: 1,
        section: 'General Context',
        quote: 'Extracted directly from project documentation.',
        addedBy: 'Sarah Khan',
        timestamp: '08 Oct 2026, 11:24',
      },
      contextItem: {
        title: 'Project Requirements',
        source: 'From client intake',
        summary: 'Intake data processed by AI Assistant.',
        addedBy: 'Mike Chen',
        timestamp: '08 Oct 2026, 13:17',
      },
      questionAnswer: {
        question: `What is the scope for ${fieldKey}?`,
        context: 'From stakeholder questionnaire',
        answer: 'Verified against M42 requirements.',
        addedBy: 'Priya Nair',
        timestamp: '08 Oct 2026, 15:03',
      },
      draftStatement: {
        title: 'Draft Statement',
        meta: 'Generated using client input and template',
        statement: (formData as unknown as Record<string, string>)[fieldKey] || '',
        createdBy: 'AI Assistant',
        timestamp: '08 Oct 2026, 15:12',
      },
    }

    const isEdited = !!(formData.manuallyEditedFields && formData.manuallyEditedFields[fieldKey])
    setActiveTraceTarget({
      ...baseTrace,
      isManuallyEdited: isEdited,
      manualEditBy: 'Ashika Jain (PMO)',
      manualEditTimestamp: 'Just now',
    })
  }

  if (loadingState === 'generating') {
    return <FormGeneratingAnimation />
  }

  if (loadingState === 'shimmer') {
    return <ShimmerForm />
  }

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100%', position: 'relative', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', maxWidth: 840, width: '100%' }}>
        {previewFile && <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}

        {/* ── Commitments card ── */}
      <SectionCard
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0d212c' }}>
                Commitments
              </span>
              <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 500, color: '#64748b' }}>
                Deliverables &amp; safety requirements (each with dedicated citation).
              </span>
            </div>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
          {formData.commitments.map((c: CommitmentItem, idx: number) => {
            const isEdited = !!c.manuallyEdited
            return (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                {/* Header for commitment citation & trace */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: 'rgba(0,196,196,0.15)',
                        color: '#00a0a0',
                        fontSize: 11,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {idx + 1}
                    </span>

                    {/* Individual Citation Tag — Minimal style */}
                    {isEdited ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11,
                          fontWeight: 500,
                          color: '#b45309',
                          background: '#fef3c7',
                          border: '1px solid #fde68a',
                          padding: '2px 8px',
                          borderRadius: 5,
                        }}
                      >
                        <Edit2 size={10} />
                        Manually Edited
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setCitationModalTarget({
                            title: `Commitment #${idx + 1}`,
                            sourceDoc: 'Clinical_Safety_Case_Hazard_Log.pdf',
                            page: c.citationPage || 1,
                            section: c.citation || 'Clinical Safety',
                            highlightSnippet: c.citationSnippet || c.text,
                          })
                        }
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11,
                          fontWeight: 500,
                          color: '#64748b',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          padding: '2px 8px',
                          borderRadius: 5,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        title="Click to view full cited PDF document preview"
                        onMouseEnter={(e) => {
                          ;(e.currentTarget as HTMLButtonElement).style.background = '#f1f5f9'
                          ;(e.currentTarget as HTMLButtonElement).style.color = '#334155'
                        }}
                        onMouseLeave={(e) => {
                          ;(e.currentTarget as HTMLButtonElement).style.background = '#f8fafc'
                          ;(e.currentTarget as HTMLButtonElement).style.color = '#64748b'
                        }}
                      >
                        <FileText size={10} color="#64748b" />
                        {c.citation || 'Attachment A: Clinical Safety Case (Page 1)'}
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveTraceTarget({
                          fieldKey: `commitment-${c.id}`,
                          fieldLabel: `Commitment #${idx + 1}`,
                          sourceDoc: {
                            fileName: 'Clinical_Safety_Case_Hazard_Log.pdf',
                            page: c.citationPage || 1,
                            section: c.citation || 'Section 2. Safety-assurance approach',
                            quote: c.citationSnippet || c.text,
                            addedBy: 'Sarah Khan',
                            timestamp: '08 Oct 2026, 11:24',
                          },
                          contextItem: {
                            title: `Commitment #${idx + 1} Deliverable`,
                            source: 'From SOW Intake Engine',
                            summary: c.text,
                            addedBy: 'Mike Chen',
                            timestamp: '08 Oct 2026, 13:17',
                          },
                          questionAnswer: {
                            question: `Is this commitment deliverable required for M42 rollout?`,
                            context: 'From Clinical Safety Board review',
                            answer: 'Confirmed as mandatory requirement.',
                            addedBy: 'Priya Nair',
                            timestamp: '08 Oct 2026, 15:03',
                          },
                          draftStatement: {
                            title: 'Draft Statement',
                            meta: 'Extracted from source contract',
                            statement: c.text,
                            createdBy: 'AI Assistant',
                            timestamp: '08 Oct 2026, 15:12',
                          },
                          isManuallyEdited: isEdited,
                          manualEditBy: 'Ashika Jain (PMO)',
                          manualEditTimestamp: 'Just now',
                        })
                      }
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                        fontSize: 11.5,
                        color: '#008b8b',
                        background: 'none',
                        border: 'none',
                        padding: '2px 4px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        transition: 'opacity 0.15s ease',
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.75')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
                    >
                      <Clock size={10} />
                      View trace
                    </button>

                    {isEditable && (
                      <button
                        type="button"
                        onClick={() => removeCommitment(c.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#94a3b8',
                          padding: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="Remove commitment"
                        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#ef4444')}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#94a3b8')}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Editable In-Place Input for Commitment — Same design as client name input field */}
                {isEditable ? (
                  <input
                    type="text"
                    value={c.text}
                    onChange={(e) => handleCommitmentTextChange(c.id, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: 14,
                      color: '#0d212c',
                      background: '#ffffff',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: 8,
                      outline: 'none',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.15s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#cbd5e1')}
                    onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                  />
                ) : (
                  <div style={{ fontSize: 14, color: '#0d212c', lineHeight: 1.5, padding: '4px 0' }}>
                    {c.text}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {isEditable && (
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={newCommitment}
              onChange={(e) => setNewCommitment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addCommitment()
              }}
              placeholder="Add a new commitment and press Enter…"
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
              onFocus={(e) => (e.target.style.borderColor = '#cbd5e1')}
              onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
            />
            <button
              onClick={addCommitment}
              style={{
                padding: '9px 16px',
                background: '#00C4C4',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                color: '#ffffff',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 6px rgba(0,196,196,0.25)',
              }}
            >
              <Plus size={14} /> Add
            </button>
          </div>
        )}
      </SectionCard>

      {/* ── Context Fields Card ── */}
      <SectionCard
        title={
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0d212c' }}>
            Context Fields
            <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 500, color: '#64748b' }}>
              Review, edit, and trace AI-extracted fields.
            </span>
          </div>
        }
      >
        {/* Client Name */}
        <div style={{ marginBottom: 18 }}>
          <ContextFieldHeader
            label="Client Name"
            citation={{
              sourceDoc: 'Clinical_Safety_Case_Hazard_Log.pdf',
              page: 1,
              section: '1. Purpose and scope',
              highlightSnippet: 'Hippocratic AI – response to M42 Vendor Architecture & Due-Diligence Questionnaire (Round 1)',
            }}
            isManuallyEdited={!!formData.manuallyEditedFields?.clientName}
            onOpenCitation={() =>
              setCitationModalTarget({
                title: 'Client Name',
                sourceDoc: 'Clinical_Safety_Case_Hazard_Log.pdf',
                page: 1,
                section: '1. Purpose and scope',
                highlightSnippet: 'Hippocratic AI – response to M42 Vendor Architecture & Due-Diligence Questionnaire (Round 1)',
              })
            }
            onOpenTrace={() => openTraceForField('clientName')}
          />
          <input
            value={formData.clientName}
            onChange={(e) => handleFieldChange('clientName', e.target.value)}
            readOnly={!isEditable}
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: 14,
              color: '#0d212c',
              background: isEditable ? '#ffffff' : '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: 8,
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => {
              if (isEditable) e.target.style.borderColor = '#cbd5e1'
            }}
            onBlur={(e) => {
              if (isEditable) e.target.style.borderColor = '#e2e8f0'
            }}
          />
        </div>

        {/* Description */}
        <ContextRichTextField
          label="Description"
          fieldKey="description"
          value={formData.description}
          onChange={(v) => handleFieldChange('description', v)}
          citation={{
            sourceDoc: 'Clinical_Safety_Case_Hazard_Log.pdf',
            page: 1,
            section: '2. Safety-assurance approach',
            highlightSnippet: 'The Polaris constellation pairs a primary conversational agent with specialist support models...',
          }}
          isManuallyEdited={!!formData.manuallyEditedFields?.description}
          isEditable={isEditable}
          onOpenCitation={setCitationModalTarget}
          onOpenTrace={openTraceForField}
        />

        {/* Business Outcome */}
        <ContextRichTextField
          label="Business Outcome"
          fieldKey="businessOutcome"
          value={formData.businessOutcome}
          onChange={(v) => handleFieldChange('businessOutcome', v)}
          citation={{
            sourceDoc: 'Clinical_Safety_Case_Hazard_Log.pdf',
            page: 1,
            section: '3. Harm-severity scale',
            highlightSnippet: 'Harm-severity scale: S4 Severe, S3 Moderate, S2 Minor, S1 Negligible.',
          }}
          isManuallyEdited={!!formData.manuallyEditedFields?.businessOutcome}
          isEditable={isEditable}
          onOpenCitation={setCitationModalTarget}
          onOpenTrace={openTraceForField}
        />

        {/* Importance & Value of Solution */}
        <ContextRichTextField
          label="Importance & Value of Solution"
          fieldKey="importanceValue"
          value={formData.importanceValue}
          onChange={(v) => handleFieldChange('importanceValue', v)}
          citation={{
            sourceDoc: 'Clinical_Safety_Case_Hazard_Log.pdf',
            page: 1,
            section: '1. Purpose and scope',
            highlightSnippet: 'structured on ISO 14971 risk-management principles so M42 clinical safety officers can review in a familiar form.',
          }}
          isManuallyEdited={!!formData.manuallyEditedFields?.importanceValue}
          isEditable={isEditable}
          onOpenCitation={setCitationModalTarget}
          onOpenTrace={openTraceForField}
        />

        {/* In Scope */}
        <ContextRichTextField
          label="In Scope"
          fieldKey="inScope"
          value={formData.inScope}
          onChange={(v) => handleFieldChange('inScope', v)}
          citation={{
            sourceDoc: 'Clinical_Safety_Case_Hazard_Log.pdf',
            page: 1,
            section: '2. Safety-assurance approach',
            highlightSnippet: 'Phase 1 – Architecture. The Polaris constellation pairs a primary conversational agent with specialist support models',
          }}
          isManuallyEdited={!!formData.manuallyEditedFields?.inScope}
          isEditable={isEditable}
          onOpenCitation={setCitationModalTarget}
          onOpenTrace={openTraceForField}
        />

        {/* Out of Scope */}
        <ContextRichTextField
          label="Out of Scope"
          fieldKey="outOfScope"
          value={formData.outOfScope}
          onChange={(v) => handleFieldChange('outOfScope', v)}
          citation={{
            sourceDoc: 'Clinical_Safety_Case_Hazard_Log.pdf',
            page: 1,
            section: '1. Purpose and scope (Intended use)',
            highlightSnippet: 'Intended use (public position). Hippocratic AI agents perform non-diagnostic, patient-facing tasks. They do not diagnose or prescribe, and are not deployed for hospice, mental-health disorders, or children under two.',
          }}
          isManuallyEdited={!!formData.manuallyEditedFields?.outOfScope}
          isEditable={isEditable}
          onOpenCitation={setCitationModalTarget}
          onOpenTrace={openTraceForField}
        />

        {/* AI Generated Tags (With Delete Cross & Input Field to Add New Tags) */}
        <div style={{ marginBottom: 18 }}>
          <label
            style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              color: '#0d212c',
              marginBottom: 8,
            }}
          >
            Context Tags{' '}
            <span style={{ fontWeight: 400, color: '#94a3b8' }}>
              (AI-extracted tags — add or remove as needed)
            </span>
          </label>

          {/* Tags List */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: isEditable ? 10 : 0 }}>
            {formData.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '3px 10px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 500,
                  background: 'rgba(0, 196, 196, 0.08)',
                  border: '1px solid rgba(0, 196, 196, 0.25)',
                  color: '#007a7a',
                  transition: 'all 0.15s ease',
                }}
              >
                {tag}
                {isEditable && (
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#94a3b8',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      lineHeight: 1,
                    }}
                    title={`Remove ${tag}`}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#ef4444')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#94a3b8')}
                  >
                    <X size={12} />
                  </button>
                )}
              </span>
            ))}
          </div>

          {/* Tag Input Field */}
          {isEditable && (
            <div style={{ display: 'flex', gap: 8, maxWidth: 360, marginTop: 8 }}>
              <input
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddCustomTag()
                  }
                }}
                placeholder="Add custom tag…"
                style={{
                  flex: 1,
                  padding: '7px 12px',
                  fontSize: 13,
                  background: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: 8,
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#cbd5e1')}
                onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                style={{
                  padding: '7px 14px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                }}
              >
                + Add Tag
              </button>
            </div>
          )}
        </div>

        {/* Any Other Relevant Context */}
        <ContextRichTextField
          label="Any Other Relevant Context"
          fieldKey="otherContext"
          value={formData.otherContext}
          onChange={(v) => handleFieldChange('otherContext', v)}
          citation={{
            sourceDoc: 'Clinical_Safety_Case_Hazard_Log.pdf',
            page: 2,
            section: '6. Regulatory positioning in the UAE',
            highlightSnippet: 'documented in a regulatory classification memo against UAE MOHAP SaMD guidance and the DoH Abu Dhabi Policy on Use of AI in the Healthcare Sector, submitted to M42 before go-live.',
          }}
          isManuallyEdited={!!formData.manuallyEditedFields?.otherContext}
          isEditable={isEditable}
          onOpenCitation={setCitationModalTarget}
          onOpenTrace={openTraceForField}
        />
      </SectionCard>

      {/* ── Document Uploader at Bottom of Context Tab ── */}
      <DocumentUploaderCard
        files={extraFiles}
        onAddFiles={(newDocs) => setExtraFiles((prev) => [...prev, ...newDocs])}
        onRemoveFile={(id) => setExtraFiles((prev) => prev.filter((d) => d.id !== id))}
        isEditable={isEditable}
      />

      </div>

      {/* Citation Preview Modal */}
      {citationModalTarget && (
        <DocumentCitationPreviewModal
          citation={citationModalTarget}
          onClose={() => setCitationModalTarget(null)}
        />
      )}

      {/* Field Provenance Trace Drawer */}
      {activeTraceTarget && (
        <FieldTraceDrawer
          traceData={activeTraceTarget}
          onClose={() => setActiveTraceTarget(null)}
          onOpenCitation={(target) => {
            setActiveTraceTarget(null)
            setCitationModalTarget(target)
          }}
        />
      )}
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
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, type: string}[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

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
          width: 550,
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
              e.target.style.borderColor = '#cbd5e1'
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
            Instructions
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Provide instructions for generating this section..."
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
              e.target.style.borderColor = '#cbd5e1'
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
            Knowledge Base <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files) {
                const newFiles = Array.from(e.target.files).map(f => ({
                  name: f.name,
                  type: f.name.endsWith('.pdf') ? 'PDF' : f.name.endsWith('.docx') ? 'DOCX' : 'TXT'
                }))
                setUploadedFiles(prev => [...prev, ...newFiles])
              }
            }}
          />
          <div
            style={{
              width: '100%',
              padding: '24px 12px',
              border: '1.5px dashed #cbd5e1',
              borderRadius: 8,
              textAlign: 'center',
              background: '#f8fafc',
              cursor: 'pointer',
              marginBottom: uploadedFiles.length > 0 ? 12 : 0,
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
              <span style={{ color: '#00a0a0', fontWeight: 600 }}>Click to browse</span> or drag & drop documents here
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
              Supports PDF, DOCX, XLSX (Max 1 document) • <span style={{ color: '#0ea5e9', fontWeight: 600 }}>15 Tokens/upload</span>
            </div>
          </div>
          {uploadedFiles.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {uploadedFiles.map((file, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      background: file.type === 'PDF' ? '#fef2f2' : file.type === 'DOCX' ? '#eff6ff' : '#f8fafc',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={file.type === 'PDF' ? '#ef4444' : file.type === 'DOCX' ? '#3b82f6' : '#64748b'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0d212c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {file.name}
                    </div>
                  </div>
                  <button
                    onClick={() => setUploadedFiles(prev => prev.filter((_, idx) => idx !== i))}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#94a3b8',
                      padding: 4,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
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
            disabled={!title.trim() || uploadedFiles.length === 0}
            style={{
              padding: '9px 20px',
              background: (title.trim() && uploadedFiles.length > 0) ? '#00C4C4' : '#cbd5e1',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: (title.trim() && uploadedFiles.length > 0) ? 'pointer' : 'not-allowed',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => {
              if (title.trim() && uploadedFiles.length > 0) (e.currentTarget as HTMLButtonElement).style.background = '#00a8a8'
            }}
            onMouseLeave={(e) => {
              if (title.trim() && uploadedFiles.length > 0) (e.currentTarget as HTMLButtonElement).style.background = '#00C4C4'
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
  { id: 'm5', name: 'Narendra Patel', initials: 'NP', color: '#16a34a' },
  { id: 'm6', name: 'Vikram Singh', initials: 'VS', color: '#3b82f6' },
  { id: 'm7', name: 'Sneha Rao', initials: 'SR', color: '#ec4899' },
]

function memberById(id: string) {
  return SECTION_MEMBERS.find((m) => m.id === id) ?? SECTION_MEMBERS[0]
}

const INITIAL_SECTIONS: SOWSection[] = [
  {
    id: 's1',
    title: 'Background',
    assignedMembers: ['m1', 'm2'],
    items: [
      {
        id: 's1a',
        type: 'assumption',
        text: 'Client has been operating on legacy systems for 7+ years and has executive mandate for modernisation.',
        assignedTo: 'm1',
        answered: true,
      },
      {
        id: 's1b',
        type: 'question',
        text: 'Has the client formally documented the current-state pain points and shared them with the delivery team?',
        assignedTo: 'm2',
        answered: false,
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's2',
    title: 'Executive Summary',
    assignedMembers: ['m1', 'm2', 'm3'],
    items: [
      {
        id: 's2a',
        type: 'assumption',
        text: 'Procurement cycle is currently 45 days on average and will reduce to under 27 days post-implementation.',
        assignedTo: 'm1',
        answered: true,
      },
      {
        id: 's2b',
        type: 'assumption',
        text: 'Client has 120+ procurement staff who will require role-based training across 6 regional offices.',
        assignedTo: 'm2',
        answered: true,
      },
      {
        id: 's2c',
        type: 'question',
        text: 'Has the executive sponsor formally signed off on the transformation roadmap and budget allocation?',
        assignedTo: 'm3',
        answered: true,
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's3',
    title: 'Objectives',
    assignedMembers: ['m1'],
    items: [
      {
        id: 's3a',
        type: 'question',
        text: "Are the stated objectives SMART and aligned to the client's FY26 OKRs?",
        assignedTo: 'm1',
        answered: false,
      },
      {
        id: 's3b',
        type: 'assumption',
        text: 'Primary objective is cost reduction of 15% within 18 months of go-live.',
        assignedTo: 'm1',
        answered: false,
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's4',
    title: 'Scope of Work',
    assignedMembers: ['m1', 'm4'],
    items: [
      {
        id: 's4a',
        type: 'question',
        text: 'Which of the 6 procurement sub-processes listed in Appendix A are considered highest priority for Phase 1?',
        assignedTo: 'm1',
        answered: true,
      },
      {
        id: 's4b',
        type: 'question',
        text: 'Is third-party vendor onboarding for Phase 1 capped at 50 vendors, or can that number flex?',
        assignedTo: 'm4',
        answered: false,
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's5',
    title: 'Out of Scope',
    assignedMembers: ['m2'],
    items: [
      {
        id: 's5a',
        type: 'assumption',
        text: 'Legacy data archival beyond 5 years is explicitly out of scope for this engagement.',
        assignedTo: 'm2',
        answered: true,
      },
      {
        id: 's5b',
        type: 'question',
        text: 'Should third-party integrations not listed in Appendix B be formally excluded via a written boundary document?',
        assignedTo: 'm2',
        answered: false,
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's6',
    title: 'Requirements',
    assignedMembers: ['m1', 'm3'],
    items: [
      {
        id: 's6a',
        type: 'assumption',
        text: 'Functional requirements have been baselined in the RFP and will not change materially during delivery.',
        assignedTo: 'm1',
        answered: false,
      },
      {
        id: 's6b',
        type: 'question',
        text: 'Are there any accessibility (WCAG 2.1 AA) or localisation requirements not captured in the RFP?',
        assignedTo: 'm3',
        answered: false,
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's7',
    title: 'Approach & Methodology',
    assignedMembers: ['m2'],
    items: [
      {
        id: 's7a',
        type: 'assumption',
        text: 'Agile delivery using 2-week sprints with fortnightly client showcase sessions.',
        assignedTo: 'm2',
        answered: true,
      },
      {
        id: 's7b',
        type: 'question',
        text: 'Does the client prefer SAFe or Scrum at scale for the programme layer?',
        assignedTo: 'm2',
        answered: false,
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's8',
    title: 'Roles & Responsibilities',
    assignedMembers: ['m3', 'm4'],
    items: [
      {
        id: 's8a',
        type: 'question',
        text: 'Who is the designated client Product Owner and do they have decision-making authority for scope changes?',
        assignedTo: 'm3',
        answered: false,
      },
      {
        id: 's8b',
        type: 'assumption',
        text: 'Client will provide a dedicated BA resource for requirements elaboration throughout delivery.',
        assignedTo: 'm4',
        answered: false,
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's9',
    title: 'Deliverables',
    assignedMembers: ['m2', 'm3'],
    items: [
      {
        id: 's9a',
        type: 'assumption',
        text: 'Cloud platform delivery is expected within 6 calendar months from project kick-off date.',
        assignedTo: 'm2',
        answered: false,
      },
      {
        id: 's9b',
        type: 'question',
        text: "Does documentation scope include API reference for the client's internal developer team?",
        assignedTo: 'm3',
        answered: false,
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's10',
    title: 'Timeline & Milestones',
    assignedMembers: ['m1', 'm2'],
    items: [
      {
        id: 's10a',
        type: 'assumption',
        text: 'Project kick-off is planned for November 2026 subject to contract signature by 31 October.',
        assignedTo: 'm1',
        answered: false,
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's11',
    title: 'Commercials',
    assignedMembers: ['m1', 'm3'],
    items: [
      {
        id: 's11a',
        type: 'assumption',
        text: 'Fixed price engagement with no scope creep clauses beyond the agreed Change Request process.',
        assignedTo: 'm1',
        answered: false,
      },
      {
        id: 's11b',
        type: 'assumption',
        text: 'Travel and expenses are included in the fixed price up to the agreed cap specified in Schedule B.',
        assignedTo: 'm3',
        answered: false,
      },
      {
        id: 's11c',
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
    id: 's12',
    title: 'Assumptions',
    assignedMembers: ['m2', 'm4'],
    items: [
      {
        id: 's12a',
        type: 'assumption',
        text: 'All data migration must be HIPAA compliant — client will provide formal compliance sign-off before migration begins.',
        assignedTo: 'm2',
        answered: false,
      },
      {
        id: 's12b',
        type: 'question',
        text: 'Has the client confirmed availability of key stakeholders for workshops within 5 business days of request?',
        assignedTo: 'm4',
        answered: false,
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's13',
    title: 'Risks & Mitigations',
    assignedMembers: ['m1'],
    items: [
      {
        id: 's13a',
        type: 'question',
        text: 'Have all Tier-1 risks been reviewed by the client Risk Committee and formally accepted?',
        assignedTo: 'm1',
        answered: false,
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's14',
    title: 'Security',
    assignedMembers: ['m3'],
    items: [
      {
        id: 's14a',
        type: 'assumption',
        text: "Solution must comply with ISO 27001 and client's internal security policy v3.2.",
        assignedTo: 'm3',
        answered: false,
      },
      {
        id: 's14b',
        type: 'question',
        text: 'Is penetration testing required pre-UAT, and who is responsible for scheduling and cost?',
        assignedTo: 'm3',
        answered: false,
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's15',
    title: 'Architecture',
    assignedMembers: ['m2', 'm4'],
    items: [
      {
        id: 's15a',
        type: 'assumption',
        text: 'Target state is a cloud-native microservices architecture hosted on Azure.',
        assignedTo: 'm2',
        answered: true,
      },
      {
        id: 's15b',
        type: 'question',
        text: 'Are there any on-premise components that must remain due to data sovereignty constraints?',
        assignedTo: 'm4',
        answered: false,
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's16',
    title: 'Acceptance Criteria',
    assignedMembers: ['m1', 'm3'],
    items: [
      {
        id: 's16a',
        type: 'question',
        text: 'Has the client defined measurable UAT pass/fail criteria for each major deliverable?',
        assignedTo: 'm1',
        answered: false,
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's17',
    title: 'Change Management',
    assignedMembers: ['m2'],
    items: [
      {
        id: 's17a',
        type: 'assumption',
        text: 'A formal change control board (CCB) will be established within 4 weeks of project kick-off.',
        assignedTo: 'm2',
        answered: false,
      },
      {
        id: 's17b',
        type: 'question',
        text: 'What is the agreed SLA for processing a change request through the CCB?',
        assignedTo: 'm2',
        answered: false,
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's18',
    title: 'Support & Handover',
    assignedMembers: ['m1', 'm4'],
    items: [
      {
        id: 's18a',
        type: 'assumption',
        text: 'Hypercare period of 4 weeks post go-live is included, after which support transitions to client BAU team.',
        assignedTo: 'm1',
        answered: false,
      },
      {
        id: 's18b',
        type: 'question',
        text: 'Has the client nominated a BAU support lead who will participate in knowledge-transfer sessions?',
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
    title: 'Background',
    assignedMembers: ['m1', 'm2'],
    items: [
      {
        id: 's1a',
        type: 'assumption',
        text: 'Client has been operating on legacy systems for 7+ years and has executive mandate for modernisation.',
        assignedTo: 'm1',
        answered: true,
        response:
          'Confirmed. Legacy ERP dates to 2016. Board resolution passed March 2026 mandating full modernisation by Q2 2027.',
      },
      {
        id: 's1b',
        type: 'question',
        text: 'Has the client formally documented the current-state pain points and shared them with the delivery team?',
        assignedTo: 'm2',
        answered: true,
        response:
          'Yes — AS-IS process maps shared via SharePoint on 5 Sept. 12 critical pain points identified and prioritised.',
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's2',
    title: 'Executive Summary',
    assignedMembers: ['m1', 'm2', 'm3'],
    items: [
      {
        id: 's2a',
        type: 'assumption',
        text: 'Procurement cycle is currently 45 days on average and will reduce to under 27 days post-implementation.',
        assignedTo: 'm1',
        answered: true,
        response:
          'Confirmed. Current average is 44.5 days per Q3 benchmarking report. Target is achievable with automation.',
      },
      {
        id: 's2b',
        type: 'assumption',
        text: 'Client has 120+ procurement staff who will require role-based training across 6 regional offices.',
        assignedTo: 'm2',
        answered: true,
        response: 'Verified with HR data. 128 staff total across 6 offices. Training plan drafted.',
      },
      {
        id: 's2c',
        type: 'question',
        text: 'Has the executive sponsor formally signed off on the transformation roadmap and budget allocation?',
        assignedTo: 'm3',
        answered: true,
        response:
          'Yes — CFO and CPO co-signed the roadmap on 18 Sept 2026. Budget of $4.2M allocated in FY2027 capex plan.',
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's3',
    title: 'Objectives',
    assignedMembers: ['m1'],
    items: [
      {
        id: 's3a',
        type: 'question',
        text: "Are the stated objectives SMART and aligned to the client's FY26 OKRs?",
        assignedTo: 'm1',
        answered: true,
        response:
          'Objectives reviewed against OKR framework. All 4 primary objectives are SMART. Aligned to 3 of 5 FY26 OKRs.',
      },
      {
        id: 's3b',
        type: 'assumption',
        text: 'Primary objective is cost reduction of 15% within 18 months of go-live.',
        assignedTo: 'm1',
        answered: true,
        response: 'Validated with client CFO; baseline operational cost model agreed.',
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's4',
    title: 'Scope of Work',
    assignedMembers: ['m1', 'm4'],
    items: [
      {
        id: 's4a',
        type: 'question',
        text: 'Which of the 6 procurement sub-processes listed in Appendix A are considered highest priority for Phase 1?',
        assignedTo: 'm1',
        answered: true,
        response:
          'Sub-processes 1 (PO creation), 3 (invoice matching), and 5 (vendor onboarding) confirmed as Phase 1 priorities by CPO on 20 Sept.',
      },
      {
        id: 's4b',
        type: 'question',
        text: 'Is third-party vendor onboarding for Phase 1 capped at 50 vendors, or can that number flex?',
        assignedTo: 'm4',
        answered: true,
        response: 'Capped at 50 vendors for Phase 1 per CPO sign-off on 20 Sept.',
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's5',
    title: 'Out of Scope',
    assignedMembers: ['m2'],
    items: [
      {
        id: 's5a',
        type: 'assumption',
        text: 'Legacy data archival beyond 5 years is explicitly out of scope for this engagement.',
        assignedTo: 'm2',
        answered: true,
        response: 'Confirmed in Scope Boundary doc v1.2 signed by both parties on 15 Sept.',
      },
      {
        id: 's5b',
        type: 'question',
        text: 'Should third-party integrations not listed in Appendix B be formally excluded via a written boundary document?',
        assignedTo: 'm2',
        answered: true,
        response: 'Yes, boundary exclusions confirmed and appended to schedule.',
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's6',
    title: 'Requirements',
    assignedMembers: ['m1', 'm3'],
    items: [
      {
        id: 's6a',
        type: 'assumption',
        text: 'Functional requirements have been baselined in the RFP and will not change materially during delivery.',
        assignedTo: 'm1',
        answered: true,
        response: 'RFP v2.1 accepted as baseline. Change control process defined in Section 17.',
      },
      {
        id: 's6b',
        type: 'question',
        text: 'Are there any accessibility (WCAG 2.1 AA) or localisation requirements not captured in the RFP?',
        assignedTo: 'm3',
        answered: false,
      },
      {
        id: 's6c',
        type: 'assumption',
        text: 'Non-functional performance SLAs require 99.9% uptime during standard operating hours.',
        assignedTo: 'm1',
        answered: true,
        response: 'Confirmed by Enterprise Architecture team in technical annex.',
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's7',
    title: 'Approach & Methodology',
    assignedMembers: ['m2'],
    items: [
      {
        id: 's7a',
        type: 'assumption',
        text: 'Agile delivery using 2-week sprints with fortnightly client showcase sessions.',
        assignedTo: 'm2',
        answered: true,
        response:
          'Sprint cadence agreed in Project Initiation doc. Showcases booked every second Friday from kick-off.',
      },
      {
        id: 's7b',
        type: 'question',
        text: 'Does the client prefer SAFe or Scrum at scale for the programme layer?',
        assignedTo: 'm2',
        answered: true,
        response:
          'Client confirmed Scrum at scale. Programme-level ceremonies to be agreed at kick-off.',
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's8',
    title: 'Roles & Responsibilities',
    assignedMembers: ['m3', 'm4'],
    items: [
      {
        id: 's8a',
        type: 'question',
        text: 'Who is the designated client Product Owner and do they have decision-making authority for scope changes?',
        assignedTo: 'm3',
        answered: true,
        response:
          'Priya Nair confirmed as PO (Head of Digital, direct report to CPO). Has authority up to $50K scope changes; above that requires CPO sign-off.',
      },
      {
        id: 's8b',
        type: 'assumption',
        text: 'Client will provide a dedicated BA resource for requirements elaboration throughout delivery.',
        assignedTo: 'm4',
        answered: false,
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's9',
    title: 'Deliverables',
    assignedMembers: ['m2', 'm3'],
    items: [
      {
        id: 's9a',
        type: 'assumption',
        text: 'Cloud platform delivery is expected within 6 calendar months from project kick-off date.',
        assignedTo: 'm2',
        answered: true,
        response:
          'Timeline validated against resource plan. 6 months achievable with current staffing.',
      },
      {
        id: 's9b',
        type: 'question',
        text: "Does documentation scope include API reference for the client's internal developer team?",
        assignedTo: 'm3',
        answered: false,
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's10',
    title: 'Timeline & Milestones',
    assignedMembers: ['m1', 'm2'],
    items: [
      {
        id: 's10a',
        type: 'assumption',
        text: 'Project kick-off is planned for November 2026 subject to contract signature by 31 October.',
        assignedTo: 'm1',
        answered: true,
        response:
          'Contract red-line review complete. Legal expects signature by 28 Oct. Kick-off provisionally booked for 3 Nov 2026.',
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's11',
    title: 'Commercials',
    assignedMembers: ['m1', 'm3'],
    items: [
      {
        id: 's11a',
        type: 'assumption',
        text: 'Fixed price engagement with no scope creep clauses beyond the agreed Change Request process.',
        assignedTo: 'm1',
        answered: true,
        response:
          'Confirmed fixed price. Change Request process detailed in commercial schedule. Max 10% variance band agreed.',
      },
      {
        id: 's11b',
        type: 'assumption',
        text: 'Travel and expenses are included in the fixed price up to the agreed cap specified in Schedule B.',
        assignedTo: 'm3',
        answered: true,
        response:
          'Schedule B cap set at $45K. Any overrun requires written approval from both CFOs.',
      },
      {
        id: 's11c',
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
    id: 's12',
    title: 'Assumptions',
    assignedMembers: ['m2', 'm4'],
    items: [
      {
        id: 's12a',
        type: 'assumption',
        text: 'All data migration must be HIPAA compliant — client will provide formal compliance sign-off before migration begins.',
        assignedTo: 'm2',
        answered: true,
        response:
          'HIPAA BAA signed 10 Sept. DPO confirmed sign-off workflow: 10 business days before migration window.',
      },
      {
        id: 's12b',
        type: 'question',
        text: 'Has the client confirmed availability of key stakeholders for workshops within 5 business days of request?',
        assignedTo: 'm4',
        answered: false,
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's13',
    title: 'Risks & Mitigations',
    assignedMembers: ['m1'],
    items: [
      {
        id: 's13a',
        type: 'question',
        text: 'Have all Tier-1 risks been reviewed by the client Risk Committee and formally accepted?',
        assignedTo: 'm1',
        answered: true,
        response:
          'Risk Committee reviewed 8 Tier-1 risks on 16 Sept. 6 accepted, 2 require additional mitigation plans by 30 Sept.',
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's14',
    title: 'Security',
    assignedMembers: ['m3'],
    items: [
      {
        id: 's14a',
        type: 'assumption',
        text: "Solution must comply with ISO 27001 and client's internal security policy v3.2.",
        assignedTo: 'm3',
        answered: true,
        response:
          'Architecture review board confirmed ISO 27001 alignment. Security policy v3.2 shared — 3 controls flagged for resolution.',
      },
      {
        id: 's14b',
        type: 'question',
        text: 'Is penetration testing required pre-UAT, and who is responsible for scheduling and cost?',
        assignedTo: 'm3',
        answered: false,
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's15',
    title: 'Architecture',
    assignedMembers: ['m2', 'm4'],
    items: [
      {
        id: 's15a',
        type: 'assumption',
        text: 'Target state is a cloud-native microservices architecture hosted on Azure.',
        assignedTo: 'm2',
        answered: true,
        response:
          'Azure confirmed as strategic cloud provider. Architecture Decision Record signed off by CTO on 12 Sept.',
      },
      {
        id: 's15b',
        type: 'question',
        text: 'Are there any on-premise components that must remain due to data sovereignty constraints?',
        assignedTo: 'm4',
        answered: true,
        response:
          'Two components must remain on-prem: identity provider and document archive. Hybrid connectivity via ExpressRoute.',
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's16',
    title: 'Acceptance Criteria',
    assignedMembers: ['m1', 'm3'],
    items: [
      {
        id: 's16a',
        type: 'question',
        text: 'Has the client defined measurable UAT pass/fail criteria for each major deliverable?',
        assignedTo: 'm1',
        answered: false,
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's17',
    title: 'Change Management',
    assignedMembers: ['m2'],
    items: [
      {
        id: 's17a',
        type: 'assumption',
        text: 'A formal change control board (CCB) will be established within 4 weeks of project kick-off.',
        assignedTo: 'm2',
        answered: true,
        response:
          'CCB charter drafted. Membership agreed: client PO, delivery PM, architecture lead, and finance rep. First meeting scheduled for Week 5.',
      },
      {
        id: 's17b',
        type: 'question',
        text: 'What is the agreed SLA for processing a change request through the CCB?',
        assignedTo: 'm2',
        answered: false,
      },
    ],
    assumptions: [],
    questions: [],
  },
  {
    id: 's18',
    title: 'Support & Handover',
    assignedMembers: ['m1', 'm4'],
    items: [
      {
        id: 's18a',
        type: 'assumption',
        text: 'Hypercare period of 4 weeks post go-live is included, after which support transitions to client BAU team.',
        assignedTo: 'm1',
        answered: true,
        response:
          'Hypercare SLA agreed: P1 response 1h, P2 4h, P3 1 business day. Transition plan to be delivered 2 weeks before go-live.',
      },
      {
        id: 's18b',
        type: 'question',
        text: 'Has the client nominated a BAU support lead who will participate in knowledge-transfer sessions?',
        assignedTo: 'm4',
        answered: false,
      },
    ],
    assumptions: [],
    questions: [],
  },
]

// Meridian Healthcare — contributor (Narendra) has items assigned to him ('m5') across a
// handful of sections, with a deliberate mix of answered/unanswered and varied answer
// lengths (single word, one line, multi-sentence) so the Structure tab feels realistic.
// Overrides are keyed by item id; everything else keeps the original seed data.
const MERIDIAN_OVERRIDES: Record<
  string,
  { assignedTo: string; answered: boolean; response?: string }
> = {
  s1a: { assignedTo: 'm5', answered: true, response: 'Confirmed.' },
  s1b: { assignedTo: 'm5', answered: false },
  s4a: {
    assignedTo: 'm5',
    answered: true,
    response:
      'Source-to-Contract and Supplier Performance Management confirmed as top priorities by Procurement Lead on 14 Sept.',
  },
  s4b: {
    assignedTo: 'm5',
    answered: true,
    response: 'Yes — capped at 50 vendors for Phase 1, per CPO sign-off on 20 Sept.',
  },
  s7a: {
    assignedTo: 'm5',
    answered: true,
    response:
      'Confirmed. Sprint cadence agreed in the Project Initiation doc, with fortnightly client showcases booked from kick-off through to go-live, and a mid-phase checkpoint scheduled to reassess velocity.',
  },
  s7b: {
    assignedTo: 'm5',
    answered: true,
    response: 'Scrum at scale agreed during Architecture alignment session on 22 Sept.',
  },
  s10a: { assignedTo: 'm5', answered: true, response: 'Booked for 3 Nov 2026.' },
  s13a: {
    assignedTo: 'm5',
    answered: true,
    response:
      'Reviewed with the client Risk Committee on 16 Sept — 6 of 8 Tier-1 risks accepted outright, the remaining 2 need additional mitigation plans before sign-off, due by 30 Sept.',
  },
  s16a: {
    assignedTo: 'm5',
    answered: true,
    response:
      'Yes — UAT acceptance criteria defined in Annex B with client sign-off threshold set at 95% pass rate.',
  },
}

const MERIDIAN_SECTIONS: SOWSection[] = INITIAL_SECTIONS_V2.map((sec) => ({
  ...sec,
  assignedMembers: Array.from(new Set([...sec.assignedMembers, 'm5'])),
  items: sec.items.map((it) => {
    const o = MERIDIAN_OVERRIDES[it.id]
    return o ? { ...it, ...o, response: o.response } : it
  }),
}))

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

function AssigneesDisplay({
  assignedTo,
  inClientQueue,
  onReassign,
}: {
  assignedTo?: string | string[]
  inClientQueue?: boolean
  onReassign?: (newMemberId: string) => void
}) {
  const [hovered, setHovered] = useState(false)
  const [clickedOpen, setClickedOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  if (inClientQueue) {
    return (
      <span
        style={{
          fontSize: 11,
          color: '#10b981',
          fontWeight: 600,
          background: 'rgba(16, 185, 129, 0.1)',
          padding: '2px 8px',
          borderRadius: 4,
          whiteSpace: 'nowrap',
        }}
      >
        Client Queue
      </span>
    )
  }

  const ids = Array.isArray(assignedTo)
    ? assignedTo
    : assignedTo
    ? [assignedTo]
    : []

  if (ids.length === 0) {
    return (
      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
        <button
          type="button"
          onClick={(e) => {
            if (onReassign) {
              e.stopPropagation()
              setMenuOpen((v) => !v)
            }
          }}
          style={{
            fontSize: 11,
            color: onReassign ? '#0284c7' : '#94a3b8',
            fontStyle: 'italic',
            background: 'none',
            border: 'none',
            cursor: onReassign ? 'pointer' : 'default',
            padding: 0,
          }}
        >
          {onReassign ? '+ Assign' : 'Unassigned'}
        </button>
        {menuOpen && onReassign && (
          <>
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 998 }}
              onClick={(e) => {
                e.stopPropagation()
                setMenuOpen(false)
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                right: 0,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                padding: 4,
                zIndex: 999,
                minWidth: 160,
              }}
            >
              <div style={{ padding: '4px 8px', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Assign to
              </div>
              {SECTION_MEMBERS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onReassign(m.id)
                    setMenuOpen(false)
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 8px',
                    borderRadius: 5,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 12,
                    color: '#0d212c',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  <MemberAvatar memberId={m.id} size={18} />
                  <span>{m.name}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  const members = ids.map(memberById)

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
        }}
        onClick={(e) => {
          e.stopPropagation()
          setClickedOpen((prev) => !prev)
        }}
        title="View assigned contributors"
      >
        {members.map((m, idx) => (
          <div
            key={m.id}
            style={{
              marginLeft: idx > 0 ? -6 : 0,
              zIndex: members.length - idx,
            }}
          >
            <MemberAvatar memberId={m.id} size={22} />
          </div>
        ))}
      </div>

      {/* Tooltip / overlay when hovering or clicked and menu is not open */}
      {(hovered || clickedOpen) && !menuOpen && (
        <>
          {clickedOpen && (
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 99 }}
              onClick={(e) => {
                e.stopPropagation()
                setClickedOpen(false)
              }}
            />
          )}
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              padding: '8px 12px',
              zIndex: 100,
              minWidth: 200,
              width: 'max-content',
              pointerEvents: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#64748b',
                marginBottom: 6,
                whiteSpace: 'nowrap',
              }}
            >
              Assigned contributors
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {members.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <MemberAvatar memberId={m.id} size={18} />
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#0d212c',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {m.name}
                  </span>
                </div>
              ))}
            </div>
            {onReassign && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setClickedOpen(false)
                  setMenuOpen(true)
                }}
                style={{
                  marginTop: 6,
                  paddingTop: 6,
                  borderTop: '1px solid #f1f5f9',
                  fontSize: 10.5,
                  color: '#00C4C4',
                  fontWeight: 600,
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  display: 'block',
                  textAlign: 'left',
                }}
              >
                Change contributor →
              </button>
            )}
          </div>
        </>
      )}

      {/* Reassign dropdown menu */}
      {menuOpen && onReassign && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 998 }}
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen(false)
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 5px)',
              right: 0,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              padding: 5,
              zIndex: 999,
              minWidth: 180,
            }}
          >
            <div
              style={{
                padding: '6px 10px 4px',
                fontSize: 10.5,
                fontWeight: 700,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Reassign to
            </div>
            {SECTION_MEMBERS.map((m) => {
              const isCurrent = ids.includes(m.id)
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onReassign(m.id)
                    setMenuOpen(false)
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 10px',
                    borderRadius: 6,
                    background: isCurrent ? 'rgba(0,196,196,0.08)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 12,
                    color: isCurrent ? '#008080' : '#0d212c',
                    fontWeight: isCurrent ? 700 : 500,
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrent) (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc'
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrent) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                  }}
                >
                  <MemberAvatar memberId={m.id} size={18} />
                  <span style={{ flex: 1 }}>{m.name}</span>
                  {isCurrent && <Check size={13} color="#00C4C4" strokeWidth={2.5} />}
                </button>
              )
            })}
          </div>
        </>
      )}
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
              border: `1.5px solid ${dropdownOpen ? '#cbd5e1' : '#e2e8f0'}`,
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
                <span style={{ fontSize: 11, color: '#94a3b8' }}>Contributor</span>
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
                border: '1px solid #e2e8f0',
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
                      background: isSel ? '#f1f5f9' : 'transparent',
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
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>Contributor</div>
                    </div>
                    {isSel && <Check size={14} color="#475569" />}
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
function SectionDotMenu({
  onRename,
  onDelete,
  onSetDeadline,
  currentDeadline,
  sowDeadline = '2026-10-31',
  idx,
  total,
}: {
  onRename: () => void
  onDelete: () => void
  onSetDeadline: (date: string) => void
  currentDeadline?: string
  sowDeadline?: string
  idx?: number
  total?: number
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
            right: 0,
            top: (idx !== undefined && total !== undefined && idx >= total - 3) ? 'auto' : 'calc(100% + 4px)',
            bottom: (idx !== undefined && total !== undefined && idx >= total - 3) ? 'calc(100% + 4px)' : 'auto',
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            zIndex: 50,
            minWidth: 140,
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '8px 14px', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>Section Deadline</span>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              max={sowDeadline || '2026-10-31'}
              value={currentDeadline || sowDeadline || '2026-10-31'}
              onChange={(e) => {
                const val = e.target.value
                if (val && sowDeadline && val > sowDeadline) return
                onSetDeadline(val)
              }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                padding: '4px 8px',
                fontSize: 12,
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                outline: 'none',
              }}
            />
          </div>
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
                ;(e.currentTarget as HTMLButtonElement).style.background = '#f8fafc'
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

function StructureTab({
  initialSections = INITIAL_SECTIONS,
  viewerRole = 'pmo',
  currentMemberId = 'm5',
  onScoreChange,
  disableAnswer = false,
  hasPendingChanges = false,
  onResolveChanges,
  onOpenParticipantsModal,
  sowDeadline = '2026-10-31',
}: {
  initialSections?: SOWSection[]
  viewerRole?: 'pmo' | 'contributor' | 'reviewer' | 'admin' | 'client'
  currentMemberId?: string
  onScoreChange?: (score: number) => void
  disableAnswer?: boolean
  hasPendingChanges?: boolean
  onResolveChanges?: (accept: boolean) => void
  onOpenParticipantsModal?: () => void
  sowDeadline?: string
}) {
  const { showToast } = useToast()
  const isContributor = viewerRole === 'contributor'
  const isReviewer = viewerRole === 'reviewer'
  const [sections, setSections] = useState<SOWSection[]>(initialSections)
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [editingSectionTitle, setEditingSectionTitle] = useState('')
  const [sectionDeadlines, setSectionDeadlines] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    initialSections.forEach((s, idx) => {
      if (idx === 1) {
        init[s.id] = '2026-09-25'
      } else if (idx === 3) {
        init[s.id] = '2026-09-30'
      } else {
        init[s.id] = sowDeadline || '2026-10-31'
      }
    })
    return init
  })
  const [dependentPromptVisible, setDependentPromptVisible] = useState(true)
  const [hasCreatedDependentQuestion, setHasCreatedDependentQuestion] = useState(false)
  const [citationModalTarget, setCitationModalTarget] = useState<ContextCitationTarget | null>(null)
  const [activeId, setActiveId] = useState<string>(initialSections[0].id)
  const [showAddSectionModal, setShowAddSectionModal] = useState(false)
  const [addItemFor, setAddItemFor] = useState<string | null>(null) // section id
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [hoveredSection, setHoveredSection] = useState<string | null>(null)
  const [assignDropdownOpen, setAssignDropdownOpen] = useState(false)
  // Drag & drop state (PMO only)
  const [dragSectionId, setDragSectionId] = useState<string | null>(null)
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null)
  const [assignLimitError, setAssignLimitError] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean
    title: string
    message: string
    hideReason?: boolean
    onConfirm: (reason: string, text: string) => void
  } | null>(null)
  const [clientQueueModalOpen, setClientQueueModalOpen] = useState(false)
  const [activeTraceItem, setActiveTraceItem] = useState<{ item: SectionItem; label: string } | null>(null)
  const [feedbackModalOpen, setFeedbackModalOpen] = useState<{ sectionId: string; type: 'positive' | 'negative' } | null>(null)
  const [showSectionInfoTooltip, setShowSectionInfoTooltip] = useState(false)
  const assignDropdownRef = useRef<HTMLDivElement>(null)
  const rightPaneRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const isUserScrolling = useRef(false)
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hasSelection = selected.size > 0

  // Close assign dropdown on outside click
  useEffect(() => {
    if (!assignDropdownOpen) {
      setAssignLimitError(false)
      return
    }
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
    const item = sections.flatMap(s => s.items).find(i => i.id === itemId)
    if (item?.inClientQueue) return
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(itemId) ? next.delete(itemId) : next.add(itemId)
      return next
    })
  }

  const clearSelection = () => setSelected(new Set())

  const bulkAssign = (memberId: string, forceAssign?: boolean) => {
    setSections((prev) =>
      prev.map((s) => ({
        ...s,
        items: s.items.map((it) => {
          if (!selected.has(it.id) || it.inClientQueue) return it
          const currentAssignees = Array.isArray(it.assignedTo) ? it.assignedTo : (it.assignedTo ? [it.assignedTo] : [])
          let newAssignees = currentAssignees
          if (forceAssign !== undefined) {
             if (forceAssign && !currentAssignees.includes(memberId)) {
               if (currentAssignees.length < 5) newAssignees = [...currentAssignees, memberId]
             }
             if (!forceAssign && currentAssignees.includes(memberId)) newAssignees = currentAssignees.filter((m: string) => m !== memberId)
          } else {
             newAssignees = currentAssignees.includes(memberId)
              ? currentAssignees.filter((m: string) => m !== memberId)
              : (currentAssignees.length < 5 ? [...currentAssignees, memberId] : currentAssignees)
          }
          return { ...it, assignedTo: newAssignees }
        }),
      }))
    )
  }

  const toggleClientQueue = (itemId: string) => {
    setSections((prev) =>
      prev.map((s) => ({
        ...s,
        items: s.items.map((it) => {
          if (it.id === itemId) {
            return { ...it, inClientQueue: !it.inClientQueue, assignedTo: [] }
          }
          return it
        }),
      }))
    )
    setSelected((prev) => {
      const next = new Set(prev)
      next.delete(itemId)
      return next
    })
  }

  const bulkDelete = () => {
    setSections((prev) =>
      prev.map((s) => ({ ...s, items: s.items.filter((it) => !selected.has(it.id)) }))
    )
    clearSelection()
  }

  // Contributors see their assigned sections (where they are an assigned member or have assigned questions)
  // Inside their assigned sections, they can see all items, assign, reassign, delete, and add new questions!
  const isSectionAssignedToContributor = (s: SOWSection) =>
    s.assignedMembers.includes(currentMemberId) || s.items.some((i) => i.assignedTo === currentMemberId)

  // Reviewers see all sections and all items with answers populated.
  const visibleSections = isContributor
    ? sections
        .filter(isSectionAssignedToContributor)
        .map((s) => ({
          ...s,
          items: [...s.items].sort((a, b) => Number(a.answered) - Number(b.answered)),
        }))
    : isReviewer
    ? sections.map((s) => ({
        ...s,
        items: s.items.map((it) => ({
          ...it,
          answered: true,
          response:
            it.response ||
            (it.type === 'question'
              ? 'Confirmed with delivery team; details captured and will be reflected in the final SOW.'
              : 'Confirmed — validated with the client stakeholder and captured for the record.'),
        })),
      }))
    : sections

  // All item ids across visible sections (for "select all" within multi-select bar)
  const allItemIds = visibleSections.flatMap((s) => s.items.filter(i => !i.inClientQueue).map((i) => i.id))
  const allSelected = allItemIds.length > 0 && allItemIds.every((id) => selected.has(id))

  const answerItem = (itemId: string, response: string, isAiGenerated: boolean, isEdited: boolean) => {
    let itemName = ''
    setSections((prev) =>
      prev.map((s) => ({
        ...s,
        items: s.items.map((it) => {
          if (it.id === itemId) {
            itemName = it.text
            return { ...it, answered: true, response, isAiGenerated, isEdited }
          }
          return it
        }),
      }))
    )
    if (itemName) {
      const action = isAiGenerated
        ? (isEdited ? 'Edited AI-Generated Answer' : 'Answer Generated using AI')
        : 'Manually Answered Question'
      addGlobalAuditLog(action, `Answered: "${itemName.substring(0, 50)}..."`, isContributor ? 'Ashika Jain (Contributor)' : 'Ashika Jain (PMO)', 'form')
    }
  }

  const deleteItem = (itemId: string) => {
    setSections((prev) =>
      prev.map((s) => ({
        ...s,
        items: s.items.filter((it) => it.id !== itemId),
      }))
    )
    showToast('Deleted item successfully.', 'info')
  }

  const reassignItem = (itemId: string, newMemberId: string) => {
    setSections((prev) =>
      prev.map((s) => ({
        ...s,
        items: s.items.map((it) => (it.id === itemId ? { ...it, assignedTo: newMemberId } : it)),
      }))
    )
    const targetMember = memberById(newMemberId)
  }

  const kpiQuestions = (() => {
    const total = visibleSections.reduce(
      (n, s) => n + s.items.filter((i) => i.type === 'question').length,
      0
    )
    const done = visibleSections.reduce(
      (n, s) => n + s.items.filter((i) => i.type === 'question' && i.answered).length,
      0
    )
    return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 }
  })()
  const kpiAssumptions = (() => {
    const total = visibleSections.reduce(
      (n, s) => n + s.items.filter((i) => i.type === 'assumption').length,
      0
    )
    const done = visibleSections.reduce(
      (n, s) => n + s.items.filter((i) => i.type === 'assumption' && i.answered).length,
      0
    )
    return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 }
  })()
  const completionScore = ((kpiQuestions.total + kpiAssumptions.total) > 0 ? Math.round(((kpiQuestions.done + kpiAssumptions.done) / (kpiQuestions.total + kpiAssumptions.total)) * 100) : 0)
  const queuedCount = sections.flatMap(s => s.items).filter(it => it.inClientQueue).length

  useEffect(() => {
    onScoreChange?.(completionScore)
  }, [completionScore, onScoreChange])
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
          <div
            style={{
              width: 330,
              flexShrink: 0,
            borderRight: '1px solid rgba(0,196,196,0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: 'rgba(248,252,252,0.6)',
          }}
        >
          {/* Mini KPIs — card style matching SOW Draft */}
          <div
            style={{
              padding: '10px 12px',
              borderBottom: '1px solid rgba(0,196,196,0.1)',
              display: 'flex',
              gap: 6,
            }}
          >
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
                {kpiQuestions.done}/{kpiQuestions.total}
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
                Questions
              </div>
            </div>
            <div
              style={{
                flex: 1,
                background: 'rgba(139,92,246,0.08)',
                borderRadius: 6,
                padding: '6px 10px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 700, color: '#8b5cf6', lineHeight: 1 }}>
                {kpiAssumptions.done}/{kpiAssumptions.total}
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
                Assumptions
              </div>
            </div>
            <div
              style={{
                flex: 1,
                background: 'rgba(0,196,196,0.08)',
                borderRadius: 6,
                padding: '6px 10px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 700, color: '#00a0a0', lineHeight: 1 }}>
                {completionScore}%
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
                Completeness
              </div>
            </div>
          </div>
          <div
            style={{
              padding: '8px 16px 6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                <button
                  type="button"
                  onMouseEnter={() => setShowSectionInfoTooltip(true)}
                  onMouseLeave={() => setShowSectionInfoTooltip(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'help',
                    color: '#64748b',
                  }}
                >
                  <Info size={14} color="#64748b" />
                </button>
                {showSectionInfoTooltip && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      left: 0,
                      zIndex: 9999,
                      background: '#0d212c',
                      color: '#ffffff',
                      fontSize: 11,
                      fontWeight: 500,
                      padding: '6px 10px',
                      borderRadius: 6,
                      width: 210,
                      whiteSpace: 'normal',
                      lineHeight: 1.35,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
                      pointerEvents: 'none',
                    }}
                  >
                    You can drag and drop sections to reposition them
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px' }}>
            {visibleSections.map((sec, idx) => {
              const isActive = activeId === sec.id
              const isHovered = hoveredSection === sec.id
              const isDragOver = dragOverSectionId === sec.id && dragSectionId !== sec.id
              const isDragging = dragSectionId === sec.id
              // Progress: answered questions count
              const totalQ = sec.items.filter(i => i.type === 'question').length
              const doneQ = sec.items.filter(i => i.type === 'question' && i.answered).length
              const totalA = sec.items.filter(i => i.type === 'assumption').length
              const doneA = sec.items.filter(i => i.type === 'assumption' && i.answered).length
              const totalItems = totalQ + totalA
              const doneItems = doneQ + doneA
              // Deadline breach
              const deadline = sectionDeadlines[sec.id] || sowDeadline || '2026-10-31'
              const isDeadlineBreached = deadline && new Date(deadline) < new Date(new Date().toDateString())
              return (
                <div
                  key={sec.id}
                  style={{ position: 'relative', marginBottom: 6, opacity: isDragging ? 0.4 : 1, transition: 'opacity 0.15s' }}
                  onMouseEnter={() => setHoveredSection(sec.id)}
                  onMouseLeave={() => setHoveredSection(null)}
                  draggable={!isContributor && !isReviewer}
                  onDragStart={() => setDragSectionId(sec.id)}
                  onDragEnd={() => { setDragSectionId(null); setDragOverSectionId(null) }}
                  onDragOver={(e) => { e.preventDefault(); if (sec.id !== dragSectionId) setDragOverSectionId(sec.id) }}
                  onDrop={() => {
                    if (!dragSectionId || dragSectionId === sec.id) return
                    setSections(prev => {
                      const from = prev.findIndex(s => s.id === dragSectionId)
                      const to = prev.findIndex(s => s.id === sec.id)
                      if (from === -1 || to === -1) return prev
                      const updated = [...prev]
                      const [moved] = updated.splice(from, 1)
                      updated.splice(to, 0, moved)
                      return updated
                    })
                    setActiveId(dragSectionId)
                    scrollToSection(dragSectionId)
                    setDragSectionId(null)
                    setDragOverSectionId(null)
                  }}
                >
                  {isDragOver && (
                    <div style={{ height: 2, background: '#00C4C4', borderRadius: 2, marginBottom: 2 }} />
                  )}
                  <button
                    onClick={() => scrollToSection(sec.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: isDragOver ? '1.5px solid rgba(0,196,196,0.5)' : 'none',
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
                    {/* Drag handle — PMO only, only appears on hover */}
                    {!isContributor && !isReviewer && isHovered && (
                      <svg
                        width="10" height="14" viewBox="0 0 10 14" fill="none"
                        style={{ flexShrink: 0, opacity: 0.6, cursor: 'grab', transition: 'opacity 0.15s' }}
                      >
                        <circle cx="3" cy="2" r="1.3" fill="#64748b" />
                        <circle cx="7" cy="2" r="1.3" fill="#64748b" />
                        <circle cx="3" cy="7" r="1.3" fill="#64748b" />
                        <circle cx="7" cy="7" r="1.3" fill="#64748b" />
                        <circle cx="3" cy="12" r="1.3" fill="#64748b" />
                        <circle cx="7" cy="12" r="1.3" fill="#64748b" />
                      </svg>
                    )}
                    {editingSectionId === sec.id ? (
                      <input
                        autoFocus
                        value={editingSectionTitle}
                        onChange={(e) => setEditingSectionTitle(e.target.value)}
                        onBlur={() => {
                          if (editingSectionTitle.trim()) {
                            setSections((prev) =>
                              prev.map((s) => (s.id === sec.id ? { ...s, title: editingSectionTitle.trim() } : s))
                            )
                          }
                          setEditingSectionId(null)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur()
                          } else if (e.key === 'Escape') {
                            setEditingSectionId(null)
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          fontSize: 13,
                          fontWeight: isActive ? 600 : 500,
                          lineHeight: 1.3,
                          flex: 1,
                          border: '1px solid #00C4C4',
                          borderRadius: 4,
                          padding: '1px 4px',
                          outline: 'none',
                          background: '#fff',
                          color: '#0d212c',
                        }}
                      />
                    ) : (
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
                    )}
                    {/* Deadline breached chip */}
                    {isDeadlineBreached && (
                      <span style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: '#ef4444',
                        background: 'rgba(239,68,68,0.1)',
                        padding: '1px 5px',
                        borderRadius: 4,
                        flexShrink: 0,
                        whiteSpace: 'nowrap',
                      }}>Overdue</span>
                    )}
                  </button>
                  {/* Three-dot menu — visible on hover/active, PMO only */}
                  {!isContributor && !isReviewer && (isHovered || isActive) && (
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
                        idx={idx}
                        total={sections.length}
                        currentDeadline={deadline}
                        sowDeadline={sowDeadline}
                        onSetDeadline={(date) => {
                          if (sowDeadline && date > sowDeadline) return
                          setSectionDeadlines(prev => ({ ...prev, [sec.id]: date }))
                        }}
                        onRename={() => {
                          setEditingSectionTitle(sec.title)
                          setEditingSectionId(sec.id)
                        }}
                        onDelete={() => {
                          setDeleteConfirm({
                            isOpen: true,
                            title: 'Delete Section',
                            message: 'Are you sure you want to delete this section? This cannot be undone.',
                            hideReason: true,
                            onConfirm: (reason, text) => deleteSection(sec.id)
                          })
                        }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Add section — centered at bottom */}
          {!isContributor && !isReviewer && !disableAnswer && (
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
                  ;(e.currentTarget as HTMLButtonElement).style.background = '#f8fafc'
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
          )}
        </div>

        {/* ── Right pane ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Top Actions & Bulk-action bar combined */}
          {!isReviewer && (
            <div style={{ padding: '8px 28px', borderBottom: '1px solid rgba(0,196,196,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#374151',
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
                  {selected.size > 0 && <span style={{ color: '#00a0a0' }}>{selected.size} selected</span>}
                </label>
                <div style={{ height: 16, width: 1, background: '#e2e8f0' }} />
                
                {/* Assign to Dropdown */}
                <div ref={assignDropdownRef} style={{ position: 'relative' }} title={!hasSelection ? "Select at least one question or assumption" : undefined}>
                  <button
                    disabled={!hasSelection}
                    onClick={() => setAssignDropdownOpen((v) => !v)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '5px 12px',
                      borderRadius: 8,
                      border: `1.5px solid ${assignDropdownOpen ? '#00C4C4' : (hasSelection ? 'rgba(0,196,196,0.3)' : '#e2e8f0')}`,
                      background: assignDropdownOpen ? 'rgba(0,196,196,0.1)' : (hasSelection ? 'rgba(0,196,196,0.05)' : '#f8fafc'),
                      fontSize: 12,
                      fontWeight: 600,
                      color: hasSelection ? '#00a0a0' : '#94a3b8',
                      cursor: hasSelection ? 'pointer' : 'not-allowed',
                    }}
                  >
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 00-3-3.87" />
                      <path d="M16 3.13a4 4 0 010 7.75" />
                    </svg>
                    Assign to
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" viewBox="0 0 24 24" style={{ transform: assignDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  {assignDropdownOpen && hasSelection && (
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
                        minWidth: 260,
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
                      {assignLimitError && (
                        <div style={{ padding: '6px 12px', fontSize: 11, color: '#ef4444', background: '#fef2f2', borderBottom: '1px solid #fee2e2' }}>
                          Maximum 5 contributors can be assigned to an item.
                        </div>
                      )}
                      {SECTION_MEMBERS.map((m) => {
                        const allItemIdsArray = Array.from(selected)
                        const validSelectedIds = allItemIdsArray.filter(id => {
                          const it = sections.flatMap(s => s.items).find(x => x.id === id)
                          return it && !it.inClientQueue
                        })
                        const isAssigned = validSelectedIds.length > 0 && validSelectedIds.every(id => {
                          const it = sections.flatMap(s => s.items).find(x => x.id === id)
                          if (!it) return false
                          const assignees = Array.isArray(it.assignedTo) ? it.assignedTo : (it.assignedTo ? [it.assignedTo] : [])
                          return assignees.includes(m.id)
                        })
                        return (
                          <button
                            key={m.id}
                            onClick={() => {
                              if (!isAssigned) {
                                const hasMax = validSelectedIds.some(id => {
                                  const it = sections.flatMap(s => s.items).find(x => x.id === id)
                                  if (!it) return false
                                  const assignees = Array.isArray(it.assignedTo) ? it.assignedTo : (it.assignedTo ? [it.assignedTo] : [])
                                  return assignees.length >= 5
                                })
                                if (hasMax) {
                                  setAssignLimitError(true)
                                  return
                                }
                              }
                              setAssignLimitError(false)
                              bulkAssign(m.id, !isAssigned)
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
                            <div style={{
                              width: 16,
                              height: 16,
                              borderRadius: 4,
                              border: isAssigned ? 'none' : '1px solid #cbd5e1',
                              background: isAssigned ? '#00C4C4' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              {isAssigned && (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </div>
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
                              <div style={{ fontSize: 11, color: '#94a3b8' }}>Contributor</div>
                            </div>
                          </button>
                        )
                      })}
                      <div style={{ padding: '8px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                        <button
                          onClick={() => { clearSelection(); setAssignDropdownOpen(false) }}
                          style={{ padding: '6px 10px', borderRadius: 6, background: '#fff', border: '1px solid #e2e8f0', fontSize: 11, fontWeight: 600, cursor: 'pointer', color: '#64748b' }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => { clearSelection(); setAssignDropdownOpen(false) }}
                          style={{ padding: '6px 10px', borderRadius: 6, background: '#00C4C4', border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer', color: '#fff' }}
                        >
                          Invite Participants
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div style={{ height: 16, width: 1, background: '#e2e8f0' }} />
                
                <div title={!hasSelection ? "Select at least one question or assumption" : undefined}>
                  <button
                    disabled={!hasSelection}
                    onClick={() => setDeleteConfirm({
                      isOpen: true,
                      title: 'Bulk Delete',
                      message: `Are you sure you want to delete ${selected.size} selected items?`,
                      onConfirm: (reason, text) => bulkDelete()
                    })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: 12,
                      fontWeight: 600,
                      color: hasSelection ? '#ef4444' : '#94a3b8',
                      background: hasSelection ? '#fef2f2' : '#f8fafc',
                      border: 'none',
                      borderRadius: 7,
                      padding: '4px 10px',
                      cursor: hasSelection ? 'pointer' : 'not-allowed',
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
                </div>
                
                {hasSelection && (
                  <>
                    <div style={{ height: 16, width: 1, background: '#e2e8f0' }} />
                    <button
                      onClick={clearSelection}
                      style={{
                        fontSize: 12,
                        color: '#94a3b8',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      ✕ Clear
                    </button>
                  </>
                )}
              </div>

              {/* Client Queue button on right */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => setClientQueueModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'none',
                    border: 'none',
                    color: '#0d212c',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '6px 10px',
                    borderRadius: 6,
                  }}
                  title="Client Queue"
                >
                  <div style={{ position: 'relative' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2 }}>
                      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
                    </svg>
                    {queuedCount > 0 && (
                      <div style={{ position: 'absolute', top: -8, left: -10, background: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 12, padding: '1px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {queuedCount}
                      </div>
                    )}
                  </div>
                  {queuedCount} in Client Queue
                </button>
              </div>
            </div>
          )}

          <div ref={rightPaneRef} style={{ flex: 1, overflowY: 'auto', padding: '0 0 40px' }}>
            {visibleSections.map((sec, idx) => {
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
                      idx < visibleSections.length - 1 ? '1px solid rgba(0,196,196,0.1)' : 'none',
                  }}
                >
                  {/* Section header */}
                  {(() => {
                    const secDeadline = sectionDeadlines[sec.id] || sowDeadline || '2026-10-31'
                    const secDeadlineBreached = secDeadline && new Date(secDeadline) < new Date(new Date().toDateString())
                    const totalSecQ = sec.items.filter(i => i.type === 'question').length
                    const doneSecQ = sec.items.filter(i => i.type === 'question' && i.answered).length
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: '#0d212c', flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                          {sec.title}
                          {totalSecQ > 0 && (
                            <span style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: doneSecQ === totalSecQ ? '#16a34a' : '#64748b',
                              background: doneSecQ === totalSecQ ? 'rgba(22,163,74,0.1)' : '#f1f5f9',
                              padding: '2px 8px',
                              borderRadius: 12,
                              whiteSpace: 'nowrap',
                            }}>
                              {doneSecQ}/{totalSecQ} questions
                            </span>
                          )}
                          {secDeadlineBreached && (
                            <span style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: '#ef4444',
                              background: 'rgba(239,68,68,0.1)',
                              padding: '2px 7px',
                              borderRadius: 5,
                              whiteSpace: 'nowrap',
                            }}>Overdue</span>
                          )}
                        </span>
                        {/* Add item CTA - contributors can add new questions in their assigned sections */}
                        {!disableAnswer && !isReviewer && (!isContributor || isSectionAssignedToContributor(sec)) && (
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
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                              <path d="M12 5v14M5 12h14" />
                            </svg>
                            Add
                          </button>
                        )}
                      </div>
                    )
                  })()}

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
                      {assumptions.map((item, ai) => {
                        const canEditSec = !isReviewer && (!isContributor || isSectionAssignedToContributor(sec))
                        return (
                          <ItemRow
                            key={item.id}
                            item={item}
                            pendingStatus={hasPendingChanges ? (ai === 0 ? 'modified' : ai === 1 ? 'removed' : undefined) : undefined}
                            label={`Assumption ${ai + 1}`}
                            isSelected={selected.has(item.id)}
                            hasAnySelected={hasSelection}
                            onToggle={() => toggleSelect(item.id)}
                            isContributor={isContributor}
                            isReviewer={isReviewer}
                            canEdit={canEditSec}
                            onReassign={(newMemberId) => reassignItem(item.id, newMemberId)}
                            disableAnswer={disableAnswer || isReviewer}
                            onAnswer={(text, isAi, isEd) => answerItem(item.id, text, isAi, isEd)}
                            onToggleQueue={() => toggleClientQueue(item.id)}
                            onOpenCitation={setCitationModalTarget}
                            onOpenTrace={(it, lbl) => setActiveTraceItem({ item: it, label: lbl })}
                            onDelete={() => setDeleteConfirm({
                              isOpen: true,
                              title: 'Delete Assumption',
                              message: 'Are you sure you want to delete this assumption?',
                              onConfirm: (reason, text) => deleteItem(item.id)
                            })}
                          />
                        )
                      })}
                      {questions.map((item, qi) => {
                        const canEditSec = !isReviewer && (!isContributor || isSectionAssignedToContributor(sec))
                        const isDepTarget = (sec.id === 's3' || idx === 2) && qi === 0
                        return (
                          <ItemRow
                            key={item.id}
                            item={item}
                            pendingStatus={hasPendingChanges ? (qi === 0 ? 'modified' : qi === 1 ? 'removed' : undefined) : undefined}
                            label={`Question ${qi + 1}`}
                            isSelected={selected.has(item.id)}
                            hasAnySelected={hasSelection}
                            onToggle={() => toggleSelect(item.id)}
                            isContributor={isContributor}
                            isReviewer={isReviewer}
                            canEdit={canEditSec}
                            onReassign={(newMemberId) => reassignItem(item.id, newMemberId)}
                            disableAnswer={disableAnswer || isReviewer}
                            onAnswer={(text, isAi, isEd) => answerItem(item.id, text, isAi, isEd)}
                            onToggleQueue={() => toggleClientQueue(item.id)}
                            onOpenCitation={setCitationModalTarget}
                            onOpenTrace={(it, lbl) => setActiveTraceItem({ item: it, label: lbl })}
                            hasDependentPrompt={isDepTarget && dependentPromptVisible && !hasCreatedDependentQuestion}
                            onDismissDependentPrompt={() => setDependentPromptVisible(false)}
                            onCreateDependentQuestion={() => {
                              const newDepQuestion: SectionItem = {
                                id: `dep-q-${Date.now()}`,
                                type: 'question',
                                text: 'What is the sequence and delivery scope breakdown across each implementation phase?',
                                assignedTo: isContributor ? 'm1' : 'm1',
                                answered: false,
                              }
                              setSections((prev) =>
                                prev.map((s) =>
                                  s.id === sec.id
                                    ? { ...s, items: [...s.items, newDepQuestion] }
                                    : s
                                )
                              )
                              setHasCreatedDependentQuestion(true)
                              setDependentPromptVisible(false)
                            }}
                            onDelete={() => setDeleteConfirm({
                              isOpen: true,
                              title: 'Delete Question',
                              message: 'Are you sure you want to delete this question?',
                              onConfirm: (reason, text) => deleteItem(item.id)
                            })}
                          />
                        )
                      })}
                    </div>
                  )}
                  {!isContributor && !isReviewer && (
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-start', marginTop: 12 }}>
                      <button
                        title="Helpful"
                        onClick={() => setFeedbackModalOpen({ sectionId: sec.id, type: 'positive' })}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: '#64748b' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                        </svg>
                      </button>
                      <button
                        title="Not Helpful"
                        onClick={() => setFeedbackModalOpen({ sectionId: sec.id, type: 'negative' })}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: '#64748b' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
                        </svg>
                      </button>
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

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirm?.isOpen && (
        <DeleteConfirmModal
          title={deleteConfirm.title}
          message={deleteConfirm.message}
          hideReason={deleteConfirm.hideReason}
          onConfirm={(reason, text) => {
             deleteConfirm.onConfirm(reason, text)
             setDeleteConfirm(null)
          }}
          onClose={() => setDeleteConfirm(null)}
        />
      )}

      {clientQueueModalOpen && (
        <ClientQueueModal
          sections={sections}
          onRemoveFromQueue={(id) => {
             setSections(prev => prev.map(sec => ({
               ...sec,
               items: sec.items.map(it => it.id === id ? { ...it, inClientQueue: false } : it)
             })))
          }}
          onClose={() => setClientQueueModalOpen(false)}
        />
      )}
      {feedbackModalOpen && (
        <FeedbackModal
          type={feedbackModalOpen.type}
          onClose={() => setFeedbackModalOpen(null)}
          onSubmit={(text) => {
             // In a real app this would send the feedback to backend
             setFeedbackModalOpen(null)
          }}
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
      {citationModalTarget && (
        <DocumentCitationPreviewModal
          citation={citationModalTarget}
          onClose={() => setCitationModalTarget(null)}
        />
      )}
      {activeTraceItem && (
        <ItemTraceModal
          item={activeTraceItem.item}
          label={activeTraceItem.label}
          onClose={() => setActiveTraceItem(null)}
          onOpenCitation={setCitationModalTarget}
        />
      )}
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
  isContributor = false,
  isReviewer = false,
  disableAnswer = false,
  onAnswer,
  onDelete,
  onToggleQueue,
  hideAssigneesAndQueue = false,
  pendingStatus,
  onOpenCitation,
  onOpenTrace,
  canEdit: canEditProp,
  showCheckboxAlways = false,
  onReassign,
  hasDependentPrompt = false,
  onDismissDependentPrompt,
  onCreateDependentQuestion,
}: {
  item: SectionItem
  label: string
  isSelected: boolean
  hasAnySelected: boolean
  onToggle: () => void
  isContributor?: boolean
  isReviewer?: boolean
  disableAnswer?: boolean
  onAnswer?: (text: string, isAiGenerated: boolean, isEdited: boolean) => void
  onDelete?: () => void
  onToggleQueue?: () => void
  hideAssigneesAndQueue?: boolean
  pendingStatus?: 'modified' | 'removed'
  onOpenCitation?: (target: ContextCitationTarget) => void
  onOpenTrace?: (item: SectionItem, label: string) => void
  canEdit?: boolean
  showCheckboxAlways?: boolean
  onReassign?: (newMemberId: string) => void
  hasDependentPrompt?: boolean
  onDismissDependentPrompt?: () => void
  onCreateDependentQuestion?: () => void
}) {
  const canEdit = canEditProp !== undefined ? canEditProp : (!isContributor && !isReviewer)
  const [hovered, setHovered] = useState(false)
  const [draft, setDraft] = useState(item.response ?? '')
  const [editing, setEditing] = useState(false)
  const [isAiGenerated, setIsAiGenerated] = useState(item.isAiGenerated ?? false)
  const [isEditedAi, setIsEditedAi] = useState(false)
  const [hasAttachedDoc, setHasAttachedDoc] = useState(false)
  const [attachedDoc, setAttachedDoc] = useState<{
    name: string
    page: number
    section: string
  } | null>(() => {
    if (
      item.text.toLowerCase().includes('clinical') ||
      item.text.toLowerCase().includes('safety') ||
      item.text.toLowerCase().includes('hazard') ||
      item.text.toLowerCase().includes('attachment a') ||
      (item.response && item.response.toLowerCase().includes('clinical safety'))
    ) {
      return {
        name: 'Clinical Safety Case & Hazard Log Attachment A.pdf',
        page: 1,
        section: 'Clinical Safety Case & Hazard Log Attachment A',
      }
    }
    return null
  })
  const [isResolved, setIsResolved] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const isAssumption = item.type === 'assumption'
  const showCheckbox = hovered || isSelected || hasAnySelected || showCheckboxAlways
  const showOverlay = (hovered || isPinned) && Boolean(pendingStatus) && !isResolved

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        if (pendingStatus && !isResolved) {
          setIsPinned(true)
        }
      }}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 9,
        padding: '10px 13px',
        borderRadius: 9,
        border: pendingStatus && !isResolved ? (pendingStatus === 'modified' ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(239,68,68,0.25)') : '1px solid #e2e8f0',
        background: pendingStatus && !isResolved ? (pendingStatus === 'modified' ? 'rgba(59,130,246,0.03)' : 'rgba(239,68,68,0.03)') : '#ffffff',
        transition: 'border-color 0.12s, background 0.12s',
        position: 'relative',
        cursor: pendingStatus && !isResolved ? 'pointer' : 'default',
      }}
    >
      {/* Checkbox */}
      {((canEdit && !hideAssigneesAndQueue) || showCheckboxAlways) && (
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
      )}

      {/* Label tag */}
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
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



      {pendingStatus && !isResolved && (
        <div
          style={{ position: 'relative', display: 'inline-flex' }}
          onClick={(e) => {
            e.stopPropagation()
            setIsPinned(true)
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: pendingStatus === 'modified' ? '#3b82f6' : '#ef4444',
              background: pendingStatus === 'modified' ? 'rgba(59,130,246,0.1)' : 'rgba(239,68,68,0.1)',
              padding: '2px 7px',
              borderRadius: 5,
              flexShrink: 0,
              whiteSpace: 'nowrap',
              marginTop: 1,
              cursor: 'pointer',
            }}
          >
            {pendingStatus === 'modified' ? 'Modified' : 'Removed'}
          </span>

          {/* Floating overlay card anchored right below the chip */}
          {showOverlay && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                top: 'calc(100% + 5px)',
                left: 0,
                zIndex: 60,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                width: 190,
                pointerEvents: 'all',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    flexShrink: 0,
                    background: pendingStatus === 'modified' ? 'rgba(59,130,246,0.1)' : 'rgba(239,68,68,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {pendingStatus === 'modified' ? (
                    <svg width="11" height="11" fill="none" stroke="#3b82f6" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  ) : (
                    <svg width="11" height="11" fill="none" stroke="#ef4444" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#0d212c' }}>
                  {pendingStatus === 'modified' ? 'Form Modified' : 'Form Removed'}
                </div>
              </div>
              <div style={{ fontSize: 10, color: '#64748b', lineHeight: 1.35 }}>
                {pendingStatus === 'modified'
                  ? 'Updated via form resubmission.'
                  : 'Removed via form resubmission.'}
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsResolved(true)
                    setIsPinned(false)
                  }}
                  style={{
                    flex: 1,
                    padding: '5px 0',
                    borderRadius: 6,
                    border: 'none',
                    background: '#16a34a',
                    color: '#ffffff',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                  }}
                >
                  <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Accept
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsResolved(true)
                    setIsPinned(false)
                  }}
                  style={{
                    flex: 1,
                    padding: '5px 0',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    color: '#64748b',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                  }}
                >
                  <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Text + optional response thread */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'inline', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.55, marginRight: 8 }}>{item.text}</span>
          {item.isAiGenerated && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: '#7c3aed',
                background: 'rgba(139,92,246,0.1)',
                border: '1px solid rgba(139,92,246,0.25)',
                padding: '2px 7px',
                borderRadius: 5,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3.5,
                verticalAlign: 'middle',
                whiteSpace: 'nowrap',
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m14.36-6.36l-2.12 2.12M8.76 15.24l-2.12 2.12m10.72 0l-2.12-2.12M8.76 8.76L6.64 6.64" />
              </svg>
              Answered with AI
            </span>
          )}
        </div>
        {item.response && !editing && (
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
            <span
              style={{
                fontSize: 12,
                color: '#0d7b7b',
                lineHeight: 1.55,
                fontStyle: 'italic',
                flex: 1,
              }}
            >
              {item.response}
            </span>
            {!disableAnswer && (
              <button
                type="button"
                onClick={() => {
                  setDraft(item.response ?? '')
                  setIsAiGenerated(item.isAiGenerated ?? false)
                  setEditing(true)
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#00a0a0',
                  flexShrink: 0,
                }}
              >
                Edit
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onOpenTrace?.(item, label)
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                fontSize: 11,
                fontWeight: 600,
                color: '#008b8b',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0 4px',
                flexShrink: 0,
                transition: 'opacity 0.15s ease',
              }}
              title="View statement-level traceability history"
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.75')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
            >
              <Clock size={10} />
              View trace
            </button>
          </div>
        )}
        {item.response && !editing && attachedDoc && (
          <div style={{ marginTop: 6, display: 'flex' }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onOpenCitation?.({
                  title: item.text,
                  sourceDoc: attachedDoc.name,
                  page: attachedDoc.page || 2,
                  section: attachedDoc.section || 'Attachment A: Clinical Safety Case (Page 2 • Section 5)',
                  highlightSnippet: 'Clinical Safety Case & Hazard Log',
                })
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '3.5px 10px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                color: '#475569',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <FileText size={13} strokeWidth={1.75} color="#64748b" />
              <span>{attachedDoc.section || `${attachedDoc.name} (Page ${attachedDoc.page || 2} • Section 5)`}</span>
            </button>
          </div>
        )}
        {!disableAnswer && (!item.response || editing) && (
          <div
            style={{
              marginTop: 8,
              paddingTop: 8,
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <textarea
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value)
                if (isAiGenerated) setIsEditedAi(true)
              }}
              placeholder="Type your answer…"
              rows={2}
              style={{
                width: '100%',
                padding: '7px 10px',
                fontSize: 12.5,
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                color: '#0d212c',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#cbd5e1')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
            />
            {attachedDoc && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onOpenCitation?.({
                      title: item.text,
                      sourceDoc: attachedDoc.name,
                      page: attachedDoc.page || 2,
                      section: attachedDoc.section || 'Attachment A: Clinical Safety Case (Page 2 • Section 5)',
                      highlightSnippet: 'Clinical Safety Case & Hazard Log',
                    })
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '3.5px 10px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#475569',
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <FileText size={13} strokeWidth={1.75} color="#64748b" />
                  <span>{attachedDoc.section || `${attachedDoc.name} (Page ${attachedDoc.page || 2} • Section 5)`}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setAttachedDoc(null)
                    setHasAttachedDoc(false)
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 2,
                  }}
                  title="Remove document"
                >
                  <X size={13} />
                </button>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <label style={{ cursor: attachedDoc ? 'not-allowed' : 'pointer', opacity: attachedDoc ? 0.6 : 1 }}>
                  <input
                    type="file"
                    style={{ display: 'none' }}
                    disabled={!!attachedDoc}
                    onChange={(e) => {
                      if (attachedDoc) return
                      if (e.target.files && e.target.files.length > 0) {
                        const file = e.target.files[0]
                        if (file.size > 10 * 1024 * 1024) {
                          alert('File size exceeds the 10MB limit. Please upload a document up to 10MB.')
                          return
                        }
                        const docName = file.name || 'Clinical Safety Case & Hazard Log Attachment A.pdf'
                        setAttachedDoc({
                          name: docName,
                          page: 2,
                          section: 'Attachment A: Clinical Safety Case (Page 2 • Section 5)',
                        })
                        setHasAttachedDoc(true)
                        const extracted = `Document "${docName}" attached. The requirement is confirmed per Clinical Safety Case standards.`
                        setDraft(draft ? draft + '\n' + extracted : extracted)
                        setIsAiGenerated(true)
                        setIsEditedAi(false)
                      }
                    }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '5px 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: attachedDoc ? '#94a3b8' : '#475569',
                      cursor: attachedDoc ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <UploadCloud size={12} color={attachedDoc ? '#94a3b8' : '#64748b'} />
                    {attachedDoc ? '1 Doc Limit Reached' : 'Upload Doc (Max 10MB)'}
                  </div>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setDraft(
                      isAssumption
                        ? 'Confirmed — validated with the client stakeholder and captured for the record.'
                        : 'Yes, confirmed with the client team; details captured and will be reflected in the final SOW.'
                    )
                    setIsAiGenerated(true)
                    setIsEditedAi(false)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '5px 10px',
                    borderRadius: 6,
                    border: '1px solid rgba(139,92,246,0.35)',
                    background: 'rgba(139,92,246,0.07)',
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: '#7c3aed',
                    cursor: 'pointer',
                  }}
                >
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
                    <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m14.36-6.36l-2.12 2.12M8.76 15.24l-2.12 2.12m10.72 0l-2.12-2.12M8.76 8.76L6.64 6.64" />
                  </svg>
                  Answer with AI <span style={{ opacity: 0.7, fontSize: 10, marginLeft: 2 }}>(10 Tokens)</span>
                </button>
                <button
                  type="button"
                  disabled={!draft.trim()}
                  onClick={() => {
                    onAnswer?.(draft.trim(), isAiGenerated, isEditedAi)
                    setEditing(false)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '5px 12px',
                    borderRadius: 6,
                    border: 'none',
                    background: draft.trim() ? '#16a34a' : 'rgba(148,163,184,0.25)',
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: draft.trim() ? '#ffffff' : '#94a3b8',
                    cursor: draft.trim() ? 'pointer' : 'not-allowed',
                    boxShadow: draft.trim() ? '0 1px 4px rgba(22,163,74,0.35)' : 'none',
                  }}
                >
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  Save Answer
                </button>
              </div>

              {/* View trace button on the same line as input field */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenTrace?.(item, label)
                }}
                title="View statement-level traceability history"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: '#008b8b',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px 4px',
                  marginLeft: 'auto',
                  transition: 'opacity 0.15s ease',
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.75')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
              >
                <Clock size={11} />
                View trace
              </button>
            </div>
          </div>
        )}

        {/* Dependent Question Callout under Question/Assumption Answer */}
        {hasDependentPrompt && (
          <div
            style={{
              marginTop: 10,
              padding: '12px 16px',
              borderRadius: 10,
              background: 'rgba(0,196,196,0.06)',
              border: '1px solid rgba(0,196,196,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#008080', fontSize: 13, fontWeight: 700 }}>
              <Sparkles size={14} color="#00C4C4" />
              Dependent question identified
            </div>
            <div style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.5 }}>
              Your answer introduces &ldquo;delivered in phases&rdquo;. The SOW needs the phase sequence and scope to define the timeline accurately.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
              <button
                type="button"
                onClick={onDismissDependentPrompt}
                style={{
                  padding: '5px 14px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer',
                }}
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={onCreateDependentQuestion}
                style={{
                  padding: '5px 16px',
                  borderRadius: 6,
                  border: 'none',
                  background: '#00C4C4',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#ffffff',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,196,196,0.25)',
                }}
              >
                Create dependent question
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Assigned to & Delete */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginTop: 2 }}>
        {!hideAssigneesAndQueue && (
          <AssigneesDisplay
            assignedTo={item.assignedTo}
            inClientQueue={item.inClientQueue}
            onReassign={canEdit ? onReassign : undefined}
          />
        )}
        {canEdit && !hideAssigneesAndQueue && (
          <button
            onClick={() => onToggleQueue?.()}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: item.inClientQueue ? '#22c55e' : '#cbd5e1',
              padding: 4,
              opacity: item.inClientQueue || hovered ? 1 : 0,
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={item.inClientQueue ? "Remove from Client Queue" : "Add to Client Queue"}
            onMouseEnter={(e) => {
              if (!item.inClientQueue) (e.currentTarget as HTMLButtonElement).style.color = '#22c55e'
            }}
            onMouseLeave={(e) => {
              if (!item.inClientQueue) (e.currentTarget as HTMLButtonElement).style.color = '#cbd5e1'
            }}
          >
            <div style={{ position: 'relative', display: 'flex' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
              </svg>
              {item.inClientQueue && (
                <div style={{ position: 'absolute', bottom: -5, right: -5, background: '#fff', borderRadius: '50%', width: 12, height: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#22c55e">
                    <circle cx="12" cy="12" r="12" />
                    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="#fff" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        )}
        {canEdit && (
          <button
            onClick={() => {
              onDelete?.()
            }}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#ef4444',
              padding: 2,
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.1s',
            }}
            title="Delete Question"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
        )}
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

/* ── AI Review and Summary Modal (PMO & Reviewer) ────────────────────────── */

interface AIReviewFinding {
  id: string
  criteria: 'Completeness' | 'Consistency' | 'Traceability' | 'Clarity'
  severity: 'Critical' | 'Needs Review'
  title: string
  description: string
  affected: string
  evidence: string
  suggestedFix?: string
  resolved: boolean
  resolutionType?: string
  assignedEmail?: string
  dismissReason?: string
}

const INITIAL_AI_FINDINGS: AIReviewFinding[] = [
  {
    id: 'f1',
    criteria: 'Completeness',
    severity: 'Critical',
    title: 'Requirement R-014 is not addressed',
    description: 'Requirement R-014 is not addressed in the Deliverables section.',
    affected: 'Deliverables',
    evidence: 'Polaris Constellation check identified that requirement R-014 (Clinical decision-support escalation workflow) has no corresponding output deliverable in Section 8.',
    suggestedFix: 'Incorporate requirement R-014 into Deliverable D-03 specification.',
    resolved: false,
  },
  {
    id: 'f2',
    criteria: 'Consistency',
    severity: 'Needs Review',
    title: 'Implementation timeline differs across sections',
    description: 'Implementation timeline differs: Section 3 says 8 weeks; Section 7 says 10 weeks.',
    affected: 'Scope · Timeline',
    evidence: 'Implementation timeline differs: Section 3 states "8 weeks" for rollout completion while Section 7 timeline schedule lists "10 weeks".',
    suggestedFix: 'Standardize project timeline duration across all sections to 8 weeks as confirmed in RFP.',
    resolved: false,
  },
  {
    id: 'f3',
    criteria: 'Traceability',
    severity: 'Needs Review',
    title: 'Unlinked key statements in summary',
    description: 'Two key statements have no linked requirement, source, or approved change.',
    affected: 'Executive Summary',
    evidence: 'Two key statements have no linked requirement, source, or approved change in the intake repository or validated stakeholder responses.',
    suggestedFix: 'Link Executive Summary milestones to RFP Section 4.2 data source.',
    resolved: false,
  },
  {
    id: 'f4',
    criteria: 'Clarity',
    severity: 'Needs Review',
    title: 'Ambiguous system performance objective',
    description: '"Improve system performance" is ambiguous and has no measurable acceptance criterion.',
    affected: 'Objectives',
    evidence: '"Improve system performance" is ambiguous and has no measurable acceptance criterion or quantitative service-level threshold defined.',
    suggestedFix: 'Quantify performance target as: <250ms API response latency under 5,000 req/sec load.',
    resolved: false,
  },
  {
    id: 'f5',
    criteria: 'Clarity',
    severity: 'Needs Review',
    title: 'Deliverable 4 terminology mismatch',
    description: 'Deliverable 4 uses terminology that differs from the approved client input.',
    affected: 'Deliverables',
    evidence: 'Deliverable 4 uses terminology that differs from the approved client input document "Scope_Requirements_RFP.pdf".',
    suggestedFix: 'Align terminology to match approved "Clinical Decision Support" standard.',
    resolved: false,
  },
]

function AIReviewModal({
  isOpen,
  onClose,
  onAcknowledge,
  onSendToRework,
  hasRunBefore,
  onResolveManually,
}: {
  isOpen: boolean
  onClose: () => void
  onAcknowledge?: () => void
  onSendToRework?: () => void
  hasRunBefore: boolean
  onResolveManually?: (affected: string) => void
}) {
  const [stage, setStage] = useState<'thinking' | 'summary'>('thinking')
  const [findings, setFindings] = useState<AIReviewFinding[]>(INITIAL_AI_FINDINGS)
  const [expandedCriteria, setExpandedCriteria] = useState<Record<string, boolean>>({
    Completeness: false,
    Consistency: false,
    Traceability: false,
    Clarity: false,
  })

  // Action inline states for Assign & Dismiss
  const [activeAssignFindingId, setActiveAssignFindingId] = useState<string | null>(null)
  const [assignEmail, setAssignEmail] = useState('')
  const [assignEmailError, setAssignEmailError] = useState<string | null>(null)

  const [activeDismissFindingId, setActiveDismissFindingId] = useState<string | null>(null)
  const [dismissReason, setDismissReason] = useState('')
  const [dismissReasonError, setDismissReasonError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    if (stage === 'thinking') {
      const timer = setTimeout(() => {
        setStage('summary')
        // Check completed
        onAcknowledge?.()
      }, 2400)
      return () => clearTimeout(timer)
    }
  }, [isOpen, stage, hasRunBefore, onAcknowledge])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!isOpen) return null

  const toggleCriteria = (crit: string) => {
    setExpandedCriteria((prev) => ({ ...prev, [crit]: !prev[crit] }))
  }

  // 1. Resolve manually (keep popup open)
  const handleResolveManuallyClick = (finding: AIReviewFinding) => {
    onResolveManually?.(finding.affected)
    setFindings((prev) =>
      prev.map((f) =>
        f.id === finding.id
          ? { ...f, resolved: true, resolutionType: 'Resolved manually' }
          : f
      )
    )
  }

  // 2. Accept AI option (keep popup open)
  const handleAcceptAiOptionClick = (finding: AIReviewFinding) => {
    setFindings((prev) =>
      prev.map((f) =>
        f.id === finding.id
          ? { ...f, resolved: true, resolutionType: 'Accepted AI option' }
          : f
      )
    )
  }

  // 3. Assign to contributor (with regex validation)
  const handleConfirmAssign = (finding: AIReviewFinding) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!assignEmail.trim()) {
      setAssignEmailError('Email address is required.')
      return
    }
    if (!emailRegex.test(assignEmail.trim())) {
      setAssignEmailError('Please enter a valid email address (e.g. name@m42.ae).')
      return
    }

    setFindings((prev) =>
      prev.map((f) =>
        f.id === finding.id
          ? { ...f, resolved: true, resolutionType: 'Assigned to contributor', assignedEmail: assignEmail.trim() }
          : f
      )
    )
    setActiveAssignFindingId(null)
    setAssignEmail('')
    setAssignEmailError(null)
  }

  // 4. Dismiss (mandatory reason)
  const handleConfirmDismiss = (finding: AIReviewFinding) => {
    if (!dismissReason.trim()) {
      setDismissReasonError('Reason is mandatory to dismiss an AI finding.')
      return
    }

    setFindings((prev) =>
      prev.map((f) =>
        f.id === finding.id
          ? { ...f, resolved: true, resolutionType: 'Dismissed', dismissReason: dismissReason.trim() }
          : f
      )
    )
    setActiveDismissFindingId(null)
    setDismissReason('')
    setDismissReasonError(null)
  }

  const CRITERIA_PARAMS: {
    key: 'Completeness' | 'Consistency' | 'Traceability' | 'Clarity'
    name: string
    description: string
  }[] = [
    {
      key: 'Completeness',
      name: 'Completeness',
      description: 'Checks for mandatory section coverage, RFP requirements, and deliverable commitments.',
    },
    {
      key: 'Consistency',
      name: 'Consistency',
      description: 'Verifies alignment between project timelines, commercial terms, and scope statements.',
    },
    {
      key: 'Traceability',
      name: 'Traceability',
      description: 'Confirms that statements, assumptions, and commitments link back to RFP or source citations.',
    },
    {
      key: 'Clarity',
      name: 'Clarity',
      description: 'Evaluates measurable acceptance criteria, unambiguous scope boundaries, and consistent terminology.',
    },
  ]

  const hasActionTaken = findings.some((f) => f.resolved)
  const totalOpenFindings = findings.filter((f) => !f.resolved).length

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(13,33,44,0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 960,
          maxHeight: '90vh',
          background: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.22)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid rgba(0,196,196,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top Header ── */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0d212c' }}>
              AI Review &amp; Summary
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {stage === 'summary' && (
              <button
                type="button"
                disabled={!hasActionTaken}
                onClick={() => {
                  if (!hasActionTaken) return
                  setStage('thinking')
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 8,
                  background: hasActionTaken ? '#00C4C4' : '#cbd5e1',
                  border: 'none',
                  color: hasActionTaken ? '#ffffff' : '#64748b',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: hasActionTaken ? 'pointer' : 'not-allowed',
                  boxShadow: hasActionTaken ? '0 2px 6px rgba(0,196,196,0.25)' : 'none',
                  opacity: hasActionTaken ? 1 : 0.65,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (hasActionTaken) {
                    ;(e.currentTarget as HTMLButtonElement).style.background = '#00a8a8'
                  }
                }}
                onMouseLeave={(e) => {
                  if (hasActionTaken) {
                    ;(e.currentTarget as HTMLButtonElement).style.background = '#00C4C4'
                  }
                }}
                title={hasActionTaken ? "Rerun AI analysis across all sections" : "Take action on at least one finding before rerunning"}
              >
                <Sparkles size={13} color={hasActionTaken ? "#ffffff" : "#64748b"} />
                Rerun AI Check
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = '#0d212c'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = '#64748b'
              }}
              title="Close AI Review"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── Processing / Thinking Stage using FormGeneratingAnimation inside Popup ── */}
        {stage === 'thinking' ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#ffffff',
              padding: '40px 24px',
              minHeight: 360,
            }}
          >
            <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
              <div style={{ marginBottom: 16 }}>
                <FormGeneratingAnimation />
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#0d212c', marginBottom: 6 }}>
                AI is reviewing the entire SOW draft…
              </div>
              
            </div>
          </div>
        ) : (
          /* ── Summary & Inline Findings View ── */
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              background: '#ffffff',
              padding: '24px',
            }}
          >
            <div style={{ width: '100%' }}>
              {/* ── 4 Criteria Parameters with Expand/Collapse & Inline Findings ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {CRITERIA_PARAMS.map((param) => {
                const paramFindings = findings.filter((f) => f.criteria === param.key)
                const openParamFindings = paramFindings.filter((f) => !f.resolved)
                const isReady = openParamFindings.length === 0
                const isExpanded = !!expandedCriteria[param.key]

                return (
                  <div
                    key={param.key}
                    style={{
                      background: '#ffffff',
                      borderBottom: '1px solid #f1f5f9',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Parameter Header (Click to expand/collapse) */}
                    <div
                      onClick={() => toggleCriteria(param.key)}
                      style={{
                        padding: '18px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        background: '#ffffff',
                        borderBottom: isExpanded ? '1px solid #f1f5f9' : 'none',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0, paddingRight: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 16, fontWeight: 700, color: '#0d212c' }}>
                            {param.name}
                          </span>

                          {/* Count Badge */}
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: '#64748b',
                              background: '#f1f5f9',
                              padding: '2px 8px',
                              borderRadius: 10,
                            }}
                          >
                            {openParamFindings.length === 0
                              ? '0 open findings'
                              : `${openParamFindings.length} open ${openParamFindings.length === 1 ? 'finding' : 'findings'}`}
                          </span>
                        </div>
                        <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 4 }}>
                          {param.description}
                        </div>
                      </div>

                      {/* Status Chip & Expand / Collapse Icon with 12px gap */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                        {/* "Ready" / "Not ready" Status Chip */}
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '2px 10px',
                            borderRadius: 9999,
                            fontSize: 12,
                            fontWeight: 500,
                            background: isReady ? '#dcfce7' : '#fee2e2',
                            color: isReady ? '#15803d' : '#dc2626',
                            border: isReady ? '1px solid rgba(187,247,208,0.7)' : '1px solid rgba(254,202,202,0.7)',
                          }}
                        >
                          {isReady ? 'Ready' : 'Not ready'}
                        </span>

                        {/* Expand / Collapse Icon (no stroke / fill) */}
                        <div
                          style={{
                            background: 'none',
                            border: 'none',
                            color: isExpanded ? '#007a7a' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          <ChevronDown
                            size={18}
                            style={{
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.2s ease',
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Inline Findings List (Displayed directly in the modal) */}
                    {isExpanded && (
                      <div style={{ padding: '8px 8px 16px', background: '#ffffff' }}>
                        {paramFindings.length === 0 ? (
                          <div style={{ fontSize: 13, color: '#16a34a', fontWeight: 500, padding: '8px 0' }}>
                            ✓ No findings detected for this parameter. All statements verified.
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                            {paramFindings.map((finding) => {
                              const isAssigning = activeAssignFindingId === finding.id
                              const isDismissing = activeDismissFindingId === finding.id

                              return (
                                <div
                                  key={finding.id}
                                  style={{
                                    borderBottom: '1px solid #f1f5f9',
                                    padding: '16px 8px',
                                    background: '#ffffff',
                                    opacity: finding.resolved ? 0.75 : 1,
                                  }}
                                >
                                  {/* Finding Top Row */}
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      marginBottom: 6,
                                      gap: 10,
                                      flexWrap: 'wrap',
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <span
                                        style={{
                                          width: 8,
                                          height: 8,
                                          borderRadius: '50%',
                                          background: finding.resolved
                                            ? '#16a34a'
                                            : finding.severity === 'Critical'
                                            ? '#ef4444'
                                            : '#ea580c',
                                        }}
                                      />
                                      <span style={{ fontSize: 14, fontWeight: 700, color: '#0d212c' }}>
                                        {finding.title}
                                      </span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <span
                                        style={{
                                          fontSize: 11,
                                          fontWeight: 600,
                                          color: finding.severity === 'Critical' ? '#dc2626' : '#d97706',
                                          background: finding.severity === 'Critical' ? '#fee2e2' : '#fef3c7',
                                          padding: '2px 8px',
                                          borderRadius: 6,
                                        }}
                                      >
                                        {finding.severity}
                                      </span>
                                      {finding.resolved && finding.resolutionType && finding.resolutionType !== 'Passed AI Re-check' && (
                                        <span
                                          style={{
                                            fontSize: 11,
                                            fontWeight: 700,
                                            color: '#16a34a',
                                            background: '#ecfdf5',
                                            border: '1px solid #bbf7d0',
                                            padding: '2px 8px',
                                            borderRadius: 6,
                                          }}
                                        >
                                          ✓ {finding.resolutionType}
                                          {finding.assignedEmail ? ` (${finding.assignedEmail})` : ''}
                                          {finding.dismissReason ? ` (${finding.dismissReason})` : ''}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Description & Evidence */}
                                  <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, marginBottom: 10 }}>
                                    {finding.description}
                                  </div>

                                  <div
                                    style={{
                                      background: 'rgba(0,196,196,0.04)',
                                      borderLeft: '3px solid #00C4C4',
                                      padding: '8px 12px',
                                      borderRadius: '0 8px 8px 0',
                                      fontSize: 12,
                                      color: '#334155',
                                      lineHeight: 1.5,
                                      marginBottom: 14,
                                    }}
                                  >
                                    <strong>AI Evidence:</strong> {finding.evidence}
                                    {finding.suggestedFix && (
                                      <div style={{ marginTop: 4, color: '#007a7a' }}>
                                        <strong>Suggested Action:</strong> {finding.suggestedFix}
                                      </div>
                                    )}
                                  </div>

                                  {/* ── Review Options in Same Modal (No Emojis) ── */}
                                  {!finding.resolved && (
                                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                        {/* Option 1: Resolve manually */}
                                        <button
                                          type="button"
                                          onClick={() => handleResolveManuallyClick(finding)}
                                          style={{
                                            padding: '6px 13px',
                                            borderRadius: 7,
                                            border: '1px solid #cbd5e1',
                                            background: '#ffffff',
                                            color: '#334155',
                                            fontSize: 12,
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease',
                                          }}
                                          onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                                          onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                                          title={`Redirect to ${finding.affected} to edit directly`}
                                        >
                                          Resolve manually
                                        </button>

                                        {/* Option 2: Accept AI option */}
                                        <button
                                          type="button"
                                          onClick={() => handleAcceptAiOptionClick(finding)}
                                          style={{
                                            padding: '6px 14px',
                                            borderRadius: 7,
                                            border: 'none',
                                            background: '#00C4C4',
                                            color: '#ffffff',
                                            fontSize: 12,
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 6px rgba(0,196,196,0.3)',
                                            transition: 'all 0.15s ease',
                                          }}
                                          onMouseEnter={(e) => (e.currentTarget.style.background = '#00a8a8')}
                                          onMouseLeave={(e) => (e.currentTarget.style.background = '#00C4C4')}
                                          title="Accept AI suggested update and apply to draft"
                                        >
                                          Accept AI option
                                        </button>

                                        {/* Option 3: Assign to contributor */}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActiveAssignFindingId((prev) => (prev === finding.id ? null : finding.id))
                                            setActiveDismissFindingId(null)
                                            setAssignEmailError(null)
                                          }}
                                          style={{
                                            padding: '6px 13px',
                                            borderRadius: 7,
                                            border: isAssigning ? '1.5px solid #00a0a0' : '1px solid #cbd5e1',
                                            background: isAssigning ? 'rgba(0,196,196,0.08)' : '#ffffff',
                                            color: isAssigning ? '#007a7a' : '#334155',
                                            fontSize: 12,
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease',
                                          }}
                                        >
                                          Assign to contributor
                                        </button>

                                        {/* Option 4: Dismiss */}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActiveDismissFindingId((prev) => (prev === finding.id ? null : finding.id))
                                            setActiveAssignFindingId(null)
                                            setDismissReasonError(null)
                                          }}
                                          style={{
                                            padding: '6px 10px',
                                            borderRadius: 6,
                                            border: 'none',
                                            background: 'transparent',
                                            color: isDismissing ? '#0d212c' : '#64748b',
                                            fontSize: 12,
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease',
                                          }}
                                          onMouseEnter={(e) => {
                                            ;(e.currentTarget as HTMLButtonElement).style.color = '#0d212c'
                                          }}
                                          onMouseLeave={(e) => {
                                            ;(e.currentTarget as HTMLButtonElement).style.color = isDismissing ? '#0d212c' : '#64748b'
                                          }}
                                        >
                                          Dismiss
                                        </button>
                                      </div>

                                      {/* Inline Assign Form */}
                                      {isAssigning && (
                                        <div
                                          style={{
                                            marginTop: 10,
                                            padding: '8px 0',
                                            background: 'transparent',
                                            border: 'none',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 8,
                                          }}
                                        >
                                          <div style={{ fontSize: 12, fontWeight: 600, color: '#0d212c' }}>
                                            Assign this finding to a team member:
                                          </div>
                                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                            <input
                                              type="email"
                                              value={assignEmail}
                                              onChange={(e) => {
                                                setAssignEmail(e.target.value)
                                                if (assignEmailError) setAssignEmailError(null)
                                              }}
                                              placeholder="Enter contributor email (e.g. name@m42.ae)"
                                              style={{
                                                flex: 1,
                                                padding: '7px 12px',
                                                borderRadius: 6,
                                                border: assignEmailError ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                                                fontSize: 12.5,
                                                color: '#0d212c',
                                                outline: 'none',
                                              }}
                                            />
                                            <button
                                              type="button"
                                              onClick={() => handleConfirmAssign(finding)}
                                              style={{
                                                padding: '7px 16px',
                                                borderRadius: 6,
                                                background: '#00C4C4',
                                                border: 'none',
                                                color: '#ffffff',
                                                fontSize: 12,
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap',
                                              }}
                                            >
                                              Assign
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setActiveAssignFindingId(null)
                                                setAssignEmail('')
                                                setAssignEmailError(null)
                                              }}
                                              style={{
                                                padding: '7px 12px',
                                                borderRadius: 6,
                                                background: 'transparent',
                                                border: '1px solid #cbd5e1',
                                                color: '#64748b',
                                                fontSize: 12,
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                              }}
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                          {assignEmailError && (
                                            <div style={{ fontSize: 11.5, color: '#ef4444', fontWeight: 500 }}>
                                              {assignEmailError}
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {/* Inline Dismiss Form (Mandatory Reason) */}
                                      {isDismissing && (
                                        <div
                                          style={{
                                            marginTop: 10,
                                            padding: '12px 14px',
                                            background: '#f8fafc',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: 8,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 8,
                                          }}
                                        >
                                          <div style={{ fontSize: 12, fontWeight: 600, color: '#0d212c' }}>
                                            Mandatory dismissal reason:
                                          </div>
                                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                            <input
                                              type="text"
                                              value={dismissReason}
                                              onChange={(e) => {
                                                setDismissReason(e.target.value)
                                                if (dismissReasonError) setDismissReasonError(null)
                                              }}
                                              placeholder="Provide reason for dismissing this AI finding (required)..."
                                              style={{
                                                flex: 1,
                                                padding: '7px 12px',
                                                borderRadius: 6,
                                                border: dismissReasonError ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                                                fontSize: 12.5,
                                                color: '#0d212c',
                                                outline: 'none',
                                              }}
                                            />
                                            <button
                                              type="button"
                                              onClick={() => handleConfirmDismiss(finding)}
                                              style={{
                                                padding: '7px 16px',
                                                borderRadius: 6,
                                                background: '#475569',
                                                border: 'none',
                                                color: '#ffffff',
                                                fontSize: 12,
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap',
                                              }}
                                            >
                                              Confirm Dismiss
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setActiveDismissFindingId(null)
                                                setDismissReason('')
                                                setDismissReasonError(null)
                                              }}
                                              style={{
                                                padding: '7px 12px',
                                                borderRadius: 6,
                                                background: 'transparent',
                                                border: '1px solid #cbd5e1',
                                                color: '#64748b',
                                                fontSize: 12,
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                              }}
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                          {dismissReasonError && (
                                            <div style={{ fontSize: 11.5, color: '#ef4444', fontWeight: 500 }}>
                                              {dismissReasonError}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

function SOWDraftTab({
  isContributor = false,
  isReviewer = false,
  viewerRole,
  onSendForReview,
  onOpenParticipantsModal,
  isReadOnly = false,
  isDraftGenerating = false,
  sowDeadline = '2026-10-31',
}: {
  isContributor?: boolean
  isReviewer?: boolean
  viewerRole?: 'pmo' | 'contributor' | 'reviewer' | 'admin' | 'client'
  onSendForReview?: () => void
  onOpenParticipantsModal?: () => void
  isReadOnly?: boolean
  isDraftGenerating?: boolean
  sowDeadline?: string
}) {
  // ── State ───────────────────────────────────────────────────────────────────
  const { showToast } = useToast()
  const isPMO = viewerRole === 'pmo' || (!isContributor && !isReviewer && viewerRole !== 'admin' && viewerRole !== 'client')
  const isAdmin = viewerRole === 'admin'
  const isClient = viewerRole === 'client'

  const [activeSectionIdx, setActiveSectionIdx] = useState(0)
  const [hasUnsaved, setHasUnsaved] = useState(false)
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({})
  const [activeHighlight, setActiveHighlight] = useState<'none' | 'ai' | 'questions' | 'reviewed'>('none')
  const [draftCitationTarget, setDraftCitationTarget] = useState<ContextCitationTarget | null>(null)
  const [draftTraceTarget, setDraftTraceTarget] = useState<{ sectionTitle: string; sectionIdx: number } | null>(null)
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
  const [sectionDeadlines, setSectionDeadlines] = useState<Record<number, string>>(() => ({
    1: '2026-09-25',
    3: '2026-09-30',
  }))
  const [dragTocIdx, setDragTocIdx] = useState<number | null>(null)
  const [dragOverTocIdx, setDragOverTocIdx] = useState<number | null>(null)
  const [showDraftSectionInfoTooltip, setShowDraftSectionInfoTooltip] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)

  // ── Inline document comments ────────────────────────────────────────────────
  type CommentReply = { id: string; author: string; text: string; timestamp: string }
  type DocComment = {
    id: string
    sectionTitle: string
    anchorText: string
    text: string
    assignee: string
    taggedEmails?: string[]
    author: string
    timestamp: string
    resolved: boolean
    replies: CommentReply[]
  }
  const docCardRef = useRef<HTMLDivElement>(null)
  const [hoverBlock, setHoverBlock] = useState<{
    top: number
    text: string
    sectionTitle: string
  } | null>(null)
  const hoverHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cancelHoverHide = () => {
    if (hoverHideTimer.current) {
      clearTimeout(hoverHideTimer.current)
      hoverHideTimer.current = null
    }
  }
  const scheduleHoverHide = () => {
    cancelHoverHide()
    hoverHideTimer.current = setTimeout(() => setHoverBlock(null), 350)
  }
  const [commentPopup, setCommentPopup] = useState<{
    top: number
    anchorText: string
    sectionTitle: string
  } | null>(null)
  const [newCommentText, setNewCommentText] = useState('')
  const [newCommentAssignee, setNewCommentAssignee] = useState('')
  const [newCommentTaggedEmails, setNewCommentTaggedEmails] = useState<string[]>([])
  const [emailInput, setEmailInput] = useState('')
  const [emailInputError, setEmailInputError] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingCommentText, setEditingCommentText] = useState('')
  const [editingCommentEmails, setEditingCommentEmails] = useState<string[]>([])
  const [editEmailInput, setEditEmailInput] = useState('')
  const [editEmailError, setEditEmailError] = useState(false)
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null)
  const [editingReplyText, setEditingReplyText] = useState('')
  const [showCommentsPanel, setShowCommentsPanel] = useState(true)
  const [drawerTab, setDrawerTab] = useState<'comments' | 'history'>('comments')
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})
  const [showFab, setShowFab] = useState(true)
  const lastScrollTop = useRef(0)

  useEffect(() => {
    const el = scrollAreaRef.current
    if (!el) return
    const handleScroll = () => {
      const currentScrollTop = el.scrollTop
      const diff = currentScrollTop - lastScrollTop.current
      if (diff > 8 && currentScrollTop > 40) {
        setShowFab(false)
      } else if (diff < -4) {
        setShowFab(true)
      }
      lastScrollTop.current = currentScrollTop
    }
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [])

  const renderCommentTextWithMentions = (text: string) => {
    const parts = text.split(/(@?[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g)
    return parts.map((part, idx) => {
      if (/^@?[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(part)) {
        return (
          <span key={idx} style={{ color: '#2563eb', fontWeight: 600 }}>
            {part}
          </span>
        )
      }
      return part
    })
  }

  const handleDocCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    const citationEl = target.closest('.sow-draft-citation-btn, .sow-inline-citation') as HTMLElement | null
    if (citationEl) {
      e.preventDefault()
      e.stopPropagation()
      const fileName = citationEl.getAttribute('data-doc') || 'Scope_Requirements_RFP.pdf'
      const page = parseInt(citationEl.getAttribute('data-page') || '1', 10)
      const section = citationEl.getAttribute('data-section') || 'Section'
      setDraftCitationTarget({
        title: section,
        sourceDoc: fileName,
        page,
        section,
        highlightSnippet: `Validated RFP citation extracted for "${section}" from ${fileName} (Page ${page}).`
      })
      return
    }

    const traceEl = target.closest('.sow-draft-trace-btn') as HTMLElement | null
    if (traceEl) {
      e.preventDefault()
      e.stopPropagation()
      const sectionTitle = traceEl.getAttribute('data-section') || 'Section'
      const sectionIdx = parseInt(traceEl.getAttribute('data-secidx') || '0', 10)
      setDraftTraceTarget({ sectionTitle, sectionIdx })
      return
    }
  }

  // Version History state
  const [draftVersions, setDraftVersions] = useState([
    {
      id: 'v1.2',
      name: 'v1.2',
      isCurrent: true,
      timestamp: 'Today, 18:20',
      author: 'Ashika Jain (PMO)',
      summary: 'Updated Phase 1 timeline, deliverable descriptions & SLA terms',
      changesCount: 6,
    },
    {
      id: 'v1.1',
      name: 'v1.1',
      isCurrent: false,
      timestamp: 'Today, 14:45',
      author: 'Ishita (Reviewer)',
      summary: 'Added compliance feedback and security attachment references',
      changesCount: 12,
    },
    {
      id: 'v1.0',
      name: 'v1.0',
      isCurrent: false,
      timestamp: 'Yesterday, 17:30',
      author: 'Narendra (Contributor)',
      summary: 'Completed section 3 input responses for deliverables and scope',
      changesCount: 18,
    },
    {
      id: 'v0.9',
      name: 'v0.9',
      isCurrent: false,
      timestamp: '2 days ago, 11:00',
      author: 'Intake AI Agent',
      summary: 'Automated initial draft generated from uploaded RFP and MSA docs',
      changesCount: 45,
    },
  ])

  // PMO Approval state
  const [isPMOApproved, setIsPMOApproved] = useState(false)
  const [showApproveConfirmModal, setShowApproveConfirmModal] = useState(false)

  // Send for approval popup (Reviewer / Contributor / Client)
  const [showSendForApprovalPopup, setShowSendForApprovalPopup] = useState(false)

  // AI Review modal state (PMO & Reviewer)
  const [showAIReviewModal, setShowAIReviewModal] = useState(false)
  const [hasRunAICheck, setHasRunAICheck] = useState(false)

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  const handleAddEmail = (email: string, isEdit = false) => {
    const trimmed = email.trim()
    if (!trimmed) return
    if (!isValidEmail(trimmed)) {
      if (isEdit) setEditEmailError(true)
      else setEmailInputError(true)
      return
    }
    if (isEdit) {
      if (!editingCommentEmails.includes(trimmed)) {
        setEditingCommentEmails([...editingCommentEmails, trimmed])
      }
      setEditEmailInput('')
      setEditEmailError(false)
    } else {
      if (!newCommentTaggedEmails.includes(trimmed)) {
        setNewCommentTaggedEmails([...newCommentTaggedEmails, trimmed])
      }
      setEmailInput('')
      setEmailInputError(false)
    }
  }

  const handleRemoveEmail = (emailToRemove: string, isEdit = false) => {
    if (isEdit) {
      setEditingCommentEmails(editingCommentEmails.filter((e) => e !== emailToRemove))
    } else {
      setNewCommentTaggedEmails(newCommentTaggedEmails.filter((e) => e !== emailToRemove))
    }
  }

  const [comments, setComments] = useState<DocComment[]>([
    {
      id: 'c1',
      sectionTitle: 'Background',
      anchorText: 'The client currently operates a fragmented technology landscape',
      text: 'Can we cite the specific legacy systems named in the RFP here instead of speaking generally?',
      assignee: 'Rohan Mehta',
      taggedEmails: ['rohan.mehta@acme.corp'],
      author: 'Ashika Jain',
      timestamp: '2 hours ago',
      resolved: false,
      replies: [
        {
          id: 'c1r1',
          author: 'Rohan Mehta',
          text: 'Good catch — I’ll pull the system names from Appendix A and update this paragraph.',
          timestamp: '1 hour ago',
        },
      ],
    },
    {
      id: 'c2',
      sectionTitle: 'Executive Summary',
      anchorText: 'This is auto-generated content for the section',
      text: 'This placeholder line needs to be replaced before we send this out — flagging for final pass.',
      assignee: 'Priya Sharma',
      taggedEmails: ['priya.sharma@acme.corp'],
      author: 'Ashika Jain',
      timestamp: 'Yesterday',
      resolved: true,
      replies: [],
    },
  ])

  const addComment = () => {
    if (!commentPopup || !newCommentText.trim()) return
    setShowCommentsPanel(true)
    setComments((prev) => [
      ...prev,
      {
        id: `c${Date.now()}`,
        sectionTitle: commentPopup.sectionTitle,
        anchorText: commentPopup.anchorText,
        text: newCommentText.trim(),
        assignee: isContributor || isReviewer ? 'Ashika Jain (PMO)' : (newCommentAssignee || 'Unassigned'),
        taggedEmails: newCommentTaggedEmails,
        author: isReviewer ? 'Ishita (Reviewer)' : isContributor ? 'Narendra (Contributor)' : 'Ashika Jain',
        timestamp: 'Just now',
        resolved: false,
        replies: [],
      },
    ])
    setCommentPopup(null)
    setHoverBlock(null)
    setNewCommentText('')
    setNewCommentAssignee('')
    setNewCommentTaggedEmails([])
    setEmailInput('')
    setEmailInputError(false)
  }

  const startEditComment = (c: DocComment) => {
    setEditingCommentId(c.id)
    setEditingCommentText(c.text)
    setEditingCommentEmails(c.taggedEmails || [])
    setEditEmailInput('')
    setEditEmailError(false)
  }

  const saveEditComment = (commentId: string) => {
    if (!editingCommentText.trim()) return
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              text: editingCommentText.trim(),
              taggedEmails: editingCommentEmails,
            }
          : c
      )
    )
    setEditingCommentId(null)
    setEditingCommentText('')
    setEditingCommentEmails([])
  }

  const deleteComment = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId))
    showToast('Comment deleted.', 'info')
  }

  const addReply = (commentId: string) => {
    const text = (replyDrafts[commentId] ?? '').trim()
    if (!text) return
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              replies: [
                ...c.replies,
                {
                  id: `${commentId}r${Date.now()}`,
                  author: 'Ashika Jain',
                  text,
                  timestamp: 'Just now',
                },
              ],
            }
          : c
      )
    )
    setReplyDrafts((prev) => ({ ...prev, [commentId]: '' }))
  }

  const startEditReply = (r: { id: string; text: string }) => {
    setEditingReplyId(r.id)
    setEditingReplyText(r.text)
  }

  const saveEditReply = (commentId: string, replyId: string) => {
    if (!editingReplyText.trim()) return
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              replies: c.replies.map((r) =>
                r.id === replyId ? { ...r, text: editingReplyText.trim() } : r
              ),
            }
          : c
      )
    )
    setEditingReplyId(null)
    setEditingReplyText('')
    showToast('Reply updated successfully!', 'success')
  }

  const deleteReply = (commentId: string, replyId: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              replies: c.replies.filter((r) => r.id !== replyId),
            }
          : c
      )
    )
    showToast('Reply deleted.', 'info')
  }

  const toggleResolved = (commentId: string) =>
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, resolved: !c.resolved } : c))
    )

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

  // ── Generate document HTML with Provenance & Citations ─────────────────────
  const generateHtml = (items: TocItem[]) =>
    items
      .map((item, idx) => {
        const pageNum = (idx % 4) + 1
        const citationTag = `<span class="sow-inline-citation" data-doc="${item.fileName}" data-page="${pageNum}" data-section="${item.title}" style="display:inline-flex;align-items:center;gap:6px;margin-left:6px;padding:3.5px 10px;font-size:12px;font-weight:500;color:#475569;background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;cursor:pointer;vertical-align:baseline;transition:all 0.15s ease;" title="Click to preview citation in ${item.fileName}"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>Attachment A: Clinical Safety Case (Page ${pageNum} • Section 5)</span>`
        let body = ''
        switch (item.title) {
          case 'Project Introduction':
            body = `<p class="provenance-block provenance-ai" style="margin-bottom:12px;line-height:1.7;color:#374151;">This is auto-generated detailed content for the <strong>Project Introduction</strong> section based on the extracted requirements from your RFP document. ${citationTag} Our AI analysis indicates that this section aligns with industry standards. Please review and modify as needed to ensure it meets your exact specifications.</p>
          <p class="provenance-block provenance-question" style="margin-bottom:12px;line-height:1.7;color:#374151;">The proposed engagement covers a comprehensive digital transformation initiative designed to modernize existing technology infrastructure, improve operational efficiency, and create a scalable foundation for future business growth. The delivery team will collaborate closely with all relevant stakeholders to validate requirements and confirm assumptions throughout the engagement lifecycle.</p>`
            break
          case 'Project Scope':
            body = `<p class="provenance-block provenance-ai" style="margin-bottom:12px;line-height:1.7;color:#374151;">The scope of work is explicitly bounded to the backend infrastructure migration, API Gateway deployment, and database modernization. ${citationTag} Clear demarcation of boundaries ensures that the project delivery remains strictly on schedule and within the agreed budget constraints.</p>
          <div class="provenance-block provenance-question" style="margin-bottom:14px;">
            <p style="margin-bottom:8px;line-height:1.7;color:#374151;"><strong>In-Scope Activities:</strong></p>
            <ul style="margin-bottom:16px;padding-left:24px;line-height:1.7;color:#374151;">
              <li>Migration of 5 core relational databases (MySQL/PostgreSQL) to a fully managed cloud SQL environment featuring automated daily snapshots and point-in-time recovery.</li>
              <li>Design and implementation of an enterprise-grade API Gateway featuring advanced rate limiting, robust JWT-based authentication, and granular analytics tracking.</li>
              <li>Containerization of 12 legacy backend services into optimized, scalable Docker images.</li>
              <li>Deployment of a comprehensive observability stack (monitoring, logging, and alerting) using industry-standard tools like Prometheus, Grafana, and ELK.</li>
            </ul>
          </div>
          <div class="provenance-block provenance-reviewed" style="margin-bottom:12px;">
            <p style="margin-bottom:8px;line-height:1.7;color:#374151;"><strong>Out of Scope (Confirmed during review):</strong></p>
            <ul style="margin-bottom:12px;padding-left:24px;line-height:1.7;color:#374151;">
              <li>Frontend application redesign or UI/UX modifications.</li>
              <li>Native mobile application development.</li>
              <li>Integration with third-party legacy ERP/CRM systems not listed in the initial RFP.</li>
            </ul>
          </div>`
            break
          case 'Business Requirements':
            body = `<p class="provenance-block provenance-ai" style="margin-bottom:12px;line-height:1.7;color:#374151;">The following business requirements have been extracted and validated from the submitted RFP documentation. ${citationTag} These requirements form the foundation of the proposed solution architecture and delivery approach.</p>
          <div class="provenance-block provenance-question" style="margin-bottom:14px;">
            <ul style="margin-bottom:16px;padding-left:24px;line-height:1.7;color:#374151;">
              <li><strong>Cost Optimization:</strong> Reduce operational expenditure by approximately 30% through dynamic cloud scaling and resource right-sizing.</li>
              <li><strong>High Availability:</strong> Achieve 99.99% uptime SLA by implementing cross-region failover and automated disaster recovery.</li>
              <li><strong>Security Posture:</strong> Achieve SOC2 and ISO 27001 compliance for the new infrastructure layer.</li>
              <li><strong>Developer Velocity:</strong> Establish zero-touch CI/CD pipelines for continuous integration and seamless deployments.</li>
            </ul>
          </div>`
            break
          case 'Solution Approach':
            body = `<p class="provenance-block provenance-ai" style="margin-bottom:12px;line-height:1.7;color:#374151;">The proposed solution architecture is designed around a highly decoupled, event-driven microservices pattern hosted on a managed Kubernetes environment. ${citationTag} This design prioritizes fault tolerance, horizontal scalability, and strict security compliance.</p>
          <div class="provenance-block provenance-question" style="margin-bottom:14px;">
            <ul style="margin-bottom:16px;padding-left:24px;line-height:1.7;color:#374151;">
              <li><strong>Edge &amp; Ingress Layer:</strong> A highly available Cloud Load Balancer integrated with a Web Application Firewall (WAF) to defend against DDoS attacks.</li>
              <li><strong>Compute Layer:</strong> Auto-scaling Kubernetes clusters spanning multiple availability zones.</li>
              <li><strong>Data &amp; Caching Layer:</strong> Managed PostgreSQL database cluster with read-replicas and a distributed Redis caching layer.</li>
              <li><strong>Event Streaming:</strong> Apache Kafka for asynchronous communication between microservices.</li>
            </ul>
          </div>`
            break
          case 'Deliverables':
            body = `<p class="provenance-block provenance-question" style="margin-bottom:12px;line-height:1.7;color:#374151;">The engagement will yield a series of concrete, verifiable deliverables across the project lifecycle. Acceptance of these deliverables will trigger subsequent project phases and associated commercial milestones.</p>
          <div class="provenance-block provenance-reviewed" style="margin-bottom:16px;">
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
            </table>
          </div>`
            break
          case 'Roles & Responsibilities':
            body = `<p class="provenance-block provenance-ai" style="margin-bottom:12px;line-height:1.7;color:#374151;">The following table outlines the roles and responsibilities of both the delivery team and the client organization throughout the project lifecycle. ${citationTag}</p>
          <div class="provenance-block provenance-reviewed" style="margin-bottom:16px;">
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
            </table>
          </div>`
            break
          case 'Commercial Terms':
          case 'Commercials':
            body = `<p class="provenance-block provenance-ai" style="margin-bottom:12px;line-height:1.7;color:#374151;">The total estimated cost for this project is based on a Time &amp; Materials (T&amp;M) model with a capped maximum budget of <strong>$145,000 USD</strong>. ${citationTag} This covers all engineering, project management, and specialized architectural consulting hours required over the 12-week period.</p>
          <div class="provenance-block provenance-reviewed" style="margin-bottom:14px;">
            <ul style="margin-bottom:16px;padding-left:24px;line-height:1.7;color:#374151;">
              <li><strong>Milestone 1 (20% - $29,000):</strong> Project kickoff and formal SOW signing.</li>
              <li><strong>Milestone 2 (30% - $43,500):</strong> Delivery and approval of the Architecture Design Document.</li>
              <li><strong>Milestone 3 (30% - $43,500):</strong> Successful completion of User Acceptance Testing.</li>
              <li><strong>Milestone 4 (20% - $29,000):</strong> Final go-live and knowledge transfer completion.</li>
            </ul>
          </div>`
            break
          case 'Risks & Mitigations':
            body = `<p class="provenance-block provenance-question" style="margin-bottom:12px;line-height:1.7;color:#374151;">To accurately scope this engagement, several assumptions have been made. Deviation from these assumptions may result in changes to the project timeline or budget, subject to the formal Change Request process.</p>
          <div class="provenance-block provenance-reviewed" style="margin-bottom:14px;">
            <ul style="margin-bottom:16px;padding-left:24px;line-height:1.7;color:#374151;">
              <li><strong>Assumption 1:</strong> Client SMEs will be available for a minimum of 4 hours per week to clarify business logic and validate migration strategies.</li>
              <li><strong>Assumption 2:</strong> The existing legacy source code is fully accessible and accurately documented.</li>
              <li><strong>Risk:</strong> Delays in UAT sign-off by client stakeholders may push the final go-live date. <strong>Mitigation:</strong> Weekly status reports and early, frequent testing cycles will be employed to ensure alignment.</li>
            </ul>
          </div>`
            break
          case 'Background':
            body = `<p class="provenance-block provenance-ai" style="margin-bottom:12px;line-height:1.7;color:#374151;">This Statement of Work has been prepared in response to the Request for Proposal (RFP) issued by the client organization. ${citationTag} The engagement is aimed at addressing key technology modernization objectives identified through discovery workshops.</p>
          <p class="provenance-block provenance-question" style="margin-bottom:12px;line-height:1.7;color:#374151;">The client currently operates a fragmented technology landscape with multiple legacy systems that present challenges around scalability, data integrity, and operational efficiency. This engagement proposes a structured, phased approach to address these gaps while minimizing disruption to business-as-usual operations.</p>`
            break
          case 'Objectives':
            body = `<p class="provenance-block provenance-ai" style="margin-bottom:12px;line-height:1.7;color:#374151;">The primary objectives of this engagement are structured to address the core business challenges identified during the discovery phase. ${citationTag} By executing on these objectives, the delivery team aims to deliver measurable improvements in performance, scalability, and cost efficiency.</p>
          <div class="provenance-block provenance-question" style="margin-bottom:14px;">
            <ul style="margin-bottom:16px;padding-left:24px;line-height:1.7;color:#374151;">
              <li><strong>Cost Optimization:</strong> Reduce operational expenditure by approximately 30% through dynamic cloud scaling and resource right-sizing.</li>
              <li><strong>High Availability &amp; Resilience:</strong> Improve system reliability to achieve a 99.99% uptime SLA by implementing cross-region failover and automated disaster recovery.</li>
              <li><strong>Application Modernization:</strong> Transition current monolithic application structure into a decoupled microservices architecture.</li>
              <li><strong>Operational Agility:</strong> Establish zero-touch CI/CD pipelines for continuous integration and seamless zero-downtime deployments.</li>
            </ul>
          </div>`
            break
          case 'Out of Scope':
            body = `<p class="provenance-block provenance-ai" style="margin-bottom:12px;line-height:1.7;color:#374151;">The following items and activities are explicitly excluded from this Statement of Work. ${citationTag} Any work falling within these categories will require a formal Change Request.</p>
          <div class="provenance-block provenance-reviewed" style="margin-bottom:14px;">
            <ul style="margin-bottom:16px;padding-left:24px;line-height:1.7;color:#374151;">
              <li>Frontend application redesign, web portal enhancements, or any UI/UX modifications.</li>
              <li>Native mobile application development or updates for iOS and Android platforms.</li>
              <li>Integration with third-party legacy ERP/CRM systems not explicitly listed in the initial RFP documentation.</li>
              <li>Data cleansing or manual data remediation prior to database migration.</li>
              <li>Ongoing managed services or post-go-live support beyond the defined hypercare period.</li>
            </ul>
          </div>`
            break
          case 'Requirements':
            body = `<p class="provenance-block provenance-ai" style="margin-bottom:12px;line-height:1.7;color:#374151;">The following functional and non-functional requirements have been extracted and validated from the submitted RFP documentation. ${citationTag} These requirements form the foundation of the proposed solution architecture.</p>
          <div class="provenance-block provenance-question" style="margin-bottom:14px;">
            <ul style="margin-bottom:16px;padding-left:24px;line-height:1.7;color:#374151;">
              <li><strong>FR-01:</strong> The system shall support concurrent access by a minimum of 5,000 active users without performance degradation.</li>
              <li><strong>FR-02:</strong> All data transmissions must be encrypted using TLS 1.3 or higher.</li>
              <li><strong>FR-03:</strong> The platform must provide role-based access control (RBAC) with granular permission management.</li>
              <li><strong>NFR-01:</strong> System response time for standard operations must not exceed 200ms at the 95th percentile.</li>
              <li><strong>NFR-02:</strong> The solution must be deployable across AWS, GCP, and Azure without vendor lock-in dependencies.</li>
            </ul>
          </div>`
            break
          case 'Approach & Methodology':
            body = `<p class="provenance-block provenance-ai" style="margin-bottom:12px;line-height:1.7;color:#374151;">The delivery team will adopt an Agile-first approach, structured around two-week sprint cycles with continuous stakeholder involvement and feedback loops. ${citationTag} This methodology ensures transparency, early risk identification, and rapid course correction when required.</p>
          <div class="provenance-block provenance-question" style="margin-bottom:14px;">
            <ul style="margin-bottom:16px;padding-left:24px;line-height:1.7;color:#374151;">
              <li><strong>Phase 1 — Discovery &amp; Design (Weeks 1–3):</strong> Requirements validation, architecture finalization, and approval of the Architecture Design Document (ADD).</li>
              <li><strong>Phase 2 — Infrastructure Provisioning (Weeks 4–6):</strong> Cloud environment setup, network configuration, and CI/CD pipeline establishment.</li>
              <li><strong>Phase 3 — Development &amp; Migration (Weeks 7–10):</strong> Service containerization, database migration, and integration testing.</li>
              <li><strong>Phase 4 — UAT &amp; Deployment (Weeks 11–14):</strong> User acceptance testing, performance tuning, production deployment, and knowledge transfer.</li>
            </ul>
          </div>`
            break
          case 'Timeline & Milestones':
            body = `<p class="provenance-block provenance-ai" style="margin-bottom:12px;line-height:1.7;color:#374151;">The project is estimated to be completed over a period of 14 weeks, divided into four distinct delivery phases. ${citationTag}</p>
          <div class="provenance-block provenance-reviewed" style="margin-bottom:16px;">
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
            </table>
          </div>`
            break
          case 'Assumptions':
            body = `<p class="provenance-block provenance-ai" style="margin-bottom:12px;line-height:1.7;color:#374151;">To accurately scope this engagement, the following assumptions have been made. ${citationTag} Deviation from any of these may result in changes to the project timeline, cost, or scope, subject to the formal Change Request process.</p>
          <div class="provenance-block provenance-question" style="margin-bottom:14px;">
            <ul style="margin-bottom:16px;padding-left:24px;line-height:1.7;color:#374151;">
              <li>Client subject matter experts (SMEs) will be available for a minimum of 4 hours per week.</li>
              <li>The existing legacy source code is fully accessible and can be compiled without unavailable proprietary dependencies.</li>
              <li>Access credentials for all necessary environments will be provided within 3 business days of project kickoff.</li>
              <li>The client will provide timely feedback on deliverables within the agreed review windows of 5 business days.</li>
              <li>All required third-party software licenses are either already procured or will be made available by the client.</li>
            </ul>
          </div>`
            break
          case 'Security':
            body = `<p class="provenance-block provenance-ai" style="margin-bottom:12px;line-height:1.7;color:#374151;">Security is a first-class concern throughout this engagement. ${citationTag} All solution components will be designed, implemented, and tested in accordance with industry-standard security frameworks.</p>
          <div class="provenance-block provenance-question" style="margin-bottom:14px;">
            <ul style="margin-bottom:16px;padding-left:24px;line-height:1.7;color:#374151;">
              <li><strong>Identity &amp; Access Management:</strong> Role-Based Access Control (RBAC) via Azure AD or Okta integration for Single Sign-On (SSO) across all infrastructure components.</li>
              <li><strong>Data Encryption:</strong> All data at rest encrypted using AES-256; all data in transit encrypted using TLS 1.3.</li>
              <li><strong>Vulnerability Management:</strong> Automated security scanning integrated into the CI/CD pipeline using OWASP ZAP and Snyk.</li>
              <li><strong>Compliance:</strong> Solution architecture designed to meet SOC2 Type II and ISO 27001 certification requirements.</li>
            </ul>
          </div>`
            break
          case 'Architecture':
            body = `<p class="provenance-block provenance-ai" style="margin-bottom:12px;line-height:1.7;color:#374151;">The proposed solution architecture is designed around a highly decoupled, event-driven microservices pattern hosted on a managed Kubernetes environment. ${citationTag} This design prioritizes fault tolerance, horizontal scalability, and strict security compliance.</p>
          <div class="provenance-block provenance-question" style="margin-bottom:14px;">
            <ul style="margin-bottom:16px;padding-left:24px;line-height:1.7;color:#374151;">
              <li><strong>Edge &amp; Ingress Layer:</strong> Cloud Load Balancer with WAF integration, routing through API Gateway for authentication and rate limiting.</li>
              <li><strong>Compute Layer:</strong> Auto-scaling Kubernetes clusters across multiple availability zones with dynamic workload distribution.</li>
              <li><strong>Data Layer:</strong> Managed PostgreSQL with read-replicas and distributed Redis caching for high-throughput read operations.</li>
              <li><strong>Event Streaming:</strong> Apache Kafka for reliable asynchronous communication between microservices.</li>
              <li><strong>Observability:</strong> Prometheus + Grafana for metrics, ELK stack for centralized logging, and PagerDuty for alerting.</li>
            </ul>
          </div>`
            break
          case 'Acceptance Criteria':
            body = `<p class="provenance-block provenance-question" style="margin-bottom:12px;line-height:1.7;color:#374151;">The project will be deemed complete and ready for final sign-off when all of the following acceptance criteria have been demonstrably met in the production environment.</p>
          <div class="provenance-block provenance-reviewed" style="margin-bottom:14px;">
            <ul style="margin-bottom:16px;padding-left:24px;line-height:1.7;color:#374151;">
              <li>All backend services are deployed to the Kubernetes cluster and passing automated health checks.</li>
              <li>The API Gateway is routing traffic correctly, enforcing JWT authentication, and applying configured rate limits.</li>
              <li>The migrated cloud databases are fully synchronized and automated backup routines have been verified.</li>
              <li>Performance tests demonstrate the infrastructure handles 200% of current peak load with sub-200ms API response times.</li>
              <li>The client operations team has formally signed off on handover documentation and runbooks.</li>
            </ul>
          </div>`
            break
          case 'Change Management':
            body = `<p class="provenance-block provenance-ai" style="margin-bottom:12px;line-height:1.7;color:#374151;">Any requests for changes to the agreed scope, timeline, or commercial terms must follow the formal Change Request (CR) process defined below. ${citationTag} Unauthorized scope changes will not be accepted.</p>
          <div class="provenance-block provenance-reviewed" style="margin-bottom:14px;">
            <ul style="margin-bottom:16px;padding-left:24px;line-height:1.7;color:#374151;">
              <li><strong>Step 1:</strong> Client submits a Change Request Form describing the proposed change, business justification, and urgency.</li>
              <li><strong>Step 2:</strong> Delivery team assesses impact on scope, timeline, and cost within 5 business days.</li>
              <li><strong>Step 3:</strong> Impact assessment reviewed and approved by both parties' project sponsors.</li>
              <li><strong>Step 4:</strong> Approved CR formally incorporated into the amended SOW via a signed addendum.</li>
            </ul>
          </div>`
            break
          case 'Support & Handover':
            body = `<p class="provenance-block provenance-ai" style="margin-bottom:12px;line-height:1.7;color:#374151;">Upon successful completion of the project, the delivery team will provide a structured handover to the client's internal operations team. ${citationTag} A defined hypercare period will follow go-live to ensure operational stability and knowledge continuity.</p>
          <div class="provenance-block provenance-question" style="margin-bottom:14px;">
            <ul style="margin-bottom:16px;padding-left:24px;line-height:1.7;color:#374151;">
              <li><strong>Knowledge Transfer Sessions:</strong> Minimum 3 structured sessions covering infrastructure management, deployment procedures, and incident response.</li>
              <li><strong>Documentation Handover:</strong> Complete runbooks, architectural diagrams, API documentation, and disaster recovery playbooks.</li>
              <li><strong>Hypercare Period:</strong> 4 weeks of enhanced support post go-live with priority SLA (P1 — 2hr response, P2 — 8hr response).</li>
              <li><strong>Transition to BAU Support:</strong> Formal transition to client's BAU support model with clear RACI documented.</li>
            </ul>
          </div>`
            break
          default:
            body = `<p class="provenance-block provenance-ai" style="margin-bottom:12px;line-height:1.7;color:#374151;">This is auto-generated content for the <strong>${item.title}</strong> section based on extracted requirements from your RFP document. ${citationTag} Please review and modify as needed to ensure it meets your exact specifications.</p>`
        }
        return `<div id="sow-section-${idx}" class="sow-section" style="margin-bottom:0;">
        <h2 style="font-size:22px;font-weight:700;color:#0d212c;margin-bottom:16px;">${item.title}</h2>
        ${body}
        <div style="margin-top:20px;padding-top:12px;border-top:1px dashed #e2e8f0;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <button type="button" class="sow-draft-citation-btn" data-doc="${item.fileName}" data-page="${pageNum}" data-section="${item.title}" style="display:inline-flex;align-items:center;gap:6px;padding:3.5px 10px;font-size:12px;font-weight:500;color:#475569;background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;cursor:pointer;transition:all 0.15s ease;" title="Click to view citation in ${item.fileName}">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              Attachment A: Clinical Safety Case (Page ${pageNum} • Section 5)
            </button>
          </div>
          <button type="button" class="sow-draft-trace-btn" data-section="${item.title}" data-secidx="${idx}" style="display:inline-flex;align-items:center;gap:4px;background:none;border:none;color:#008b8b;font-size:11.5px;font-weight:600;cursor:pointer;padding:2px 4px;transition:opacity 0.15s ease;">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
            View trace
          </button>
        </div>
      </div>`
      })
      .join('\n<hr style="border:0;border-top:1px solid rgba(0,196,196,0.15);margin:32px 0;" />\n')

  const [contentHtml] = useState(() => generateHtml(tocItems))

  const reorderToc = (from: number, to: number) => {
    setTocItems((prev) => {
      const updated = [...prev]
      const [moved] = updated.splice(from, 1)
      updated.splice(to, 0, moved)
      if (editorRef.current) {
        editorRef.current.innerHTML = generateHtml(updated)
      }
      return updated
    })
    setActiveSectionIdx(to)
  }

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
  const memberIdByName = (name: string) =>
    SECTION_MEMBERS.find((m) => m.name === name)?.id ?? SECTION_MEMBERS[0].id

  // ── Score color ─────────────────────────────────────────────────────────────
  const scoreColor = (s: number) => (s >= 90 ? '#16a34a' : s >= 60 ? '#d97706' : '#ef4444')
  const scoreBg = (s: number) =>
    s >= 90 ? 'rgba(22,163,74,0.1)' : s >= 60 ? 'rgba(217,119,6,0.1)' : 'rgba(239,68,68,0.1)'
  const scoreLabel = (s: number) =>
    s >= 90 ? 'High Confidence' : s >= 60 ? 'Medium Confidence' : 'Low Confidence'

  return (
    <>

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
              <button
                type="button"
                onClick={() => setShowCommentsPanel((v) => !v)}
                style={{
                  flex: 1,
                  background: showCommentsPanel ? 'rgba(0,196,196,0.18)' : 'rgba(0,196,196,0.08)',
                  border: showCommentsPanel
                    ? '1px solid rgba(0,196,196,0.4)'
                    : '1px solid transparent',
                  borderRadius: 6,
                  padding: '6px 10px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 700, color: '#00C4C4', lineHeight: 1 }}>
                  {comments.length}
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
              </button>
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
                  {comments.filter((c) => !c.resolved).length}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                <button
                  type="button"
                  onMouseEnter={() => setShowDraftSectionInfoTooltip(true)}
                  onMouseLeave={() => setShowDraftSectionInfoTooltip(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'help',
                    color: '#64748b',
                  }}
                >
                  <Info size={14} color="#64748b" />
                </button>
                {showDraftSectionInfoTooltip && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      left: 0,
                      zIndex: 9999,
                      background: '#0d212c',
                      color: '#ffffff',
                      fontSize: 11,
                      fontWeight: 500,
                      padding: '6px 10px',
                      borderRadius: 6,
                      width: 210,
                      whiteSpace: 'normal',
                      lineHeight: 1.35,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
                      pointerEvents: 'none',
                    }}
                  >
                    You can drag and drop sections to reposition them
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
            {tocItems.map((item, idx) => {
              const isActive = activeSectionIdx === idx
              const isApproved = item.status === 'Approved'
              const isRejected = item.status === 'Rejected'
              const hasReviewer = item.reviewers.length > 0
              const isDragOver = dragOverTocIdx === idx && dragTocIdx !== idx
              const isDragging = dragTocIdx === idx
              const secDeadline = sectionDeadlines[idx] || sowDeadline || '2026-10-31'
              const isOverdue = secDeadline && new Date(secDeadline) < new Date(new Date().toDateString())
              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredTocIdx(idx)}
                  onMouseLeave={() => setHoveredTocIdx(null)}
                  draggable={!isContributor && !isReviewer}
                  onDragStart={() => setDragTocIdx(idx)}
                  onDragEnd={() => {
                    setDragTocIdx(null)
                    setDragOverTocIdx(null)
                  }}
                  onDragOver={(e) => {
                    e.preventDefault()
                    if (idx !== dragTocIdx) setDragOverTocIdx(idx)
                  }}
                  onDrop={() => {
                    if (dragTocIdx === null || dragTocIdx === idx) return
                    reorderToc(dragTocIdx, idx)
                    setDragTocIdx(null)
                    setDragOverTocIdx(null)
                  }}
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
                    position: 'relative',
                    marginBottom: 6,
                    opacity: isDragging ? 0.4 : 1,
                    transition: 'opacity 0.15s',
                  }}
                >
                  {isDragOver && (
                    <div style={{ height: 2, background: '#00C4C4', borderRadius: 2, marginBottom: 2 }} />
                  )}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: 6,
                      border: isDragOver ? '1.5px solid rgba(0,196,196,0.5)' : 'none',
                      cursor: 'pointer',
                      background: isActive ? 'rgba(0,196,196,0.1)' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                  >
                    {/* Left: drag handle (PMO) + title + overdue badge */}
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}
                    >
                      {/* Drag handle — PMO only, only appears on hover */}
                      {!isContributor && !isReviewer && hoveredTocIdx === idx && (
                        <svg
                          width="10" height="14" viewBox="0 0 10 14" fill="none"
                          style={{ flexShrink: 0, opacity: 0.6, cursor: 'grab', transition: 'opacity 0.15s' }}
                        >
                          <circle cx="3" cy="2" r="1.3" fill="#64748b" />
                          <circle cx="7" cy="2" r="1.3" fill="#64748b" />
                          <circle cx="3" cy="7" r="1.3" fill="#64748b" />
                          <circle cx="7" cy="7" r="1.3" fill="#64748b" />
                          <circle cx="3" cy="12" r="1.3" fill="#64748b" />
                          <circle cx="7" cy="12" r="1.3" fill="#64748b" />
                        </svg>
                      )}
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
                      {isOverdue && (
                        <span style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: '#ef4444',
                          background: 'rgba(239,68,68,0.1)',
                          padding: '1px 5px',
                          borderRadius: 4,
                          flexShrink: 0,
                          whiteSpace: 'nowrap',
                        }}>Overdue</span>
                      )}
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

                      </>
                    )}

                    {/* ⋯ menu */}
                    {!isContributor && !isReviewer && (hoveredTocIdx === idx || openMenuIdx === idx) && (
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
                                top: idx >= tocItems.length - 3 ? 'auto' : 'calc(100% + 4px)',
                                bottom: idx >= tocItems.length - 3 ? 'calc(100% + 4px)' : 'auto',
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
                              <div style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>Section Deadline</span>
                                <input
                                  type="date"
                                  min={new Date().toISOString().split('T')[0]}
                                  max={sowDeadline || '2026-10-31'}
                                  value={secDeadline}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    if (val && sowDeadline && val > sowDeadline) return
                                    setSectionDeadlines((prev) => ({ ...prev, [idx]: val }))
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  style={{
                                    width: '100%',
                                    padding: '4px 8px',
                                    fontSize: 12,
                                    borderRadius: 6,
                                    border: '1px solid #cbd5e1',
                                    outline: 'none',
                                  }}
                                />
                              </div>
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
                                    (e.currentTarget.style.background = '#f8fafc')
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.background = 'transparent')
                                  }
                                >
                                  <Users size={16} color="#00a0a0" />
                                  Assign Contributors
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
                                    (e.currentTarget.style.background = '#f8fafc')
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
          {isContributor || isReviewer ? (
            <div
              style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 20px',
                borderBottom: '1px solid rgba(0,196,196,0.12)',
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(6px)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0d212c' }}>
                  SOW Draft {isReviewer ? 'Review' : ''}
                </span>
                <span style={{ fontSize: 12, color: '#64748b' }}>
                  • You can add comments to the draft for PMO review
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => onOpenParticipantsModal?.()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 10px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'transparent',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#007a7a',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.color = '#0d212c'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.color = '#007a7a'
                  }}
                  title="Reviewer & Participants"
                >
                  Reviewer &amp; Participants
                </button>
                {/* AI Review & Summary for Reviewer */}
                {isReviewer && (
                  <button
                    type="button"
                    onClick={() => setShowAIReviewModal(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 14px',
                      borderRadius: 8,
                      border: 'none',
                      background: '#00C4C4',
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#ffffff',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 2px 8px rgba(0,196,196,0.3)',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLButtonElement).style.background = '#00a8a8'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLButtonElement).style.background = '#00C4C4'
                    }}
                    title="AI Document Review & Verdict"
                  >
                    <Sparkles size={13} color="#ffffff" />
                    {hasRunAICheck ? 'Rerun AI Check' : 'AI Review & Summary'}
                  </button>
                )}
              </div>
            </div>
          ) : (
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
            {/* Reviewer & Participants button with icon, no hover animation */}
            <button
              type="button"
              onClick={() => onOpenParticipantsModal?.()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 10px',
                borderRadius: 6,
                border: 'none',
                background: 'transparent',
                color: '#007a7a',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                marginRight: 8,
              }}
              title="Reviewer & Participants"
            >
              <Users size={14} color="#00a0a0" />
              Reviewer &amp; Participants
            </button>

            {/* Export SOW Dropdown button in place of Approve button */}
            <div style={{ position: 'relative', marginRight: 8 }}>
              <button
                type="button"
                onClick={() => setShowExportMenu((prev) => !prev)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 14px',
                  borderRadius: 6,
                  border: 'none',
                  background: '#00C4C4',
                  color: '#ffffff',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 8px rgba(0,196,196,0.3)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.background = '#00a8a8'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.background = '#00C4C4'
                }}
                title="Export SOW"
              >
                <Download size={13} color="#ffffff" />
                Export SOW
                <ChevronDown size={12} color="#ffffff" />
              </button>
              {showExportMenu && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                    onClick={() => setShowExportMenu(false)}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      right: 0,
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      zIndex: 100,
                      minWidth: 190,
                      overflow: 'hidden',
                      padding: '4px 0',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setShowExportMenu(false)
                        showToast('Exporting SOW as PDF...', 'info')
                        setTimeout(() => showToast('SOW exported as PDF successfully!', 'success'), 1200)
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 14px',
                        background: 'transparent',
                        border: 'none',
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#0f172a',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <FileText size={14} color="#ef4444" />
                      Export as PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowExportMenu(false)
                        showToast('Exporting SOW as Word...', 'info')
                        setTimeout(() => showToast('SOW exported as Word document successfully!', 'success'), 1200)
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 14px',
                        background: 'transparent',
                        border: 'none',
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#0f172a',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <FileText size={14} color="#2563eb" />
                      Export as Word (.docx)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowExportMenu(false)
                        showToast('Exporting SOW as Markdown...', 'info')
                        setTimeout(() => showToast('SOW exported as Markdown successfully!', 'success'), 1200)
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 14px',
                        background: 'transparent',
                        border: 'none',
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#0f172a',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <FileText size={14} color="#64748b" />
                      Export as Markdown (.md)
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          )}

          {/* Provenance Highlighting Toolbar (AI 42%, Questions 35%, Review 23%) */}
          <div
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '7px 20px',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  marginRight: 4,
                }}
              >
                <Sparkles size={13} color="#00C4C4" />
                Provenance:
              </span>

              {/* Button 1: AI generated content */}
              <button
                type="button"
                onClick={() => setActiveHighlight((prev) => (prev === 'ai' ? 'none' : 'ai'))}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  border: activeHighlight === 'ai' ? '1.5px solid #0284c7' : '1px solid #bae6fd',
                  background:
                    activeHighlight === 'ai'
                      ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                      : '#f0f9ff',
                  color: activeHighlight === 'ai' ? '#ffffff' : '#0369a1',
                  boxShadow: activeHighlight === 'ai' ? '0 2px 8px rgba(2,132,199,0.28)' : 'none',
                }}
                title="Highlight AI Generated Content"
              >
                <span>AI generated content</span>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 10,
                    background: activeHighlight === 'ai' ? 'rgba(255,255,255,0.25)' : '#e0f2fe',
                    color: activeHighlight === 'ai' ? '#ffffff' : '#0284c7',
                  }}
                >
                  42%
                </span>
              </button>

              {/* Button 2: Directly from the questions */}
              <button
                type="button"
                onClick={() => setActiveHighlight((prev) => (prev === 'questions' ? 'none' : 'questions'))}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  border: activeHighlight === 'questions' ? '1.5px solid #6366f1' : '1px solid #c7d2fe',
                  background:
                    activeHighlight === 'questions'
                      ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                      : '#eef2ff',
                  color: activeHighlight === 'questions' ? '#ffffff' : '#4338ca',
                  boxShadow: activeHighlight === 'questions' ? '0 2px 8px rgba(99,102,241,0.28)' : 'none',
                }}
                title="Highlight content directly derived from questions and assumptions"
              >
                <span>Directly from the questions</span>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 10,
                    background: activeHighlight === 'questions' ? 'rgba(255,255,255,0.25)' : '#e0e7ff',
                    color: activeHighlight === 'questions' ? '#ffffff' : '#4338ca',
                  }}
                >
                  35%
                </span>
              </button>

              {/* Button 3: Content getting edited during the review */}
              <button
                type="button"
                onClick={() => setActiveHighlight((prev) => (prev === 'reviewed' ? 'none' : 'reviewed'))}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  border: activeHighlight === 'reviewed' ? '1.5px solid #d97706' : '1px solid #fde68a',
                  background:
                    activeHighlight === 'reviewed'
                      ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                      : '#fffbeb',
                  color: activeHighlight === 'reviewed' ? '#ffffff' : '#b45309',
                  boxShadow: activeHighlight === 'reviewed' ? '0 2px 8px rgba(217,119,6,0.28)' : 'none',
                }}
                title="Highlight content edited during review cycles"
              >
                <span>Content getting edited during the review</span>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 10,
                    background: activeHighlight === 'reviewed' ? 'rgba(255,255,255,0.25)' : '#fef3c7',
                    color: activeHighlight === 'reviewed' ? '#ffffff' : '#b45309',
                  }}
                >
                  23%
                </span>
              </button>

              {/* Clear highlight button */}
              {activeHighlight !== 'none' && (
                <button
                  type="button"
                  onClick={() => setActiveHighlight('none')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '3px 8px',
                    borderRadius: 16,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#64748b',
                  }}
                  title="Clear highlight"
                >
                  <X size={12} />
                  Clear
                </button>
              )}
            </div>

            {activeHighlight !== 'none' && (
              <div
                style={{
                  fontSize: 11.5,
                  color:
                    activeHighlight === 'ai'
                      ? '#0369a1'
                      : activeHighlight === 'questions'
                      ? '#4338ca'
                      : '#b45309',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background:
                      activeHighlight === 'ai'
                        ? '#0284c7'
                        : activeHighlight === 'questions'
                        ? '#6366f1'
                        : '#d97706',
                  }}
                />
                Highlighting{' '}
                {activeHighlight === 'ai'
                  ? 'AI generated content (42%)'
                  : activeHighlight === 'questions'
                  ? 'direct question & assumption sources (35%)'
                  : 'content edited during review (23%)'}{' '}
                — all document text remains visible
              </div>
            )}

            {/* PMO Approve SOW / Withdraw Approval on right side */}
            {isPMO && (
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                {!isPMOApproved ? (
                  <button
                    type="button"
                    disabled={isReadOnly}
                    onClick={() => setShowApproveConfirmModal(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '5px 14px',
                      borderRadius: 6,
                      border: 'none',
                      background: isReadOnly ? '#94a3b8' : '#16a34a',
                      color: '#ffffff',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: isReadOnly ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap',
                      boxShadow: isReadOnly ? 'none' : '0 2px 8px rgba(22,163,74,0.3)',
                    }}
                  >
                    <Check size={13} strokeWidth={3} />
                    Approve SOW
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isReadOnly}
                    onClick={() => {
                      if (isReadOnly) return
                      setIsPMOApproved(false)
                      showToast('SOW approval withdrawn. Editing is unlocked.', 'info')
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '5px 14px',
                      borderRadius: 6,
                      border: '1.5px solid #f59e0b',
                      background: 'rgba(245,158,11,0.1)',
                      color: '#b45309',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: isReadOnly ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                    title="Click to withdraw PMO approval"
                  >
                    <RotateCcw size={13} />
                    Withdraw Approval
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Scroll area & Comments Panel Container (Below Header / Toolbar) */}
          <div style={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden', position: 'relative' }}>
            {/* Scroll area */}
            <div
              ref={scrollAreaRef}
              id="sow-editor-scroll-area"
              className={`sow-editor-scroll-area highlight-mode-${activeHighlight}`}
              style={{
                flex: 1,
                overflowY: 'auto',
                background: '#f1f5f9',
                padding: '28px 20px 64px',
                position: 'relative',
              }}
            >
              <style>{`
                .sow-draft-citation-btn:hover, .sow-inline-citation:hover {
                  background: #f1f5f9 !important;
                  border-color: #94a3b8 !important;
                  color: #1e293b !important;
                  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
                }
                .sow-draft-trace-btn:hover {
                  background: #f1f5f9 !important;
                  border-color: #94a3b8 !important;
                }
                /* Provenance Highlight Mode: AI (42%) */
                .highlight-mode-ai .provenance-ai {
                  background: rgba(2, 132, 199, 0.08) !important;
                  border-left: 4px solid #0284c7 !important;
                  padding-left: 14px !important;
                  border-radius: 0 6px 6px 0 !important;
                  box-shadow: 0 1px 4px rgba(2, 132, 199, 0.12) !important;
                  transition: all 0.2s ease !important;
                }
                .highlight-mode-ai .provenance-ai::before {
                  content: '⚡ AI Generated Content (42%)';
                  display: block;
                  font-size: 10px;
                  font-weight: 700;
                  color: #0284c7;
                  letter-spacing: 0.04em;
                  margin-bottom: 5px;
                }

                /* Provenance Highlight Mode: Questions (35%) */
                .highlight-mode-questions .provenance-question {
                  background: rgba(99, 102, 241, 0.08) !important;
                  border-left: 4px solid #6366f1 !important;
                  padding-left: 14px !important;
                  border-radius: 0 6px 6px 0 !important;
                  box-shadow: 0 1px 4px rgba(99, 102, 241, 0.12) !important;
                  transition: all 0.2s ease !important;
                }
                .highlight-mode-questions .provenance-question::before {
                  content: '📋 Directly From Questions & Assumptions (35%)';
                  display: block;
                  font-size: 10px;
                  font-weight: 700;
                  color: #6366f1;
                  letter-spacing: 0.04em;
                  margin-bottom: 5px;
                }

                /* Provenance Highlight Mode: Reviewed (23%) */
                .highlight-mode-reviewed .provenance-reviewed {
                  background: rgba(217, 119, 6, 0.09) !important;
                  border-left: 4px solid #d97706 !important;
                  padding-left: 14px !important;
                  border-radius: 0 6px 6px 0 !important;
                  box-shadow: 0 1px 4px rgba(217, 119, 6, 0.12) !important;
                  transition: all 0.2s ease !important;
                }
                .highlight-mode-reviewed .provenance-reviewed::before {
                  content: '✍ Content Edited During Review (23%)';
                  display: block;
                  font-size: 10px;
                  font-weight: 700;
                  color: #d97706;
                  letter-spacing: 0.04em;
                  margin-bottom: 5px;
                }
              `}</style>
            {/* Document card */}
            <div
              ref={docCardRef}
              onClick={handleDocCardClick}
              onMouseMove={(e) => {
                if (commentPopup) return
                // Hovering the comment pill itself — keep the current block, just cancel the hide.
                if ((e.target as HTMLElement).closest('[data-comment-ui]')) {
                  cancelHoverHide()
                  return
                }
                const target = (e.target as HTMLElement).closest(
                  'p, li, h2, h3, td, tr, blockquote'
                ) as HTMLElement | null
                const card = docCardRef.current
                if (!target || !card || !editorRef.current?.contains(target)) return
                const sectionEl = target.closest('.sow-section')
                const sectionTitle =
                  sectionEl?.querySelector('h2')?.textContent?.trim() ??
                  tocItems[activeSectionIdx]?.title ??
                  ''
                const rect = target.getBoundingClientRect()
                const cardRect = card.getBoundingClientRect()
                cancelHoverHide()
                setHoverBlock({
                  top: rect.top - cardRect.top,
                  text: (target.textContent ?? '').trim().slice(0, 80),
                  sectionTitle,
                })
              }}
              onMouseLeave={scheduleHoverHide}
              onScroll={() => {
                cancelHoverHide()
                setHoverBlock(null)
                setCommentPopup(null)
              }}
              style={{
                margin: '0 auto',
                maxWidth: 820,
                background: '#fff',
                minHeight: 900,
                borderRadius: 4,
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                padding: '56px 64px',
                position: 'relative',
              }}
            >
              <div
                ref={editorRef}
                contentEditable={!isContributor && !isReviewer && !isReadOnly}
                suppressContentEditableWarning
                onInput={() => {
                  if (!isContributor && !isReviewer) {
                    updateFormats()
                    setHasUnsaved(true)
                  }
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

              {/* Hover: floating "Add comment" pill in the right gutter */}
              {hoverBlock && !commentPopup && (
                <button
                  type="button"
                  data-comment-ui
                  onMouseEnter={cancelHoverHide}
                  onMouseLeave={scheduleHoverHide}
                  onClick={() =>
                    setCommentPopup({
                      top: hoverBlock.top,
                      anchorText: hoverBlock.text,
                      sectionTitle: hoverBlock.sectionTitle,
                    })
                  }
                  title="Add comment"
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: hoverBlock.top - 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '7px 14px 7px 10px',
                    borderRadius: 20,
                    border: '1.5px solid rgba(0,196,196,0.5)',
                    background: '#ffffff',
                    color: '#00a0a0',
                    cursor: 'pointer',
                    boxShadow: '0 3px 12px rgba(0,0,0,0.14)',
                    whiteSpace: 'nowrap',
                    fontSize: 12.5,
                    fontWeight: 600,
                    zIndex: 5,
                  }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  Add comment
                </button>
              )}

              {/* Comment popup — assign & write */}
              {commentPopup && (
                <div
                  data-comment-ui
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: commentPopup.top + 34,
                    width: 280,
                    background: '#fff',
                    border: '1px solid rgba(0,196,196,0.3)',
                    borderRadius: 10,
                    boxShadow: '0 8px 28px rgba(0,0,0,0.16)',
                    padding: 14,
                    zIndex: 20,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: '#94a3b8',
                      fontStyle: 'italic',
                      marginBottom: 8,
                      paddingBottom: 8,
                      borderBottom: '1px solid rgba(0,196,196,0.15)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    &ldquo;{commentPopup.anchorText}&hellip;&rdquo;
                  </div>
                  <textarea
                    autoFocus
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Type your comment… (Enter a valid email like name@company.com to mention someone)"
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: 12.5,
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      outline: 'none',
                      resize: 'none',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      color: '#0d212c',
                      marginBottom: 8,
                    }}
                  />

                  {!isContributor && !isReviewer && (
                    <div style={{ marginBottom: 10 }}>
                      <select
                        value={newCommentAssignee}
                        onChange={(e) => setNewCommentAssignee(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          fontSize: 12,
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          outline: 'none',
                          color: newCommentAssignee ? '#0d212c' : '#64748b',
                          boxSizing: 'border-box',
                          background: '#fff',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="">Assign to (select team member)...</option>
                        <option value="Ashika Jain (PMO)">Ashika Jain (PMO Lead)</option>
                        <option value="Dr. Tariq Al-Nuaimi (Reviewer)">Dr. Tariq Al-Nuaimi (Clinical Reviewer)</option>
                        <option value="Sarah Jenkins (Legal)">Sarah Jenkins (Legal Counsel)</option>
                        <option value="Marcus Vance (Architect)">Marcus Vance (Tech Lead)</option>
                        <option value="Elena Rostova (Compliance)">Elena Rostova (Compliance)</option>
                        <option value="client.reviewer@m42.ae">Client (M42 Reviewer)</option>
                      </select>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setCommentPopup(null)
                        setNewCommentText('')
                        setNewCommentAssignee('')
                        setNewCommentTaggedEmails([])
                        setEmailInput('')
                        setEmailInputError(false)
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: '1px solid rgba(0,196,196,0.25)',
                        background: 'transparent',
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#64748b',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!newCommentText.trim()}
                      onClick={addComment}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 6,
                        border: 'none',
                        background: newCommentText.trim() ? '#00C4C4' : 'rgba(148,163,184,0.25)',
                        fontSize: 12,
                        fontWeight: 700,
                        color: newCommentText.trim() ? '#ffffff' : '#94a3b8',
                        cursor: newCommentText.trim() ? 'pointer' : 'not-allowed',
                      }}
                    >
                      Comment
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Right panel: 2-tab side drawer (Comments & Version History) ── */}
          {showCommentsPanel ? (
          <div
            style={{
              width: 350,
              flexShrink: 0,
              borderLeft: '1px solid rgba(0,196,196,0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              background: '#f8fafc',
            }}
          >
            {/* Header with 2 tabs */}
            <div
              style={{
                padding: '0 16px',
                borderBottom: '1.5px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#ffffff',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <button
                  type="button"
                  onClick={() => setDrawerTab('comments')}
                  style={{
                    padding: '12px 2px 10px',
                    border: 'none',
                    borderBottom: drawerTab === 'comments' ? '2.5px solid #00C4C4' : '2.5px solid transparent',
                    background: 'transparent',
                    color: drawerTab === 'comments' ? '#00a0a0' : '#64748b',
                    fontSize: 13,
                    fontWeight: drawerTab === 'comments' ? 700 : 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: -1.5,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <MessageSquare size={14} color={drawerTab === 'comments' ? '#00a0a0' : '#64748b'} />
                  <span>Comments ({comments.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDrawerTab('history')}
                  style={{
                    padding: '12px 2px 10px',
                    border: 'none',
                    borderBottom: drawerTab === 'history' ? '2.5px solid #00C4C4' : '2.5px solid transparent',
                    background: 'transparent',
                    color: drawerTab === 'history' ? '#00a0a0' : '#64748b',
                    fontSize: 13,
                    fontWeight: drawerTab === 'history' ? 700 : 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: -1.5,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Clock size={14} color={drawerTab === 'history' ? '#00a0a0' : '#64748b'} />
                  <span>Version History</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowCommentsPanel(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  display: 'flex',
                  padding: 4,
                  borderRadius: 4,
                }}
                title="Close drawer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
              {drawerTab === 'comments' ? (
                comments.length === 0 ? (
                  <div
                    style={{
                      fontSize: 12.5,
                      color: '#94a3b8',
                      textAlign: 'center',
                      padding: '36px 14px',
                      lineHeight: 1.5,
                    }}
                  >
                    No comments yet. Hover over any paragraph in the document and click the comment
                    icon to add one.
                  </div>
                ) : (
                  comments.map((c) => {
                    const canResolve = (isPMO || isReviewer) && (c.assignee && c.assignee !== 'Unassigned')
                    const isEditing = editingCommentId === c.id

                    return (
                      <div
                        key={c.id}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: 10,
                          padding: 12,
                          marginBottom: 10,
                          opacity: c.resolved ? 0.6 : 1,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 8,
                            gap: 6,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 10.5,
                              fontWeight: 700,
                              color: '#00a0a0',
                              background: 'rgba(0,196,196,0.08)',
                              padding: '2px 7px',
                              borderRadius: 5,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: 160,
                            }}
                          >
                            {c.sectionTitle}
                          </span>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {canResolve && (
                              <button
                                type="button"
                                onClick={() => toggleResolved(c.id)}
                                title={c.resolved ? "Unresolve comment" : "Resolve comment"}
                                style={{
                                  fontSize: 10.5,
                                  fontWeight: 600,
                                  color: c.resolved ? '#16a34a' : '#00a0a0',
                                  background: c.resolved ? 'rgba(22,163,74,0.1)' : 'rgba(0,196,196,0.08)',
                                  border: 'none',
                                  borderRadius: 4,
                                  padding: '2px 7px',
                                  cursor: 'pointer',
                                }}
                              >
                                {c.resolved ? '✓ Resolved' : 'Resolve'}
                              </button>
                            )}

                            {!isEditing && (
                              <button
                                type="button"
                                onClick={() => startEditComment(c)}
                                title="Edit comment"
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: '#94a3b8',
                                  padding: 2,
                                  display: 'flex',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = '#00a0a0')}
                                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                              >
                                <Edit2 size={12} />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => deleteComment(c.id)}
                              title="Delete comment"
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#94a3b8',
                                padding: 2,
                                display: 'flex',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        <div
                          style={{
                            fontSize: 11,
                            color: '#64748b',
                            fontStyle: 'italic',
                            marginBottom: 8,
                            paddingLeft: 8,
                            borderLeft: '2px solid #cbd5e1',
                          }}
                        >
                          &ldquo;{c.anchorText}&hellip;&rdquo;
                        </div>

                        {/* Inline Edit Form */}
                        {isEditing ? (
                          <div style={{ marginBottom: 8, marginTop: 4 }}>
                            <textarea
                              value={editingCommentText}
                              onChange={(e) => setEditingCommentText(e.target.value)}
                              rows={3}
                              style={{
                                width: '100%',
                                padding: '6px 8px',
                                fontSize: 12,
                                borderRadius: 6,
                                border: '1px solid #00C4C4',
                                outline: 'none',
                                fontFamily: 'inherit',
                                marginBottom: 6,
                              }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                              <button
                                type="button"
                                onClick={() => setEditingCommentId(null)}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: 4,
                                  border: '1px solid #cbd5e1',
                                  background: 'transparent',
                                  fontSize: 11,
                                  cursor: 'pointer',
                                }}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => saveEditComment(c.id)}
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: 4,
                                  border: 'none',
                                  background: '#00C4C4',
                                  color: '#fff',
                                  fontSize: 11,
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                            <MemberAvatar memberId={memberIdByName(c.author)} size={22} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#0d212c' }}>
                                  {c.author}
                                </span>
                                <span style={{ fontSize: 10.5, color: '#94a3b8' }}>{c.timestamp}</span>
                              </div>
                              <div
                                style={{
                                  fontSize: 12.5,
                                  color: '#374151',
                                  lineHeight: 1.5,
                                  marginTop: 2,
                                }}
                              >
                                {renderCommentTextWithMentions(c.text)}
                              </div>
                              {c.assignee && c.assignee !== 'Unassigned' && (
                                <div
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    fontSize: 10.5,
                                    color: '#475569',
                                    background: '#f1f5f9',
                                    padding: '2px 7px',
                                    borderRadius: 4,
                                    marginTop: 5,
                                  }}
                                >
                                  <User size={11} color="#64748b" />
                                  <span>Assigned to: <strong style={{ color: '#0f172a' }}>{c.assignee}</strong></span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {c.replies.map((r) => {
                          const isEditingThisReply = editingReplyId === r.id
                          return (
                            <div
                              key={r.id}
                              style={{ display: 'flex', gap: 8, marginLeft: 14, marginBottom: 6, paddingTop: 4, borderTop: '1px solid #f1f5f9' }}
                            >
                              <MemberAvatar memberId={memberIdByName(r.author)} size={18} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                                    <span style={{ fontSize: 11.5, fontWeight: 700, color: '#0d212c' }}>
                                      {r.author}
                                    </span>
                                    <span style={{ fontSize: 10, color: '#94a3b8' }}>{r.timestamp}</span>
                                  </div>

                                  {!isEditingThisReply && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                      <button
                                        type="button"
                                        onClick={() => startEditReply(r)}
                                        title="Edit reply"
                                        style={{
                                          background: 'transparent',
                                          border: 'none',
                                          cursor: 'pointer',
                                          color: '#94a3b8',
                                          padding: 2,
                                          display: 'flex',
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.color = '#00a0a0')}
                                        onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                                      >
                                        <Edit2 size={11} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => deleteReply(c.id, r.id)}
                                        title="Delete reply"
                                        style={{
                                          background: 'transparent',
                                          border: 'none',
                                          cursor: 'pointer',
                                          color: '#94a3b8',
                                          padding: 2,
                                          display: 'flex',
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                                        onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {isEditingThisReply ? (
                                  <div style={{ marginTop: 4 }}>
                                    <input
                                      type="text"
                                      value={editingReplyText}
                                      onChange={(e) => setEditingReplyText(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') saveEditReply(c.id, r.id)
                                        if (e.key === 'Escape') setEditingReplyId(null)
                                      }}
                                      style={{
                                        width: '100%',
                                        padding: '4px 8px',
                                        fontSize: 12,
                                        borderRadius: 4,
                                        border: '1px solid #00C4C4',
                                        outline: 'none',
                                        color: '#0d212c',
                                        boxSizing: 'border-box',
                                        marginBottom: 4,
                                      }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                                      <button
                                        type="button"
                                        onClick={() => setEditingReplyId(null)}
                                        style={{
                                          padding: '2px 6px',
                                          borderRadius: 4,
                                          border: '1px solid #cbd5e1',
                                          background: 'transparent',
                                          fontSize: 10.5,
                                          cursor: 'pointer',
                                        }}
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => saveEditReply(c.id, r.id)}
                                        style={{
                                          padding: '2px 8px',
                                          borderRadius: 4,
                                          border: 'none',
                                          background: '#00C4C4',
                                          color: '#fff',
                                          fontSize: 10.5,
                                          fontWeight: 700,
                                          cursor: 'pointer',
                                        }}
                                      >
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.5, marginTop: 2 }}>
                                    {renderCommentTextWithMentions(r.text)}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}

                        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                          <input
                            type="text"
                            value={replyDrafts[c.id] ?? ''}
                            onChange={(e) =>
                              setReplyDrafts((prev) => ({ ...prev, [c.id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') addReply(c.id)
                            }}
                            placeholder="Reply… (Type email to mention)"
                            style={{
                              flex: 1,
                              padding: '6px 9px',
                              fontSize: 12,
                              borderRadius: 6,
                              border: '1px solid #cbd5e1',
                              outline: 'none',
                              color: '#0d212c',
                              background: '#ffffff',
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => addReply(c.id)}
                            disabled={!(replyDrafts[c.id] ?? '').trim()}
                            style={{
                              padding: '6px 10px',
                              borderRadius: 6,
                              border: 'none',
                              background: (replyDrafts[c.id] ?? '').trim()
                                ? '#00C4C4'
                                : 'rgba(148,163,184,0.2)',
                              color: (replyDrafts[c.id] ?? '').trim() ? '#fff' : '#94a3b8',
                              fontSize: 11.5,
                              fontWeight: 700,
                              cursor: (replyDrafts[c.id] ?? '').trim() ? 'pointer' : 'not-allowed',
                            }}
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    )
                  })
                )
              ) : (
                /* Version History Tab in Side Drawer */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {draftVersions.map((v) => (
                    <div
                      key={v.id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: v.isCurrent ? '1.5px solid #00C4C4' : '1px solid #e2e8f0',
                        background: v.isCurrent ? 'rgba(0,196,196,0.04)' : '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#0d212c' }}>
                            Version {v.name}
                          </span>
                          {v.isCurrent && (
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: '#00a0a0',
                                background: 'rgba(0,196,196,0.12)',
                                padding: '1.5px 6px',
                                borderRadius: 8,
                              }}
                            >
                              Current
                            </span>
                          )}
                        </div>
                        {!v.isCurrent && (
                          <button
                            type="button"
                            onClick={() => {
                              setDraftVersions((prev) =>
                                prev.map((ver) => ({ ...ver, isCurrent: ver.id === v.id }))
                              )
                              showToast(`Restored to Version ${v.name}`, 'success')
                            }}
                            style={{
                              padding: '3px 9px',
                              borderRadius: 5,
                              border: '1px solid rgba(0,196,196,0.4)',
                              background: '#fff',
                              color: '#007a7a',
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Restore
                          </button>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>
                        {v.timestamp} • by {v.author}
                      </div>
                      <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.45 }}>
                        {v.summary}
                      </div>
                      <div style={{ fontSize: 10.5, color: '#64748b' }}>
                        • {v.changesCount} tracked changes
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowCommentsPanel(true)}
            style={{
              position: 'absolute',
              top: 16,
              right: 18,
              zIndex: 30,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 14px',
              borderRadius: 8,
              border: '1.5px solid rgba(0,196,196,0.35)',
              background: '#ffffff',
              color: '#007a7a',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f0fdfa'
              e.currentTarget.style.color = '#00a0a0'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff'
              e.currentTarget.style.color = '#007a7a'
            }}
            title="Open Comments"
          >
            View comments
          </button>
        )}

        {/* Center Floating FAB: AI Review & Summary */}
        {!isAdmin && !isContributor && !isDraftGenerating && (
          <button
            type="button"
            onClick={() => setShowAIReviewModal(true)}
            style={{
              position: 'absolute',
              bottom: 24,
              left: showCommentsPanel ? 'calc(50% - 190px)' : '50%',
              transform: `translateX(-50%) translateY(${showFab ? '0' : '80px'})`,
              opacity: showFab ? 1 : 0,
              pointerEvents: showFab ? 'auto' : 'none',
              transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease, left 0.25s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 22px',
              borderRadius: 9999,
              background: '#00C4C4',
              border: 'none',
              backdropFilter: 'blur(10px)',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0,196,196,0.35)',
              zIndex: 50,
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#00a8a8'
              e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,196,196,0.45)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#00C4C4'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,196,196,0.35)'
            }}
            title="AI Document Review & Verdict"
          >
            <Sparkles size={16} color="#ffffff" />
            <span>{hasRunAICheck ? 'Rerun AI Check' : 'AI Review & Summary'}</span>
          </button>
        )}
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
              <div style={{ fontWeight: 700, fontSize: 16, color: '#0d212c' }}>Assign Contributors</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                &quot;{tocItems[addReviewerIdx]?.title}&quot;
              </div>
            </div>
            <div style={{ padding: '16px 28px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {allMembers.map((name) => {
                const isChecked = !!tocItems[addReviewerIdx]?.reviewers.includes(name)
                const matches = name.toLowerCase().includes(reviewerSearch.toLowerCase())
                if (!matches) return null
                return (
                  <div
                    key={name}
                    onClick={() => {
                      setTocItems((prev) =>
                        prev.map((t, i) => {
                          if (i !== addReviewerIdx) return t
                          return {
                            ...t,
                            reviewers: isChecked
                              ? t.reviewers.filter((r) => r !== name)
                              : [...t.reviewers.filter((r) => r !== name), name],
                          }
                        })
                      )
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 6px',
                      cursor: 'pointer',
                      fontSize: 13,
                      color: '#374151',
                      borderRadius: 6,
                      userSelect: 'none',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = '#f8fafc')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = 'transparent')}
                  >
                    {/* Custom Lucide Checkbox matching primary light / #00C4C4 theme */}
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        background: isChecked ? '#00C4C4' : '#ffffff',
                        border: isChecked ? '1.5px solid #00C4C4' : '1.5px solid #cbd5e1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                        flexShrink: 0,
                      }}
                    >
                      {isChecked && <Check size={12} color="#ffffff" strokeWidth={3} />}
                    </div>
                    <span>{name}</span>
                  </div>
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
      {/* ── AI Review Modal (PMO & Reviewer) ── */}
      {showAIReviewModal && (
        <AIReviewModal
          isOpen={showAIReviewModal}
          onClose={() => setShowAIReviewModal(false)}
          onAcknowledge={() => {
            setHasRunAICheck(true)
          }}
          hasRunBefore={hasRunAICheck}
          onResolveManually={(affected) => {
            setShowAIReviewModal(false)
            const targetSection = SOW_DRAFT_SECTIONS.findIndex(
              (s) =>
                affected.toLowerCase().includes(s.title.toLowerCase()) ||
                s.title.toLowerCase().includes(affected.toLowerCase())
            )
            if (targetSection !== -1) {
              setActiveSectionIdx(targetSection)
            }
          }}
        />
      )}

      {/* ── PMO Approve Confirmation Modal ── */}
      {showApproveConfirmModal && (
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
            if (e.target === e.currentTarget) setShowApproveConfirmModal(false)
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
              onClick={() => setShowApproveConfirmModal(false)}
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
              <X size={18} />
            </button>

            {/* Icon Circle */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: 'rgba(22,163,74,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <Check size={28} color="#16a34a" strokeWidth={2.5} />
            </div>

            <div style={{ fontSize: 22, fontWeight: 700, color: '#0d212c', marginBottom: 8 }}>
              Approve SOW?
            </div>
            <div style={{ fontSize: 14, color: '#64748b', marginBottom: 26, lineHeight: 1.5 }}>
              Are you sure you want to approve? After this no one can edit the document and it will be sent for client review.
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowApproveConfirmModal(false)}
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
                  setIsPMOApproved(true)
                  setShowApproveConfirmModal(false)
                  showToast('SOW approved and sent for client review!', 'success')
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 12,
                  background: '#16a34a',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(22,163,74,0.3)',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#15803d')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#16a34a')}
              >
                Approve SOW
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Send for Approval Confirmation Modal (Reviewer / Contributor / Client) ── */}
      {showSendForApprovalPopup && (
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
            if (e.target === e.currentTarget) setShowSendForApprovalPopup(false)
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
              onClick={() => setShowSendForApprovalPopup(false)}
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
              <X size={18} />
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
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#00C4C4"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22 11 13 2 9l20-7z" />
              </svg>
            </div>

            <div style={{ fontSize: 22, fontWeight: 700, color: '#0d212c', marginBottom: 8 }}>
              Send for Approval?
            </div>
            <div style={{ fontSize: 14, color: '#64748b', marginBottom: 26, lineHeight: 1.5 }}>
              Are you sure you want to send this for approval? After this you will not be able to make any edits.
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowSendForApprovalPopup(false)}
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
                  setShowSendForApprovalPopup(false)
                  showToast('SOW sent for approval successfully!', 'success')
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
                Send for Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Document Citation Preview Modal ── */}
      {draftCitationTarget && (
        <DocumentCitationPreviewModal
          citation={draftCitationTarget}
          onClose={() => setDraftCitationTarget(null)}
        />
      )}

      {/* ── Draft Section Trace Modal ── */}
      {draftTraceTarget && (
        <DraftSectionTraceModal
          sectionTitle={draftTraceTarget.sectionTitle}
          sectionIdx={draftTraceTarget.sectionIdx}
          onClose={() => setDraftTraceTarget(null)}
          onOpenCitation={(citation) => {
            setDraftTraceTarget(null)
            setDraftCitationTarget(citation)
          }}
        />
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

/* ── Send for Review Modal Wrapper ───────────────────────────────────────── */

function SendForReviewModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <ReviewerAndParticipantsModal
      initialTab="reviewers"
      onClose={onClose}
      onConfirmReviewers={() => onConfirm()}
    />
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
  viewerRole = 'pmo',
  currentMemberId = 'm5',
  isDeactivated: isDeactivatedProp = false,
  onReactivateSOW,
  sowDeadline = '2026-10-31',
}: SOWDetailScreenProps) {
  const [activeSOWStatus, setActiveSOWStatus] = useState(sowStatus)
  const isDeactivated = isDeactivatedProp || activeSOWStatus === 'Deactivated' || sowStatus === 'Deactivated'
  const [activeViewerRole, setActiveViewerRole] = useState<'pmo' | 'contributor' | 'reviewer'>(
    viewerRole === 'contributor' ? 'contributor' : viewerRole === 'reviewer' ? 'reviewer' : 'pmo'
  )
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false)

  const effectiveViewerRole = viewerRole === 'pmo' ? activeViewerRole : viewerRole
  const isContributor = effectiveViewerRole === 'contributor'
  const isReviewer = effectiveViewerRole === 'reviewer'
  const effectiveMemberId =
    viewerRole === 'pmo' && activeViewerRole === 'contributor' ? 'm1' : currentMemberId

  const [showParticipantsModal, setShowParticipantsModal] = useState(false)
  const { showToast } = useToast()

  const defaultMockFiles: UploadedFile[] = [
    { id: '1', name: 'Scope_Requirements_RFP.pdf', size: '2.4 MB', type: 'application/pdf', status: 'complete', progress: 100 },
    { id: '2', name: 'Vendor_MSA_Template.docx', size: '1.2 MB', type: 'application/msword', status: 'complete', progress: 100 },
    { id: '3', name: 'Technical_Specifications.pdf', size: '845 KB', type: 'application/pdf', status: 'complete', progress: 100 }
  ]
  const effectiveFiles = uploadedFiles && uploadedFiles.length > 0 ? uploadedFiles : (sowVariant === 'v2' || sowVariant === 'meridian' || isDeactivated) ? defaultMockFiles : uploadedFiles

  type DraftGenState = 'idle' | 'generating' | 'shimmer' | 'ready'
  const [activeTab, setActiveTab] = useState<SOWTab>(
    sowVariant === 'v2' || sowVariant === 'meridian' || isContributor || isReviewer ? 'structure' : 'overview'
  )
  const [isStructureUnlocked, setIsStructureUnlocked] = useState(
    sowVariant === 'v2' || sowVariant === 'meridian' || isContributor || isReviewer || isDeactivated
  )
  const [isDraftUnlocked, setIsDraftUnlocked] = useState(isDeactivated)
  const [isFormReady, setIsFormReady] = useState(false)
  const [isFormEditable, setIsFormEditable] = useState(false)
  const [hasInvitedParticipants, setHasInvitedParticipants] = useState(false)
  const [draftGenState, setDraftGenState] = useState<DraftGenState>('idle')
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [completionScore, setCompletionScore] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSentForReview, setIsSentForReview] = useState(false)
  const [showSendForApprovalConfirm, setShowSendForApprovalConfirm] = useState(false)
  const isClient = viewerRole === 'client'

  const showInviteToast = () => {
    showToast('Participants invited successfully!', 'success')
  }

  const handleGenerateDraft = () => {
    setIsDraftUnlocked(true)
    setActiveTab('sow-draft')
    setDraftGenState('generating')
    showToast('Generating SOW draft...', 'info')
    setTimeout(() => {
      setDraftGenState('shimmer')
      setTimeout(() => {
        setDraftGenState('ready')
        showToast('SOW draft generated successfully!', 'success')
      }, 2000)
    }, 3000)
  }

  const handleSendForReview = () => {
    setShowReviewModal(false)
    showToast('SOW sent for review successfully!', 'success')
  }

  const tabs = buildTabs(isStructureUnlocked || isDeactivated, isDraftUnlocked || isDeactivated)

  const [isFormDirty, setIsFormDirty] = useState(false)
  const [showOverrideConfirm, setShowOverrideConfirm] = useState(false)
  const [formVersions, setFormVersions] = useState<{ id: string; timestamp: string }[]>([
    { id: 'v1', timestamp: new Date().toISOString() }
  ])
  const [hasPendingStructureChanges, setHasPendingStructureChanges] = useState(false)

  const handleFormSubmit = () => {
    if (isStructureUnlocked) {
      setShowOverrideConfirm(true)
    } else {
      executeFormSubmit()
    }
  }

  const executeFormSubmit = () => {
    if (isStructureUnlocked) {
      setFormVersions(prev => [...prev, { id: `v${prev.length + 1}`, timestamp: new Date().toISOString() }])
      setHasPendingStructureChanges(true)
    }
    setIsGenerating(false)
    setIsStructureUnlocked(true)
    setActiveTab('structure')
    setIsFormEditable(false)
    setIsFormDirty(false)
    setShowOverrideConfirm(false)
    showToast(isStructureUnlocked ? 'Context re-submitted successfully!' : 'Context submitted successfully!', 'success')
  }

  return (
    <>
      {/* ── Sticky header: breadcrumb + title + tabs ── */}

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
          {/* Tokens consumed indicator */}
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 500,
              color: '#64748b',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              padding: '4px 10px',
              borderRadius: 8,
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              flexShrink: 0,
            }}
          >
            <span style={{ fontWeight: 600, color: '#0d212c' }}>200/3000</span>
            <span>Tokens</span>
          </div>


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
              {isReviewer ? null : isContributor ? (
                activeTab === 'structure' ? (
                  draftGenState === 'generating' || draftGenState === 'shimmer' ? (
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {/* Send for Review / Send for Approval (Secondary) */}
                      <button
                        onClick={() => {
                          if (isDeactivated) return
                          if (isContributor || isReviewer || isClient) {
                            setShowSendForApprovalConfirm(true)
                          } else {
                            setIsSentForReview(true)
                            setIsDraftUnlocked(true)
                            showToast('SOW sent for review successfully!', 'success')
                          }
                        }}
                        disabled={isDeactivated || completionScore === 0}
                        title={
                          completionScore === 0
                            ? 'At least one question must be answered before sending'
                            : isContributor || isReviewer || isClient
                            ? 'Send for Approval'
                            : 'Send for review'
                        }
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 14px',
                          borderRadius: 8,
                          border:
                            completionScore === 0
                              ? '1.5px solid #e2e8f0'
                              : '1.5px solid rgba(0,196,196,0.5)',
                          background: completionScore === 0 ? '#f8fafc' : 'rgba(0,196,196,0.12)',
                          fontSize: 12,
                          fontWeight: 600,
                          color: completionScore === 0 ? '#94a3b8' : '#007a7a',
                          cursor: completionScore === 0 ? 'not-allowed' : 'pointer',
                          opacity: completionScore === 0 ? 0.6 : 1,
                          whiteSpace: 'nowrap',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (completionScore > 0) {
                            ;(e.currentTarget as HTMLButtonElement).style.background = '#f1f5f9'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (completionScore > 0) {
                            ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,196,196,0.12)'
                          }
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
                        {isContributor || isReviewer || isClient ? 'Send for Approval' : 'Send for Review'}
                      </button>

                      {/* Generate Draft (Primary) */}
                      <button
                        onClick={handleGenerateDraft}
                        disabled={isDeactivated || completionScore < 80}
                        title={isDeactivated ? "Document is deactivated" : completionScore < 80 ? "Completion must be at least 80% to generate draft" : "Generate Draft"}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 14px',
                          borderRadius: 8,
                          border: 'none',
                          background: (isDeactivated || completionScore < 80) ? '#cbd5e1' : '#00C4C4',
                          fontSize: 12,
                          fontWeight: 700,
                          color: (isDeactivated || completionScore < 80) ? '#64748b' : '#ffffff',
                          cursor: (isDeactivated || completionScore < 80) ? 'not-allowed' : 'pointer',
                          whiteSpace: 'nowrap',
                          boxShadow: (isDeactivated || completionScore < 80) ? 'none' : '0 2px 8px rgba(0,196,196,0.25)',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (completionScore >= 80) {
                            ;(e.currentTarget as HTMLButtonElement).style.background = '#00a8a8'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (completionScore >= 80) {
                            ;(e.currentTarget as HTMLButtonElement).style.background = '#00C4C4'
                          }
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
                    </div>
                  )
                ) : null
              ) : activeTab === 'form' && isFormReady ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {formVersions.length > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <select
                        style={{
                          padding: '6px 12px',
                          borderRadius: 8,
                          border: '1px solid #e2e8f0',
                          fontSize: 13,
                          background: '#fff',
                          color: '#0d212c',
                          outline: 'none',
                        }}
                      >
                        {[...formVersions].reverse().map(v => (
                          <option key={v.id} value={v.id}>
                            Version {v.id.substring(1)} ({new Date(v.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {isStructureUnlocked && !isFormEditable ? (
                    <button
                      disabled={isDeactivated}
                      onClick={() => !isDeactivated && setIsFormEditable(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'transparent',
                        border: 'none',
                        fontSize: 13,
                        fontWeight: 600,
                        color: isDeactivated ? '#94a3b8' : '#00a0a0',
                        cursor: isDeactivated ? 'not-allowed' : 'pointer',
                        padding: '6px 14px',
                      }}
                    >
                      Edit
                    </button>
                  ) : (
                    <button
                      disabled={isDeactivated || (isStructureUnlocked && !isFormDirty)}
                      onClick={isDeactivated ? undefined : handleFormSubmit}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 14px',
                        borderRadius: 8,
                        border: (!isDeactivated && (!isStructureUnlocked || isFormDirty)) ? '1.5px solid rgba(0,196,196,0.35)' : '1.5px solid #cbd5e1',
                        background: (!isDeactivated && (!isStructureUnlocked || isFormDirty)) ? 'rgba(0,196,196,0.07)' : '#f1f5f9',
                        fontSize: 12,
                        fontWeight: 600,
                        color: (!isDeactivated && (!isStructureUnlocked || isFormDirty)) ? '#00a0a0' : '#94a3b8',
                        cursor: (!isDeactivated && (!isStructureUnlocked || isFormDirty)) ? 'pointer' : 'not-allowed',
                        whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={(e) => {
                        if (!isDeactivated && (!isStructureUnlocked || isFormDirty)) (e.currentTarget as HTMLButtonElement).style.background = '#f1f5f9'
                      }}
                      onMouseLeave={(e) => {
                        if (!isDeactivated && (!isStructureUnlocked || isFormDirty)) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,196,196,0.07)'
                      }}
                    >
                      {isStructureUnlocked ? 'Resubmit' : 'Submit Form'}
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
                  )}
                </div>
              ) : showGenerateDraft ? (
                draftGenState === 'ready' ? null : draftGenState === 'generating' || draftGenState === 'shimmer' ? (
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
                ) : activeTab !== 'structure' ? null : (
                  <button
                    onClick={handleGenerateDraft}
                    disabled={isDeactivated || completionScore < 80}
                    title={isDeactivated ? "Document is deactivated" : completionScore >= 80 ? "Generate Draft" : "Complete at least 80% to generate draft"}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 14px',
                      borderRadius: 8,
                      border: 'none',
                      background: (!isDeactivated && completionScore >= 80) ? '#00C4C4' : '#cbd5e1',
                      fontSize: 12,
                      fontWeight: 700,
                      color: (!isDeactivated && completionScore >= 80) ? '#ffffff' : '#94a3b8',
                      cursor: (!isDeactivated && completionScore >= 80) ? 'pointer' : 'not-allowed',
                      boxShadow: (!isDeactivated && completionScore >= 80) ? '0 2px 8px rgba(0,196,196,0.25)' : 'none',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (completionScore >= 80) {
                        ;(e.currentTarget as HTMLButtonElement).style.background = '#00a8a8'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (completionScore >= 80) {
                        ;(e.currentTarget as HTMLButtonElement).style.background = '#00C4C4'
                      }
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
          {isGenerating && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 100, background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
              <FormGeneratingAnimation />
            </div>
          )}
          {/* Generating overlay */}
          {draftGenState === 'generating' && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 100,
                background: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <GeneratingAnimation />
            </div>
          )}
          {activeTab === 'overview' && (
            <OverviewTab
              files={effectiveFiles}
              isDraftGenerated={isDraftUnlocked || draftGenState === 'ready'}
            />
          )}
          {activeTab === 'form' && (
            <FormTab
              files={effectiveFiles}
              showUploadedDocs={isFormEditable && isStructureUnlocked}
              onReady={() => setIsFormReady(true)}
              onSubmit={handleFormSubmit}
              skipLoading={isContributor || isStructureUnlocked}
              onDirtyChange={(dirty) => setIsFormDirty(dirty)}
              formVersions={formVersions}
              isEditable={!isDeactivated && (isStructureUnlocked ? isFormEditable : !isContributor)}
            />
          )}
          {activeTab === 'structure' &&
            (isStructureUnlocked ? (
              <StructureTab
                initialSections={
                  sowVariant === 'meridian'
                    ? MERIDIAN_SECTIONS
                    : sowVariant === 'v2'
                      ? INITIAL_SECTIONS_V2
                      : INITIAL_SECTIONS
                }
                viewerRole={effectiveViewerRole}
                currentMemberId={effectiveMemberId}
                onScoreChange={setCompletionScore}
                disableAnswer={
                  isDeactivated ||
                  (isContributor && isSentForReview)
                }
                hasPendingChanges={hasPendingStructureChanges}
                onResolveChanges={(accept) => setHasPendingStructureChanges(false)}
                onOpenParticipantsModal={() => setShowParticipantsModal(true)}
                sowDeadline={sowDeadline || '2026-10-31'}
              />
            ) : (
              <LockedTabState
                title="Structure Not Yet Available"
                description="Submit the Context tab to unlock Structure, where you can review sections, assumptions, and questions."
              />
            ))}
          {activeTab === 'sow-draft' &&
            (isDraftUnlocked ? (
              draftGenState === 'shimmer' ? (
                <ShimmerDraft />
              ) : (
                <SOWDraftTab
                  isContributor={isContributor}
                  isReviewer={isReviewer}
                  viewerRole={effectiveViewerRole}
                  isReadOnly={isDeactivated}
                  isDraftGenerating={draftGenState === 'generating'}
                  sowDeadline={sowDeadline || '2026-10-31'}
                  onOpenParticipantsModal={() => setShowParticipantsModal(true)}
                  onSendForReview={() => {
                    showToast('Review comments sent to PMO successfully!', 'success')
                  }}
                />
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
      {showOverrideConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 24, padding: '32px 24px', width: 480, maxWidth: '90vw', textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#0d212c', marginBottom: 12 }}>Override Previous Details?</div>
            <div style={{ fontSize: 14, color: '#64748b', marginBottom: 32, lineHeight: 1.5 }}>
              Are you sure you want to override the previous details? This could make changes based on the updated data and document uploaded.
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowOverrideConfirm(false)} style={{ flex: 1, padding: '12px', borderRadius: 12, background: '#f1f5f9', border: 'none', color: '#475569', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button onClick={executeFormSubmit} style={{ flex: 1, padding: '12px', borderRadius: 12, background: '#00C4C4', border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Confirm</button>
            </div>
          </div>
        </div>
      )}
      {/* end glass box */}

      {/* Reviewer & Participants Modal */}
      {(showReviewModal || showParticipantsModal) && (
        <ReviewerAndParticipantsModal
          initialTab="reviewers"
          onClose={() => {
            setShowReviewModal(false)
            setShowParticipantsModal(false)
          }}
          onConfirmReviewers={handleSendForReview}
        />
      )}

      {/* Send for Approval Confirmation Modal (Contributor / Reviewer / Client) */}
      {showSendForApprovalConfirm && (
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
            if (e.target === e.currentTarget) setShowSendForApprovalConfirm(false)
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
              onClick={() => setShowSendForApprovalConfirm(false)}
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
              <X size={18} />
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
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#00C4C4"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22 11 13 2 9l20-7z" />
              </svg>
            </div>

            <div style={{ fontSize: 22, fontWeight: 700, color: '#0d212c', marginBottom: 8 }}>
              Send for Approval?
            </div>
            <div style={{ fontSize: 14, color: '#64748b', marginBottom: 26, lineHeight: 1.5 }}>
              Are you sure you want to send this for approval? After this you will not be able to make any edits.
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowSendForApprovalConfirm(false)}
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
                  setIsSentForReview(true)
                  setIsDraftUnlocked(true)
                  setShowSendForApprovalConfirm(false)
                  showToast('SOW sent for approval successfully!', 'success')
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
                Send for Approval
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function DeleteConfirmModal({
  title,
  message,
  onConfirm,
  onClose,
  hideReason,
}: {
  title: string
  message: string
  onConfirm: (reason: string, text: string) => void
  onClose: () => void
  hideReason?: boolean
}) {
  const [reason, setReason] = useState('')
  const [text, setText] = useState('')
  const predefinedReasons = ['Irrelevant', 'Not applicable']

  return (
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
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 24,
          padding: '32px 24px',
          width: 550,
          maxWidth: '90vw',
          position: 'relative',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        }}
      >
        <button
          onClick={onClose}
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
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </div>

        <div style={{ fontSize: 22, fontWeight: 700, color: '#0d212c', marginBottom: 8 }}>
          {title}
        </div>
        <div style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>
          {message}
        </div>



        {!hideReason && (
          <>
            <div style={{ textAlign: 'left', marginBottom: 6, fontSize: 13, fontWeight: 700, color: '#0d212c' }}>
              Reason
            </div>
            <textarea
              placeholder="Type a reason..."
              value={text}
              onChange={(e) => {
                setText(e.target.value)
                setReason('') // clear chip selection if manually typing
              }}
              rows={3}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 10,
                border: '1.5px solid #cbd5e1',
                fontSize: 14,
                marginBottom: 16,
                outline: 'none',
                color: '#0d212c',
                resize: 'none',
              }}
              onFocus={(e) => e.target.style.borderColor = '#e2e8f0'}
              onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
            />

            {/* Reason Selection */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-start', marginBottom: 24 }}>
              {predefinedReasons.map(r => (
                <button
                  key={r}
                  onClick={() => {
                    setReason(r)
                    setText(r)
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: reason === r ? '#f1f5f9' : '#ffffff',
                    color: '#475569',
                    border: reason === r ? '1.5px solid #cbd5e1' : '1.5px solid #e2e8f0',
                  }}
                  onMouseEnter={(e) => {
                    if (reason !== r) { e.currentTarget.style.background = '#f8fafc' }
                  }}
                  onMouseLeave={(e) => {
                    if (reason !== r) { e.currentTarget.style.background = '#ffffff' }
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onClose}
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
            onClick={() => onConfirm(reason, text)}
            disabled={!hideReason && !text.trim()}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 12,
              background: (hideReason || text.trim()) ? '#E60000' : '#fca5a5',
              border: 'none',
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 700,
              cursor: (hideReason || text.trim()) ? 'pointer' : 'not-allowed',
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

function ClientQueueModal({
  sections,
  onRemoveFromQueue,
  onClose,
}: {
  sections: SOWSection[]
  onRemoveFromQueue: (id: string) => void
  onClose: () => void
}) {
  const { showToast } = useToast()
  const defaultClients = [
    'client.reviewer@m42.ae',
    'sarah.chen@acme-health.org',
    'david.miller@acme-health.org',
    'amira.khalil@clevelandclinicabudhabi.ae',
  ]
  const [availableClients, setAvailableClients] = useState<string[]>(defaultClients)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [newClientInput, setNewClientInput] = useState('')
  const [newClientError, setNewClientError] = useState('')
  const [clientList, setClientList] = useState<string[]>(['client.reviewer@m42.ae'])
  const [selectedClientToAssign, setSelectedClientToAssign] = useState(defaultClients[0])

  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/

  const allQueueItems = sections.flatMap((s) => s.items.filter((i) => i.inClientQueue))
  const [selectedQueueItemIds, setSelectedQueueItemIds] = useState<Set<string>>(
    () => new Set(allQueueItems.map((i) => i.id))
  )

  const toggleSelectItem = (id: string) => {
    setSelectedQueueItemIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const allQueueSelected = allQueueItems.length > 0 && allQueueItems.every((i) => selectedQueueItemIds.has(i.id))

  const handleAddNewClientFromDropdown = () => {
    const val = newClientInput.trim()
    if (!val) return
    if (!emailRegex.test(val)) {
      setNewClientError('Please enter a valid email address.')
      return
    }
    if (!availableClients.includes(val)) {
      setAvailableClients((prev) => [...prev, val])
    }
    setSelectedClientToAssign(val)
    if (!clientList.includes(val)) {
      setClientList((prev) => [...prev, val])
    }
    setNewClientInput('')
    setNewClientError('')
    setIsDropdownOpen(false)
    showToast(`Added and selected ${val}`, 'success')
  }

  const handleSelectClient = (client: string) => {
    setSelectedClientToAssign(client)
    if (!clientList.includes(client)) {
      setClientList((prev) => [...prev, client])
    }
    setIsDropdownOpen(false)
  }

  const handleSendInvite = () => {
    if (selectedQueueItemIds.size === 0) {
      showToast('Please select at least one question or assumption to assign to the client.', 'error')
      return
    }
    const recipients = clientList.length > 0 ? clientList : [selectedClientToAssign || 'client.reviewer@m42.ae']
    showToast(`Successfully assigned ${selectedQueueItemIds.size} selected item(s) to ${recipients.join(', ')}!`, 'success')
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: '32px 24px', width: 620, maxWidth: '92vw', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#0d212c', marginBottom: 6 }}>Client Queue</div>
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Select questions and assumptions with the checkboxes to assign them to designated clients.</div>
        
        {/* Horizontal Line Separator below title & subtitle */}
        <div style={{ height: 1, background: '#f1f5f9', marginBottom: 18 }} />

        {/* Custom Dropdown: Assign To Client (Light Theme + Add Client Inside) */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0d212c', marginBottom: 6 }}>
            Assign to Client
          </label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: '1.5px solid #e2e8f0',
                  background: '#ffffff',
                  fontSize: 13,
                  color: selectedClientToAssign ? '#0d212c' : '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxSizing: 'border-box',
                }}
              >
                <span>{selectedClientToAssign || 'Select client...'}</span>
                <ChevronDown size={15} color="#64748b" />
              </button>

              {/* Custom Dropdown Menu */}
              {isDropdownOpen && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 100 }}
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      left: 0,
                      right: 0,
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 10,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                      zIndex: 101,
                      padding: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    {/* Field inside dropdown menu to add new client by valid email */}
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input
                        type="email"
                        placeholder="Add new client email..."
                        value={newClientInput}
                        onChange={(e) => {
                          setNewClientInput(e.target.value)
                          if (newClientError) setNewClientError('')
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddNewClientFromDropdown()
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: '7px 10px',
                          borderRadius: 6,
                          border: '1px solid ' + (newClientError ? '#ef4444' : '#cbd5e1'),
                          background: '#ffffff',
                          fontSize: 12,
                          color: '#0d212c',
                          outline: 'none',
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddNewClientFromDropdown}
                        style={{
                          padding: '7px 12px',
                          borderRadius: 6,
                          background: '#00C4C4',
                          border: 'none',
                          color: '#ffffff',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Add
                      </button>
                    </div>
                    {newClientError && (
                      <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 500, paddingLeft: 2 }}>
                        {newClientError}
                      </div>
                    )}

                    <div style={{ height: 1, background: '#f1f5f9', margin: '4px 0' }} />

                    {/* Available Clients Options */}
                    <div style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {availableClients.map((client) => {
                        const isSelected = selectedClientToAssign === client
                        return (
                          <div
                            key={client}
                            onClick={() => handleSelectClient(client)}
                            style={{
                              padding: '8px 10px',
                              borderRadius: 6,
                              fontSize: 12.5,
                              color: isSelected ? '#007a7a' : '#334155',
                              background: isSelected ? 'rgba(0,196,196,0.08)' : 'transparent',
                              fontWeight: isSelected ? 600 : 400,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              transition: 'background 0.12s ease',
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) e.currentTarget.style.background = '#f8fafc'
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) e.currentTarget.style.background = 'transparent'
                            }}
                          >
                            <span>{client}</span>
                            {isSelected && <span style={{ color: '#00a0a0', fontSize: 12 }}>✓</span>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Assigned clients badges */}
          {clientList.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {clientList.map((em) => (
                <span
                  key={em}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '3px 10px',
                    borderRadius: 16,
                    background: '#e0f2fe',
                    border: '1px solid #bae6fd',
                    color: '#0369a1',
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {em}
                  <button
                    type="button"
                    onClick={() => setClientList((prev) => prev.filter((c) => c !== em))}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      color: '#0284c7',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Selection Subheader */}
        {allQueueItems.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 4px 10px',
              borderBottom: '1px solid #e2e8f0',
              marginBottom: 10,
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                fontSize: 12.5,
                fontWeight: 600,
                color: '#334155',
                userSelect: 'none',
              }}
              onClick={() => {
                if (allQueueSelected) setSelectedQueueItemIds(new Set())
                else setSelectedQueueItemIds(new Set(allQueueItems.map((i) => i.id)))
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  border: allQueueSelected ? '1.5px solid #00C4C4' : '1.5px solid #cbd5e1',
                  background: allQueueSelected ? '#00C4C4' : '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
              >
                {allQueueSelected && <Check size={11} strokeWidth={3} color="#ffffff" />}
              </div>
              Select all items to assign
            </label>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                color: '#00a0a0',
                background: 'rgba(0,196,196,0.1)',
                padding: '2px 8px',
                borderRadius: 12,
              }}
            >
              {selectedQueueItemIds.size} of {allQueueItems.length} selected
            </span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 340, overflowY: 'auto', marginBottom: 20 }}>
          {sections.every(s => !s.items.some(i => i.inClientQueue)) ? (
            <div style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>No items in queue.</div>
          ) : sections.map((s) => {
             const queueItems = s.items.filter(i => i.inClientQueue)
             if (queueItems.length === 0) return null
             return (
               <div key={s.id} style={{ marginBottom: 12 }}>
                 <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0d212c', marginBottom: 8, display: 'flex', alignItems: 'center' }}>
                    {s.title}
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                   {queueItems.map(it => (
                     <ItemRow
                       key={it.id}
                       item={it}
                       label={it.type === 'question' ? 'Question' : 'Assumption'}
                       isSelected={selectedQueueItemIds.has(it.id)}
                       hasAnySelected={selectedQueueItemIds.size > 0}
                       showCheckboxAlways={true}
                       onToggle={() => toggleSelectItem(it.id)}
                       disableAnswer={true}
                       hideAssigneesAndQueue={true}
                       canEdit={true}
                       onDelete={() => onRemoveFromQueue(it.id)}
                     />
                   ))}
                 </div>
               </div>
             )
          })}
        </div>
        {(() => {
          const isAssignDisabled = allQueueItems.length === 0 || selectedQueueItemIds.size === 0
          return (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={onClose}
                style={{
                  padding: '12px 24px',
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
                onClick={handleSendInvite}
                disabled={isAssignDisabled}
                style={{
                  padding: '12px 28px',
                  borderRadius: 12,
                  background: isAssignDisabled ? '#cbd5e1' : '#00C4C4',
                  border: 'none',
                  color: isAssignDisabled ? '#64748b' : '#fff',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: isAssignDisabled ? 'not-allowed' : 'pointer',
                  boxShadow: isAssignDisabled ? 'none' : '0 8px 20px rgba(0,196,196,0.25)',
                  opacity: isAssignDisabled ? 0.65 : 1,
                }}
              >
                Assign
              </button>
            </div>
          )
        })()}
      </div>
    </div>
  )
}

function FeedbackModal({
  type = 'positive',
  onClose,
  onSubmit
}: {
  type?: 'positive' | 'negative'
  onClose: () => void
  onSubmit: (text: string) => void
}) {
  const [feedback, setFeedback] = useState('')
  const isPositive = type === 'positive'

  return (
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
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 24,
          padding: '32px 24px',
          width: 420,
          maxWidth: '90vw',
          position: 'relative',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        }}
      >
        <button
          onClick={onClose}
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
        <div style={{ fontSize: 20, fontWeight: 700, color: '#0d212c', marginBottom: 6 }}>
          Provide Feedback
        </div>
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
          {isPositive
            ? 'What went well with these generated items?'
            : 'How can we improve these generated items?'}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>Feedback</span>
          {!isPositive && <span style={{ color: '#ef4444', fontWeight: 700 }}>*</span>}
        </div>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder={isPositive ? 'Share your feedback...' : 'Tell us what went wrong...'}
          rows={4}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: 10,
            border: '1.5px solid #e2e8f0',
            background: '#ffffff',
            fontSize: 14,
            outline: 'none',
            color: '#0d212c',
            resize: 'vertical',
            marginBottom: 20,
            transition: 'background-color 0.15s, border-color 0.15s',
          }}
          onFocus={(e) => {
            e.currentTarget.style.backgroundColor = '#f8fafc'
            e.currentTarget.style.borderColor = '#cbd5e1'
          }}
          onBlur={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff'
            e.currentTarget.style.borderColor = '#e2e8f0'
          }}
        />
        <button
          onClick={() => onSubmit(feedback)}
          disabled={!isPositive && !feedback.trim()}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 10,
            background: (isPositive || feedback.trim()) ? '#00C4C4' : '#f1f5f9',
            color: (isPositive || feedback.trim()) ? '#fff' : '#94a3b8',
            border: 'none',
            fontSize: 14,
            fontWeight: 700,
            cursor: (isPositive || feedback.trim()) ? 'pointer' : 'not-allowed',
            transition: 'all 0.15s',
            boxShadow: (isPositive || feedback.trim()) ? '0 2px 8px rgba(0,196,196,0.25)' : 'none',
          }}
        >
          Submit Feedback
        </button>
      </div>
    </div>
  )
}
