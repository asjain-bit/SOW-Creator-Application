'use client'

import React from 'react'
import { createPortal } from 'react-dom'
import {
  FileText,
  FileSearch,
  Clock,
  User,
  CircleCheck,
  GitBranch,
  Sparkles,
  TriangleAlert,
  Users,
  UploadCloud,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/** Event category used to colour the event icon and its container */
export type AuditCategory = 'critical' | 'dependency' | 'key-action' | 'approval' | 'information' | 'general'

/** Category → icon colour, container background and border (add a row to support a new category) */
export const AUDIT_CATEGORY_STYLES: Record<
  AuditCategory,
  { label: string; icon: LucideIcon; color: string; background: string; border: string }
> = {
  critical: { label: 'Critical / Risk', icon: TriangleAlert, color: '#DC2626', background: '#FEF2F2', border: '#FECACA' },
  dependency: { label: 'Dependency', icon: GitBranch, color: '#7C3AED', background: '#F5F3FF', border: '#DDD6FE' },
  'key-action': { label: 'Agent Action', icon: FileText, color: '#D97706', background: '#FFFBEB', border: '#FDE68A' },
  approval: { label: 'Approval / Sign-off', icon: CircleCheck, color: '#16A34A', background: '#F0FDF4', border: '#BBF7D0' },
  information: { label: 'User Action', icon: FileSearch, color: '#00C4CB', background: 'rgba(0,196,203,0.08)', border: 'rgba(0,196,203,0.3)' },
  general: { label: 'General', icon: FileText, color: '#00a0a0', background: 'rgba(0,196,196,0.10)', border: 'rgba(0,196,196,0.3)' },
}

const LEGEND_CATEGORIES: AuditCategory[] = ['critical', 'key-action', 'approval', 'information']

/** Category used for each existing event type */
const CATEGORY_BY_ICON: Record<AuditEvent['icon'], AuditCategory> = {
  draft: 'key-action',
  form: 'approval',
  structure: 'information',
  upload: 'information',
  analysis: 'dependency',
  conflict: 'critical',
  dependency: 'dependency',
  reviewers: 'general',
}

export interface AuditEvent {
  id: string
  timestamp: string
  action: string
  description: string
  actor: string
  icon: 'upload' | 'analysis' | 'form' | 'structure' | 'reviewers' | 'draft' | 'conflict' | 'dependency'
  /** Optional; defaults from the icon type */
  category?: AuditCategory
}

export let MOCK_AUDIT_LOGS: AuditEvent[] = [
  {
    id: 'AUD-108',
    timestamp: '23 Sept 2026, 06:50 PM',
    action: 'Content Conflict Detected',
    description: '2 inconsistencies found between the RFP and Enterprise Architecture Specs.',
    actor: 'AI Content Analysis Agent (v2.1)',
    icon: 'conflict',
  },
  {
    id: 'AUD-107',
    timestamp: '23 Sept 2026, 06:46 PM',
    action: 'Dependent Questions Generated',
    description: '8 follow-up questions created from 3 extracted dependencies.',
    actor: 'AI Question Generator (v1.8)',
    icon: 'dependency',
  },
  {
    id: 'AUD-106',
    timestamp: '23 Sept 2026, 06:42 PM',
    action: '20-Section SOW Draft Generated (v1.0)',
    description:
      'Synthesized comprehensive 20-section legal and operational SOW document based on approved structure and questionnaire parameters.',
    actor: 'AI Drafting Agent (Core v2.4)',
    icon: 'draft',
  },
  {
    id: 'AUD-105',
    timestamp: '23 Sept 2026, 06:35 PM',
    action: 'Reviewers Assigned to SOW Structure',
    description:
      'Assigned cross-functional reviewers (Legal, Security, Engineering, and Finance) to specific sections and deliverables.',
    actor: 'Ashika Jain (PMO Lead)',
    icon: 'reviewers',
  },
  {
    id: 'AUD-104',
    timestamp: '23 Sept 2026, 06:28 PM',
    action: 'SOW Structure & Work Breakdown Generated',
    description:
      'Generated 6 core structural sections with work breakdowns, deliverables, milestone requirements, and acceptance criteria.',
    actor: 'AI Structure Engine',
    icon: 'structure',
  },
  {
    id: 'AUD-103',
    timestamp: '23 Sept 2026, 06:20 PM',
    action: 'Questionnaire Form Generated & Verified',
    description:
      'PMO verified and finalized the questionnaire responses based on extracted commitments to prepare structure generation.',
    actor: 'Ashika Jain (PMO Lead)',
    icon: 'form',
  },
  {
    id: 'AUD-102',
    timestamp: '23 Sept 2026, 06:18 PM',
    action: 'Intake Agent Analyzed Documents & Commitments',
    description:
      'Analyzed attached documents and extracted 6 commitments, performance parameters, milestone targets, and key scope requirements.',
    actor: 'AI Intake Agent',
    icon: 'analysis',
  },
  {
    id: 'AUD-101',
    timestamp: '23 Sept 2026, 06:15 PM',
    action: 'SOW Project Initialized & Documents Uploaded',
    description:
      'Created new SOW container and attached source documents (Meridian_Healthcare_RFP.pdf & Vendor_MSA_Agreement.docx).',
    actor: 'Ashika Jain (PMO Lead)',
    icon: 'upload',
  },
]

let globalLogId = 109

export function addGlobalAuditLog(action: string, description: string, actor: string, icon: AuditEvent['icon'] = 'structure', category?: AuditCategory) {
  const newLog: AuditEvent = {
    id: `AUD-${globalLogId++}`,
    timestamp: new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).replace(',', ''),
    action,
    description,
    actor,
    icon,
    ...(category ? { category } : {}),
  }
  MOCK_AUDIT_LOGS = [newLog, ...MOCK_AUDIT_LOGS]
}

export interface AuditLogViewProps {
  onBackToDashboard?: () => void
  notificationButton?: React.ReactNode
  /** When set, the legend is shown there (e.g. the tab row of the SOW screen) instead of beside the title */
  legendSlot?: HTMLElement | null
}

export function AuditLogView({ onBackToDashboard: _onBack, notificationButton, legendSlot }: AuditLogViewProps) {
  const renderIcon = (item: AuditEvent) => {
    const category = item.category ?? CATEGORY_BY_ICON[item.icon] ?? 'general'
    const style = AUDIT_CATEGORY_STYLES[category]
    const iconProps = { size: 16, color: style.color, strokeWidth: 2 }
    // Keep the existing icon for general / upload / analysis events, otherwise use the category icon
    if (category === 'general' || item.icon === 'upload' || item.icon === 'analysis') {
      const Existing = item.icon === 'upload' ? UploadCloud : item.icon === 'analysis' ? Sparkles : item.icon === 'reviewers' ? Users : FileText
      return <Existing {...iconProps} />
    }
    const Icon = style.icon
    return <Icon {...iconProps} />
  }
  const containerFor = (item: AuditEvent) => AUDIT_CATEGORY_STYLES[item.category ?? CATEGORY_BY_ICON[item.icon] ?? 'general']

  const legend = (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 8, marginLeft: 0 }}>
          {LEGEND_CATEGORIES.map((c) => (
            <span
              key={c}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 8,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                fontSize: 12,
                color: '#475569',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: AUDIT_CATEGORY_STYLES[c].color }} />
              {AUDIT_CATEGORY_STYLES[c].label}
            </span>
          ))}
          {notificationButton}
        </div>
  )

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ padding: 0 }}>
      {legendSlot && createPortal(legend, legendSlot)}
      {/* ── Page Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          marginBottom: 16,
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#0d212c', margin: 0, lineHeight: 1.15 }}>
          Audit Log
        </h1>
        {legendSlot ? null : legend}
      </div>

      {/* ── Main Timeline List View (Directly rendered without white section wrapper) ── */}
      <div style={{ position: 'relative' }}>
        {MOCK_AUDIT_LOGS.map((item, idx) => {
          const isLast = idx === MOCK_AUDIT_LOGS.length - 1
          return (
            <div
              key={item.id}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
                paddingBottom: isLast ? 8 : 26,
              }}
            >
              {/* Vertical connecting line */}
              {!isLast && (
                <div
                  style={{
                    position: 'absolute',
                    left: 17,
                    top: 36,
                    bottom: 0,
                    width: 2,
                    background: 'rgba(0,196,196,0.18)',
                  }}
                />
              )}

              {/* Circular Node Icon */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: containerFor(item).background,
                  border: `1.5px solid ${containerFor(item).border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  zIndex: 1,
                }}
              >
                {renderIcon(item)}
              </div>

              {/* Body Content */}
              <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                {/* Top line: Action Title (reduced font weight by 1 unit: 600) */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#0d212c',
                    }}
                  >
                    {item.action}
                  </span>
                </div>

                {/* Middle line: Description */}
                <div
                  style={{
                    fontSize: 13,
                    color: '#475569',
                    marginTop: 4,
                    lineHeight: 1.5,
                  }}
                >
                  {item.description}
                </div>

                {/* Bottom line: Actor */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 12,
                    color: '#64748b',
                    marginTop: 6,
                  }}
                >
                  <User size={12} style={{ color: '#94a3b8' }} />
                  <span>
                    Actor:{' '}
                    <strong style={{ color: '#334155', fontWeight: 600 }}>
                      {item.actor}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Timestamp on right */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 12,
                  color: '#64748b',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  paddingTop: 4,
                }}
              >
                <Clock size={13} style={{ color: '#94a3b8' }} />
                <span>{item.timestamp}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
