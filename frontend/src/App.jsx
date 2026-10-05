import React, { useCallback, useEffect, useState } from 'react'
import api from './api.js'
import RiskMap from './components/RiskMap.jsx'
import IntakePanel from './components/IntakePanel.jsx'
import AlertPanel from './components/AlertPanel.jsx'
import ChainDiagram from './components/ChainDiagram.jsx'
import CaseLog from './components/CaseLog.jsx'
import Analytics from './components/Analytics.jsx'

function KpiCard({ label, value, detail, tone = 'blue' }) {
  return (
    <div className={`kpi-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  )
}

export default function App() {
  const [zones, setZones] = useState([])
  const [demoComplaints, setDemoComplaints] = useState(null)
  const [cases, setCases] = useState([])
  const [activeAnalysis, setActiveAnalysis] = useState(null)
  const [activeGraph, setActiveGraph] = useState(null)
  const [selectedZone, setSelectedZone] = useState(null)
  const [focusZone, setFocusZone] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [clock, setClock] = useState(new Date())
  const [timeRange, setTimeRange] = useState('24 hours')

  const handleAlertSelect = useCallback((zoneId) => {
    setSelectedZone(zoneId)
    // User explicitly clicked an alert card in the feed: smoothly focus/zoom to that marker
    setFocusZone({ zoneId, ts: Date.now() })
  }, [])

  const handleMarkerSelect = useCallback((zoneId) => {
    setSelectedZone(zoneId)
    // Manual click on map marker: smoothly fly/zoom to that marker
    setFocusZone({ zoneId, ts: Date.now() })
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const refreshZones = useCallback(async () => {
    try {
      const data = await api.getZones()
      setZones(data)
    } catch (err) {
      setError(err.message)
    }
  }, [])

  useEffect(() => {
    refreshZones()
    api.listDemoComplaints().then(setDemoComplaints).catch(err => setError(err.message))
  }, [refreshZones])

  const handleAnalysis = async (analysis) => {
    setActiveAnalysis(analysis)
    setSelectedZone(analysis.zone_risks?.[0]?.zone_id || null)
    setCases(previous => [
      analysis,
      ...previous.filter(item => item.complaint_id !== analysis.complaint_id),
    ])

    await refreshZones()

    try {
      const graph = await api.getComplaintGraph(analysis.complaint_id)
      setActiveGraph(graph)
    } catch {
      setActiveGraph(null)
    }
  }

  const handleSeedDemo = async (id) => {
    setLoading(true)
    setError(null)

    try {
      const analysis = await api.seedDemoComplaint(id)
      await handleAnalysis(analysis)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitNew = async (payload) => {
    setLoading(true)
    setError(null)

    try {
      const analysis = await api.submitComplaint(payload)
      await handleAnalysis(analysis)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectFromLog = async (complaintId) => {
    const found = cases.find(item => item.complaint_id === complaintId)
    if (found) {
      setActiveAnalysis(found)
      setSelectedZone(found.zone_risks?.[0]?.zone_id || null)
      api.getComplaintGraph(complaintId).then(setActiveGraph).catch(() => setActiveGraph(null))
      return
    }

    try {
      setLoading(true)
      const analysis = await api.seedDemoComplaint(complaintId)
      await handleAnalysis(analysis)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const highRiskZones = zones.filter(zone => zone.current_risk >= 45).length
  const averageConfidence = cases.length
    ? Math.round((cases.reduce((sum, item) => sum + item.confidence, 0) / cases.length) * 100)
    : '--'

  return (
    <div className="app-shell">
     <header className="topbar">
  <div className="brand">
    <div className="brand-icon">
      <span>✦</span>
    </div>

    <div className="brand-copy">
      <h1>CASH-OUT RISK FORECAST</h1>
      <p>Predicting Tomorrow. Safer Communities Today.</p>
    </div>
  </div>

  <nav className="nav-links">
    <span className="active">Dashboard</span>
    <span>Complaints</span>
    <span>Predictions</span>
    <span>Analytics</span>
    <span>Reports</span>
  </nav>

  <div className="topbar-actions">

    <div className="time-filter" aria-label="Forecast time range">
      <span>VIEW RISK FOR</span>

      {['1 hour', '24 hours', '7 days'].map(range => (
        <button
          type="button"
          className={timeRange === range ? 'selected' : ''}
          key={range}
          onClick={() => setTimeRange(range)}
        >
          {range}
        </button>
      ))}
    </div>

    <div className="system-status">
      <span className={`status-dot ${error ? 'offline' : ''}`} />

      <div>
        <strong>
          {error ? 'ENGINE OFFLINE' : 'Prediction Engine Online'}
        </strong>

        <small>
          {clock.toLocaleString()}
        </small>
      </div>
    </div>

    <div className="header-divider" />

    <button className="header-icon-button" type="button" aria-label="Notifications">
      ♧
    </button>

    <div className="header-divider" />

    <button className="header-icon-button" type="button" aria-label="User">
      ●
    </button>

    <div className="unit-divider" />

    <div className="intelligence-unit">
      <strong>CYBERCRIME</strong>
      <strong>INTELLIGENCE UNIT</strong>
    </div>

    <div className="unit-tagline">
      <span>PEOPLE</span>
      <span>SAFER</span>
      <span>TOGETHER</span>
    </div>

  </div>
</header>

      {error && (
        <div className="error-banner">
          Backend not connected: {error}. Start the backend on port 8000.
        </div>
      )}

      <main className="dashboard">
        <section className="dashboard-grid">
          <aside className="left-column">
            <IntakePanel
              demoComplaints={demoComplaints}
              onSeedDemo={handleSeedDemo}
              onSubmitNew={handleSubmitNew}
              loading={loading}
            />
          </aside>

          <section className="map-column">
            <div className="panel-header">
              <div>
                <span className="eyebrow">LIVE GEO-SPATIAL VIEW</span>
                <h2>Predicted Cash-Out Risk Map</h2>
              </div>
              <div className="map-legend">
                <span><i className="low" /> Low</span>
                <span><i className="medium" /> Medium</span>
                <span><i className="high" /> High</span>
                <span><i className="critical" /> Critical</span>
              </div>
            </div>

            <RiskMap
              zones={zones}
              selectedZone={selectedZone}
              onSelectZone={handleMarkerSelect}
              focusZone={focusZone}
              analysisId={activeAnalysis?.complaint_id}
            />

            <p className="map-note">
              <b>DEMO DATA:</b> Markers indicate predicted high-probability cash-out areas based on simulated cybercrime patterns.
            </p>
          </section>

          <aside className="right-column">
            <AlertPanel
              analysis={activeAnalysis}
              zones={zones}
              selectedZone={selectedZone}
              onSelectZone={handleAlertSelect}
            />
          </aside>
        </section>

        <Analytics
          zones={zones}
          activeAnalysis={activeAnalysis}
          cases={cases}
        />
        <section className="lower-grid">
          <div className="wide-panel">
            <ChainDiagram
              graph={activeGraph}
              analysis={activeAnalysis}
              onSelect={handleSelectFromLog}
            />
          </div>

          <div className="wide-panel">
            <CaseLog
              cases={cases}
              onSelect={handleSelectFromLog}
              selectedId={activeAnalysis?.complaint_id}
            />
          </div>
        </section>
      </main>
    </div>
  )
}
