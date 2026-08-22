import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import NavBar from './components/NavBar'
import Dashboard from './pages/Dashboard'
import Submit from './pages/Submit'
import Queue from './pages/Queue'
import ReviewDetail from './pages/ReviewDetail'
import AuditLog from './pages/AuditLog'

export default function App() {
  return (
    <div className="min-h-screen bg-vera-bg">
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/submit" element={<Submit />} />
          <Route path="/queue" element={<Queue />} />
          <Route path="/review/:id" element={<ReviewDetail />} />
          <Route path="/audit" element={<AuditLog />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
