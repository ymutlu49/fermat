// ─── FerMat — More Hub (rich) ──────────────────────────────────────────────
// Replaces the flat 5-row list with a colourful tinted grid. Each tile carries
// its own accent colour so the hub itself feels like a map rather than a menu.
import { ALL_CONCEPTS, SECTIONS, FONT_SIZE, FONT_WEIGHT, SPACING } from '@data';
import { PageContainer } from '@components/ui';
import {
  IconLightbulb, IconMap, IconClipboard, IconInfo, IconMessage,
} from '@components/icons';

const APP_VERSION = '3.0.0';

export default function MoreHubView({ theme, isDark, setView }) {
  const t = theme;
  const conceptCount = ALL_CONCEPTS.length;
  const sectionCount = Object.keys(SECTIONS).length;

  // Two halves: practice/explore (rich tiles) and meta (about/feedback)
  const practice = [
    {
      id: 'exercise',
      icon: IconLightbulb,
      title: 'Hîndarî',
      desc: 'Temrîn û pratîk',
      tint: '#0E7490',
      accent: 'rgba(14,116,144,0.12)',
      accentDark: 'rgba(14,116,144,0.22)',
      emoji: '💡',
    },
    {
      id: 'conceptmap',
      icon: IconMap,
      title: 'Nexşeya Têgehan',
      desc: 'Bi nexşeyê bibîne',
      tint: '#7E22CE',
      accent: 'rgba(126,34,206,0.10)',
      accentDark: 'rgba(126,34,206,0.22)',
      emoji: '🗺️',
    },
    {
      id: 'worksheet',
      icon: IconClipboard,
      title: 'Rûpelên Xebatê',
      desc: 'Rûpelên çapkirî',
      tint: '#B45309',
      accent: 'rgba(180,83,9,0.10)',
      accentDark: 'rgba(180,83,9,0.22)',
      emoji: '📋',
    },
  ];

  const meta = [
    {
      id: 'about',
      icon: IconInfo,
      title: 'Derbarê Ferhengê',
      desc: 'Agahdarî û pêşgotin',
      tint: '#0F4C5C',
      accent: 'rgba(15,76,92,0.10)',
      accentDark: 'rgba(15,76,92,0.25)',
      emoji: 'ℹ️',
    },
    {
      id: 'feedback',
      icon: IconMessage,
      title: 'Pêşniyar û Serrastkirin',
      desc: 'Pêşniyarên xwe bişîne',
      tint: '#059669',
      accent: 'rgba(5,150,105,0.10)',
      accentDark: 'rgba(5,150,105,0.22)',
      emoji: '💬',
    },
  ];

  return (
    <PageContainer>
      {/* ── Mini stat banner ── */}
      <div style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(13,148,136,0.10), rgba(234,88,12,0.06))'
          : 'linear-gradient(135deg, rgba(13,148,136,0.06), rgba(234,88,12,0.03))',
        border: `1px solid ${isDark ? 'rgba(13,148,136,0.20)' : 'rgba(13,148,136,0.12)'}`,
        borderRadius: 16,
        padding: '12px 16px',
        marginBottom: SPACING.lg,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div aria-hidden="true" style={{ fontSize: 30, lineHeight: 1 }}>📚</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.extrabold, color: t.text, lineHeight: 1.2 }}>
            FerMat <span style={{ color: t.textMuted, fontWeight: FONT_WEIGHT.medium }}>v{APP_VERSION}</span>
          </div>
          <div style={{ fontSize: FONT_SIZE.xs, color: t.textMuted, marginTop: 2, fontWeight: FONT_WEIGHT.medium }}>
            {conceptCount} têgeh · {sectionCount} beş · 3 ziman
          </div>
        </div>
      </div>

      {/* ── Section: Practice & Explore ── */}
      <SectionLabel theme={t}>Hîndarî û keşf</SectionLabel>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 10,
        marginBottom: SPACING.lg,
      }}>
        {practice.map(item => (
          <TintedTile
            key={item.id}
            item={item}
            onClick={() => setView(item.id)}
            t={t} isDark={isDark}
          />
        ))}
      </div>

      {/* ── Section: Info & Feedback ── */}
      <SectionLabel theme={t}>Derbarê û têkilî</SectionLabel>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 10,
      }}>
        {meta.map(item => (
          <MetaRow
            key={item.id}
            item={item}
            onClick={() => setView(item.id)}
            t={t} isDark={isDark}
          />
        ))}
      </div>

      {/* ── Author credit ── */}
      <div style={{
        textAlign: 'center', marginTop: SPACING.xl,
        fontSize: FONT_SIZE.xs, color: t.textMuted, lineHeight: 1.5,
      }}>
        <div style={{ fontWeight: FONT_WEIGHT.medium }}>Prof. Dr. Yılmaz MUTLU</div>
        <div style={{ color: t.textMuted, opacity: 0.7, marginTop: 2 }}>
          Zanîngeha Mûş Alparslan
        </div>
      </div>
    </PageContainer>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────

function SectionLabel({ children, theme: t }) {
  return (
    <div style={{
      fontSize: '0.65rem', fontWeight: FONT_WEIGHT.bold,
      color: t.textMuted, textTransform: 'uppercase',
      letterSpacing: '0.08em', marginBottom: 8, paddingLeft: 2,
    }}>
      {children}
    </div>
  );
}

function TintedTile({ item, onClick, t, isDark }) {
  const Icon = item.icon;
  const bg = isDark ? item.accentDark : item.accent;
  return (
    <button
      onClick={onClick}
      aria-label={item.title}
      style={{
        position: 'relative',
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 16,
        padding: '14px 14px 12px',
        cursor: 'pointer',
        fontFamily: 'inherit',
        textAlign: 'left',
        WebkitTapHighlightColor: 'transparent',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = isDark
          ? `0 6px 16px ${item.tint}33`
          : `0 6px 16px ${item.tint}22`;
        e.currentTarget.style.borderColor = `${item.tint}66`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = t.border;
      }}
    >
      {/* Decorative corner accent */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: bg,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'relative',
        width: 44, height: 44, borderRadius: 12,
        background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 10,
      }}>
        <Icon size={22} color={item.tint} />
      </div>
      <div style={{ position: 'relative' }}>
        <div style={{
          fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.extrabold,
          color: t.text, lineHeight: 1.25,
          minHeight: 36,
          display: 'flex', alignItems: 'center',
        }}>
          {item.title}
        </div>
        <div style={{
          fontSize: '0.7rem', color: t.textMuted,
          marginTop: 2, lineHeight: 1.3,
        }}>
          {item.desc}
        </div>
      </div>
    </button>
  );
}

function MetaRow({ item, onClick, t, isDark }) {
  const Icon = item.icon;
  const bg = isDark ? item.accentDark : item.accent;
  return (
    <button
      onClick={onClick}
      aria-label={item.title}
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 14,
        padding: '14px 16px',
        cursor: 'pointer',
        fontFamily: 'inherit',
        textAlign: 'left',
        WebkitTapHighlightColor: 'transparent',
        display: 'flex', alignItems: 'center', gap: 12,
        transition: 'transform 0.15s ease, border-color 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${item.tint}55`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = t.border;
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 11,
        background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={20} color={item.tint} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: t.text }}>
          {item.title}
        </div>
        <div style={{ fontSize: FONT_SIZE.xs, color: t.textMuted, marginTop: 1 }}>
          {item.desc}
        </div>
      </div>
      <div aria-hidden="true" style={{
        fontSize: '1rem', color: t.textMuted, opacity: 0.6,
      }}>
        ›
      </div>
    </button>
  );
}
