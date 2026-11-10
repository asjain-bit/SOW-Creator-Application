/**
 * CreateSOWModal — Molecule
 * Upload modal for creating a new SOW. Supports drag-and-drop and click-to-browse
 * for multiple files (PDF, DOCX, TXT, PNG, JPG, PPT/PPTX). Shows per-file upload
 * progress bars. "Create SOW" CTA is disabled until all files finish uploading.
 */

'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { CreateSOWModalProps, UploadedFile, UploadStatus } from './CreateSOWModal.types'

const ACCEPTED_TYPES: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'text/plain': 'TXT',
  'image/png': 'PNG',
  'image/jpeg': 'JPG',
  'application/vnd.ms-powerpoint': 'PPT',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
  'application/vnd.ms-excel': 'XLS',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
}

const ACCEPT_ATTR = Object.keys(ACCEPTED_TYPES).join(',')
const MAX_TOTAL_MB = 200
const PREP_STEP_MS = 2500
const PREP_STEPS = ['Read documents', 'Identify requirements', 'Draft the SOW', 'Check source support', 'Prepare draft']
const UPLOAD_DURATION_MS = 2200

function fileLabel(file: UploadedFile): string {
  return `${file.size} · ${file.type}`
}

/* ── Per-type file icons ─────────────────────────────────────────────────── */
function FileIcon({ type }: { type: string }) {
  const t = type.toUpperCase()

  if (t === 'PDF') {
    return (
      <img src="/icons/pdf-icon.png" alt="PDF" style={{ width: 36, height: 36, objectFit: 'contain' }} />
    )
  }

  if (t === 'DOC' || t === 'DOCX') {
    return (
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: '#eff6ff' }}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path
            d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
            stroke="#2563eb"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points="14 2 14 8 20 8"
            stroke="#2563eb"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="8"
            y1="13"
            x2="16"
            y2="13"
            stroke="#2563eb"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <line
            x1="8"
            y1="17"
            x2="13"
            y2="17"
            stroke="#2563eb"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </div>
    )
  }

  if (t === 'PPT' || t === 'PPTX') {
    return (
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: '#fff7ed' }}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="14" rx="2" stroke="#ea580c" strokeWidth="1.6" />
          <path
            d="M8 8h4a2 2 0 010 4H8V8z"
            stroke="#ea580c"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="8"
            y1="16"
            x2="8"
            y2="12"
            stroke="#ea580c"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </div>
    )
  }

  if (t === 'PNG' || t === 'JPG' || t === 'JPEG') {
    return (
      <img src="/icons/jpg-icon.png" alt="Image" style={{ width: 36, height: 36, objectFit: 'contain' }} />
    )
  }

  if (t === 'XLS' || t === 'XLSX') {
    return (
      <img src="/icons/xls-icon.png" alt="Excel" style={{ width: 36, height: 36, objectFit: 'contain' }} />
    )
  }

  if (t === 'TXT') {
    return (
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: '#f8fafc' }}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path
            d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
            stroke="#64748b"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points="14 2 14 8 20 8"
            stroke="#64748b"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="8"
            y1="13"
            x2="16"
            y2="13"
            stroke="#64748b"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <line
            x1="8"
            y1="17"
            x2="16"
            y2="17"
            stroke="#64748b"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <line
            x1="8"
            y1="9"
            x2="12"
            y2="9"
            stroke="#64748b"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </div>
    )
  }

  // Generic fallback
  return (
    <div
      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
      style={{ background: 'var(--bg-surface-2)' }}
    >
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--text-tertiary)"
        strokeWidth="1.6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
        />
        <polyline strokeLinecap="round" strokeLinejoin="round" points="14 2 14 8 20 8" />
      </svg>
    </div>
  )
}

/* ── Delete icon button ──────────────────────────────────────────────────── */
function DeleteButton({ onRemove, fileName }: { onRemove: () => void; fileName: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onRemove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer border-0 transition-colors"
      style={{
        background: hovered ? 'var(--status-error-bg)' : 'transparent',
        color: hovered ? 'var(--status-error-icon)' : 'var(--text-secondary)',
      }}
      aria-label={`Remove ${fileName}`}
    >
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
      </svg>
    </button>
  )
}

/* ── File row ────────────────────────────────────────────────────────────── */
function UploadFileRow({ file, onRemove }: { file: UploadedFile; onRemove: (id: string) => void }) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl border p-3 transition-colors"
      style={{
        background: 'var(--bg-modal)',
        borderColor:
          file.status === 'error' ? 'var(--status-error-border)' : 'var(--border-subtle)',
      }}
    >
      <FileIcon type={file.type} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
          {file.name}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
          {fileLabel(file)}
        </p>

        {file.status === 'uploading' && (
          <div className="mt-2">
            <div
              className="h-1 w-full rounded-full overflow-hidden"
              style={{ background: 'var(--bg-surface-2)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${file.progress}%`,
                  background:
                    'linear-gradient(90deg, var(--brand-cyan-500), var(--brand-cyan-400))',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {file.status !== 'uploading' && (
        <DeleteButton onRemove={() => onRemove(file.id)} fileName={file.name} />
      )}
    </div>
  )
}

/* ── Main modal ──────────────────────────────────────────────────────────── */
export const CreateSOWModal: React.FC<CreateSOWModalProps> = ({ isOpen, onClose, onProceed }) => {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [clientName, setClientName] = useState('')
  const [sowDeadline, setSowDeadline] = useState('')
  const [instructions, setInstructions] = useState('')
  const [phase, setPhase] = useState<'form' | 'preparing'>('form')
  const [prepMs, setPrepMs] = useState(0)
  const totalBytesRef = useRef(0)
  const bytesById = useRef<Record<string, number>>({})
  const [isDragOver, setIsDragOver] = useState(false)
  const [isDropzoneHovered, setIsDropzoneHovered] = useState(false)
  const [sizeError, setSizeError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const allUploaded = files.length > 0 && files.every((f) => f.status === 'complete')
  const anyUploading = files.some((f) => f.status === 'uploading')

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setFiles([])
      setClientName('')
      setSowDeadline('')
      setInstructions('')
      setPhase('form')
      setPrepMs(0)
      totalBytesRef.current = 0
      bytesById.current = {}
      setIsDragOver(false)
      setIsDropzoneHovered(false)
      setSizeError('')
    }
  }, [isOpen])

  // Escape to close
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Auto-clear size error after 4s
  useEffect(() => {
    if (!sizeError) return
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
    errorTimerRef.current = setTimeout(() => setSizeError(''), 4000)
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
    }
  }, [sizeError])

  const simulateUpload = useCallback((newFile: UploadedFile) => {
    const TICK_MS = 80
    const ticks = Math.floor(UPLOAD_DURATION_MS / TICK_MS)
    let tick = 0
    const interval = setInterval(() => {
      tick++
      const progress = Math.min(Math.round((tick / ticks) * 100), 99)
      setFiles((prev) => prev.map((f) => (f.id === newFile.id ? { ...f, progress } : f)))
      if (tick >= ticks) {
        clearInterval(interval)
        setFiles((prev) =>
          prev.map((f) => (f.id === newFile.id ? { ...f, progress: 100, status: 'complete' } : f))
        )
      }
    }, TICK_MS)
  }, [])

  const addFiles = useCallback(
    (rawFiles: File[]) => {
      setSizeError('')
      const supported = rawFiles.filter((f) => ACCEPTED_TYPES[f.type])
      const valid: File[] = []
      let running = totalBytesRef.current
      for (const f of supported) {
        if (running + f.size <= MAX_TOTAL_MB * 1024 * 1024) {
          valid.push(f)
          running += f.size
        }
      }
      if (valid.length < supported.length) {
        setSizeError(`Files can be up to ${MAX_TOTAL_MB} MB combined.`)
      }
      const newFiles: UploadedFile[] = valid.map((f) => ({
        id: `${f.name}-${Date.now()}-${Math.random()}`,
        name: f.name,
        size:
          f.size < 1024 * 1024
            ? `${(f.size / 1024).toFixed(0)} KB`
            : `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
        type: ACCEPTED_TYPES[f.type] ?? f.name.split('.').pop()?.toUpperCase() ?? 'FILE',
        status: 'uploading' as UploadStatus,
        progress: 0,
      }))
      if (newFiles.length === 0) return
      newFiles.forEach((nf, i) => {
        bytesById.current[nf.id] = valid[i].size
        totalBytesRef.current += valid[i].size
      })
      setFiles((prev) => [...prev, ...newFiles])
      newFiles.forEach((nf) => simulateUpload(nf))
    },
    [simulateUpload]
  )

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files))
    e.target.value = ''
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }
  const handleDragLeave = (e: React.DragEvent) => {
    // only clear if leaving the dropzone itself (not a child)
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    setIsDropzoneHovered(false)
    addFiles(Array.from(e.dataTransfer.files))
  }

  const removeFile = (id: string) => {
    totalBytesRef.current -= bytesById.current[id] ?? 0
    delete bytesById.current[id]
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const INSTRUCTIONS_LIMIT = 2000
  const instructionsTooLong = instructions.length > INSTRUCTIONS_LIMIT
  const canCreate = allUploaded && !anyUploading && !!clientName.trim() && !!sowDeadline && !instructionsTooLong

  const handleProceed = () => {
    if (!canCreate) return
    // The SOW opens straight away; its detail page shows the preparing animation below the tabs
    onProceed(files, {
      clientName: clientName.trim(),
      sowDeadline: sowDeadline || '',
      tokenConsumption: 20000,
      instructions: instructions.trim(),
    })
  }

  // "Preparing your SOW draft": steps advance on a timer, then the SOW opens on its Draft tab
  const doneRef = useRef(false)
  useEffect(() => {
    if (phase !== 'preparing') return
    doneRef.current = false
    const start = Date.now()
    const id = setInterval(() => {
      const ms = Date.now() - start
      setPrepMs(ms)
      if (ms >= PREP_STEPS.length * PREP_STEP_MS && !doneRef.current) {
        doneRef.current = true
        clearInterval(id)
        onProceed(files, {
          clientName: clientName.trim(),
          sowDeadline: sowDeadline || '',
          tokenConsumption: 20000,
          instructions: instructions.trim(),
        })
      }
    }, 250)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // Dropzone is "active" when dragging over OR mouse hovering
  const dropzoneActive = isDragOver || isDropzoneHovered

  if (!isOpen) return null

  if (phase === 'preparing') {
    const step = Math.min(Math.floor(prepMs / PREP_STEP_MS), PREP_STEPS.length - 1)
    const stepSeconds = Math.floor((prepMs - step * PREP_STEP_MS) / 1000)
    return (
      <div
        className="fixed inset-0 z-50 overflow-y-auto"
        style={{ background: 'linear-gradient(180deg, #f8fcfc 0%, #f1f8f8 100%)' }}
      >
        <style>{`
          @keyframes sow-prep-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
          @keyframes sow-prep-pulse{0%,100%{opacity:.25;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}
        `}</style>
        <div
          className="mx-auto flex flex-col items-center"
          style={{ maxWidth: 640, padding: '40px 24px' }}
          role="dialog"
          aria-modal="true"
          aria-label="Preparing your SOW draft"
        >
          <div style={{ position: 'relative', width: 120, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ animation: 'sow-prep-float 2.8s ease-in-out infinite' }}>
              <svg width="84" height="110" viewBox="0 0 100 130" fill="none">
                <rect x="12" y="8" width="68" height="96" rx="10" fill="rgba(0,196,196,0.08)" stroke="#00C4C4" strokeWidth="2" />
                <rect x="22" y="22" width="28" height="5" rx="2" fill="rgba(0,196,196,0.4)" />
                <rect x="22" y="32" width="48" height="12" rx="3" fill="rgba(0,196,196,0.15)" stroke="rgba(0,196,196,0.3)" strokeWidth="0.8" />
                <rect x="22" y="50" width="28" height="5" rx="2" fill="rgba(0,196,196,0.4)" />
                <rect x="22" y="60" width="48" height="12" rx="3" fill="rgba(0,196,196,0.15)" stroke="rgba(0,196,196,0.3)" strokeWidth="0.8" />
                <rect x="22" y="78" width="28" height="5" rx="2" fill="rgba(0,196,196,0.4)" />
                <rect x="22" y="88" width="48" height="12" rx="3" fill="rgba(0,196,196,0.15)" stroke="rgba(0,196,196,0.3)" strokeWidth="0.8" />
              </svg>
            </div>
            <div style={{ position: 'absolute', top: 6, right: 14, animation: 'sow-prep-pulse 1.6s ease-in-out infinite' }}>
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path d="M9 1l2 6h6l-5 3.5 2 6L9 13l-5 3.5 2-6L1 7h6z" fill="#00C4C4" opacity=".7" />
              </svg>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0d212c', margin: 0 }}>Preparing your SOW draft</h2>
            <p style={{ fontSize: 13.5, color: '#64748b', margin: '8px 0 0', lineHeight: 1.6 }}>
              You can review the draft and resolve open questions when it is ready.
            </p>
          </div>
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12.5, color: '#475569', marginBottom: 10 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a' }} />
              Live updates connected
            </span>
            <span>Elapsed: {Math.floor(prepMs / 1000)}s</span>
          </div>
          <div style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 12, background: '#ffffff' }}>
            {PREP_STEPS.map((label, i) => {
              const done = i < step
              const active = i === step
              return (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                    padding: '14px 18px',
                    borderTop: i === 0 ? 'none' : '1px solid #f1f5f9',
                    background: active ? 'rgba(0,196,196,0.06)' : '#ffffff',
                  }}
                >
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: done ? '#00C4C4' : '#ffffff',
                      border: done ? 'none' : `2px solid ${active ? '#00C4C4' : '#e2e8f0'}`,
                    }}
                  >
                    {done && (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                    )}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0d212c' }}>{label}</div>
                    {i === 0 && (
                      <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 3 }}>
                        {files.length} {files.length === 1 ? 'file' : 'files'} uploaded
                        {files.map((f) => (
                          <div key={f.id} style={{ marginTop: 3, paddingLeft: 12 }}>
                            {f.name}: {done ? 'read' : active ? 'reading' : 'waiting to be read'}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 12.5, color: '#64748b', textAlign: 'right', flexShrink: 0 }}>
                    {done ? 'Done' : active ? (<>In progress<div>{stepSeconds} s</div></>) : 'Up next'}
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 20 }}>
            <button
              type="button"
              onClick={() => {
                setPhase('form')
                setPrepMs(0)
              }}
              className="px-6 py-2.5 text-sm font-bold rounded-xl cursor-pointer"
              style={{ background: '#ffffff', border: '1px solid #e2e8f0', color: '#0d212c' }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 overflow-y-auto flex"
        style={{ background: 'linear-gradient(180deg, #f8fcfc 0%, #f1f8f8 100%)', padding: 24 }}
      >
        <div
          className="relative w-full flex flex-col m-auto rounded-2xl"
          style={{ background: 'var(--bg-modal)', maxWidth: 960, border: '1px solid #e2e8f0', boxShadow: '0 12px 40px rgba(13,33,44,0.08)' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-sow-modal-title"
        >
          {/* Header */}
          <div className="flex items-start justify-between shrink-0 w-full" style={{ padding: '32px 40px 20px' }}>
            <div>
              <h2
                id="create-sow-modal-title"
                className="text-lg font-bold"
                style={{ color: 'var(--text-title)' }}
              >
                Create New SOW
              </h2>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-subtitle)' }}>
                Upload reference documents — AI extracts the details.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer border-0 transition-colors ml-4 shrink-0"
              style={{ background: 'transparent', color: 'var(--text-tertiary)' }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-surface-2)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
              }}
              aria-label="Close"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 flex flex-col gap-4 w-full" style={{ padding: '0 40px 8px' }}>
            
            {/* SOW Name Input */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                SOW Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Enter SOW name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: 13,
                  outline: 'none',
                  color: '#0d212c',
                  background: '#fff',
                }}
                onFocus={(e) => e.target.style.borderColor = '#cbd5e1'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            {/* SOW Deadline Input */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                SOW Due Date <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={sowDeadline}
                onChange={(e) => setSowDeadline(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: 13,
                  outline: 'none',
                  color: '#0d212c',
                  background: '#fff',
                }}
                onFocus={(e) => e.target.style.borderColor = '#cbd5e1'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            {/* Instructions Input */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Instructions
              </label>
              <textarea
                rows={4}
                placeholder="Tell us what the draft should emphasise, e.g. key risks, delivery approach, compliance needs or the tone to use."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: instructionsTooLong ? '1px solid #ef4444' : '1px solid #e2e8f0',
                  fontSize: 13,
                  outline: 'none',
                  color: '#0d212c',
                  background: '#fff',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => (e.target.style.borderColor = instructionsTooLong ? '#ef4444' : '#cbd5e1')}
                onBlur={(e) => (e.target.style.borderColor = instructionsTooLong ? '#ef4444' : '#e2e8f0')}
                aria-invalid={instructionsTooLong}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 6, fontSize: 12 }}>
                <span role={instructionsTooLong ? 'alert' : undefined} style={{ color: '#dc2626' }}>
                  {instructionsTooLong
                    ? `Instructions can be up to ${INSTRUCTIONS_LIMIT} characters. Remove ${instructions.length - INSTRUCTIONS_LIMIT} to continue.`
                    : ''}
                </span>
                <span style={{ color: instructionsTooLong ? '#dc2626' : '#94a3b8', marginLeft: 'auto', fontVariantNumeric: 'tabular-nums' }}>
                  {instructions.length}/{INSTRUCTIONS_LIMIT}
                </span>
              </div>
            </div>

            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: -6 }}>
              Supporting files <span style={{ color: '#ef4444' }}>*</span>
            </label>

            {/* Drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onMouseEnter={() => setIsDropzoneHovered(true)}
              onMouseLeave={() => setIsDropzoneHovered(false)}
              className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 py-12 px-6 cursor-pointer transition-all"
              style={{
                borderColor: dropzoneActive ? 'var(--brand-cyan-500)' : 'var(--border-default)',
                background: dropzoneActive ? '#f8fafc' : 'var(--bg-surface-1)',
              }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center transition-colors"
                style={{
                  background: dropzoneActive ? 'var(--brand-cyan-100)' : 'var(--bg-surface-2)',
                }}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke={dropzoneActive ? 'var(--brand-cyan-500)' : 'var(--text-tertiary)'}
                  viewBox="0 0 24 24"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
              </div>

              <div className="text-center">
                <p
                  className="text-sm font-bold"
                  style={{
                    color: dropzoneActive ? 'var(--brand-cyan-700)' : 'var(--text-primary)',
                  }}
                >
                  Drop your document here
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  or{' '}
                  <span style={{ color: 'var(--brand-cyan-500)' }} className="font-medium">
                    click to browse files
                  </span>
                </p>
                <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
                Supports PDF, DOCX, PPT and TXT · Max 10 documents · Max {MAX_TOTAL_MB} MB combined
                </p>
              </div>
            </div>



            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPT_ATTR}
              className="hidden"
              onChange={handleFileInput}
            />

            {/* Size error — auto-dismisses after 4s */}
            {sizeError && (
              <div
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium"
                style={{
                  background: 'var(--status-error-bg)',
                  border: '1px solid var(--status-error-border)',
                  color: 'var(--status-error-text)',
                }}
              >
                <svg
                  className="w-3.5 h-3.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  />
                </svg>
                {sizeError}
              </div>
            )}

            {/* File list — scrollable, ~5 rows max */}
            {files.length > 0 && (
              <div
                className="flex flex-col gap-2 overflow-y-auto pr-0.5"
                style={{ maxHeight: 300 }}
              >
                {files.map((f) => (
                  <UploadFileRow key={f.id} file={f} onRemove={removeFile} />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 w-full">
          <div className="flex items-center justify-end gap-3 w-full" style={{ padding: '20px 40px 32px' }}>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-semibold rounded-xl cursor-pointer"
              style={{ background: '#ffffff', color: 'var(--text-title)', border: '1.5px solid var(--border-subtle)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleProceed}
              disabled={!canCreate}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all cursor-pointer border-0 disabled:cursor-not-allowed"
              style={{
                background: canCreate ? 'var(--action-primary-bg-default)' : 'var(--bg-surface-3)',
                color: canCreate ? 'var(--action-primary-text)' : 'var(--text-disabled)',
                boxShadow: canCreate ? '0 2px 8px rgba(0,196,196,0.3)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (canCreate) (e.currentTarget as HTMLButtonElement).style.background = 'var(--action-primary-bg-hover)'
              }}
              onMouseLeave={(e) => {
                if (canCreate) (e.currentTarget as HTMLButtonElement).style.background = 'var(--action-primary-bg-default)'
              }}
            >
              Create SOW
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          </div>
        </div>
      </div>
    </>
  )
}
