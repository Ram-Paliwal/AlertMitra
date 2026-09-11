/**
 * AlertMitra Transparent Rule-Based Multi-Factor Risk Engine
 * Implements:
 * SegmentRisk(t) = BaselineCrashRisk * TimeFactor * WeatherFactor * IncidentFactor * RoadGeometryFactor * ModeFactor
 * 
 * Complies with MoRTH / CSIR-CRRI iRASTE 2024 Findings:
 * - 2-Wheelers represent 54% of city crashes & 87% VRU exposure (vulnerability multiplier)
 * - TBM & Remedial geometric improvements cut severe crashes by 60-66%
 * - ETA-Aware weather penalizes hazards during arrival windows
 */

export function calculateSegmentRisk({
  blackspots = [],
  greyspots = [],
  hazards = [],
  weatherCondition = "Clear", // Clear, Light Rain, Heavy Rain, Fog, Storm
  timeOfDay = "Day", // MorningPeak, Day, EveningPeak, Night
  vehicleType = "Bike", // Bike, Car, Bus, Truck
  isRemediated = false,
  hasDividedMedian = true,
  hasTrystanderCellNearby = false
}) {
  // 1. Baseline Crash Exposure
  let baselineRisk = 15; // standard base
  if (blackspots.length > 0) {
    // Sum weighted severity of blackspots on segment
    const maxFatalities = Math.max(...blackspots.map(b => b.fatalities || 0));
    baselineRisk += Math.min(50, 25 + maxFatalities * 2.5);
  }
  if (greyspots.length > 0) {
    const highestGreyspot = greyspots.reduce((max, g) => (g.severityScore > max ? g.severityScore : max), 0);
    baselineRisk += highestGreyspot * 30;
  }

  // Remediation benefit (e.g. Chhatrapati Square, Prakash High School, Wadhamna completed works)
  if (isRemediated) {
    baselineRisk *= 0.42; // ~58% risk reduction based on iRASTE post-implementation studies
  }

  // 2. Mode Factor (Vulnerable Road Users in Indian mixed traffic)
  const modeMultipliers = {
    Bike: 1.35,  // High VRU vulnerability
    Car: 1.00,   // Standard reference
    Bus: 0.85,   // Large commercial fleet ADAS protection
    Truck: 1.05  // Freight momentum / stopping distance factor
  };
  const modeFactor = modeMultipliers[vehicleType] || 1.0;

  // 3. Time Factor
  const timeMultipliers = {
    Day: 1.0,
    MorningPeak: 1.15,
    EveningPeak: 1.25,
    Night: 1.35 // Higher speed violations & lack of lighting (iRASTE Chapter 1)
  };
  const timeFactor = timeMultipliers[timeOfDay] || 1.0;

  // 4. Weather Factor (ETA-Aware)
  const weatherMultipliers = {
    Clear: 1.0,
    "Light Rain": 1.20,
    "Heavy Rain": 1.45,
    Fog: 1.40,
    Storm: 1.60
  };
  const weatherFactor = weatherMultipliers[weatherCondition] || 1.0;

  // 5. Dynamic Hazard Modifier
  let incidentFactor = 1.0;
  const activeHazards = hazards.filter(h => h.verificationStatus !== "EXPIRED" && h.verificationStatus !== "REJECTED");
  if (activeHazards.length > 0) {
    activeHazards.forEach(h => {
      const weight = h.verificationStatus === "VERIFIED" ? 0.35 : (h.verificationStatus === "COMMUNITY CORROBORATED" ? 0.25 : 0.15);
      incidentFactor += (h.confidence / 100) * weight;
    });
  }

  // 6. Geometry & Infrastructure Factor
  let geometryFactor = 1.0;
  if (!hasDividedMedian) geometryFactor += 0.20; // lack of median increases head-on risk
  if (hasTrystanderCellNearby) geometryFactor -= 0.15; // rapid golden hour rescue availability

  // Combined score normalized to 0 - 100
  const totalScore = Math.min(100, Math.round(baselineRisk * modeFactor * timeFactor * weatherFactor * incidentFactor * geometryFactor));

  // Risk sub-breakdowns
  const crashExposureScore = Math.min(100, Math.round(baselineRisk * modeFactor));
  const weatherRiskScore = Math.min(100, Math.round(20 * (weatherFactor - 1.0) * 2.5 + (weatherCondition !== "Clear" ? 30 : 5)));
  const roadHazardsScore = Math.min(100, Math.round(activeHazards.length * 22 * (incidentFactor > 1.0 ? 1.2 : 0.5)));
  const emergencyAccessScore = hasTrystanderCellNearby ? 25 : 60; // Lower is better (safer)

  return {
    totalRisk: totalScore,
    crashExposure: crashExposureScore,
    weatherRisk: weatherRiskScore,
    roadHazards: roadHazardsScore,
    emergencyAccess: emergencyAccessScore,
    riskLevel: totalScore >= 65 ? "high" : (totalScore >= 38 ? "moderate" : "low")
  };
}

export function generateRiskExplanations(route, vehicleType, weatherAtArrival, activeHazardsOnRoute) {
  const points = [];

  if (route.hazardIntersections) {
    const blackspots = route.hazardIntersections.filter(h => h.type === "Blackspot");
    if (blackspots.length > 0) {
      points.push(`${blackspots.length} historical crash Blackspot(s) identified on route (${blackspots.map(b => b.name).join(", ")}).`);
    }

    const greyspots = route.hazardIntersections.filter(h => h.type === "Greyspot");
    if (greyspots.length > 0) {
      points.push(`${greyspots.length} emerging ADAS collision alert Greyspot(s) detected (${greyspots.map(g => g.name).join(", ")}).`);
    }
  }

  if (weatherAtArrival && weatherAtArrival !== "Clear") {
    points.push(`${weatherAtArrival} expected during your arrival window along critical highway segments.`);
  }

  if (activeHazardsOnRoute && activeHazardsOnRoute.length > 0) {
    points.push(`${activeHazardsOnRoute.length} active community-reported hazard(s) on or near this corridor.`);
  }

  if (vehicleType === "Bike") {
    points.push("Two-wheelers account for 54% of recorded urban casualties in Nagpur; defensive headway buffer strongly advised.");
  } else if (vehicleType === "Truck") {
    points.push("Freight vehicle speed-delineation zones (TBM rumble strips) in effect along entry approaches.");
  }

  return points;
}
