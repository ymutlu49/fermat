// ─── FerMat — Ferheng (Dictionary — Vibrant Redesign) ───────────
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  ALL_CONCEPTS, SECTIONS,
  SCROLL_TOP_THRESHOLD,
  SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, DURATION, ICON_SIZE, TOUCH_MIN,
} from '@data';
import { filterConcepts, getLevelColor, getSectionColor } from '@utils/helpers.js';
import { useMediaQuery, useSpeech, useFavorites } from '@hooks';
import { IconSearch, IconX, IconArrowLeft, IconArrowRight } from '@components/icons';
import { Pill, SectionTag, SpeakButton, ConceptRow, ListSection } from '@components/ui';
import { ConceptVisual } from '@components/visuals';
import { SYLLABLES, RELATED_CONCEPTS } from '@data';
import { fuzzySearchConcepts, getAutocompleteSuggestions } from '@utils/fuzzySearch.js';

export default function DictionaryView({ theme, isDark, concepts, initialSection = null }) {
  const t = theme;
  const { isMobile, isTablet, isDesktop } = useMediaQuery();
  const { speak, isSpeaking } = useSpeech();
  const { favorites, recents, toggleFavorite, isFavorite, addRecent } = useFavorites();
  const px = isMobile ? 10 : isTablet ? 14 : 18;

  const [searchQuery, setSearchQuery]     = useState('');
  const [activeSectionId, setActiveSectionId] = useState(initialSection);
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [modalIdx, setModalIdx]           = useState(0);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const scrollRef = useRef(null);
  const inputRef  = useRef(null);

  const filteredConcepts = useMemo(() => {
    if (searchQuery.length >= 2) {
      const fuzzyResults = fuzzySearchConcepts(concepts, searchQuery);
      let results = fuzzyResults.map(r => r.concept);
      if (activeSectionId !== null) results = results.filter(c => c.s === activeSectionId);
      return results;
    }
    return filterConcepts(concepts, searchQuery, activeSectionId, 'section');
  }, [concepts, searchQuery, activeSectionId]);

  const suggestions = useMemo(() => {
    if (!showAutocomplete || searchQuery.length < 2) return [];
    return getAutocompleteSuggestions(concepts, searchQuery);
  }, [showAutocomplete, searchQuery, concepts]);

  const finalConcepts = filteredConcepts;


  // Modal navigation helpers
  const openModal = useCallback((concept) => {
    addRecent(concept.ku + '_' + concept.s);
    const idx = finalConcepts.findIndex(c => c.ku === concept.ku && c.s === concept.s);
    setSelectedConcept(concept);
    setModalIdx(idx >= 0 ? idx : 0);
  }, [finalConcepts, addRecent]);

  const closeModal  = useCallback(() => setSelectedConcept(null), []);
  const goNext      = useCallback(() => {
    const next = finalConcepts[modalIdx + 1];
    if (next) { setSelectedConcept(next); setModalIdx(i => i + 1); }
  }, [finalConcepts, modalIdx]);
  const goPrev      = useCallback(() => {
    const prev = finalConcepts[modalIdx - 1];
    if (prev) { setSelectedConcept(prev); setModalIdx(i => i - 1); }
  }, [finalConcepts, modalIdx]);


  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'transparent' }}>

      {/* ── Search & Filters (unified compact header) ── */}
      <div style={{
        padding: `${SPACING.sm + 2}px 16px ${SPACING.xs + 2}px`,
        background: isDark ? 'rgba(26,35,50,0.95)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        flexShrink: 0,
      }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        {/* Search bar */}
        <div style={{ position: 'relative', marginBottom: SPACING.sm }}>
          <div style={{
            position: 'absolute', left: 14, top: '50%',
            transform: 'translateY(-50%)', pointerEvents: 'none',
          }}>
            <IconSearch size={ICON_SIZE.md} color={searchQuery ? t.primary : t.textMuted} />
          </div>
          <input
            ref={inputRef}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setShowAutocomplete(true)}
            onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
            placeholder="Li têgehekê bigere..."
            aria-label="Li têgehekê bigere"
            style={{
              width: '100%', padding: `12px 40px 12px 42px`,
              minHeight: 48, borderRadius: RADIUS.xl,
              border: '1px solid ' + (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
              color: t.text,
              fontSize: '0.9375rem', fontFamily: 'inherit',
              outline: 'none', boxSizing: 'border-box',
              transition: `all ${DURATION.normal}`,
              WebkitAppearance: 'none',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); inputRef.current?.focus(); }}
              aria-label="Paqij bike"
              style={{
                position: 'absolute', right: 10, top: '50%',
                transform: 'translateY(-50%)',
                background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                border: 'none', cursor: 'pointer', borderRadius: '50%',
                width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <IconX size={ICON_SIZE.sm} color={t.textMuted} />
            </button>
          )}

          {/* Autocomplete dropdown */}
          {suggestions.length > 0 && (
            <div style={{
              position: 'absolute', left: 0, right: 0, top: 'calc(100% + 4px)',
              background: t.surface, border: '1px solid ' + t.border,
              borderRadius: RADIUS.lg, boxShadow: t.cardShadowHover,
              zIndex: 20, maxHeight: 200, overflowY: 'auto',
            }}>
              {suggestions.map((s, i) => (
                <div key={i}
                  onMouseDown={() => { setSearchQuery(s.concept.ku); setShowAutocomplete(false); }}
                  style={{
                    padding: `${SPACING.sm + 2}px ${SPACING.md}px`,
                    cursor: 'pointer', fontSize: FONT_SIZE.sm,
                    borderBottom: i < suggestions.length - 1 ? '1px solid ' + t.borderLight : 'none',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: `background ${DURATION.fast}`,
                  }}
                >
                  <span style={{ fontWeight: FONT_WEIGHT.bold, color: t.text }}>{s.concept.ku}</span>
                  <span style={{ color: t.textMuted, fontSize: FONT_SIZE.xs }}>{s.concept.tr}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section filter pills — each section in its own colour */}
        <div style={{
          display: 'flex', gap: 8,
          overflowX: 'auto', paddingBottom: 4, paddingTop: 2,
          scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
        }}>
          <Pill
            label="Hemû"
            icon="✨"
            isActive={activeSectionId === null}
            color="#0F4C5C"
            isDark={isDark}
            onClick={() => setActiveSectionId(null)}
          />
          {Object.entries(SECTIONS).map(([id, sec]) => {
            const sid = parseInt(id);
            const colors = getSectionColor(sid, isDark);
            return (
              <Pill
                key={id}
                icon={sec.icon}
                isActive={activeSectionId === sid}
                color={colors.accent}
                isDark={isDark}
                onClick={() => setActiveSectionId(sid)}
              >
                {sec.short}
              </Pill>
            );
          })}
        </div>
      </div>{/* /max-width */}
      </div>{/* /header */}

      {/* ── Concept list ── */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: `${SPACING.sm}px 16px 80px` }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        {finalConcepts.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '60px 20px', textAlign: 'center',
          }}>
            <div style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: t.text, marginBottom: 6 }}>
              Têgehek nehat dîtin
            </div>
            <div style={{ fontSize: FONT_SIZE.sm, color: t.textSecondary, marginBottom: 20 }}>
              Parzûnê biguherîne an lêgerînê paqij bike
            </div>
            <button
              onClick={() => { setSearchQuery(''); setActiveSectionId(null); }}
              style={{
                padding: `10px 20px`, borderRadius: RADIUS.lg,
                border: 'none', background: t.primary,
                color: '#fff', fontFamily: 'inherit',
                fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.bold, cursor: 'pointer',
              }}
            >
              Paqij bike
            </button>
          </div>
        ) : (
          /* Flat list — no section headers */
          <ListSection theme={t}>
            {finalConcepts.map((concept, i) => (
              <ConceptRow
                key={concept.ku + '_' + concept.s}
                concept={concept}
                theme={t}
                isDark={isDark}
                onClick={() => openModal(concept)}
                isLast={i === finalConcepts.length - 1}
                VisualComponent={ConceptVisual}
              />
            ))}
          </ListSection>
        )}
      </div>{/* /max-width */}
      </div>{/* /scroll */}

      {/* ── Detail modal ── */}
      {selectedConcept && (
        <ConceptModal
          concept={selectedConcept}
          theme={t}
          isDark={isDark}
          modalIdx={modalIdx}
          total={finalConcepts.length}
          onClose={closeModal}
          onNext={goNext}
          onPrev={goPrev}
          isMobile={isMobile}
          speak={speak}
          isSpeaking={isSpeaking}
          concepts={concepts}
          openModal={openModal}
          isFavorite={isFavorite}
          toggleFavorite={toggleFavorite}
        />
      )}
    </div>
  );
}

/* ─── Concept Detail Modal (bottom sheet) ──────────────────────────────────── */
function ConceptModal({ concept, theme: t, isDark, modalIdx, total, onClose, onNext, onPrev, isMobile, speak, isSpeaking, concepts, openModal, isFavorite, toggleFavorite }) {
  const colors   = getSectionColor(concept.s, isDark);
  const lvColor  = getLevelColor(concept.lv);
  const visualSize = isMobile ? 120 : 160;
  const isFav = isFavorite(concept.ku + '_' + concept.s);

  // Close on Escape, navigate with Arrow keys
  useEffect(() => {
    const fn = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose, onPrev, onNext]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        zIndex: 50,
        animation: `fadeIn 0.18s ease-out`,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: t.surface,
          borderRadius: `${SPACING.xl}px ${SPACING.xl}px 0 0`,
          width: '100%', maxWidth: 540,
          maxHeight: '90dvh', overflowY: 'auto',
          animation: 'slideUp 0.22s cubic-bezier(0.22,0.61,0.36,1)',
          boxShadow: '0 -4px 16px rgba(0,0,0,0.15)',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: SPACING.md, paddingBottom: SPACING.xs }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: t.border }} />
        </div>

        {/* Visual hero — subtle gradient using section palette, with corner accent */}
        <div style={{
          position: 'relative',
          background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.accent}18 100%)`,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          height: isMobile ? 160 : 190,
          overflow: 'hidden',
        }}>
          <div aria-hidden="true" style={{
            position: 'absolute', top: -30, right: -30,
            width: 120, height: 120, borderRadius: '50%',
            background: `${colors.accent}14`,
            pointerEvents: 'none',
          }} />
          <div aria-hidden="true" style={{
            position: 'absolute', bottom: -20, left: -20,
            width: 80, height: 80, borderRadius: '50%',
            background: `${colors.accent}10`,
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative' }}>
            {concept.visual
              ? <ConceptVisual visual={concept.visual} theme={t} size={isMobile ? 130 : 160} />
              : <span style={{ fontSize: isMobile ? '3.8rem' : '5.2rem' }}>{SECTIONS[concept.s]?.icon}</span>
            }
          </div>
          {/* Favorite — floating top-right */}
          <button
            onClick={() => toggleFavorite(concept.ku + '_' + concept.s)}
            aria-label={isFav ? 'Ji bijartî derxe' : 'Wek bijartî nîşan bide'}
            style={{
              position: 'absolute', top: 12, right: 12,
              width: 36, height: 36, borderRadius: '50%',
              background: isFav
                ? 'linear-gradient(135deg, #FCD34D, #F59E0B)'
                : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.65)'),
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.1rem', lineHeight: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              boxShadow: isFav
                ? '0 4px 12px rgba(245,158,11,0.35)'
                : '0 2px 6px rgba(0,0,0,0.08)',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <span aria-hidden="true">{isFav ? '⭐' : '☆'}</span>
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: isMobile ? `${SPACING.lg - 2}px ${SPACING.lg}px ${SPACING.xl}px` : `${SPACING.lg}px 22px 28px` }}>

          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: SPACING.lg }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              marginBottom: 5, flexWrap: 'wrap',
            }}>
              <div style={{
                fontSize: concept.ku.length > 25 ? '1.05rem' : concept.ku.length > 18 ? '1.25rem' : isMobile ? '1.55rem' : '1.85rem',
                fontWeight: FONT_WEIGHT.black, color: colors.text, lineHeight: 1.15,
                letterSpacing: '-0.01em',
              }}>
                {concept.ku}
              </div>
              <SpeakButton text={concept.ku} speak={speak} isSpeaking={isSpeaking} theme={t} size={32} />
            </div>

            {/* Syllable display */}
            {SYLLABLES[concept.ku] && (
              <div style={{ fontSize: FONT_SIZE.sm, color: t.textMuted, fontWeight: FONT_WEIGHT.medium, letterSpacing: '0.05em', marginTop: SPACING.xs }}>
                {SYLLABLES[concept.ku]}
              </div>
            )}

            <div style={{ fontSize: '0.95rem', color: t.textSecondary, fontWeight: FONT_WEIGHT.medium, marginTop: 6, marginBottom: 12 }}>
              {concept.tr}{concept.en ? ' · ' + concept.en : ''}
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
              <SectionTag sectionId={concept.s} isDark={isDark} size="sm" />
              <span style={{
                background: `linear-gradient(135deg, ${lvColor}, ${lvColor}CC)`,
                color: '#fff',
                fontSize: '0.72rem', fontWeight: FONT_WEIGHT.extrabold,
                padding: '4px 11px', borderRadius: 99,
                letterSpacing: '0.02em',
                boxShadow: `0 2px 6px ${lvColor}40`,
              }}>
                Asta {concept.lv}
              </span>
            </div>
          </div>

          {/* Penase — section colour, accent left border */}
          {concept.df && (
            <div style={{
              background: colors.bg,
              borderRadius: 14,
              borderLeft: `4px solid ${colors.accent}`,
              padding: '12px 14px 12px 16px',
              marginBottom: 10,
            }}>
              <div style={{
                fontSize: '0.62rem', fontWeight: FONT_WEIGHT.extrabold, color: colors.accent,
                marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <span aria-hidden="true">📖</span> Penase
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <div style={{ fontSize: '0.92rem', color: t.text, lineHeight: 1.65, flex: 1 }}>
                  {concept.df}
                </div>
                <SpeakButton text={concept.df} speak={speak} isSpeaking={isSpeaking} theme={t} size={24} />
              </div>
            </div>
          )}

          {/* Mînak — coral accent (logo coral) */}
          {concept.ex && (
            <div style={{
              background: isDark ? 'rgba(234,88,12,0.08)' : 'rgba(234,88,12,0.05)',
              borderRadius: 14,
              borderLeft: '4px solid #EA580C',
              padding: '12px 14px 12px 16px',
              marginBottom: 18,
            }}>
              <div style={{
                fontSize: '0.62rem', fontWeight: FONT_WEIGHT.extrabold, color: '#EA580C',
                marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <span aria-hidden="true">💬</span> Mînak
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <div style={{ fontSize: '0.92rem', color: t.text, lineHeight: 1.65, fontStyle: 'italic', flex: 1 }}>
                  {concept.ex}
                </div>
                <SpeakButton text={concept.ex} speak={speak} isSpeaking={isSpeaking} theme={t} size={24} />
              </div>
            </div>
          )}

          {/* Related concepts */}
          {RELATED_CONCEPTS[concept.ku] && (
            <div style={{ marginTop: SPACING.lg }}>
              <div style={{ fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: SPACING.sm }}>
                🔗 Têgehên Girêdayî
              </div>
              <div style={{ display: 'flex', gap: SPACING.xs, flexWrap: 'wrap' }}>
                {RELATED_CONCEPTS[concept.ku].map(relKey => {
                  const relConcept = concepts.find(c => c.ku === relKey);
                  if (!relConcept) return null;
                  const relColors = getSectionColor(relConcept.s, isDark);
                  return (
                    <button key={relKey}
                      onClick={() => { openModal(relConcept); }}
                      style={{
                        padding: `${SPACING.xs + 1}px ${SPACING.sm + 2}px`, borderRadius: RADIUS.full,
                        border: `1.5px solid ${relColors.accent}30`,
                        background: relColors.bg,
                        color: relColors.text, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold,
                        cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      {relKey.split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation — circular prev/next + progress bar centre */}
          <div style={{
            display: 'flex', gap: 12, alignItems: 'center',
            marginBottom: SPACING.md, marginTop: SPACING.lg,
          }}>
            <button
              onClick={onPrev} disabled={modalIdx === 0}
              aria-label="Paş"
              style={{
                width: 40, height: 40, borderRadius: '50%',
                border: `1px solid ${t.border}`,
                background: t.surface,
                cursor: modalIdx === 0 ? 'not-allowed' : 'pointer',
                opacity: modalIdx === 0 ? 0.35 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s ease',
                flexShrink: 0,
                WebkitTapHighlightColor: 'transparent',
              }}
              onMouseEnter={e => { if (modalIdx !== 0) e.currentTarget.style.borderColor = colors.accent; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; }}
            >
              <IconArrowLeft size={16} color={modalIdx === 0 ? t.textMuted : t.textSecondary} />
            </button>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{
                height: 4, borderRadius: 99,
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: total > 0 ? ((modalIdx + 1) / total * 100) + '%' : '0%',
                  background: `linear-gradient(90deg, ${colors.accent}, #EA580C)`,
                  transition: 'width 0.25s ease-out',
                }} />
              </div>
              <span style={{
                textAlign: 'center', fontSize: '0.7rem',
                color: t.textMuted, fontWeight: FONT_WEIGHT.semibold,
              }}>
                {modalIdx + 1} / {total}
              </span>
            </div>
            <button
              onClick={onNext} disabled={modalIdx >= total - 1}
              aria-label="Pêş"
              style={{
                width: 40, height: 40, borderRadius: '50%',
                border: `1px solid ${t.border}`,
                background: t.surface,
                cursor: modalIdx >= total - 1 ? 'not-allowed' : 'pointer',
                opacity: modalIdx >= total - 1 ? 0.35 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s ease',
                flexShrink: 0,
                WebkitTapHighlightColor: 'transparent',
              }}
              onMouseEnter={e => { if (modalIdx < total - 1) e.currentTarget.style.borderColor = colors.accent; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; }}
            >
              <IconArrowRight size={16} color={modalIdx >= total - 1 ? t.textMuted : t.textSecondary} />
            </button>
          </div>

          {/* Close — subtle outline rather than full gradient (less visual weight) */}
          <button
            onClick={onClose}
            style={{
              width: '100%', padding: '12px 16px', minHeight: 48,
              borderRadius: 14,
              border: `1.5px solid ${colors.accent}40`,
              background: 'transparent',
              color: colors.text,
              fontFamily: 'inherit', fontSize: '0.9rem',
              fontWeight: FONT_WEIGHT.bold, cursor: 'pointer',
              transition: 'all 0.15s ease',
              WebkitTapHighlightColor: 'transparent',
              letterSpacing: '0.02em',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = colors.bg;
              e.currentTarget.style.borderColor = colors.accent;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = `${colors.accent}40`;
            }}
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
    flex: 1, padding: `11px ${SPACING.md}px`, minHeight: TOUCH_MIN + 4,
    borderRadius: RADIUS.md, border: '1.5px solid ' + t.border,
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
