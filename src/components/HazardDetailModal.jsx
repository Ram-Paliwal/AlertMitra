import React from 'react';
import { X, AlertCircle, Shield, Info, CheckCircle2, Navigation, AlertTriangle } from 'lucide-react';

export default function HazardDetailModal({ hazard, onClose, onConfirmHazard }) {
  if (!hazard) return null;

  const isBlackspot = hazard.categoryType === 'Blackspot' || hazard.fatalities !== undefined;
  const isGreyspot = hazard.categoryType === 'Greyspot' || hazard.severityCategory !== undefined;
  const isTrystander = hazard.categoryType === 'Trystander Kiosk' || hazard.leadSamaritans !== undefined;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        {/* Header Classification */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
          {isBlackspot ? (
            <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
              HISTORICAL CRASH BLACKSPOT (MoRTH Protocol)
            </span>
          ) : isGreyspot ? (
            <span style={{ background: '#fef3c7', color: '#b45309', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
              PROACTIVE ADAS GREYSPOT ({hazard.severityCategory || 'Emerging Unsafe Zone'})
            </span>
          ) : isTrystander ? (
            <span style={{ background: '#cffafe', color: '#0e7490', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
              TRYSTANDER GOLDEN-HOUR EMERGENCY CELL
            </span>
          ) : (
            <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
              COMMUNITY ROAD HAZARD ({hazard.verificationStatus || 'UNVERIFIED'})
            </span>
          )}
        </div>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem', lineHeight: 1.25 }}>
          {hazard.name || hazard.title}
        </h2>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Navigation size={14} />
          {hazard.roadName || hazard.locationName || `Coordinates: ${hazard.lat?.toFixed(4)}, ${hazard.lng?.toFixed(4)}`}
        </p>

        {/* Key Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {isBlackspot && (
            <>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL CRASHES</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ef4444' }}>{hazard.totalCrashes || 0}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>FATALITIES</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#991b1b' }}>{hazard.fatalities || 0}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>MAJOR INJURIES</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706' }}>{hazard.majorInjuries || 0}</div>
              </div>
            </>
          )}

          {isGreyspot && (
            <>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>SEVERITY INDEX</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706' }}>
                  {hazard.severityScore ? (hazard.severityScore * 100).toFixed(0) : '78'}/100
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>ADAS ALERTS</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{hazard.adasDominantAlert || 'FCW, HMW'}</div>
              </div>
            </>
          )}

          {isTrystander && (
            <>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>GOOD SAMARITANS</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0891b2' }}>{hazard.selectedSamaritansCount}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>LIVES SAVED</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>{hazard.victimsHelped}</div>
              </div>
            </>
          )}

          <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>CONFIDENCE</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284c7' }}>
              {hazard.confidence || (isBlackspot ? '94%' : isGreyspot ? '88%' : '82%')}
            </div>
          </div>
        </div>

        {/* Why Flagged */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Info size={15} color="#0284c7" />
            Why This Location Was Flagged
          </h4>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', lineHeight: 1.5 }}>
            {hazard.whyFlagged || hazard.observedIssues || hazard.description || 'Identified via multi-factor statistical and sensory collision cluster analysis.'}
          </p>
        </div>

        {/* Countermeasures / Status if Blackspot or Greyspot */}
        {(hazard.remedialMeasures || hazard.suggestedRemedialMeasures) && (
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={15} />
              Engineering Countermeasures (DPR / GDP)
            </h4>
            <div style={{ background: '#f0fdf4', padding: '0.85rem', borderRadius: '8px', border: '1px solid #bbf7d0', fontSize: '0.85rem', color: '#166534', lineHeight: 1.5 }}>
              <div><b>Interventions:</b> {hazard.remedialMeasures || hazard.suggestedRemedialMeasures}</div>
              {hazard.costEstimate && <div style={{ marginTop: '0.35rem' }}><b>Cost Estimate:</b> {hazard.costEstimate} ({hazard.expectedCrashReduction})</div>}
              {hazard.status && <div style={{ marginTop: '0.2rem' }}><b>Implementation Status:</b> {hazard.status}</div>}
            </div>
          </div>
        )}

        {/* Traveler Advice */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <AlertTriangle size={15} color="#d97706" />
            Traveler Safety Advice
          </h4>
          <div style={{ background: '#fffbeb', padding: '0.85rem', borderRadius: '8px', border: '1px solid #fde68a', fontSize: '0.88rem', color: '#92400e', fontWeight: 500, lineHeight: 1.45 }}>
            {hazard.travelerAdvice || 'Reduce speed, remain alert to merging two-wheelers and pedestrians, and maintain a 3-second safe headway distance.'}
            <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#b45309' }}>
              * AlertMitra communicates risk exposure, never certainty of an incident.
            </div>
          </div>
        </div>

        {/* Data Provenance Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <div>
            <b>Source:</b> {hazard.source || 'Project iRASTE Nagpur / CSIR-CRRI Road Safety Dataset'}
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
