/**
 * @layer organism
 * @description Usage Insights page: weekly KPI cards (SOWs generated, tokens consumed, estimated AI cost),
 * a Value/ROI calculator and SOWs grouped by readiness %.
 * @usage <UsageInsightsView sows={sows} notificationButton={bell} />
 */

'use client'

import React, { useEffect, useRef, useState } from 'react'
import { BarChart3, ChevronLeft, ChevronRight, CalendarDays, DollarSign, FileText, Info, RefreshCw } from 'lucide-react'
import type { RoiInputs, UsageInsightsViewProps, UsageWeek } from './UsageInsightsView.types'

const PRIMARY = '#00C4C4'

// Sample weekly usage (latest week last)
const WEEKS: UsageWeek[] = [
  { start: 'Sep 21', end: 'Sep 27, 2026', label: 'Sep 21 – Sep 27, 2026', sowsGenerated: 15, tokens: 12_100_000 },
  { start: 'Sep 28', end: 'Oct 4, 2026', label: 'Sep 28 – Oct 4, 2026', sowsGenerated: 12, tokens: 9_800_000 },
  { start: 'Oct 5', end: 'Oct 11, 2026', label: 'Oct 5 – Oct 11, 2026', sowsGenerated: 17, tokens: 14_200_000 },
  { start: 'Oct 12', end: 'Oct 18, 2026', label: 'Oct 12 – Oct 18, 2026', sowsGenerated: 21, tokens: 18_600_000 },
]

const DEFAULT_INPUTS: RoiInputs = { hours: 4, costPerHour: 30, tokenPrice: 4 }

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

const formatTokens = (n: number) => `${(n / 1_000_000).toFixed(1)}M`
const usd = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`

const cardStyle: React.CSSProperties = {
  background: '#FFFFFFCC',
  border: '1px solid rgba(255,255,255,0.85)',
  borderRadius: 16,
  boxShadow: '0 2px 12px rgba(0,196,196,0.07)',
}

function InfoTip({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
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
            bottom: 'calc(100% + 8px)',
            [align]: -12,
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
}: {
  label: string
  hint?: string
  prefix?: string
  suffix: string
  value: number
  onChange: (n: number) => void
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
            width: 110,
            height: 36,
            padding: '0 10px',
            background: '#ffffff',
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

export const UsageInsightsView: React.FC<UsageInsightsViewProps> = ({ sows, notificationButton }) => {
  const [weekIdx, setWeekIdx] = useState(WEEKS.length - 1)
  const [draft, setDraft] = useState<RoiInputs>(DEFAULT_INPUTS)
  const [applied, setApplied] = useState<RoiInputs>(DEFAULT_INPUTS)
  const [recalculating, setRecalculating] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const recalculate = () => {
    setRecalculating(true)
    timerRef.current = setTimeout(() => {
      setApplied(draft)
      setRecalculating(false)
    }, 1800)
  }

  const week = WEEKS[weekIdx]
  const dirty =
    draft.hours !== applied.hours || draft.costPerHour !== applied.costPerHour || draft.tokenPrice !== applied.tokenPrice
  const valid = ![draft.hours, draft.costPerHour, draft.tokenPrice].some((n) => Number.isNaN(n))

  const totalHours = week.sowsGenerated * applied.hours
  const manualCost = totalHours * applied.costPerHour
  const aiCost = (week.tokens / 1_000_000) * applied.tokenPrice
  const roi = aiCost > 0 ? manualCost / aiCost : 0
  const savings = manualCost - aiCost

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#0d212c', margin: 0, lineHeight: 1.15 }}>Usage Insights</h1>
        {notificationButton}
      </div>

      {/* Overview */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h2 style={{ ...sectionTitle, margin: 0 }}>Overview</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button type="button" aria-label="Previous week" disabled={weekIdx === 0} onClick={() => setWeekIdx((i) => i - 1)} style={navBtn(weekIdx === 0)}>
            <ChevronLeft size={16} />
          </button>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 32, padding: '0 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#ffffff', fontSize: 13, fontWeight: 500, color: '#0d212c' }}>
            <CalendarDays size={15} color={PRIMARY} />
            {week.start} – {week.end}
          </span>
          <button type="button" aria-label="Next week" disabled={weekIdx === WEEKS.length - 1} onClick={() => setWeekIdx((i) => i + 1)} style={navBtn(weekIdx === WEEKS.length - 1)}>
            <ChevronRight size={16} />
          </button>
          <InfoTip align="right">Usage is shown for the selected week, Monday to Sunday.</InfoTip>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3.5" style={{ marginBottom: 24 }}>
        <KpiCard
          label="SOWs Generated"
          value={String(week.sowsGenerated)}
          icon={<FileText size={16} color="#ef4444" strokeWidth={1.8} />}
          iconBg="#fee2e2"
        />
        <KpiCard
          label="Tokens Consumed"
          value={formatTokens(week.tokens)}
          icon={<BarChart3 size={16} color="#0284c7" strokeWidth={1.8} />}
          iconBg="#e0f2fe"
        />
        <KpiCard
          label="Estimated AI Cost"
          value={usd(aiCost)}
          icon={<DollarSign size={16} color="#16a34a" strokeWidth={1.8} />}
          iconBg="#dcfce7"
        />
      </div>

      {/* Value / ROI */}
      <h2 style={sectionTitle}>Value/ROI</h2>
      <div style={{ display: 'flex', gap: 14, marginBottom: 24, alignItems: 'stretch' }}>
        <div style={{ ...cardStyle, padding: '6px 22px 18px', flex: 1, minWidth: 0 }}>
          <NumberRow label="Hours spent on current approach" hint="(per SOW)" suffix="hours" value={draft.hours} onChange={(n) => setDraft((d) => ({ ...d, hours: n }))} />
          <NumberRow label="Cost per hour" prefix="$" suffix="USD" value={draft.costPerHour} onChange={(n) => setDraft((d) => ({ ...d, costPerHour: n }))} />
          <NumberRow label="Token price" hint="(per 1M tokens)" prefix="$" suffix="USD" value={draft.tokenPrice} onChange={(n) => setDraft((d) => ({ ...d, tokenPrice: n }))} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16 }}>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>AI cost excludes web search</span>
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
        <div style={{ ...cardStyle, padding: '22px 24px', flex: 1, minWidth: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px 24px', alignContent: 'start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#0d212c' }}>
              Manual cost
              <InfoTip>
                <div>Manual cost is the multiply of manual hours into cost per hour.</div>
                <div>Outputs × Manual hours × Cost per hour</div>
              </InfoTip>
            </div>
            <div style={{ fontSize: 28, fontWeight: 600, color: '#0d212c', margin: '6px 0' }}>{usd(manualCost)}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Total hours {totalHours} | Cost per hour ${applied.costPerHour}</div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#0d212c' }}>
              AI cost
              <InfoTip align="right">
                <div>AI cost is the multiply of tokens consumed into token price per 1M tokens.</div>
                <div>Tokens consumed × Token price per 1M</div>
              </InfoTip>
            </div>
            <div style={{ fontSize: 28, fontWeight: 600, color: '#0284c7', margin: '6px 0' }}>{usd(aiCost)}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Total tokens {formatTokens(week.tokens)} | Token price ${applied.tokenPrice.toFixed(2)}</div>
          </div>
          <div style={{ gridColumn: '1 / -1', height: 1, background: 'rgba(0,196,196,0.12)' }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#0d212c' }}>
              Estimated ROI
              <InfoTip>
                <div>Estimated ROI is calculated by dividing manual cost by AI cost.</div>
                <div>Manual cost ÷ AI cost</div>
              </InfoTip>
            </div>
            <div style={{ fontSize: 28, fontWeight: 600, color: PRIMARY, margin: '6px 0' }}>{Math.round(roi)}x</div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#0d212c' }}>
              Estimated savings
              <InfoTip align="right">
                <div>Estimated savings is calculated by subtracting AI cost from manual cost.</div>
                <div>Manual cost - AI cost</div>
              </InfoTip>
            </div>
            <div style={{ fontSize: 28, fontWeight: 600, color: PRIMARY, margin: '6px 0', display: 'flex', alignItems: 'baseline', gap: 8 }}>
              {usd(savings)}
              <span style={{ fontSize: 12, fontWeight: 400, color: '#64748b' }}>this week</span>
            </div>
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
