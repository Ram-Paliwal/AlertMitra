/**
 * AlertMitra Confidence, Corroboration & Freshness Decay Engine
 * 
 * Rules:
 * 1. Confidence != Verification.
 * 2. New community reports start as UNVERIFIED.
 * 3. Confirmations increase confidence and can promote to COMMUNITY CORROBORATED.
 * 4. Only Admin action can set VERIFIED or REJECTED.
 * 5. Exponential freshness decay over hours without confirmations -> decays to EXPIRED.
 */

export function calculateHazardConfidence({
  sourceType = "Community User",
  hasPhoto = false,
  confirmationsCount = 0,
  notPresentCount = 0,
  unsureCount = 0,
  createdAt,
  updatedAt,
  reporterTrustScore = 60
}) {
  // 1. Base confidence by source credibility
  let base = 40;
  if (sourceType.includes("Authority") || sourceType.includes("Police") || sourceType.includes("IMD")) {
    base = 92;
  } else if (sourceType.includes("Trystander") || sourceType.includes("Samaritan")) {
    base = 75;
  } else if (sourceType.includes("ADAS") || sourceType.includes("NMC")) {
    base = 80;
  } else {
    base = Math.max(30, Math.min(65, reporterTrustScore * 0.7));
  }

  // 2. Evidence bonus
  if (hasPhoto) {
    base += 12;
  }

  // 3. Confirmations and Contradictions
  const netConfirmations = confirmationsCount - (notPresentCount * 2.5) - (unsureCount * 0.5);
  const confirmationBonus = Math.min(35, Math.max(-30, netConfirmations * 2.2));

  // 4. Freshness Time Decay
  const now = Date.now();
  const lastActiveTime = new Date(updatedAt || createdAt).getTime();
  const ageInHours = Math.max(0, (now - lastActiveTime) / (1000 * 60 * 60));

  let decayMultiplier = 1.0;
  if (ageInHours < 1) {
    decayMultiplier = 1.0; // 100% fresh
  } else if (ageInHours < 6) {
    decayMultiplier = 0.92;
  } else if (ageInHours < 24) {
    decayMultiplier = 0.78;
  } else if (ageInHours < 48) {
    decayMultiplier = 0.55;
  } else if (ageInHours < 96) {
    decayMultiplier = 0.30;
  } else {
    decayMultiplier = 0.05; // Expired
  }

  const rawConfidence = (base + confirmationBonus) * decayMultiplier;
  const confidence = Math.min(99, Math.max(5, Math.round(rawConfidence)));

  // Generate clear, trustworthy human explanation
  let explanation = "";
  if (sourceType.includes("Authority") || sourceType.includes("Police")) {
    explanation = `${confidence}% confidence from official Traffic Police / IMD sensor feed.`;
  } else if (confirmationsCount > 0) {
    explanation = `${confidence}% confidence based on ${hasPhoto ? "photo evidence and " : ""}${confirmationsCount} independent community confirmation${confirmationsCount > 1 ? "s" : ""}.`;
    if (notPresentCount > 0) {
      explanation += ` (${notPresentCount} contradiction${notPresentCount > 1 ? "s" : ""} noted)`;
    }
  } else {
    explanation = `${confidence}% baseline confidence for recent single-user submission (awaiting community corroboration).`;
  }

  return {
    confidence,
    decayMultiplier,
    ageInHours: Math.round(ageInHours * 10) / 10,
    explanation,
    isExpired: ageInHours >= 72 || confidence < 15
  };
}

/**
 * Updates hazard state when a user submits a confirmation (CONFIRM, NOT_PRESENT, UNSURE)
 */
export function processUserConfirmation(hazard, actionType, userId = "current-user") {
  if (hazard.confirmedUserIds && hazard.confirmedUserIds.includes(userId)) {
    return { error: "You have already submitted a confirmation for this hazard." };
  }

  const updated = { ...hazard };
  updated.confirmedUserIds = [...(updated.confirmedUserIds || []), userId];
  updated.updatedAt = new Date().toISOString();

  if (actionType === "CONFIRM") {
    updated.confirmationsCount = (updated.confirmationsCount || 0) + 1;
  } else if (actionType === "NOT_PRESENT") {
    updated.notPresentCount = (updated.notPresentCount || 0) + 1;
  } else if (actionType === "UNSURE") {
    updated.unsureCount = (updated.unsureCount || 0) + 1;
  }

  const confResult = calculateHazardConfidence(updated);
  updated.confidence = confResult.confidence;

  // Auto-promote UNVERIFIED to COMMUNITY CORROBORATED if sufficient confirmations exist
  // Note: Only admin can set to VERIFIED.
  if (updated.verificationStatus === "UNVERIFIED" && updated.confirmationsCount >= 3 && updated.confidence >= 65) {
    updated.verificationStatus = "COMMUNITY CORROBORATED";
  }

  if (confResult.isExpired && updated.verificationStatus !== "VERIFIED") {
    updated.verificationStatus = "EXPIRED";
  }

  return { success: true, hazard: updated, explanation: confResult.explanation };
}
