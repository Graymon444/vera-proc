import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboardStats, seedGovData, getModelEval } from '../api/client'
import { RiskPill } from '../components/RiskBadge'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

function MetricCard({ value, label, color = '#2C2C2A', bg = '#F1EFE8', border = '#D3D1C7' }) {
  return (
    <div style={{
      background: bg, border: `0.5px solid ${border}`,
      borderRadius: 12, padding: '16px', textAlign: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }}>
      <div style={{ fontSize: 28, fontWeight: 500, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#5F5E5A', marginTop: 6, lineHeight: 1.4 }}>{label}</div>
    </div>
  )
}

function SubmissionCard({ item }) {
  const lvlColor = { High: '#D85A30', Medium: '#BA7517', Low: '#639922' }
  const lvlBg    = { High: '#FAECE7', Medium: '#FAEEDA', Low: '#EAF3DE' }
  const lvlBorder= { High: '#E8B89F', Medium: '#E0C27A', Low: '#AECB78' }
  const lv = item.risk_level

  return (
    <Link
      to={`/review/${item.submission_id}`}
      style={{
        display: 'block', textDecoration: 'none',
        background: '#fff',
        border: `0.5px solid ${lvlBorder[lv] || '#D3D1C7'}`,
        borderLeft: `4px solid ${lvlColor[lv] || '#D3D1C7'}`,
        borderRadius: 12, padding: '14px 16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'box-shadow 200ms, transform 150ms',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'scale(1.01)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'scale(1)' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#2C2C2A' }}>
              {item.title.replace(/^\[SYNTHETIC[^\]]*\]\s*/, '').replace(/^\[.*?\]\s*/, '')}
            </span>
            {item.is_synthetic && (
              <span style={{
                fontSize: 11, color: '#9B9A96',
                background: '#F1EFE8', border: '0.5px solid #D3D1C7',
                borderRadius: 4, padding: '1px 6px',
              }}>Demo</span>
            )}
          </div>
          <div style={{ fontSize: 12, color: '#9B9A96', marginTop: 4 }}>
            {item.vendor_name} · {item.category}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{
            background: lvlBg[lv], border: `0.5px solid ${lvlBorder[lv]}`,
            borderRadius: 8, padding: '6px 10px', textAlign: 'center', minWidth: 52,
          }}>
            <div style={{ fontSize: 18, fontWeight: 500, color: lvlColor[lv], lineHeight: 1 }}>
              {Math.round(item.risk_score)}
            </div>
            <div style={{ fontSize: 10, color: lvlColor[lv], letterSpacing: '0.04em', marginTop: 2 }}>
              {lv?.toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

function fmt(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [evalData, setEvalData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [seedMsg, setSeedMsg] = useState(null)

  async function load() {
    try {
      const [s, e] = await Promise.all([getDashboardStats(), getModelEval()])
      setStats(s.data); setEvalData(e.data)
    } catch { /* empty */ }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleSeed() {
    setSeeding(true); setSeedMsg(null)
    try {
      const r = await seedGovData(60)
      const d = r.data.risk_distribution || {}
      setSeedMsg(`Loaded ${r.data.count} synthetic records — Low: ${d.Low ?? 0}, Medium: ${d.Medium ?? 0}, High: ${d.High ?? 0}`)
      load()
    } catch { setSeedMsg('Failed to load data.') }
    finally { setSeeding(false) }
  }

  const chartData = stats ? [
    { name: 'High',   value: stats.high_risk,   fill: '#D85A30' },
    { name: 'Medium', value: stats.medium_risk,  fill: '#BA7517' },
    { name: 'Low',    value: stats.low_risk,     fill: '#639922' },
  ] : []

  const r2 = evalData?.r2_score
  const r2Color = r2 == null ? '#9B9A96' : r2 >= 0.8 ? '#639922' : r2 >= 0.6 ? '#BA7517' : '#D85A30'

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0 }}>Dashboard</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#5F5E5A' }}>
            AI-assisted procurement risk overview
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={handleSeed} disabled={seeding} className="v-btn v-btn-secondary" style={{ minHeight: 40, padding: '0 16px', fontSize: 13 }}>
            {seeding ? 'Loading...' : '⊕ Load Indonesia Gov Data'}
          </button>
          <Link to="/submit" className="v-btn v-btn-primary" style={{ minHeight: 40, padding: '0 16px', fontSize: 13, textDecoration: 'none' }}>
            + New Submission
          </Link>
        </div>
      </div>

      {seedMsg && (
        <div style={{
          padding: '10px 14px', background: '#E1F5EE',
          border: '0.5px solid #A8DCC7', borderRadius: 8,
          fontSize: 12, color: '#0F6E56', marginBottom: 20,
        }}>
          ✓ {seedMsg} — All records are synthetic demo data, not real procurement.
        </div>
      )}

      {loading ? (
        /* Skeleton */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="v-skeleton" style={{ height: 80 }} />
          ))}
        </div>
      ) : (
        <>
          {/* Risk summary + metrics */}
          <section aria-label="Risk summary" style={{ marginBottom: 24 }}>
            <h2 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 500, color: '#5F5E5A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Risk Distribution
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 8 }}
              className="grid-3col">
              <MetricCard value={stats?.high_risk ?? 0}   label="High Risk"    color="#D85A30" bg="#FAECE7" border="#E8B89F" />
              <MetricCard value={stats?.medium_risk ?? 0} label="Medium Risk"  color="#BA7517" bg="#FAEEDA" border="#E0C27A" />
              <MetricCard value={stats?.low_risk ?? 0}    label="Low Risk"     color="#639922" bg="#EAF3DE" border="#AECB78" />
              <MetricCard value={stats?.total_submissions ?? 0} label="Total Submissions" />
              <MetricCard value={stats?.pending_review ?? 0} label="Pending Review" color="#BA7517" bg="#FAEEDA" border="#E0C27A" />
              <MetricCard value={stats?.reviewed ?? 0} label="Reviewed" color="#1D9E75" bg="#E1F5EE" border="#A8DCC7" />
            </div>
          </section>

          {/* Chart + Model Eval */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }} className="grid-1col-mobile">

            {/* Bar chart */}
            <div className="v-card" style={{ padding: '16px' }}>
              <h2 style={{ margin: '0 0 4px' }}>Risk Distribution</h2>
              <p style={{ margin: '0 0 16px', fontSize: 12, color: '#9B9A96' }}>Submissions by risk level</p>
              {chartData.every(d => d.value === 0) ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#9B9A96', fontSize: 13 }}>
                  Load demo data to see the chart
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={chartData} barCategoryGap="35%">
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#5F5E5A' }} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9B9A96' }} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '0.5px solid #D3D1C7', fontSize: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} cursor={{ fill: '#F1EFE8' }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {chartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Model Validation */}
            <div className="v-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 16 }}>🤖</span>
                <h2 style={{ margin: 0 }}>Model Validation</h2>
              </div>
              <p style={{ margin: '0 0 16px', fontSize: 12, color: '#9B9A96' }}>
                ML ↔ Rule Engine alignment
              </p>

              {evalData?.status === 'ok' ? (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: 14 }}>
                    <div style={{ fontSize: 40, fontWeight: 500, color: r2Color, lineHeight: 1 }}>
                      {evalData.r2_score}
                    </div>
                    <div style={{ fontSize: 12, color: '#5F5E5A', marginTop: 4 }}>R² Score</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: r2Color, marginTop: 6 }}>
                      {evalData.alignment_level} Alignment
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                    {[
                      { l: 'Samples', v: evalData.sample_count },
                      { l: 'Rule avg', v: evalData.rule_score_mean },
                      { l: 'ML avg', v: evalData.ml_score_mean },
                      { l: 'Rule σ', v: evalData.rule_score_std },
                    ].map(({ l, v }) => (
                      <div key={l} style={{ background: '#F1EFE8', borderRadius: 8, padding: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: '#9B9A96' }}>{l}</div>
                        <div style={{ fontSize: 15, fontWeight: 500, color: '#2C2C2A' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: '#9B9A96', lineHeight: 1.5, margin: 0 }}>
                    {evalData.interpretation}
                  </p>
                </div>
              ) : (
                <div style={{ padding: '24px 0', textAlign: 'center', color: '#9B9A96', fontSize: 13 }}>
                  {evalData?.message || 'Load data to run model evaluation'}
                </div>
              )}
            </div>
          </div>

          {/* Submission queue */}
          <section aria-label="Recent submissions">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ margin: 0 }}>Recent Analyses</h2>
              <Link to="/queue" className="v-btn-ghost" style={{ fontSize: 12, minHeight: 32, padding: '0 10px' }}>
                View all →
              </Link>
            </div>

            {!stats?.recent_analyses?.length ? (
              <div className="v-card" style={{ padding: '48px 16px', textAlign: 'center', color: '#9B9A96' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                <p style={{ margin: 0, fontSize: 14 }}>No submissions yet</p>
                <p style={{ margin: '4px 0 0', fontSize: 12 }}>Load demo data or submit a new procurement</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stats.recent_analyses.map(item => (
                  <SubmissionCard key={item.submission_id} item={item} />
                ))}
              </div>
            )}
          </section>

          {/* Prototype disclaimer */}
          <div style={{
            marginTop: 32, padding: '12px 16px',
            background: '#FAEEDA', border: '0.5px solid #E0C27A',
            borderRadius: 8, fontSize: 12, color: '#633806', lineHeight: 1.6,
          }}>
            <strong>⚠ Prototype Disclaimer:</strong> VERA is a research prototype.
            Risk thresholds and scoring weights are configurable assumptions — not official government standards.
            All demo data is synthetic and fictional. AI assessments are advisory only.
          </div>
        </>
      )}

      <style>{`
        @media (min-width: 640px) { .grid-3col { grid-template-columns: repeat(3,1fr) !important; } }
        @media (max-width: 640px) { .grid-1col-mobile { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
