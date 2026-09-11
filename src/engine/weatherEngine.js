/**
 * AlertMitra ETA-Aware Weather Intelligence Engine
 * Predicts meteorological hazards strictly at the calculated ETA window when the user reaches a specific road segment.
 */

export const MOCK_HOURLY_FORECAST_CORRIDORS = {
  "Nagpur Urban": {
    "17:00": { condition: "Clear", temp: 32, rainProb: 10, visibilityKm: 10, windKmh: 12 },
    "18:00": { condition: "Partly Cloudy", temp: 30, rainProb: 20, visibilityKm: 9, windKmh: 14 },
    "19:00": { condition: "Light Rain", temp: 28, rainProb: 55, visibilityKm: 7, windKmh: 18 },
    "20:00": { condition: "Heavy Rain", temp: 26, rainProb: 80, visibilityKm: 4, windKmh: 24 },
    "21:00": { condition: "Heavy Rain", temp: 25, rainProb: 85, visibilityKm: 3.5, windKmh: 28 },
    "22:00": { condition: "Light Rain", temp: 25, rainProb: 40, visibilityKm: 6, windKmh: 16 }
  },
  "Mansar - Paoni": {
    "17:00": { condition: "Clear", temp: 31, rainProb: 15, visibilityKm: 10, windKmh: 10 },
    "18:00": { condition: "Partly Cloudy", temp: 29, rainProb: 30, visibilityKm: 8, windKmh: 15 },
    "19:00": { condition: "Light Rain", temp: 27, rainProb: 60, visibilityKm: 6, windKmh: 20 },
    "20:00": { condition: "Heavy Rain", temp: 25, rainProb: 85, visibilityKm: 3, windKmh: 30 },
    "21:00": { condition: "Storm", temp: 24, rainProb: 90, visibilityKm: 2.5, windKmh: 35 },
    "22:00": { condition: "Light Rain", temp: 24, rainProb: 50, visibilityKm: 5, windKmh: 18 }
  },
  "Deolapar Foothills (Pench Approach)": {
    "17:00": { condition: "Clear", temp: 29, rainProb: 20, visibilityKm: 9, windKmh: 12 },
    "18:00": { condition: "Light Rain", temp: 27, rainProb: 45, visibilityKm: 7, windKmh: 18 },
    "19:00": { condition: "Heavy Rain", temp: 24, rainProb: 75, visibilityKm: 4, windKmh: 26 },
    "20:00": { condition: "Fog & Heavy Rain", temp: 22, rainProb: 90, visibilityKm: 1.2, windKmh: 32 },
    "21:00": { condition: "Dense Fog & Rain", temp: 21, rainProb: 95, visibilityKm: 0.8, windKmh: 38 },
    "22:00": { condition: "Fog", temp: 20, rainProb: 40, visibilityKm: 2.0, windKmh: 15 }
  }
};

/**
 * Calculates arrival time at a segment given departure time string (e.g. '19:00') and elapsed minutes.
 */
export function calculateSegmentETA(departureTimeStr, elapsedMinutes) {
  const [hours, minutes] = departureTimeStr.split(":").map(Number);
  const totalMinutes = (hours * 60 + minutes + Math.round(elapsedMinutes)) % 1440;
  const etaHour = Math.floor(totalMinutes / 60);
  const etaMinute = totalMinutes % 60;
  
  // Format for display (e.g. '8:05 PM')
  const period = etaHour >= 12 ? "PM" : "AM";
  const displayHour = etaHour % 12 === 0 ? 12 : etaHour % 12;
  const displayMinute = etaMinute.toString().padStart(2, "0");
  const formatted = `${displayHour}:${displayMinute} ${period}`;
  
  // Key for lookup (closest top of hour)
  const lookupHour = (etaMinute >= 30 ? (etaHour + 1) % 24 : etaHour).toString().padStart(2, "0") + ":00";
  
  return {
    formatted,
    lookupHour,
    hour24: etaHour,
    minute: etaMinute
  };
}

/**
 * Assesses ETA-aware weather condition at a given segment
 */
export function getETAWeatherForecast(corridorZone, departureTimeStr, elapsedMinutes) {
  const eta = calculateSegmentETA(departureTimeStr, elapsedMinutes);
  const region = MOCK_HOURLY_FORECAST_CORRIDORS[corridorZone] || MOCK_HOURLY_FORECAST_CORRIDORS["Nagpur Urban"];
  
  const forecast = region[eta.lookupHour] || region["20:00"] || {
    condition: "Clear",
    temp: 28,
    rainProb: 15,
    visibilityKm: 8,
    windKmh: 14
  };

  let riskTier = "Low";
  let advisory = "Normal driving conditions.";

  if (forecast.condition.includes("Heavy Rain") || forecast.condition.includes("Dense Fog") || forecast.condition.includes("Storm")) {
    riskTier = "High";
    advisory = `${forecast.condition} expected when you reach this segment at ${eta.formatted}. Significantly reduce speed and expect wet asphalt braking delays.`;
  } else if (forecast.condition.includes("Light Rain") || forecast.condition.includes("Fog") || forecast.rainProb >= 40) {
    riskTier = "Moderate";
    advisory = `${forecast.condition} expected around ${eta.formatted}. Use low beams and maintain increased headway distance.`;
  }

  return {
    etaFormatted: eta.formatted,
    condition: forecast.condition,
    temperature: forecast.temp,
    rainProbability: forecast.rainProb,
    visibilityKm: forecast.visibilityKm,
    windSpeedKmh: forecast.windKmh,
    riskTier,
    advisory
  };
}
