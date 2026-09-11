import React, { useState, useEffect, useRef } from 'react';
import {
  Shield, Navigation, AlertTriangle, CloudSun, Eye, Compass,
  Car, Bike, Bus, Truck, Clock, ArrowRight, MapPin, Locate,
  Search, Loader2, Sparkles, CheckCircle2, ChevronDown
} from 'lucide-react';
import { PRESET_JOURNEYS } from '../data/corridorsAndRoutes';
import { searchPlaces, reverseGeocode, fetchRoutes, enrichRoutesWithRisk } from '../engine/routingEngine';
import { NAGPUR_BLACKSPOTS } from '../data/nagpurBlackspots';
import { NAGPUR_GREYSPOTS } from '../data/nagpurGreyspots';
import { TRYSTANDER_CELLS } from '../data/trystanderCells';
import RiskMap from '../components/RiskMap';

export default function HomeScreen({
  onAnalyzeJourney,
  onNavigateToMap,
  onOpenReportModal,
  onNavigateToSafety,
  hazards = []
}) {
  // Mode: 'custom' (interactive search & pick) vs 'preset' (quick corridors)
  const [plannerMode, setPlannerMode] = useState('custom');

  // Custom Origin & Destination State
  const [originQuery, setOriginQuery] = useState('Nagpur Central, Maharashtra');
  const [originCoords, setOriginCoords] = useState({ lat: 21.1458, lng: 79.0882, name: 'Nagpur Central' });
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);

  const [destQuery, setDestQuery] = useState('Pench National Park, Turia Gate');
  const [destCoords, setDestCoords] = useState({ lat: 21.7580, lng: 79.3240, name: 'Pench National Park' });
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [isSearchingDest, setIsSearchingDest] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  // Map picking mode: null | 'origin' | 'destination'
  const [isPickingOnMap, setIsPickingOnMap] = useState(null);
  const [showMiniMap, setShowMiniMap] = useState(false);

  // Preset Selection
  const [selectedPreset, setSelectedPreset] = useState('nagpur-pench');

  // Travel params
  const [vehicle, setVehicle] = useState('Bike');
  const [departureTime, setDepartureTime] = useState('19:00');
  const [avoidHighCrash, setAvoidHighCrash] = useState(true);
  const [avoidSevereWeather, setAvoidSevereWeather] = useState(true);
  const [avoidReportedHazards, setAvoidReportedHazards] = useState(true);

  // Loading & Geolocation states
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [calculationStatus, setCalculationStatus] = useState('');

  const originSearchTimerRef = useRef(null);
  const destSearchTimerRef = useRef(null);

  // Handle Origin Search Typing
  const handleOriginChange = (val) => {
    setOriginQuery(val);
    setShowOriginDropdown(true);
    if (originSearchTimerRef.current) clearTimeout(originSearchTimerRef.current);

    if (val.trim().length >= 2) {
      setIsSearchingOrigin(true);
      originSearchTimerRef.current = setTimeout(async () => {
        const results = await searchPlaces(val);
        setOriginSuggestions(results);
        setIsSearchingOrigin(false);
      }, 350);
    } else {
      setOriginSuggestions([]);
      setIsSearchingOrigin(false);
    }
  };

  // Handle Destination Search Typing
  const handleDestChange = (val) => {
    setDestQuery(val);
    setShowDestDropdown(true);
    if (destSearchTimerRef.current) clearTimeout(destSearchTimerRef.current);

    if (val.trim().length >= 2) {
      setIsSearchingDest(true);
      destSearchTimerRef.current = setTimeout(async () => {
        const results = await searchPlaces(val);
        setDestSuggestions(results);
        setIsSearchingDest(false);
      }, 350);
    } else {
      setDestSuggestions([]);
      setIsSearchingDest(false);
    }
  };

  // Select Origin Suggestion
  const selectOrigin = (item) => {
    setOriginCoords({ lat: item.lat, lng: item.lng, name: item.shortName });
    setOriginQuery(item.displayName);
    setShowOriginDropdown(false);
  };

  // Select Destination Suggestion
  const selectDest = (item) => {
    setDestCoords({ lat: item.lat, lng: item.lng, name: item.shortName });
    setDestQuery(item.displayName);
    setShowDestDropdown(false);
  };

  // Live Geolocation: "Locate Me" button
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const placeName = await reverseGeocode(lat, lng);

        setOriginCoords({ lat, lng, name: placeName.split(',')[0] || 'Current Location' });
        setOriginQuery(`📍 ${placeName}`);
        setIsLocatingUser(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        // Fallback to Nagpur Center if permission denied
        setOriginCoords({ lat: 21.1458, lng: 79.0882, name: 'Nagpur Central' });
        setOriginQuery('Nagpur Central, Maharashtra');
        setIsLocatingUser(false);
        alert('Could not detect exact GPS position. Using default location (Nagpur Central).');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Handle Map Click when picking location
  const handleMapLocationPicked = async ({ type, lat, lng }) => {
    const name = await reverseGeocode(lat, lng);
    if (type === 'origin') {
      setOriginCoords({ lat, lng, name: name.split(',')[0] || 'Selected Start' });
      setOriginQuery(name);
    } else {
      setDestCoords({ lat, lng, name: name.split(',')[0] || 'Selected Destination' });
      setDestQuery(name);
    }
    setIsPickingOnMap(null);
  };

  // Quick Destination Chips
  const quickDestinations = [
    { name: 'Pench Tiger Reserve', query: 'Pench National Park, Turia Gate', lat: 21.7580, lng: 79.3240 },
    { name: 'Wardha City', query: 'Wardha, Maharashtra', lat: 20.7453, lng: 78.6022 },
    { name: 'Nagpur Airport (NAG)', query: 'Dr. Babasaheb Ambedkar International Airport, Nagpur', lat: 21.0922, lng: 79.0560 },
    { name: 'Sitabuldi Interchange', query: 'Sitabuldi, Nagpur, Maharashtra', lat: 21.1466, lng: 79.0882 },
    { name: 'Kanhan Industrial', query: 'Kanhan, Nagpur, Maharashtra', lat: 21.2330, lng: 79.2450 },
    { name: 'Butibori MIDC', query: 'Butibori, Nagpur, Maharashtra', lat: 20.9300, lng: 78.9950 }
  ];

  // Submit & Generate Dynamic Route
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsCalculatingRoute(true);
    setCalculationStatus('Fetching live driving paths from OSRM...');

    try {
      let rawRoutes = [];

      if (plannerMode === 'custom') {
        setCalculationStatus('Analyzing road geometry & calculating alternative paths...');
        rawRoutes = await fetchRoutes(
          originCoords.lat,
          originCoords.lng,
          destCoords.lat,
          destCoords.lng,
          originCoords.name,
          destCoords.name
        );
      } else {
        const activeJourney = PRESET_JOURNEYS.find(j => j.id === selectedPreset) || PRESET_JOURNEYS[0];
        setCalculationStatus(`Loading ${activeJourney.title} corridor...`);
        // Use coordinates from preset
        const oLat = 21.1467, oLng = 79.0833;
        const dLat = selectedPreset === 'wardha-corridor' ? 20.7453 : selectedPreset === 'kanhan-corridor' ? 21.2330 : 21.7580;
        const dLng = selectedPreset === 'wardha-corridor' ? 78.6022 : selectedPreset === 'kanhan-corridor' ? 79.2450 : 79.3240;

        rawRoutes = await fetchRoutes(oLat, oLng, dLat, dLng, 'Nagpur', activeJourney.title);
      }

      setCalculationStatus('Cross-referencing 38 MoRTH Blackspots & 33 ADAS Greyspots...');

      // Enrich with multi-factor risk calculations
      const enriched = enrichRoutesWithRisk(
        rawRoutes,
        NAGPUR_BLACKSPOTS,
        NAGPUR_GREYSPOTS,
        hazards,
        TRYSTANDER_CELLS,
        vehicle,
        departureTime
      );

      const journeyTitle = plannerMode === 'custom'
        ? `${originCoords.name} → ${destCoords.name}`
        : (PRESET_JOURNEYS.find(j => j.id === selectedPreset)?.title || 'Custom Route');

      onAnalyzeJourney({
        journeyId: plannerMode === 'custom' ? 'custom-route' : selectedPreset,
        journeyInfo: {
          id: plannerMode === 'custom' ? 'custom-route' : selectedPreset,
          title: journeyTitle,
          originName: originCoords.name,
          destinationName: destCoords.name,
          originCoords,
          destCoords
        },
        customRoutes: enriched,
        vehicle,
        departureTime,
        preferences: {
          avoidHighCrash,
          avoidSevereWeather,
          avoidReportedHazards
        }
      });
    } catch (err) {
      console.error('Route calculation error:', err);
      alert('Error calculating route. Falling back to default corridor.');
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  return (
    <div className="home-screen-view">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-pill">
          <Shield size={14} />
          PROACTIVE ROAD SAFETY INTELLIGENCE LAYER
        </div>

        <h1 className="hero-title">
          Know the <span className="highlight">risk</span> before you reach it.
        </h1>

        <p className="hero-subtext">
          Plan any journey with multi-factor accident history, 38 MoRTH Blackspots, 33 ADAS Greyspots, community hazards, and ETA weather forecasts.
        </p>

        {/* Journey Planner Card */}
        <div className="planner-card-container">
          {/* Mode Switcher Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <button
              type="button"
              className={`mode-tab-btn ${plannerMode === 'custom' ? 'active' : ''}`}
              onClick={() => setPlannerMode('custom')}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: plannerMode === 'custom' ? '#0284c7' : 'transparent',
                color: plannerMode === 'custom' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Search size={15} />
              Custom Locations (Any Start & End)
            </button>

            <button
              type="button"
              className={`mode-tab-btn ${plannerMode === 'preset' ? 'active' : ''}`}
              onClick={() => setPlannerMode('preset')}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: plannerMode === 'preset' ? '#0284c7' : 'transparent',
                color: plannerMode === 'preset' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Navigation size={15} />
              Pre-mapped Highway Corridors
            </button>
          </div>

          <form onSubmit={handleFormSubmit}>
            {plannerMode === 'custom' ? (
              /* Custom Origin & Destination Input Grid */
              <div className="planner-form-grid" style={{ marginBottom: '1rem' }}>
                {/* ORIGIN (START POINT) */}
                <div className="input-group" style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="input-label">
                      <MapPin size={13} color="#10b981" />
                      Starting Location (Origin)
                    </label>
                    <button
                      type="button"
                      onClick={handleLocateMe}
                      disabled={isLocatingUser}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#0284c7',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      {isLocatingUser ? <Loader2 size={12} className="spin-animation" /> : <Locate size={12} />}
                      {isLocatingUser ? 'Locating...' : 'Use My GPS'}
                    </button>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="custom-input"
                      value={originQuery}
                      onChange={e => handleOriginChange(e.target.value)}
                      onFocus={() => setShowOriginDropdown(true)}
                      placeholder="Type starting city, address, or landmark..."
                      required
                    />
                    {isSearchingOrigin && (
                      <Loader2 size={16} className="spin-animation" style={{ position: 'absolute', right: 12, top: 12, color: '#94a3b8' }} />
                    )}
                  </div>

                  {/* Origin Dropdown Autocomplete Suggestions */}
                  {showOriginDropdown && originSuggestions.length > 0 && (
                    <div className="autocomplete-dropdown">
                      {originSuggestions.map((item, idx) => (
                        <div
                          key={idx}
                          className="autocomplete-item"
                          onClick={() => selectOrigin(item)}
                        >
                          <MapPin size={14} color="#10b981" style={{ marginTop: 2, flexShrink: 0 }} />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{item.shortName}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{item.displayName}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* DESTINATION */}
                <div className="input-group" style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="input-label">
                      <Navigation size={13} color="#ef4444" />
                      Destination Point
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMiniMap(true);
                        setIsPickingOnMap('destination');
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#0284c7',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <Compass size={12} />
                      Pick on Map
                    </button>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="custom-input"
                      value={destQuery}
                      onChange={e => handleDestChange(e.target.value)}
                      onFocus={() => setShowDestDropdown(true)}
                      placeholder="Search destination, highway, city..."
                      required
                    />
                    {isSearchingDest && (
                      <Loader2 size={16} className="spin-animation" style={{ position: 'absolute', right: 12, top: 12, color: '#94a3b8' }} />
                    )}
                  </div>

                  {/* Destination Dropdown Autocomplete Suggestions */}
                  {showDestDropdown && destSuggestions.length > 0 && (
                    <div className="autocomplete-dropdown">
                      {destSuggestions.map((item, idx) => (
                        <div
                          key={idx}
                          className="autocomplete-item"
                          onClick={() => selectDest(item)}
                        >
                          <Navigation size={14} color="#ef4444" style={{ marginTop: 2, flexShrink: 0 }} />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{item.shortName}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{item.displayName}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Preset Corridors Dropdown */
              <div className="planner-form-grid" style={{ marginBottom: '1rem' }}>
                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label className="input-label">
                    <Navigation size={13} />
                    Select Pre-Mapped Nagpur Corridor
                  </label>
                  <select
                    className="custom-select"
                    value={selectedPreset}
                    onChange={e => setSelectedPreset(e.target.value)}
                  >
                    {PRESET_JOURNEYS.map(j => (
                      <option key={j.id} value={j.id}>
                        {j.title} — {j.summary}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Quick Destination Chips */}
            {plannerMode === 'custom' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Quick Destinations:</span>
                {quickDestinations.map((qd, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => {
                      setDestCoords({ lat: qd.lat, lng: qd.lng, name: qd.name });
                      setDestQuery(qd.query);
                    }}
                    style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: '16px',
                      border: '1px solid var(--border-subtle)',
                      background: destCoords.lat === qd.lat ? '#e0f2fe' : '#ffffff',
                      color: destCoords.lat === qd.lat ? '#0369a1' : 'var(--text-secondary)',
                      fontSize: '0.73rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {qd.name}
                  </button>
                ))}
              </div>
            )}

            {/* Interactive Map Location Picker (when requested) */}
            {showMiniMap && (
              <div style={{ marginBottom: '1.25rem', border: '2px solid #0284c7', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ background: '#0284c7', color: '#ffffff', padding: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', fontWeight: 700 }}>
                  <span>📍 Click on map to set {isPickingOnMap === 'origin' ? 'START POINT' : 'DESTINATION'}</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setIsPickingOnMap(isPickingOnMap === 'origin' ? 'destination' : 'origin')}
                      style={{ background: '#ffffff', color: '#0284c7', border: 'none', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Switch to {isPickingOnMap === 'origin' ? 'Destination' : 'Origin'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowMiniMap(false)}
                      style={{ background: 'rgba(255,255,255,0.2)', color: '#ffffff', border: 'none', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      Done
                    </button>
                  </div>
                </div>
                <div style={{ height: '280px', width: '100%' }}>
                  <RiskMap
                    center={[originCoords.lat || 21.1458, originCoords.lng || 79.0882]}
                    zoom={12}
                    blackspots={NAGPUR_BLACKSPOTS}
                    greyspots={NAGPUR_GREYSPOTS}
                    hazards={hazards}
                    trystanderCells={TRYSTANDER_CELLS}
                    isPickingLocation={isPickingOnMap || 'destination'}
                    onLocationPicked={handleMapLocationPicked}
                    customOrigin={originCoords}
                    customDestination={destCoords}
                  />
                </div>
              </div>
            )}

            {/* Secondary Parameters Grid: Departure Time & Vehicle */}
            <div className="planner-form-grid">
              {/* Departure Time */}
              <div className="input-group">
                <label className="input-label">
                  <Clock size={13} />
                  Departure Time
                </label>
                <input
                  type="time"
                  className="custom-input"
                  value={departureTime}
                  onChange={e => setDepartureTime(e.target.value)}
                  required
                />
              </div>

              {/* Vehicle Type */}
              <div className="input-group">
                <label className="input-label">
                  <Car size={13} />
                  Vehicle Mode (VRU Vulnerability Weighted)
                </label>
                <div className="vehicle-selector-group">
                  {[
                    { id: 'Bike', label: '2W Bike', icon: <Bike size={15} /> },
                    { id: 'Car', label: '4W Car', icon: <Car size={15} /> },
                    { id: 'Bus', label: 'Bus', icon: <Bus size={15} /> },
                    { id: 'Truck', label: 'Truck', icon: <Truck size={15} /> }
                  ].map(v => (
                    <button
                      type="button"
                      key={v.id}
                      className={`vehicle-btn ${vehicle === v.id ? 'selected' : ''}`}
                      onClick={() => setVehicle(v.id)}
                      style={{ padding: '0.45rem 0.6rem' }}
                    >
                      {v.icon}
                      <span>{v.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Safety Preferences */}
            <div className="preferences-box">
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Risk Avoidance:
              </span>
              <label className="pref-item">
                <input
                  type="checkbox"
                  className="pref-checkbox"
                  checked={avoidHighCrash}
                  onChange={e => setAvoidHighCrash(e.target.checked)}
                />
                Avoid high crash exposure (38 Blackspots)
              </label>

              <label className="pref-item">
                <input
                  type="checkbox"
                  className="pref-checkbox"
                  checked={avoidSevereWeather}
                  onChange={e => setAvoidSevereWeather(e.target.checked)}
                />
                Avoid severe weather at ETA
              </label>

              <label className="pref-item">
                <input
                  type="checkbox"
                  className="pref-checkbox"
                  checked={avoidReportedHazards}
                  onChange={e => setAvoidReportedHazards(e.target.checked)}
                />
                Avoid reported active road hazards
              </label>
            </div>

            {/* Main Action Submit Button */}
            <button
              type="submit"
              className="analyze-journey-btn"
              disabled={isCalculatingRoute}
              style={{ opacity: isCalculatingRoute ? 0.8 : 1 }}
            >
              {isCalculatingRoute ? (
                <>
                  <Loader2 size={20} className="spin-animation" />
                  <span>{calculationStatus || 'Analyzing Dynamic Routes & Risks...'}</span>
                </>
              ) : (
                <>
                  <Shield size={20} />
                  <span>Analyze Journey Risk & Compare Routes</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* Quick Action Cards */}
      <section className="quick-actions-grid">
        <div className="action-card" onClick={onNavigateToMap}>
          <div className="action-card-icon icon-blue">
            <Compass size={24} />
          </div>
          <div className="action-card-content">
            <h3>Explore Live Risk Map</h3>
            <p>Inspect 38 official Blackspots, 33 ADAS Greyspots, and 8 Trystander first-responder cells across Nagpur.</p>
          </div>
        </div>

        <div className="action-card" onClick={onOpenReportModal}>
          <div className="action-card-icon icon-amber">
            <AlertTriangle size={24} />
          </div>
          <div className="action-card-content">
            <h3>Report Road Hazard</h3>
            <p>Submit geotagged photos of potholes, roadblocks, or waterlogging with instant community corroboration.</p>
          </div>
        </div>

        <div className="action-card" onClick={onNavigateToSafety}>
          <div className="action-card-icon icon-cyan">
            <Shield size={24} />
          </div>
          <div className="action-card-content">
            <h3>Safety & SOS Center</h3>
            <p>One-tap 112 emergency escalation, nearest Level 1 trauma centers, and local Good Samaritan contacts.</p>
          </div>
        </div>
      </section>

      {/* Live Nagpur iRASTE Evidence Strip */}
      <section className="stats-strip">
        <div className="stats-grid">
          <div className="stat-item">
            <h4>41%</h4>
            <p>Lower Crashes in ADAS Commercial Fleet (iRASTE)</p>
          </div>
          <div className="stat-item">
            <h4>38</h4>
            <p>Official MoRTH Blackspots Topographically Mapped</p>
          </div>
          <div className="stat-item">
            <h4>33</h4>
            <p>Proactive AI Greyspots Identified Before Crashes</p>
          </div>
          <div className="stat-item">
            <h4>36</h4>
            <p>Lives Saved by 8 Trystander Golden-Hour Cells</p>
          </div>
        </div>
      </section>
    </div>
  );
}
