import { useState, useMemo } from 'react';
import { SECTIONS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, DURATION, ICON_SIZE, TOUCH_MIN } from '@data';
import { getSectionColor, getLevelColor } from '@utils/helpers.js';
import { useMediaQuery } from '@hooks';
import { IconArrowLeft, IconArrowRight } from '@components/icons';
import { SectionTag } from '@components/ui';
import { ConceptVisual } from '@components/visuals';

export default function NexşeView({ theme, isDark, concepts }) {
  const t = theme;
  const { isMobile, isTablet, isDesktop } = useMediaQuery();
  const px = isMobile ? SPACING.sm + 2 : isTablet ? SPACING.md : SPACING.lg;

  const [activeSectionId, setActiveSectionId] = useState(0);
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [modalIdx, setModalIdx] = useState(0);

  const filtered = useMemo(() =>
    activeSectionId === 0 ? concepts : concepts.filter(c => c.s === activeSectionId),
    [concepts, activeSectionId]
  );

  const openModal = (concept) => {
    const idx = filtered.findIndex(c => c.ku === concept.ku && c.s === concept.s);
    setSelectedConcept(concept);
    setModalIdx(idx);
  };
  const closeModal = () => setSelectedConcept(null);
  const goNext = () => {
    const next = filtered[modalIdx + 1];
    if (next) { setSelectedConcept(next); setModalIdx(modalIdx + 1); }
  };
  const goPrev = () => {
    const prev = filtered[modalIdx - 1];
    if (prev) { setSelectedConcept(prev); setModalIdx(modalIdx - 1); }
  };

  // Responsive grid: 2 cols mobile, 3 cols tablet, 4 cols desktop
  const cols = isMobile ? 2 : isTablet ? 3 : 4;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'transparent' }}>

      {/* ── Section filter bar ── */}
      <div style={{
        padding: `${SPACING.sm}px ${px}px 6px`,
        borderBottom: '1px solid ' + t.border,
        background: t.surface,
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex', gap: 6,
          overflowX: 'auto', paddingBottom: 2,
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}>
          {/* All */}
          <button
            onClick={() => setActiveSectionId(0)}
            style={{
              padding: '7px 14px',
              minHeight: TOUCH_MIN,
              borderRadius: RADIUS.xl, border: 'none',
              background: activeSectionId === 0 ? t.primary : t.bg,
              color: activeSectionId === 0 ? '#fff' : t.textSecondary,
              fontSize: '0.8rem', fontWeight: FONT_WEIGHT.bold,
              cursor: 'pointer', fontFamily: 'inherit',
              whiteSpace: 'nowrap', transition: `all ${DURATION.fast}`,
              WebkitTapHighlightColor: 'transparent',
              flexShrink: 0,
            }}
          >
            Hemû
          </button>
          {Object.entries(SECTIONS).map(([id, sec]) => {
            const sid = parseInt(id);
            const colors = getSectionColor(sid, isDark);
            const isActive = activeSectionId === sid;
            return (
              <button
                key={id}
                onClick={() => setActiveSectionId(sid)}
                style={{
                  padding: '7px 14px',
                  minHeight: TOUCH_MIN,
                  borderRadius: RADIUS.xl, border: 'none',
                  background: isActive ? colors.accent : t.bg,
                  color: isActive ? '#fff' : colors.text,
                  fontSize: '0.8rem', fontWeight: FONT_WEIGHT.bold,
                  cursor: 'pointer', fontFamily: 'inherit',
                  whiteSpace: 'nowrap', transition: `all ${DURATION.fast}`,
                  WebkitTapHighlightColor: 'transparent',
                  flexShrink: 0,
                }}
              >
                {sec.icon} {sec.short}
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: '0.7rem', color: t.textMuted, marginTop: 4 }}>
          {filtered.length} têgeh · Nîşanekê bixe da ku berfireh bibe
        </div>
      </div>

      {/* ── Visual grid ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: `${SPACING.md}px ${px}px 80px` }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: isMobile ? SPACING.sm + 2 : 14,
          maxWidth: isDesktop ? 1200 : '100%',
          margin: '0 auto',
        }}>
          {filtered.map((concept) => {
            const colors = getSectionColor(concept.s, isDark);
            const levelColor = getLevelColor(concept.lv);
            return (
              <NexşeCard
                key={concept.ku + concept.s}
                concept={concept}
                colors={colors}
                levelColor={levelColor}
                theme={t}
                isDark={isDark}
                isMobile={isMobile}
                onClick={() => openModal(concept)}
              />
            );
          })}
        </div>
      </div>

      {/* ── Detail modal (bottom sheet) ── */}
      {selectedConcept && (
        <NexşeModal
          concept={selectedConcept}
          theme={t}
          isDark={isDark}
          modalIdx={modalIdx}
          total={filtered.length}
          onClose={closeModal}
          onNext={goNext}
          onPrev={goPrev}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}

/* ─── Nexşe Card ─────────────────────────────────────────────────────────── */
function NexşeCard({ concept, colors, levelColor, theme: t, onClick, isMobile }) {
  const [hovered, setHovered] = useState(false);
  const visualSize = isMobile ? 72 : 88;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: t.surface,
        borderRadius: SPACING.lg,
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
        overflow: 'hidden',
        boxShadow: hovered
          ? '0 8px 24px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)'
          : '0 1px 4px rgba(0,0,0,0.07), 0 2px 8px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-3px) scale(1.01)' : 'translateY(0) scale(1)',
        transition: 'all 0.18s cubic-bezier(0.34,1.56,0.64,1)',
        display: 'flex', flexDirection: 'column',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
      }}
    >
      {/* Visual header */}
      <div style={{
        background: `linear-gradient(145deg, ${colors.bg} 0%, ${colors.accent}18 100%)`,
        padding: isMobile ? `${SPACING.sm + 2}px ${SPACING.sm}px ${SPACING.sm}px` : `14px ${SPACING.sm + 2}px ${SPACING.sm + 2}px`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: isMobile ? 90 : 110,
        position: 'relative',
      }}>
        {/* Level badge */}
        <div style={{
          position: 'absolute', top: 6, right: 7,
          background: levelColor + '22', color: levelColor,
          fontSize: '0.58rem', fontWeight: FONT_WEIGHT.extrabold,
          padding: '2px 5px', borderRadius: 6,
          letterSpacing: '0.03em',
        }}>
          {concept.lv}
        </div>
        {concept.visual
          ? <ConceptVisual visual={concept.visual} theme={t} size={visualSize} />
          : (
            <div style={{
              width: visualSize, height: visualSize,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: colors.bg, borderRadius: SPACING.md,
              fontSize: isMobile ? '2rem' : '2.6rem',
            }}>
              {SECTIONS[concept.s]?.icon}
            </div>
          )
        }
      </div>

      {/* Content footer */}
      <div style={{
        padding: isMobile ? `${SPACING.sm}px ${SPACING.sm}px ${SPACING.sm + 2}px` : `${SPACING.sm + 2}px ${SPACING.sm + 2}px ${SPACING.md}px`,
        borderTop: '2px solid ' + colors.accent + '30',
        flex: 1, display: 'flex', flexDirection: 'column', gap: 2,
      }}>
        <div style={{
          fontSize: isMobile ? FONT_SIZE.sm : '0.82rem',
          fontWeight: FONT_WEIGHT.extrabold, color: t.text,
          lineHeight: 1.25, letterSpacing: '-0.01em',
        }}>
          {concept.ku}
        </div>
        <div style={{
          fontSize: isMobile ? FONT_SIZE.xs : '0.7rem',
          color: t.textSecondary, fontWeight: FONT_WEIGHT.medium, lineHeight: 1.3,
        }}>
          {concept.tr}
        </div>
      </div>
    </button>
  );
}

/* ─── Nexşe Detail Modal (bottom sheet) ────────────────────────────────────── */
function NexşeModal({ concept, theme: t, isDark, modalIdx, total, onClose, onNext, onPrev, isMobile }) {
  const colors = getSectionColor(concept.s, isDark);
  const levelColor = getLevelColor(concept.lv);
  const visualSize = isMobile ? 120 : 160;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        zIndex: 50,
        animation: 'fadeIn 0.18s ease-out',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: t.surface,
          borderRadius: `${SPACING.xl}px ${SPACING.xl}px 0 0`,
          width: '100%', maxWidth: 520,
          maxHeight: '90dvh', overflowY: 'auto',
          animation: 'slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.25)',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: SPACING.md, paddingBottom: SPACING.sm / 2 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: t.border }} />
        </div>

        {/* Visual hero */}
        <div style={{
          background: `linear-gradient(160deg, ${colors.bg} 0%, ${colors.accent}20 100%)`,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          padding: isMobile ? `${SPACING.lg}px ${SPACING.lg}px ${SPACING.md}px` : `${SPACING.xl - 4}px ${SPACING.xl - 4}px ${SPACING.lg}px`,
        }}>
          {concept.visual
            ? <ConceptVisual visual={concept.visual} theme={t} size={visualSize} />
            : <span style={{ fontSize: isMobile ? '3.5rem' : '5rem' }}>{SECTIONS[concept.s]?.icon}</span>
          }
        </div>

        {/* Content */}
        <div style={{ padding: isMobile ? `14px ${SPACING.lg}px ${SPACING.xl}px` : `${SPACING.lg}px ${SPACING.xl - 4}px 28px` }}>

          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: 14 }}>
            <div style={{
              fontSize: isMobile ? '1.4rem' : '1.7rem',
              fontWeight: 900, color: t.text, lineHeight: 1.2, marginBottom: 5,
            }}>
              {concept.ku}
            </div>
            <div style={{ fontSize: '0.92rem', color: t.textSecondary, fontWeight: FONT_WEIGHT.medium }}>
              {concept.tr} · {concept.en}
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: SPACING.sm + 2 }}>
              <SectionTag sectionId={concept.s} isDark={isDark} size="sm" />
              <span style={{
                background: levelColor + '20', color: levelColor,
                fontSize: '0.72rem', fontWeight: FONT_WEIGHT.extrabold,
                padding: `3px ${SPACING.sm + 2}px`, borderRadius: SPACING.sm + 2,
              }}>
                {concept.lv}
              </span>
            </div>
          </div>

          {/* Penase */}
          {concept.df && (
            <div style={{
              background: colors.bg, borderRadius: SPACING.md,
              padding: `${SPACING.md}px 14px`, marginBottom: SPACING.sm + 2,
              border: '1px solid ' + colors.accent + '30',
            }}>
              <div style={{
                fontSize: '0.68rem', fontWeight: FONT_WEIGHT.extrabold, color: colors.text,
                marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                📖 Penase
              </div>
              <div style={{ fontSize: '0.9rem', color: t.text, lineHeight: 1.65 }}>
                {concept.df}
              </div>
            </div>
          )}

          {/* Mînak */}
          {concept.ex && (
            <div style={{
              background: isDark ? '#2A1F14' : '#FFF7ED',
              borderRadius: SPACING.md, padding: `${SPACING.md}px 14px`, marginBottom: 18,
              border: '1px solid ' + (isDark ? '#F97316' : '#F97316') + '30',
            }}>
              <div style={{
                fontSize: '0.68rem', fontWeight: FONT_WEIGHT.extrabold, color: '#F97316',
                marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                💡 Mînak
              </div>
              <div style={{ fontSize: '0.9rem', color: t.text, lineHeight: 1.65, fontStyle: 'italic' }}>
                {concept.ex}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', gap: SPACING.sm, alignItems: 'center', marginBottom: SPACING.md }}>
            <button
              onClick={onPrev} disabled={modalIdx === 0}
              style={navBtnStyle(t, modalIdx === 0)}
            >
              <IconArrowLeft size={ICON_SIZE.sm} color={modalIdx === 0 ? t.textMuted : t.textSecondary} />
              <span>Paş</span>
            </button>
            <div style={{
              flex: 0.6, textAlign: 'center',
              fontSize: '0.78rem', color: t.textMuted, fontWeight: FONT_WEIGHT.bold,
            }}>
              {modalIdx + 1} / {total}
            </div>
            <button
              onClick={onNext} disabled={modalIdx >= total - 1}
              style={navBtnStyle(t, modalIdx >= total - 1)}
            >
              <span>Pêş</span>
              <IconArrowRight size={ICON_SIZE.sm} color={modalIdx >= total - 1 ? t.textMuted : t.textSecondary} />
            </button>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            style={{
              width: '100%', padding: '14px',
              minHeight: 52, borderRadius: RADIUS.lg, border: 'none',
              background: t.primary, color: '#fff',
              fontFamily: 'inherit', fontSize: '0.95rem',
              fontWeight: FONT_WEIGHT.bold, cursor: 'pointer',
              transition: `opacity ${DURATION.fast}`,
              WebkitTapHighlightColor: 'transparent',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            Bigire
          </button>
        </div>
      </div>
    </div>
  );
}

function navBtnStyle(t, disabled) {
  return {
    flex: 1, padding: `11px ${SPACING.md}px`,
    minHeight: TOUCH_MIN + 4, borderRadius: SPACING.md,
    border: '1.5px solid ' + t.border,
    background: 'transparent',
    color: disabled ? t.textMuted : t.textSecondary,
    fontFamily: 'inherit', fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold,
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.38 : 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
    transition: `all ${DURATION.fast}`,
    WebkitTapHighlightColor: 'transparent',
  };
}
