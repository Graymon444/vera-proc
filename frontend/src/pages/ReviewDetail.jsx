import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getSubmission, getAuditLog } from '../api/client'
import RiskScoreCard from '../components/RiskScoreCard'
import RiskIndicators from '../components/RiskIndicators'
import ReviewPanel from '../components/ReviewPanel'
import Collapsible from '../components/Collapsible'
import AuditTimeline from '../components/AuditTimeline'
import { RiskPill } from '../components/RiskBadge'

function fmtRp(n) {
  if (n == null) return '—'
  return 'Rp ' + Math.round(n).toLocaleString('id-ID')
}
function fmtDate(s) {
  if (!s) return '—'
  try { return new Date(s).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) }
  catch { return s }
}

function DataRow({ label, value, alert = false }) {
  return (
    <div className="v-data-row">
      <span className="v-data-row-label">{label}</span>
      <span className="v-data-row-value" style={alert ? { color: 'var(--terra)' } : undefined}>{value}</span>
    </div>
  )
}

const LVL_BG     = { High: 'var(--terra-light)',  Medium: 'var(--ochre-light)',  Low: 'var(--olive-light)'  }
const LVL_BORDER = { High: 'var(--terra-border)', Medium: 'var(--ochre-border)', Low: 'var(--olive-border)' }

export default function ReviewDetail() {
  const { id } = useParams()
  const [data,    setData]    = useState(null)
  const [audit,   setAudit]   = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const [sRes, aRes] = await Promise.all([getSubmission(id), getAuditLog({ limit: 100 })])
      setData(sRes.data)
      setAudit((aRes.data || []).filter(e => e.submission_id === parseInt(id)))
    } catch { /**/ } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [id])

  function handleReviewed(rev) {
    setData(d => d ? { ...d, review: rev } : d)
    load()
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--ink-4)' }}>
      Loading...
    </div>
  )

  if (!data) return (
    <div style={{ maxWidth: 800, margin: '80px auto', textAlign: 'center', color: 'var(--ink-4)' }}>
      <p>Submission not found.</p>
      <Link to="/queue" className="v-btn v-btn-primary" style={{ display: 'inline-flex' }}>← Back to Queue</Link>
    </div>
  )

  const { submission: s, analysis: a, review: r } = data
  const budgetOver  = s.requested_amount > s.budget_available
  const bannerBg    = a ? (LVL_BG[a.risk_level]     || 'var(--bg-sunken)') : 'var(--bg-sunken)'
  const bannerBrd   = a ? (LVL_BORDER[a.risk_level]  || 'var(--border)')    : 'var(--border)'
  const cleanTitle  = s.title.replace(/^\[SYNTHETIC[^\]]*\]\s*/, '').replace(/^\[.*?\]\s*/, '')

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 80px' }}>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-4)', marginBottom: 20 }}>
        <Link to="/"      style={{ color: 'var(--ink-4)', textDecoration: 'none' }}>Dashboard</Link>
        <span>/</span>
        <Link to="/queue" style={{ color: 'var(--ink-4)', textDecoration: 'none' }}>Queue</Link>
        <span>/</span>
        <span style={{ color: 'var(--ink-1)' }}>#{s.id}</span>
      </nav>

      {/* Risk banner */}
      {a && (
        <div style={{
          background: bannerBg, border: `0.5px solid ${bannerBrd}`,
          borderRadius: 'var(--r-lg)', padding: '20px 24px', marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
              <h1 style={{ margin: 0, fontSize: 20 }}>{cleanTitle}</h1>
              {s.is_synthetic && (
                <span style={{ fontSize: 11, background: 'var(--ochre-light)', color: 'var(--ochre-text)', border: '0.5px solid var(--ochre-border)', borderRadius: 'var(--r-sm)', padding: '2px 8px' }}>
                  ⚠ Synthetic Demo
                </span>
              )}
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <span>{s.vendor_name}</span><span>·</span>
              <span>{s.category}</span><span>·</span>
              <span>{s.procurement_date}</span>
            </div>
          </div>
          <RiskPill level={a.risk_level} />
        </div>
      )}

      {/* 2-col layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }} className="detail-grid">

        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {a && <RiskScoreCard analysis={a} />}

          <Collapsible
            title="Why Flagged"
            defaultOpen={a?.risk_level !== 'Low'}
            badge={(a?.rule_flags?.length || 0) > 0 ? `${a.rule_flags.length} indicator${a.rule_flags.length !== 1 ? 's' : ''}` : undefined}
          >
            <RiskIndicators flags={a?.rule_flags || []} />
          </Collapsible>

          {a?.explanation && (
            <Collapsible title="AI Explanation" defaultOpen={false}>
              <pre style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>
                {a.explanation}
              </pre>
            </Collapsible>
          )}

          <Collapsible title="Submission Details" defaultOpen={false}>
            <DataRow label="Vendor Name"       value={s.vendor_name} />
            <DataRow label="Category"          value={s.category} />
            <DataRow label="Specification"     value={s.description || 'Not provided'} />
            <DataRow label="Quantity"          value={s.quantity.toLocaleString()} />
            <DataRow label="Unit Price"        value={fmtRp(s.unit_price)} />
            <DataRow label="Total Value"       value={fmtRp(s.requested_amount)} />
            <DataRow label="Reference Price"   value={fmtRp(s.reference_price)} />
            <DataRow label="Budget Allocated"  value={fmtRp(s.budget_available)} />
            <DataRow
              label="Budget Utilization"
              value={`${((s.requested_amount / s.budget_available) * 100).toFixed(1)}%${budgetOver ? ' (OVER BUDGET)' : ''}`}
              alert={budgetOver}
            />
            <DataRow label="Ministry / Agency" value={s.supporting_info?.split('|')[0]?.replace('Kode Satker:', '').trim() || '—'} />
            <DataRow label="Submission Date"   value={fmtDate(s.submitted_at)} />
            {s.supporting_info && <DataRow label="Supporting Info" value={s.supporting_info} />}
          </Collapsible>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ReviewPanel submissionId={s.id} existingReview={r} onReviewed={handleReviewed} />
          <Collapsible title="Audit Trail" defaultOpen={false} badge={`${audit.length} event${audit.length !== 1 ? 's' : ''}`}>
            <AuditTimeline events={audit} />
          </Collapsible>
        </div>
      </div>

      {/* Mobile sticky action bar */}
      <div className="review-mobile-bar" style={{
        display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'var(--bg-card)', borderTop: '0.5px solid var(--border)',
        padding: '12px 16px', gap: 8, zIndex: 50, boxShadow: 'var(--shadow-lg)',
      }}>
        {['Approve', 'Request Info', 'Reject'].map((label, i) => (
          <button key={label} type="button"
            className={`v-btn ${i === 0 ? 'v-btn-primary' : i === 2 ? 'v-btn-danger' : 'v-btn-secondary'}`}
            style={{ flex: i < 2 ? 1 : 'none', height: 44, fontSize: 13, padding: i === 2 ? '0 16px' : undefined }}
            onClick={() => document.querySelector('.detail-grid > div:last-child')?.scrollIntoView({ behavior: 'smooth' })}>
            {label}
          </button>
        ))}
      </div>

      <style>{`
        @media (min-width: 900px) { .detail-grid { grid-template-columns: 1fr 380px !important; } }
        @media (max-width: 899px) { .review-mobile-bar { display: flex !important; } }
      `}</style>
    </div>
  )
}
