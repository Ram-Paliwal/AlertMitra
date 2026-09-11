import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import HomeScreen from './screens/HomeScreen';
import RouteAnalysisScreen from './screens/RouteAnalysisScreen';
import LiveJourneyScreen from './screens/LiveJourneyScreen';
import CommunityScreen from './screens/CommunityScreen';
import SafetyCenterScreen from './screens/SafetyCenterScreen';
import AdminScreen from './screens/AdminScreen';
import ProfileScreen from './screens/ProfileScreen';
import HazardDetailModal from './components/HazardDetailModal';
import ReportHazardModal from './components/ReportHazardModal';
import DynamicRerouteModal from './components/DynamicRerouteModal';

import { NAGPUR_BLACKSPOTS } from './data/nagpurBlackspots';
import { NAGPUR_GREYSPOTS } from './data/nagpurGreyspots';
import { TRYSTANDER_CELLS } from './data/trystanderCells';
import { PRESET_JOURNEYS, ROUTES_DATA } from './data/corridorsAndRoutes';
import { INITIAL_HAZARDS } from './data/initialHazards';
import { calculateSegmentRisk } from './engine/riskEngine';
import {
  subscribeToHazards,
  addHazardToDatabase,
  confirmHazardInDatabase,
  updateHazardStatusInDatabase,
  signInWithGoogle,
  logoutUser,
  subscribeToAuth
} from './services/firebase';

export default function App() {
  const [activeTab, setActiveTab] = useState('planner'); // planner, analysis, live, community, safety, admin, profile
  const [journeyParams, setJourneyParams] = useState({
    journeyId: 'nagpur-pench',
    journeyInfo: PRESET_JOURNEYS[0],
    vehicle: 'Bike',
    departureTime: '19:00',
    preferences: { avoidHighCrash: true, avoidSevereWeather: true, avoidReportedHazards: true }
  });

  const [selectedRouteId, setSelectedRouteId] = useState('balanced');
  const [hazards, setHazards] = useState(INITIAL_HAZARDS);
  const [inspectedHazard, setInspectedHazard] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isRerouteModalOpen, setIsRerouteModalOpen] = useState(false);
  const [rewardsPoints, setRewardsPoints] = useState(450);
  const [currentUser, setCurrentUser] = useState(null);

  // Subscribe to Realtime Firebase Hazards & Auth State
  useEffect(() => {
    const unsubHazards = subscribeToHazards((liveHazards) => {
      setHazards(liveHazards);
    });

    const unsubAuth = subscribeToAuth((user) => {
      setCurrentUser(user);
    });

    return () => {
      if (unsubHazards && typeof unsubHazards === 'function') unsubHazards();
      if (unsubAuth && typeof unsubAuth === 'function') unsubAuth();
    };
  }, []);

  // Google Sign In & Sign Out Handlers
  const handleGoogleLogin = async () => {
    try {
      const user = await signInWithGoogle();
      setCurrentUser(user);
    } catch (err) {
      console.error('Google sign-in error:', err);
      alert(err.message || 'Google Sign-In failed.');
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
  };

  // Dynamic Route Risk Calculation based on current hazards and parameters
  const computedRoutes = useMemo(() => {
    if (journeyParams.customRoutes && journeyParams.customRoutes.length > 0) {
      return journeyParams.customRoutes;
    }

    const rawRoutes = ROUTES_DATA[journeyParams.journeyId] || ROUTES_DATA['nagpur-pench'];
    return rawRoutes.map(route => {
      // Evaluate risk through risk engine
      const activeDynamicHazards = hazards.filter(h => h.verificationStatus !== 'EXPIRED' && h.verificationStatus !== 'REJECTED');
      
      const riskCalc = calculateSegmentRisk({
        blackspots: route.hazardIntersections?.filter(h => h.type === 'Blackspot') || [],
        greyspots: route.hazardIntersections?.filter(h => h.type === 'Greyspot') || [],
        hazards: activeDynamicHazards,
        weatherCondition: route.id === 'fastest' ? 'Heavy Rain' : route.id === 'balanced' ? 'Light Rain' : 'Clear',
        timeOfDay: journeyParams.departureTime >= '18:00' ? 'Night' : 'Day',
        vehicleType: journeyParams.vehicle,
        isRemediated: route.id === 'safer',
        hasDividedMedian: route.id !== 'fastest',
        hasTrystanderCellNearby: route.id === 'safer' || route.id === 'balanced'
      });

      return {
        ...route,
        overallRisk: route.overallRisk || riskCalc.totalRisk,
        riskLevel: riskCalc.riskLevel,
        breakdown: {
          crashExposure: route.breakdown?.crashExposure || riskCalc.crashExposure,
          weatherRisk: route.breakdown?.weatherRisk || riskCalc.weatherRisk,
          roadHazards: route.breakdown?.roadHazards || riskCalc.roadHazards,
          emergencyAccess: route.breakdown?.emergencyAccess || riskCalc.emergencyAccess
        }
      };
    });
  }, [journeyParams, hazards]);

  const selectedRoute = computedRoutes.find(r => r.id === selectedRouteId) || computedRoutes[1] || computedRoutes[0];

  // Handler: Journey Analysis Submitted from Home
  const handleAnalyzeJourney = (params) => {
    setJourneyParams(params);
    setSelectedRouteId('balanced'); // default to recommended
    setActiveTab('analysis');
  };

  // Handler: Start Live Journey
  const handleStartLiveJourney = (route) => {
    if (route) setSelectedRouteId(route.id);
    setActiveTab('live');
  };

  // Handler: Add new community hazard report (Synced with Firebase)
  const handleAddHazardReport = async (newHazard) => {
    const payload = {
      ...newHazard,
      reportedBy: currentUser?.displayName || 'Citizen Reporter',
      reportedByUid: currentUser?.uid || 'anon',
      userPhoto: currentUser?.photoURL || null
    };

    // Save to Firebase
    await addHazardToDatabase(payload);
    setRewardsPoints(pts => pts + 25); // +25 points for reporting
  };

  // Handler: Update hazard / Confirmation (Synced with Firebase)
  const handleUpdateHazard = async (updatedHazard) => {
    await confirmHazardInDatabase(updatedHazard.id, updatedHazard);
    setRewardsPoints(pts => pts + 10); // +10 points for confirming
  };

  // Admin Actions (Synced with Firebase)
  const handleVerifyHazard = async (id, note) => {
    await updateHazardStatusInDatabase(id, 'VERIFIED', note, 99);
  };

  const handleRejectHazard = async (id, note) => {
    await updateHazardStatusInDatabase(id, 'REJECTED', note, 0);
  };

  const handleInvestigateHazard = async (id, note) => {
    await updateHazardStatusInDatabase(id, 'INVESTIGATING', note, 50);
  };

  // Switch Route from Dynamic Reroute Modal
  const handleAcceptReroute = () => {
    setSelectedRouteId('safer');
    setIsRerouteModalOpen(false);
  };

  const pendingReportsCount = hazards.filter(
    h => h.verificationStatus === 'UNVERIFIED' || h.verificationStatus === 'COMMUNITY CORROBORATED'
  ).length;

  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingReportsCount={pendingReportsCount}
        rewardsPoints={rewardsPoints}
        currentUser={currentUser}
        onLoginWithGoogle={handleGoogleLogin}
        onLogout={handleLogout}
      />

      {/* Main Content Views */}
      <div className="main-view-wrapper">
        {activeTab === 'planner' && (
          <HomeScreen
            onAnalyzeJourney={handleAnalyzeJourney}
            onNavigateToMap={() => setActiveTab('analysis')}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onNavigateToSafety={() => setActiveTab('safety')}
            hazards={hazards}
          />
        )}

        {activeTab === 'analysis' && (
          <RouteAnalysisScreen
            journeyData={journeyParams}
            routesList={computedRoutes}
            selectedRouteId={selectedRouteId}
            onSelectRoute={setSelectedRouteId}
            onStartLiveJourney={handleStartLiveJourney}
            onSelectHazard={setInspectedHazard}
            blackspots={NAGPUR_BLACKSPOTS}
            greyspots={NAGPUR_GREYSPOTS}
            hazards={hazards}
            trystanderCells={TRYSTANDER_CELLS}
          />
        )}

        {activeTab === 'live' && (
          <LiveJourneyScreen
            route={selectedRoute}
            allHazards={hazards}
            blackspots={NAGPUR_BLACKSPOTS}
            greyspots={NAGPUR_GREYSPOTS}
            trystanderCells={TRYSTANDER_CELLS}
            onSelectHazard={setInspectedHazard}
            onTriggerRerouteModal={() => setIsRerouteModalOpen(true)}
          />
        )}

        {activeTab === 'community' && (
          <CommunityScreen
            hazards={hazards}
            onUpdateHazard={handleUpdateHazard}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onSelectHazard={setInspectedHazard}
          />
        )}

        {activeTab === 'safety' && <SafetyCenterScreen />}

        {activeTab === 'admin' && (
          <AdminScreen
            hazards={hazards}
            blackspots={NAGPUR_BLACKSPOTS}
            greyspots={NAGPUR_GREYSPOTS}
            trystanderCells={TRYSTANDER_CELLS}
            onVerifyHazard={handleVerifyHazard}
            onRejectHazard={handleRejectHazard}
            onInvestigateHazard={handleInvestigateHazard}
            onSelectHazard={setInspectedHazard}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileScreen
            rewardsPoints={rewardsPoints}
            onAddPoints={pts => setRewardsPoints(p => p + pts)}
            currentUser={currentUser}
          />
        )}
      </div>

      {/* Hazard Deep Dive Inspection Modal */}
      <HazardDetailModal
        hazard={inspectedHazard}
        onClose={() => setInspectedHazard(null)}
      />

      {/* Report New Hazard Modal */}
      <ReportHazardModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitReport={handleAddHazardReport}
      />

      {/* Dynamic Reroute Alert Modal */}
      <DynamicRerouteModal
        isOpen={isRerouteModalOpen}
        onClose={() => setIsRerouteModalOpen(false)}
        onAcceptReroute={handleAcceptReroute}
        currentHazard={hazards.find(h => h.id === 'HAZ-002')}
        alternativeRoute={computedRoutes.find(r => r.id === 'safer')}
      />
    </div>
  );
}
