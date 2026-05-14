// ─── FerMat — Splash / Landing View ──────────────────────────────────────────
// Logo palette: teal #0D9488 · coral #EA580C · green #15803D · dark #0F4C5C
import { ALL_CONCEPTS, SECTIONS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, DURATION, TOUCH_MIN } from '@data';
import { IconArrowRight } from '@components/icons';
import { useInstallPrompt } from '@hooks';

export default function SplashView({ onStart }) {
  const conceptCount = ALL_CONCEPTS.length;
  const sectionCount = Object.keys(SECTIONS).length;
  const install = useInstallPrompt();
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      // Logo dark-teal anchor, matching HomeView Hero & GamesHub cards
      background: '#0F4C5C',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Layered gradient overlay — logo teal top-left, logo coral bottom-right */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        background:
          'radial-gradient(ellipse at 25% 15%, rgba(13,148,136,0.22) 0%, transparent 55%), ' +
          'radial-gradient(ellipse at 75% 85%, rgba(234,88,12,0.18) 0%, transparent 50%), ' +
          'radial-gradient(ellipse at 50% 50%, rgba(21,128,61,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      {/* Decorative blobs for depth */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: -60, right: -60,
        width: 220, height: 220, borderRadius: '50%',
        background: 'rgba(13,148,136,0.10)',
        filter: 'blur(2px)',
        pointerEvents: 'none',
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', bottom: -80, left: -40,
        width: 180, height: 180, borderRadius: '50%',
        background: 'rgba(234,88,12,0.08)',
        filter: 'blur(2px)',
        pointerEvents: 'none',
      }} />

      {/* Content card */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center',
        padding: `${SPACING.xxl + 8}px ${SPACING.xxl}px ${SPACING.xxl}px`,
        maxWidth: 420, width: '90%',
        animation: 'fadeInUp 0.5s ease-out',
      }}>
        {/* Logo with subtle glow ring */}
        <div style={{
          position: 'relative',
          marginBottom: SPACING.xl,
        }}>
          <div aria-hidden="true" style={{
            position: 'absolute', inset: -8,
            borderRadius: 30,
            background: 'linear-gradient(135deg, rgba(13,148,136,0.40), rgba(234,88,12,0.30))',
            filter: 'blur(12px)',
            opacity: 0.6,
          }} />
          <div style={{
            position: 'relative',
            width: 96, height: 96, borderRadius: 24,
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.30), inset 0 0 0 1px rgba(255,255,255,0.12)',
          }}>
            <img
              src={import.meta.env.BASE_URL + 'favicon.svg'}
              alt="FerMat"
              style={{ width: '100%', height: '100%', display: 'block' }}
            />
          </div>
        </div>

        {/* App name */}
        <div style={{
          fontSize: '2.4rem', fontWeight: FONT_WEIGHT.black,
          color: '#FFFFFF', letterSpacing: '-0.01em', lineHeight: 1,
          marginBottom: SPACING.xs + 2,
        }}>
          FerMat
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: FONT_SIZE.sm, color: 'rgba(255,255,255,0.55)',
          fontWeight: FONT_WEIGHT.medium, letterSpacing: '0.05em',
          textTransform: 'uppercase', marginBottom: SPACING.xl + 4,
        }}>
          Ferhenga Matematîkê ya Kurdî
        </div>

        {/* Stats — pill chips, each with its own logo tint */}
        <div style={{
          display: 'flex', gap: 10, marginBottom: SPACING.xxl,
          animation: 'fadeInUp 0.5s ease-out 0.15s both',
          flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {[
            { count: String(conceptCount), label: 'Têgeh', tint: 'rgba(13,148,136,0.22)', border: 'rgba(13,148,136,0.45)' },
            { count: String(sectionCount), label: 'Beş',   tint: 'rgba(21,128,61,0.22)',  border: 'rgba(21,128,61,0.45)' },
            { count: '3',                  label: 'Ziman', tint: 'rgba(234,88,12,0.22)',  border: 'rgba(234,88,12,0.45)' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '10px 14px',
              borderRadius: 14,
              background: s.tint,
              border: `1px solid ${s.border}`,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              minWidth: 76,
            }}>
              <div style={{
                fontSize: '1.5rem', fontWeight: FONT_WEIGHT.black,
                color: '#FFFFFF', lineHeight: 1,
              }}>
                {s.count}
              </div>
              <div style={{
                fontSize: '0.66rem', color: 'rgba(255,255,255,0.75)',
                fontWeight: FONT_WEIGHT.semibold, marginTop: 4,
                letterSpacing: '0.04em', textTransform: 'uppercase',
              }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button — logo coral */}
        <button
          onClick={onStart}
          style={{
            width: '100%', maxWidth: 280,
            padding: '14px 24px',
            borderRadius: 16, border: 'none',
            background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
            color: '#fff',
            fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.extrabold,
            cursor: 'pointer',
            boxShadow: '0 8px 22px rgba(234,88,12,0.35), 0 2px 6px rgba(234,88,12,0.20)',
            animation: 'fadeInUp 0.5s ease-out 0.25s both',
            transition: `transform ${DURATION.normal}, box-shadow ${DURATION.normal}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            minHeight: TOUCH_MIN + 4,
            letterSpacing: '0.01em',
            fontFamily: 'inherit',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(234,88,12,0.45), 0 3px 8px rgba(234,88,12,0.25)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 22px rgba(234,88,12,0.35), 0 2px 6px rgba(234,88,12,0.20)'; }}
          aria-label="Dest pê bike"
        >
          Dest pê bike
          <IconArrowRight size={18} color="#fff" />
        </button>

        {/* Install PWA — Android/desktop: native prompt; iOS: manual instructions */}
        {!install.isInstalled && (install.canPrompt || install.showIOSInstructions) && (
          <div style={{
            marginTop: SPACING.md,
            animation: 'fadeIn 0.5s ease-out 0.6s both',
            width: '100%', maxWidth: 280,
          }}>
            {install.canPrompt && (
              <button
                onClick={install.promptInstall}
                aria-label="Sepanê saz bike"
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: 14,
                  border: '1px solid rgba(255,255,255,0.22)',
                  background: 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  fontSize: FONT_SIZE.sm,
                  fontWeight: FONT_WEIGHT.semibold,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontFamily: 'inherit',
                  letterSpacing: '0.01em',
                  minHeight: TOUCH_MIN - 6,
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  transition: 'background 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.32)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'; }}
              >
                <span aria-hidden="true">📱</span>
                Sepanê li telefonê saz bike
              </button>
            )}
            {install.showIOSInstructions && (
              <div style={{
                padding: '10px 14px',
                borderRadius: 14,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.85)',
                fontSize: FONT_SIZE.xs,
                lineHeight: 1.5,
                textAlign: 'center',
              }}>
                <div style={{ fontWeight: FONT_WEIGHT.semibold, marginBottom: 4 }}>
                  📱 Bo sazkirina sepanê li iPhone'ê
                </div>
                <div style={{ color: 'rgba(255,255,255,0.65)' }}>
                  Safari'yê veke → bişkoja Pay <span aria-hidden="true">⎙</span> → <em>"Bo Ekrana Mal Zêde Bike"</em>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quote */}
        <div style={{
          fontSize: FONT_SIZE.xs, fontStyle: 'italic',
          color: 'rgba(255,255,255,0.40)', marginTop: SPACING.xl,
          lineHeight: 1.55, animation: 'fadeIn 0.8s ease-out 0.5s both',
          maxWidth: 280,
        }}>
          "Matematîk bi her zimanî diaxive, bi kurdî jî."
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute', bottom: SPACING.lg,
        fontSize: FONT_SIZE.xs, color: 'rgba(255,255,255,0.35)',
        letterSpacing: '0.02em',
        fontWeight: FONT_WEIGHT.medium,
      }}>
        Prof. Dr. Yılmaz MUTLU
      </div>
    </div>
  );
}
