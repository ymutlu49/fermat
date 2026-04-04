// ─── FerMat — Pêşniyar û Serrastkirin (Feedback View) ───────────────────────
import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '@data';
import { useMediaQuery } from '@hooks';
import { IconChevronRight } from '@components/icons';

// ── Google Form URL — bunu kendi form URL'nizle değiştirin ──────────────────
const GOOGLE_FORM_URL = 'https://forms.gle/PLACEHOLDER';

const FEEDBACK_TYPES = [
  { id: 'bug',  label: 'Xeletî',   desc: 'Pirsgirêkek rapor bike',     color: '#EF4444' },
  { id: 'idea', label: 'Pêşniyar', desc: 'Ramanek an pêşniyarek bişîne', color: '#F59E0B' },
  { id: 'term', label: 'Têgeh',    desc: 'Têgehek nû pêşniyar bike',    color: '#3B82F6' },
  { id: 'like', label: 'Spas',     desc: 'Tiştên ku baş in bibêje',     color: '#10B981' },
];

export default function FeedbackView({ theme, isDark }) {
  const t = theme;
  const { isMobile } = useMediaQuery();
  const px = isMobile ? SPACING.md : SPACING.xl;

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: `${SPACING.xl}px ${px}px 80px` }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>

        {/* Description */}
        <div style={{
          fontSize: FONT_SIZE.sm, color: t.textMuted, lineHeight: 1.6,
          marginBottom: SPACING.xl, textAlign: 'center',
        }}>
          Ji bo baştirkirina vê sepanê alîkariya xwe bikin.
        </div>

        {/* Type cards — each opens Google Form */}
        <div style={{
          background: t.surface, borderRadius: RADIUS.xl,
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          overflow: 'hidden', marginBottom: SPACING.xl,
        }}>
          {FEEDBACK_TYPES.map((ft, i) => (
            <a
              key={ft.id}
              href={GOOGLE_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: SPACING.md,
                padding: `14px ${SPACING.lg}px`,
                borderBottom: i < FEEDBACK_TYPES.length - 1
                  ? `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`
                  : 'none',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: ft.color + (isDark ? '20' : '10'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, color: ft.color,
              }}>
                {ft.label.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold, color: t.text }}>
                  {ft.label}
                </div>
                <div style={{ fontSize: FONT_SIZE.xs, color: t.textMuted, marginTop: 1 }}>
                  {ft.desc}
                </div>
              </div>
              <IconChevronRight size={16} color={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'} />
            </a>
          ))}
        </div>

        {/* Direct email option */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: FONT_SIZE.xs, color: t.textMuted, marginBottom: SPACING.sm }}>
            An jî rasterast bi e-nameyê bişîne:
          </div>
          <a
            href="mailto:y.mutlu@alparslan.edu.tr?subject=[FerMat] Pêşniyar"
            style={{
              fontSize: FONT_SIZE.sm, color: t.primary,
              fontWeight: FONT_WEIGHT.medium, textDecoration: 'none',
            }}
          >
            y.mutlu@alparslan.edu.tr
          </a>
        </div>

      </div>
    </div>
  );
}
