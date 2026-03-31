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
// Format display text: title case for Kurdish terms, keep Turkish as-is
function formatCardText(text, type) {
  if (type === 'ku') {
    // Convert "KOMIK" → "Komik", "HEJMARA XWEZAYÎ" → "Hejmara Xwezayî"
    return text.split(' ').map(w =>
      w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    ).join(' ');
  }
  return text;
}

export default function MatchingGame({ theme, isDark, concepts, sounds, awardXP }) {
  const t = theme;
  const [gamePhase, setGamePhase] = useState('select'); // select | playing | complete
  const [pairCount, setPairCount] = useState(6);
  const [cards, setCards] = useState([]);
  const [flippedIds, setFlippedIds] = useState([]);
  const [matchedKeys, setMatchedKeys] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  const buildGame = useCallback((pairs) => {
    const selected = shuffle(concepts).slice(0, pairs);
    const gameCards = shuffle([
      ...selected.map((c, i) => ({ id: 'q' + i, key: 'pair' + i, text: c.ku, type: 'ku', concept: c })),
      ...selected.map((c, i) => ({ id: 'a' + i, key: 'pair' + i, text: c.tr, type: 'tr', concept: c })),
    ]);
    setCards(gameCards);
    setFlippedIds([]);
    setMatchedKeys(new Set());
    setMoves(0);
    setIsChecking(false);
    setGamePhase('playing');
  }, [concepts]);

  const handleCardClick = useCallback((card) => {
    if (isChecking || matchedKeys.has(card.key) || flippedIds.includes(card.id)) return;
    const newFlipped = [...flippedIds, card.id];
    setFlippedIds(newFlipped);
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setIsChecking(true);
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);
      if (firstCard.key === secondCard.key) {
        sounds?.match();
        setMatchedKeys(prev => new Set([...prev, firstCard.key]));
        setFlippedIds([]);
        setIsChecking(false);
        if (matchedKeys.size + 1 >= pairCount) {
          awardXP?.('matchComplete', { matchComplete: true });
          setTimeout(() => { sounds?.complete(); setGamePhase('complete'); }, 300);
        }
      } else {
        setTimeout(() => { setFlippedIds([]); setIsChecking(false); }, MATCH_HIDE_DELAY_MS);
      }
    }
  }, [isChecking, matchedKeys, flippedIds, cards, sounds, pairCount]);

  const difficultyOptions = [
    { pairs: 4, label: 'Asan', desc: '4 cot', color: t.success },
    { pairs: 6, label: 'Navîncî', desc: '6 cot', color: t.warning },
    { pairs: 8, label: 'Dijwar', desc: '8 cot', color: t.error },
  ];

  if (gamePhase === 'select') {
    return (
      <div style={{ flex: 1, overflow: 'auto', background: 'transparent', padding: SPACING.xl + 'px ' + SPACING.lg + 'px' }}>
        <div style={{ maxWidth: 400, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #5B21B6, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', marginBottom: SPACING.md, fontSize: '2rem' }}>🧩</div>
          <div style={{ fontSize: '1.4rem', fontWeight: FONT_WEIGHT.extrabold, color: t.text, marginBottom: SPACING.sm }}>Cot Bike</div>
          <div style={{ fontSize: '0.9rem', color: t.textSecondary, marginBottom: SPACING.xl }}>Kurdî û Tirkî cotan bike</div>
          <div style={{ display: 'flex', gap: SPACING.md, marginBottom: SPACING.xl }}>
            {difficultyOptions.map(opt => (
              <button key={opt.pairs} onClick={() => setPairCount(opt.pairs)} style={{
                flex: 1, padding: SPACING.lg + 'px ' + SPACING.sm + 'px', borderRadius: RADIUS.lg, cursor: 'pointer', fontFamily: 'inherit',
                border: '2px solid ' + (pairCount === opt.pairs ? opt.color : t.border),
                background: pairCount === opt.pairs ? opt.color + '15' : t.surface,
                transition: 'all ' + DURATION.fast,
              }}>
                <div style={{ fontSize: '1.2rem', marginBottom: SPACING.xs }}>
                  {opt.pairs === 4 ? '🟢' : opt.pairs === 6 ? '🟡' : '🔴'}
                </div>
                <div style={{ fontWeight: FONT_WEIGHT.bold, color: t.text }}>{opt.label}</div>
                <div style={{ fontSize: FONT_SIZE.sm, color: t.textSecondary }}>{opt.desc}</div>
              </button>
            ))}
          </div>
          <button onClick={() => buildGame(pairCount)} style={{
            width: '100%', padding: SPACING.lg + 'px', borderRadius: RADIUS.xl + 'px', border: 'none',
            background: 'linear-gradient(135deg, #5B21B6, #7C3AED)', color: t.textOnPrimary, fontSize: '1.1rem', fontWeight: FONT_WEIGHT.bold, cursor: 'pointer',
            minHeight: TOUCH_MIN,
          }}>
            Dest pê bike
          </button>
        </div>
      </div>
    );
  }

  if (gamePhase === 'complete') {
    const stars = moves <= pairCount * 2 ? 3 : moves <= pairCount * 3 ? 2 : 1;
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'transparent', padding: SPACING.xl + 'px', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #5B21B6, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', marginBottom: SPACING.lg, fontSize: '2.5rem' }}>🎉</div>
        <div style={{ fontSize: '1.5rem', fontWeight: FONT_WEIGHT.extrabold, color: t.text, marginBottom: SPACING.sm }}>Pîroz be!</div>
        <div style={{ display: 'flex', gap: SPACING.xs, marginBottom: SPACING.lg }}>
          {[1, 2, 3].map(s => <IconStar key={s} size={ICON_SIZE.xl} color="#F59E0B" filled={s <= stars} />)}
        </div>
        <div style={{ color: t.textSecondary, marginBottom: SPACING.xl }}>{moves} gav · {pairCount} cot</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => buildGame(pairCount)} style={{ padding: SPACING.md + 'px ' + SPACING.xl + 'px', borderRadius: RADIUS.xl + 'px', border: '1.5px solid ' + t.border, background: t.surface, color: t.text, fontWeight: FONT_WEIGHT.semibold, cursor: 'pointer', fontFamily: 'inherit', minHeight: TOUCH_MIN }}>
            Dîsa bilîze
          </button>
          <button onClick={() => setGamePhase('select')} style={{ padding: SPACING.md + 'px ' + SPACING.xl + 'px', borderRadius: RADIUS.xl + 'px', border: 'none', background: 'linear-gradient(135deg, #5B21B6, #7C3AED)', color: t.textOnPrimary, fontWeight: FONT_WEIGHT.semibold, cursor: 'pointer', fontFamily: 'inherit', minHeight: TOUCH_MIN }}>
            Asta Biguhêre
          </button>
        </div>
      </div>
    );
  }

  const cols = pairCount <= 4 ? 4 : pairCount <= 6 ? 4 : 4;
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'transparent' }}>
      <div style={{ padding: '10px ' + SPACING.lg + 'px', background: isDark ? 'rgba(26,35,50,0.95)' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', borderBottom: '1px solid ' + (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold, color: t.text }}>Gav: {moves}</span>
        <ProgressBar value={matchedKeys.size} max={pairCount} color={t.success} bgColor={t.border} height={6} />
        <span style={{ fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold, color: t.text }}>{matchedKeys.size}/{pairCount}</span>
      </div>
      <div style={{ flex: 1, padding: SPACING.lg + 'px', display: 'grid', gridTemplateColumns: ('repeat(' + cols + ', 1fr)'), gap: SPACING.sm + 2, alignContent: 'start' }}>
        {cards.map(card => {
          const isFlippedCard = flippedIds.includes(card.id);
          const isMatched = matchedKeys.has(card.key);
          const isVisible = isFlippedCard || isMatched;
          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              style={{
                aspectRatio: '1', borderRadius: RADIUS.lg, cursor: isVisible ? 'default' : 'pointer',
                fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: FONT_WEIGHT.bold, padding: '6px',
                transition: 'all 0.3s',
                background: isMatched ? t.successLight : isFlippedCard ? t.surface : t.primary,
                color: isMatched ? t.success : isFlippedCard ? t.text : t.textOnPrimary,
                border: '2px solid ' + (isMatched ? t.success : isFlippedCard ? t.border : t.primaryLight),
                transform: isFlippedCard ? 'rotateY(0deg)' : isMatched ? 'scale(0.95)' : 'rotateY(0)',
                boxShadow: isMatched ? 'none' : t.cardShadow,
                display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
              }}
            >
              {isVisible ? formatCardText(card.text, card.type) : '?'}
            </button>
          );
        })}
      </div>
    </div>
  );
}
