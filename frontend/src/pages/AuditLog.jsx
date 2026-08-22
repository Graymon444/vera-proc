import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAuditLog } from '../api/client'

const EV = {
  submitted: { label: '📥 Submitted',   color: '#0D6B4A', bg: '#E2F4EC', border: '#A5D9C0' },
  analyzed:  { label: '🤖 AI Analyzed', color: '#5B5BD6', bg: '#EDEDF9', border: '#BCBCE0' },
  reviewed:  { label: '👤 Reviewed',    color: '#0D6B4A', bg: '#E2F4EC', border: '#A5D9C0' },
}

function fmt(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return iso }
}

export default function AuditLog() {
  const [logs, setLogs]       = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAuditLog({ limit: 200 })
      .then(r => setLogs(r.data))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Audit Log</h1>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: '#5C5750' }}>
          Immutable record of all system and reviewer actions
        </p>
      </div>

      {/* Disclaimer banner */}
      <div style={{
        padding: '10px 14px',
        background: '#FAF0DC', border: '0.5px solid #DDBF78',
        borderRadius: 8, fontSize: 12, color: '#613604',
        marginBottom: 20, lineHeight: 1.5,
      }}>
        ⚠ Events tagged [Demo] originate from synthetic data and do not represent real
        procurement activity.
      </div>

      {/* Skeleton loading */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} className="v-skeleton" style={{ height: 56 }} />
          ))}
        </div>
      ) : logs.length === 0 ? (
        /* Empty state */
        <div className="v-card no-hover" style={{ padding: '64px 24px', textAlign: 'center', color: '#948E87' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>◷</div>
          <p style={{ fontSize: 14, margin: 0 }}>No audit events yet</p>
        </div>
      ) : (
        /* Table */
        <div className="v-card no-hover" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F5F2EC', borderBottom: '0.5px solid #D6D1C8' }}>
                  {['Time', 'Event', 'Submission', 'Actor', 'Details'].map(h => (
                    <th key={h} style={{
                      padding: '10px 16px',
                      textAlign: 'left',
                      fontSize: 11,
                      fontWeight: 500,
                      color: '#948E87',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      whiteSpace: 'nowrap',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map(log => {
                  const cfg = EV[log.event_type] || {
                    label:  `◷ ${log.event_type}`,
                    color:  '#948E87',
                    bg:     '#F5F2EC',
                    border: '#D6D1C8',
                  }
                  return (
                    <tr
                      key={log.id}
                      style={{ borderBottom: '0.5px solid #D6D1C8', transition: 'background 150ms' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#F2EFE8' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    >
                      <td style={{ padding: '11px 16px', fontSize: 11, color: '#948E87', whiteSpace: 'nowrap' }}>
                        {fmt(log.timestamp)}
                      </td>
                      <td style={{ padding: '11px 16px' }}>
                        <span style={{
                          fontSize: 11, padding: '3px 8px', borderRadius: 4,
                          background: cfg.bg, color: cfg.color,
                          border: `0.5px solid ${cfg.border}`,
                          whiteSpace: 'nowrap',
                        }}>
                          {cfg.label}
                        </span>
                      </td>
                      <td style={{ padding: '11px 16px' }}>
                        {log.submission_id ? (
                          <Link
                            to={`/review/${log.submission_id}`}
                            style={{ fontSize: 12, color: '#1A9B6E', textDecoration: 'none', fontWeight: 500 }}
                          >
                            #{log.submission_id}
                          </Link>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: 12, color: '#5C5750' }}>
                        {log.actor || '—'}
                      </td>
                      <td style={{ padding: '11px 16px' }}>
                        <div style={{
                          fontSize: 12, color: '#5C5750',
                          display: 'flex', gap: 12, flexWrap: 'wrap',
                        }}>
                          {Object.entries(log.event_data || {})
                            .filter(([k]) => k !== 'source')
                            .map(([k, v]) => (
                              <span key={k}>
                                <span style={{ color: '#948E87', textTransform: 'capitalize' }}>
                                  {k.replace(/_/g, ' ')}:{' '}
                                </span>
                                <span style={{ color: '#2A2722', fontWeight: 500 }}>
                                  {String(v)}
                                </span>
                              </span>
                            ))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
