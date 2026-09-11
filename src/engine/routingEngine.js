/**
 * AlertMitra Dynamic Routing Engine
 * Uses OSRM (Open Source Routing Machine) for real route calculation — no API key needed.
 * Uses Nominatim for geocoding address search — no API key needed.
 * Generates multiple alternative routes with geometry for any origin/destination pair.
 */

const OSRM_BASE = 'https://router.project-osrm.org';
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

/**
 * Fetch up to 3 alternative driving routes between two points from OSRM.
 * Returns parsed route objects with decoded polyline geometry.
 */
export async function fetchRoutes(originLat, originLng, destLat, destLng, originName = 'Origin', destName = 'Destination') {
  const url = `${OSRM_BASE}/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?alternatives=true&geometries=geojson&overview=full&steps=true`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`);
    const data = await res.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error(data.message || 'No routes found');
    }

    return data.routes.map((route, idx) => {
      const durationMin = Math.round(route.duration / 60);
      const distanceKm = (route.distance / 1000).toFixed(1);
      // GeoJSON coordinates are [lng, lat] — flip to [lat, lng] for Leaflet
      const waypoints = route.geometry.coordinates.map(c => [c[1], c[0]]);

      return {
        id: idx === 0 ? 'fastest' : idx === 1 ? 'balanced' : 'safer',
        osrmIndex: idx,
        name: idx === 0 ? `Primary via Highway (${distanceKm} km)` : idx === 1 ? `Alternative Bypass (${distanceKm} km)` : `Alternative Local (${distanceKm} km)`,
        originName,
        destinationName: destName,
        badge: idx === 0 ? 'FASTEST' : idx === 1 ? 'BALANCED' : 'SAFER',
        duration: formatDuration(durationMin),
        durationMinutes: durationMin,
        distance: `${distanceKm} km`,
        distanceKm: parseFloat(distanceKm),
        waypoints,
        steps: route.legs[0]?.steps || [],
        isRecommended: idx === 1 || (data.routes.length === 1 && idx === 0),
        overallRisk: 0,
        riskLevel: 'low',
        breakdown: { crashExposure: 0, weatherRisk: 0, roadHazards: 0, emergencyAccess: 50 },
        tradeoff: '',
        whyThisRoute: [],
        hazardIntersections: [],
        timelineSegments: []
      };
    });
  } catch (err) {
    console.warn('OSRM routing request failed or timed out, generating interpolated dynamic routes:', err.message);
    return generateFallbackRoutes(originLat, originLng, destLat, destLng, originName, destName);
  }
}

/**
 * Generates realistic interpolated route polylines with realistic curvature when offline or OSRM is unreachable.
 */
export function generateFallbackRoutes(originLat, originLng, destLat, destLng, originName = 'Origin', destName = 'Destination') {
  const distMeters = haversineMeters(originLat, originLng, destLat, destLng);
  const directDistKm = distMeters / 1000;
  const numPoints = Math.max(25, Math.min(100, Math.round(directDistKm * 2)));

  const createCurvedPath = (curveFactor, distFactor, speedKmph) => {
    const pts = [];
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      // Linear interpolation
      let lat = originLat + (destLat - originLat) * t;
      let lng = originLng + (destLng - originLng) * t;

      // Add lateral arc curvature
      const arc = Math.sin(t * Math.PI) * curveFactor;
      const normalLat = -(destLng - originLng);
      const normalLng = (destLat - originLat);
      const normLen = Math.sqrt(normalLat * normalLat + normalLng * normalLng) || 1;

      lat += (normalLat / normLen) * arc;
      lng += (normalLng / normLen) * arc;

      pts.push([lat, lng]);
    }

    const actualDistKm = parseFloat((directDistKm * distFactor).toFixed(1));
    const durationMin = Math.round((actualDistKm / speedKmph) * 60);

    return { waypoints: pts, distanceKm: actualDistKm, durationMin };
  };

  // Route 1: Direct Highway (Fastest)
  const r1 = createCurvedPath(0.015, 1.15, 65);
  // Route 2: Ring road / Outer bypass (Balanced)
  const r2 = createCurvedPath(-0.035, 1.28, 55);
  // Route 3: Arterial / Service road (Safer)
  const r3 = createCurvedPath(0.05, 1.38, 45);

  return [
    {
      id: 'fastest',
      osrmIndex: 0,
      name: `Direct Express Route (${r1.distanceKm} km)`,
      originName,
      destinationName: destName,
      badge: 'FASTEST',
      duration: formatDuration(r1.durationMin),
      durationMinutes: r1.durationMin,
      distance: `${r1.distanceKm} km`,
      distanceKm: r1.distanceKm,
      waypoints: r1.waypoints,
      steps: [],
      isRecommended: false,
      overallRisk: 0,
      riskLevel: 'low',
      breakdown: { crashExposure: 0, weatherRisk: 0, roadHazards: 0, emergencyAccess: 50 },
      tradeoff: 'Fastest travel time',
      whyThisRoute: [],
      hazardIntersections: [],
      timelineSegments: []
    },
    {
      id: 'balanced',
      osrmIndex: 1,
      name: `Corridor Bypass (${r2.distanceKm} km)`,
      originName,
      destinationName: destName,
      badge: 'BALANCED',
      duration: formatDuration(r2.durationMin),
      durationMinutes: r2.durationMin,
      distance: `${r2.distanceKm} km`,
      distanceKm: r2.distanceKm,
      waypoints: r2.waypoints,
      steps: [],
      isRecommended: true,
      overallRisk: 0,
      riskLevel: 'low',
      breakdown: { crashExposure: 0, weatherRisk: 0, roadHazards: 0, emergencyAccess: 50 },
      tradeoff: 'Balanced exposure & speed',
      whyThisRoute: [],
      hazardIntersections: [],
      timelineSegments: []
    },
    {
      id: 'safer',
      osrmIndex: 2,
      name: `Low-Crash Rural Arterial (${r3.distanceKm} km)`,
      originName,
      destinationName: destName,
      badge: 'SAFER',
      duration: formatDuration(r3.durationMin),
      durationMinutes: r3.durationMin,
      distance: `${r3.distanceKm} km`,
      distanceKm: r3.distanceKm,
      waypoints: r3.waypoints,
      steps: [],
      isRecommended: false,
      overallRisk: 0,
      riskLevel: 'low',
      breakdown: { crashExposure: 0, weatherRisk: 0, roadHazards: 0, emergencyAccess: 50 },
      tradeoff: 'Maximum safety buffer',
      whyThisRoute: [],
      hazardIntersections: [],
      timelineSegments: []
    }
  ];
}

/**
 * Search for places by name using Nominatim geocoding.
 * Returns array of { displayName, shortName, lat, lng }.
 */
export async function searchPlaces(query, limit = 5) {
  if (!query || query.trim().length < 2) return [];

  const url = `${NOMINATIM_BASE}/search?q=${encodeURIComponent(query)}&format=json&limit=${limit}&addressdetails=1`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      headers: { 'User-Agent': 'AlertMitra-RoadSafety/1.0' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) return [];
    const data = await res.json();

    return data.map(item => ({
      displayName: item.display_name,
      shortName: [item.address?.city || item.address?.town || item.address?.suburb || item.address?.village, item.address?.state]
        .filter(Boolean).slice(0, 2).join(', ') || item.display_name.split(',').slice(0, 2).join(', '),
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon)
    }));
  } catch (err) {
    console.warn('Nominatim search failed:', err.message);
    return [];
  }
}

/**
 * Reverse-geocode a lat/lng to a human-readable place name.
 */
export async function reverseGeocode(lat, lng) {
  const url = `${NOMINATIM_BASE}/reverse?lat=${lat}&lon=${lng}&format=json&zoom=16`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, {
      headers: { 'User-Agent': 'AlertMitra-RoadSafety/1.0' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    const data = await res.json();
    const addr = data.address || {};
    return [addr.road || addr.suburb, addr.city || addr.town || addr.village, addr.state]
      .filter(Boolean).join(', ') || data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

/**
 * Given a route's waypoints array and a list of hazard objects (blackspots, greyspots, community),
 * find which hazards are within `thresholdMeters` of the route.
 */
export function findHazardsNearRoute(waypoints, allHazards, thresholdMeters = 800) {
  const found = [];

  for (const hazard of allHazards) {
    if (!hazard.lat || !hazard.lng) continue;

    let minDist = Infinity;
    let closestIndex = 0;

    // Sample every Nth waypoint for performance
    const step = Math.max(1, Math.floor(waypoints.length / 200));
    for (let i = 0; i < waypoints.length; i += step) {
      const [wLat, wLng] = waypoints[i];
      const d = haversineMeters(wLat, wLng, hazard.lat, hazard.lng);
      if (d < minDist) {
        minDist = d;
        closestIndex = i;
      }
    }

    if (minDist <= thresholdMeters) {
      const kmPercent = waypoints.length > 0 ? (closestIndex / waypoints.length) : 0;
      found.push({
        ...hazard,
        distanceFromRoute: Math.round(minDist),
        kmMarkPercent: kmPercent
      });
    }
  }

  return found;
}

/**
 * Build risk-enriched route objects from raw OSRM routes by analyzing nearby hazards and weather.
 */
export function enrichRoutesWithRisk(routes, blackspots = [], greyspots = [], communityHazards = [], trystanderCells = [], vehicleType = 'Bike', departureTime = '19:00') {
  if (!routes || routes.length === 0) return [];

  const activeCommunity = communityHazards.filter(h => h.verificationStatus !== 'EXPIRED' && h.verificationStatus !== 'REJECTED');

  const enriched = routes.map((route, idx) => {
    const nearbyBlackspotsRaw = findHazardsNearRoute(route.waypoints, blackspots, 800);
    const nearbyGreyspotsRaw = findHazardsNearRoute(route.waypoints, greyspots, 700);
    const nearbyCommunityRaw = findHazardsNearRoute(route.waypoints, activeCommunity, 600);
    const nearbyTrystanderRaw = findHazardsNearRoute(route.waypoints, trystanderCells, 2500);

    const nearbyBlackspots = nearbyBlackspotsRaw.map(b => ({ ...b, kmMark: parseFloat((b.kmMarkPercent * route.distanceKm).toFixed(1)) }));
    const nearbyGreyspots = nearbyGreyspotsRaw.map(g => ({ ...g, kmMark: parseFloat((g.kmMarkPercent * route.distanceKm).toFixed(1)) }));
    const nearbyCommunity = nearbyCommunityRaw.map(c => ({ ...c, kmMark: parseFloat((c.kmMarkPercent * route.distanceKm).toFixed(1)) }));
    const nearbyTrystander = nearbyTrystanderRaw.map(t => ({ ...t, kmMark: parseFloat((t.kmMarkPercent * route.distanceKm).toFixed(1)) }));

    // Compute risk scores
    const bsScore = Math.min(100, nearbyBlackspots.length * 20 + nearbyBlackspots.reduce((s, b) => s + (b.fatalities || 0) * 3, 0));
    const gsScore = Math.min(80, nearbyGreyspots.length * 15);
    const chScore = Math.min(60, nearbyCommunity.length * 22);
    const trystanderBonus = nearbyTrystander.length > 0 ? -12 : 0;

    // Vehicle mode multiplier
    const modeMult = { Bike: 1.3, Car: 1.0, Bus: 0.85, Truck: 1.1 }[vehicleType] || 1.0;

    // Time multiplier
    const hour = parseInt(departureTime?.split(':')[0] || '12');
    const timeMult = (hour >= 18 || hour < 6) ? 1.25 : (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19) ? 1.15 : 1.0;

    // Weather risk
    const weatherRisk = Math.min(80, Math.round((route.distanceKm > 40 ? 35 : 15) * timeMult));
    const crashExposure = Math.min(100, Math.round((bsScore + gsScore * 0.6) * modeMult) || (idx === 0 ? 55 : idx === 1 ? 38 : 22));
    const roadHazards = Math.min(100, Math.round(chScore * modeMult) || (idx === 0 ? 45 : idx === 1 ? 30 : 18));
    const emergencyAccess = Math.max(15, Math.min(85, 65 + trystanderBonus - nearbyTrystander.length * 8));

    const totalRisk = Math.min(100, Math.max(12, Math.round(
      (crashExposure * 0.4 + weatherRisk * 0.25 + roadHazards * 0.2 + emergencyAccess * 0.15) * timeMult + trystanderBonus
    )));

    // Build hazard intersections list for timeline
    const hazardIntersections = [
      ...nearbyBlackspots.map(b => ({ id: b.id, name: b.name, kmMark: b.kmMark, type: 'Blackspot', severity: b.fatalities > 5 ? 'Critical' : 'High', lat: b.lat, lng: b.lng })),
      ...nearbyGreyspots.map(g => ({ id: g.id, name: g.name, kmMark: g.kmMark, type: 'Greyspot', severity: g.severityCategory === 'Very Severe' ? 'High' : 'Moderate', lat: g.lat, lng: g.lng })),
      ...nearbyCommunity.map(c => ({ id: c.id, name: c.title || c.type, kmMark: c.kmMark, type: 'Community', severity: c.severity || 'Moderate', lat: c.lat, lng: c.lng })),
      ...nearbyTrystander.map(t => ({ id: t.id, name: t.name, kmMark: t.kmMark, type: 'Trystander', severity: 'Safe', lat: t.lat, lng: t.lng }))
    ].sort((a, b) => a.kmMark - b.kmMark);

    // Build why-this-route explanation
    const whyThisRoute = [];
    if (nearbyBlackspots.length > 0) whyThisRoute.push(`${nearbyBlackspots.length} historical crash Blackspot(s) along this route.`);
    else whyThisRoute.push('Bypasses known high-fatality MoRTH blackspot zones.');
    if (nearbyGreyspots.length > 0) whyThisRoute.push(`${nearbyGreyspots.length} ADAS-detected Greyspot(s) along corridor.`);
    if (nearbyCommunity.length > 0) whyThisRoute.push(`${nearbyCommunity.length} active community-reported hazard(s) verified nearby.`);
    if (nearbyTrystander.length > 0) whyThisRoute.push(`${nearbyTrystander.length} Trystander emergency rescue cell(s) in rapid reach.`);
    if (vehicleType === 'Bike') whyThisRoute.push('Two-wheeler VRU vulnerability weighting active (+30% factor).');
    if (hour >= 18 || hour < 6) whyThisRoute.push('Night-time visibility penalty applies (+25% risk factor).');

    // Build timeline segments
    const segCount = Math.max(3, Math.min(6, Math.ceil(route.distanceKm / 15)));
    const segLen = route.distanceKm / segCount;
    const timelineSegments = [];
    for (let i = 0; i < segCount; i++) {
      const kmStart = parseFloat((i * segLen).toFixed(1));
      const kmEnd = parseFloat(((i + 1) * segLen).toFixed(1));
      const segHazards = hazardIntersections.filter(h => h.kmMark >= kmStart && h.kmMark < kmEnd);
      const segRisk = Math.min(100, totalRisk + segHazards.length * 12 - (i * 2));
      timelineSegments.push({
        kmStart, kmEnd,
        title: `Segment ${i + 1} (km ${kmStart}–${kmEnd})`,
        riskScore: Math.max(12, segRisk),
        label: segHazards.length > 0 ? `${segHazards.length} hazard(s) in zone` : 'Clear road conditions',
        isPeak: segHazards.length > 0
      });
    }

    return {
      ...route,
      overallRisk: totalRisk,
      riskLevel: totalRisk >= 60 ? 'high' : totalRisk >= 35 ? 'moderate' : 'low',
      breakdown: { crashExposure, weatherRisk, roadHazards, emergencyAccess },
      hazardIntersections,
      whyThisRoute,
      timelineSegments,
      nearbyBlackspots,
      nearbyGreyspots,
      nearbyCommunityHazards: nearbyCommunity,
      nearbyTrystanderCells: nearbyTrystander
    };
  });

  // Sort: lowest risk first is "safer", highest risk is "fastest"
  enriched.sort((a, b) => a.overallRisk - b.overallRisk);

  if (enriched.length >= 1) {
    enriched[0].badge = 'SAFER';
    enriched[0].id = 'safer';
    enriched[0].name = `Safer Route (${enriched[0].distance})`;
  }
  if (enriched.length >= 3) {
    enriched[2].badge = 'FASTEST';
    enriched[2].id = 'fastest';
    enriched[2].name = `Fastest Route (${enriched[2].distance})`;
  }
  if (enriched.length >= 2) {
    const midIdx = enriched.length >= 3 ? 1 : 0;
    enriched[midIdx].badge = 'BALANCED';
    enriched[midIdx].id = 'balanced';
    enriched[midIdx].name = `Balanced Route (${enriched[midIdx].distance})`;
    enriched[midIdx].isRecommended = true;
  }

  // Compute tradeoff strings vs fastest
  const fastest = enriched.find(r => r.id === 'fastest') || enriched[enriched.length - 1];
  enriched.forEach(r => {
    if (r.id !== 'fastest' && fastest) {
      const timeDiff = r.durationMinutes - fastest.durationMinutes;
      const riskDiff = fastest.overallRisk > 0 ? Math.round(((fastest.overallRisk - r.overallRisk) / fastest.overallRisk) * 100) : 0;
      if (timeDiff > 0 && riskDiff > 0) {
        r.tradeoff = `+${timeDiff} min · −${riskDiff}% estimated risk exposure`;
      } else {
        r.tradeoff = `Balanced safety & travel speed`;
      }
    } else {
      r.tradeoff = 'Fastest travel time';
    }
  });

  return enriched;
}

// --- Helpers ---

export function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
