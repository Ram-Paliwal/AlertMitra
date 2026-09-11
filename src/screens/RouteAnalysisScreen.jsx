import React, { useState } from 'react';
import { Shield, Clock, Navigation, AlertTriangle, ShieldCheck, ArrowRight, Play, Info, Filter, CloudRain } from 'lucide-react';
import RiskMap from '../components/RiskMap';
import RiskTimeline from '../components/RiskTimeline';
import { ROUTE_WAYPOINTS } from '../data/corridorsAndRoutes';

export default function RouteAnalysisScreen({
  journeyData,
  routesList = [],
  selectedRouteId = 'balanced',
  onSelectRoute,
  onStartLiveJourney,
  onSelectHazard,
  blackspots = [],
  greyspots = [],
  hazards = [],
  trystanderCells = []
}) {
  const [layerFilters, setLayerFilters] = useState({
    blackspots: true,
    greyspots: true,
    hazards: true,
    trystander: true,
    weather: true
  });

  const selectedRoute = routesList.find(r => r.id === selectedRouteId) || routesList[1] || routesList[0];

  // Attach waypoints geometry to routes if not already present
  const enrichedRoutes = routesList.map(r => ({
    ...r,
    waypoints: (r.waypoints && r.waypoints.length > 0)
      ? r.waypoints
      : (ROUTE_WAYPOINTS[journeyData?.journeyId]?.[r.id] || ROUTE_WAYPOINTS['nagpur-pench']?.[r.id] || [])
  }));

  const toggleLayer = (layerKey) => {
    setLayerFilters(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  return (
    <div className="route-analysis-layout">
      {/* Left Sidebar: Route Cards, Breakdown, Why This Route, Timeline */}
      <aside className="sidebar-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              ROUTE RISK INTELLIGENCE
            </span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
              {journeyData?.journeyInfo?.title || 'Nagpur → Pench'}
            </h2>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Mode: <b>{journeyData?.vehicle || 'Bike'}</b> • Departure: <b>{journeyData?.departureTime || '7:00 PM'}</b>
            </div>
          </div>
        </div>

        {/* 3 Alternative Route Cards */}
        <div className="route-cards-list">
          {routesList.map(route => {
            const isSelected = route.id === selectedRouteId;
            let riskBadgeClass = 'risk-low';
            if (route.riskLevel === 'high' || route.overallRisk > 60) riskBadgeClass = 'risk-high';
            else if (route.riskLevel === 'moderate' || route.overallRisk > 35) riskBadgeClass = 'risk-moderate';

            return (
              <div
                key={route.id}
                className={`route-card ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectRoute(route.id)}
              >
                <div className="route-card-header">
                  <span className={`badge-tag ${route.isRecommended ? 'badge-recommended' : route.id === 'fastest' ? 'badge-fastest' : 'badge-safer'}`}>
                    {route.isRecommended ? 'RECOMMENDED • ' : ''}{route.badge}
                  </span>
                  <div className={`risk-score-badge ${riskBadgeClass}`}>
                    <Shield size={13} />
                    Risk {route.overallRisk}/100
                  </div>
                </div>

                <div className="route-metrics-row">
                  <div>
                    <span className="route-duration">{route.duration}</span>
                    <span className="route-distance-sub">({route.distance})</span>
                  </div>
                </div>

                {route.tradeoff && (
                  <div className="tradeoff-banner">
                    {route.tradeoff}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Risk Breakdown Component */}
        {selectedRoute && (
          <div className="risk-breakdown-card">
            <div className="breakdown-title">
              <span>Risk Factor Breakdown</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Multi-Factor Score</span>
            </div>

            <div className="meter-group">
              <div className="meter-item">
                <div className="meter-label-row">
                  <span>Crash Exposure (Blackspot History)</span>
                  <span>{selectedRoute.breakdown?.crashExposure}%</span>
                </div>
                <div className="meter-track">
                  <div
                    className={`meter-fill ${selectedRoute.breakdown?.crashExposure > 60 ? 'fill-red' : selectedRoute.breakdown?.crashExposure > 30 ? 'fill-amber' : 'fill-green'}`}
                    style={{ width: `${selectedRoute.breakdown?.crashExposure}%` }}
                  />
                </div>
              </div>

              <div className="meter-item">
                <div className="meter-label-row">
                  <span>Weather at ETA Window</span>
                  <span>{selectedRoute.breakdown?.weatherRisk}%</span>
                </div>
                <div className="meter-track">
                  <div
                    className={`meter-fill ${selectedRoute.breakdown?.weatherRisk > 60 ? 'fill-red' : selectedRoute.breakdown?.weatherRisk > 30 ? 'fill-amber' : 'fill-green'}`}
                    style={{ width: `${selectedRoute.breakdown?.weatherRisk}%` }}
                  />
                </div>
              </div>

              <div className="meter-item">
                <div className="meter-label-row">
                  <span>Active Road Hazards & Debris</span>
                  <span>{selectedRoute.breakdown?.roadHazards}%</span>
                </div>
                <div className="meter-track">
                  <div
                    className={`meter-fill ${selectedRoute.breakdown?.roadHazards > 60 ? 'fill-red' : selectedRoute.breakdown?.roadHazards > 30 ? 'fill-amber' : 'fill-green'}`}
                    style={{ width: `${selectedRoute.breakdown?.roadHazards}%` }}
                  />
                </div>
              </div>

              <div className="meter-item">
                <div className="meter-label-row">
                  <span>Emergency / Trystander Access Time</span>
                  <span>{selectedRoute.breakdown?.emergencyAccess}%</span>
                </div>
                <div className="meter-track">
                  <div
                    className="meter-fill fill-green"
                    style={{ width: `${selectedRoute.breakdown?.emergencyAccess}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Why This Route Causal Explanation Card */}
        {selectedRoute && selectedRoute.whyThisRoute && (
          <div className="why-route-card">
            <h4>
              <Info size={16} color="#0284c7" />
              Why this route score?
            </h4>
            <ul className="why-points-list">
              {selectedRoute.whyThisRoute.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Clickable Risk Timeline */}
        {selectedRoute && (
          <RiskTimeline
            segments={selectedRoute.timelineSegments || []}
            hazardIntersections={selectedRoute.hazardIntersections || []}
            onSelectHazard={onSelectHazard}
          />
        )}

        {/* Action Button: Start Journey */}
        <button
          className="start-journey-btn"
          onClick={() => onStartLiveJourney(selectedRoute)}
        >
          <Play size={18} fill="#ffffff" />
          <span>Start Navigation & GPS Simulation</span>
          <ArrowRight size={18} />
        </button>
      </aside>

      {/* Right Map View Area */}
      <main className="map-view-container">
        {/* Layer Filter Toggles Floating Top-Left */}
        <div style={{ position: 'absolute', top: 15, left: 15, zIndex: 500, display: 'flex', gap: '0.4rem', flexWrap: 'wrap', maxWidth: '75%' }}>
          <button
            onClick={() => toggleLayer('blackspots')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '20px',
              border: '1px solid #ef4444',
              background: layerFilters.blackspots ? '#ef4444' : '#ffffff',
              color: layerFilters.blackspots ? '#ffffff' : '#ef4444',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            ● 38 Blackspots
          </button>
          <button
            onClick={() => toggleLayer('greyspots')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '20px',
              border: '1px solid #f59e0b',
              background: layerFilters.greyspots ? '#f59e0b' : '#ffffff',
              color: layerFilters.greyspots ? '#ffffff' : '#b45309',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            ● 33 Greyspots
          </button>
          <button
            onClick={() => toggleLayer('hazards')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '20px',
              border: '1px solid #2563eb',
              background: layerFilters.hazards ? '#2563eb' : '#ffffff',
              color: layerFilters.hazards ? '#ffffff' : '#2563eb',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            ▲ Community ({hazards.filter(h => h.verificationStatus !== 'EXPIRED').length})
          </button>
          <button
            onClick={() => toggleLayer('trystander')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '20px',
              border: '1px solid #0891b2',
              background: layerFilters.trystander ? '#0891b2' : '#ffffff',
              color: layerFilters.trystander ? '#ffffff' : '#0891b2',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            ✚ 8 Trystander Cells
          </button>
        </div>

        <RiskMap
          routes={enrichedRoutes}
          selectedRouteId={selectedRouteId}
          onSelectRoute={onSelectRoute}
          blackspots={blackspots}
          greyspots={greyspots}
          hazards={hazards}
          trystanderCells={trystanderCells}
          onSelectHazard={onSelectHazard}
          activeLayerFilters={layerFilters}
          customOrigin={journeyData?.journeyInfo?.originCoords}
          customDestination={journeyData?.journeyInfo?.destCoords}
        />
      </main>
    </div>
  );
}
