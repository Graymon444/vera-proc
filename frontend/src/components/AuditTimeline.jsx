import React from 'react'

const EV = {
  submitted: { icon: '📥', label: 'Submitted',   color: '#1D9E75', bg: '#E1F5EE' },
  analyzed:  { icon: '🤖', label: 'AI Analysis', color: '#5B5BD6', bg: '#EDEDF9' },
  reviewed:  { icon: '👤', label: 'Reviewed',    color: '#1D9E75', bg: '#E1F5EE' },
  default:   { icon: '◷',  label: 'Event',       color: '#9B9A96', bg: '#F1EFE8' },
}

function fmt(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function AuditTimeline({ events }) {
  if (!events?.length) {
    return (
      <p style={{ fontSize: 14, color: '#9B9A96', textAlign: 'center', padding: '16px 0' }}>
        No audit events yet.
      </p>
    )
  }

  return (
    <ol style={{ listStyle: 'none', margin: 0, padding: 0 }} aria-label="Audit trail">
      {events.map((ev, i) => {
        const cfg = EV[ev.event_type] || EV.default
        const isLast = i === events.length - 1
        return (
          <li key={ev.id} style={{ display: 'flex', gap: 12, position: 'relative' }}>
            {/* Vertical line */}
            {!isLast && (
              <div style={{
                position: 'absolute', left: 15, top: 32,
                bottom: 0, width: 2, background: '#D3D1C7',
              }} />
            )}

            {/* Icon */}
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: cfg.bg, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 14, flexShrink: 0, zIndex: 1,
              border: `2px solid ${cfg.color}40`,
            }}>
              {cfg.icon}
            </div>

            {/* Content */}
            <div style={{ paddingBottom: isLast ? 0 : 20, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: cfg.color }}>{cfg.label}</span>
                {ev.actor && (
                  <span style={{
                    fontSize: 11, color: '#5F5E5A',
                    background: '#F1EFE8', border: '0.5px solid #D3D1C7',
                    borderRadius: 4, padding: '1px 6px',
                  }}>by {ev.actor}</span>
                )}
              </div>
              <p style={{ fontSize: 11, color: '#9B9A96', margin: '2px 0 6px' }}>{fmt(ev.timestamp)}</p>

              {ev.event_data && Object.keys(ev.event_data).length > 0 && (
                <div style={{
                  background: '#F1EFE8', border: '0.5px solid #D3D1C7',
                  borderRadius: 8, padding: '8px 10px', fontSize: 12,
                  color: '#5F5E5A',
                }}>
                  {Object.entries(ev.event_data)
                    .filter(([k]) => k !== 'source')
                    .map(([k, v]) => (
                      <div key={k}>
                        <span style={{ color: '#9B9A96', textTransform: 'capitalize' }}>
                          {k.replace(/_/g, ' ')}:
                        </span>{' '}
                        <span style={{ color: '#2C2C2A', fontWeight: 500 }}>{String(v)}</span>
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
