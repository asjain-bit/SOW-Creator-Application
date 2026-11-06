'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  Bot,
  CheckCircle2,
  ClipboardList,
  FileSearch,
  FileText,
  Layers,
  ListChecks,
  PackageCheck,
  PenLine,
  ShieldCheck,
  Clock,
  AlertTriangle,
} from 'lucide-react'

/** The five major steps; the detail panel on the right changes with the active step */
export const PREP_STEPS = [
  { label: 'Read documents', hint: 'Extracting text and structure', icon: FileSearch, ms: 2800, took: '8 s' },
  { label: 'Identify requirements', hint: 'Finding scope, commitments and outcomes', icon: ListChecks, ms: 3200, took: '37 s' },
  { label: 'Draft the SOW', hint: 'Writing every section with its own agent', icon: PenLine, ms: 8200, took: '2 min 22 s' },
  { label: 'Check source support', hint: 'Linking each statement back to your documents', icon: ShieldCheck, ms: 3400, took: '21 s' },
  { label: 'Prepare draft', hint: 'Final checks before opening', icon: PackageCheck, ms: 2600, took: '4 s' },
] as const

const TOTAL_MS = PREP_STEPS.reduce((n, s) => n + s.ms, 0)

/** Sections written by the core drafting agents */
const CORE_SECTIONS = [
  'Background',
  'Executive Summary',
  'Objectives',
  'Scope of Work',
  'Out of Scope',
  'Requirements',
  'Approach & Methodology',
  'Roles & Responsibilities',
  'Deliverables',
  'Timeline & Milestones',
  'Commercials',
  'Assumptions',
]

/** Optional sections: each is written by one agent, and the card shows the scope that agent is working on */
const OPTIONAL_SECTIONS = [
  { scope: 'Risks & Mitigations', subs: 2, agent: 'Knowledge & Research Agent' },
  { scope: 'Security', subs: 3, agent: 'SoW Domain Specialist' },
  { scope: 'Architecture', subs: 2, agent: 'SoW Drafting Agent' },
  { scope: 'Acceptance Criteria', subs: 1, agent: 'Quality Gate Agent' },
  { scope: 'Change Management', subs: 2, agent: 'Change Impact Agent' },
  { scope: 'Support & Handover', subs: 1, agent: 'Questionnaire & Section Design Agent' },
]

const TOTAL_PILLS = CORE_SECTIONS.length + OPTIONAL_SECTIONS.length

export interface PreparationStats {
  /** Open review items in the draft and how many of them are missing-information tasks */
  reviewItems?: number
  missingInfo?: number
  /** Risk suggestions waiting in the Risks tab */
  riskSuggestions?: number
}

/**
 * Shown below the tab strip while a newly created SOW is being prepared.
 * Runs the five steps, then shows the draft summary; onDone is called when the user clicks "Open draft".
 */
export function SOWPreparingAnimation({
  fileNames = [],
  onDone,
  onCancel,
  stats,
}: {
  fileNames?: string[]
  onDone?: () => void
  /** Leaves without opening the draft */
  onCancel?: () => void
  stats?: PreparationStats
}) {
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    startRef.current = Date.now()
    const id = setInterval(() => {
      const ms = Date.now() - (startRef.current ?? Date.now())
      setElapsed(Math.min(ms, TOTAL_MS))
      if (ms >= TOTAL_MS) clearInterval(id)
    }, 100)
    return () => clearInterval(id)
  }, [])

  // Which step is running and how far through it we are
  let acc = 0
  let active = PREP_STEPS.length - 1
  let stepProgress = 1
  for (let i = 0; i < PREP_STEPS.length; i++) {
    if (elapsed < acc + PREP_STEPS[i].ms) {
      active = i
      stepProgress = (elapsed - acc) / PREP_STEPS[i].ms
      break
    }
    acc += PREP_STEPS[i].ms
  }
  const finished = elapsed >= TOTAL_MS
  const pct = Math.round((elapsed / TOTAL_MS) * 100)

  const reviewItems = stats?.reviewItems ?? 28
  const missingInfo = stats?.missingInfo ?? 12
  const riskSuggestions = stats?.riskSuggestions ?? 7

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={finished ? 'Your draft is ready to review' : 'Preparing your SOW draft'}
      style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        display: 'flex',
        justifyContent: 'center',
        padding: '32px 24px',
        background: 'linear-gradient(180deg, #f8fcfc 0%, #f4f9f9 100%)',
      }}
    >
      <style>{`
        @keyframes sowp-ring{0%{transform:scale(.72);opacity:.55}100%{transform:scale(1.25);opacity:0}}
        @keyframes sowp-scan{0%{transform:translateY(0);opacity:0}12%{opacity:1}88%{opacity:1}100%{transform:translateY(84px);opacity:0}}
        @keyframes sowp-line{0%{transform:scaleX(0);opacity:.2}45%{transform:scaleX(1);opacity:1}100%{transform:scaleX(1);opacity:1}}
        @keyframes sowp-spin{to{transform:rotate(360deg)}}
        @keyframes sowp-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes sowp-pop{0%{transform:scale(.6);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
        @keyframes sowp-sheen{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
        @keyframes sowp-pulse{0%,100%{opacity:.35;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}
        @keyframes sowp-glow{0%,100%{box-shadow:0 0 0 0 rgba(0,196,196,0)}50%{box-shadow:0 0 0 4px rgba(0,196,196,0.14)}}
        @media (prefers-reduced-motion: reduce){
          .sowp-anim,.sowp-anim *{animation-duration:0.01ms !important;animation-iteration-count:1 !important}
        }
      `}</style>

      {finished ? (
        <div className="sowp-anim" style={{ width: '100%', maxWidth: 1040, alignSelf: 'flex-start' }}>
          <Summary
            reviewItems={reviewItems}
            missingInfo={missingInfo}
            riskSuggestions={riskSuggestions}
            fileCount={Math.max(1, fileNames.length)}
            onOpen={() => onDone?.()}
            onCancel={onCancel}
          />
        </div>
      ) : (
        <div className="sowp-anim" style={{ width: '100%', maxWidth: 740, display: 'flex', flexDirection: 'column', alignItems: 'center', margin: 'auto 0' }}>
          {/* Illustration */}
          <div style={{ position: 'relative', width: 132, height: 132, marginBottom: 22 }}>
            {[0, 1].map((i) => (
              <span
                key={i}
                style={{
                  position: 'absolute',
                  inset: 8,
                  borderRadius: '50%',
                  border: '1.5px solid rgba(0,196,196,0.35)',
                  animation: 'sowp-ring 2.8s cubic-bezier(.22,.61,.36,1) infinite',
                  animationDelay: `${i * 1.4}s`,
                }}
              />
            ))}
            <span
              style={{
                position: 'absolute',
                inset: 22,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,196,196,0.16) 0%, rgba(0,196,196,0) 70%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: 62,
                height: 80,
                marginLeft: -31,
                marginTop: -40,
                borderRadius: 10,
                background: '#ffffff',
                border: '1.5px solid rgba(0,196,196,0.55)',
                boxShadow: '0 8px 22px rgba(0,160,160,0.14)',
                overflow: 'hidden',
                padding: '12px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: 7,
              }}
            >
              {[70, 100, 86, 100, 58].map((w, i) => (
                <span
                  key={i}
                  style={{
                    display: 'block',
                    height: 4,
                    width: `${w}%`,
                    borderRadius: 2,
                    background: i === 0 ? 'rgba(0,196,196,0.55)' : 'rgba(0,196,196,0.22)',
                    transformOrigin: 'left center',
                    animation: 'sowp-line 3s ease-in-out infinite',
                    animationDelay: `${i * 0.25}s`,
                  }}
                />
              ))}
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  height: 14,
                  background: 'linear-gradient(180deg, rgba(0,196,196,0) 0%, rgba(0,196,196,0.28) 100%)',
                  borderBottom: '1.5px solid rgba(0,196,196,0.75)',
                  animation: 'sowp-scan 2.4s ease-in-out infinite',
                }}
              />
            </div>
          </div>

          <h2 style={{ fontSize: 21, fontWeight: 700, color: '#0d212c', margin: 0, textAlign: 'center' }}>
            Preparing your SOW draft
          </h2>
          <div style={{ height: 18 }} />

          {/* Progress */}
          <div style={{ width: '100%', maxWidth: 520, marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 7 }}>
              <span>{PREP_STEPS[active].label}</span>
              <span style={{ fontVariantNumeric: 'tabular-nums', color: '#00a0a0', fontWeight: 600 }}>{pct}%</span>
            </div>
            <div style={{ position: 'relative', height: 6, borderRadius: 999, background: '#e2f1f1', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${pct}%`,
                  borderRadius: 999,
                  background: 'linear-gradient(90deg, #00C4C4, #5eead4)',
                  transition: 'width 0.5s cubic-bezier(.22,.61,.36,1)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)',
                    animation: 'sowp-sheen 1.6s ease-in-out infinite',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Steps: the active step opens up to show its details */}
          <div
            style={{
              width: '100%',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '6px 0',
              boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
            }}
          >
            {PREP_STEPS.map((step, i) => {
              const done = i < active
              const current = i === active
              return (
                <div
                  key={step.label}
                  style={{
                    padding: '10px 18px',
                    opacity: done || current ? 1 : 0.45,
                    transition: 'opacity 0.4s ease',
                    background: current ? 'rgba(0,196,196,0.05)' : 'transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ width: 22, height: 22, flexShrink: 0, position: 'relative' }}>
                      {done ? (
                        <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#00C4C4', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'sowp-pop 0.3s ease both' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12l5 5L20 7" />
                          </svg>
                        </span>
                      ) : current ? (
                        <span style={{ display: 'block', width: 22, height: 22, borderRadius: '50%', border: '2.5px solid rgba(0,196,196,0.22)', borderTopColor: '#00C4C4', animation: 'sowp-spin 0.9s linear infinite', boxSizing: 'border-box' }} />
                      ) : (
                        <span style={{ display: 'block', width: 22, height: 22, borderRadius: '50%', border: '2px solid #e2e8f0', boxSizing: 'border-box' }} />
                      )}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: current ? 600 : 500, color: '#0d212c' }}>{step.label}</div>
                      {done && <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>{step.took}</div>}
                    </div>
                    <span style={{ fontSize: 12, color: done ? '#00a0a0' : '#94a3b8', fontWeight: 500 }}>
                      {done ? 'Done' : current ? 'In progress' : 'Up next'}
                    </span>
                  </div>
                  {current && (
                    <div key={active} style={{ margin: '12px 0 4px 34px', animation: 'sowp-in 0.35s ease both' }}>
                      {active === 0 && <ReadDocuments fileNames={fileNames} progress={stepProgress} />}
                      {active === 1 && <IdentifyRequirements progress={stepProgress} />}
                      {active === 2 && <DraftSections progress={stepProgress} />}
                      {active === 3 && <CheckSupport progress={stepProgress} />}
                      {active === 4 && <PrepareDraft progress={stepProgress} />}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Step details ─────────────────────────────────────────────────────────── */

const panel: React.CSSProperties = {}

function CheckRow({ done, label, sub }: { done: boolean; label: string; sub?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0' }}>
      <span style={{ marginTop: 1, flexShrink: 0, display: 'inline-flex' }}>
        {done ? (
          <CheckCircle2 size={17} fill="#4aa6a0" stroke="#ffffff" />
        ) : (
          <span style={{ width: 17, height: 17, borderRadius: '50%', border: '2px solid #cbd5e1', boxSizing: 'border-box' }} />
        )}
      </span>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: done ? '#0d212c' : '#94a3b8' }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  )
}

function ReadDocuments({ fileNames, progress }: { fileNames: string[]; progress: number }) {
  const files = fileNames.length > 0 ? fileNames : ['Uploaded document']
  return (
    <div style={panel}>
      {files.map((name, i) => {
        const done = progress > (i + 1) / (files.length + 0.5)
        return <CheckRow key={name + i} done={done} label={name} />
      })}
    </div>
  )
}

function Counter({ icon, label, value, target, active }: { icon: React.ReactNode; label: string; value: number; target: number; active: boolean }) {
  return (
    <div style={{ flex: '1 1 120px', background: '#f8fcfc', border: '1px solid #e2ecec', borderRadius: 14, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#00a0a0', marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#0d212c', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{active ? value : target}</div>
      <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{label}</div>
    </div>
  )
}

function IdentifyRequirements({ progress }: { progress: number }) {
  const n = (target: number) => Math.round(target * Math.min(1, progress * 1.15))
  return (
    <div style={panel}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Counter icon={<ListChecks size={18} />} label="Requirements extracted" value={n(116)} target={116} active />
        <Counter icon={<Layers size={18} />} label="Scope items" value={n(24)} target={24} active />
        <Counter icon={<ClipboardList size={18} />} label="Commitments" value={n(18)} target={18} active />
        <Counter icon={<AlertTriangle size={18} />} label="Conflicts and gaps" value={n(12)} target={12} active />
      </div>
    </div>
  )
}

/** Progress of one section (0–1): sections start together and finish one after another */
function sectionProgress(i: number, progress: number) {
  const start = i * 0.028
  const end = 0.4 + i * 0.03
  return Math.max(0, Math.min(1, (progress - start) / (end - start)))
}

function DraftSections({ progress }: { progress: number }) {
  const all = Array.from({ length: TOTAL_PILLS }, (_, i) => sectionProgress(i, progress))
  const doneCount = all.filter((c) => c >= 1).length
  return (
    <div>
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10, fontVariantNumeric: 'tabular-nums' }}>
        {doneCount} of {TOTAL_PILLS} sections
      </div>
      {/* Each section is a chip that fills from left to right while it is written */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {CORE_SECTIONS.map((name, i) => {
          const c = all[i]
          return (
            <span key={name} style={{ position: 'relative', overflow: 'hidden', display: 'inline-flex', alignItems: 'center', gap: 6, height: 30, padding: '0 12px', borderRadius: 999, background: '#f1f5f9', fontSize: 12.5, fontWeight: 600, color: c > 0 ? '#0d212c' : '#94a3b8' }}>
              <span style={{ position: 'absolute', inset: 0, width: `${c * 100}%`, background: c >= 1 ? 'rgba(0,196,196,0.18)' : 'rgba(0,196,196,0.28)', transition: 'width 0.25s linear' }} />
              <span style={{ position: 'relative' }}>{name}</span>
              {c >= 1 && <CheckCircle2 size={13} color="#00a0a0" style={{ position: 'relative' }} />}
            </span>
          )
        })}
      </div>
      {/* Optional sections: the agent writing each one and what it covers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8, marginTop: 12 }}>
        {OPTIONAL_SECTIONS.map((o, k) => {
          const c = all[CORE_SECTIONS.length + k]
          return (
            <div key={o.scope} style={{ position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 12, background: '#f8fafc', border: '1px solid #eef2f6' }}>
              <span style={{ position: 'absolute', inset: 0, width: `${c * 100}%`, background: c >= 1 ? 'rgba(0,196,196,0.1)' : 'rgba(0,196,196,0.18)', transition: 'width 0.25s linear' }} />
              <span style={{ position: 'relative', width: 26, height: 26, borderRadius: '50%', background: '#ffffff', color: '#00a0a0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 1px 2px rgba(15,23,42,0.08)' }}>
                {c >= 1 ? <CheckCircle2 size={14} /> : <Bot size={14} />}
              </span>
              <span style={{ position: 'relative', minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#008b8b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Optional section {k + 1}</span>
                <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#0d212c' }}>{o.agent}</span>
                <span style={{ display: 'block', fontSize: 11.5, color: '#64748b' }}>{o.scope}</span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CheckSupport({ progress }: { progress: number }) {
  const claims = Math.round(66 * Math.min(1, progress * 1.1))
  return (
    <div style={panel}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 30, fontWeight: 700, color: '#0d212c', fontVariantNumeric: 'tabular-nums' }}>{claims}</span>
        <span style={{ fontSize: 13, color: '#64748b' }}>of 66 claims backed</span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: '#e2f1f1', overflow: 'hidden', marginBottom: 12 }}>
        <div style={{ height: '100%', width: `${(claims / 66) * 100}%`, background: 'linear-gradient(90deg, #00C4C4, #5eead4)', transition: 'width 0.3s ease' }} />
      </div>
      <CheckRow done={progress > 0.5} label="Citations checked" />
      <CheckRow done={progress > 0.85} label="Claims matched to requirements" />
    </div>
  )
}

function PrepareDraft({ progress }: { progress: number }) {
  return (
    <div style={panel}>
      <CheckRow done={progress > 0.3} label="Sections assembled" />
      <CheckRow done={progress > 0.6} label="Review items collected" />
      <CheckRow done={progress > 0.9} label="Planning answers filled" />
    </div>
  )
}

/* ── Summary (shown at 100%) ─────────────────────────────────────────────── */

function StatTile({ icon, value, text, sub }: { icon: React.ReactNode; value: string; text: string; sub: string }) {
  return (
    <div style={{ flex: '1 1 220px', display: 'flex', alignItems: 'center', gap: 14, background: '#ffffff', border: '1px solid #e2ecec', borderRadius: 16, padding: '14px 18px', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
      <span style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(0,196,196,0.12)', color: '#00a0a0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 19, fontWeight: 600, color: '#0d212c', lineHeight: 1.1 }}>
          {value} <span style={{ fontSize: 11.5, fontWeight: 500, color: '#475569' }}>{text}</span>
        </div>
        <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>{sub}</div>
      </div>
    </div>
  )
}

function QualityGroup({ icon, title, rows }: { icon: React.ReactNode; title: string; rows: [string, string][] }) {
  return (
    <div style={{ flex: '1 1 260px', background: '#f8fcfc', border: '1px solid #e2ecec', borderRadius: 14, padding: '14px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 700, color: '#0d212c', marginBottom: 6 }}>
        <span style={{ color: '#00a0a0', display: 'inline-flex' }}>{icon}</span>
        {title}
      </div>
      {rows.map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 14, padding: '7px 0', borderTop: '1px solid #e9f1f1', fontSize: 12.5 }}>
          <span style={{ color: '#64748b' }}>{k}</span>
          <span style={{ color: '#0d212c', fontWeight: 600, textAlign: 'right' }}>{v}</span>
        </div>
      ))}
    </div>
  )
}

function Summary({ reviewItems, missingInfo, fileCount, onOpen, onCancel }: { reviewItems: number; missingInfo: number; riskSuggestions: number; fileCount: number; onOpen: () => void; onCancel?: () => void }) {
  return (
    <div style={{ animation: 'sowp-in 0.45s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
        <span style={{ display: 'inline-flex', flexShrink: 0, animation: 'sowp-pop 0.5s ease both' }}>
          <CheckCircle2 size={44} fill="#16a34a" stroke="#ffffff" strokeWidth={2.2} />
        </span>
        <div>
          <div style={{ fontSize: 23, fontWeight: 700, color: '#0d212c' }}>Your draft is ready to review</div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>Nothing is approved yet.</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 16 }}>
        <StatTile icon={<ClipboardList size={19} />} value={String(reviewItems)} text="items to review" sub={`${missingInfo} are missing information`} />
        <StatTile icon={<ShieldCheck size={19} />} value="66 of 66" text="claims" sub="Backed by a cited page" />
        <StatTile icon={<FileText size={19} />} value={`${fileCount} source file${fileCount === 1 ? '' : 's'}`} text="" sub="7 pages available" />
      </div>

      <div style={{ background: '#ffffff', border: '1px solid #e2ecec', borderRadius: 18, padding: '18px 20px', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#0d212c', marginBottom: 12 }}>Quality summary</div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <QualityGroup
            icon={<ShieldCheck size={16} />}
            title="Claims backed by sources"
            rows={[
              ['Backed by a cited page', '66 of 66'],
              ['Unsure · not backed', '0 · 0'],
              ['Citations to a real place', '66'],
            ]}
          />
          <QualityGroup
            icon={<Layers size={16} />}
            title="Source coverage"
            rows={[
              ['Source pages readable', 'All 7'],
              ['Requirements extracted', '116'],
              ['Claims matched to them', '66'],
            ]}
          />
          <QualityGroup
            icon={<Clock size={16} />}
            title="Time taken"
            rows={[
              ['Writing the draft', '2 min 22 s'],
              ['Checking the claims', '21 s'],
            ]}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10, marginTop: 18 }}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{ height: 40, padding: '0 22px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#ffffff', color: '#0d212c', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'background 0.18s ease' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={onOpen}
          style={{ height: 40, padding: '0 22px', borderRadius: 12, border: 'none', background: '#00C4C4', color: '#ffffff', fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 3px 10px rgba(0,196,196,0.3)', transition: 'background 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#00b3b3'
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,196,196,0.38)'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#00C4C4'
            e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,196,196,0.3)'
            e.currentTarget.style.transform = 'none'
          }}
        >
          Open draft
        </button>
      </div>
    </div>
  )
}
