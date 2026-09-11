/**
 * Predefined Route Corridors and Navigation Alternatives for AlertMitra
 * Primary Demo Corridor: Nagpur Zero Mile -> Pench Tiger Reserve (via NH-44)
 * Secondary Corridors: Nagpur -> Wardha (NH-44/NH-361), Nagpur Ring Road Express Circuit
 */

export const PRESET_JOURNEYS = [
  {
    id: "nagpur-pench",
    title: "Nagpur → Pench (NH-44 Corridor)",
    origin: "Nagpur (Zero Mile / Sitabuldi)",
    originCoords: [21.1467, 79.0833],
    destination: "Pench National Park (Touria Gate)",
    destinationCoords: [21.7580, 79.3140],
    defaultVehicle: "Bike",
    recommendedRouteId: "balanced"
  },
  {
    id: "nagpur-wardha",
    title: "Nagpur → Wardha (Industrial Corridor)",
    origin: "Nagpur (Chhatrapati Square)",
    originCoords: [21.1108, 79.0701],
    destination: "Wardha (Sevagram)",
    destinationCoords: [20.7453, 78.6022],
    defaultVehicle: "Car",
    recommendedRouteId: "balanced"
  },
  {
    id: "nagpur-ring-road",
    title: "Nagpur Ring Road Safety Circuit",
    origin: "Chhatrapati Square",
    originCoords: [21.1108, 79.0701],
    destination: "Chhatrapati Square (Loop via Chikli & Gorewada)",
    destinationCoords: [21.1108, 79.0701],
    defaultVehicle: "Bus",
    recommendedRouteId: "safer"
  }
];

// High-fidelity polyline waypoints for Nagpur -> Pench routes
export const ROUTE_WAYPOINTS = {
  "nagpur-pench": {
    fastest: [
      [21.1467, 79.0833], // Zero Mile Stone
      [21.1527, 79.0788], // RBI Square (Greyspot GS-07)
      [21.1532, 79.0940], // Mayo Square (Blackspot BS-27)
      [21.1623, 79.1411], // Chikli Square (Blackspot BS-37 - High Fatality)
      [21.1839, 79.1169], // Maruti Seva Square, Kamptee Road (Blackspot BS-02)
      [21.2039, 79.1459], // Shere Punjab Dhaba (Greyspot GS-26)
      [21.2290, 79.1820], // Kanhan River Bridge
      [21.3200, 79.2300], // Mansar Junction (NH-44 / Ramtek turn)
      [21.4300, 79.2800], // Paoni Ghat Section
      [21.5600, 79.3100], // Deolapar Foothills (Weather Risk Zone)
      [21.6800, 79.3180], // MP-MH Border Checkpost
      [21.7580, 79.3140]  // Pench National Park
    ],
    balanced: [
      [21.1467, 79.0833], // Zero Mile Stone
      [21.1474, 79.0562], // Ravi Nagar (BS-18)
      [21.1836, 79.0342], // Gorewada Outer Ring Road (BS-26)
      [21.2178, 79.0802], // Eden Garden (GS-24)
      [21.2350, 79.1200], // Kamptee Bypass Elevated Flyover
      [21.2500, 79.1950], // Kanhan Bypass (Divided 4-Lane)
      [21.3200, 79.2300], // Mansar Junction
      [21.4350, 79.2850], // Paoni Delineated Section
      [21.5600, 79.3100], // Deolapar Foothills
      [21.6800, 79.3180], // Border Crossing
      [21.7580, 79.3140]  // Pench National Park
    ],
    safer: [
      [21.1467, 79.0833], // Zero Mile Stone
      [21.1359, 79.0606], // Shankar Nagar (GS-19)
      [21.1108, 79.0701], // Chhatrapati Square (Treated BS-05, Trystander Cell)
      [21.1077, 79.0799], // Narendra Nagar (Treated BS-31)
      [21.1076, 79.1196], // Mhalgi Nagar (Treated BS-29)
      [21.1336, 79.1433], // Wathoda Outer Expressway (BS-36)
      [21.2400, 79.2100], // Eastern Corridor Green Bypass
      [21.3250, 79.2400], // Mansar Flyover
      [21.4400, 79.2900], // Paoni Safe Speed Zone
      [21.5650, 79.3120], // Deolapar Regulated Corridor
      [21.7580, 79.3140]  // Pench National Park
    ]
  }
};

export const ROUTES_DATA = {
  "nagpur-pench": [
    {
      id: "fastest",
      name: "Fastest Route (Direct NH-44)",
      badge: "FASTEST",
      duration: "2h 36m",
      durationMinutes: 156,
      distance: "94.2 km",
      overallRisk: 68,
      riskLevel: "high",
      tradeoff: "Fastest travel time, but passes through high-fatality urban blackspots and heavy freight bottlenecks.",
      tradeoffComparison: "Baseline fastest route",
      breakdown: {
        crashExposure: 76,
        weatherRisk: 64,
        roadHazards: 72,
        emergencyAccess: 55
      },
      whyThisRoute: [
        "Passes through 2 untreated historical high-risk Blackspots: Chikli Square (14 fatalities) and Maruti Seva Square (11 fatalities).",
        "Enters 1 Emerging Greyspot: RBI Square (Severe waterlogging and metro pier blindspot).",
        "ETA window matches heavy monsoon downpour near Deolapar Ghat (km 68-85) at 8:15 PM.",
        "1 Active unverified community report: Pothole cluster & construction debris on Old Kamptee link.",
        "Unsegregated mixed traffic with high two-wheeler density (61% 2W vs 35% heavy freight trucks)."
      ],
      hazardIntersections: [
        { id: "BS-27", name: "Mayo Square", kmMark: 3.5, type: "Blackspot", severity: "High" },
        { id: "BS-37", name: "Chikli Square", kmMark: 8.2, type: "Blackspot", severity: "Critical" },
        { id: "BS-02", name: "Maruti Seva Square", kmMark: 12.1, type: "Blackspot", severity: "High" },
        { id: "GS-07", name: "RBI Square", kmMark: 2.1, type: "Greyspot", severity: "Severe" },
        { id: "HAZ-01", name: "Pothole Cluster — Kamptee Rd", kmMark: 14.8, type: "Community", severity: "Moderate" },
        { id: "WTH-01", name: "Heavy Monsoon Rain Zone (Deolapar)", kmMark: 72.0, type: "Weather", severity: "High" }
      ],
      timelineSegments: [
        { kmStart: 0, kmEnd: 15, title: "Nagpur Urban Core", riskScore: 78, label: "Urban Bottlenecks & 2 Blackspots", isPeak: true },
        { kmStart: 15, kmEnd: 35, title: "Kamptee - Kanhan Highway", riskScore: 48, label: "4-Lane Highway with Good Delineation", isPeak: false },
        { kmStart: 35, kmEnd: 65, title: "Mansar - Paoni Stretch", riskScore: 52, label: "Rolling Terrain, Normal Visibility", isPeak: false },
        { kmStart: 65, kmEnd: 85, title: "Deolapar Foothills", riskScore: 82, label: "Heavy Rain + Night Visibility Drop at ETA", isPeak: true },
        { kmStart: 85, kmEnd: 94.2, title: "Pench National Park Approach", riskScore: 34, label: "Regulated Speed Zone (30 km/h)", isPeak: false }
      ]
    },
    {
      id: "balanced",
      name: "Balanced Route (Outer Ring Bypass)",
      badge: "BALANCED",
      isRecommended: true,
      duration: "2h 47m",
      durationMinutes: 167,
      distance: "102.5 km",
      overallRisk: 43,
      riskLevel: "moderate",
      tradeoff: "+11 min · −37% estimated risk exposure",
      tradeoffComparison: "+11 min · −37% estimated risk exposure vs Fastest",
      breakdown: {
        crashExposure: 38,
        weatherRisk: 45,
        roadHazards: 42,
        emergencyAccess: 48
      },
      whyThisRoute: [
        "Bypasses central urban blackspots via the Gorewada Ring Road corridor.",
        "Utilizes 4-lane divided bypass around Kamptee with physical median separation.",
        "Timing reduces transit duration inside high-precipitation mountain cloud cells.",
        "Direct access to 3 Trystander Golden-Hour responder cells (Gorewada, Kanhan, Mansar).",
        "Road Quality Index (RQI) on selected segments is 6.1/7.0 (CSIR-CRRI benchmark)."
      ],
      hazardIntersections: [
        { id: "BS-18", name: "Ravi Nagar Intersection", kmMark: 4.2, type: "Blackspot", severity: "Moderate" },
        { id: "BS-26", name: "Gorewada to Toll Naka", kmMark: 9.8, type: "Blackspot", severity: "Moderate" },
        { id: "GS-24", name: "Eden Garden to Khemka", kmMark: 16.5, type: "Greyspot", severity: "Mild" },
        { id: "WTH-02", name: "Moderate Rain Forecast (Mansar)", kmMark: 54.0, type: "Weather", severity: "Moderate" }
      ],
      timelineSegments: [
        { kmStart: 0, kmEnd: 18, title: "Nagpur Western Bypass", riskScore: 45, label: "Divided Ring Road, Low Conflict", isPeak: false },
        { kmStart: 18, kmEnd: 42, title: "Kamptee Elevated Expressway", riskScore: 32, label: "Grade-Separated Corridor", isPeak: false },
        { kmStart: 42, kmEnd: 70, title: "Mansar - Deolapar Link", riskScore: 56, label: "Moderate Rain at Estimated Arrival", isPeak: true },
        { kmStart: 70, kmEnd: 102.5, title: "Forest Buffer & Pench Gate", riskScore: 28, label: "Low Traffic, High Illumination", isPeak: false }
      ]
    },
    {
      id: "safer",
      name: "Safer Route (Treated Corridors & Ring Bypass)",
      badge: "SAFER",
      duration: "3h 04m",
      durationMinutes: 184,
      distance: "111.8 km",
      overallRisk: 29,
      riskLevel: "low",
      tradeoff: "+28 min · −57% estimated risk exposure",
      tradeoffComparison: "+28 min · −57% estimated risk exposure vs Fastest",
      breakdown: {
        crashExposure: 24,
        weatherRisk: 30,
        roadHazards: 22,
        emergencyAccess: 40
      },
      whyThisRoute: [
        "Traverses 4 fully remediated iRASTE Blackspots (Chhatrapati Square, Jaiprakash Nagar, Mhalgi Nagar, Wathoda) equipped with TBM rumble strips, table-top slip roads, and active Trystander emergency kiosks.",
        "100% continuous median barrier and illuminated retroreflective road studs.",
        "Re-routed around low-lying flood-prone culverts near Kanhan River.",
        "Maximum coverage by trained Good Samaritan RADMC First Responders (within 2 km of all segments).",
        "Optimal for Two-Wheelers and adverse weather conditions."
      ],
      hazardIntersections: [
        { id: "BS-05", name: "Chhatrapati Square (Remediated)", kmMark: 6.0, type: "Blackspot", severity: "Low" },
        { id: "BS-29", name: "Mhalgi Nagar (Remediated)", kmMark: 12.4, type: "Blackspot", severity: "Low" },
        { id: "TRY-03", name: "Chhatrapati Trystander Kiosk", kmMark: 6.0, type: "Trystander", severity: "Safe" },
        { id: "TRY-08", name: "Wathoda Trystander Kiosk", kmMark: 18.2, type: "Trystander", severity: "Safe" }
      ],
      timelineSegments: [
        { kmStart: 0, kmEnd: 22, title: "Remediated Southern Ring Road", riskScore: 26, label: "TBM Rumble Strips & Table-Top Lanes", isPeak: false },
        { kmStart: 22, kmEnd: 55, title: "Eastern Green Highway", riskScore: 24, label: "Continuous Barrier & Solar Studs", isPeak: false },
        { kmStart: 55, kmEnd: 85, title: "Mansar Outer Loop", riskScore: 38, label: "Passing Weather Zone with Buffer", isPeak: false },
        { kmStart: 85, kmEnd: 111.8, title: "Pench National Park Corridor", riskScore: 22, label: "Protected Forest Arterial", isPeak: false }
      ]
    }
  ]
};
