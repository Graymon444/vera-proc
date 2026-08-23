import React from 'react'

const LEVEL = {
  High:   { color: 'var(--terra)',     bg: 'var(--terra-light)',  border: 'var(--terra-border)',  label: 'HIGH RISK',   subtitle: 'Requires Verification' },
  Medium: { color: 'var(--ochre)',     bg: 'var(--ochre-light)',  border: 'var(--ochre-border)',  label: 'MEDIUM RISK', subtitle: 'Review Recommended' },
  Low:    { color: 'var(--olive)',     bg: 'var(--olive-light)',  border: 'var(--olive-border)',  label: 'LOW RISK',    subtitle: 'Standard Review' },
}

export default function RiskScoreCard({ analysis }) {
  if (!analysis) return null
  const c = LEVEL[analysis.risk_level] || LEVEL.Low
  const score = Math.round(analysis.risk_score)

  return (
    <div className="v-card no-hover" style={{ background: c.bg, border: `0.5px solid ${c.border}`, overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 0' }}>
        <span style={{
          fontSize: 11, fontWeight: 500,
          color: 'var(--forest)', background: 'var(--forest-light)',
          border: '0.5px solid var(--forest-mid)',
          borderRadius: 'var(--r-sm)', padding: '2px 8px', letterSpacing: '0.04em',
        }}>AI ASSESSMENT</span>
        <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>Not a final determination</span>
      </div>

      {/* Score */}
      <div style={{ textAlign: 'center', padding: '20px 16px 8px' }}>
        <div style={{ fontSize: 72, fontWeight: 500, color: c.color, lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 4 }}>out of 100</div>
        <div style={{ fontSize: 18, fontWeight: 500, color: c.color, marginTop: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {c.label}
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 6 }}>{c.subtitle}</div>
      </div>

      {/* Sub-scores */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
        padding: '12px 16px 16px',
        borderTop: `0.5px solid ${c.border}`, marginTop: 4,
      }}>
        {[
          { label: 'Rule-Based', value: analysis.rule_score ?? '—' },
          { label: 'Indicators', value: (analysis.rule_flags || []).length },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: 'rgba(255,255,255,0.45)', borderRadius: 'var(--r-md)',
            padding: '10px 12px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--ink-1)' }}>{value}</div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 11, color: 'var(--ink-4)', textAlign: 'center', padding: '0 16px 14px', lineHeight: 1.5, margin: 0 }}>
        ⚠ Thresholds are prototype assumptions, not official standards
      </p>
    </div>
  )
}
