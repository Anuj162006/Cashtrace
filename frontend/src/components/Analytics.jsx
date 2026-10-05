import React from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

function ChartCard({ title, children }) {
  return (
    <div className="chart-card">
      <p>{title}</p>
      <div className="chart-area">{children}</div>
    </div>
  )
}

function riskColor(score) {
  if (score >= 75) return '#ef4444'
  if (score >= 50) return '#f97316'
  if (score >= 25) return '#f5a623'
  return '#22c55e'
}

function riskLabel(score) {
  if (score >= 75) return 'CRITICAL'
  if (score >= 50) return 'HIGH'
  if (score >= 25) return 'MEDIUM'
  return 'LOW'
}

const ZONE_LANDMARKS = {
  Z21: 'MG Road',
  Z23: 'Shastri Nagar',
  Z25: 'Lake View',
  Z19: 'Madhav Puram',
  Z1: 'Tech Park',
  Z12: 'Pune Central',
  Z14: 'Khadki',
  Z15: 'Koregaon Park',
  Z18: 'Swargate',
  Z24: 'Hadapsar',
}

function CustomBarTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0]
    return (
      <div className="analytics-tooltip">
        <div className="tooltip-label">{label}</div>
        <div className="tooltip-value">
          <span style={{ color: data.fill || '#38bdf8' }}>●</span>
          <strong>{data.value} complaints</strong>
        </div>
        {data.payload?.trend && (
          <div className="tooltip-extra">{data.payload.trend}</div>
        )}
      </div>
    )
  }
  return null
}

function CustomRiskTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0]
    const val = Number(data.value) || 0
    const color = riskColor(val)
    return (
      <div className="analytics-tooltip">
        <div className="tooltip-label">T+{label} Projection</div>
        <div className="tooltip-value">
          <span style={{ color }}>●</span>
          <strong>Risk Score: {val}/100</strong>
          <span style={{ color, fontSize: '9px', fontWeight: 700, marginLeft: '4px' }}>
            ({riskLabel(val)})
          </span>
        </div>
        {data.payload?.phase && (
          <div className="tooltip-extra">{data.payload.phase}</div>
        )}
      </div>
    )
  }
  return null
}

function CustomZoneTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0]
    const val = Number(data.value) || 0
    const color = riskColor(val)
    return (
      <div className="analytics-tooltip">
        <div className="tooltip-label">{data.payload?.zoneFullName || data.payload?.zone}</div>
        <div className="tooltip-value">
          <span style={{ color }}>●</span>
          <strong>Risk: {val}/100</strong>
          <span style={{ color, fontSize: '9px', fontWeight: 700, marginLeft: '4px' }}>
            [{riskLabel(val)}]
          </span>
        </div>
        {data.payload?.activeCases !== undefined && (
          <div className="tooltip-extra">{data.payload.activeCases} active linked cases</div>
        )}
      </div>
    )
  }
  return null
}

function CustomPieTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const item = payload[0]
    return (
      <div className="analytics-tooltip">
        <div className="tooltip-label">{item.name}</div>
        <div className="tooltip-value">
          <span style={{ color: item.payload?.color }}>●</span>
          <strong>{item.value}% of complaints</strong>
        </div>
        {item.payload?.cases && (
          <div className="tooltip-extra">{item.payload.cases} cases recorded</div>
        )}
      </div>
    )
  }
  return null
}

export default function Analytics({ zones = [], activeAnalysis, cases = [] }) {
  // 1. Complaints Trend (incorporates session case count dynamically)
  const sessionCount = cases.length
  const complaintsData = [
    { day: '19 May', complaints: 62, trend: 'Normal intake' },
    { day: '20 May', complaints: 74, trend: '+19% spike' },
    { day: '21 May', complaints: 91, trend: '+23% spike' },
    { day: '22 May', complaints: 118, trend: 'Elevated velocity' },
    { day: '23 May', complaints: 136, trend: 'Multi-hop wave' },
    { day: '24 May', complaints: 142, trend: 'Cluster active' },
    { day: '25 May', complaints: 146, trend: 'High activity' },
    {
      day: '26 May',
      complaints: 168 + sessionCount,
      trend: sessionCount > 0 ? `+${sessionCount} active in session` : 'Peak today',
    },
  ]

  // 2. Predicted Cash-Out Risk (Next 72 Hours)
  // Dynamically shifts curve peak if an active analysis with predicted window is present
  const topAnalysisRisk = activeAnalysis?.zone_risks?.[0]?.risk_score
    ? Math.round(activeAnalysis.zone_risks[0].risk_score)
    : null
  const topWindow = activeAnalysis?.zone_risks?.[0]?.predicted_time_window || ''

  let riskForecastData = []
  if (topAnalysisRisk) {
    if (topWindow.includes('6') || topWindow.includes('12') || topWindow.includes('14:00')) {
      riskForecastData = [
        { time: 'Now', risk: 36, phase: 'Initial routing' },
        { time: '12h', risk: topAnalysisRisk, phase: 'Predicted cash-out peak' },
        { time: '24h', risk: Math.round(topAnalysisRisk * 0.76), phase: 'Secondary ATM withdrawals' },
        { time: '36h', risk: Math.round(topAnalysisRisk * 0.54), phase: 'Mule trail dissipation' },
        { time: '48h', risk: 42, phase: 'Residual activity' },
        { time: '60h', risk: 32, phase: 'Stabilized' },
        { time: '72h', risk: 24, phase: 'Baseline level' },
      ]
    } else if (topWindow.includes('24')) {
      riskForecastData = [
        { time: 'Now', risk: 30, phase: 'Initial routing' },
        { time: '12h', risk: Math.round(topAnalysisRisk * 0.68), phase: 'Velocity buildup' },
        { time: '24h', risk: topAnalysisRisk, phase: 'Predicted cash-out peak' },
        { time: '36h', risk: Math.round(topAnalysisRisk * 0.72), phase: 'Trailing withdrawals' },
        { time: '48h', risk: Math.round(topAnalysisRisk * 0.46), phase: 'Dispersal' },
        { time: '60h', risk: 34, phase: 'Residual' },
        { time: '72h', risk: 26, phase: 'Baseline level' },
      ]
    } else {
      riskForecastData = [
        { time: 'Now', risk: 28, phase: 'Initial staging' },
        { time: '12h', risk: 42, phase: 'Account hops' },
        { time: '24h', risk: 58, phase: 'Cluster velocity' },
        { time: '36h', risk: Math.round(topAnalysisRisk * 0.85), phase: 'Pre-cashout buildup' },
        { time: '48h', risk: topAnalysisRisk, phase: 'Predicted cash-out peak' },
        { time: '60h', risk: 48, phase: 'Trailing activity' },
        { time: '72h', risk: 32, phase: 'Baseline' },
      ]
    }
  } else {
    // Default baseline 72-hour forecast
    riskForecastData = [
      { time: 'Now', risk: 32, phase: 'Current level' },
      { time: '12h', risk: 41, phase: 'Mule account staging' },
      { time: '24h', risk: 47, phase: 'Elevated transactions' },
      { time: '36h', risk: 61, phase: 'Velocity spike' },
      { time: '48h', risk: 78, phase: 'Peak cash-out window' },
      { time: '60h', risk: 58, phase: 'Trailing OTC withdrawals' },
      { time: '72h', risk: 42, phase: 'Post-spike stabilization' },
    ]
  }

  // 3. Top Risk Areas (Combines active prediction and backend zone risk)
  let topRiskAreas = []

  if (activeAnalysis?.zone_risks && activeAnalysis.zone_risks.length > 0) {
    const analysisZones = activeAnalysis.zone_risks.map(zr => {
      const zid = zr.zone_id
      const landmark = ZONE_LANDMARKS[zid] || zid
      const zoneObj = zones.find(z => z.zone_id === zid)
      return {
        zone: landmark,
        zoneFullName: `${landmark} (${zid})`,
        risk: Math.round(Number(zr.risk_score) || 0),
        activeCases: zoneObj?.related_active_cases || 1,
      }
    })

    const otherZones = [
      { zone: 'MG Road', zoneFullName: 'MG Road (Z21)', risk: 87, activeCases: 8 },
      { zone: 'Shastri Nagar', zoneFullName: 'Shastri Nagar (Z23)', risk: 73, activeCases: 5 },
      { zone: 'Lake View', zoneFullName: 'Lake View (Z25)', risk: 68, activeCases: 4 },
      { zone: 'Madhav Puram', zoneFullName: 'Madhav Puram (Z19)', risk: 55, activeCases: 3 },
      { zone: 'Tech Park', zoneFullName: 'Tech Park (Z1)', risk: 48, activeCases: 2 },
    ].filter(oz => !analysisZones.some(az => az.zone === oz.zone))

    topRiskAreas = [...analysisZones, ...otherZones]
      .sort((a, b) => b.risk - a.risk)
      .slice(0, 5)
  } else {
    // If backend zones have real live scores > 0
    const liveZones = [...zones]
      .filter(z => Number(z.current_risk) > 0)
      .sort((a, b) => Number(b.current_risk) - Number(a.current_risk))
      .map(z => {
        const landmark = ZONE_LANDMARKS[z.zone_id] || z.label || z.zone_id
        return {
          zone: landmark,
          zoneFullName: `${landmark} (${z.zone_id})`,
          risk: Math.round(Number(z.current_risk)),
          activeCases: z.related_active_cases || 0,
        }
      })

    const baselineDefaults = [
      { zone: 'MG Road', zoneFullName: 'MG Road (Z21)', risk: 87, activeCases: 8 },
      { zone: 'Shastri Nagar', zoneFullName: 'Shastri Nagar (Z23)', risk: 73, activeCases: 5 },
      { zone: 'Lake View', zoneFullName: 'Lake View (Z25)', risk: 68, activeCases: 4 },
      { zone: 'Madhav Puram', zoneFullName: 'Madhav Puram (Z19)', risk: 55, activeCases: 3 },
      { zone: 'Tech Park', zoneFullName: 'Tech Park (Z1)', risk: 48, activeCases: 2 },
    ]

    const merged = [...liveZones]
    for (const b of baselineDefaults) {
      if (!merged.some(m => m.zone === b.zone)) {
        merged.push(b)
      }
    }
    topRiskAreas = merged.sort((a, b) => b.risk - a.risk).slice(0, 5)
  }

  // Reverse so the highest risk bar is on top in horizontal layout
  const horizontalTopZones = [...topRiskAreas].reverse()

  // 4. Crime Type Distribution (incorporates active case type)
  let crimeDistribution = [
    { name: 'UPI / Mule Fraud', value: 36, color: '#ef4444', cases: 449 },
    { name: 'Online Shopping Fraud', value: 24, color: '#f97316', cases: 299 },
    { name: 'Social Media Impersonation', value: 18, color: '#f5a623', cases: 224 },
    { name: 'Investment Fraud', value: 14, color: '#3b82f6', cases: 174 },
    { name: 'Phishing', value: 8, color: '#22c55e', cases: 102 },
  ]

  if (activeAnalysis?.match_type === 'known_network') {
    crimeDistribution = [
      { name: 'UPI / Mule Fraud', value: 42, color: '#ef4444', cases: 450 + sessionCount },
      { name: 'Online Shopping Fraud', value: 22, color: '#f97316', cases: 299 },
      { name: 'Social Media Impersonation', value: 16, color: '#f5a623', cases: 224 },
      { name: 'Investment Fraud', value: 12, color: '#3b82f6', cases: 174 },
      { name: 'Phishing', value: 8, color: '#22c55e', cases: 102 },
    ]
  }

  return (
    <section className="analytics-grid">
      {/* 1. COMPLAINTS TREND */}
      <ChartCard title="COMPLAINTS TREND">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={complaintsData}
            margin={{ top: 8, right: 8, left: -22, bottom: 0 }}
          >
            <defs>
              <linearGradient id="complaintBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#1e40af" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(41, 67, 93, 0.25)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fill: '#9eb0c4', fontSize: 9 }}
              tickLine={false}
              axisLine={{ stroke: '#29435d' }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: '#6f8399', fontSize: 9 }}
              tickLine={false}
              axisLine={{ stroke: '#29435d' }}
            />
            <Tooltip content={<CustomBarTooltip />} />
            <Bar
              dataKey="complaints"
              fill="url(#complaintBarGrad)"
              radius={[3, 3, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 2. PREDICTED CASH-OUT RISK */}
      <ChartCard title="PREDICTED CASH-OUT RISK (NEXT 72 HOURS)">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={riskForecastData}
            margin={{ top: 8, right: 10, left: -22, bottom: 0 }}
          >
            <defs>
              <linearGradient id="riskAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.4} />
                <stop offset="90%" stopColor="#f97316" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(41, 67, 93, 0.25)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: '#9eb0c4', fontSize: 9 }}
              tickLine={false}
              axisLine={{ stroke: '#29435d' }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: '#6f8399', fontSize: 9 }}
              tickLine={false}
              axisLine={{ stroke: '#29435d' }}
            />
            <Tooltip content={<CustomRiskTooltip />} />
            <Area
              type="monotone"
              dataKey="risk"
              stroke="#f97316"
              strokeWidth={2}
              fill="url(#riskAreaGrad)"
              dot={{ r: 3.5, fill: '#f97316', stroke: '#07101b', strokeWidth: 1.5 }}
              activeDot={{ r: 5.5, fill: '#ffedd5', stroke: '#ea580c', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 3. TOP RISK AREAS */}
      <ChartCard title="TOP RISK AREAS">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={horizontalTopZones}
            layout="vertical"
            margin={{ top: 4, right: 14, left: 2, bottom: 0 }}
          >
            <CartesianGrid stroke="rgba(41, 67, 93, 0.25)" strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis
              type="category"
              dataKey="zone"
              width={78}
              tick={{ fill: '#cbd5e1', fontSize: 9, fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomZoneTooltip />} />
            <Bar dataKey="risk" radius={[0, 3, 3, 0]} barSize={12} isAnimationActive={false}>
              {horizontalTopZones.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={riskColor(entry.risk)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 4. CRIME TYPE DISTRIBUTION */}
      <ChartCard title="CRIME TYPE DISTRIBUTION">
        <div className="crime-chart">
          <ResponsiveContainer width="58%" height="100%">
            <PieChart>
              <Pie
                data={crimeDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="50%"
                outerRadius="78%"
                paddingAngle={2}
                isAnimationActive={false}
              >
                {crimeDistribution.map((entry, index) => (
                  <Cell key={`pie-${index}`} fill={entry.color} stroke="#07101b" strokeWidth={1.5} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          <div className="crime-legend">
            {crimeDistribution.map(item => (
              <div className="crime-legend-row" key={item.name} title={`${item.name}: ${item.value}%`}>
                <span className="crime-dot" style={{ background: item.color }} />
                <span className="crime-name">{item.name}</span>
                <strong>{item.value}%</strong>
              </div>
            ))}
          </div>
        </div>
      </ChartCard>
    </section>
  )
}