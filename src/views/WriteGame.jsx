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
import { useMediaQuery, useSwipeGesture, useAdaptiveDifficulty } from '@hooks';
import {
  IconSearch, IconX, IconChevronDown, IconChevronRight,
  IconArrowLeft, IconArrowRight, IconArrowUp,
  IconBook, IconCards, IconQuizIcon, IconPuzzle, IconPencil, IconBarChart, IconHome,
  IconCheck, IconVolume, IconVolumeMute, IconShuffle, IconLightbulb,
  IconRefresh, IconStar, IconTrophy, IconSun, IconMoon,
} from '@components/icons';
import { Pill, Badge, Card, ProgressBar, Modal, ToastContainer, EmptyState, SectionTag, ScoreCircle } from '@components/ui';
import { ConceptVisual } from '@components/visuals';
export default function WriteGame({ theme, isDark, concepts, sounds, awardXP }) {
  const t = theme;
  const [direction, setDirection] = useState('ku-tr');
  const [currentConcept, setCurrentConcept] = useState(null);
  const [deck, setDeck] = useState([]);
  const [deckIndex, setDeckIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'near' | 'wrong'
  const [hintLevel, setHintLevel] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const inputRef = useRef(null);

  const buildDeck = useCallback(() => {
    const newDeck = shuffle(concepts).slice(0, 20);
    setDeck(newDeck);
    setDeckIndex(0);
    setCurrentConcept(newDeck[0] || null);
    setInputValue('');
    setFeedback(null);
    setHintLevel(0);
    setScore({ correct: 0, total: 0 });
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [concepts]);

  useEffect(() => { buildDeck(); }, [direction]);

  const getCorrectAnswer = useCallback((concept) => {
    if (!concept) return '';
    const [from, to] = direction.split('-');
    return concept[to] || concept.ku;
  }, [direction]);

  const getQuestion = useCallback((concept) => {
    if (!concept) return '';
    const [from] = direction.split('-');
    return concept[from] || concept.ku;
  }, [direction]);

  const handleSubmit = useCallback(() => {
    if (!currentConcept || !inputValue.trim()) return;
    const correct = getCorrectAnswer(currentConcept);
    const distance = levenshtein(inputValue.trim(), correct);
    let newFeedback;
    if (distance === 0) { sounds?.correct(); newFeedback = 'correct'; setScore(p => ({ correct: p.correct + 1, total: p.total + 1 })); awardXP?.('writeCorrect', { writeCorrect: true, correct: true }); }
    else if (distance <= LEVENSHTEIN_THRESHOLD) { sounds?.hint(); newFeedback = 'near'; setScore(p => ({ ...p, total: p.total + 1 })); }
    else { sounds?.wrong(); newFeedback = 'wrong'; setHintLevel(h => Math.min(h + 1, MAX_HINT_LEVEL)); }
    setFeedback(newFeedback);
  }, [currentConcept, inputValue, getCorrectAnswer, sounds]);

  const handleNext = useCallback(() => {
    const nextIndex = deckIndex + 1;
    if (nextIndex >= deck.length) { buildDeck(); return; }
    setDeckIndex(nextIndex);
    setCurrentConcept(deck[nextIndex]);
    setInputValue('');
    setFeedback(null);
    setHintLevel(0);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [deckIndex, deck, buildDeck]);

  const getHint = useCallback(() => {
    if (!currentConcept) return '';
    const answer = getCorrectAnswer(currentConcept);
    const revealCount = Math.min(hintLevel, answer.length - 1);
    return answer.substring(0, revealCount) + '_'.repeat(answer.length - revealCount);
  }, [currentConcept, hintLevel, getCorrectAnswer]);

  if (!currentConcept) return null;
  const sectionColors = getSectionColor(currentConcept.s, isDark);

  return (
    <div style={{ flex: 1, overflow: 'auto', background: 'transparent', padding: SPACING.lg }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        {/* Direction selector — logo-tinted pills */}
        <div style={{ display: 'flex', gap: 8, marginBottom: SPACING.lg, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { value: 'ku-tr', label: 'Kurdî → Tirkî' },
            { value: 'ku-en', label: 'Kurdî → English' },
            { value: 'tr-ku', label: 'Tirkî → Kurdî' },
          ].map(opt => (
            <Pill
              key={opt.value}
              label={opt.label}
              isActive={direction === opt.value}
              color="#0D9488"
              isDark={isDark}
              onClick={() => setDirection(opt.value)}
            />
          ))}
        </div>

        {/* Score + progress — gradient bar like FlashcardView */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: SPACING.lg }}>
          <div style={{
            height: 5, borderRadius: 99,
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: (score.total > 0 ? (score.correct / score.total * 100) : 0) + '%',
              background: 'linear-gradient(90deg, #15803D, #0D9488)',
              borderRadius: 99,
              transition: 'width 0.3s ease-out',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{
              fontSize: '0.7rem', fontWeight: FONT_WEIGHT.semibold, color: t.textMuted,
              padding: '2px 8px', borderRadius: 99,
              background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            }}>
              {deckIndex + 1} / {deck.length}
            </span>
            <span style={{
              fontSize: '0.7rem', fontWeight: FONT_WEIGHT.extrabold, color: '#15803D',
              padding: '2px 10px', borderRadius: 99,
              background: isDark ? 'rgba(21,128,61,0.18)' : 'rgba(21,128,61,0.10)',
            }}>
              ✓ {score.correct} / {score.total}
            </span>
          </div>
        </div>

        {/* Question card — section gradient + corner blob (QuizGame parity) */}
        <div style={{
          position: 'relative',
          background: `linear-gradient(135deg, ${sectionColors.bg} 0%, ${sectionColors.accent}18 100%)`,
          borderRadius: 18,
          padding: '22px 20px',
          textAlign: 'center',
          marginBottom: SPACING.lg,
          border: `1px solid ${sectionColors.accent}25`,
          overflow: 'hidden',
        }}>
          <div aria-hidden="true" style={{
            position: 'absolute', top: -30, right: -30,
            width: 110, height: 110, borderRadius: '50%',
            background: `${sectionColors.accent}10`,
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'relative',
            fontSize: '0.62rem', fontWeight: FONT_WEIGHT.extrabold, color: sectionColors.accent,
            marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.10em',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          }}>
            <span aria-hidden="true">✏️</span>{' '}
            {direction === 'ku-tr' ? 'Bi Tirkî çawa tê gotin?'
              : direction === 'ku-en' ? 'Bi Îngilîzî çawa tê gotin?'
              : 'Bi Kurdî çawa tê gotin?'}
          </div>
          <div style={{
            position: 'relative',
            fontSize: getQuestion(currentConcept).length > 20 ? '1.4rem' : '1.85rem',
            fontWeight: FONT_WEIGHT.black, color: sectionColors.text,
            letterSpacing: '-0.01em', lineHeight: 1.2,
          }}>
            {getQuestion(currentConcept)}
          </div>
        </div>

        {/* Input — teal focus ring, state-aware border */}
        <div style={{ marginBottom: SPACING.md }}>
          <input
            ref={inputRef}
            value={inputValue}
            onChange={e => { setInputValue(e.target.value); setFeedback(null); }}
            onKeyDown={e => { if (e.key === 'Enter') feedback ? handleNext() : handleSubmit(); }}
            placeholder="Bersiva xwe binivîse…"
            aria-label="Bersiv"
            disabled={feedback === 'correct'}
            style={{
              width: '100%', padding: '14px 16px', borderRadius: 14, boxSizing: 'border-box',
              border: '1.5px solid ' + (
                feedback === 'correct' ? '#15803D'
                  : feedback === 'wrong' ? t.error
                  : feedback === 'near' ? t.warning
                  : isDark ? 'rgba(13,148,136,0.30)' : 'rgba(13,148,136,0.22)'
              ),
              background: feedback === 'correct'
                ? (isDark ? 'rgba(21,128,61,0.10)' : 'rgba(21,128,61,0.04)')
                : t.surface,
              color: t.text, fontSize: '1.05rem',
              fontFamily: 'inherit', outline: 'none',
              transition: 'border-color ' + DURATION.normal + ', background ' + DURATION.normal,
              fontWeight: FONT_WEIGHT.semibold,
            }}
            onFocus={e => { if (!feedback) e.currentTarget.style.borderColor = '#0D9488'; }}
            onBlur={e => { if (!feedback) e.currentTarget.style.borderColor = isDark ? 'rgba(13,148,136,0.30)' : 'rgba(13,148,136,0.22)'; }}
          />
        </div>

        {/* Hint — soft amber rozet */}
        {hintLevel > 0 && (
          <div style={{
            fontSize: '0.95rem', color: '#92400E',
            marginBottom: SPACING.sm, textAlign: 'center',
            fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
            letterSpacing: '0.18em',
            padding: '10px 14px',
            borderRadius: 12,
            background: isDark ? 'rgba(252,211,77,0.12)' : 'rgba(252,211,77,0.18)',
            border: '1px solid rgba(252,211,77,0.30)',
            fontWeight: FONT_WEIGHT.bold,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <span aria-hidden="true">💡</span> {getHint()}
          </div>
        )}

        {/* Feedback — emoji + tinted */}
        {feedback && (
          <div style={{
            padding: '12px 14px', borderRadius: 14,
            marginBottom: SPACING.md,
            background: feedback === 'correct'
              ? (isDark ? 'rgba(21,128,61,0.15)' : 'rgba(21,128,61,0.08)')
              : feedback === 'near'
                ? (isDark ? 'rgba(245,158,11,0.18)' : 'rgba(245,158,11,0.10)')
                : (isDark ? 'rgba(230,57,70,0.15)' : 'rgba(230,57,70,0.08)'),
            border: `1.5px solid ${feedback === 'correct' ? '#15803D' : feedback === 'near' ? '#F59E0B' : t.error}40`,
            color: feedback === 'correct'
              ? (isDark ? '#86EFAC' : '#15803D')
              : feedback === 'near' ? '#92400E'
              : (isDark ? '#FCA5A5' : t.error),
            fontWeight: FONT_WEIGHT.semibold,
            animation: 'fadeInUp ' + DURATION.normal + ' ease-out',
            display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem',
          }}>
            <span aria-hidden="true" style={{ fontSize: '1.2rem', lineHeight: 1 }}>
              {feedback === 'correct' ? '🎉' : feedback === 'near' ? '🤏' : '💭'}
            </span>
            <span style={{ flex: 1 }}>
              {feedback === 'correct' && 'Aferîn! Bersiv rast e.'}
              {feedback === 'near' && 'Hema hema rast! Bersiva rast: ' + getCorrectAnswer(currentConcept)}
              {feedback === 'wrong' && 'Bersiva rast: ' + getCorrectAnswer(currentConcept)}
            </span>
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          {!feedback && (
            <button
              onClick={() => setHintLevel(h => Math.min(h + 1, MAX_HINT_LEVEL))}
              aria-label="Alîkarî"
              style={{
                padding: '12px 16px', borderRadius: 14,
                border: `1.5px solid ${t.border}`,
                background: t.surface, color: t.textSecondary,
                cursor: 'pointer', fontFamily: 'inherit',
                fontWeight: FONT_WEIGHT.semibold, fontSize: FONT_SIZE.sm,
                minHeight: TOUCH_MIN,
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.15s ease',
                WebkitTapHighlightColor: 'transparent',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#F59E0B'; e.currentTarget.style.color = '#92400E'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textSecondary; }}
            >
              <IconLightbulb size={16} /> Alîkarî
            </button>
          )}
          <button
            onClick={feedback ? handleNext : handleSubmit}
            style={{
              flex: 1, padding: '14px', borderRadius: 14, border: 'none',
              background: feedback === 'correct'
                ? 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)'
                : 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
              color: '#fff',
              fontFamily: 'inherit', fontWeight: FONT_WEIGHT.extrabold, fontSize: FONT_SIZE.md,
              cursor: 'pointer',
              minHeight: TOUCH_MIN + 4,
              boxShadow: feedback === 'correct'
                ? '0 6px 14px rgba(13,148,136,0.30)'
                : '0 6px 14px rgba(234,88,12,0.28)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              WebkitTapHighlightColor: 'transparent',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {feedback ? 'Pêş →' : 'Bersiv bide'}
          </button>
        </div>
      </div>
    </div>
  );
}
