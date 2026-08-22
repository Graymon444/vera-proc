import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '⊡' },
  { to: '/queue', label: 'Review Queue', icon: '≡' },
  { to: '/submit', label: 'New Submission', icon: '+' },
  { to: '/audit', label: 'Audit Log', icon: '◷' },
]

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  return (
    <header className="bg-white border-b border-vera-border sticky top-0 z-50 shadow-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-vera-primary rounded-xl flex items-center justify-center text-white font-black text-sm tracking-tight">
              V
            </div>
            <div className="leading-tight">
              <div className="font-bold text-vera-text text-base tracking-tight">VERA</div>
              <div className="text-xs text-vera-text-muted hidden sm:block">
                Verification &amp; Risk Assessment
              </div>
            </div>
          </NavLink>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-btn text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-vera-primary-light text-vera-primary'
                      : 'text-vera-text-secondary hover:text-vera-text hover:bg-vera-bg'
                  }`
                }
              >
                <span className="text-base leading-none">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* AI Disclaimer pill */}
          <div className="hidden lg:flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-full">
            <span>⚡</span>
            AI Recommends. Human Decides.
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-btn text-vera-text-secondary hover:bg-vera-bg"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-vera-border px-4 pb-4">
          <nav className="flex flex-col gap-1 mt-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-btn text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-vera-primary-light text-vera-primary'
                      : 'text-vera-text-secondary hover:text-vera-text hover:bg-vera-bg'
                  }`
                }
              >
                <span>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <p className="text-xs text-amber-600 text-center mt-3 pt-3 border-t border-vera-border">
            ⚡ AI Recommends. Human Decides.
          </p>
        </div>
      )}
    </header>
  )
}
