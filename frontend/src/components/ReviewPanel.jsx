import React, { useState } from 'react'
import { submitReview } from '../api/client'

const DECISIONS = [
  {
    value: 'Verified',
    label: 'Approve',
    desc: 'Submission reviewed and appears in order.',
    color: '#1D9E75',
    bg: '#E1F5EE',
    border: '#A8DCC7',
    activeBorder: '#1D9E75',
  },
  {
    value: 'Needs Further Review',
    label: 'Request Information',
    desc: 'Needs additional documentation before proceeding.',
    color: '#BA7517',
    bg: '#FAEEDA',
    border: '#E0C27A',
    activeBorder: '#BA7517',
  },
  {
    value: 'Dismissed',
    label: 'Dismiss / No Issue',
    desc: 'Reviewed — no significant issues found.',
    color: '#5F5E5A',
    bg: '#F1EFE8',
    border: '#D3D1C7',
    activeBorder: '#5F5E5A',
  },
]

export default function ReviewPanel({ submissionId, existingReview, onReviewed }) {
  const [decision, setDecision] = useState(existingReview?.decision || '')
  const [note, setNote] = useState(existingReview?.reviewer_note || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(!!existingReview)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!decision) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await submitReview(submissionId, { decision, reviewer_note: note })
      setDone(true)
      onReviewed?.(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="v-card" style={{ padding: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 34, height: 34, background: '#E1F5EE',
          borderRadius: 8, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 16, color: '#1D9E75',
        }}>≡</div>
        <div>
          <h3 style={{ margin: 0, fontSize: 16 }}>Reviewer Decision</h3>
          <p style={{ margin: 0, fontSize: 12, color: '#9B9A96' }}>Final decision belongs to the human reviewer</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{
        padding: '10px 12px',
        background: '#F1EFE8',
        border: '0.5px solid #D3D1C7',
        borderRadius: 8,
        fontSize: 12,
        color: '#5F5E5A',
        lineHeight: 1.5,
        marginBottom: 14,
      }}>
        <strong style={{ color: '#2C2C2A' }}>Important:</strong> The AI assessment is advisory only.
        The procurement decision rests entirely with the human reviewer.
      </div>

      {done && !error ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>
            {decision === 'Verified' ? '✅' : decision === 'Needs Further Review' ? '🔍' : '○'}
          </div>
          <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 6px' }}>{decision}</p>
          {note && <p style={{ fontSize: 12, color: '#5F5E5A', fontStyle: 'italic' }}>"{note}"</p>}
          <button className="v-btn-ghost" onClick={() => setDone(false)} style={{ marginTop: 12 }}>
            Update Decision
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {DECISIONS.map(d => (
              <button
                type="button"
                key={d.value}
                onClick={() => setDecision(d.value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px',
                  border: `2px solid ${decision === d.value ? d.activeBorder : d.border}`,
                  borderRadius: 8,
                  background: decision === d.value ? d.bg : '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 150ms',
                  outline: 'none',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" style={{ flexShrink: 0 }}>
                  <circle cx="10" cy="10" r="9"
                    fill={decision === d.value ? d.color : 'transparent'}
                    stroke={d.color} strokeWidth="2"
                  />
                  {decision === d.value && (
                    <circle cx="10" cy="10" r="4" fill="#fff" />
                  )}
                </svg>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#2C2C2A' }}>{d.label}</div>
                  <div style={{ fontSize: 12, color: '#5F5E5A', marginTop: 2 }}>{d.desc}</div>
                </div>
              </button>
            ))}
          </div>

          <div style={{ marginBottom: 14 }}>
            <label className="v-label" htmlFor="rev-note">
              Reviewer Notes <span style={{ color: '#9B9A96' }}>(optional)</span>
            </label>
            <textarea
              id="rev-note"
              className="v-textarea"
              rows={3}
              placeholder="Add notes or justification..."
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          {error && (
            <div style={{
              padding: '10px 12px', background: '#FAECE7',
              border: '0.5px solid #E8B89F', borderRadius: 8,
              fontSize: 12, color: '#712B13', marginBottom: 12,
            }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={!decision || submitting}
            className="v-btn v-btn-primary"
            style={{ width: '100%' }}
          >
            {submitting ? 'Submitting...' : 'Submit Decision'}
          </button>
        </form>
      )}
    </div>
  )
}
