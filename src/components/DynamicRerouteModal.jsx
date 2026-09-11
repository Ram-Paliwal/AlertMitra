import React from 'react';
import { AlertCircle, ArrowRight, ShieldCheck, X } from 'lucide-react';

export default function DynamicRerouteModal({ isOpen, onClose, onAcceptReroute, currentHazard, alternativeRoute }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
          <span style={{ background: '#fef3c7', color: '#b45309', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <AlertCircle size={14} />
            DYNAMIC RISK ALERT ON ACTIVE ROUTE
          </span>
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          Safer Route Available
        </h3>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.45 }}>
          {currentHazard
            ? `A severe incident (${currentHazard.title || currentHazard.type}) was confirmed 2.4 km ahead on your current corridor.`
            : 'Adverse weather downpour detected ahead. A materially safer bypass route is available.'}
        </p>

        {/* Tradeoff comparison card */}
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            OPTIMIZED ALTERNATIVE TRADEOFF
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d', fontFamily: 'var(--font-heading)' }}>
              +8 min
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#15803d', background: '#dcfce7', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
              −31% Risk Exposure
            </div>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#166534', lineHeight: 1.4 }}>
            Via Outer Eastern Bypass: Diverts past unsegregated congestion and provides continuous median barrier protection.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '0.85rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            Keep Current Route
          </button>
          <button
            onClick={onAcceptReroute}
            style={{
              flex: 1.5,
              padding: '0.85rem',
              borderRadius: '8px',
              border: 'none',
              background: '#10b981',
              fontWeight: 700,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(16, 185, 129, 0.3)'
            }}
          >
            <ShieldCheck size={18} />
            SWITCH ROUTE
          </button>
        </div>
      </div>
    </div>
  );
}
