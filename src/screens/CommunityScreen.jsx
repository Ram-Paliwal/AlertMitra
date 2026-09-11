import React, { useState } from 'react';
import { Plus, Filter, AlertTriangle, CheckCircle, ThumbsUp, ThumbsDown, HelpCircle, Eye, Camera, Clock, Navigation } from 'lucide-react';
import { processUserConfirmation } from '../engine/confidenceEngine';

const CATEGORY_FILTERS = ['All', 'Potholes', 'Accidents', 'Roadblocks', 'Waterlogging', 'Debris', 'Poor visibility'];

export default function CommunityScreen({
  hazards = [],
  onUpdateHazard,
  onOpenReportModal,
  onSelectHazard
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [userVotedMap, setUserVotedMap] = useState({});

  const filteredHazards = hazards.filter(h => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Potholes') return h.category === 'Potholes' || h.type === 'Pothole';
    if (selectedCategory === 'Accidents') return h.category === 'Accidents' || h.type === 'Accident';
    if (selectedCategory === 'Roadblocks') return h.category === 'Roadblocks' || h.type === 'Road blocked';
    if (selectedCategory === 'Waterlogging') return h.category === 'Waterlogging' || h.type === 'Waterlogging';
    if (selectedCategory === 'Debris') return h.category === 'Debris' || h.type === 'Debris';
    if (selectedCategory === 'Poor visibility') return h.category === 'Poor visibility' || h.type === 'Poor visibility';
    return true;
  });

  const handleVote = (hazard, actionType) => {
    if (userVotedMap[hazard.id]) {
      alert('You have already submitted a confirmation for this report.');
      return;
    }

    const result = processUserConfirmation(hazard, actionType, 'current-user');
    if (result.success) {
      onUpdateHazard(result.hazard);
      setUserVotedMap(prev => ({ ...prev, [hazard.id]: actionType }));
    }
  };

  return (
    <div className="community-container">
      {/* Header */}
      <div className="community-header">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
            Community Safety Intelligence
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Crowdsourced road hazard confirmations with Bayesian confidence & time-decay validation.
          </p>
        </div>

        <button
          className="analyze-journey-btn"
          style={{ width: 'auto', padding: '0.65rem 1.25rem', fontSize: '0.95rem' }}
          onClick={onOpenReportModal}
        >
          <Plus size={18} />
          <span>Report New Hazard</span>
        </button>
      </div>

      {/* Filter Pills */}
      <div className="filter-pills-row" style={{ marginBottom: '1.75rem' }}>
        {CATEGORY_FILTERS.map(cat => (
          <button
            key={cat}
            className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Hazard Cards Grid */}
      <div className="hazards-grid">
        {filteredHazards.map(item => {
          const hasVoted = userVotedMap[item.id] || (item.confirmedUserIds && item.confirmedUserIds.includes('current-user'));
          const isExpired = item.verificationStatus === 'EXPIRED';

          return (
            <div key={item.id} className="hazard-card" style={{ opacity: isExpired ? 0.6 : 1 }}>
              {/* Photo Box */}
              {item.hasPhoto && item.photoUrl ? (
                <div className="hazard-card-img-box">
                  <img src={item.photoUrl} alt={item.title} className="hazard-card-img" />
                  <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Camera size={12} />
                    Verified Photo
                  </div>
                </div>
              ) : null}

              <div className="hazard-card-body">
                {/* Status & Confidence Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    className={`hazard-status-pill ${
                      item.verificationStatus === 'VERIFIED'
                        ? 'status-verified'
                        : item.verificationStatus === 'COMMUNITY CORROBORATED'
                        ? 'status-corroborated'
                        : item.verificationStatus === 'EXPIRED'
                        ? 'status-expired'
                        : 'status-unverified'
                    }`}
                  >
                    {item.verificationStatus}
                  </span>

                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0284c7' }}>
                    {item.confidence}% Confidence
                  </div>
                </div>

                <h3 style={{ fontSize: '1.12rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>
                  {item.title}
                </h3>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Navigation size={13} />
                  <span>{item.locationName}</span>
                </div>

                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  {item.description}
                </p>

                {/* Explanation text */}
                <div style={{ fontSize: '0.78rem', color: '#64748b', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  {item.confidence}% confidence based on evidence and {item.confirmationsCount} independent confirmation{item.confirmationsCount > 1 ? 's' : ''}.
                </div>

                {/* Is This Hazard Still Present? Action Row */}
                {!isExpired && (
                  <div className="corroboration-vote-box">
                    <div className="vote-title">Is this hazard still present?</div>
                    <div className="vote-buttons-row">
                      <button
                        className={`vote-btn confirm ${hasVoted === 'CONFIRM' ? 'voted' : ''}`}
                        onClick={() => handleVote(item, 'CONFIRM')}
                        disabled={hasVoted}
                      >
                        <ThumbsUp size={12} style={{ display: 'inline', marginRight: 4 }} />
                        CONFIRM ({item.confirmationsCount || 0})
                      </button>
                      <button
                        className={`vote-btn not-present ${hasVoted === 'NOT_PRESENT' ? 'voted' : ''}`}
                        onClick={() => handleVote(item, 'NOT_PRESENT')}
                        disabled={hasVoted}
                      >
                        <ThumbsDown size={12} style={{ display: 'inline', marginRight: 4 }} />
                        NOT PRESENT ({item.notPresentCount || 0})
                      </button>
                      <button
                        className="vote-btn unsure"
                        onClick={() => handleVote(item, 'UNSURE')}
                        disabled={hasVoted}
                      >
                        <HelpCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
                        UNSURE
                      </button>
                    </div>
                  </div>
                )}

                {/* View Details Button */}
                <button
                  onClick={() => onSelectHazard(item)}
                  style={{
                    width: '100%',
                    padding: '0.55rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    marginTop: '0.25rem'
                  }}
                >
                  View Full Detail & Advice
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
