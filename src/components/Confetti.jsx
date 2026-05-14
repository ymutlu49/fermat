// ─── FerMat — Confetti Celebration Effect ───────────────────────
import { useEffect, useState } from 'react';

// Logo palette anchors + a few festive accents (gold, deeper red) that still
// sit in the same warm/earth family as the brand. No off-palette blues/aquas.
const COLORS = [
  '#0D9488', // logo teal
  '#EA580C', // logo coral
  '#15803D', // logo green
  '#0F4C5C', // logo dark teal
  '#FCD34D', // gold (festive)
  '#F59E0B', // amber (festive)
  '#0F766E', // deeper teal
  '#C2410C', // deeper coral
];

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
// Same gradient grammar as HomeView Hero: logo dark teal → mid teal → coral.
export function AchievementPopup({ achievement, onClose }) {
  if (!achievement) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.45)',
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      animation: 'fadeIn 0.2s ease-out',
      pointerEvents: 'auto',
      padding: 20,
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Destkeftiyeke nû"
        style={{
          position: 'relative',
          background: 'linear-gradient(135deg, #0F4C5C 0%, #1A6B7F 55%, #EA580C 130%)',
          borderRadius: 24,
          padding: '32px 28px',
          textAlign: 'center',
          maxWidth: 340,
          width: '100%',
          animation: 'bounceIn 0.4s ease-out',
          boxShadow: '0 20px 60px rgba(15,76,92,0.45), 0 6px 16px rgba(234,88,12,0.20)',
          overflow: 'hidden',
        }}
      >
        {/* Decorative blob (same pattern as HomeView Hero) */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: -50, right: -50,
          width: 160, height: 160, borderRadius: '50%',
          background: 'rgba(255,255,255,0.10)',
          pointerEvents: 'none',
        }} />
        <div aria-hidden="true" style={{
          position: 'absolute', bottom: -40, left: -30,
          width: 110, height: 110, borderRadius: '50%',
          background: 'rgba(252,211,77,0.12)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', fontSize: 56, marginBottom: 12, lineHeight: 1 }}>
          {achievement.icon}
        </div>
        <div style={{
          position: 'relative',
          fontSize: '0.7rem', color: 'rgba(255,255,255,0.78)',
          fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6,
        }}>
          ✨ Destkeftiyeke Nû!
        </div>
        <div style={{
          position: 'relative',
          fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: 8,
          letterSpacing: '-0.01em',
        }}>
          {achievement.title}
        </div>
        <div style={{
          position: 'relative',
          fontSize: '0.88rem', color: 'rgba(255,255,255,0.85)',
          marginBottom: 22, lineHeight: 1.5, fontWeight: 500,
        }}>
          {achievement.desc}
        </div>
        <button
          onClick={onClose}
          style={{
            position: 'relative',
            padding: '12px 32px',
            borderRadius: 9999,
            border: '1px solid rgba(255,255,255,0.25)',
            background: 'rgba(255,255,255,0.18)',
            color: '#fff',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            fontFamily: 'inherit',
            letterSpacing: '0.02em',
            transition: 'background 0.15s ease, transform 0.15s ease',
            WebkitTapHighlightColor: 'transparent',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.28)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          Baş e!
        </button>
      </div>
    </div>
  );
}

// ── XP Gain Toast — logo green→teal gradient ────────────────────────────────
export function XPToast({ xp, visible }) {
  if (!visible || !xp) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 70, right: 16,
        zIndex: 9997,
        background: 'linear-gradient(135deg, #15803D 0%, #0D9488 100%)',
        color: '#fff',
        padding: '8px 18px',
        borderRadius: 9999,
        fontSize: '0.85rem',
        fontWeight: 800,
        boxShadow: '0 6px 18px rgba(13,148,136,0.40), 0 1px 3px rgba(21,128,61,0.30)',
        animation: 'fadeInUp 0.3s ease-out, fadeIn 0.3s ease-out reverse 2s forwards',
        pointerEvents: 'none',
        letterSpacing: '0.02em',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        border: '1px solid rgba(255,255,255,0.15)',
      }}
    >
      <span aria-hidden="true" style={{ fontSize: '0.95em' }}>⚡</span>
      +{xp} XP
    </div>
  );
}
