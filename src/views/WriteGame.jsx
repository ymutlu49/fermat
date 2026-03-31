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
        {/* Direction selector */}
        <div style={{ display: 'flex', gap: SPACING.sm, marginBottom: SPACING.lg, justifyContent: 'center' }}>
          {[
            { value: 'ku-tr', label: 'Kurdî → Tirkî' },
            { value: 'ku-en', label: 'Kurdî → English' },
            { value: 'tr-ku', label: 'Tirkî → Kurdî' },
          ].map(opt => (
            <Pill key={opt.value} label={opt.label} isActive={direction === opt.value} color={t.primary} onClick={() => setDirection(opt.value)} />
          ))}
        </div>

        {/* Score */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: SPACING.md, alignItems: 'center' }}>
          <ProgressBar value={score.correct} max={Math.max(score.total, 1)} color={t.success} bgColor={t.border} height={6} />
          <span style={{ fontSize: '0.8rem', fontWeight: FONT_WEIGHT.bold, color: t.text, marginLeft: 10, whiteSpace: 'nowrap' }}>
            &#10003; {score.correct} / {score.total}
          </span>
        </div>

        {/* Question card */}
        <div style={{ background: sectionColors.bg, borderRadius: RADIUS.xl + 'px', padding: SPACING.xl, textAlign: 'center', marginBottom: SPACING.lg, border: '2px solid ' + sectionColors.accent + '30' }}>
          <div style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, color: sectionColors.text, marginBottom: SPACING.md, textTransform: 'uppercase', letterSpacing: '0.04em', opacity: 0.7 }}>
            {direction === 'ku-tr' ? 'Bi Tirkî çawa tê gotin?' : direction === 'ku-en' ? 'Bi Îngilîzî çawa tê gotin?' : 'Bi Kurdî çawa tê gotin?'}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: FONT_WEIGHT.extrabold, color: sectionColors.text }}>
            {getQuestion(currentConcept)}
          </div>
        </div>

        {/* Input */}
        <div style={{ marginBottom: SPACING.md }}>
          <input
            ref={inputRef}
            value={inputValue}
            onChange={e => { setInputValue(e.target.value); setFeedback(null); }}
            onKeyDown={e => { if (e.key === 'Enter') feedback ? handleNext() : handleSubmit(); }}
            placeholder="Bersiva xwe binivîse..."
            aria-label="Bersiv"
            disabled={feedback === 'correct'}
            style={{
              width: '100%', padding: '14px 16px', borderRadius: RADIUS.xl + 'px', boxSizing: 'border-box',
              border: '2px solid ' + (feedback === 'correct' ? t.success : feedback === 'wrong' ? t.error : feedback === 'near' ? t.warning : t.border),
              background: t.surface, color: t.text, fontSize: '1.1rem',
              fontFamily: 'inherit', outline: 'none', transition: 'border-color ' + DURATION.normal,
            }}
          />
        </div>

        {/* Hint */}
        {hintLevel > 0 && (
          <div style={{ fontSize: FONT_SIZE.base, color: t.textMuted, marginBottom: SPACING.sm, textAlign: 'center', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
            &#128161; {getHint()}
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div style={{
            padding: `${SPACING.md}px ${SPACING.lg}px`, borderRadius: RADIUS.xl + 'px', marginBottom: SPACING.md,
            background: feedback === 'correct' ? t.successLight : feedback === 'near' ? t.warningLight : t.errorLight,
            color: feedback === 'correct' ? t.success : feedback === 'near' ? '#92400E' : t.error,
            fontWeight: FONT_WEIGHT.semibold, animation: 'fadeInUp ' + DURATION.normal + ' ease-out',
          }}>
            {feedback === 'correct' && '✅ Aferîn! Rast e!'}
            {feedback === 'near' && '🤏 Hema hema rast! Bersiva rast: ' + getCorrectAnswer(currentConcept)}
            {feedback === 'wrong' && '❌ Xelet. Bersiva rast: ' + getCorrectAnswer(currentConcept)}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          {!feedback && (
            <button onClick={() => setHintLevel(h => Math.min(h + 1, MAX_HINT_LEVEL))} style={{
              padding: `${SPACING.md}px ${SPACING.lg}px`, borderRadius: RADIUS.xl + 'px', border: '1.5px solid ' + t.border,
              background: t.surface, color: t.textSecondary, cursor: 'pointer', fontFamily: 'inherit', fontWeight: FONT_WEIGHT.semibold, fontSize: FONT_SIZE.base,
              minHeight: TOUCH_MIN,
            }}>
              <IconLightbulb size={ICON_SIZE.sm} /> Alîkarî
            </button>
          )}
          <button
            onClick={feedback ? handleNext : handleSubmit}
            style={{
              flex: 1, padding: '14px', borderRadius: RADIUS.xl + 'px', border: 'none',
              background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)', color: t.textOnPrimary,
              fontFamily: 'inherit', fontWeight: FONT_WEIGHT.bold, fontSize: FONT_SIZE.md, cursor: 'pointer',
              minHeight: TOUCH_MIN,
            }}
          >
            {feedback ? 'Pêş' : 'Bersiv bide'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 10, fontSize: '0.8rem', color: t.textMuted }}>
          {deckIndex + 1} / {deck.length}
        </div>
      </div>
    </div>
  );
}
