// ─── FerMat — Splash / Landing View ──────────────────────────────────────────
import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, DURATION, TOUCH_MIN } from '@data';
import { IconArrowRight } from '@components/icons';

export default function SplashView({ onStart }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#0B3D4A',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Subtle gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 30% 20%, rgba(78,205,196,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(231,111,81,0.08) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      {/* Content card */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center',
        padding: `${SPACING.xxl + 8}px ${SPACING.xxl}px ${SPACING.xxl}px`,
        maxWidth: 400, width: '90%',
        animation: 'fadeInUp 0.5s ease-out',
      }}>
        {/* Logo */}
        <div style={{
          width: 88, height: 88, borderRadius: 22,
          overflow: 'hidden', marginBottom: SPACING.xl,
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        }}>
          <img
            src={import.meta.env.BASE_URL + 'favicon.svg'}
            alt="FerMat"
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        </div>

        {/* App name */}
        <div style={{
          fontSize: '2.2rem', fontWeight: FONT_WEIGHT.extrabold,
          color: '#FFFFFF', letterSpacing: '0.02em', lineHeight: 1,
          marginBottom: SPACING.sm,
        }}>
          FerMat
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: FONT_SIZE.sm, color: 'rgba(255,255,255,0.5)',
          fontWeight: FONT_WEIGHT.medium, letterSpacing: '0.04em',
          textTransform: 'uppercase', marginBottom: SPACING.xl,
        }}>
          Ferhenga Matematîkê ya Kurdî
        </div>

        {/* Divider */}
        <div style={{
          width: 40, height: 2, borderRadius: 1,
          background: 'rgba(255,255,255,0.15)', marginBottom: SPACING.xl,
        }} />

        {/* Stats row */}
        <div style={{
          display: 'flex', gap: SPACING.xxl, marginBottom: SPACING.xxl,
          animation: 'fadeInUp 0.5s ease-out 0.15s both',
        }}>
          {[
            { count: '201', label: 'Têgeh' },
            { count: '9',   label: 'Beş' },
            { count: '3',   label: 'Ziman' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '1.5rem', fontWeight: FONT_WEIGHT.bold,
                color: '#FFFFFF', lineHeight: 1,
              }}>
                {s.count}
              </div>
              <div style={{
                fontSize: FONT_SIZE.xs, color: 'rgba(255,255,255,0.4)',
                fontWeight: FONT_WEIGHT.medium, marginTop: 4,
              }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={onStart}
          style={{
            width: '100%', maxWidth: 280,
            padding: `${SPACING.md + 2}px ${SPACING.xl}px`,
            borderRadius: RADIUS.lg, border: 'none',
            background: '#E76F51', color: '#fff',
            fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold,
            cursor: 'pointer',
            boxShadow: '0 2px 12px rgba(231,111,81,0.3)',
            animation: 'fadeInUp 0.5s ease-out 0.25s both',
            transition: `transform ${DURATION.normal}, box-shadow ${DURATION.normal}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
            minHeight: TOUCH_MIN + 4,
            letterSpacing: '0.01em',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(231,111,81,0.35)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(231,111,81,0.3)'; }}
          aria-label="Dest pê bike"
        >
          Dest pê bike
          <IconArrowRight size={18} color="#fff" />
        </button>

        {/* Quote */}
        <div style={{
          fontSize: FONT_SIZE.xs, fontStyle: 'italic',
          color: 'rgba(255,255,255,0.3)', marginTop: SPACING.xl,
          lineHeight: 1.5, animation: 'fadeIn 0.8s ease-out 0.5s both',
        }}>
          "Matematîk bi her zimanî diaxive, bi kurdî jî."
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute', bottom: SPACING.lg,
        fontSize: FONT_SIZE.xs, color: 'rgba(255,255,255,0.25)',
        letterSpacing: '0.02em',
      }}>
        Prof. Dr. Yılmaz MUTLU
      </div>
    </div>
  );
}
