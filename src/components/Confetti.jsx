// ─── Ferhenga Matematîkê — Confetti Celebration Effect ───────────────────────
import { useEffect, useState } from 'react';

const COLORS = ['#E76F51', '#4ECDC4', '#F4D35E', '#2D6A4F', '#6366F1', '#F43F5E', '#22C55E', '#3B82F6'];

function randomBetween(a, b) { return Math.random() * (b - a) + a; }

function createParticle(id) {
  return {
    id,
    x: randomBetween(10, 90),
    y: -10,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: randomBetween(6, 12),
    rotation: randomBetween(0, 360),
    velocityX: randomBetween(-2, 2),
    velocityY: randomBetween(2, 5),
    rotationSpeed: randomBetween(-8, 8),
    shape: Math.random() > 0.5 ? 'circle' : 'rect',
    delay: randomBetween(0, 600),
  };
}

export function Confetti({ active, duration = 2500 }) {
  const [particles, setParticles] = useState([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) return;
    const newParticles = Array.from({ length: 40 }, (_, i) => createParticle(i));
    setParticles(newParticles);
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [active, duration]);

  if (!visible || !particles.length) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      pointerEvents: 'none', overflow: 'hidden',
    }}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: p.x + '%',
            top: '-2%',
            width: p.size,
            height: p.shape === 'circle' ? p.size : p.size * 0.6,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
            background: p.color,
            animation: `confettiFall ${randomBetween(1.5, 2.5)}s ease-in forwards`,
            animationDelay: p.delay + 'ms',
            transform: `rotate(${p.rotation}deg)`,
            opacity: 0,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0% { opacity: 1; transform: translateY(0) rotate(0deg); }
          100% { opacity: 0; transform: translateY(100vh) rotate(720deg); }
        }
      `}</style>
    </div>
  );
}

// ── Achievement Popup ────────────────────────────────────────────────────────
export function AchievementPopup({ achievement, onClose }) {
  if (!achievement) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.4)',
      animation: 'fadeIn 0.2s ease-out',
      pointerEvents: 'auto',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'linear-gradient(135deg, #0F4C5C 0%, #1A6B7F 60%, #E76F51 100%)',
        borderRadius: 24,
        padding: '32px 28px',
        textAlign: 'center',
        maxWidth: 320,
        width: '90%',
        animation: 'bounceIn 0.4s ease-out',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>{achievement.icon}</div>
        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
          Destkeftiyeke Nû!
        </div>
        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>
          {achievement.title}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', marginBottom: 20, lineHeight: 1.4 }}>
          {achievement.desc}
        </div>
        <button
          onClick={onClose}
          style={{
            padding: '12px 32px',
            borderRadius: 9999,
            border: 'none',
            background: 'rgba(255,255,255,0.2)',
            color: '#fff',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
          }}
        >
          Baş e!
        </button>
      </div>
    </div>
  );
}

// ── XP Gain Toast ────────────────────────────────────────────────────────────
export function XPToast({ xp, visible }) {
  if (!visible || !xp) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 70, right: 16,
      zIndex: 9997,
      background: 'linear-gradient(135deg, #059669, #10B981)',
      color: '#fff',
      padding: '8px 18px',
      borderRadius: 9999,
      fontSize: '0.85rem',
      fontWeight: 800,
      boxShadow: '0 4px 16px rgba(16,185,129,0.4)',
      animation: 'fadeInUp 0.3s ease-out, fadeIn 0.3s ease-out reverse 2s forwards',
      pointerEvents: 'none',
    }}>
      +{xp} XP
    </div>
  );
}
