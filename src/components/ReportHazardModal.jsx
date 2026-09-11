import React, { useState } from 'react';
import { X, Camera, MapPin, AlertTriangle, CheckCircle, Upload, Shield } from 'lucide-react';

const HAZARD_CATEGORIES = [
  { id: 'Accident', label: 'Accident', icon: '🚨' },
  { id: 'Pothole', label: 'Pothole', icon: '🕳️' },
  { id: 'Road blocked', label: 'Road blocked', icon: '🚧' },
  { id: 'Waterlogging', label: 'Waterlogging', icon: '🌊' },
  { id: 'Fallen tree', label: 'Fallen tree', icon: '🌳' },
  { id: 'Debris', label: 'Debris / Gravel', icon: '🧱' },
  { id: 'Poor visibility', label: 'Poor visibility', icon: '🌫️' },
  { id: 'Other', label: 'Other Hazard', icon: '⚠️' }
];

export default function ReportHazardModal({ isOpen, onClose, onSubmitReport }) {
  const [category, setCategory] = useState('Pothole');
  const [title, setTitle] = useState('');
  const [locationName, setLocationName] = useState('Wardha Road, Near Chhatrapati Square, Nagpur');
  const [lat, setLat] = useState(21.1125);
  const [lng, setLng] = useState(79.0712);
  const [description, setDescription] = useState('');
  const [photoPreview, setPhotoPreview] = useState('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80');
  const [hasPhoto, setHasPhoto] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleCaptureGPS = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setLat(parseFloat(pos.coords.latitude.toFixed(5)));
          setLng(parseFloat(pos.coords.longitude.toFixed(5)));
          setLocationName(`Current GPS (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
          setIsLocating(false);
        },
        err => {
          console.warn('Geolocation fallback used:', err);
          // Demo fallback around Nagpur
          setLat(21.1467);
          setLng(79.0833);
          setLocationName('Nagpur Zero Mile (Simulated GPS)');
          setIsLocating(false);
        },
        { timeout: 5000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newReport = {
      id: `HAZ-${Date.now().toString().slice(-4)}`,
      type: category,
      title: title || `${category} on ${locationName.split(',')[0]}`,
      locationName: locationName || 'Nagpur Corridor',
      lat: lat,
      lng: lng,
      radius: category === 'Poor visibility' ? 800 : 200,
      description: description || `Reported ${category} observed by commuter.`,
      category: category === 'Pothole' ? 'Potholes' : category === 'Accident' ? 'Accidents' : category,
      severity: category === 'Accident' || category === 'Road blocked' ? 'High' : 'Moderate',
      confidence: hasPhoto ? 62 : 45, // Starts with initial baseline confidence
      verificationStatus: 'UNVERIFIED', // STRICT REQUIREMENT: Initial status is UNVERIFIED
      sourceType: 'Community User',
      reporterName: 'You (Traveler Report)',
      reporterTrustScore: 75,
      photoUrl: hasPhoto ? photoPreview : '',
      hasPhoto: hasPhoto,
      confirmationsCount: 1,
      notPresentCount: 0,
      unsureCount: 0,
      confirmedUserIds: ['current-user'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      travelerAdvice: 'Reduce speed and proceed with heightened caution in this section.'
    };

    onSubmitReport(newReport);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1600);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ width: '60px', height: '60px', background: '#dcfce7', color: '#15803d', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <CheckCircle size={32} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Report Submitted!</h3>
            <div style={{ background: '#fef3c7', color: '#b45309', padding: '0.85rem', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600, border: '1px solid #fde68a' }}>
              Status: <strong>UNVERIFIED</strong><br />
              "Your report is currently unverified. Other travelers can confirm whether the hazard is still present."
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <AlertTriangle size={20} color="#0284c7" />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>Report Road Hazard</h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Help other travelers know the risk before they reach it.
            </p>

            {/* 1. Category Selection */}
            <div style={{ marginBottom: '1.1rem' }}>
              <label className="input-label" style={{ marginBottom: '0.45rem' }}>
                1. Select Hazard Type
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.45rem' }}>
                {HAZARD_CATEGORIES.map(cat => (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    style={{
                      padding: '0.55rem 0.35rem',
                      borderRadius: '8px',
                      border: category === cat.id ? '2px solid #0284c7' : '1px solid #e2e8f0',
                      background: category === cat.id ? '#f0f9ff' : '#ffffff',
                      color: category === cat.id ? '#0284c7' : 'var(--text-primary)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.2rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. GPS Location */}
            <div style={{ marginBottom: '1.1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label className="input-label">2. Location (GPS)</label>
                <button
                  type="button"
                  onClick={handleCaptureGPS}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0284c7',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <MapPin size={12} />
                  {isLocating ? 'Acquiring GPS...' : 'Auto-Capture Current GPS'}
                </button>
              </div>
              <input
                type="text"
                className="custom-input"
                value={locationName}
                onChange={e => setLocationName(e.target.value)}
                placeholder="e.g. Wardha Road near Chhatrapati Square"
                required
              />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Lat: {lat}</span>
                <span>Lng: {lng}</span>
                <span style={{ marginLeft: 'auto', color: '#10b981' }}>✓ High Accuracy Geotagged</span>
              </div>
            </div>

            {/* 3. Optional Photo Evidence */}
            <div style={{ marginBottom: '1.1rem' }}>
              <label className="input-label" style={{ marginBottom: '0.35rem' }}>
                3. Photo Evidence (Optional)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {hasPhoto && photoPreview ? (
                  <div style={{ position: 'relative', width: '80px', height: '60px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                    <img src={photoPreview} alt="Hazard preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => setHasPhoto(false)}
                      style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', cursor: 'pointer' }}
                    >
                      ×
                    </button>
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    setHasPhoto(true);
                    setPhotoPreview('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80');
                  }}
                  style={{
                    padding: '0.5rem 0.85rem',
                    borderRadius: '6px',
                    border: '1px dashed #94a3b8',
                    background: '#f8fafc',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Camera size={14} />
                  {hasPhoto ? 'Photo Attached (Click to switch)' : 'Attach / Capture Photo'}
                </button>
              </div>
            </div>

            {/* 4. Description */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="input-label" style={{ marginBottom: '0.35rem' }}>
                4. Description & Lane Details
              </label>
              <textarea
                className="custom-input"
                style={{ height: '75px', resize: 'vertical' }}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g. Deep pothole on the left lane near the signal, obscured by water..."
                required
              />
            </div>

            {/* Educational Disclaimer */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.4 }}>
              <strong>Note on Verification:</strong> New reports begin with <em>UNVERIFIED</em> status and will be corroborated by fellow travelers before authoritative admin review.
            </div>

            {/* 5. Submit */}
            <button
              type="submit"
              className="analyze-journey-btn"
              style={{ padding: '0.85rem' }}
            >
              <Upload size={18} />
              Submit Hazard Report
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
