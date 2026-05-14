import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  ALL_CONCEPTS, SECTIONS,
  PASSING_SCORE, QUIZ_TOTAL_QUESTIONS, FEEDBACK_DELAY_MS,
  FLIP_DURATION_MS, MATCH_HIDE_DELAY_MS, NEXT_CARD_DELAY_MS,
  LEVENSHTEIN_THRESHOLD, MAX_HINT_LEVEL, LEITNER_KNOWN_BOX,
  SCROLL_TOP_THRESHOLD,
  SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, DURATION, ICON_SIZE, TOUCH_MIN,
} from '@data';
import { shuffle, levenshtein, filterConcepts, getLevelColor, getSectionColor } from '@utils/helpers.js';
import { useMediaQuery, useSwipeGesture, useAdaptiveDifficulty, useSpeech } from '@hooks';
import {
  IconSearch, IconX, IconChevronDown, IconChevronRight,
  IconArrowLeft, IconArrowRight, IconArrowUp,
  IconBook, IconCards, IconQuizIcon, IconPuzzle, IconPencil, IconBarChart, IconHome,
  IconCheck, IconVolume, IconVolumeMute, IconLightbulb,
  IconRefresh, IconStar, IconTrophy, IconSun, IconMoon,
} from '@components/icons';
import { Badge, Card, Modal, ToastContainer, EmptyState, SectionTag, ScoreCircle, SpeakButton, PageContainer } from '@components/ui';
import { ConceptVisual } from '@components/visuals';
export default function FlashcardView({ theme, isDark, concepts, progress, setProgress, sounds, awardXP }) {
  const t = theme;
  const { speak, isSpeaking } = useSpeech();
  const [direction, setDirection] = useState('ku-tr');
  const [cardFilter, setCardFilter] = useState('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [deckConcepts, setDeckConcepts] = useState([]);
  const [isComplete, setIsComplete] = useState(false);

  const flashcardBoxes = progress.flashcardBoxes || {};

  const baseDeck = useMemo(() => {
    if (cardFilter === 'all') return concepts;
    if (cardFilter === 'learning') return concepts.filter(c => (flashcardBoxes[c.ku] || 0) === 1);
    if (cardFilter === 'known') return concepts.filter(c => (flashcardBoxes[c.ku] || 0) >= LEITNER_KNOWN_BOX);
    return concepts;
  }, [concepts, cardFilter, flashcardBoxes]);

  useEffect(() => {
    setDeckConcepts(isShuffled ? shuffle(baseDeck) : baseDeck);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [baseDeck, isShuffled]);

  const currentConcept = deckConcepts[currentIndex];

  const getCardText = useCallback((concept, side) => {
    if (!concept) return '';
    const [from, to] = direction.split('-');
    if (side === 'front') return concept[from] || '';
    if (to === 'ku') return concept.ku;
    if (to === 'tr') return concept.tr;
    if (to === 'en') return concept.en;
    return concept[to] || '';
  }, [direction]);

  const handleFlip = useCallback(() => {
    sounds?.flip();
    setIsFlipped(prev => !prev);
  }, [sounds]);

  const handleRate = useCallback((boxValue) => {
    if (!currentConcept) return;
    sounds?.click();
    setProgress(prev => ({
      ...prev,
      flashcardBoxes: { ...((prev || {}).flashcardBoxes || {}), [currentConcept.ku]: boxValue },
    }));
    if (boxValue > 0) {
      awardXP?.('flashcardCorrect', { correct: true, review: true });
    }
    if (boxValue >= LEITNER_KNOWN_BOX) {
      awardXP?.('flashcardKnown', { newConcept: true });
    }
    setIsFlipped(false);
    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex >= deckConcepts.length) setIsComplete(true);
      else setCurrentIndex(nextIndex);
    }, NEXT_CARD_DELAY_MS);
  }, [currentConcept, currentIndex, deckConcepts.length, sounds, setProgress]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) { setCurrentIndex(prev => prev - 1); setIsFlipped(false); }
  }, [currentIndex]);
  const handleNext = useCallback(() => {
    if (currentIndex < deckConcepts.length - 1) { setCurrentIndex(prev => prev + 1); setIsFlipped(false); }
    else setIsComplete(true);
  }, [currentIndex, deckConcepts.length]);

  const { handleTouchStart, handleTouchEnd } = useSwipeGesture(handleNext, handlePrev);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); handleFlip(); }
      else if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleFlip, handlePrev, handleNext]);

  const directionOptions = [
    { value: 'ku-tr', label: 'Kurdî → Tirkî' },
    { value: 'tr-ku', label: 'Tirkî → Kurdî' },
    { value: 'ku-en', label: 'Kurdî → English' },
    { value: 'en-ku', label: 'English → Kurdî' },
  ];

  if (isComplete) {
    sounds?.complete();
    return (
      <PageContainer>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: SPACING.lg }}>🏆</div>
          <div style={{ fontSize: '1.5rem', fontWeight: FONT_WEIGHT.extrabold, color: t.text, marginBottom: SPACING.sm }}>Pîroz be!</div>
          <div style={{ fontSize: FONT_SIZE.md, color: t.textSecondary, marginBottom: SPACING.xl }}>Hemû kart xelas bû!</div>
          <button onClick={() => { setIsComplete(false); setCurrentIndex(0); setIsFlipped(false); }}
            style={{ padding: SPACING.md + 'px ' + 28 + 'px', borderRadius: 12, border: 'none', background: '#0D9488', color: t.textOnPrimary, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold, cursor: 'pointer', minHeight: TOUCH_MIN }}>
            <IconRefresh size={16} /> Ji nû ve dest pê bike
          </button>
        </div>
      </PageContainer>
    );
  }

  if (!currentConcept) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: SPACING.md }}>🃏</div>
          <div style={{ fontSize: '1.2rem', fontWeight: FONT_WEIGHT.bold, color: t.text, marginBottom: SPACING.sm }}>Kart tune</div>
          <div style={{ fontSize: FONT_SIZE.base, color: t.textSecondary, marginBottom: SPACING.xl }}>Bi parzûnê kartên din hilbijêre</div>
          <button onClick={() => { setCardFilter('all'); }}
            style={{ padding: SPACING.md + 'px ' + SPACING.xl + 'px', borderRadius: 12, border: 'none', background: '#0D9488', color: '#fff', fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, cursor: 'pointer', minHeight: TOUCH_MIN }}>
            Hemû kartan nîşan bide
          </button>
        </div>
      </PageContainer>
    );
  }

  const sectionColors = getSectionColor(currentConcept.s, isDark);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'transparent' }}>
      {/* Controls */}
      <div style={{ padding: '10px 16px', background: isDark ? 'rgba(26,35,50,0.95)' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', borderBottom: '1px solid ' + (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)') }}>
        <div style={{ maxWidth: 520, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <select
          value={direction}
          onChange={e => { setDirection(e.target.value); setIsFlipped(false); }}
          aria-label="Direction"
          style={{
            padding: '8px 32px 8px 14px',
            borderRadius: 99,
            border: '1px solid ' + (isDark ? 'rgba(13,148,136,0.30)' : 'rgba(13,148,136,0.20)'),
            background: (isDark ? 'rgba(13,148,136,0.10)' : 'rgba(13,148,136,0.06)') +
              ' url("data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%230D9488%27 stroke-width=%273%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27><polyline points=%276 9 12 15 18 9%27/></svg>") no-repeat right 12px center',
            color: '#0D9488',
            fontSize: FONT_SIZE.sm,
            fontWeight: FONT_WEIGHT.semibold,
            fontFamily: 'inherit',
            cursor: 'pointer',
            outline: 'none',
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
          }}
        >
          {directionOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span style={{
          fontSize: '0.78rem',
          fontWeight: FONT_WEIGHT.bold,
          color: t.textMuted,
          letterSpacing: '0.02em',
          padding: '4px 10px',
          borderRadius: 99,
          background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
        }}>
          {currentIndex + 1} / {deckConcepts.length}
        </span>
        </div>
      </div>

      {/* Card area — vertically centred so the card sits in the middle of the
          viewport rather than hugging the top. overflowY keeps scrolling intact
          if the deck/back text gets long. */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflowY: 'auto', padding: '16px 16px 24px',
        gap: 14,
      }}
        onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {/* 3D flip card */}
        <div
          onClick={handleFlip}
          role="button" aria-label="Kartê bişitilîne"
          tabIndex={0} onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && handleFlip()}
          style={{
            width: '100%', maxWidth: 520, height: 260,
            perspective: '1000px', cursor: 'pointer', flexShrink: 0,
          }}
        >
          <div style={{
            position: 'relative', width: '100%', height: 260,
            transformStyle: 'preserve-3d',
            transition: 'transform ' + FLIP_DURATION_MS + 'ms cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
          }}>
            {/* Front */}
            <div style={{
              position: 'absolute', width: '100%', height: '100%',
              backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
              borderRadius: RADIUS.xl,
              background: sectionColors.bg,
              border: '1px solid ' + sectionColors.accent + '20',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: SPACING.xl + 'px', textAlign: 'center',
              boxShadow: t.cardShadow,
            }}>
              <div style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, color: sectionColors.text, marginBottom: SPACING.lg, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.7 }}>
                {directionOptions.find(d => d.value === direction)?.label.split('→')[0].trim()}
              </div>
              <div style={{ fontSize: getCardText(currentConcept, 'front').length > 25 ? '1.1rem' : getCardText(currentConcept, 'front').length > 18 ? '1.3rem' : '1.75rem', fontWeight: FONT_WEIGHT.extrabold, color: sectionColors.text, lineHeight: 1.3, marginBottom: SPACING.sm }}>
                {getCardText(currentConcept, 'front')}
              </div>
              <div style={{ marginBottom: SPACING.lg }}>
                <SpeakButton text={getCardText(currentConcept, 'front')} speak={speak} isSpeaking={isSpeaking} theme={t} size={28} />
              </div>
              {/* Concept visual on card front */}
              {currentConcept.visual && (
                <div style={{ marginBottom: SPACING.md }}>
                  <ConceptVisual visual={currentConcept.visual} theme={theme} size={80} />
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: 0.6 }}>
                <span style={{ fontSize: FONT_SIZE.md }}>{SECTIONS[currentConcept.s]?.icon}</span>
                <span style={{ fontSize: FONT_SIZE.sm, color: sectionColors.text, fontWeight: FONT_WEIGHT.semibold }}>
                  {SECTIONS[currentConcept.s]?.name.split(' ')[0]}
                </span>
              </div>
              <div style={{
                position: 'absolute', bottom: 10, right: 12,
                fontSize: '0.65rem',
                fontWeight: FONT_WEIGHT.semibold,
                color: sectionColors.text,
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.55)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                padding: '4px 10px',
                borderRadius: 99,
                border: `1px solid ${sectionColors.accent}30`,
                letterSpacing: '0.02em',
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                <span aria-hidden="true">↻</span> Lê bixe
              </div>
            </div>
            {/* Back */}
            <div style={{
              position: 'absolute', width: '100%', height: '100%',
              backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              borderRadius: RADIUS.xl,
              background: t.surface,
              borderTop: '1px solid ' + t.border,
              border: '1px solid ' + t.border,
              display: 'flex', flexDirection: 'column', padding: '20px', textAlign: 'left',
              boxShadow: t.cardShadow, overflowY: 'auto',
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: FONT_WEIGHT.extrabold, color: t.text, marginBottom: SPACING.xs, textAlign: 'center' }}>
                {getCardText(currentConcept, 'back')}
              </div>
              <div style={{ textAlign: 'center', marginBottom: SPACING.md }}>
                <SpeakButton text={getCardText(currentConcept, 'back')} speak={speak} isSpeaking={isSpeaking} theme={t} size={28} />
              </div>
              {currentConcept.df && (
                <div style={{ background: sectionColors.bg, borderRadius: RADIUS.md, padding: SPACING.sm + 'px 10px', marginBottom: SPACING.sm, fontSize: '0.8rem', color: t.text, lineHeight: 1.5 }}>
                  <strong style={{ color: sectionColors.text }}>Penase: </strong>{currentConcept.df}
                </div>
              )}
              {currentConcept.ex && (
                <div style={{ background: t.accentSoft || '#FFF0EC', borderRadius: RADIUS.md, padding: SPACING.sm + 'px 10px', fontSize: '0.8rem', color: t.text, lineHeight: 1.5, fontStyle: 'italic' }}>
                  <strong style={{ color: '#E76F51' }}>Mînak: </strong>{currentConcept.ex}
                </div>
              )}
              <div style={{ display: 'flex', gap: 6, marginTop: 'auto', paddingTop: 10 }}>
                <SectionTag sectionId={currentConcept.s} isDark={isDark} />
                <Badge label={currentConcept.lv} color={getLevelColor(currentConcept.lv)} bgColor={getLevelColor(currentConcept.lv) + '20'} />
              </div>
            </div>
          </div>
        </div>

        {/* Rating buttons (visible after flip) — emoji prefix + dot indicator */}
        {isFlipped && (
          <div style={{
            display: 'flex', gap: 8, width: '100%', maxWidth: 520,
            flexShrink: 0, animation: 'fadeInUp ' + DURATION.normal + ' ease-out',
          }}>
            {[
              { box: 0, label: 'Nizanim',   emoji: '😕', color: t.error,   bg: t.error + '12' },
              { box: 1, label: 'Fêr dibim', emoji: '🤔', color: t.warning, bg: t.warning + '15' },
              { box: 2, label: 'Dizanim',   emoji: '😊', color: t.success, bg: t.success + '12' },
            ].map(btn => (
              <button key={btn.box} onClick={() => handleRate(btn.box)} style={{
                flex: 1, padding: '12px 8px', borderRadius: 14,
                border: '1.5px solid ' + btn.color + '40',
                background: btn.bg,
                color: btn.color, cursor: 'pointer',
                fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: FONT_WEIGHT.extrabold,
                transition: 'all ' + DURATION.fast,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                WebkitTapHighlightColor: 'transparent',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = btn.color + '22'; e.currentTarget.style.borderColor = btn.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = btn.bg; e.currentTarget.style.borderColor = btn.color + '60'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <span aria-hidden="true" style={{ fontSize: '1.1rem', lineHeight: 1 }}>{btn.emoji}</span>
                <span>{btn.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Navigation — circular buttons + slim progress bar between */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          flexShrink: 0, width: '100%', maxWidth: 520,
        }}>
          <button onClick={handlePrev} disabled={currentIndex === 0} aria-label="Berê" style={{
            width: 42, height: 42, borderRadius: '50%',
            border: '1px solid ' + t.border,
            background: t.surface, cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            opacity: currentIndex === 0 ? 0.35 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all ' + DURATION.fast,
            flexShrink: 0,
            boxShadow: isDark ? 'none' : '0 2px 6px rgba(15,76,92,0.06)',
            WebkitTapHighlightColor: 'transparent',
          }}
          onMouseEnter={e => { if (currentIndex !== 0) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.borderColor = '#0D9488'; } }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = t.border; }}
          >
            <IconArrowLeft size={18} color={t.text} />
          </button>

          {/* Slim deck-progress bar */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{
              height: 4, borderRadius: 99,
              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: ((currentIndex + 1) / deckConcepts.length * 100) + '%',
                background: 'linear-gradient(90deg, #0D9488, #EA580C)',
                borderRadius: 99,
                transition: 'width 0.3s ease-out',
              }} />
            </div>
            <span style={{
              textAlign: 'center', fontSize: '0.72rem',
              fontWeight: FONT_WEIGHT.semibold, color: t.textMuted,
              letterSpacing: '0.02em',
            }}>
              {currentIndex + 1} / {deckConcepts.length}
            </span>
          </div>

          <button onClick={handleNext} disabled={currentIndex >= deckConcepts.length - 1} aria-label="Pêş" style={{
            width: 42, height: 42, borderRadius: '50%',
            border: '1px solid ' + t.border,
            background: t.surface, cursor: currentIndex >= deckConcepts.length - 1 ? 'not-allowed' : 'pointer',
            opacity: currentIndex >= deckConcepts.length - 1 ? 0.35 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all ' + DURATION.fast,
            flexShrink: 0,
            boxShadow: isDark ? 'none' : '0 2px 6px rgba(15,76,92,0.06)',
            WebkitTapHighlightColor: 'transparent',
          }}
          onMouseEnter={e => { if (currentIndex < deckConcepts.length - 1) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.borderColor = '#0D9488'; } }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = t.border; }}
          >
            <IconArrowRight size={18} color={t.text} />
          </button>
        </div>
      </div>
    </div>
  );
}
