import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getSubmission, getAuditLog } from '../api/client'
import RiskScoreCard from '../components/RiskScoreCard'
import RiskIndicators from '../components/RiskIndicators'
import ReviewPanel from '../components/ReviewPanel'
import RiskBadge from '../components/RiskBadge'
import AuditTimeline from '../components/AuditTimeline'

function formatCurrency(n) {
  return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(n)
}

function InfoRow({ label, value, mono = false }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2.5 border-b border-vera-border last:border-0">
      <span className="text-sm text-vera-text-muted shrink-0">{label}</span>
      <span className={`text-sm font-medium text-vera-text text-right ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  )
}

export default function ReviewDetail() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [auditEvents, setAuditEvents] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const [subRes, auditRes] = await Promise.all([
        getSubmission(id),
        getAuditLog({ limit: 50 }),
      ])
      setData(subRes.data)
      setAuditEvents(
        (auditRes.data || []).filter(e => e.submission_id === parseInt(id))
      )
    } catch {
      // empty
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  function handleReviewed(reviewData) {
    setData(prev => prev ? { ...prev, review: reviewData } : prev)
    load()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-vera-text-muted">Loading...</div>
    )
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-vera-text-muted">Submission not found.</p>
        <Link to="/queue" className="vera-btn-primary mt-4 inline-block">← Back to Queue</Link>
      </div>
    )
  }

  const { submission, analysis, review } = data

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-vera-text-muted mb-6">
        <Link to="/" className="hover:text-vera-text">Dashboard</Link>
        <span>/</span>
        <Link to="/queue" className="hover:text-vera-text">Review Queue</Link>
        <span>/</span>
        <span className="text-vera-text font-medium truncate max-w-xs">{submission.title}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="vera-section-title break-words">{submission.title}</h1>
            {submission.is_synthetic && (
              <span className="text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-300 px-3 py-1 rounded-full">
                ⚠ Synthetic Demo Data
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-2 flex-wrap text-sm text-vera-text-secondary">
            <span>{submission.vendor_name}</span>
            <span>·</span>
            <span>{submission.category}</span>
            <span>·</span>
            <span>{submission.procurement_date}</span>
          </div>
        </div>
        {analysis && <RiskBadge level={analysis.risk_level} score={analysis.risk_score} showScore size="lg" />}
      </div>

      {/* Main grid */}
      <div className="grid xl:grid-cols-3 gap-6">

        {/* Left column: Score + Indicators + Explanation */}
        <div className="xl:col-span-2 flex flex-col gap-6">

          {/* Risk Score Card */}
          {analysis && <RiskScoreCard analysis={analysis} />}

          {/* Risk Indicators */}
          <RiskIndicators flags={analysis?.rule_flags || []} />

          {/* AI Explanation */}
          {analysis?.explanation && (
            <div className="vera-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-semibold text-vera-primary bg-vera-primary-light px-2.5 py-1 rounded-full">
                  AI Explanation
                </span>
              </div>
              <pre className="text-sm text-vera-text leading-relaxed whitespace-pre-wrap font-sans">
                {analysis.explanation}
              </pre>
            </div>
          )}

          {/* Submission Details */}
          <div className="vera-card p-6">
            <h3 className="vera-subsection-title mb-4">Submission Details</h3>
            <InfoRow label="Requested Amount" value={formatCurrency(submission.requested_amount)} />
            <InfoRow label="Quantity" value={submission.quantity.toLocaleString()} />
            <InfoRow label="Unit Price" value={formatCurrency(submission.unit_price)} />
            <InfoRow label="Reference Price" value={formatCurrency(submission.reference_price)} />
            <InfoRow label="Available Budget" value={formatCurrency(submission.budget_available)} />
            {submission.description && (
              <div className="pt-3">
                <p className="text-xs text-vera-text-muted uppercase tracking-wide font-semibold mb-1.5">Description</p>
                <p className="text-sm text-vera-text leading-relaxed">{submission.description}</p>
              </div>
            )}
            {submission.supporting_info && (
              <div className="pt-3">
                <p className="text-xs text-vera-text-muted uppercase tracking-wide font-semibold mb-1.5">Supporting Information</p>
                <p className="text-sm text-vera-text leading-relaxed">{submission.supporting_info}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Review + Audit */}
        <div className="flex flex-col gap-6">

          {/* Reviewer Decision */}
          <ReviewPanel
            submissionId={submission.id}
            existingReview={review}
            onReviewed={handleReviewed}
          />

          {/* Audit Timeline */}
          <div className="vera-card p-6">
            <h3 className="vera-subsection-title mb-5">Audit Trail</h3>
            <AuditTimeline events={auditEvents} />
          </div>
        </div>
      </div>
    </div>
  )
}
