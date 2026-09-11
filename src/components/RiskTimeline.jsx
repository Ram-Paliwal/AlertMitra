import React from 'react';
import { AlertTriangle, CloudRain, ShieldCheck, HelpCircle } from 'lucide-react';

export default function RiskTimeline({ segments = [], hazardIntersections = [], onSelectHazard, currentKm = null }) {
  return (
    <div className="timeline-card">
      <div className="timeline-header">
        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <AlertTriangle size={16} color="#0284c7" />
          Journey Risk Timeline (km-by-km)
        </h4>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Click segments or pins for details
        </span>
      </div>

      {/* Segment Blocks */}
      <div className="timeline-track-container">
        {segments.map((seg, idx) => {
          let bgColor = '#10b981'; // low
          if (seg.riskScore > 65) bgColor = '#ef4444'; // high
          else if (seg.riskScore > 40) bgColor = '#f59e0b'; // moderate

          return (
            <div
              key={idx}
              className="timeline-segment-block"
              style={{
                backgroundColor: bgColor,
                flexGrow: Math.max(1, seg.kmEnd - seg.kmStart)
              }}
              title={`${seg.title}: km ${seg.kmStart}-${seg.kmEnd} (Risk ${seg.riskScore}/100)`}
            >
              {seg.kmStart}k - {seg.kmEnd}k
            </div>
          );
        })}
      </div>

      {/* Interactive Risk Points Along the Route */}
      <div className="timeline-pins-list">
        {hazardIntersections.map((item, idx) => {
          let typeColor = '#3b82f6';
          let badgeText = item.type;
          if (item.type === 'Blackspot') {
            typeColor = '#ef4444';
          } else if (item.type === 'Greyspot') {
            typeColor = '#f59e0b';
          } else if (item.type === 'Weather') {
            typeColor = '#8b5cf6';
          } else if (item.type === 'Trystander') {
            typeColor = '#06b6d4';
          }

          const isPassed = currentKm !== null && currentKm > item.kmMark;

          return (
            <div
              key={idx}
              className="timeline-pin-item"
              style={{ opacity: isPassed ? 0.6 : 1 }}
              onClick={() => {
                if (onSelectHazard) onSelectHazard(item);
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: typeColor
                  }}
                />
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {item.name}
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px',
                    backgroundColor: `${typeColor}15`,
                    color: typeColor,
                    fontWeight: 700
                  }}
                >
                  {badgeText}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  km {item.kmMark}
                </span>
                {isPassed && (
                  <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700 }}>
                    Passed
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
