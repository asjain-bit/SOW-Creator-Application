'use client'

import React from 'react'
import {
  FileText,
  Clock,
  User,
  CheckCircle2,
  Layers,
  Sparkles,
  Users,
  UploadCloud,
} from 'lucide-react'

export interface AuditEvent {
  id: string
  timestamp: string
  action: string
  description: string
  actor: string
  icon: 'upload' | 'analysis' | 'form' | 'structure' | 'reviewers' | 'draft'
}

const MOCK_AUDIT_LOGS: AuditEvent[] = [
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

export interface AuditLogViewProps {
  onBackToDashboard?: () => void
}

export function AuditLogView({ onBackToDashboard: _onBack }: AuditLogViewProps) {
  const renderIcon = (icon: AuditEvent['icon']) => {
    const iconProps = { size: 16, color: '#00a0a0', strokeWidth: 2 }
    switch (icon) {
      case 'upload':
        return <UploadCloud {...iconProps} />
      case 'analysis':
        return <Sparkles {...iconProps} />
      case 'form':
        return <CheckCircle2 {...iconProps} />
      case 'structure':
        return <Layers {...iconProps} />
      case 'reviewers':
        return <Users {...iconProps} />
      case 'draft':
      default:
        return <FileText {...iconProps} />
    }
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ padding: '12px 8px' }}>
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
                  background: 'rgba(0,196,196,0.10)',
                  border: '1.5px solid rgba(0,196,196,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  zIndex: 1,
                }}
              >
                {renderIcon(item.icon)}
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
