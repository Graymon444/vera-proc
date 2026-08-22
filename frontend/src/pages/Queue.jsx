import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listSubmissions } from '../api/client'
import { RiskPill } from '../components/RiskBadge'

const FILTERS = ['All', 'High', 'Medium', 'Low']

function fmtRp(n) {
  if (n == null) return '—'
  return 'Rp ' + Math.round(n).toLocaleString('id-ID')
}
function fmtDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  } catch { return iso }
}

const DECISION_STYLE = {
  'Verified':             { bg: '#E2F4EC', color: '#0D6B4A', border: '#A5D9C0' },
  'Needs Further Review': { bg: '#FAF0DC', color: '#613604', border: '#DDBF78' },
  'Dismissed':            { bg: '#F5F2EC', color: '#5C5750', border: '#D6D1C8' },
}

export default function Queue() {
  const [items, setItems]   = useState([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    listSubmissions(filter !== 'All' ? { risk_level: filter } : {})
      .then(r => setItems(r.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [filter])

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        marginBottom: 24, flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h1 style={{ margin: 0 }}>Review Queue</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#5C5750' }}>
            Sorted by risk score — highest priority first
          </p>
        </div>
        <Link
          to="/submit"
          className="v-btn v-btn-primary"
          style={{ height: 40, minHeight: 40, padding: '0 16px', fontSize: 13 }}
        >
          + New Submission
        </Link>
      </div>

      {/* Filter tabs — active tab gets teal bg + white text */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 16px',
              borderRadius: 8,
              fontSize: 13,
              border: '0.5px solid',
              cursor: 'pointer',
              transition: 'all 150ms cubic-bezier(0.2,0,0.8,1)',
              minHeight: 36,
              background:   filter === f ? '#1A9B6E' : '#fff',
              color:        filter === f ? '#fff'    : '#5C5750',
              borderColor:  filter === f ? '#1A9B6E' : '#D6D1C8',
              fontWeight:   filter === f ? 500       : 400,
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Loading skeletons */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} className="v-skeleton" style={{ height: 72 }} />
          ))}
        </div>
      ) : items.length === 0 ? (
        /* Empty state */
        <div className="v-card no-hover" style={{ padding: '64px 24px', textAlign: 'center', color: '#948E87' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
          <p style={{ fontSize: 14, margin: 0 }}>No submissions found</p>
          <p style={{ fontSize: 12, margin: '4px 0 0' }}>
            {filter !== 'All'
              ? `No ${filter} risk submissions yet.`
              : 'Load demo data or submit a new procurement.'}
          </p>
        </div>
      ) : (
        /* Table */
        <div className="v-card no-hover" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#F5F2EC', borderBottom: '0.5px solid #D6D1C8' }}>
                  {['#', 'Submission', 'Category', 'Amount', 'AI Assessment', 'Status', ''].map(h => (
                    <th key={h} style={{
                      padding: '10px 16px',
                      textAlign: 'left',
                      fontSize: 11,
                      fontWeight: 500,
                      color: '#948E87',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map(({ submission: s, analysis: a, review: r }) => (
                  <tr
                    key={s.id}
                    style={{ borderBottom: '0.5px solid #D6D1C8', transition: 'background 150ms' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#F2EFE8' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <td style={{ padding: '12px 16px', color: '#948E87', fontSize: 12 }}>
                      {s.id}
                    </td>
                    <td style={{ padding: '12px 16px', maxWidth: 260 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 500, color: '#2A2722',
                        display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
                      }}>
                        {s.title
                          .replace(/^\[SYNTHETIC[^\]]*\]\s*/, '')
                          .replace(/^\[.*?\]\s*/, '')
                          .substring(0, 48)}
                        {s.is_synthetic && (
                          <span style={{
                            fontSize: 10, color: '#948E87',
                            background: '#F5F2EC', border: '0.5px solid #D6D1C8',
                            borderRadius: 3, padding: '1px 5px',
                          }}>Demo</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: '#948E87', marginTop: 2 }}>
                        {s.vendor_name} · {fmtDate(s.submitted_at)}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#5C5750', whiteSpace: 'nowrap' }}>
                      {s.category}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500, color: '#2A2722', whiteSpace: 'nowrap' }}>
                      {fmtRp(s.requested_amount)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {a
                        ? <><RiskPill level={a.risk_level} /><div style={{ fontSize: 11, color: '#948E87', marginTop: 2 }}>{Math.round(a.risk_score)} / 100</div></>
                        : <span style={{ fontSize: 11, color: '#948E87' }}>—</span>
                      }
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {r ? (
                        <span style={{
                          fontSize: 11, padding: '3px 8px', borderRadius: 4,
                          background:  DECISION_STYLE[r.decision]?.bg     || '#F5F2EC',
                          color:       DECISION_STYLE[r.decision]?.color  || '#5C5750',
                          border:      `0.5px solid ${DECISION_STYLE[r.decision]?.border || '#D6D1C8'}`,
                          whiteSpace: 'nowrap',
                        }}>
                          {r.decision}
                        </span>
                      ) : (
                        <span style={{
                          fontSize: 11, padding: '3px 8px', borderRadius: 4,
                          background: '#FAF0DC', color: '#613604', border: '0.5px solid #DDBF78',
                        }}>
                          Pending
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <Link
                        to={`/review/${s.id}`}
                        className="v-btn-ghost"
                        style={{ fontSize: 12, minHeight: 32, padding: '0 10px' }}
                      >
                        Review →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
