import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, ShieldCheck, Navigation, Volume2, VolumeX, ShieldAlert, Sparkles, Locate, FastForward } from 'lucide-react';
import RiskMap from '../components/RiskMap';
import { ROUTE_WAYPOINTS } from '../data/corridorsAndRoutes';
import { evaluateGeofences, playAlertChime } from '../engine/geofenceEngine';
import { getETAWeatherForecast } from '../engine/weatherEngine';

export default function LiveJourneyScreen({
  route,
  allHazards = [],
  blackspots = [],
  greyspots = [],
  trystanderCells = [],
  onSelectHazard,
  onTriggerRerouteModal
}) {
  const waypoints = (route?.waypoints && route?.waypoints.length > 0)
    ? route.waypoints
    : (ROUTE_WAYPOINTS['nagpur-pench']?.[route?.id || 'balanced'] || []);

  // Simulation State
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(2); // 1x, 2x, 5x, 10x
  const [progressIndex, setProgressIndex] = useState(0); // waypoint interpolation index
  const [progressFraction, setProgressFraction] = useState(0); // 0 to 1 between waypoints
  const [useRealGPS, setUseRealGPS] = useState(false);
  const [realGPSPos, setRealGPSPos] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const watchIdRef = useRef(null);

  // Proactive Geofence Alert State
  const [activeAlert, setActiveAlert] = useState(null);
  const [nextRisk, setNextRisk] = useState(null);
  const [clearedAlert, setClearedAlert] = useState(null);
  const previouslyTriggeredIds = useRef(new Set());

  // Computed current vehicle position
  const currentPos = React.useMemo(() => {
    if (useRealGPS && realGPSPos) {
      return { ...realGPSPos, autoPan: true };
    }

    if (!waypoints.length) return { lat: 21.1467, lng: 79.0833, heading: 0, autoPan: true };
    if (progressIndex >= waypoints.length - 1) {
      const last = waypoints[waypoints.length - 1];
      return { lat: last[0], lng: last[1], heading: 0, autoPan: true };
    }

    const p1 = waypoints[progressIndex];
    const p2 = waypoints[progressIndex + 1];

    const lat = p1[0] + (p2[0] - p1[0]) * progressFraction;
    const lng = p1[1] + (p2[1] - p1[1]) * progressFraction;

    // Heading angle
    const angle = (Math.atan2(p2[1] - p1[1], p2[0] - p1[0]) * 180) / Math.PI;

    return { lat, lng, heading: 90 - angle, autoPan: true };
  }, [waypoints, progressIndex, progressFraction, useRealGPS, realGPSPos]);

  // Total journey progress calculation
  const totalDistanceKm = parseFloat(route?.distanceKm || route?.distance) || 102.5;
  const currentKm = Math.min(
    totalDistanceKm,
    ((progressIndex + progressFraction) / Math.max(1, waypoints.length - 1)) * totalDistanceKm
  ).toFixed(1);

  const remainingKm = Math.max(0, (totalDistanceKm - parseFloat(currentKm))).toFixed(1);
  const remainingMinutes = Math.max(0, Math.round((parseFloat(remainingKm) / totalDistanceKm) * (route?.durationMinutes || 120)));

  // ETA Weather at current position
  const weatherAtCurrent = getETAWeatherForecast(
    route?.destinationName || "En Route Highway",
    "19:00",
    ((parseFloat(currentKm) / totalDistanceKm) * (route?.durationMinutes || 120))
  );

  // Combined all risk spots for geofencing
  const combinedRiskSpots = React.useMemo(() => {
    const list = [];
    blackspots.forEach(b => list.push({ ...b, categoryType: 'Blackspot', radius: b.radius || 400 }));
    greyspots.forEach(g => list.push({ ...g, categoryType: 'Greyspot', radius: g.radius || 350 }));
    allHazards.forEach(h => {
      if (h.verificationStatus !== 'EXPIRED' && h.verificationStatus !== 'REJECTED') {
        list.push({ ...h, categoryType: 'Community Hazard', radius: h.radius || 250 });
      }
    });
    return list;
  }, [blackspots, greyspots, allHazards]);

  // Simulation Animation Loop
  useEffect(() => {
    if (!isPlaying || useRealGPS || waypoints.length === 0) return;

    const intervalMs = 100;
    const step = 0.02 * speedMultiplier;

    const timer = setInterval(() => {
      setProgressFraction(prev => {
        const next = prev + step;
        if (next >= 1) {
          setProgressIndex(idx => {
            if (idx + 1 >= waypoints.length - 1) {
              setIsPlaying(false);
              return waypoints.length - 1;
            }
            return idx + 1;
          });
          return 0;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, speedMultiplier, waypoints, useRealGPS]);

  // Evaluate Geofencing whenever vehicle position updates
  useEffect(() => {
    if (!currentPos || !combinedRiskSpots.length) return;

    const evalResult = evaluateGeofences(currentPos, combinedRiskSpots, previouslyTriggeredIds.current);

    setNextRisk(evalResult.nextUpcomingRisk);

    if (evalResult.immediateActiveAlert) {
      const alertItem = evalResult.immediateActiveAlert;
      setActiveAlert(alertItem);
      setClearedAlert(null);

      if (!previouslyTriggeredIds.current.has(alertItem.id)) {
        previouslyTriggeredIds.current.add(alertItem.id);
        if (audioEnabled) {
          playAlertChime(alertItem.severity === 'Critical' ? 'critical' : 'warning');
        }
      }
    } else {
      if (activeAlert) {
        // Just cleared an active hazard
        setClearedAlert(activeAlert);
        setActiveAlert(null);
        if (audioEnabled) {
          playAlertChime('cleared');
        }
        setTimeout(() => setClearedAlert(null), 4000);
      }
    }
  }, [currentPos, combinedRiskSpots, audioEnabled]);

  // Real Device GPS Geolocation Watch
  const toggleRealGPS = () => {
    if (!useRealGPS) {
      if (navigator.geolocation) {
        setIsPlaying(false);
        setUseRealGPS(true);

        watchIdRef.current = navigator.geolocation.watchPosition(
          pos => {
            setRealGPSPos({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              heading: pos.coords.heading || 0
            });
          },
          err => {
            alert('Could not acquire device GPS: ' + err.message);
            setUseRealGPS(false);
          },
          { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
        );
      } else {
        alert('Geolocation is not supported by your browser.');
      }
    } else {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setUseRealGPS(false);
      setRealGPSPos(null);
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const handleReset = () => {
    setProgressIndex(0);
    setProgressFraction(0);
    setIsPlaying(true);
    previouslyTriggeredIds.current.clear();
    setActiveAlert(null);
    setClearedAlert(null);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 65px)', overflow: 'hidden' }}>
      {/* Top HUD Card: Proactive Navigation & Risk Status */}
      <div className="live-journey-hud">
        <div className="hud-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '48px', height: '48px', background: '#0284c7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px' }}>
              <Navigation size={26} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                DESTINATION: {route?.destinationName?.toUpperCase() || 'TRIP DESTINATION'}
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                {remainingKm} km remaining <span style={{ color: '#38bdf8', fontSize: '1.1rem' }}>({Math.floor(remainingMinutes / 60)}h {remainingMinutes % 60}m)</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                Vehicle: <b>{route?.name || 'Active Route'}</b> • {useRealGPS ? '🔴 LIVE DEVICE GPS' : `Progress: km ${currentKm} / ${totalDistanceKm} km`}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', textAlign: 'right' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>ETA WEATHER</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: weatherAtCurrent.riskTier === 'High' ? '#f87171' : '#38bdf8' }}>
                {weatherAtCurrent.condition} ({weatherAtCurrent.temperature}°C)
              </div>
            </div>

            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                padding: '0.5rem',
                borderRadius: '50%',
                cursor: 'pointer'
              }}
              title={audioEnabled ? 'Mute Audio Alerts' : 'Enable Audio Alerts'}
            >
              {audioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </div>
        </div>

        {/* Proactive Persistent Banner: NEXT UPCOMING RISK */}
        {nextRisk && !activeAlert && !clearedAlert && (
          <div className="hud-card" style={{ background: 'rgba(30, 41, 59, 0.95)', padding: '0.85rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, background: '#f59e0b', color: '#78350f', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                NEXT RISK
              </span>
              <span style={{ fontSize: '0.92rem', fontWeight: 700 }}>
                {nextRisk.name || nextRisk.title} — <b>{nextRisk.distanceKm} km ahead</b>
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              ETA {weatherAtCurrent.etaFormatted} • {nextRisk.travelerAdvice || 'Prepare to slow down'}
            </div>
          </div>
        )}

        {/* Approaching / Warning Banner (< 500m / Inside Warning Geofence) */}
        {activeAlert && (
          <div className={`hud-alert-banner ${activeAlert.geofenceStatus === 'active' ? 'banner-critical' : 'banner-warning'}`}>
            <AlertTriangle size={24} color={activeAlert.geofenceStatus === 'active' ? '#b91c1c' : '#d97706'} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>
                {activeAlert.geofenceStatus === 'active' ? 'HAZARD ZONE ACTIVE (Within 300m)' : `Hazard ahead in ${activeAlert.distanceMeters} m`}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                {activeAlert.name || activeAlert.title} — {activeAlert.travelerAdvice || 'Reduce speed and remain vigilant.'}
              </div>
            </div>
            <button
              onClick={() => onSelectHazard(activeAlert)}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                border: '1px solid currentColor',
                background: 'transparent',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              Why Flagged?
            </button>
          </div>
        )}

        {/* Hazard Cleared Banner */}
        {clearedAlert && (
          <div className="hud-alert-banner banner-cleared">
            <ShieldCheck size={24} color="#059669" />
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>Hazard Cleared</div>
              <div style={{ fontSize: '0.85rem' }}>
                You have safely exited {clearedAlert.name || clearedAlert.title}. Resume standard highway speed.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map Rendering */}
      <RiskMap
        routes={route ? [{ ...route, waypoints }] : []}
        selectedRouteId={route?.id || 'balanced'}
        blackspots={blackspots}
        greyspots={greyspots}
        hazards={allHazards}
        trystanderCells={trystanderCells}
        vehiclePosition={currentPos}
        onSelectHazard={onSelectHazard}
      />

      {/* Bottom Floating Simulation Controls */}
      <div className="sim-controls-card">
        <button className="sim-btn" onClick={() => setIsPlaying(!isPlaying)} disabled={useRealGPS}>
          {isPlaying ? <Pause size={15} /> : <Play size={15} fill="#0f172a" />}
          <span>{isPlaying ? 'Pause' : 'Resume'}</span>
        </button>

        <button className="sim-btn" onClick={handleReset} disabled={useRealGPS}>
          <RotateCcw size={15} />
          <span>Reset</span>
        </button>

        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {[1, 2, 5, 10].map(s => (
            <button
              key={s}
              className={`sim-btn ${speedMultiplier === s ? 'active' : ''}`}
              style={{ padding: '0.45rem 0.6rem' }}
              onClick={() => setSpeedMultiplier(s)}
              disabled={useRealGPS}
            >
              {s}x
            </button>
          ))}
        </div>

        <button
          className={`sim-btn ${useRealGPS ? 'active' : ''}`}
          onClick={toggleRealGPS}
          style={{ background: useRealGPS ? '#10b981' : '#ffffff', color: useRealGPS ? '#ffffff' : 'var(--text-primary)', borderColor: useRealGPS ? '#10b981' : 'var(--border-subtle)' }}
          title="Toggle Real Device GPS Tracking"
        >
          <Locate size={14} />
          <span>{useRealGPS ? 'Live GPS Active' : 'Use Device GPS'}</span>
        </button>

        <button
          className="sim-btn"
          style={{ background: '#fee2e2', color: '#b91c1c', borderColor: '#fca5a5' }}
          onClick={onTriggerRerouteModal}
        >
          <Sparkles size={14} />
          <span>Test Dynamic Reroute</span>
        </button>
      </div>
    </div>
  );
}
