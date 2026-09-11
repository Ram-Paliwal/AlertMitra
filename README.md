# 🛡️ AlertMitra (अलर्टमित्र)

> **"Know the Risk Before You Reach It"**  
> Proactive road-safety navigation intelligence combining historical crash exposure, MoRTH/CSIR-CRRI **iRASTE** blackspots & greyspots, live crowdsourced hazard reporting, ETA-aware weather risk, and emergency Trystander networks.

[![Live Demo](https://img.shields.io/badge/Live_Demo-alertmitra.vercel.app-00C853?style=for-the-badge&logo=vercel&logoColor=white)](https://alertmitra.vercel.app)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-v12-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)

---

## 🌟 Overview

Conventional navigation systems focus primarily on speed and travel time. **AlertMitra** is built on the **Vision Zero** philosophy: road fatalities and severe injuries are preventable through proactive intelligence.

AlertMitra calculates a dynamic, transparent **Safety Risk Score** for navigation corridors using multi-factor risk modeling—enabling commuters to choose the **safest route**, stay alerted before entering accident-prone blackspots, report road anomalies in real-time, and trigger rapid emergency dispatch.

---

## 🚀 Key Features

### 1. 🛣️ Dynamic Risk-Aware Multi-Route Planner
- Computes and compares routes: **Safer (Recommended)**, **Balanced**, and **Fastest**.
- Rule-based transparent risk engine evaluating:
  $$\text{SegmentRisk}(t) = \text{Baseline Crash Risk} \times \text{Mode} \times \text{Time} \times \text{Weather} \times \text{Incident Factor} \times \text{Geometry}$$
- Tailored risk multipliers for **2-Wheelers (Vulnerable Road Users)**, **Cars**, **Buses**, and **Commercial Freight**.

### 2. 📍 High-Resolution Blackspots & Greyspots Geofencing
- Calibrated with real accident data from **Nagpur & Vidarbha corridors** (CSIR-CRRI & iRASTE Project findings).
- Distinguishes between:
  - **Blackspots**: Statistically verified high-fatality locations.
  - **Greyspots**: Emerging hazard zones identified through ADAS harsh braking and near-miss frequency.
  - **Remediated Zones**: Visualizing infrastructure improvements (median barriers, speed tables, signage).

### 3. 📡 Real-Time Crowdsourced Hazard Reporting
- Citizen reporting for potholes, waterlogging, illegal parking, poor lighting, oil spills, and stray animals.
- **Dynamic Confidence Scoring Engine**:
  - Incorporates photo verification (+15%), community corroboration (+12% per upvote), reporter trust tier, and automated exponential time-decay.
- Fully synchronized across devices with **Firebase Cloud Firestore**.

### 4. 🧭 Live Journey Guidance & Dynamic Rerouting
- Turn-by-turn simulation and live GPS tracking.
- Proactive voice/visual HUD warnings when approaching a hazard or high-risk zone within 500m.
- One-tap dynamic rerouting modal when newly reported incidents emerge along the active path.

### 5. 🚑 Trystander Golden-Hour Emergency Care Network
- Integrated directory and map overlay of roadside triage posts, volunteer **Trystander cells**, and emergency trauma centers to minimize response times during the critical Golden Hour.

### 6. 🏆 Citizen Gamification & Reward Points
- Earn **Safety Karma Points** for contributing verified hazard reports and corroborating community warnings.
- Unlock citizen badges (*Road Guardian*, *Corridor Pioneer*, *Safety Champion*) and claim civic vouchers.

### 7. 🏛️ Civic Authority & Admin Verification Portal
- Dedicated admin portal for road transport authorities, traffic police, and civic bodies.
- Verify citizen reports, mark investigations, update remediation status, and maintain data integrity.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19, JavaScript (ESNext) |
| **Build Tool & Bundler** | Vite 6 |
| **Interactive Maps** | Leaflet 1.9, React-Leaflet integration |
| **Backend & Cloud** | Firebase 12 (Authentication, Cloud Firestore, Analytics) |
| **Icons & UI Assets** | Lucide React, Canvas Confetti |
| **Styling** | Vanilla Modern CSS (Design Tokens, Glassmorphism, Dark Mode) |
| **Deployment** | Vercel Serverless Edge Platform |

---

## 📁 Project Structure

```text
Alertmitra/
├── public/                 # Static assets, icons, and favicon
├── src/
│   ├── components/         # Reusable UI & modal components
│   │   ├── DynamicRerouteModal.jsx   # In-journey safer reroute prompt
│   │   ├── HazardDetailModal.jsx     # Detailed hazard view & upvoting
│   │   ├── Navbar.jsx                # Responsive header & auth controls
│   │   ├── ReportHazardModal.jsx     # Geotagged hazard submission
│   │   ├── RiskMap.jsx               # Leaflet multi-layer map container
│   │   └── RiskTimeline.jsx          # Route risk elevation profile
│   ├── data/               # Geospatial dataset & route definitions
│   │   ├── corridorsAndRoutes.js     # Route polylines & preset journeys
│   │   ├── initialHazards.js         # Baseline hazard database
│   │   ├── nagpurBlackspots.js       # MoRTH/iRASTE blackspot coordinates
│   │   ├── nagpurGreyspots.js        # ADAS harsh braking clusters
│   │   └── trystanderCells.js        # Emergency response nodes
│   ├── engine/             # Core algorithmic safety models
│   │   ├── confidenceEngine.js       # Corroboration & credibility engine
│   │   ├── geofenceEngine.js         # Spatial distance & proximity triggers
│   │   ├── riskEngine.js             # Multi-factor mathematical risk model
│   │   ├── routingEngine.js          # Dynamic route pathing & waypoints
│   │   └── weatherEngine.js          # ETA-aware precipitation & fog penalty
│   ├── screens/            # Application views
│   │   ├── AdminScreen.jsx           # Authority verification dashboard
│   │   ├── CommunityScreen.jsx       # Citizen feed & corroboration
│   │   ├── HomeScreen.jsx            # Multi-mode journey risk planner
│   │   ├── LiveJourneyScreen.jsx     # Active navigation HUD
│   │   ├── ProfileScreen.jsx         # Rewards, karma points & badges
│   │   ├── RouteAnalysisScreen.jsx   # Side-by-side route risk breakdown
│   │   └── SafetyCenterScreen.jsx    # Emergency guidelines & Trystander SOS
│   ├── services/           # External API & Cloud Services
│   │   └── firebase.js               # Firebase Auth, Firestore sync & Analytics
│   ├── styles/             # Global styling
│   │   ├── app.css                   # Core responsive styling & animations
│   │   └── design-tokens.css         # Color palette, spacing, elevations
│   ├── App.jsx             # Main Application root
│   └── main.jsx            # React DOM entry point
├── .env.example            # Environment variable template
├── index.html              # HTML5 entry & Google Fonts
├── package.json            # Project dependencies & scripts
├── vite.config.js          # Vite configuration
└── README.md
```

---

## ⚡ Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn** / **pnpm**
- A **Firebase Project** (optional for local demo, required for live cloud synchronization)

### 1. Clone the Repository
```bash
git clone https://github.com/Ram-Paliwal/AlertMitra.git
cd AlertMitra
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the sample environment file:
```bash
cp .env.example .env
```

Fill in your Firebase credentials in `.env`:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

> **Note**: If `.env` is omitted, AlertMitra automatically runs in offline synchronized browser storage mode with default simulated data.

### 4. Run Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### 5. Build for Production
```bash
npm run build
```

---

## ☁️ Deployment

### Deploy to Vercel
Deploying with Vercel CLI:
```bash
npx vercel --prod
```

#### Important Firebase Auth Domain Setup:
When deploying to Vercel (or any custom domain), add your deployed URL to **Firebase Console**:
1. Open [Firebase Console](https://console.firebase.google.com/) > **Authentication** > **Settings** > **Authorized domains**.
2. Add your deployment domains (e.g. `alertmitra.vercel.app`).

---

## 🤝 Contributing

Contributions to improve road safety algorithms, expand regional GIS datasets, or enhance the citizen UI are warmly welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## 🙏 Acknowledgements

- **CSIR - Central Road Research Institute (CRRI)** for road safety methodology.
- **Project iRASTE (Nagpur)** for benchmark blackspot and greyspot spatial insights.
- **OpenStreetMap** & **Leaflet** community for mapping infrastructure.

---

<p align="center">
  Made with ❤️ for Safer Indian Roads & Commuters
</p>
