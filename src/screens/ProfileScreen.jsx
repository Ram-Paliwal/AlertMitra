import React, { useState } from 'react';
import { Award, ShieldCheck, Zap, Activity, Star, Gift, CheckCircle, Sparkles, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ProfileScreen({ rewardsPoints = 450, onAddPoints, currentUser = null }) {
  const [claimedReward, setClaimedReward] = useState(null);

  const triggerRewardCelebration = (voucher) => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });
    setClaimedReward(voucher);
    setTimeout(() => setClaimedReward(null), 4000);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '1.5rem auto', padding: '0 clamp(1rem, 3vw, 1.5rem) 3rem', width: '100%' }}>
      {/* Profile Header Card */}
      <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: 'clamp(1.25rem, 3.5vw, 2rem)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '2rem', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {currentUser?.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt={currentUser.displayName}
              style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #0284c7', flexShrink: 0 }}
            />
          ) : (
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800, flexShrink: 0 }}>
              {currentUser?.displayName ? currentUser.displayName.slice(0, 2).toUpperCase() : 'AM'}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: 800, color: '#0f172a' }}>
                {currentUser?.displayName || 'Aniket Meshram'}
              </h1>
              <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.72rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '20px' }}>
                ✓ {currentUser ? 'Google Verified Citizen' : 'Safety Champion'}
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {currentUser?.email || 'Nagpur Commuter & Registered Good Samaritan • Verified ADAS Telemetry Tag'}
            </p>
          </div>
        </div>

        {/* 5th E Points Card */}
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '0.85rem 1.25rem', flex: '1 1 200px', textAlign: 'left' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>
            5th 'E' ENCOURAGEMENT REWARDS
          </div>
          <div style={{ fontSize: 'clamp(1.8rem, 4vw, 2.2rem)', fontWeight: 900, color: '#15803d', fontFamily: 'var(--font-heading)' }}>
            {rewardsPoints} <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>pts</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#166534' }}>
            RFID Signal Adherence & Safe Headway
          </div>
        </div>
      </div>

      {/* Claimed Toast */}
      {claimedReward && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#15803d', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
          <Sparkles size={20} />
          <span>Voucher Unlocked: {claimedReward}! Check your SMS for voucher code.</span>
        </div>
      )}

      {/* Vienna Psychological Test & ADAS Compliance Metrics (From iRASTE Report Chapter 6) */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
          Psychophysical & ADAS Safety Score
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Standardized under CSIR-CRRI Vienna Reaction Test & Mobileye ADAS telemetry benchmarks.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '1rem' }}>
          <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#0284c7' }}>
              <Activity size={18} />
              <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase' }}>Vienna Visual Reaction</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>184 ms</div>
            <div style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600 }}>Top 82% 'Very Good' Category</div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#7c3aed' }}>
              <ShieldCheck size={18} />
              <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase' }}>Defensive Headway</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>94% Score</div>
            <div style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600 }}>−23% Unsafe Headway Alerts</div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#f59e0b' }}>
              <TrendingUp size={18} />
              <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase' }}>Signal Compliance</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>100%</div>
            <div style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600 }}>+24% Positive Reinforcement</div>
          </div>
        </div>
      </div>

      {/* 5th E Encouragement — Partner Merchant Rewards */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
              5th 'E' TrafficRewards Vouchers
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Redeem safe driving reward points at 100+ partner establishments across Nagpur.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1rem' }}>
          {[
            { title: 'HPCL Fuel Voucher', discount: '₹150 OFF', cost: 200, icon: '⛽', merchant: 'HPCL Petrol Pump, Wardha Rd' },
            { title: 'Vehicle Safety & Brake Checkup', discount: 'FREE Inspection', cost: 150, icon: '🔧', merchant: 'Mahindra Service Center, MIDC' },
            { title: 'Helmet & Gear Discount', discount: '25% OFF', cost: 300, icon: '🪖', merchant: 'Nagpur Moto Safety Gear' }
          ].map((item, idx) => (
            <div key={idx} style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.6rem' }}>{item.icon}</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#15803d', background: '#dcfce7', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                    {item.discount}
                  </span>
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
                  {item.title}
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  {item.merchant}
                </p>
              </div>

              <button
                disabled={rewardsPoints < item.cost}
                onClick={() => triggerRewardCelebration(item.title)}
                style={{
                  padding: '0.6rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: rewardsPoints >= item.cost ? '#0284c7' : '#cbd5e1',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: rewardsPoints >= item.cost ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem'
                }}
              >
                <Gift size={14} />
                <span>Redeem for {item.cost} pts</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
