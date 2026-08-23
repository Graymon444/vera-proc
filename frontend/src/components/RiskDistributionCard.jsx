import React from 'react'

export default function RiskDistributionCard({ low = 0, medium = 0, high = 0, r2Score = null, totalSubmissions = 0, pendingReview = 0, reviewed = 0 }) {
  const cols = [
    { count: high,   label: 'High Risk',   color: 'var(--terra)',  bg: 'var(--terra-light)',  border: 'var(--terra-border)' },
    { count: medium, label: 'Medium Risk', color: 'var(--ochre)',  bg: 'var(--ochre-light)',  border: 'var(--ochre-border)' },
    { count: low,    label: 'Low Risk',    color: 'var(--olive)',  bg: 'var(--olive-light)',  border: 'var(--olive-border)' },
  ]

  // Recharts/inline needs resolved hex for r2Color
  const r2Color = r2Score == null ? 'var(--ink-4)' : r2Score >= 0.8 ? 'var(--olive)' : r2Score >= 0.6 ? 'var(--ochre)' : 'var(--terra)'

  return (
    <div className="v-card no-hover" style={{ padding: '20px 24px' }}>
      {/* Three columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        {cols.map(col => (
          <div key={col.label} style={{ background: col.bg, border: `0.5px solid ${col.border}`, borderRadius: 10, padding: '16px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 500, color: col.color, lineHeight: 1, marginBottom: 6 }}>{col.count}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.4 }}>{col.label}</div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '0.5px solid var(--border)', marginBottom: 12 }} />

      {/* Model alignment */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: 'var(--ink-1)', fontWeight: 500 }}>
          Model Alignment: <span style={{ color: r2Color }}>R² {r2Score != null ? r2Score : '—'}</span>
        </span>
        <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>(Rules 70% + ML 30%)</span>
      </div>

      {/* Stat chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[{ label: 'Total', value: totalSubmissions }, { label: 'Pending', value: pendingReview }, { label: 'Reviewed', value: reviewed }].map(s => (
          <span key={s.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', background: 'var(--bg-sunken)', border: '0.5px solid var(--border)', borderRadius: 20, fontSize: 11, color: 'var(--ink-3)' }}>
            <span style={{ fontWeight: 500, color: 'var(--ink-1)' }}>{s.label}:</span> {s.value}
          </span>
        ))}
      </div>
    </div>
  )
}
