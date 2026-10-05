const API_BASE = 'http://127.0.0.1:8000'

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new Error(detail.detail || `Request failed: ${res.status}`)
  }
  return res.json()
}

export const api = {
  getZones: () => request('/zones'),
  listDemoComplaints: () => request('/demo/complaints'),
  seedDemoComplaint: (id) => request(`/demo/seed/${id}`, { method: 'POST' }),
  submitComplaint: (payload) => request('/complaint', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  getComplaintGraph: (id) => request(`/complaint/${id}/graph`),
  getComplaintExplanation: (id) => request(`/complaint/${id}/explanation`),
}

export default api
