import React from 'react'

const configs = {
  High: {
    cls: 'risk-badge-high',
    dot: 'bg-red-500',
    label: 'High Risk',
  },
  Medium: {
    cls: 'risk-badge-medium',
    dot: 'bg-amber-500',
    label: 'Medium Risk',
  },
  Low: {
    cls: 'risk-badge-low',
    dot: 'bg-green-500',
    label: 'Low Risk',
  },
}

export default function RiskBadge({ level, score, showScore = false, size = 'md' }) {
  const cfg = configs[level] || configs['Low']
  return (
    <span className={cfg.cls}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
      {showScore && score != null && (
        <span className="ml-1 opacity-70">({Math.round(score)})</span>
      )}
    </span>
  )
}
