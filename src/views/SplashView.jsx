import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, DURATION, TOUCH_MIN } from '@data';
import { IconArrowRight } from '@components/icons';

export default function SplashView({ onStart }) {
  const stats = [
    { count: '201', label: 'Têgeh' },
    { count: '9',   label: 'Beş' },
    { count: '3',   label: 'Ziman' },
  ];
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', textAlign: 'center',
      padding: `${SPACING.xl}px ${SPACING.xl - 4}px`,
      background: 'linear-gradient(135deg, #0F4C5C 0%, #1A6B7F 50%, #E76F51 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative circles */}
      {[
        { top: '-60px', right: '-60px', size: 200, opacity: 0.05 },
        { bottom: '-80px', left: '-80px', size: 260, opacity: 0.04 },
        { top: '20%', left: '10%', size: 100, opacity: 0.03 },
        { top: '60%', right: '15%', size: 140, opacity: 0.04 },
        { top: '10%', right: '30%', size: 60, opacity: 0.06 },
      ].map((c, i) => (
        <div key={i} style={{
          position: 'absolute', borderRadius: '50%',
          background: 'rgba(255,255,255,' + c.opacity + ')',
          width: c.size, height: c.size,
          top: c.top, bottom: c.bottom, left: c.left, right: c.right,
          animation: 'floatUpDown ' + (15 + i * 3) + 's ease-in-out infinite',
          animationDelay: (i * 0.8) + 's',
        }} />
      ))}
      {/* Kurdish math terms & child-friendly symbols */}
      {[
        { t: '🔢', x: 5,  y: 5,  r: -12, s: 2.0 },
        { t: 'HEJMAR',  x: 75, y: 3,  r: 8,   s: 0.85 },
        { t: '📐', x: 90, y: 12, r: -15, s: 1.8 },
        { t: 'SÊGOŞE',  x: 3,  y: 22, r: 10,  s: 0.8 },
        { t: '➕', x: 88, y: 28, r: 18,  s: 2.0 },
        { t: '🍕', x: 8,  y: 40, r: -8,  s: 1.9 },
        { t: 'GILOVER',  x: 82, y: 42, r: -6,  s: 0.8 },
        { t: '🧩', x: 92, y: 55, r: 12,  s: 1.7 },
        { t: 'KIRARÎ',  x: 2,  y: 58, r: -10, s: 0.8 },
        { t: '🎲', x: 6,  y: 75, r: 14,  s: 1.8 },
        { t: 'PÎVANDIN',x: 78, y: 72, r: -8,  s: 0.8 },
        { t: '⭐', x: 88, y: 85, r: 10,  s: 1.7 },
        { t: '🧮', x: 5,  y: 90, r: -12, s: 1.8 },
        { t: 'REQEM',   x: 55, y: 92, r: 6,   s: 0.8 },
      ].map((item, i) => {
        const isEmoji = /\p{Emoji}/u.test(item.t) && item.t.length <= 3;
        return (
          <span key={'bg' + i} style={{
            position: 'absolute',
            left: item.x + '%', top: item.y + '%',
            transform: `rotate(${item.r}deg)`,
            fontSize: item.s + 'rem',
            color: isEmoji ? undefined : 'rgba(255,255,255,0.08)',
            opacity: isEmoji ? 0.15 : 1,
            fontWeight: 900,
            userSelect: 'none', pointerEvents: 'none',
            whiteSpace: 'nowrap', letterSpacing: isEmoji ? 0 : '0.04em',
          }}>
            {item.t}
          </span>
        );
      })}

      {/* Logo */}
      <div style={{ animation: 'fadeInUp 0.6s ease-out', marginBottom: SPACING.lg, position: 'relative' }}>
        <div style={{
          width: 120, height: 120, borderRadius: '50%', margin: '0 auto',
          background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255,255,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <img
            src={import.meta.env.BASE_URL + 'favicon.svg'}
            alt="Ferhenga Matematîkê"
            style={{ width: 90, height: 90, borderRadius: 16 }}
          />
          {/* Spinning ring */}
          <svg width="140" height="140" viewBox="0 0 140 140" style={{
            position: 'absolute', top: -10, left: -10,
            animation: 'spin 8s linear infinite',
          }}>
            <circle cx="70" cy="70" r="65" fill="none" stroke="rgba(255,255,255,0.4)"
              strokeWidth="2" strokeDasharray="20 10" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      {/* Title */}
      <div style={{ animation: 'fadeInUp 0.7s ease-out 0.1s both', marginBottom: SPACING.sm }}>
        <div style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.medium, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          FERHENGA
        </div>
        <div style={{ fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.extrabold, color: '#fff', letterSpacing: '0.05em' }}>
          MATEMATÎKÊ
        </div>
        <div style={{ fontSize: FONT_SIZE.base, color: 'rgba(255,255,255,0.65)', marginTop: SPACING.xs }}>
          Pêşdibistanî – Dibistana Seretayî
        </div>
        <div style={{ fontSize: '0.9rem', fontStyle: 'italic', color: 'rgba(255,255,255,0.8)', marginTop: SPACING.sm + 2 }}>
          "Matematîk bi her zimanî diaxive, bi kurdî jî."
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: SPACING.sm + 2, marginBottom: SPACING.xxl, animation: 'fadeInUp 0.8s ease-out 0.2s both' }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            padding: `${SPACING.sm}px ${SPACING.lg}px`,
            borderRadius: RADIUS.full,
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.25)',
            animation: 'fadeInUp 0.6s ease-out ' + (0.3 + i * 0.1) + 's both',
          }}>
            <div style={{ fontSize: '1.1rem', fontWeight: FONT_WEIGHT.extrabold, color: '#fff' }}>{s.count}</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', fontWeight: FONT_WEIGHT.medium }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <button
        onClick={onStart}
        style={{
          padding: `${SPACING.lg}px ${SPACING.xxl + 8}px`,
          borderRadius: RADIUS.full, border: 'none',
          background: '#E76F51', color: '#fff',
          fontSize: '1.1rem', fontWeight: FONT_WEIGHT.bold, cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(231,111,81,0.5)',
          animation: 'fadeInUp 0.8s ease-out 0.4s both, pulseGlow 2.5s ease-in-out infinite 1.2s',
          transition: `transform ${DURATION.normal}, box-shadow ${DURATION.normal}`,
          display: 'flex', alignItems: 'center', gap: SPACING.sm,
          minHeight: TOUCH_MIN + 4,
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(231,111,81,0.6)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(231,111,81,0.5)'; }}
        aria-label="Dest pê bike"
      >
        Dest pê bike
        <IconArrowRight size={20} color="#fff" />
      </button>

      {/* Footer */}
      <div style={{ position: 'absolute', bottom: SPACING.xl - 4, fontSize: FONT_SIZE.sm, color: 'rgba(255,255,255,0.45)' }}>
        Prof. Dr. Yılmaz MUTLU · v2.0
      </div>
    </div>
  );
}
