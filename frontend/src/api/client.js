import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Submissions
export const createSubmission = (data) => api.post('/submissions', data)
export const listSubmissions = (params) => api.get('/submissions', { params })
export const getSubmission = (id) => api.get(`/submissions/${id}`)

// Reviews
export const submitReview = (submissionId, data) => api.post(`/reviews/${submissionId}`, data)
export const getReview = (submissionId) => api.get(`/reviews/${submissionId}`)

// Audit
export const getAuditLog = (params) => api.get('/audit', { params })

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats')

// Dev / Demo
export const seedDemoData = (clear = false) => api.post(`/seed?clear=${clear}`)

export default api
