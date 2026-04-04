import { useState, useCallback } from 'react';
import {
  SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, DURATION, TOUCH_MIN,
  MATCH_HIDE_DELAY_MS, ICON_SIZE,
} from '@data';
import { shuffle } from '@utils/helpers.js';
import { IconStar } from '@components/icons';
import { ProgressBar, PageContainer } from '@components/ui';

// Format display text: title case for Kurdish terms
function formatCardText(text, type) {
  if (type === 'ku') {
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
    // Filter out concepts with duplicate ku or tr values to avoid matching confusion
    const seenKu = new Set();
    const seenTr = new Set();
    const uniqueConcepts = concepts.filter(c => {
      const kuLower = c.ku.toLowerCase();
      const trLower = c.tr.toLowerCase();
      if (seenKu.has(kuLower) || seenTr.has(trLower)) return false;
      seenKu.add(kuLower);
      seenTr.add(trLower);
      return true;
    });

    const selected = shuffle(uniqueConcepts).slice(0, pairs);
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
      if (firstCard.key === secondCard.key && firstCard.type !== secondCard.type) {
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

  // ── Select phase ──
  if (gamePhase === 'select') {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #0D9488, #14B8A6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto', marginBottom: SPACING.md, fontSize: '2rem',
          }}>
            🧩
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: FONT_WEIGHT.extrabold, color: t.text, marginBottom: SPACING.sm }}>
            Cot Bîne
          </div>
          <div style={{ fontSize: '0.9rem', color: t.textSecondary, marginBottom: SPACING.xl }}>
            Kurdî û Tirkî cotan bîne
          </div>

          <div style={{ display: 'flex', gap: SPACING.md, marginBottom: SPACING.xl }}>
            {difficultyOptions.map(opt => (
              <button key={opt.pairs} onClick={() => setPairCount(opt.pairs)} style={{
                flex: 1, padding: SPACING.lg + 'px ' + SPACING.sm + 'px',
                borderRadius: RADIUS.lg, cursor: 'pointer', fontFamily: 'inherit',
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
            width: '100%', padding: SPACING.lg + 'px', borderRadius: 12, border: 'none',
            background: '#0D9488', color: t.textOnPrimary,
            fontSize: '1.1rem', fontWeight: FONT_WEIGHT.bold, cursor: 'pointer',
            minHeight: TOUCH_MIN,
          }}>
            Dest pê bike
          </button>
        </div>
      </PageContainer>
    );
  }

  // ── Complete phase ──
  if (gamePhase === 'complete') {
    const stars = moves <= pairCount * 2 ? 3 : moves <= pairCount * 3 ? 2 : 1;
    return (
      <PageContainer>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, #0D9488, #14B8A6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto', marginBottom: SPACING.lg, fontSize: '2.5rem',
          }}>
            🎉
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: FONT_WEIGHT.extrabold, color: t.text, marginBottom: SPACING.sm }}>
            Pîroz be!
          </div>
          <div style={{ display: 'flex', gap: SPACING.xs, justifyContent: 'center', marginBottom: SPACING.lg }}>
            {[1, 2, 3].map(s => <IconStar key={s} size={ICON_SIZE.xl} color="#F59E0B" filled={s <= stars} />)}
          </div>
          <div style={{ color: t.textSecondary, marginBottom: SPACING.xl }}>{moves} gav · {pairCount} cot</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => buildGame(pairCount)} style={{
              flex: 1, padding: '14px', borderRadius: 12,
              border: '1px solid ' + t.border, background: t.surface,
              color: t.text, fontSize: '0.95rem', fontWeight: FONT_WEIGHT.semibold,
              cursor: 'pointer', fontFamily: 'inherit', minHeight: TOUCH_MIN,
            }}>
              Dîsa bilîze
            </button>
            <button onClick={() => setGamePhase('select')} style={{
              flex: 1, padding: '14px', borderRadius: 12, border: 'none',
              background: '#0D9488', color: t.textOnPrimary,
              fontSize: '0.95rem', fontWeight: FONT_WEIGHT.semibold,
              cursor: 'pointer', fontFamily: 'inherit', minHeight: TOUCH_MIN,
            }}>
              Asta Biguhêre
            </button>
          </div>
        </div>
      </PageContainer>
    );
  }

  // ── Playing phase ──
  const cols = 4;
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'transparent' }}>
      {/* Header */}
      <div style={{
        padding: `${SPACING.md}px 16px`,
        background: isDark ? 'rgba(26,35,50,0.95)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        borderBottom: '1px solid ' + (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'),
      }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm }}>
            <span style={{ fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold, color: t.text }}>
              Gav: {moves}
            </span>
            <span style={{ fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold, color: t.text }}>
              {matchedKeys.size}/{pairCount}
            </span>
          </div>
          <ProgressBar value={matchedKeys.size} max={pairCount} color={t.success} bgColor={t.border} height={6} />
        </div>
      </div>

      {/* Card grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          {/* Legend */}
          <div style={{
            display: 'flex', gap: SPACING.md, justifyContent: 'center',
            marginBottom: SPACING.md,
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: FONT_SIZE.xs, color: t.textMuted }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#0D9488' }} /> Kurdî
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: FONT_SIZE.xs, color: t.textMuted }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#EA580C' }} /> Tirkî
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(' + cols + ', 1fr)',
            gap: SPACING.sm + 2,
          }}>
            {cards.map(card => {
              const isFlippedCard = flippedIds.includes(card.id);
              const isMatched = matchedKeys.has(card.key);
              const isVisible = isFlippedCard || isMatched;
              const isKu = card.type === 'ku';

              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  style={{
                    minHeight: 72,
                    borderRadius: RADIUS.lg,
                    cursor: isVisible ? 'default' : 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '0.75rem',
                    fontWeight: FONT_WEIGHT.bold,
                    padding: '6px',
                    transition: 'all 0.3s',
                    background: isMatched
                      ? t.successLight
                      : isFlippedCard
                        ? (isKu ? (isDark ? 'rgba(13,148,136,0.15)' : 'rgba(13,148,136,0.08)') : (isDark ? 'rgba(234,88,12,0.15)' : 'rgba(234,88,12,0.08)'))
                        : t.primary,
                    color: isMatched
                      ? t.success
                      : isFlippedCard
                        ? t.text
                        : t.textOnPrimary,
                    border: '2px solid ' + (
                      isMatched ? t.success
                        : isFlippedCard ? (isKu ? '#0D9488' : '#EA580C')
                        : t.primaryLight
                    ),
                    transform: isMatched ? 'scale(0.95)' : 'none',
                    boxShadow: isMatched ? 'none' : t.cardShadow,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    gap: 4,
                  }}
                >
                  {isVisible ? (
                    <>
                      <span style={{
                        fontSize: '0.58rem',
                        fontWeight: FONT_WEIGHT.extrabold,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: isMatched ? t.success : (isKu ? '#0D9488' : '#EA580C'),
                        opacity: 0.8,
                      }}>
                        {isKu ? 'KU' : 'TR'}
                      </span>
                      <span>{formatCardText(card.text, card.type)}</span>
                    </>
                  ) : '?'}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
