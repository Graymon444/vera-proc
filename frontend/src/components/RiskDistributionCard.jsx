import React from 'react'

/**
 * RiskDistributionCard
 * Props: low, medium, high, r2Score, totalSubmissions, pendingReview, reviewed
 */
export default function RiskDistributionCard({
  low = 0,
  medium = 0,
  high = 0,
  r2Score = null,
  totalSubmissions = 0,
  pendingReview = 0,
  reviewed = 0,
}) {
  const cols = [
    {
      count: high,
      label: 'High Risk',
      color: '#D85A30',
      bg: '#FAECE7',
      border: '#E8B89F',
    },
    {
      count: medium,
      label: 'Medium Risk',
      color: '#BA7517',
      bg: '#FAEEDA',
      border: '#E0C27A',
    },
    {
      count: low,
      label: 'Low Risk',
      color: '#639922',
      bg: '#EAF3DE',
      border: '#AECB78',
    },
  ]

  const r2Color =
    r2Score == null
      ? '#9B9A96'
      : r2Score >= 0.8
      ? '#639922'
      : r2Score >= 0.6
      ? '#BA7517'
      : '#D85A30'

  const stats = [
    { label: 'Total', value: totalSubmissions },
    { label: 'Pending', value: pendingReview },
    { label: 'Reviewed', value: reviewed },
  ]

  return (
    <div
      className="v-card no-hover"
      style={{ padding: '20px 24px' }}
    >
      {/* Three columns */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginBottom: 16,
        }}
      >
        {cols.map((col) => (
          <div
            key={col.label}
            style={{
              background: col.bg,
              border: `0.5px solid ${col.border}`,
              borderRadius: 10,
              padding: '16px 12px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 500,
                color: col.color,
                lineHeight: 1,
                marginBottom: 6,
              }}
            >
              {col.count}
            </div>
            <div style={{ fontSize: 12, color: '#5F5E5A', lineHeight: 1.4 }}>
              {col.label}
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div
        style={{
          borderTop: '0.5px solid #D3D1C7',
          marginBottom: 12,
        }}
      />

      {/* Model alignment row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 12,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: 13, color: '#2C2C2A', fontWeight: 500 }}>
          Model Alignment:{' '}
          <span style={{ color: r2Color }}>
            R² {r2Score != null ? r2Score : '—'}
          </span>
        </span>
        <span style={{ fontSize: 11, color: '#9B9A96' }}>
          (Rules 70% + ML 30%)
        </span>
      </div>

      {/* Stat chips row */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {stats.map((s) => (
          <span
            key={s.label}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 10px',
              background: '#F1EFE8',
              border: '0.5px solid #D3D1C7',
              borderRadius: 20,
              fontSize: 11,
              color: '#5F5E5A',
            }}
          >
            <span style={{ fontWeight: 500, color: '#2C2C2A' }}>{s.label}:</span>
            {s.value}
          </span>
        ))}
      </div>
    </div>
  )
}
