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

        {/* Section filter pills */}
        <div style={{
          display: 'flex', gap: 5,
          overflowX: 'auto', paddingBottom: 2,
          scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
        }}>
          <Pill label="Hemû" isActive={activeSectionId === null} color={t.primary} onClick={() => setActiveSectionId(null)} />
          {Object.entries(SECTIONS).map(([id, sec]) => (
            <Pill
              key={id}
              isActive={activeSectionId === parseInt(id)}
              color={t.primary}
              onClick={() => setActiveSectionId(parseInt(id))}
            >
              {sec.short}
            </Pill>
          ))}
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

        {/* Visual hero */}
        <div style={{
          background: colors.bg,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          padding: isMobile ? `${SPACING.lg}px ${SPACING.lg}px ${SPACING.md}px` : `20px 20px ${SPACING.lg}px`,
        }}>
          {concept.visual
            ? <ConceptVisual visual={concept.visual} theme={t} size={visualSize} />
            : <span style={{ fontSize: isMobile ? '3.5rem' : '5rem' }}>{SECTIONS[concept.s]?.icon}</span>
          }
        </div>

        {/* Content */}
        <div style={{ padding: isMobile ? `${SPACING.lg - 2}px ${SPACING.lg}px ${SPACING.xl}px` : `${SPACING.lg}px 22px 28px` }}>

          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: SPACING.lg }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              marginBottom: 5,
            }}>
              <div style={{
                fontSize: isMobile ? '1.5rem' : '1.8rem',
                fontWeight: FONT_WEIGHT.black, color: colors.text, lineHeight: 1.15,
              }}>
                {concept.ku}
              </div>
              <SpeakButton text={concept.ku} speak={speak} isSpeaking={isSpeaking} theme={t} size={32} />
              <span
                role="button" tabIndex={0}
                onClick={() => toggleFavorite(concept.ku + '_' + concept.s)}
                style={{ cursor: 'pointer', fontSize: '1.2rem', opacity: isFav ? 1 : 0.3 }}
              >
                {isFav ? '⭐' : '☆'}
              </span>
            </div>

            {/* Syllable display */}
            {SYLLABLES[concept.ku] && (
              <div style={{ fontSize: FONT_SIZE.sm, color: t.textMuted, fontWeight: FONT_WEIGHT.medium, letterSpacing: '0.05em', marginTop: SPACING.xs }}>
                {SYLLABLES[concept.ku]}
              </div>
            )}

            <div style={{ fontSize: '0.92rem', color: t.textSecondary, fontWeight: FONT_WEIGHT.medium, marginBottom: 10 }}>
              {concept.tr}{concept.en ? ' · ' + concept.en : ''}
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
              <SectionTag sectionId={concept.s} isDark={isDark} size="sm" />
              <span style={{
                background: lvColor, color: '#fff',
                fontSize: '0.72rem', fontWeight: FONT_WEIGHT.extrabold,
                padding: '3px 10px', borderRadius: 10,
              }}>
                {concept.lv}
              </span>
            </div>
          </div>

          {/* Penase */}
          {concept.df && (
            <div style={{
              background: colors.bg, borderRadius: RADIUS.lg,
              padding: `${SPACING.md}px ${SPACING.lg - 2}px`, marginBottom: 10,
            }}>
              <div style={{
                fontSize: '0.68rem', fontWeight: FONT_WEIGHT.extrabold, color: colors.accent,
                marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                PENASE
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: '0.9rem', color: t.text, lineHeight: 1.65, flex: 1 }}>
                  {concept.df}
                </div>
                <SpeakButton text={concept.df} speak={speak} isSpeaking={isSpeaking} theme={t} size={24} />
              </div>
            </div>
          )}

          {/* Mînak */}
          {concept.ex && (
            <div style={{
              background: isDark ? '#2A1F14' : '#FFF7ED',
              borderRadius: RADIUS.lg, padding: `${SPACING.md}px ${SPACING.lg - 2}px`, marginBottom: 18,
            }}>
              <div style={{
                fontSize: '0.68rem', fontWeight: FONT_WEIGHT.extrabold, color: '#F97316',
                marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                MÎNAK
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: '0.9rem', color: t.text, lineHeight: 1.65, fontStyle: 'italic', flex: 1 }}>
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

          {/* Navigation */}
          <div style={{ display: 'flex', gap: SPACING.sm, alignItems: 'center', marginBottom: SPACING.md, marginTop: SPACING.lg }}>
            <button
              onClick={onPrev} disabled={modalIdx === 0}
              style={navBtnStyle(t, modalIdx === 0)}
            >
              <IconArrowLeft size={ICON_SIZE.sm} color={modalIdx === 0 ? t.textMuted : t.textSecondary} />
              <span>Paş</span>
            </button>
            <div style={{
              flex: 0.7, textAlign: 'center',
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
              width: '100%', padding: `${SPACING.lg - 2}px`, minHeight: 52,
              borderRadius: RADIUS.lg, border: 'none',
              background: `linear-gradient(135deg, ${colors.accent}, ${colors.icon || colors.accent})`,
              color: '#fff',
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
