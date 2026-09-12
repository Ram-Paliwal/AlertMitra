import React, { useState } from 'react';
import { Shield, Navigation, MapPin, Users, HeartHandshake, ShieldAlert, Award, LogIn, LogOut, User, CheckCircle2 } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  pendingReportsCount = 1,
  rewardsPoints = 450,
  currentUser = null,
  onLoginWithGoogle,
  onLogout
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <>
      {/* Desktop Header */}
      <header className="navbar">
        <div className="navbar-inner">
          <div className="brand-wrapper" onClick={() => setActiveTab('planner')}>
            <div className="brand-icon-shield">
              <Shield size={22} strokeWidth={2.5} />
            </div>
            <div className="brand-text-block">
              <div className="brand-name">
                Alert<span>Mitra</span>
              </div>
              <div className="brand-tagline-micro">
                Know the risk before you reach it
              </div>
            </div>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ul className="nav-links">
              <li>
                <button
                  className={`nav-item-btn ${activeTab === 'planner' || activeTab === 'analysis' ? 'active' : ''}`}
                  onClick={() => setActiveTab('planner')}
                >
                  <Navigation size={16} />
                  Plan Journey
                </button>
              </li>
              <li>
                <button
                  className={`nav-item-btn ${activeTab === 'live' ? 'active' : ''}`}
                  onClick={() => setActiveTab('live')}
                >
                  <MapPin size={16} />
                  Live Map
                </button>
              </li>
              <li>
                <button
                  className={`nav-item-btn ${activeTab === 'community' ? 'active' : ''}`}
                  onClick={() => setActiveTab('community')}
                >
                  <Users size={16} />
                  Community
                </button>
              </li>
              <li>
                <button
                  className={`nav-item-btn ${activeTab === 'safety' ? 'active' : ''}`}
                  onClick={() => setActiveTab('safety')}
                >
                  <HeartHandshake size={16} />
                  Safety Center
                </button>
              </li>
              <li>
                <button
                  className={`nav-item-btn ${activeTab === 'admin' ? 'active' : ''}`}
                  onClick={() => setActiveTab('admin')}
                >
                  <ShieldAlert size={16} />
                  Admin
                  {pendingReportsCount > 0 && (
                    <span className="nav-badge-pill">{pendingReportsCount}</span>
                  )}
                </button>
              </li>
              <li>
                <button
                  className={`nav-item-btn ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <Award size={16} />
                  Rewards ({rewardsPoints} pts)
                </button>
              </li>
            </ul>

            {/* Google Authentication Button / User Profile Pill */}
            <div style={{ position: 'relative', marginLeft: '0.5rem' }}>
              {currentUser ? (
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: 'var(--bg-surface-subtle)',
                      border: '1px solid var(--border-subtle)',
                      padding: '0.3rem 0.75rem 0.3rem 0.4rem',
                      borderRadius: '30px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <img
                      src={currentUser.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                      alt={currentUser.displayName}
                      style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {currentUser.displayName?.split(' ')[0] || 'Citizen'}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 600 }}>
                        ● Online
                      </div>
                    </div>
                  </button>

                  {/* Profile Dropdown Menu */}
                  {showProfileMenu && (
                    <div
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: '120%',
                        background: '#ffffff',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                        padding: '0.75rem',
                        width: '220px',
                        zIndex: 1100
                      }}
                    >
                      <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9', marginBottom: '0.5rem' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{currentUser.displayName}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.email}</div>
                        <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 700, marginTop: '0.25rem' }}>
                          🏆 {rewardsPoints} Safety Points
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('profile');
                          setShowProfileMenu(false);
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.4rem 0.5rem',
                          background: 'none',
                          border: 'none',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          borderRadius: '6px'
                        }}
                      >
                        <User size={14} /> My Profile & Badges
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onLogout();
                          setShowProfileMenu(false);
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.4rem 0.5rem',
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          borderRadius: '6px',
                          marginTop: '0.25rem'
                        }}
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Google Sign In Button */
                <button
                  type="button"
                  onClick={onLoginWithGoogle}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    padding: '0.4rem 0.65rem',
                    borderRadius: '24px',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#1e293b',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                    minHeight: '34px'
                  }}
                  title="Sign in with Google"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="mobile-nav-bar">
        <button
          className={`mobile-nav-item ${activeTab === 'planner' || activeTab === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('planner')}
        >
          <Navigation size={18} />
          <span>Home</span>
        </button>
        <button
          className={`mobile-nav-item ${activeTab === 'live' ? 'active' : ''}`}
          onClick={() => setActiveTab('live')}
        >
          <MapPin size={18} />
          <span>Live HUD</span>
        </button>
        <button
          className={`mobile-nav-item ${activeTab === 'community' ? 'active' : ''}`}
          onClick={() => setActiveTab('community')}
        >
          <Users size={18} />
          <span>Community</span>
        </button>
        <button
          className={`mobile-nav-item ${activeTab === 'safety' ? 'active' : ''}`}
          onClick={() => setActiveTab('safety')}
        >
          <HeartHandshake size={18} />
          <span>Safety</span>
        </button>
        <button
          className={`mobile-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <Award size={18} />
          <span>Rewards</span>
        </button>
      </div>
    </>
  );
}
