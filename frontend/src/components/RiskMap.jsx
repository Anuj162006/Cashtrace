import React, { useEffect } from 'react'
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  ScaleControl,
  TileLayer,
  useMap,
  ZoomControl,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import puneRoads from '../data/pune_roads.json'
import intelPoints from '../data/intel_points.json'

function getRiskTier(score) {
  if (score >= 70) return 'critical'
  if (score >= 45) return 'high'
  if (score >= 20) return 'medium'
  return 'low'
}

function riskColor(score) {
  if (score >= 70) return '#ef4444' // Critical (Red)
  if (score >= 45) return '#f97316' // High (Orange)
  if (score >= 20) return '#facc15' // Medium (Yellow)
  return '#00f0ff'                 // Low (Cyan)
}

function riskLabel(score) {
  if (score >= 70) return 'CRITICAL'
  if (score >= 45) return 'HIGH'
  if (score >= 20) return 'MEDIUM'
  return 'LOW'
}

/*
 * DEMO LOCATIONS
 * Real Pune landmarks matching backend prediction coordinates.
 */
const demoZones = [
  {
    zone_id: 'Z21',
    label: 'MG Road – Central Market',
    lat: 18.5204,
    lng: 73.8567,
    current_risk: 87,
    related_active_cases: 8,
    predicted_time_window: '6 – 12 hours',
  },
  {
    zone_id: 'Z23',
    label: 'Shastri Nagar – Metro Station',
    lat: 18.5314,
    lng: 73.8446,
    current_risk: 73,
    related_active_cases: 5,
    predicted_time_window: '12 – 24 hours',
  },
  {
    zone_id: 'Z25',
    label: 'Lake View – City Mall',
    lat: 18.5362,
    lng: 73.8958,
    current_risk: 68,
    related_active_cases: 4,
    predicted_time_window: '6 – 24 hours',
  },
  {
    zone_id: 'Z19',
    label: 'Madhav Puram',
    lat: 18.5018,
    lng: 73.8553,
    current_risk: 55,
    related_active_cases: 3,
    predicted_time_window: '24 – 48 hours',
  },
  {
    zone_id: 'Z1',
    label: 'Tech Park',
    lat: 18.5662,
    lng: 73.7774,
    current_risk: 48,
    related_active_cases: 2,
    predicted_time_window: '24 – 48 hours',
  },
]

function ZoomToPrediction({ zones, focusZone, markerRefs }) {
  const map = useMap()
  const lastFocusRef = React.useRef(null)

  useEffect(() => {
    if (map) {
      window.__leafletMap = map
    }
  }, [map])

  useEffect(() => {
    if (!focusZone) return
    const zoneId = typeof focusZone === 'object' ? focusZone.zoneId : focusZone
    const token = typeof focusZone === 'object' ? focusZone.ts : focusZone
    if (!zoneId) return

    // Only fly if this is a fresh user-initiated focus event
    if (lastFocusRef.current === token) return
    lastFocusRef.current = token

    const selected = zones.find(zone => zone.zone_id === zoneId)
    if (selected && map) {
      map.flyTo([selected.lat, selected.lng], 13.5, {
        duration: 0.8,
      })

      // Open marker popup smoothly when focused via feed alert or manual click
      if (markerRefs?.current?.[zoneId]) {
        setTimeout(() => {
          markerRefs.current[zoneId]?.openPopup()
        }, 350)
      }
    }
  }, [map, zones, focusZone, markerRefs])

  return null
}

function PopupController({ analysisId }) {
  const map = useMap()
  const prevAnalysisRef = React.useRef(analysisId)

  useEffect(() => {
    // Only close open popups when demo scenario replay loads a new analysis, NOT when user clicks a marker
    if (prevAnalysisRef.current && prevAnalysisRef.current !== analysisId && map) {
      map.closePopup()
    }
    prevAnalysisRef.current = analysisId
  }, [analysisId, map])

  return null
}

/*
 * Creates refined multi-ring radar hotspots matching the reference screenshot.
 * Small white center dot + colored core ring + glowing concentric ring + soft radial halo.
 */
function createRiskIcon(score, selected) {
  const tier = getRiskTier(score)

  return L.divIcon({
    className: 'risk-marker-wrapper',
    html: `
      <div class="cyber-hotspot hotspot-${tier} ${selected ? 'selected' : ''}">
        ${selected ? '<div class="hotspot-radar-wave"></div><div class="hotspot-radar-wave-2"></div>' : ''}
        <div class="hotspot-halo"></div>
        <div class="hotspot-ring"></div>
        <div class="hotspot-core"></div>
        <div class="hotspot-center-dot"></div>
      </div>
    `,
    iconSize: [60, 60],
    iconAnchor: [30, 30],
    popupAnchor: [0, -18],
  })
}

/*
 * Detailed Dark Map Vector Layer:
 * Renders hierarchical blue road network, river contours, real intelligence points,
 * and typographic map labels matching reference screenshot.
 */
function DetailedDarkVectorLayers() {
  const map = useMap()

  useEffect(() => {
    if (!map) return

    const layerGroup = L.layerGroup()

    // 1. Minor roads: subtle dark blue
    L.geoJSON(puneRoads, {
      filter: f => (f.properties.hw || '').includes('secondary'),
      style: {
        color: '#1d4ed8',
        weight: 1.0,
        opacity: 0.45,
        lineCap: 'round',
        lineJoin: 'round',
      },
    }).addTo(layerGroup)

    // 2. Normal roads: medium blue
    L.geoJSON(puneRoads, {
      filter: f => (f.properties.hw || '') === 'primary' || (f.properties.hw || '') === 'primary_link',
      style: {
        color: '#0284c7',
        weight: 1.5,
        opacity: 0.75,
        lineCap: 'round',
        lineJoin: 'round',
      },
    }).addTo(layerGroup)

    // 3. Major roads: brighter electric blue
    L.geoJSON(puneRoads, {
      filter: f => (f.properties.hw || '').includes('trunk'),
      style: {
        color: '#38bdf8',
        weight: 1.9,
        opacity: 0.88,
        lineCap: 'round',
        lineJoin: 'round',
      },
    }).addTo(layerGroup)

    // 4. Important network routes: cyan highlight
    L.geoJSON(puneRoads, {
      filter: f => ['Katraj - Dehu Road Bypass', 'NH60', 'NH65', 'Bajirao Road'].includes(f.properties.name),
      style: {
        color: '#00f0ff',
        weight: 2.2,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      },
    }).addTo(layerGroup)

    // 5. Mula-Mutha River
    L.geoJSON(puneRoads, {
      filter: f => f.properties.type === 'river',
      style: {
        color: '#0284c7',
        weight: 2.8,
        opacity: 0.70,
        lineCap: 'round',
        lineJoin: 'round',
      },
    }).addTo(layerGroup)

    // 6. Real small intelligence points from project data (ATMs & monitoring nodes)
    intelPoints.forEach(pt => {
      L.marker([pt.lat, pt.lng], {
        interactive: false,
        icon: L.divIcon({
          className: 'intel-dot intel-' + pt.type,
          iconSize: [4, 4],
          iconAnchor: [2, 2],
        }),
      }).addTo(layerGroup)
    })

    // 7. Map Labels matching Reference styling
    const labels = [
      { name: 'Pune', lat: 18.517, lng: 73.856, type: 'main' },
      { name: 'Shivajinagar', lat: 18.531, lng: 73.850, type: 'text' },
      { name: 'Kothrud', lat: 18.504, lng: 73.805, type: 'text' },
      { name: 'Baner', lat: 18.559, lng: 73.786, type: 'text' },
      { name: 'Aundh', lat: 18.560, lng: 73.808, type: 'text' },
      { name: 'Hinjawadi', lat: 18.591, lng: 73.738, type: 'text' },
      { name: 'Pimpri Chinchwad', lat: 18.627, lng: 73.805, type: 'text' },
      { name: 'Khadki', lat: 18.562, lng: 73.848, type: 'text' },
      { name: 'Dhanori', lat: 18.585, lng: 73.888, type: 'text' },
      { name: '✈ Pune International Airport', lat: 18.579, lng: 73.908, type: 'badge' },
      { name: 'NH-753F', lat: 18.548, lng: 73.924, type: 'badge' },
      { name: 'Kharadi', lat: 18.552, lng: 73.942, type: 'badge' },
      { name: 'Magarpatta', lat: 18.516, lng: 73.928, type: 'text' },
      { name: 'Hadapsar', lat: 18.502, lng: 73.935, type: 'text' },
      { name: 'Katraj', lat: 18.455, lng: 73.858, type: 'text' },
      { name: 'Warje', lat: 18.481, lng: 73.792, type: 'text' },
      { name: 'Mula Mutha River', lat: 18.535, lng: 73.775, type: 'river' },
    ]

    labels.forEach(l => {
      let className = 'map-text-label'
      if (l.type === 'main') className = 'map-text-label-main'
      if (l.type === 'badge') className = 'map-pill-badge'
      if (l.type === 'river') className = 'map-river-label'

      L.marker([l.lat, l.lng], {
        interactive: false,
        icon: L.divIcon({
          className,
          html: l.name,
          iconSize: null,
          iconAnchor: l.type === 'main' ? [25, 10] : [0, 0],
        }),
      }).addTo(layerGroup)
    })

    layerGroup.addTo(map)

    return () => {
      map.removeLayer(layerGroup)
    }
  }, [map])

  return null
}

function MapOverlay() {
  return (
    <>
      {/* Location */}
      <div className="map-location-overlay">
        <h3>Pune</h3>
        <span>Maharashtra, India</span>
      </div>

      {/* Statistics */}
      <div className="map-stats-overlay">
        <div>
          <span>Total Complaints</span>
          <strong>1,248</strong>
          <small className="positive">↑ 32%</small>
        </div>

        <div>
          <span>Linked Transactions</span>
          <strong>4,736</strong>
          <small className="positive">↑ 18%</small>
        </div>

        <div>
          <span>Predicted Hotspots</span>
          <strong>12</strong>
        </div>

        <div>
          <span>Monitoring ATMs</span>
          <strong>286</strong>
        </div>
      </div>

      {/* Map mode */}
      <div className="map-mode-overlay">
        <span className="map-mode-dot" />
        Street
        <span className="map-chevron">⌄</span>
      </div>

      {/* Risk legend */}
      <div className="map-risk-legend">
        <span>Predicted Risk</span>

        <div className="risk-gradient" />

        <div className="risk-gradient-labels">
          <small>Low</small>
          <small>Medium</small>
          <small>High</small>
          <small>Critical</small>
        </div>
      </div>
    </>
  )
}

export default function RiskMap({
  zones = [],
  selectedZone,
  onSelectZone,
  focusZone,
  analysisId,
}) {
  const markerRefs = React.useRef({})

  const ZONE_LANDMARKS = {
    Z21: 'MG Road – Central Market',
    Z23: 'Shastri Nagar – Metro Station',
    Z25: 'Lake View – City Mall',
    Z19: 'Madhav Puram',
    Z1: 'Tech Park',
    Z12: 'Pune Central',
    Z14: 'Khadki',
    Z15: 'Koregaon Park',
    Z18: 'Swargate',
    Z24: 'Hadapsar',
  }

  // Combine backend zones with demo metadata to ensure complete coverage
  const allZones = (zones && zones.length > 0 ? zones : demoZones).map(z => {
    const demo = demoZones.find(d => d.zone_id === z.zone_id)
    return {
      ...z,
      label: ZONE_LANDMARKS[z.zone_id] || demo?.label || z.label || `Zone ${z.zone_id}`,
      current_risk: Number(z.current_risk) > 0 ? Number(z.current_risk) : (demo?.current_risk || 0),
      related_active_cases: z.related_active_cases || demo?.related_active_cases || 0,
      predicted_time_window: demo?.predicted_time_window || '6 – 24 hours',
    }
  })

  // Display markers for all active/elevated risk zones plus selected zone and key Pune landmarks
  const importantZones = allZones.filter(
    z => z.current_risk >= 20 || z.zone_id === selectedZone || ['Z21', 'Z23', 'Z25', 'Z19', 'Z1'].includes(z.zone_id)
  )

  const selectedZoneObj = allZones.find(z => z.zone_id === selectedZone)

  return (
    <div className="risk-map">
      <MapContainer
        center={[18.522, 73.858]}
        zoom={12.35}
        scrollWheelZoom
        zoomControl={false}
        style={{
          height: '100%',
          width: '100%',
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <DetailedDarkVectorLayers />

        <ZoomControl position="topright" />

        <ScaleControl
          position="bottomleft"
          imperial={false}
        />

        {/* Selected Prediction Geographic Risk Range Highlight */}
        {selectedZoneObj && (
          <Circle
            center={[selectedZoneObj.lat, selectedZoneObj.lng]}
            radius={2000}
            pathOptions={{
              color: riskColor(Math.round(Number(selectedZoneObj.current_risk))),
              fillColor: riskColor(Math.round(Number(selectedZoneObj.current_risk))),
              fillOpacity: 0.12,
              weight: 1.6,
              dashArray: '5, 5',
              className: 'risk-radius-circle',
            }}
          />
        )}

        <ZoomToPrediction
          zones={allZones}
          focusZone={focusZone}
          markerRefs={markerRefs}
        />

        <PopupController analysisId={analysisId} />

        {importantZones.map(zone => {
          const score = Math.round(Number(zone.current_risk))
          const color = riskColor(score)
          const selected = zone.zone_id === selectedZone

          return (
            <Marker
              key={zone.zone_id}
              ref={el => {
                if (el) markerRefs.current[zone.zone_id] = el
              }}
              position={[zone.lat, zone.lng]}
              icon={createRiskIcon(score, selected)}
              eventHandlers={{
                click: () => onSelectZone(zone.zone_id),
              }}
            >
              <Popup>
                <div className="prediction-popup">
                  <div className="popup-title">
                    High-Probability Withdrawal Area
                  </div>

                  <p>
                    <b>{zone.label}</b>
                  </p>

                  <div
                    className="popup-score"
                    style={{ color }}
                  >
                    Risk Score {score}/100
                  </div>

                  <div className="popup-row">
                    <span>Risk Level</span>
                    <b style={{ color }}>{riskLabel(score)}</b>
                  </div>

                  <div className="popup-row">
                    <span>Confidence</span>
                    <b>
                      {score >= 70
                        ? '82%'
                        : score >= 45
                        ? '76%'
                        : '68%'}
                    </b>
                  </div>

                  <div className="popup-row">
                    <span>Expected window</span>
                    <b>
                      {zone.predicted_time_window || '6 – 24 hours'}
                    </b>
                  </div>

                  <hr />

                  <small>
                    Related cases: {zone.related_active_cases || 0}
                  </small>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      <MapOverlay />
    </div>
  )
}