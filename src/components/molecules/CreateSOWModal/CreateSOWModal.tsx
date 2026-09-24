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
}

const ACCEPT_ATTR = Object.keys(ACCEPTED_TYPES).join(',')
const MAX_SIZE_MB = 10
const UPLOAD_DURATION_MS = 2200

function fileLabel(file: UploadedFile): string {
  return `${file.size} · ${file.type}`
}

/* ── Per-type file icons ─────────────────────────────────────────────────── */
function FileIcon({ type }: { type: string }) {
  const t = type.toUpperCase()

  if (t === 'PDF') {
    return (
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: '#fff1f2' }}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path
            d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
            stroke="#e11d48"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points="14 2 14 8 20 8"
            stroke="#e11d48"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text
            x="6.5"
            y="18"
            fontSize="5.5"
            fontWeight="700"
            fill="#e11d48"
            fontFamily="sans-serif"
          >
            PDF
          </text>
        </svg>
      </div>
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
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: '#f0fdf4' }}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="#16a34a" strokeWidth="1.6" />
          <circle cx="8.5" cy="8.5" r="1.5" fill="#16a34a" />
          <path
            d="M21 15l-5-5L5 21"
            stroke="#16a34a"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
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
      const oversized = rawFiles.filter((f) => f.size > MAX_SIZE_MB * 1024 * 1024)
      if (oversized.length > 0) {
        setSizeError(
          `${oversized.map((f) => f.name).join(', ')} exceed${oversized.length === 1 ? 's' : ''} the ${MAX_SIZE_MB} MB limit.`
        )
      }
      const valid = rawFiles.filter(
        (f) => f.size <= MAX_SIZE_MB * 1024 * 1024 && ACCEPTED_TYPES[f.type]
      )
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

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id))

  const handleProceed = () => {
    if (!allUploaded) return
    onProceed(files)
  }

  // Dropzone is "active" when dragging over OR mouse hovering
  const dropzoneActive = isDragOver || isDropzoneHovered

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'var(--bg-overlay)' }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <div
          className="relative w-full rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ background: 'var(--bg-modal)', maxHeight: '90vh', maxWidth: 680 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-sow-modal-title"
        >
          {/* Header */}
          <div className="flex items-start justify-between px-7 pt-6 pb-5 shrink-0">
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
          <div className="flex-1 overflow-y-auto px-7 pb-7 flex flex-col gap-4">
            
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
                  borderRadius: 10,
                  border: '1px solid #cbd5e1',
                  fontSize: 14,
                  outline: 'none',
                  color: '#0d212c',
                  background: '#fff',
                }}
              />
            </div>

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
                background: dropzoneActive ? 'var(--brand-cyan-50)' : 'var(--bg-surface-1)',
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
                  Supports PDF, DOCX and PPT · Max {MAX_SIZE_MB} MB
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
          <div
            className="flex items-center justify-end gap-3 px-7 py-4 shrink-0"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <button
              onClick={handleProceed}
              disabled={!allUploaded || anyUploading || !clientName.trim()}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all cursor-pointer border-0 disabled:cursor-not-allowed"
              style={{
                background: allUploaded && clientName.trim()
                  ? 'var(--action-primary-bg-default)'
                  : 'var(--bg-surface-3)',
                color: allUploaded && clientName.trim() ? 'var(--action-primary-text)' : 'var(--text-disabled)',
                boxShadow: allUploaded && clientName.trim() ? '0 2px 8px rgba(0,196,196,0.3)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (allUploaded && clientName.trim())
                  (e.currentTarget as HTMLButtonElement).style.background =
                    'var(--action-primary-bg-hover)'
              }}
              onMouseLeave={(e) => {
                if (allUploaded && clientName.trim())
                  (e.currentTarget as HTMLButtonElement).style.background =
                    'var(--action-primary-bg-default)'
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
    </>
  )
}
