// ─── FerMat — More Hub ─────────────────────────────────────────────────────
// Same visual grammar as HomeView's action cards: soft tinted gradient +
// tinted icon container + dark text + chevron. Each item carries its own
// accent colour from the logo palette family.
import { ALL_CONCEPTS, SECTIONS, FONT_SIZE, FONT_WEIGHT, SPACING } from '@data';
import { PageContainer } from '@components/ui';
import {
  IconLightbulb, IconMap, IconClipboard, IconInfo, IconMessage, IconChevronRight,
} from '@components/icons';

const APP_VERSION = '3.0.0';

export default function MoreHubView({ theme, isDark, setView }) {
  const t = theme;
  const conceptCount = ALL_CONCEPTS.length;
  const sectionCount = Object.keys(SECTIONS).length;

  const items = [
    {
      id: 'exercise',
      icon: IconLightbulb,
      title: 'Hîndarî',
      desc: 'Temrîn û pratîk',
      tint: '#0D9488',         // logo teal
      rgb:  '13,148,136',
    },
    {
      id: 'conceptmap',
      icon: IconMap,
      title: 'Nexşeya Têgehan',
      desc: 'Têgehan bi nexşeyê bibîne',
      tint: '#15803D',         // logo green
      rgb:  '21,128,61',
    },
    {
      id: 'worksheet',
      icon: IconClipboard,
      title: 'Rûpelên Xebatê',
      desc: 'Rûpelên çapkirî',
      tint: '#EA580C',         // logo coral
      rgb:  '234,88,12',
    },
    {
      id: 'about',
      icon: IconInfo,
      title: 'Derbarê Ferhengê',
      desc: 'Agahdarî û pêşgotin',
      tint: '#0F4C5C',         // logo dark teal
      rgb:  '15,76,92',
    },
    {
      id: 'feedback',
      icon: IconMessage,
      title: 'Pêşniyar û Serrastkirin',
      desc: 'Pêşniyarên xwe bişîne',
      tint: '#15803D',         // logo green (success/positive)
      rgb:  '21,128,61',
    },
  ];

  return (
    <PageContainer>
      {/* Section label */}
      <div style={{
        fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold,
        color: t.textMuted, textTransform: 'uppercase',
        letterSpacing: '0.06em', marginBottom: 10,
      }}>
        Zêdetir
      </div>

      {/* Mini stat banner — matches HomeView compact-ring style */}
      <div style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 14,
        padding: '12px 14px',
        display: 'flex', alignItems: 'center', gap: 12,
        marginBottom: SPACING.lg,
      }}>
        <div aria-hidden="true" style={{
          width: 36, height: 36, borderRadius: 10,
          background: isDark ? 'rgba(13,148,136,0.18)' : 'rgba(13,148,136,0.10)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.05rem', flexShrink: 0,
        }}>
          📚
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: FONT_SIZE.xs, color: t.textMuted, fontWeight: FONT_WEIGHT.medium }}>
            FerMat <span style={{ opacity: 0.7 }}>v{APP_VERSION}</span>
          </div>
          <div style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: t.text, marginTop: 1 }}>
            {conceptCount} têgeh · {sectionCount} beş · 3 ziman
          </div>
        </div>
      </div>

      {/* Action cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map(item => (
          <ActionRow
            key={item.id}
            item={item}
            onClick={() => setView(item.id)}
            t={t} isDark={isDark}
          />
        ))}
      </div>

      {/* Author credit — sade footer */}
      <div style={{
        textAlign: 'center', marginTop: SPACING.xl,
        fontSize: FONT_SIZE.xs, color: t.textMuted, lineHeight: 1.6,
      }}>
        <div style={{ fontWeight: FONT_WEIGHT.semibold }}>Prof. Dr. Yılmaz MUTLU</div>
        <div style={{ opacity: 0.7, marginTop: 1 }}>Zanîngeha Mûş Alparslan</div>
      </div>
    </PageContainer>
  );
}

// ─── ActionRow — HomeView Lîstik kart pattern'i ────────────────────────────
function ActionRow({ item, onClick, t, isDark }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      aria-label={item.title}
      style={{
        width: '100%',
        background: isDark
          ? `linear-gradient(135deg, rgba(${item.rgb},0.22) 0%, rgba(${item.rgb},0.08) 100%)`
          : `linear-gradient(135deg, rgba(${item.rgb},0.10) 0%, rgba(${item.rgb},0.04) 100%)`,
        border: `1px solid ${isDark ? `rgba(${item.rgb},0.30)` : `rgba(${item.rgb},0.18)`}`,
        borderRadius: 16,
        padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        cursor: 'pointer',
        fontFamily: 'inherit', textAlign: 'left',
        WebkitTapHighlightColor: 'transparent',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = isDark
          ? `0 6px 16px rgba(${item.rgb},0.20)`
          : `0 6px 16px rgba(${item.rgb},0.14)`;
        e.currentTarget.style.borderColor = `rgba(${item.rgb},0.35)`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = isDark
          ? `rgba(${item.rgb},0.30)`
          : `rgba(${item.rgb},0.18)`;
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: `rgba(${item.rgb},0.18)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={22} color={item.tint} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: FONT_SIZE.md,
          fontWeight: FONT_WEIGHT.extrabold,
          color: t.text,
          lineHeight: 1.2,
        }}>
          {item.title}
        </div>
        <div style={{
          fontSize: FONT_SIZE.xs,
          color: t.textMuted,
          marginTop: 2,
        }}>
          {item.desc}
        </div>
      </div>
      <IconChevronRight size={18} color={t.textMuted} />
    </button>
  );
}
