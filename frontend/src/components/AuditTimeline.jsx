import React from 'react'

// Warm palette — #1A9B6E teal, warm surfaces
const EV = {
  submitted: { icon: '📥', label: 'Submitted',   color: '#1A9B6E', bg: '#E2F4EC', border: '#A5D9C0' },
  analyzed:  { icon: '🤖', label: 'AI Analysis', color: '#6060C8', bg: '#EEEEF8', border: '#B8B8DC' },
  reviewed:  { icon: '👤', label: 'Reviewed',    color: '#1A9B6E', bg: '#E2F4EC', border: '#A5D9C0' },
  default:   { icon: '◷',  label: 'Event',       color: '#948E87', bg: '#EDE9E1', border: '#D6D1C8' },
}

function fmt(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return iso }
}

export default function AuditTimeline({ events }) {
  if (!events?.length) {
    return (
      <p style={{ fontSize: 14, color: '#948E87', textAlign: 'center', padding: '16px 0', margin: 0 }}>
        No audit events yet.
      </p>
    )
  }

  return (
    <ol style={{ listStyle: 'none', margin: 0, padding: 0 }} aria-label="Audit trail">
      {events.map((ev, i) => {
        const cfg    = EV[ev.event_type] || EV.default
        const isLast = i === events.length - 1

        return (
          <li key={ev.id ?? i} style={{ display: 'flex', gap: 12, position: 'relative' }}>
            {/* Connecting line — warm teal, low opacity */}
            {!isLast && (
              <div style={{
                position: 'absolute', left: 15, top: 32, bottom: 0,
                width: 2, background: '#1A9B6E', opacity: 0.25,
              }} />
            )}

            {/* Icon circle */}
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: cfg.bg, border: `2px solid ${cfg.color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, flexShrink: 0, zIndex: 1,
            }}>
              {cfg.icon}
            </div>

            {/* Content */}
            <div style={{ paddingBottom: isLast ? 0 : 20, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                <span style={{
                  fontSize: 11, fontWeight: 500,
                  color: cfg.color, background: cfg.bg,
                  border: `0.5px solid ${cfg.border}`,
                  borderRadius: 4, padding: '2px 8px',
                }}>{cfg.label}</span>
                {ev.actor && (
                  <span style={{
                    fontSize: 11, color: '#5C5750',
                    background: '#EDE9E1', border: '0.5px solid #D6D1C8',
                    borderRadius: 4, padding: '1px 6px',
                  }}>by {ev.actor}</span>
                )}
              </div>

              <p style={{ fontSize: 11, color: '#948E87', margin: '0 0 6px' }}>{fmt(ev.timestamp)}</p>

              {ev.event_data && Object.keys(ev.event_data).length > 0 && (
                <div style={{
                  background: '#EDE9E1', border: '0.5px solid #D6D1C8',
                  borderRadius: 8, padding: '8px 10px', fontSize: 12, color: '#5C5750',
                }}>
                  {Object.entries(ev.event_data)
                    .filter(([k]) => k !== 'source')
                    .map(([k, v]) => (
                      <div key={k}>
                        <span style={{ color: '#948E87', textTransform: 'capitalize' }}>
                          {k.replace(/_/g, ' ')}:
                        </span>{' '}
                        <span style={{ color: '#2A2722', fontWeight: 500 }}>{String(v)}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
