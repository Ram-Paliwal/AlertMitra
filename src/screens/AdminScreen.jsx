import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, XCircle, Search, HelpCircle, Camera, MapPin, Clock, Eye, RefreshCw, AlertTriangle } from 'lucide-react';
import RiskMap from '../components/RiskMap';

export default function AdminScreen({
  hazards = [],
  blackspots = [],
  greyspots = [],
  trystanderCells = [],
  onVerifyHazard,
  onRejectHazard,
  onInvestigateHazard,
  onSelectHazard
}) {
  const [selectedReport, setSelectedReport] = useState(null);
  const [adminNote, setAdminNote] = useState('');

  const activeHazards = hazards.filter(h => h.verificationStatus !== 'EXPIRED' && h.verificationStatus !== 'REJECTED');
  const pendingReports = hazards.filter(h => h.verificationStatus === 'UNVERIFIED' || h.verificationStatus === 'COMMUNITY CORROBORATED');
  const verifiedCount = hazards.filter(h => h.verificationStatus === 'VERIFIED').length;
  const expiredCount = hazards.filter(h => h.verificationStatus === 'EXPIRED').length;

  const handleVerify = (id) => {
    onVerifyHazard(id, adminNote || 'Authoritatively verified by Traffic Authority Officer.');
    setSelectedReport(null);
    setAdminNote('');
  };

  const handleReject = (id) => {
    onRejectHazard(id, adminNote || 'Rejected: Inspection showed hazard cleared or duplicate.');
    setSelectedReport(null);
    setAdminNote('');
  };

  const handleInvestigate = (id) => {
    onInvestigateHazard(id, adminNote || 'Flagged for ground field officer inspection.');
    setSelectedReport(null);
    setAdminNote('');
  };

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header-row">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#b91c1c', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            <ShieldAlert size={14} />
            AUTHORITATIVE ROAD SAFETY VERIFICATION CONSOLE
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
            AlertMitra Safety Command Center
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803d', background: '#dcfce7', padding: '0.4rem 0.8rem', borderRadius: '6px' }}>
            ● Live Sync to Traveler Risk Engine
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="value" style={{ color: '#0284c7' }}>{activeHazards.length}</div>
          <div className="label">Active Hazards</div>
        </div>
        <div className="admin-stat-card">
          <div className="value" style={{ color: '#d97706' }}>{pendingReports.length}</div>
          <div className="label">Pending Verification Queue</div>
        </div>
        <div className="admin-stat-card">
          <div className="value" style={{ color: '#10b981' }}>{verifiedCount}</div>
          <div className="label">Verified Authoritative</div>
        </div>
        <div className="admin-stat-card">
          <div className="value" style={{ color: '#64748b' }}>{expiredCount}</div>
          <div className="label">Expired Stale Reports</div>
        </div>
      </div>

      {/* Verification Queue Table */}
      <div className="queue-table-container" style={{ marginBottom: '2.5rem' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
            Verification Queue ({pendingReports.length} reports awaiting review)
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Swipe table horizontally on mobile to view all columns
          </span>
        </div>

        <div className="queue-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Report / Hazard</th>
                <th>Location</th>
                <th>Confidence</th>
                <th>Confirmations</th>
                <th>Status</th>
                <th>Evidence</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingReports.map(report => (
                <tr key={report.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedReport(report)}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{report.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {report.id} • {report.type}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{report.locationName}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 800, color: '#0284c7' }}>{report.confidence}%</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                      <span style={{ color: '#15803d' }}>+{report.confirmationsCount || 0}</span> / <span style={{ color: '#b91c1c' }}>-{report.notPresentCount || 0}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`hazard-status-pill ${
                        report.verificationStatus === 'COMMUNITY CORROBORATED' ? 'status-corroborated' : 'status-unverified'
                      }`}
                    >
                      {report.verificationStatus}
                    </span>
                  </td>
                  <td>
                    {report.hasPhoto ? (
                      <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Camera size={13} /> Photo
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Text Only</span>
                    )}
                  </td>
                  <td>
                    <div className="admin-action-btn-group" onClick={e => e.stopPropagation()}>
                      <button
                        className="admin-btn admin-btn-verify"
                        onClick={() => handleVerify(report.id)}
                        title="Verify and publish authoritative warning"
                      >
                        VERIFY
                      </button>
                      <button
                        className="admin-btn admin-btn-reject"
                        onClick={() => handleReject(report.id)}
                        title="Reject report"
                      >
                        REJECT
                      </button>
                      <button
                        className="admin-btn admin-btn-investigate"
                        onClick={() => handleInvestigate(report.id)}
                        title="Request field inspection"
                      >
                        INVESTIGATE
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Report Detail Modal */}
      {selectedReport && (
        <div className="modal-backdrop" onClick={() => setSelectedReport(null)}>
          <div className="modal-content" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  ADMIN AUDIT CONSOLE • {selectedReport.id}
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem' }}>
                  {selectedReport.title}
                </h2>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedReport(null)}>
                ×
              </button>
            </div>

            {selectedReport.hasPhoto && selectedReport.photoUrl && (
              <div style={{ width: '100%', height: '220px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.25rem', border: '1px solid #cbd5e1' }}>
                <img src={selectedReport.photoUrl} alt="Submitted evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>REPORTER DETAILS</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{selectedReport.reporterName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Trust Score: {selectedReport.reporterTrustScore || 75}/100</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>CONFIRMATION RATIO</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#15803d' }}>
                  {selectedReport.confirmationsCount} Positive • {selectedReport.notPresentCount} Contradictions
                </div>
                <div style={{ fontSize: '0.75rem', color: '#0284c7' }}>Confidence Score: {selectedReport.confidence}%</div>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Report Description:
              </label>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', marginTop: '0.25rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                {selectedReport.description}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Admin Decision Notes / Dispatch Reference:
              </label>
              <input
                type="text"
                className="custom-input"
                style={{ marginTop: '0.25rem' }}
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                placeholder="e.g. Verified via CCTV. Road maintenance team dispatched."
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="admin-btn admin-btn-verify"
                style={{ flex: 1, padding: '0.85rem', fontSize: '0.9rem' }}
                onClick={() => handleVerify(selectedReport.id)}
              >
                <CheckCircle size={16} style={{ display: 'inline', marginRight: 4 }} />
                AUTHORITATIVE VERIFY
              </button>
              <button
                className="admin-btn admin-btn-reject"
                style={{ flex: 1, padding: '0.85rem', fontSize: '0.9rem' }}
                onClick={() => handleReject(selectedReport.id)}
              >
                <XCircle size={16} style={{ display: 'inline', marginRight: 4 }} />
                REJECT & ARCHIVE
              </button>
              <button
                className="admin-btn admin-btn-investigate"
                style={{ flex: 1, padding: '0.85rem', fontSize: '0.9rem' }}
                onClick={() => handleInvestigate(selectedReport.id)}
              >
                <HelpCircle size={16} style={{ display: 'inline', marginRight: 4 }} />
                INVESTIGATE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Map of All Safety Points */}
      <div style={{ height: '420px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-md)' }}>
        <RiskMap
          blackspots={blackspots}
          greyspots={greyspots}
          hazards={hazards}
          trystanderCells={trystanderCells}
          onSelectHazard={onSelectHazard}
        />
      </div>
    </div>
  );
}
