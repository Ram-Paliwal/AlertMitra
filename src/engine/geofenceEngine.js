/**
 * AlertMitra GPS Tracking and Geofence Warning Engine
 * Calculates distances along route, triggers proactive alerts before the user arrives at the hazard,
 * and plays web audio synthesized warning chimes.
 */

// Haversine formula distance in meters
export function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Evaluates proximity of vehicle to a list of known hazards / blackspots / greyspots
 */
export function evaluateGeofences(vehiclePos, hazardsList, previouslyTriggeredIds = new Set()) {
  const results = [];
  let immediateActiveAlert = null;
  let nextUpcomingRisk = null;

  hazardsList.forEach(item => {
    if (!item.lat || !item.lng) return;
    const distanceM = getDistanceMeters(vehiclePos.lat, vehiclePos.lng, item.lat, item.lng);
    const warningThresholdM = (item.radius || 350) + 500; // Geofence warning threshold

    let status = "upcoming";
    if (distanceM <= (item.radius || 300)) {
      status = "active";
    } else if (distanceM <= warningThresholdM) {
      status = "warning";
    } else if (previouslyTriggeredIds.has(item.id) && distanceM > warningThresholdM * 1.5) {
      status = "cleared";
    }

    const hazardEntry = {
      ...item,
      distanceMeters: Math.round(distanceM),
      distanceKm: (distanceM / 1000).toFixed(1),
      geofenceStatus: status
    };

    results.push(hazardEntry);

    if (status === "active" || status === "warning") {
      if (!immediateActiveAlert || distanceM < immediateActiveAlert.distanceMeters) {
        immediateActiveAlert = hazardEntry;
      }
    }
  });

  // Sort by distance ahead
  results.sort((a, b) => a.distanceMeters - b.distanceMeters);

  // Find next upcoming risk ahead
  const upcomingCandidates = results.filter(r => r.distanceMeters > 300 && r.geofenceStatus !== "cleared");
  if (upcomingCandidates.length > 0) {
    nextUpcomingRisk = upcomingCandidates[0];
  }

  return {
    allWithDistances: results,
    immediateActiveAlert,
    nextUpcomingRisk
  };
}

/**
 * Web Audio API synthesized alert chime (No external mp3 needed)
 */
export function playAlertChime(type = "warning") {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "critical") {
      // High-low two-tone urgency beep
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === "warning") {
      // Gentle warning ping
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === "cleared") {
      // Pleasant resolved chime
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12); // E5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch (e) {
    // Audio context might be restricted before user gesture
    console.warn("Audio chime skipped:", e);
  }
}
