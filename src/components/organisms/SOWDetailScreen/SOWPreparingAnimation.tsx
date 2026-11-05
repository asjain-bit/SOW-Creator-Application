'use client'

import React, { useEffect, useState } from 'react'

export const PREP_STEPS = [
  { label: 'Reading documents', hint: 'Extracting text and structure' },
  { label: 'Identifying requirements', hint: 'Finding scope, commitments and outcomes' },
  { label: 'Drafting the SOW', hint: 'Writing each section from the template' },
  { label: 'Checking source support', hint: 'Linking statements back to your documents' },
  { label: 'Preparing the draft', hint: 'Final checks before opening' },
]

const STEP_MS = 1800

/**
 * Shown below the tab strip while a newly created SOW is being prepared.
 * Calls onDone once every step has finished.
 */
export function SOWPreparingAnimation({
  fileNames = [],
  onDone,
}: {
  fileNames?: string[]
  onDone?: () => void
}) {
  const [elapsed, setElapsed] = useState(0)
  const total = PREP_STEPS.length * STEP_MS

  useEffect(() => {
    const start = Date.now()
    let finished = false
    const id = setInterval(() => {
      const ms = Date.now() - start
      setElapsed(Math.min(ms, total))
      if (ms >= total && !finished) {
        finished = true
        clearInterval(id)
        onDone?.()
      }
    }, 100)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const active = Math.min(Math.floor(elapsed / STEP_MS), PREP_STEPS.length - 1)
  const finishedAll = elapsed >= total
  const pct = Math.round((elapsed / total) * 100)

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Preparing your SOW draft"
      style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        display: 'flex',
        alignItems: 'center',
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
        @keyframes sowp-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes sowp-sheen{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
        @media (prefers-reduced-motion: reduce){
          .sowp-anim,.sowp-anim *{animation-duration:0.01ms !important;animation-iteration-count:1 !important}
        }
      `}</style>

      <div className="sowp-anim" style={{ width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
        <p style={{ fontSize: 13.5, color: '#64748b', margin: '8px 0 20px', lineHeight: 1.6, textAlign: 'center', maxWidth: 400 }}>
          You can review the draft and resolve open questions as soon as it is ready.
        </p>

        {/* Progress */}
        <div style={{ width: '100%', marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 7 }}>
            <span>{finishedAll ? 'Almost there…' : PREP_STEPS[active].hint}</span>
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

        {/* Steps */}
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
            const done = finishedAll || i < active
            const current = !finishedAll && i === active
            return (
              <div
                key={step.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 18px',
                  opacity: done || current ? 1 : 0.45,
                  transition: 'opacity 0.4s ease',
                  background: current ? 'rgba(0,196,196,0.05)' : 'transparent',
                }}
              >
                <span style={{ width: 22, height: 22, flexShrink: 0, position: 'relative' }}>
                  {done ? (
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: '#00C4C4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'sowp-in 0.3s ease both',
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                    </span>
                  ) : current ? (
                    <span
                      style={{
                        display: 'block',
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        border: '2.5px solid rgba(0,196,196,0.22)',
                        borderTopColor: '#00C4C4',
                        animation: 'sowp-spin 0.9s linear infinite',
                        boxSizing: 'border-box',
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        display: 'block',
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        border: '2px solid #e2e8f0',
                        boxSizing: 'border-box',
                      }}
                    />
                  )}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: current ? 600 : 500, color: '#0d212c' }}>{step.label}</div>
                  {i === 0 && fileNames.length > 0 && (current || done) && (
                    <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {fileNames.length} {fileNames.length === 1 ? 'file' : 'files'}: {fileNames.join(', ')}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 12, color: done ? '#00a0a0' : '#94a3b8', fontWeight: 500 }}>
                  {done ? 'Done' : current ? 'In progress' : 'Up next'}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
