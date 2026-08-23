import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'

const NAV = [
  { to: '/',       end: true,  icon: '⊡', label: 'Dashboard' },
  { to: '/queue',  end: false, icon: '≡', label: 'Review Queue' },
  { to: '/submit', end: false, icon: '+', label: 'New Submission' },
  { to: '/audit',  end: false, icon: '◷', label: 'Audit Log' },
]

export default function NavBar() {
  const [open, setOpen] = useState(false)

  return (
    <header style={{
      background: 'var(--bg-card)',
      borderBottom: '0.5px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>

          {/* Logo */}
          <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 34, height: 34, background: 'var(--forest)',
              borderRadius: 10, display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#FAF7F0', fontWeight: 500, fontSize: 16, flexShrink: 0,
            }}>V</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--ink-1)', lineHeight: 1.2 }}>VERA</div>
              <div style={{ fontSize: 11, color: 'var(--ink-4)', lineHeight: 1 }}>Procurement Verification</div>
            </div>
          </NavLink>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', gap: 4 }} className="vera-nav-desktop" aria-label="Main navigation">
            {NAV.map(item => (
              <NavLink key={item.to} to={item.to} end={item.end}
                className={({ isActive }) => isActive ? 'v-nav-link active' : 'v-nav-link'}>
                <span style={{ fontSize: 15 }} aria-hidden="true">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* AI pill */}
          <div className="vera-ai-pill" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--ochre-light)',
            border: '0.5px solid var(--ochre-border)',
            borderRadius: 20, padding: '4px 12px',
            fontSize: 11, color: 'var(--ochre-text)', whiteSpace: 'nowrap',
          }}>
            ⚡ AI Recommends · Human Decides
          </div>

          {/* Hamburger */}
          <button type="button" onClick={() => setOpen(o => !o)}
            aria-label="Toggle menu" aria-expanded={open}
            className="vera-hamburger"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, fontSize: 18, color: 'var(--ink-3)' }}>
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ background: 'var(--bg-card)', borderTop: '0.5px solid var(--border)', padding: '12px 24px 16px' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NAV.map(item => (
              <NavLink key={item.to} to={item.to} end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) => isActive ? 'v-nav-link active' : 'v-nav-link'}
                style={{ padding: '12px' }}>
                <span style={{ fontSize: 16 }} aria-hidden="true">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: 'var(--ochre)' }}>
            ⚡ AI Recommends · Human Decides
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) { .vera-nav-desktop,.vera-ai-pill { display: none !important; } }
        @media (min-width: 769px) { .vera-hamburger { display: none !important; } }
      `}</style>
    </header>
  )
}
