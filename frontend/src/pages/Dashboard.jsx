import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboardStats, seedGovData, getModelEval } from '../api/client'
import { RiskPill } from '../components/RiskBadge'
import RiskDistributionCard from '../components/RiskDistributionCard'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

/* ── helpers ── */
function fmtRp(n) {
  if (n == null) return '—'
  const v = Math.round(n)
  if (v >= 1_000_000_000) return `Rp ${(v / 1_000_000_000).toFixed(1)}M`
  if (v >= 1_000_000)     return `Rp ${(v / 1_000_000).toFixed(0)}jt`
  return 'Rp ' + v.toLocaleString('id-ID')
}

function fmt(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/* ── risk color helpers ── */
const RISK_COLOR  = { High: '#D85A30', Medium: '#BA7517', Low: '#639922' }
const RISK_BG     = { High: '#FAECE7', Medium: '#FAEEDA', Low: '#EAF3DE' }
const RISK_BORDER = { High: '#E8B89F', Medium: '#E0C27A', Low: '#AECB78' }

/* ── Quick metric card ── */
function MetricCard({ value, label, color = '#2C2C2A', bg = '#F1EFE8', border = '#D3D1C7' }) {
  return (
    <div
      className="v-card no-hover"
      style={{ background: bg, border: `0.5px solid ${border}`, padding: '16px', textAlign: 'center' }}
    >
      <div style={{ fontSize: 28, fontWeight: 500, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#5F5E5A', marginTop: 6, lineHeight: 1.4 }}>{label}</div>
    </div>
  )
}

/* ── Indicator chip ── */
function Chip({ label, color, bg, border }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        background: bg,
        border: `0.5px solid ${border}`,
        borderRadius: 4,
        fontSize: 11,
        color,
        fontWeight: 500,
        lineHeight: 1.6,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}

/* ── Submission queue card ── */
function SubmissionCard({ item }) {
  const lv = item.risk_level
  const color  = RISK_COLOR[lv]  || '#D3D1C7'
  const bg     = RISK_BG[lv]     || '#F1EFE8'
  const border = RISK_BORDER[lv] || '#D3D1C7'

  /* build indicator chips */
  const chips = []
  const flags = item.rule_flags || []
  const priceFlag = flags.find(f => f.indicator_type === 'price_deviation')
  const vendorFlag = flags.find(f => f.indicator_type === 'vendor_history')
  const budgetFlag = flags.find(f => f.indicator_type === 'budget_utilization')

  if (priceFlag?.deviation_pct != null) {
    const sign = priceFlag.deviation_pct > 0 ? '+' : ''
    chips.push({
      label: `Price ${sign}${Number(priceFlag.deviation_pct).toFixed(0)}%`,
      color: '#D85A30', bg: '#FAECE7', border: '#E8B89F',
    })
  }
  if (vendorFlag) {
    const n = vendorFlag.vendor_count ?? vendorFlag.value
    if (n != null) chips.push({ label: `Vendor ${n}x`, color: '#BA7517', bg: '#FAEEDA', border: '#E0C27A' })
  }
  if (budgetFlag?.deviation_pct != null) {
    chips.push({
      label: `Budget ${Number(budgetFlag.deviation_pct).toFixed(0)}%`,
      color: '#639922', bg: '#EAF3DE', border: '#AECB78',
    })
  }

  const cleanTitle = item.title
    .replace(/^\[SYNTHETIC[^\]]*\]\s*/, '')
    .replace(/^\[.*?\]\s*/, '')

  return (
    <Link
      to={`/review/${item.submission_id}`}
      style={{
        display: 'block',
        textDecoration: 'none',
        background: '#fff',
        border: `0.5px solid ${border}`,
        borderLeft: `4px solid ${color}`,
        borderRadius: 12,
        padding: '14px 16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'box-shadow 200ms cubic-bezier(0.2,0,0.8,1), transform 200ms cubic-bezier(0.2,0,0.8,1)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'
        e.currentTarget.style.transform = 'scale(1.02)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'
        e.currentTarget.style.transform = 'scale(1)'
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#2C2C2A', lineHeight: 1.4 }}>
              {cleanTitle}
            </span>
            {item.is_synthetic && (
              <span style={{
                fontSize: 10, color: '#9B9A96', background: '#F1EFE8',
                border: '0.5px solid #D3D1C7', borderRadius: 4, padding: '1px 6px',
              }}>Demo</span>
            )}
          </div>
          <div style={{ fontSize: 12, color: '#9B9A96', marginBottom: 8 }}>
            {item.category} · {fmt(item.submitted_at || item.procurement_date)}
          </div>
          {/* Indicator chips */}
          {chips.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {chips.map((c, i) => (
                <Chip key={i} label={c.label} color={c.color} bg={c.bg} border={c.border} />
              ))}
            </div>
          )}
        </div>

        {/* Risk score badge */}
        <div style={{
          background: bg,
          border: `0.5px solid ${border}`,
          borderRadius: 8,
          padding: '6px 10px',
          textAlign: 'center',
          minWidth: 52,
          flexShrink: 0,
        }}>
          <div style={{ fontSize: 18, fontWeight: 500, color, lineHeight: 1 }}>
            {Math.round(item.risk_score)}
          </div>
          <div style={{ fontSize: 10, color, letterSpacing: '0.04em', marginTop: 2 }}>
            {lv?.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 8, borderTop: '0.5px solid #D3D1C720' }}>
        <span style={{ fontSize: 11, color: '#9B9A96' }}>
          {fmtRp(item.requested_amount)} · #{item.submission_id}
        </span>
        <RiskPill level={lv} />
      </div>
    </Link>
  )
}

/* ─────────────────────────────────────────────────────── */
export default function Dashboard() {
  const [stats, setStats]       = useState(null)
  const [evalData, setEvalData] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [seeding, setSeeding]   = useState(false)
  const [seedMsg, setSeedMsg]   = useState(null)

  async function load() {
    try {
      const [s, e] = await Promise.all([getDashboardStats(), getModelEval()])
      setStats(s.data)
      setEvalData(e.data)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleSeed() {
    setSeeding(true)
    setSeedMsg(null)
    try {
      const r = await seedGovData(60)
      const d = r.data.risk_distribution || {}
      setSeedMsg(
        `Loaded ${r.data.count} synthetic records — Low: ${d.Low ?? 0}, Medium: ${d.Medium ?? 0}, High: ${d.High ?? 0}`
      )
      load()
    } catch {
      setSeedMsg('Failed to load data.')
    } finally {
      setSeeding(false)
    }
  }

  const chartData = stats
    ? [
        { name: 'High',   value: stats.high_risk,   fill: '#D85A30' },
        { name: 'Medium', value: stats.medium_risk,  fill: '#BA7517' },
        { name: 'Low',    value: stats.low_risk,     fill: '#639922' },
      ]
    : []

  const r2     = evalData?.r2_score
  const r2Color =
    r2 == null ? '#9B9A96' :
    r2 >= 0.8  ? '#639922' :
    r2 >= 0.6  ? '#BA7517' :
                 '#D85A30'

  /* Derived quick metrics */
  const recentList = stats?.recent_analyses || []
  const avgRisk = recentList.length
    ? Math.round(recentList.reduce((s, x) => s + x.risk_score, 0) / recentList.length)
    : 0
  const maxRisk = recentList.length
    ? Math.round(Math.max(...recentList.map(x => x.risk_score)))
    : 0
  const flaggedBudget = recentList
    .filter(x => x.risk_level === 'High')
    .reduce((s, x) => s + (x.requested_amount || 0), 0)

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

      {/* ── Page header ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        gap: 16, marginBottom: 24, flexWrap: 'wrap',
      }}>
        <div>
          <h1 style={{ margin: 0 }}>Dashboard</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#5F5E5A' }}>
            AI-assisted procurement risk overview
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="v-btn v-btn-secondary"
            style={{ height: 40, minHeight: 40, padding: '0 16px', fontSize: 13 }}
          >
            {seeding ? 'Loading...' : '⊕ Load Indonesia Gov Data'}
          </button>
          <Link
            to="/submit"
            className="v-btn v-btn-primary"
            style={{ height: 40, minHeight: 40, padding: '0 16px', fontSize: 13 }}
          >
            + New Submission
          </Link>
        </div>
      </div>

      {/* ── Seed message ── */}
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="v-skeleton" style={{ height: 80 }} />
          ))}
        </div>
      ) : (
        <>
          {/* ── RiskDistributionCard ── */}
          <section aria-label="Risk distribution" style={{ marginBottom: 16 }}>
            <RiskDistributionCard
              high={stats?.high_risk ?? 0}
              medium={stats?.medium_risk ?? 0}
              low={stats?.low_risk ?? 0}
              r2Score={r2}
              totalSubmissions={stats?.total_submissions ?? 0}
              pendingReview={stats?.pending_review ?? 0}
              reviewed={stats?.reviewed ?? 0}
            />
          </section>

          {/* ── Quick metrics row ── */}
          <section aria-label="Quick metrics" style={{ marginBottom: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}
              className="quick-metrics">
              <MetricCard
                value={avgRisk}
                label="Avg Risk Score"
                color={avgRisk >= 70 ? '#D85A30' : avgRisk >= 40 ? '#BA7517' : '#639922'}
                bg={avgRisk >= 70 ? '#FAECE7' : avgRisk >= 40 ? '#FAEEDA' : '#EAF3DE'}
                border={avgRisk >= 70 ? '#E8B89F' : avgRisk >= 40 ? '#E0C27A' : '#AECB78'}
              />
              <MetricCard
                value={maxRisk}
                label="Max Risk Score"
                color={maxRisk >= 70 ? '#D85A30' : maxRisk >= 40 ? '#BA7517' : '#639922'}
                bg={maxRisk >= 70 ? '#FAECE7' : maxRisk >= 40 ? '#FAEEDA' : '#EAF3DE'}
                border={maxRisk >= 70 ? '#E8B89F' : maxRisk >= 40 ? '#E0C27A' : '#AECB78'}
              />
              <MetricCard
                value={fmtRp(flaggedBudget)}
                label="High-Risk Budget"
                color="#D85A30"
                bg="#FAECE7"
                border="#E8B89F"
              />
            </div>
          </section>

          {/* ── Chart + Model Eval row ── */}
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}
            className="two-col-mobile"
          >
            {/* Bar chart */}
            <div className="v-card no-hover" style={{ padding: '16px' }}>
              <h2 style={{ margin: '0 0 4px' }}>Risk Distribution</h2>
              <p style={{ margin: '0 0 16px', fontSize: 12, color: '#9B9A96' }}>
                Submissions by risk level
              </p>
              {chartData.every(d => d.value === 0) ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#9B9A96', fontSize: 13 }}>
                  Load demo data to see the chart
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={chartData} barCategoryGap="35%">
                    <XAxis
                      dataKey="name" axisLine={false} tickLine={false}
                      tick={{ fontSize: 12, fill: '#5F5E5A' }}
                    />
                    <YAxis
                      allowDecimals={false} axisLine={false} tickLine={false}
                      tick={{ fontSize: 11, fill: '#9B9A96' }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8, border: '0.5px solid #D3D1C7',
                        fontSize: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      }}
                      cursor={{ fill: '#F1EFE8' }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {chartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Model Eval */}
            <div className="v-card no-hover" style={{ padding: '16px' }}>
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
                      { l: 'Samples',  v: evalData.sample_count },
                      { l: 'Rule avg', v: evalData.rule_score_mean },
                      { l: 'ML avg',   v: evalData.ml_score_mean },
                      { l: 'Rule σ',   v: evalData.rule_score_std },
                    ].map(({ l, v }) => (
                      <div key={l} style={{
                        background: '#F1EFE8', borderRadius: 8, padding: '8px', textAlign: 'center',
                      }}>
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

          {/* ── Submission queue ── */}
          <section aria-label="Recent submissions" style={{ marginBottom: 24 }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12,
            }}>
              <h2 style={{ margin: 0 }}>Recent Analyses</h2>
              <Link
                to="/queue"
                className="v-btn-ghost"
                style={{ fontSize: 12, minHeight: 32, padding: '0 10px' }}
              >
                View all →
              </Link>
            </div>

            {recentList.length === 0 ? (
              <div className="v-card no-hover" style={{ padding: '48px 16px', textAlign: 'center', color: '#9B9A96' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                <p style={{ margin: 0, fontSize: 14 }}>No submissions yet</p>
                <p style={{ margin: '4px 0 0', fontSize: 12 }}>
                  Load demo data or submit a new procurement
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* Sort HIGH → MEDIUM → LOW */}
                {[...recentList]
                  .sort((a, b) => {
                    const ord = { High: 0, Medium: 1, Low: 2 }
                    return (ord[a.risk_level] ?? 3) - (ord[b.risk_level] ?? 3)
                  })
                  .map(item => (
                    <SubmissionCard key={item.submission_id} item={item} />
                  ))}
              </div>
            )}
          </section>

          {/* ── Prototype disclaimer ── */}
          <div style={{
            padding: '12px 16px',
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
        @media (max-width: 640px) {
          .two-col-mobile { grid-template-columns: 1fr !important; }
          .quick-metrics  { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>
    </div>
  )
}
