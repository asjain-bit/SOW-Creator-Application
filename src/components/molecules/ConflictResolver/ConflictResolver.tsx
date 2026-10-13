/**
 * @layer molecule
 * @description Asks the user a few simple questions when uploaded documents disagree
 * (conflict, discrepancy, needs review). One question at a time, plain options,
 * and the answers change the Context fields.
 * @usage <ConflictResolver isOpen questions={questions} fileNames={names} onComplete={apply} onClose={close} />
 */

'use client'

import React, { useEffect, useState } from 'react'
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Circle, CircleDot, Eye, FileText, Pencil, X } from 'lucide-react'
import type {
  ConflictResolverProps,
  DocumentQuestion,
  QuestionAnswer,
  QuestionKind,
} from './ConflictResolver.types'
import { answersToUpdates } from './ConflictResolver.utils'

const KIND_META: Record<
  QuestionKind,
  { label: string; hint: string; bg: string; fg: string; border: string; Icon: typeof AlertTriangle }
> = {
  conflict: {
    label: 'Conflict',
    hint: 'These documents give different values. Which one should we use?',
    bg: '#fffbeb',
    fg: '#92400e',
    border: '#fde68a',
    Icon: AlertTriangle,
  },
  discrepancy: {
    label: 'Discrepancy',
    hint: 'Both may be true, but this field holds one value. Pick one, or keep both.',
    bg: '#fffbeb',
    fg: '#92400e',
    border: '#fde68a',
    Icon: AlertTriangle,
  },
  'needs-review': {
    label: 'Needs review',
    hint: 'We found this statement in your documents. Does it apply to this SOW?',
    bg: '#f8fafc',
    fg: '#475569',
    border: '#e2e8f0',
    Icon: Eye,
  },
}

const PRIMARY = '#00C4C4'

function SourceChip({ name }: { name: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        color: '#64748b',
        marginTop: 6,
      }}
    >
      <FileText size={13} color="#94a3b8" />
      {name}
    </span>
  )
}

export const ConflictResolver: React.FC<ConflictResolverProps> = ({
  isOpen,
  questions,
  fileNames,
  onComplete,
  onClose,
}) => {
  // -1 = intro, 0..n-1 = questions
  const [step, setStep] = useState(-1)
  const [answers, setAnswers] = useState<Record<string, QuestionAnswer>>({})
  const [choice, setChoice] = useState<string | null>(null)
  const [customText, setCustomText] = useState('')
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState('')

  useEffect(() => {
    if (isOpen) {
      setStep(-1)
      setAnswers({})
      setChoice(null)
      setCustomText('')
      setEditing(false)
    }
  }, [isOpen])

  const question: DocumentQuestion | undefined = step >= 0 ? questions[step] : undefined

  // Restore the saved answer when moving between questions
  useEffect(() => {
    if (!question) return
    const saved = answers[question.id]
    setEditing(false)
    setEditText(question.candidates[0]?.value ?? '')
    if (!saved) {
      setChoice(null)
      setCustomText('')
    } else if (saved.kind === 'pick') {
      setChoice(saved.candidateId)
    } else if (saved.kind === 'custom') {
      setChoice('custom')
      setCustomText(saved.value)
    } else if (saved.kind === 'both') {
      setChoice('both')
    } else if (saved.kind === 'skip') {
      setChoice('skip')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, answers])

  if (!isOpen || questions.length === 0) return null

  const total = questions.length

  const finish = (finalAnswers: Record<string, QuestionAnswer>) => {
    onComplete(answersToUpdates(questions, finalAnswers))
  }

  const handleClose = () => {
    const updates = answersToUpdates(questions, answers)
    if (updates.length > 0) onComplete(updates)
    else onClose()
  }

  const commit = (answer: QuestionAnswer) => {
    if (!question) return
    const next = { ...answers, [question.id]: answer }
    setAnswers(next)
    if (step >= total - 1) finish(next)
    else setStep(step + 1)
  }

  const canUse =
    choice !== null && (choice !== 'custom' || customText.trim().length > 0)

  const useValue = () => {
    if (!question || !canUse) return
    if (choice === 'custom') commit({ kind: 'custom', value: customText.trim() })
    else if (choice === 'both') commit({ kind: 'both' })
    else if (choice === 'skip') commit({ kind: 'skip' })
    else commit({ kind: 'pick', candidateId: choice as string })
  }

  const meta = question ? KIND_META[question.kind] : null
  const isPick = question && (question.kind === 'conflict' || question.kind === 'discrepancy')
  const useLabel =
    choice === 'skip' ? 'Skip' : choice === 'both' ? 'Keep both' : 'Use this value'

  const optionStyle = (_selected: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: '14px 16px',
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    background: '#ffffff',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    fontFamily: 'inherit',
  })

  const radio = (selected: boolean) => (
    <span style={{ display: 'flex', flexShrink: 0, marginTop: 1 }}>
      {selected ? <CircleDot size={22} strokeWidth={2.75} color={PRIMARY} /> : <Circle size={22} strokeWidth={2} color="#cbd5e1" />}
    </span>
  )

  const secondaryBtn: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 18px',
    borderRadius: 10,
    border: '1px solid #e2e8f0',
    background: '#ffffff',
    color: '#0d212c',
    fontSize: 13.5,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  }

  const primaryBtn = (enabled: boolean): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 20px',
    borderRadius: 10,
    border: 'none',
    background: enabled ? PRIMARY : '#cbd5e1',
    color: enabled ? '#ffffff' : '#64748b',
    fontSize: 13.5,
    fontWeight: 700,
    cursor: enabled ? 'pointer' : 'not-allowed',
    fontFamily: 'inherit',
  })

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Questions about your documents"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100000,
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 24,
          width: 560,
          maxWidth: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          overflow: 'hidden',
        }}
      >
        {/* ── Intro ── */}
        {step === -1 && (
          <div style={{ padding: 28, textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}
              >
                <X size={20} />
              </button>
            </div>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: '#fffbeb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <AlertTriangle size={24} color="#d97706" />
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#0d212c', marginBottom: 8 }}>
              Your documents don&apos;t fully agree
            </div>
            <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.55, marginBottom: 24 }}>
              {total} {total === 1 ? 'thing needs' : 'things need'} your input after reading{' '}
              {fileNames.length > 0 ? fileNames.slice(0, 2).join(' and ') : 'your documents'}
              {fileNames.length > 2 ? ` and ${fileNames.length - 2} more` : ''}. It only takes a minute.
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
              <button type="button" onClick={onClose} style={secondaryBtn}>
                Not now
              </button>
              <button type="button" onClick={() => setStep(0)} style={primaryBtn(true)}>
                Answer {total} {total === 1 ? 'question' : 'questions'}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── Question ── */}
        {question && meta && (
          <>
            <div style={{ padding: '24px 28px 8px', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 12px',
                    borderRadius: 20,
                    background: meta.bg,
                    color: meta.fg,
                    border: `1px solid ${meta.border}`,
                    fontSize: 12.5,
                    fontWeight: 700,
                  }}
                >
                  <meta.Icon size={14} />
                  {meta.label}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>
                    Question {step + 1} of {total}
                  </span>
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={handleClose}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}
                  >
                    <X size={20} />
                  </button>
                </span>
              </div>

              <div style={{ fontSize: 22, fontWeight: 600, color: '#0d212c', marginBottom: 6 }}>
                {question.fieldLabel}
              </div>
              <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.5, marginBottom: 18 }}>{meta.hint}</div>

              {/* conflict / discrepancy */}
              {isPick && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 12 }}>
                  {question.candidates.map((c) => (
                    <button key={c.id} type="button" onClick={() => setChoice(c.id)} style={optionStyle(choice === c.id)}>
                      {radio(choice === c.id)}
                      <span style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 14.5, fontWeight: 500, color: '#0d212c' }}>{c.value}</span>
                        <SourceChip name={c.source} />
                      </span>
                    </button>
                  ))}
                  {question.kind === 'discrepancy' && (
                    <button type="button" onClick={() => setChoice('both')} style={optionStyle(choice === 'both')}>
                      {radio(choice === 'both')}
                      <span style={{ fontSize: 14.5, fontWeight: 500, color: '#0d212c' }}>Both are correct</span>
                    </button>
                  )}
                  <div style={optionStyle(choice === 'custom')} onClick={() => setChoice('custom')} role="button">
                    {radio(choice === 'custom')}
                    <span style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 8 }}>
                      <span style={{ fontSize: 14.5, fontWeight: 500, color: '#0d212c' }}>Write my own</span>
                      {choice === 'custom' && (
                        <input
                          autoFocus
                          value={customText}
                          onChange={(e) => setCustomText(e.target.value)}
                          placeholder="Type the value to use"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            borderRadius: 8,
                            border: '1px solid #e2e8f0',
                            fontSize: 13.5,
                            outline: 'none',
                            fontFamily: 'inherit',
                            boxSizing: 'border-box',
                          }}
                        />
                      )}
                    </span>
                  </div>
                  <button type="button" onClick={() => setChoice('skip')} style={optionStyle(choice === 'skip')}>
                    {radio(choice === 'skip')}
                    <span style={{ fontSize: 14.5, fontWeight: 500, color: '#0d212c' }}>Skip for now</span>
                  </button>
                </div>
              )}

              {/* needs review */}
              {question.kind === 'needs-review' && (
                <div style={{ paddingBottom: 12 }}>
                  <textarea
                    key={editing ? 'edit' : 'view'}
                    readOnly={!editing}
                    autoFocus={editing}
                    value={editing ? editText : question.candidates[0].value}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: '1px solid #e2e8f0',
                      background: '#ffffff',
                      color: '#0d212c',
                      fontSize: 14.5,
                      fontWeight: 500,
                      lineHeight: 1.5,
                      outline: 'none',
                      resize: 'none',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                      cursor: editing ? 'text' : 'default',
                    }}
                  />
                  <SourceChip name={question.candidates[0].source} />
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: '16px 28px 22px',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {questions.map((q, i) => (
                  <span
                    key={q.id}
                    style={{
                      width: i === step ? 22 : 7,
                      height: 7,
                      borderRadius: 4,
                      background: i <= step ? PRIMARY : '#e2e8f0',
                    }}
                  />
                ))}
              </span>

              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                {step > 0 && !editing && (
                  <button type="button" onClick={() => setStep(step - 1)} style={secondaryBtn}>
                    <ArrowLeft size={15} />
                    Back
                  </button>
                )}

                {isPick && (
                  <button type="button" onClick={useValue} disabled={!canUse} style={primaryBtn(canUse)}>
                    <Check size={15} />
                    {useLabel}
                  </button>
                )}

                {question.kind === 'needs-review' && !editing && (
                  <>
                    <button type="button" onClick={() => commit({ kind: 'reject' })} style={secondaryBtn}>
                      Reject
                    </button>
                    <button type="button" onClick={() => setEditing(true)} style={secondaryBtn}>
                      <Pencil size={14} />
                      Edit
                    </button>
                    <button type="button" onClick={() => commit({ kind: 'accept' })} style={primaryBtn(true)}>
                      <Check size={15} />
                      Accept
                    </button>
                  </>
                )}

                {question.kind === 'needs-review' && editing && (
                  <>
                    <button type="button" onClick={() => setEditing(false)} style={secondaryBtn}>
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!editText.trim()}
                      onClick={() => commit({ kind: 'edit', value: editText.trim() })}
                      style={primaryBtn(!!editText.trim())}
                    >
                      <Check size={15} />
                      Save claim
                    </button>
                  </>
                )}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
