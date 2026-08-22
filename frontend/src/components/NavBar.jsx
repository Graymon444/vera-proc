import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'

const NAV = [
  { to: '/',       end: true,  icon: '⊡', label: 'Dashboard' },
  { to: '/queue',  end: false, icon: '≡', label: 'Review Queue' },
  { to: '/submit', end: false, icon: '+', label: 'New Submission' },
  { to: '/audit',  end: false, icon: '◷', label: 'Audit Log' },
]

// Warm palette — all values from design tokens
const C = {
  navBg:      '#FEFCF8',
  border:     '#D6D1C8',
  logoTeal:   '#1A9B6E',
  textPri:    '#2A2722',
  textMuted:  '#948E87',
  textSecond: '#5C5750',
  pillBg:     '#FAF0DC',
  pillBorder: '#DDBF78',
  pillText:   '#613604',
  mobilePill: '#B87215',
}

export default function NavBar() {
  const [open, setOpen] = useState(false)

  return (
    <header style={{
      background: C.navBg,
      borderBottom: `0.5px solid ${C.border}`,
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: `0 1px 0 ${C.border}`,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>

          {/* Logo */}
          <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 34, height: 34, background: C.logoTeal,
              borderRadius: 10, display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#fff', fontWeight: 500, fontSize: 16, flexShrink: 0,
            }}>V</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 500, color: C.textPri, lineHeight: 1.2 }}>VERA</div>
              <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1 }}>Procurement Verification</div>
            </div>
          </NavLink>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', gap: 4 }} className="vera-nav-desktop" aria-label="Main navigation">
            {NAV.map(item => (
              <NavLink
                key={item.to} to={item.to} end={item.end}
                className={({ isActive }) => isActive ? 'v-nav-link active' : 'v-nav-link'}
              >
                <span style={{ fontSize: 15 }} aria-hidden="true">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* AI pill */}
          <div className="vera-ai-pill" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: C.pillBg, border: `0.5px solid ${C.pillBorder}`,
            borderRadius: 20, padding: '4px 12px',
            fontSize: 11, color: C.pillText, whiteSpace: 'nowrap',
          }}>
            ⚡ AI Recommends · Human Decides
          </div>

          {/* Hamburger */}
          <button
            type="button" onClick={() => setOpen(o => !o)}
            aria-label="Toggle menu" aria-expanded={open}
            className="vera-hamburger"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, fontSize: 18, color: C.textSecond }}
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ background: C.navBg, borderTop: `0.5px solid ${C.border}`, padding: '12px 24px 16px' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NAV.map(item => (
              <NavLink
                key={item.to} to={item.to} end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) => isActive ? 'v-nav-link active' : 'v-nav-link'}
                style={{ padding: '12px' }}
              >
                <span style={{ fontSize: 16 }} aria-hidden="true">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: C.mobilePill }}>
            ⚡ AI Recommends · Human Decides
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .vera-nav-desktop { display: none !important; }
          .vera-ai-pill     { display: none !important; }
        }
        @media (min-width: 769px) {
          .vera-hamburger   { display: none !important; }
        }
      `}</style>
    </header>
  )
}
