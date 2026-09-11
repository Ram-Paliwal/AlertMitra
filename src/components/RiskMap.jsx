import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function RiskMap({
  center = [21.1467, 79.0833],
  zoom = 11,
  routes = [],
  selectedRouteId = 'balanced',
  onSelectRoute,
  blackspots = [],
  greyspots = [],
  hazards = [],
  trystanderCells = [],
  vehiclePosition = null,
  onSelectHazard,
  activeLayerFilters = { blackspots: true, greyspots: true, hazards: true, trystander: true, weather: true },
  isPickingLocation = null, // 'origin' | 'destination' | null
  onLocationPicked = null,
  customOrigin = null,
  customDestination = null
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({
    routes: null,
    blackspots: null,
    greyspots: null,
    hazards: null,
    trystander: null,
    vehicle: null,
    markers: null
  });

  // Initialize map instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: false,
        attributionControl: false
      });

      // Reliable CARTO Voyager High-Contrast Navigation Tiles (with subdomains & retina support)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Force size update to prevent blank tiles on first render
      setTimeout(() => {
        map.invalidateSize();
      }, 250);

      mapInstanceRef.current = map;
    }

    return () => {
      // Map cleanup on complete unmount if required
    };
  }, []);

  // Window resize & visibility observer for reliable tile rendering
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [routes, selectedRouteId]);

  // Click on map handler for picking custom Origin / Destination
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e) => {
      if (isPickingLocation && onLocationPicked) {
        onLocationPicked({
          type: isPickingLocation,
          lat: e.latlng.lat,
          lng: e.latlng.lng
        });
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [isPickingLocation, onLocationPicked]);

  // Update Custom Origin / Destination Pin Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (layersRef.current.markers) {
      map.removeLayer(layersRef.current.markers);
      layersRef.current.markers = null;
    }

    const markerGroup = L.layerGroup();

    if (customOrigin && customOrigin.lat && customOrigin.lng) {
      const originIcon = L.divIcon({
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background: #10b981;
            border: 3px solid #ffffff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-weight: 800;
            font-size: 13px;
            box-shadow: 0 0 12px rgba(16, 185, 129, 0.7);
          ">
            A
          </div>
        `,
        className: 'custom-origin-pin',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      L.marker([customOrigin.lat, customOrigin.lng], { icon: originIcon })
        .bindPopup(`<b>Start Point (Origin)</b><br>${customOrigin.name || 'Selected Location'}`)
        .addTo(markerGroup);
    }

    if (customDestination && customDestination.lat && customDestination.lng) {
      const destIcon = L.divIcon({
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background: #ef4444;
            border: 3px solid #ffffff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-weight: 800;
            font-size: 13px;
            box-shadow: 0 0 12px rgba(239, 68, 68, 0.7);
          ">
            B
          </div>
        `,
        className: 'custom-dest-pin',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      L.marker([customDestination.lat, customDestination.lng], { icon: destIcon })
        .bindPopup(`<b>Destination Point</b><br>${customDestination.name || 'Selected Location'}`)
        .addTo(markerGroup);
    }

    markerGroup.addTo(map);
    layersRef.current.markers = markerGroup;
  }, [customOrigin, customDestination]);

  // Update Routes Polyline layer & Auto-fit bounds
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (layersRef.current.routes) {
      map.removeLayer(layersRef.current.routes);
    }

    const routeLayerGroup = L.layerGroup();
    let bounds = null;

    routes.forEach(route => {
      const isSelected = route.id === selectedRouteId;
      const waypoints = route.waypoints;
      if (!waypoints || waypoints.length < 2) return;

      // Color based on risk level
      let routeColor = '#10b981'; // green (low)
      if (route.riskLevel === 'high' || route.overallRisk > 60) routeColor = '#ef4444';
      else if (route.riskLevel === 'moderate' || route.overallRisk > 35) routeColor = '#f59e0b';

      if (!isSelected) {
        // Render unselected route as background dashed line
        const polyline = L.polyline(waypoints, {
          color: '#94a3b8',
          weight: 4,
          opacity: 0.65,
          dashArray: '6, 8',
          interactive: true
        });

        polyline.on('click', () => {
          if (onSelectRoute) onSelectRoute(route.id);
        });

        polyline.bindTooltip(`<b>${route.name}</b><br>${route.duration} • Risk ${route.overallRisk}/100`, {
          sticky: true
        });

        polyline.addTo(routeLayerGroup);
      } else {
        // Selected route: thick prominent line with glow outline
        const outline = L.polyline(waypoints, {
          color: '#0f172a',
          weight: 8,
          opacity: 0.25
        });
        outline.addTo(routeLayerGroup);

        const activePolyline = L.polyline(waypoints, {
          color: routeColor,
          weight: 6,
          opacity: 0.95
        });

        activePolyline.bindTooltip(
          `<b>${route.name} (Active)</b><br>${route.duration} • Risk ${route.overallRisk}/100 • ${route.tradeoff || ''}`,
          { permanent: false, sticky: true }
        );

        activePolyline.addTo(routeLayerGroup);
        bounds = activePolyline.getBounds();

        // Origin and Destination markers if not already custom
        if (!customOrigin) {
          const originMarker = L.circleMarker(waypoints[0], {
            radius: 8,
            fillColor: '#0284c7',
            color: '#ffffff',
            weight: 3,
            fillOpacity: 1
          }).bindPopup(`<b>Trip Origin:</b> Start Point (${route.name})`);
          originMarker.addTo(routeLayerGroup);
        }

        if (!customDestination) {
          const destMarker = L.circleMarker(waypoints[waypoints.length - 1], {
            radius: 9,
            fillColor: '#10b981',
            color: '#ffffff',
            weight: 3,
            fillOpacity: 1
          }).bindPopup(`<b>Destination:</b> Arrival Point (${route.name})`);
          destMarker.addTo(routeLayerGroup);
        }
      }
    });

    routeLayerGroup.addTo(map);
    layersRef.current.routes = routeLayerGroup;

    // Zoom and pan to fit the active route seamlessly
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [routes, selectedRouteId, customOrigin, customDestination]);

  // Update Blackspots Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (layersRef.current.blackspots) {
      map.removeLayer(layersRef.current.blackspots);
    }

    if (!activeLayerFilters.blackspots) return;

    const bsGroup = L.layerGroup();

    blackspots.forEach(bs => {
      const isRemediated = bs.status && bs.status.includes('Completed');
      const iconHtml = `
        <div style="
          width: 28px;
          height: 28px;
          background: ${isRemediated ? '#15803d' : '#ef4444'};
          border: 2px solid #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 800;
          font-size: 11px;
          box-shadow: 0 0 10px ${isRemediated ? 'rgba(21, 128, 61, 0.4)' : 'rgba(239, 68, 68, 0.6)'};
          cursor: pointer;
        ">
          ${isRemediated ? '✓' : 'BS'}
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-blackspot-pin',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([bs.lat, bs.lng], { icon: customIcon });

      marker.on('click', () => {
        if (onSelectHazard) onSelectHazard({ ...bs, categoryType: 'Blackspot' });
      });

      marker.bindTooltip(`
        <div style="font-size:12px; line-height:1.3;">
          <strong style="color:#ef4444;">BLACKSPOT (${bs.id})</strong><br>
          <b>${bs.name}</b><br>
          ${bs.fatalities} Fatalities • ${bs.totalCrashes} Crashes<br>
          <span style="font-size:10px; color:#64748b;">Click to view GDP countermeasures</span>
        </div>
      `);

      marker.addTo(bsGroup);
    });

    bsGroup.addTo(map);
    layersRef.current.blackspots = bsGroup;
  }, [blackspots, activeLayerFilters.blackspots]);

  // Update Greyspots Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (layersRef.current.greyspots) {
      map.removeLayer(layersRef.current.greyspots);
    }

    if (!activeLayerFilters.greyspots) return;

    const gsGroup = L.layerGroup();

    greyspots.forEach(gs => {
      const isVerySevere = gs.severityCategory === 'Very Severe';
      const iconHtml = `
        <div style="
          width: 24px;
          height: 24px;
          background: ${isVerySevere ? '#d97706' : '#f59e0b'};
          border: 2px solid #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 700;
          font-size: 10px;
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.5);
          cursor: pointer;
        ">
          GS
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-greyspot-pin',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([gs.lat, gs.lng], { icon: customIcon });

      marker.on('click', () => {
        if (onSelectHazard) onSelectHazard({ ...gs, categoryType: 'Greyspot' });
      });

      marker.bindTooltip(`
        <div style="font-size:12px; line-height:1.3;">
          <strong style="color:#d97706;">GREYSPOT (${gs.severityCategory})</strong><br>
          <b>${gs.name}</b><br>
          Alerts: ${gs.adasDominantAlert}<br>
          <span style="font-size:10px; color:#64748b;">Severity Index: ${(gs.severityScore * 100).toFixed(0)}/100</span>
        </div>
      `);

      marker.addTo(gsGroup);
    });

    gsGroup.addTo(map);
    layersRef.current.greyspots = gsGroup;
  }, [greyspots, activeLayerFilters.greyspots]);

  // Update Community Hazards Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (layersRef.current.hazards) {
      map.removeLayer(layersRef.current.hazards);
    }

    if (!activeLayerFilters.hazards) return;

    const hazGroup = L.layerGroup();

    hazards.forEach(h => {
      if (h.verificationStatus === 'EXPIRED' || h.verificationStatus === 'REJECTED') return;

      let color = '#2563eb'; // blue
      if (h.type === 'Accident') color = '#dc2626';
      else if (h.type === 'Pothole') color = '#d97706';
      else if (h.type === 'Waterlogging') color = '#0284c7';

      const iconHtml = `
        <div style="
          width: 26px;
          height: 26px;
          background: ${color};
          border: 2px solid #ffffff;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 700;
          font-size: 11px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
          cursor: pointer;
        ">
          ⚠️
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-hazard-pin',
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const marker = L.marker([h.lat, h.lng], { icon: customIcon });

      marker.on('click', () => {
        if (onSelectHazard) onSelectHazard({ ...h, categoryType: 'Community Hazard' });
      });

      marker.bindTooltip(`
        <div style="font-size:12px; line-height:1.3;">
          <strong style="color:#2563eb;">${h.type.toUpperCase()} [${h.verificationStatus}]</strong><br>
          <b>${h.title}</b><br>
          ${h.confidence}% confidence (${h.confirmationsCount} confirmations)
        </div>
      `);

      marker.addTo(hazGroup);
    });

    hazGroup.addTo(map);
    layersRef.current.hazards = hazGroup;
  }, [hazards, activeLayerFilters.hazards]);

  // Update Trystander Cells Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (layersRef.current.trystander) {
      map.removeLayer(layersRef.current.trystander);
    }

    if (!activeLayerFilters.trystander) return;

    const tryGroup = L.layerGroup();

    trystanderCells.forEach(cell => {
      const iconHtml = `
        <div style="
          width: 26px;
          height: 26px;
          background: #0891b2;
          border: 2px solid #ffffff;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 900;
          font-size: 14px;
          box-shadow: 0 0 8px rgba(8, 145, 178, 0.6);
          cursor: pointer;
        ">
          ✚
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-trystander-pin',
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const marker = L.marker([cell.lat, cell.lng], { icon: customIcon });

      marker.on('click', () => {
        if (onSelectHazard) onSelectHazard({ ...cell, categoryType: 'Trystander Kiosk' });
      });

      marker.bindTooltip(`
        <div style="font-size:12px; line-height:1.3;">
          <strong style="color:#0891b2;">TRYSTANDER RADMC CELL</strong><br>
          <b>${cell.name}</b><br>
          ${cell.selectedSamaritansCount} Good Samaritans • ${cell.victimsHelped} Lives Saved
        </div>
      `);

      marker.addTo(tryGroup);
    });

    tryGroup.addTo(map);
    layersRef.current.trystander = tryGroup;
  }, [trystanderCells, activeLayerFilters.trystander]);

  // Update Vehicle Marker (for GPS live simulation)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (layersRef.current.vehicle) {
      map.removeLayer(layersRef.current.vehicle);
      layersRef.current.vehicle = null;
    }

    if (vehiclePosition && vehiclePosition.lat && vehiclePosition.lng) {
      const vehicleHtml = `
        <div style="
          width: 32px;
          height: 32px;
          background: #0284c7;
          border: 3px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 15px rgba(2, 132, 199, 0.8), 0 0 0 6px rgba(2, 132, 199, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 15px;
          transform: rotate(${vehiclePosition.heading || 0}deg);
        ">
          ▲
        </div>
      `;

      const vehicleIcon = L.divIcon({
        html: vehicleHtml,
        className: 'custom-vehicle-gps',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const vehicleMarker = L.marker([vehiclePosition.lat, vehiclePosition.lng], {
        icon: vehicleIcon,
        zIndexOffset: 1000
      });

      vehicleMarker.bindTooltip('<b>Your Vehicle (Live GPS)</b>', { permanent: false, direction: 'top' });
      vehicleMarker.addTo(map);
      layersRef.current.vehicle = vehicleMarker;

      // Pan to vehicle if in active live journey
      if (vehiclePosition.autoPan) {
        map.panTo([vehiclePosition.lat, vehiclePosition.lng], { animate: true, duration: 0.5 });
      }
    }
  }, [vehiclePosition]);

  return (
    <div className="map-view-container" style={{ width: '100%', height: '100%', minHeight: '400px', position: 'relative' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Picking Location Overlay Banner */}
      {isPickingLocation && (
        <div style={{
          position: 'absolute',
          top: 15,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: isPickingLocation === 'origin' ? '#10b981' : '#ef4444',
          color: '#ffffff',
          padding: '0.6rem 1.25rem',
          borderRadius: '30px',
          fontWeight: 700,
          fontSize: '0.88rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: 'crosshair',
          animation: 'pulse 1.5s infinite'
        }}>
          <span>📍 Click anywhere on the map to set <b>{isPickingLocation === 'origin' ? 'START POINT' : 'DESTINATION'}</b></span>
        </div>
      )}

      {/* Map Legend Overlay */}
      <div className="map-legend-overlay">
        <div className="legend-item">
          <span className="legend-dot dot-blackspot"></span>
          <span>Blackspot (MoRTH/FIR)</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot dot-greyspot"></span>
          <span>Greyspot (iRASTE ADAS)</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot dot-community"></span>
          <span>Community Hazards</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot dot-trystander"></span>
          <span>Trystander Rescue Cell</span>
        </div>
      </div>
    </div>
  );
}
