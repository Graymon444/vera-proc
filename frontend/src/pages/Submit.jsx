import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSubmission } from '../api/client'

const CATEGORIES = [
  'IT Equipment', 'Office Supplies', 'Medical Supplies', 'Construction',
  'Consulting Services', 'Vehicle Fleet', 'Software Licenses', 'Furniture',
  'Security Services', 'Catering', 'Other',
]

const INITIAL = {
  title: '',
  category: '',
  requested_amount: '',
  quantity: '',
  unit_price: '',
  vendor_name: '',
  budget_available: '',
  reference_price: '',
  procurement_date: '',
  description: '',
  supporting_info: '',
}

function Field({ label, required, hint, children }) {
  return (
    <div>
      <label className="vera-label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {hint && <p className="text-xs text-vera-text-muted mb-1.5">{hint}</p>}
      {children}
    </div>
  )
}

export default function Submit() {
  const navigate = useNavigate()
  const [form, setForm] = useState(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  function set(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  // Auto-compute requested amount
  function handleQtyOrPrice(key, value) {
    const updated = { ...form, [key]: value }
    const qty = parseFloat(updated.quantity)
    const price = parseFloat(updated.unit_price)
    if (!isNaN(qty) && !isNaN(price)) {
      updated.requested_amount = (qty * price).toFixed(2)
    }
    setForm(updated)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        requested_amount: parseFloat(form.requested_amount),
        quantity: parseFloat(form.quantity),
        unit_price: parseFloat(form.unit_price),
        budget_available: parseFloat(form.budget_available),
        reference_price: parseFloat(form.reference_price),
      }
      const res = await createSubmission(payload)
      navigate(`/review/${res.data.submission.id}`)
    } catch (err) {
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) {
        setError(detail.map(d => d.msg).join('; '))
      } else {
        setError(detail || 'Submission failed. Please check your inputs.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="vera-section-title">New Procurement Submission</h1>
        <p className="text-vera-text-secondary mt-1">
          Submit a procurement request for AI-assisted risk assessment.
        </p>
      </div>

      {/* AI advisory notice */}
      <div className="bg-vera-primary-light border border-blue-200 rounded-xl p-4 mb-6 text-sm text-vera-primary leading-relaxed">
        <strong>AI Advisory System</strong> — After submission, VERA will automatically analyze this
        request for potential risk indicators. The analysis is advisory only and does not
        approve or reject the procurement.
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Section: Basic Info */}
        <div className="vera-card p-6">
          <h2 className="vera-subsection-title mb-5">Procurement Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="Procurement Title" required>
                <input
                  className="vera-input"
                  placeholder="e.g. Office Laptop Procurement Q3 2025"
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  required
                />
              </Field>
            </div>
            <Field label="Category" required>
              <select
                className="vera-input"
                value={form.category}
                onChange={e => set('category', e.target.value)}
                required
              >
                <option value="">Select category...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Procurement Date" required>
              <input
                type="date"
                className="vera-input"
                value={form.procurement_date}
                onChange={e => set('procurement_date', e.target.value)}
                required
              />
            </Field>
            <Field label="Vendor Name" required>
              <input
                className="vera-input"
                placeholder="e.g. Tech Solutions Sdn Bhd"
                value={form.vendor_name}
                onChange={e => set('vendor_name', e.target.value)}
                required
              />
            </Field>
          </div>
        </div>

        {/* Section: Financial */}
        <div className="vera-card p-6">
          <h2 className="vera-subsection-title mb-1">Financial Information</h2>
          <p className="text-xs text-vera-text-muted mb-5">
            Requested amount is auto-calculated from quantity × unit price.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Quantity" required>
              <input
                type="number" min="0.01" step="any"
                className="vera-input"
                placeholder="e.g. 10"
                value={form.quantity}
                onChange={e => handleQtyOrPrice('quantity', e.target.value)}
                required
              />
            </Field>
            <Field label="Unit Price (MYR)" required>
              <input
                type="number" min="0.01" step="any"
                className="vera-input"
                placeholder="e.g. 3500.00"
                value={form.unit_price}
                onChange={e => handleQtyOrPrice('unit_price', e.target.value)}
                required
              />
            </Field>
            <Field
              label="Requested Amount (MYR)"
              required
              hint="Auto-calculated. You can override if needed."
            >
              <input
                type="number" min="0.01" step="any"
                className="vera-input"
                value={form.requested_amount}
                onChange={e => set('requested_amount', e.target.value)}
                required
              />
            </Field>
            <Field label="Reference / Market Price (MYR)" required
              hint="Standard market or catalogue price for comparison">
              <input
                type="number" min="0.01" step="any"
                className="vera-input"
                placeholder="e.g. 3000.00"
                value={form.reference_price}
                onChange={e => set('reference_price', e.target.value)}
                required
              />
            </Field>
            <Field label="Available Budget (MYR)" required>
              <input
                type="number" min="0.01" step="any"
                className="vera-input"
                placeholder="e.g. 100000.00"
                value={form.budget_available}
                onChange={e => set('budget_available', e.target.value)}
                required
              />
            </Field>
          </div>
        </div>

        {/* Section: Description */}
        <div className="vera-card p-6">
          <h2 className="vera-subsection-title mb-5">Description &amp; Supporting Information</h2>
          <div className="flex flex-col gap-4">
            <Field label="Description">
              <textarea
                className="vera-input resize-none"
                rows={3}
                placeholder="Brief description of the procurement purpose..."
                value={form.description}
                onChange={e => set('description', e.target.value)}
              />
            </Field>
            <Field label="Supporting Information (optional)"
              hint="Any additional context, justification, or reference numbers">
              <textarea
                className="vera-input resize-none"
                rows={2}
                placeholder="e.g. Reference: MOU-2025-001, approved by department head..."
                value={form.supporting_info}
                onChange={e => set('supporting_info', e.target.value)}
              />
            </Field>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="vera-btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="vera-btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting & Analyzing...' : 'Submit for Risk Assessment →'}
          </button>
        </div>
      </form>
    </div>
  )
}
