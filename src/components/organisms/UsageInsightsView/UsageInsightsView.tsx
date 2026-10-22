/**
 * @layer organism
 * @description Usage Insights page: weekly KPI cards (SOWs generated, tokens consumed, web search credits,
 * estimated AI cost), a Value/ROI calculator with a manual-vs-AI cost chart (only the Admin can recalculate)
 * and SOWs grouped by readiness %.
 * @usage <UsageInsightsView sows={sows} canRecalculate={isAdmin} notificationButton={bell} />
 */

'use client'

import React, { useEffect, useRef, useState } from 'react'
import { BarChart3, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, DollarSign, FileText, Info, List, LineChart, RefreshCw, Search } from 'lucide-react'
import type { RoiInputs, UsageInsightsViewProps, UsageWeek } from './UsageInsightsView.types'

const PRIMARY = '#00C4C4'

// Sample weekly usage (latest week last). Tokens are in millions.
const WEEKS: UsageWeek[] = [
  { start: 'Sep 21', end: 'Sep 27, 2026', label: 'Sep 21 – Sep 27, 2026', axisLabel: 'Sep 21', inCurrentMonth: false, sowsGenerated: 15, inputTokens: 7.9, outputTokens: 1.9, embeddingTokens: 2.3, searchCredits: 1900 },
  { start: 'Sep 28', end: 'Oct 4, 2026', label: 'Sep 28 – Oct 4, 2026', axisLabel: 'Sep 28', inCurrentMonth: true, sowsGenerated: 12, inputTokens: 6.4, outputTokens: 1.5, embeddingTokens: 1.9, searchCredits: 1550 },
  { start: 'Oct 5', end: 'Oct 11, 2026', label: 'Oct 5 – Oct 11, 2026', axisLabel: 'Oct 5', inCurrentMonth: true, sowsGenerated: 17, inputTokens: 9.2, outputTokens: 2.2, embeddingTokens: 2.8, searchCredits: 2050 },
  { start: 'Oct 12', end: 'Oct 18, 2026', label: 'Oct 12 – Oct 18, 2026', axisLabel: 'Oct 12', inCurrentMonth: true, sowsGenerated: 21, inputTokens: 12.0, outputTokens: 3.1, embeddingTokens: 3.5, searchCredits: 2500 },
  { start: 'Oct 19', end: 'Oct 25, 2026', label: 'Oct 19 – Oct 25, 2026', axisLabel: 'Oct 19', inCurrentMonth: true, sowsGenerated: 18, inputTokens: 10.2, outputTokens: 2.6, embeddingTokens: 3.0, searchCredits: 2100 },
]

// The last full week is selected when the page opens
const DEFAULT_WEEK_INDEX = 3

const DEFAULT_INPUTS: RoiInputs = { hours: 6, costPerHour: 35, inputPrice: 1.25, outputPrice: 10, embeddingPrice: 0.13, searchPrice: 0.008 }

/** Costs for one week from the given prices */
const costsFor = (w: UsageWeek, i: RoiInputs) => {
  const model = w.inputTokens * i.inputPrice + w.outputTokens * i.outputPrice + w.embeddingTokens * i.embeddingPrice
  const search = w.searchCredits * i.searchPrice
  return { model, search, ai: model + search, manual: w.sowsGenerated * i.hours * i.costPerHour }
}

const PAGE_SIZE = 3
const LOW_MAX = 49
const HIGH_MIN = 80

type Range = 'Low' | 'Medium' | 'High'
const rangeOf = (n: number): Range => (n >= HIGH_MIN ? 'High' : n > LOW_MAX ? 'Medium' : 'Low')
const RANGE_STYLE: Record<Range, { fg: string; bg: string; bar: string }> = {
  Low: { fg: '#b91c1c', bg: '#fee2e2', bar: '#ef4444' },
  Medium: { fg: '#92400e', bg: '#fef3c7', bar: '#f59e0b' },
  High: { fg: '#166534', bg: '#dcfce7', bar: '#22c55e' },
}

const formatTokens = (millions: number) => `${millions.toFixed(1)}M`
const usd = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`
const usd2 = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const cardStyle: React.CSSProperties = {
  background: '#FFFFFFCC',
  border: '1px solid rgba(255,255,255,0.85)',
  borderRadius: 16,
  boxShadow: '0 2px 12px rgba(0,196,196,0.07)',
}

function InfoTip({ children, align = 'left', placement = 'top' }: { children: React.ReactNode; align?: 'left' | 'right'; placement?: 'top' | 'bottom' }) {
  const [open, setOpen] = useState(false)
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Info size={15} color="#94a3b8" style={{ cursor: 'help' }} aria-label="More information" />
      {open && (
        <span
          role="tooltip"
          style={{
            position: 'absolute',
            // Tips near the top of the page open downwards so the page edge does not clip them
            ...(placement === 'bottom' ? { top: 'calc(100% + 8px)' } : { bottom: 'calc(100% + 8px)' }),
            // Bottom tips sit flush with the icon so they stay inside the page edge
            [align]: placement === 'bottom' ? 0 : -12,
            width: 300,
            background: '#0d212c',
            color: '#ffffff',
            borderRadius: 12,
            padding: '10px 14px',
            fontSize: 12.5,
            lineHeight: 1.5,
            fontWeight: 400,
            zIndex: 50,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            textAlign: 'left',
          }}
        >
          {children}
        </span>
      )}
    </span>
  )
}

function KpiCard({
  label,
  value,
  sub,
  icon,
  iconBg,
  valueColor = '#0d212c',
}: {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  iconBg: string
  valueColor?: string
}) {
  return (
    <div style={{ ...cardStyle, padding: '18px 18px 26px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </span>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: 32, fontWeight: 600, color: valueColor, lineHeight: 1 }}>{value}</div>
      {sub && (
        <>
          <div style={{ height: 1, background: 'rgba(0,196,196,0.12)', width: '100%', margin: '4px 0 2px 0' }} />
          <span style={{ fontSize: 11, fontWeight: 500, color: '#64748b' }}>{sub}</span>
        </>
      )}
    </div>
  )
}

function NumberRow({
  label,
  hint,
  prefix,
  suffix,
  value,
  onChange,
  readOnly = false,
}: {
  label: string
  hint?: string
  prefix?: string
  suffix: string
  value: number
  onChange: (n: number) => void
  /** Non-admin users can see the inputs but not change them */
  readOnly?: boolean
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 0', borderBottom: '1px solid rgba(0,196,196,0.1)' }}>
      <label htmlFor={`roi-${label.replace(/\s+/g, "-")}`} style={{ fontSize: 14, fontWeight: 500, color: '#0d212c' }}>
        {label}
        {hint && <span style={{ fontSize: 12, fontWeight: 400, color: '#94a3b8' }}> {hint}</span>}
      </label>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            width: 130,
            height: 36,
            padding: '0 10px',
            background: readOnly ? '#f8fafc' : '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            boxSizing: 'border-box',
          }}
        >
          {prefix && <span style={{ fontSize: 13, color: '#94a3b8' }}>{prefix}</span>}
          <input
            id={`roi-${label.replace(/\s+/g, "-")}`}
            type="number"
            min={0}
            step="any"
            readOnly={readOnly}
            value={Number.isNaN(value) ? '' : value}
            onChange={(e) => onChange(e.target.value === '' ? NaN : Math.max(0, Number(e.target.value)))}
            style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, fontWeight: 600, color: '#0d212c', textAlign: 'right', fontFamily: 'inherit' }}
          />
        </span>
        <span style={{ fontSize: 12.5, color: '#64748b', width: 40 }}>{suffix}</span>
      </span>
    </div>
  )
}

const MANUAL_COLOR = PRIMARY
// Dark navy taken from the logo / sidebar
const AI_COLOR = '#053546'

/** Rounds a chart maximum up to a tidy value so the axis ticks read well */
function niceMax(v: number) {
  if (v <= 0) return 1
  const pow = Math.pow(10, Math.floor(Math.log10(v)))
  const n = v / pow
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10
  return step * pow
}
const axisMoney = (n: number) => (n >= 1000 ? `$${n / 1000}K` : `$${n}`)

interface ChartPoint {
  label: string
  fullLabel: string
  manual: number
  ai: number
}

/** Manual cost vs AI cost over the listed weeks, with the selected week highlighted */
function CostChart({ points, selectedIndex }: { points: ChartPoint[]; selectedIndex: number }) {
  const [hover, setHover] = useState<number | null>(null)
  // The chart fills whatever space the card gives it (taller for the Admin, who has the Recalculate row)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 640, h: 270 })
  useEffect(() => {
    const el = wrapRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const measure = () => {
      const r = el.getBoundingClientRect()
      if (r.width > 0 && r.height > 0) setSize({ w: Math.round(r.width), h: Math.round(r.height) })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const W = size.w
  const H = size.h
  const left = 52
  const right = 112
  const top = 18
  const bottom = 40
  const max = niceMax(Math.max(...points.map((p) => p.manual), 1))
  const ticks = [0, 1, 2, 3, 4, 5].map((i) => (max / 5) * i)
  const x = (i: number) => left + (points.length === 1 ? 0 : (i * (W - left - right)) / (points.length - 1))
  const y = (v: number) => top + (1 - v / max) * (H - top - bottom)
  const path = (key: 'manual' | 'ai') => points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(p[key])}`).join(' ')
  const last = points[points.length - 1]
  const sel = points[selectedIndex]
  const colW = points.length > 1 ? (W - left - right) / (points.length - 1) : 40
  const hp = hover !== null ? points[hover] : null
  return (
    <div ref={wrapRef} style={{ position: 'relative', height: '100%', minHeight: 250 }} onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label="Manual cost versus AI cost by week" style={{ display: 'block', position: 'absolute', inset: 0 }}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={left} x2={W - right} y1={y(t)} y2={y(t)} stroke="#e2e8f0" strokeWidth="1" />
            <text x={left - 10} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#94a3b8">
              {axisMoney(t)}
            </text>
          </g>
        ))}
        {sel && <line x1={x(selectedIndex)} x2={x(selectedIndex)} y1={top} y2={H - bottom} stroke="#cbd5e1" strokeDasharray="3 3" />}
        <path d={path('manual')} fill="none" stroke={MANUAL_COLOR} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        <path d={path('ai')} fill="none" stroke={AI_COLOR} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <g key={p.label}>
            <circle cx={x(i)} cy={y(p.manual)} r={i === selectedIndex || i === hover ? 5 : 3.5} fill={MANUAL_COLOR} />
            <circle cx={x(i)} cy={y(p.ai)} r={i === selectedIndex || i === hover ? 5 : 3.5} fill={AI_COLOR} />
            <text x={x(i)} y={H - 12} textAnchor="middle" fontSize="12" fontWeight={i === selectedIndex ? 700 : 400} fill={i === selectedIndex ? '#0d212c' : '#64748b'}>
              {p.label}
            </text>
          </g>
        ))}
        <text x={x(points.length - 1) + 12} y={y(last.manual) + 4} fontSize="12.5" fontWeight="600" fill="#0d212c">
          {`Manual ${usd(last.manual)}`}
        </text>
        <text x={x(points.length - 1) + 12} y={y(last.ai) - 10} fontSize="12.5" fontWeight="600" fill="#0d212c">
          {`AI ${usd2(last.ai)}`}
        </text>
        {/* One hover column per week */}
        {points.map((p, i) => (
          <rect key={`hit-${p.label}`} x={x(i) - colW / 2} y={top} width={colW} height={H - top - bottom} fill="transparent" onMouseEnter={() => setHover(i)} onMouseMove={() => setHover(i)} />
        ))}
      </svg>
      {hp && hover !== null && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            left: `${(x(hover) / W) * 100}%`,
            top: `${(y(hp.manual) / H) * 100}%`,
            transform: `translate(${hover > points.length / 2 ? '-100%' : '-50%'}, calc(-100% - 14px))`,
            width: 250,
            padding: '14px 16px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
            pointerEvents: 'none',
            zIndex: 20,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: '#0d212c', paddingBottom: 8, borderBottom: '1px solid #e2e8f0', marginBottom: 8 }}>{hp.fullLabel}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: '#475569', padding: '3px 0' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: MANUAL_COLOR }} />
              Manual cost:
            </span>
            <span style={{ fontWeight: 600, color: '#0d212c' }}>{usd(hp.manual)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: '#475569', padding: '3px 0' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: AI_COLOR }} />
              AI cost:
            </span>
            <span style={{ fontWeight: 600, color: AI_COLOR }}>{usd2(hp.ai)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: '#64748b', paddingTop: 8, marginTop: 6, borderTop: '1px solid #e2e8f0' }}>
            <span>Estimated savings:</span>
            <span style={{ fontWeight: 600, color: PRIMARY }}>{usd2(hp.manual - hp.ai)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export const UsageInsightsView: React.FC<UsageInsightsViewProps> = ({ sows, notificationButton, canRecalculate = true }) => {
  const [weekIdx, setWeekIdx] = useState(DEFAULT_WEEK_INDEX)
  const [weekMenuOpen, setWeekMenuOpen] = useState(false)
  const [chartView, setChartView] = useState<'chart' | 'numbers'>('chart')
  const [draft, setDraft] = useState<RoiInputs>(DEFAULT_INPUTS)
  const [applied, setApplied] = useState<RoiInputs>(DEFAULT_INPUTS)
  const [recalculating, setRecalculating] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const weekMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  // Close the week dropdown when clicking elsewhere
  useEffect(() => {
    if (!weekMenuOpen) return
    const onDown = (e: MouseEvent) => {
      if (weekMenuRef.current && !weekMenuRef.current.contains(e.target as Node)) setWeekMenuOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [weekMenuOpen])

  const recalculate = () => {
    if (!canRecalculate) return
    setRecalculating(true)
    timerRef.current = setTimeout(() => {
      setApplied(draft)
      setRecalculating(false)
    }, 1800)
  }

  const week = WEEKS[weekIdx]
  const listedWeeks = WEEKS.map((w, i) => ({ w, i })).filter(({ w }) => w.inCurrentMonth)
  const firstListed = listedWeeks[0]?.i ?? 0
  const lastListed = listedWeeks[listedWeeks.length - 1]?.i ?? WEEKS.length - 1
  const dirty = (Object.keys(DEFAULT_INPUTS) as (keyof RoiInputs)[]).some((k) => draft[k] !== applied[k])
  const valid = !Object.values(draft).some((n) => Number.isNaN(n))

  const costs = costsFor(week, applied)
  const totalHours = week.sowsGenerated * applied.hours
  const totalTokens = week.inputTokens + week.outputTokens + week.embeddingTokens
  const roi = costs.ai > 0 ? costs.manual / costs.ai : 0
  const savings = costs.manual - costs.ai
  const chartPoints: ChartPoint[] = WEEKS.map((w) => {
    const c = costsFor(w, applied)
    return { label: w.axisLabel, fullLabel: w.label, manual: c.manual, ai: c.ai }
  })

  const scored = sows.filter((s) => typeof s.readiness === 'number') as (typeof sows[number] & { readiness: number })[]
  const [visible, setVisible] = useState(PAGE_SIZE)
  const groups = (['Low', 'Medium', 'High'] as Range[]).map((range) => ({
    range,
    rows: scored.filter((x) => rangeOf(x.readiness) === range).sort((x, y) => x.readiness - y.readiness),
  }))

  const hasMore = groups.some((g) => g.rows.length > visible)

  const navBtn = (disabled: boolean): React.CSSProperties => ({
    width: 32,
    height: 32,
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    background: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    color: '#475569',
  })

  const sectionTitle: React.CSSProperties = { fontSize: 16, fontWeight: 600, color: '#0d212c', margin: '0 0 12px' }
  const viewToggle = (active: boolean): React.CSSProperties => ({
    width: 30,
    height: 30,
    borderRadius: 8,
    border: 'none',
    background: active ? PRIMARY : 'transparent',
    color: active ? '#ffffff' : '#64748b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box', overflowY: 'auto' }}>
      {/* Header: title on the left, week selector and notifications on the right (same as the other pages) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#0d212c', margin: 0, lineHeight: 1.15 }}>Usage Insights</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button type="button" aria-label="Previous week" disabled={weekIdx <= firstListed} onClick={() => setWeekIdx((i) => i - 1)} style={navBtn(weekIdx <= firstListed)}>
              <ChevronLeft size={16} />
            </button>
            <div ref={weekMenuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={weekMenuOpen}
                onClick={() => setWeekMenuOpen((o) => !o)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 32, padding: '0 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#ffffff', fontSize: 13, fontWeight: 500, color: '#0d212c', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                <CalendarDays size={15} color={PRIMARY} />
                {week.start} – {week.end}
                <ChevronDown size={14} color="#64748b" style={{ transform: weekMenuOpen ? 'rotate(180deg)' : undefined, transition: 'transform 0.15s ease' }} />
              </button>
              {weekMenuOpen && (
                <ul
                  role="listbox"
                  aria-label="Weeks in this month"
                  style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 60, minWidth: 230, margin: 0, padding: 6, listStyle: 'none', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                >
                  {listedWeeks.map(({ w, i }) => (
                    <li key={w.label} role="option" aria-selected={i === weekIdx}>
                      <button
                        type="button"
                        onClick={() => {
                          setWeekIdx(i)
                          setWeekMenuOpen(false)
                        }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '8px 10px', borderRadius: 8, border: 'none', background: i === weekIdx ? 'rgba(0,196,196,0.1)' : 'transparent', color: i === weekIdx ? '#008080' : '#0d212c', fontSize: 13, fontWeight: i === weekIdx ? 700 : 500, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                        onMouseEnter={(e) => {
                          if (i !== weekIdx) (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc'
                        }}
                        onMouseLeave={(e) => {
                          if (i !== weekIdx) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                        }}
                      >
                        {w.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button type="button" aria-label="Next week" disabled={weekIdx >= lastListed} onClick={() => setWeekIdx((i) => i + 1)} style={navBtn(weekIdx >= lastListed)}>
              <ChevronRight size={16} />
            </button>
            <InfoTip align="right" placement="bottom">Usage is shown for the selected week, Monday to Sunday. Pick any week of the current month.</InfoTip>
          </div>
          {notificationButton}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3.5" style={{ marginBottom: 24 }}>
        <KpiCard
          label="SOWs Generated"
          value={String(week.sowsGenerated)}
          icon={<FileText size={16} color="#ef4444" strokeWidth={1.8} />}
          iconBg="#fee2e2"
        />
        <KpiCard
          label="Tokens Consumed"
          value={formatTokens(totalTokens)}
          sub={`${formatTokens(week.inputTokens)} input | ${formatTokens(week.outputTokens)} output | ${formatTokens(week.embeddingTokens)} embedding`}
          icon={<BarChart3 size={16} color="#0284c7" strokeWidth={1.8} />}
          iconBg="#e0f2fe"
        />
        <KpiCard
          label="Web Search Credits"
          value={week.searchCredits.toLocaleString('en-US')}
          sub="Search, extract & page reads"
          icon={<Search size={16} color="#d97706" strokeWidth={1.8} />}
          iconBg="#fef3c7"
        />
        <KpiCard
          label="Estimated AI Cost"
          value={usd2(costs.ai)}
          sub={`${usd2(costs.model)} model | ${usd2(costs.search)} search`}
          icon={<DollarSign size={16} color="#16a34a" strokeWidth={1.8} />}
          iconBg="#dcfce7"
        />
      </div>

      {/* Value / ROI */}
      <h2 style={sectionTitle}>Value/ROI</h2>
      <div style={{ display: 'flex', gap: 14, marginBottom: 24, alignItems: 'stretch' }}>
        <div style={{ ...cardStyle, padding: '6px 22px 18px', flex: 1, minWidth: 0 }}>
          <NumberRow readOnly={!canRecalculate} label="Manual hours per output" hint="(per report or SOW)" suffix="hours" value={draft.hours} onChange={(n) => setDraft((d) => ({ ...d, hours: n }))} />
          <NumberRow readOnly={!canRecalculate} label="Resource cost per hour" hint="(cost of the person doing it manually)" prefix="$" suffix="USD" value={draft.costPerHour} onChange={(n) => setDraft((d) => ({ ...d, costPerHour: n }))} />
          <NumberRow readOnly={!canRecalculate} label="Input token price" hint="(per 1M input tokens)" prefix="$" suffix="USD" value={draft.inputPrice} onChange={(n) => setDraft((d) => ({ ...d, inputPrice: n }))} />
          <NumberRow readOnly={!canRecalculate} label="Output token price" hint="(per 1M output tokens)" prefix="$" suffix="USD" value={draft.outputPrice} onChange={(n) => setDraft((d) => ({ ...d, outputPrice: n }))} />
          <NumberRow readOnly={!canRecalculate} label="Embedding token price" hint="(per 1M tokens · uploaded files)" prefix="$" suffix="USD" value={draft.embeddingPrice} onChange={(n) => setDraft((d) => ({ ...d, embeddingPrice: n }))} />
          <NumberRow readOnly={!canRecalculate} label="Price per search credit" hint="(web search)" prefix="$" suffix="USD" value={draft.searchPrice} onChange={(n) => setDraft((d) => ({ ...d, searchPrice: n }))} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16 }}>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>
              AI cost includes model + web search{canRecalculate ? '' : ' · Only an admin can recalculate'}
            </span>
            {canRecalculate && (
              <button
                type="button"
                disabled={!dirty || !valid || recalculating}
                onClick={recalculate}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 18px',
                  borderRadius: 10,
                  border: 'none',
                  background: dirty && valid && !recalculating ? PRIMARY : '#cbd5e1',
                  color: dirty && valid && !recalculating ? '#ffffff' : '#64748b',
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: dirty && valid && !recalculating ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit',
                }}
              >
                <RefreshCw size={14} />
                Recalculate
              </button>
            )}
          </div>
        </div>

        {recalculating ? (
          <div style={{ ...cardStyle, padding: '22px 24px', flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            <style>{`@keyframes usage-spin { to { transform: rotate(360deg) } }`}</style>
            <svg width="56" height="56" viewBox="0 0 56 56" role="progressbar" aria-label="Recalculating" style={{ animation: 'usage-spin 1s linear infinite' }}>
              <circle cx="28" cy="28" r="22" fill="none" stroke="#e2e8f0" strokeWidth="5" />
              <circle cx="28" cy="28" r="22" fill="none" stroke={PRIMARY} strokeWidth="5" strokeLinecap="round" strokeDasharray="40 98" />
            </svg>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: '#475569' }}>Recalculating value/ROI</div>
          </div>
        ) : (
          <div style={{ ...cardStyle, padding: '20px 24px', flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            {/* Chart header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingBottom: 12, borderBottom: '1px solid rgba(0,196,196,0.12)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: '#0d212c' }}>Manual cost vs AI cost</span>
                {chartView === 'chart' && (
                  <>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#475569' }}>
                  <span style={{ width: 14, height: 3, borderRadius: 2, background: MANUAL_COLOR }} />
                  Manual cost
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#475569' }}>
                  <span style={{ width: 14, height: 3, borderRadius: 2, background: AI_COLOR }} />
                  AI cost
                </span>
                  </>
                )}
              </div>
              <div style={{ display: 'inline-flex', padding: 3, gap: 2, border: '1px solid #e2e8f0', borderRadius: 10, background: '#ffffff' }}>
                <button type="button" aria-label="Chart view" aria-pressed={chartView === 'chart'} onClick={() => setChartView('chart')} style={viewToggle(chartView === 'chart')}>
                  <LineChart size={15} />
                </button>
                <button type="button" aria-label="Numbers view" aria-pressed={chartView === 'numbers'} onClick={() => setChartView('numbers')} style={viewToggle(chartView === 'numbers')}>
                  <List size={15} />
                </button>
              </div>
            </div>

            <div style={{ flex: 1, minHeight: 0, padding: '12px 0', display: 'flex', flexDirection: 'column' }}>
              {chartView === 'chart' ? (
                <CostChart points={chartPoints} selectedIndex={weekIdx} />
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px 0', alignContent: 'center', height: '100%' }}>
                  <div style={{ paddingRight: 20, borderRight: '1px solid rgba(0,196,196,0.15)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#0d212c' }}>
                      Manual cost
                      <InfoTip>
                        <div>Manual cost is the multiply of manual hours into cost per hour.</div>
                        <div>Outputs × Manual hours × Cost per hour</div>
                      </InfoTip>
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 600, color: '#0d212c', margin: '6px 0' }}>{usd(costs.manual)}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Total hours {totalHours} | Cost per hour ${applied.costPerHour}</div>
                  </div>
                  <div style={{ paddingLeft: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#0d212c' }}>
                      AI cost
                      <InfoTip align="right">
                        <div>AI cost is the model cost (input, output and embedding tokens) plus the web search cost.</div>
                        <div>Tokens × token prices + Search credits × credit price</div>
                      </InfoTip>
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 600, color: AI_COLOR, margin: '6px 0' }}>{usd2(costs.ai)}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{usd2(costs.model)} model | {usd2(costs.search)} search</div>
                  </div>
                  <div style={{ gridColumn: '1 / -1', height: 1, background: 'rgba(0,196,196,0.12)' }} />
                  <div style={{ paddingRight: 20, borderRight: '1px solid rgba(0,196,196,0.15)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#0d212c' }}>
                      Estimated ROI
                      <InfoTip>
                        <div>Estimated ROI is calculated by dividing manual cost by AI cost.</div>
                        <div>Manual cost ÷ AI cost</div>
                      </InfoTip>
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 600, color: PRIMARY, margin: '6px 0' }}>{Math.round(roi)}x</div>
                  </div>
                  <div style={{ paddingLeft: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#0d212c' }}>
                      Estimated savings
                      <InfoTip align="right">
                        <div>Estimated savings is calculated by subtracting AI cost from manual cost.</div>
                        <div>Manual cost - AI cost</div>
                      </InfoTip>
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 600, color: PRIMARY, margin: '6px 0' }}>{usd2(savings)}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{week.label}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SOWs by readiness */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <h2 style={{ ...sectionTitle, margin: 0 }}>SOW&apos;s by Readiness%</h2>
        <InfoTip>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Readiness ranges</div>
          {(['Low', 'Medium', 'High'] as Range[]).map((r) => (
            <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: RANGE_STYLE[r].bar, display: 'inline-block' }} />
              {r}: {r === 'Low' ? `0% – ${LOW_MAX}%` : r === 'Medium' ? `${LOW_MAX + 1}% – ${HIGH_MIN - 1}%` : `${HIGH_MIN}% – 100%`}
            </div>
          ))}
        </InfoTip>
      </div>
      <div style={{ ...cardStyle, padding: '18px 22px', marginBottom: 20, width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          {groups.map((g, gi) => (
            <div
              key={g.range}
              style={{ flex: 1, minWidth: 0, padding: gi === 0 ? '0 22px 0 0' : '0 22px', borderLeft: gi === 0 ? 'none' : '1px solid rgba(0,196,196,0.15)' }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0d212c', marginBottom: 6 }}>{g.range}</div>
              {g.rows.length === 0 && <div style={{ fontSize: 13, color: '#94a3b8', padding: '6px 0' }}>No SOWs</div>}
              {g.rows.slice(0, visible).map((s) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '8px 0' }}>
                  <span style={{ fontSize: 13.5, color: '#0d212c', fontWeight: 500 }}>{s.name}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: PRIMARY, flexShrink: 0 }}>{s.readiness}%</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        {(hasMore || visible > PAGE_SIZE) && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
            <button
              type="button"
              onClick={() => setVisible((v) => (hasMore ? v + PAGE_SIZE : PAGE_SIZE))}
              style={{ background: 'none', border: 'none', color: PRIMARY, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', padding: '6px 12px' }}
            >
              {hasMore ? 'See more' : 'See less'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
