import React, { useState } from 'react';
import { PhoneCall, MapPin, Hospital, Shield, HeartPulse, CheckCircle2, Share2, AlertOctagon, UserCheck } from 'lucide-react';
import { TRYSTANDER_CELLS, EMERGENCY_SERVICES } from '../data/trystanderCells';

export default function SafetyCenterScreen() {
  const [sosTriggered, setSosTriggered] = useState(false);
  const [copied, setCopied] = useState(false);

  // Default simulated location (Nagpur central corridor)
  const currentCoords = { lat: 21.1467, lng: 79.0833, address: 'Near Zero Mile Stone, Wardha Road, Nagpur (440001)' };

  const handleSosClick = () => {
    setSosTriggered(true);
  };

  const handleCopyLocation = () => {
    const payload = `🚨 EMERGENCY SOS — AlertMitra User Needs Immediate Medical/Police Assistance! Location: ${currentCoords.address} (GPS: ${currentCoords.lat}, ${currentCoords.lng}) https://maps.google.com/?q=${currentCoords.lat},${currentCoords.lng}`;
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="safety-center-container">
      {/* 1-Tap SOS Hero Card */}
      <div className="sos-hero-card">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.2)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            <AlertOctagon size={14} />
            ALL-INDIA EMERGENCY HANDOFF (ERSS 112)
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '0.5rem', color: '#ffffff' }}>
            Emergency Response & SOS
          </h1>
          <p style={{ fontSize: '0.95rem', opacity: 0.9, maxWidth: '520px' }}>
            Instant direct dispatch to Police, Fire, Ambulance 108, and local registered Trystander Golden-Hour First Responders.
          </p>
        </div>

        <button className="sos-btn-large" onClick={handleSosClick}>
          <PhoneCall size={26} />
          <span>CALL 112</span>
        </button>
      </div>

      {/* SOS Activated Modal / Banner */}
      {sosTriggered && (
        <div style={{ background: '#fef2f2', border: '2px solid #ef4444', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', animation: 'pulse-border 1s infinite' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b91c1c', fontWeight: 800, fontSize: '1.2rem' }}>
              <HeartPulse size={24} />
              <span>112 EMERGENCY DISPATCH SIGNAL INITIATED</span>
            </div>
            <button
              onClick={() => setSosTriggered(false)}
              style={{ background: '#fff', border: '1px solid #fca5a5', color: '#991b1b', padding: '0.3rem 0.8rem', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
            >
              Dismiss
            </button>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#7f1d1d', marginBottom: '1rem' }}>
            Transmitting exact GPS telemetry to Nagpur Police Control Room & nearest 108 Ambulance Unit.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleCopyLocation}
              style={{ padding: '0.6rem 1rem', background: '#b91c1c', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
            >
              <Share2 size={16} />
              {copied ? 'Copied SOS Location Link!' : 'Share Live SOS Link'}
            </button>
          </div>
        </div>
      )}

      {/* Current Geo-location Telemetry */}
      <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '42px', height: '42px', background: '#f0f9ff', color: '#0284c7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              CURRENT TRAVELER TELEMETRY
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
              {currentCoords.address}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              GPS: {currentCoords.lat}° N, {currentCoords.lng}° E • Accuracy: ±3m
            </div>
          </div>
        </div>

        <button
          onClick={handleCopyLocation}
          style={{ padding: '0.5rem 0.9rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}
        >
          <Share2 size={14} />
          {copied ? 'Copied!' : 'Copy Telemetry'}
        </button>
      </div>

      {/* Trystander Golden-Hour Network (CSIR-CRRI & RoadMarc Foundation) */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
              8 Trystander Golden-Hour Kiosks (Nagpur)
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Community Disaster Management Centers established at high-risk Blackspots under Project iRASTE.
            </p>
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, background: '#cffafe', color: '#0e7490', padding: '0.3rem 0.75rem', borderRadius: '20px' }}>
            36 Lives Saved To Date
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1rem' }}>
          {TRYSTANDER_CELLS.map(cell => (
            <div key={cell.id} style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0891b2', background: '#ecfeff', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                  {cell.blackspotId} • RADMC CELL
                </span>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#10b981' }}>
                  ✓ {cell.victimsHelped} Lives Saved
                </span>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{cell.name}</h3>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <b>Trained Samaritans:</b> {cell.selectedSamaritansCount} local shopkeepers & garage mechanics
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <b>Key Equipment:</b> {cell.equipment.slice(0, 2).join(', ')}
              </div>

              {/* Lead Samaritan phone contacts */}
              <div style={{ marginTop: '0.35rem', background: '#f8fafc', padding: '0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  LEAD GOOD SAMARITAN EMERGENCY CONTACTS:
                </div>
                {cell.leadSamaritans.slice(0, 2).map((sam, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', marginBottom: '0.35rem', flexWrap: 'wrap', gap: '0.25rem' }}>
                    <span>{sam.name} ({sam.role.split('/')[0]})</span>
                    <a href={`tel:${sam.phone.replace(/[^0-9+]/g, '')}`} style={{ color: '#0284c7', fontWeight: 700, textDecoration: 'none', padding: '2px 6px', background: '#e0f2fe', borderRadius: '4px' }}>
                      {sam.phone}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Hospitals & Police Directory */}
      <div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
          Trauma Care Hospitals & Police Stations
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1rem' }}>
          {EMERGENCY_SERVICES.hospitals.map((hosp, i) => (
            <div key={i} style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1.1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <Hospital size={18} color="#ef4444" />
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#b91c1c', background: '#fee2e2', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                  {hosp.type}
                </span>
              </div>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
                {hosp.name}
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                {hosp.address}
              </p>
              <a
                href={`tel:${hosp.phone.replace(/[^0-9+]/g, '')}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#0284c7', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}
              >
                <PhoneCall size={14} />
                {hosp.phone}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
