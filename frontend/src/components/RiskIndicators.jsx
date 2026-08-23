import React, { useState } from 'react'

const SEV = {
  high:   { color: 'var(--terra)',     bg: 'var(--terra-light)',  border: 'var(--terra-border)',  label: 'High' },
  medium: { color: 'var(--ochre)',     bg: 'var(--ochre-light)',  border: 'var(--ochre-border)',  label: 'Medium' },
  low:    { color: 'var(--olive)',     bg: 'var(--olive-light)',  border: 'var(--olive-border)',  label: 'Low' },
}

function fmtRp(n) {
  if (n == null) return '—'
  return 'Rp ' + Math.round(n).toLocaleString('id-ID')
}

function IndicatorItem({ flag }) {
  const [open, setOpen] = useState(false)
  const s = SEV[flag.severity] || SEV.low

  return (
    <div
      style={{
        borderLeft: `4px solid ${s.color}`,
        padding: '14px 16px',
        cursor: 'pointer',
        borderRadius: '0 var(--r-md) var(--r-md) 0',
        background: open ? s.bg : 'transparent',
        transition: 'background var(--t-base) var(--ease)',
      }}
      onClick={() => setOpen(o => !o)}
      role="button" aria-expanded={open} tabIndex={0}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setOpen(o => !o)}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <svg width="16" height="16" viewBox="0 0 16 16" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true">
          <circle cx="8" cy="8" r="7" fill={s.color} />
        </svg>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5 }}>{flag.label}</div>

          {/* Expanded detail */}
          <div style={{
            overflow: 'hidden',
            maxHeight: open ? 200 : 0,
            opacity: open ? 1 : 0,
            transition: 'max-height var(--t-base) var(--ease), opacity var(--t-base)',
          }}>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {flag.value != null && (
                <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                  Your bid: <span style={{ color: 'var(--ink-1)', fontWeight: 500 }}>{fmtRp(flag.value)}</span>
                </div>
              )}
              {flag.threshold != null && (
                <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                  Reference: <span style={{ color: 'var(--ink-1)', fontWeight: 500 }}>{fmtRp(flag.threshold)}</span>
                </div>
              )}
              {flag.deviation_pct != null && (
                <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                  Deviation: <span style={{ color: s.color, fontWeight: 500 }}>
                    {flag.deviation_pct > 0 ? '+' : ''}{Number(flag.deviation_pct).toFixed(1)}%
                  </span>
                </div>
              )}
              <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 4 }}>
                Potential risk indicator — does not confirm wrongdoing
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{
            fontSize: 11, color: s.color, background: s.bg,
            border: `0.5px solid ${s.border}`,
            borderRadius: 'var(--r-sm)', padding: '2px 8px', fontWeight: 500,
          }}>{s.label}</span>
          <span style={{
            fontSize: 14, color: 'var(--ink-4)', display: 'inline-block',
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform var(--t-base) var(--ease)', lineHeight: 1,
          }}>▾</span>
        </div>
      </div>
    </div>
  )
}

export default function RiskIndicators({ flags }) {
  if (!flags || flags.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--ink-4)' }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
        <div style={{ fontSize: 14 }}>No anomalies detected</div>
        <div style={{ fontSize: 12, marginTop: 4 }}>No rule-based indicators triggered</div>
      </div>
    )
  }

  return (
    <div>
      {/* Notice */}
      <div style={{
        marginBottom: 12, padding: '10px 12px',
        background: 'var(--forest-light)', border: '0.5px solid var(--forest-mid)',
        borderRadius: 'var(--r-md)', fontSize: 12, color: 'var(--forest-text)', lineHeight: 1.5,
      }}>
        <strong>Review Recommended</strong> — Tap each indicator for details.
        These are potential patterns, not confirmed findings.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {flags.map((flag, i) => <IndicatorItem key={i} flag={flag} />)}
      </div>
    </div>
  )
}
