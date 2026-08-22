import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAuditLog } from '../api/client'

const EV = {
  submitted: { label: '📥 Submitted',   color: '#0F6E56', bg: '#E1F5EE', border: '#A8DCC7' },
  analyzed:  { label: '🤖 AI Analyzed', color: '#5B5BD6', bg: '#EDEDF9', border: '#BCBCE0' },
  reviewed:  { label: '👤 Reviewed',    color: '#0F6E56', bg: '#E1F5EE', border: '#A8DCC7' },
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
        <p style={{ margin: '4px 0 0', fontSize: 14, color: '#5F5E5A' }}>
          Immutable record of all system and reviewer actions
        </p>
      </div>

      {/* Disclaimer banner */}
      <div style={{
        padding: '10px 14px',
        background: '#FAEEDA', border: '0.5px solid #E0C27A',
        borderRadius: 8, fontSize: 12, color: '#633806',
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
        <div className="v-card no-hover" style={{ padding: '64px 24px', textAlign: 'center', color: '#9B9A96' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>◷</div>
          <p style={{ fontSize: 14, margin: 0 }}>No audit events yet</p>
        </div>
      ) : (
        /* Table */
        <div className="v-card no-hover" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F1EFE8', borderBottom: '0.5px solid #D3D1C7' }}>
                  {['Time', 'Event', 'Submission', 'Actor', 'Details'].map(h => (
                    <th key={h} style={{
                      padding: '10px 16px',
                      textAlign: 'left',
                      fontSize: 11,
                      fontWeight: 500,
                      color: '#9B9A96',
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
                    color:  '#9B9A96',
                    bg:     '#F1EFE8',
                    border: '#D3D1C7',
                  }
                  return (
                    <tr
                      key={log.id}
                      style={{ borderBottom: '0.5px solid #D3D1C7', transition: 'background 150ms' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#F8F7F3' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    >
                      <td style={{ padding: '11px 16px', fontSize: 11, color: '#9B9A96', whiteSpace: 'nowrap' }}>
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
                            style={{ fontSize: 12, color: '#1D9E75', textDecoration: 'none', fontWeight: 500 }}
                          >
                            #{log.submission_id}
                          </Link>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: 12, color: '#5F5E5A' }}>
                        {log.actor || '—'}
                      </td>
                      <td style={{ padding: '11px 16px' }}>
                        <div style={{
                          fontSize: 12, color: '#5F5E5A',
                          display: 'flex', gap: 12, flexWrap: 'wrap',
                        }}>
                          {Object.entries(log.event_data || {})
                            .filter(([k]) => k !== 'source')
                            .map(([k, v]) => (
                              <span key={k}>
                                <span style={{ color: '#9B9A96', textTransform: 'capitalize' }}>
                                  {k.replace(/_/g, ' ')}:{' '}
                                </span>
                                <span style={{ color: '#2C2C2A', fontWeight: 500 }}>
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
