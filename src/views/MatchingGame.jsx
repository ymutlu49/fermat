// ─── FerMat — Cot Bîne (matching game) ─────────────────────────────────────
// Logo palette: teal #0D9488 · coral #EA580C · green #15803D · dark #0F4C5C
import { useState, useCallback } from 'react';
import {
  SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, DURATION, TOUCH_MIN,
  MATCH_HIDE_DELAY_MS, ICON_SIZE,
} from '@data';
import { shuffle } from '@utils/helpers.js';
import { IconStar } from '@components/icons';
import { PageContainer } from '@components/ui';

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
  const [gamePhase, setGamePhase] = useState('select');
  const [pairCount, setPairCount] = useState(6);
  const [cards, setCards] = useState([]);
  const [flippedIds, setFlippedIds] = useState([]);
  const [matchedKeys, setMatchedKeys] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  const buildGame = useCallback((pairs) => {
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
    { pairs: 4, label: 'Asan',    desc: '4 cot', tint: '#15803D', rgb: '21,128,61' },
    { pairs: 6, label: 'Navîncî', desc: '6 cot', tint: '#0D9488', rgb: '13,148,136' },
    { pairs: 8, label: 'Dijwar',  desc: '8 cot', tint: '#EA580C', rgb: '234,88,12' },
  ];

  // ── Select phase ──
  if (gamePhase === 'select') {
    return (
      <PageContainer>
        <div style={{
          fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold,
          color: t.textMuted, textTransform: 'uppercase',
          letterSpacing: '0.06em', marginBottom: 10,
        }}>
          Cot Bîne
        </div>

        {/* Hero header — gradient like HomeView */}
        <div style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(13,148,136,0.22) 0%, rgba(13,148,136,0.08) 100%)'
            : 'linear-gradient(135deg, rgba(13,148,136,0.10) 0%, rgba(13,148,136,0.04) 100%)',
          border: `1px solid ${isDark ? 'rgba(13,148,136,0.30)' : 'rgba(13,148,136,0.18)'}`,
          borderRadius: 16,
          padding: '16px',
          display: 'flex', alignItems: 'center', gap: 12,
          marginBottom: SPACING.lg,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'rgba(13,148,136,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, fontSize: '1.4rem',
          }} aria-hidden="true">
            🧩
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.extrabold, color: t.text }}>
              Kurdî û Tirkî cotan bîne
            </div>
            <div style={{ fontSize: FONT_SIZE.xs, color: t.textMuted, marginTop: 2 }}>
              Astekê hilbijêre û dest pê bike
            </div>
          </div>
        </div>

        {/* Difficulty cards — same tinted card pattern */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8, marginBottom: SPACING.lg,
        }}>
          {difficultyOptions.map(opt => {
            const isSel = pairCount === opt.pairs;
            return (
              <button key={opt.pairs} onClick={() => setPairCount(opt.pairs)} style={{
                padding: '14px 8px',
                borderRadius: 14,
                cursor: 'pointer',
                fontFamily: 'inherit',
                background: isSel
                  ? (isDark
                      ? `linear-gradient(135deg, rgba(${opt.rgb},0.30) 0%, rgba(${opt.rgb},0.12) 100%)`
                      : `linear-gradient(135deg, rgba(${opt.rgb},0.14) 0%, rgba(${opt.rgb},0.06) 100%)`)
                  : t.surface,
                border: `1.5px solid ${isSel ? opt.tint : t.border}`,
                transition: 'all 0.15s ease',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                WebkitTapHighlightColor: 'transparent',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: `rgba(${opt.rgb},0.18)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: FONT_WEIGHT.extrabold,
                  fontSize: '0.85rem',
                  color: opt.tint,
                }}>
                  {opt.pairs}
                </div>
                <div style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.extrabold, color: t.text, marginTop: 2 }}>
                  {opt.label}
                </div>
                <div style={{ fontSize: '0.65rem', color: t.textMuted, fontWeight: FONT_WEIGHT.medium }}>
                  {opt.desc}
                </div>
              </button>
            );
          })}
        </div>

        {/* CTA — logo coral gradient (matches Splash) */}
        <button onClick={() => buildGame(pairCount)} style={{
          width: '100%',
          padding: '14px 24px',
          borderRadius: 16,
          border: 'none',
          background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
          color: '#fff',
          fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.extrabold,
          cursor: 'pointer',
          boxShadow: '0 6px 16px rgba(234,88,12,0.28)',
          minHeight: TOUCH_MIN + 4,
          fontFamily: 'inherit',
          letterSpacing: '0.01em',
          WebkitTapHighlightColor: 'transparent',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 22px rgba(234,88,12,0.38)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(234,88,12,0.28)'; }}
        >
          Dest pê bike
        </button>
      </PageContainer>
    );
  }

  // ── Complete phase ──
  if (gamePhase === 'complete') {
    const stars = moves <= pairCount * 2 ? 3 : moves <= pairCount * 3 ? 2 : 1;
    return (
      <PageContainer>
        {/* Hero gradient like Splash but inline */}
        <div style={{
          background: isDark
            ? 'linear-gradient(135deg, #0D3D4A 0%, #0F4C5C 60%, #EA580C 140%)'
            : 'linear-gradient(135deg, #0F4C5C 0%, #1A6B7F 55%, #EA580C 140%)',
          borderRadius: 20,
          padding: '24px 20px',
          textAlign: 'center',
          color: '#fff',
          boxShadow: isDark ? '0 6px 20px rgba(0,0,0,0.3)' : '0 8px 24px rgba(15,76,92,0.20)',
          marginBottom: SPACING.lg,
          position: 'relative', overflow: 'hidden',
        }}>
          <div aria-hidden="true" style={{
            position: 'absolute', top: -30, right: -30,
            width: 140, height: 140, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)', pointerEvents: 'none',
          }} />
          <div style={{ fontSize: '2.6rem', marginBottom: 8, lineHeight: 1, position: 'relative' }}>🎉</div>
          <div style={{ fontSize: '1.4rem', fontWeight: FONT_WEIGHT.extrabold, marginBottom: 8, position: 'relative' }}>
            Pîroz be!
          </div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 8, position: 'relative' }}>
            {[1, 2, 3].map(s => (
              <IconStar key={s} size={ICON_SIZE.xl} color={s <= stars ? '#FCD34D' : 'rgba(255,255,255,0.25)'} filled={s <= stars} />
            ))}
          </div>
          <div style={{
            fontSize: FONT_SIZE.sm, color: 'rgba(255,255,255,0.78)',
            fontWeight: FONT_WEIGHT.medium, position: 'relative',
          }}>
            {moves} gav · {pairCount} cot
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => buildGame(pairCount)} style={{
            flex: 1, padding: '14px', borderRadius: 14,
            border: `1.5px solid ${t.border}`, background: t.surface,
            color: t.text, fontSize: '0.95rem', fontWeight: FONT_WEIGHT.semibold,
            cursor: 'pointer', fontFamily: 'inherit', minHeight: TOUCH_MIN + 4,
            transition: 'all 0.15s ease',
            WebkitTapHighlightColor: 'transparent',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#0D9488'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; }}
          >
            Dîsa bilîze
          </button>
          <button onClick={() => setGamePhase('select')} style={{
            flex: 1, padding: '14px', borderRadius: 14, border: 'none',
            background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
            color: '#fff', fontSize: '0.95rem', fontWeight: FONT_WEIGHT.extrabold,
            cursor: 'pointer', fontFamily: 'inherit', minHeight: TOUCH_MIN + 4,
            boxShadow: '0 4px 12px rgba(13,148,136,0.30)',
            transition: 'all 0.15s ease',
            WebkitTapHighlightColor: 'transparent',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Asta biguhêre
          </button>
        </div>
      </PageContainer>
    );
  }

  // ── Playing phase ──
  const cols = 4;
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'transparent' }}>
      {/* Header — pill stats + gradient progress */}
      <div style={{
        padding: '12px 16px',
        background: isDark ? 'rgba(26,35,50,0.95)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        borderBottom: '1px solid ' + (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'),
      }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 6, gap: 8,
          }}>
            <span style={{
              fontSize: '0.75rem', fontWeight: FONT_WEIGHT.bold, color: t.text,
              padding: '4px 10px', borderRadius: 99,
              background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
              letterSpacing: '0.02em',
            }}>
              Gav: {moves}
            </span>
            <span style={{
              fontSize: '0.75rem', fontWeight: FONT_WEIGHT.bold, color: '#15803D',
              padding: '4px 10px', borderRadius: 99,
              background: isDark ? 'rgba(21,128,61,0.18)' : 'rgba(21,128,61,0.10)',
              letterSpacing: '0.02em',
            }}>
              ✓ {matchedKeys.size} / {pairCount}
            </span>
          </div>
          <div style={{
            height: 4, borderRadius: 99,
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: ((matchedKeys.size / pairCount) * 100) + '%',
              background: 'linear-gradient(90deg, #0D9488, #EA580C)',
              borderRadius: 99,
              transition: 'width 0.3s ease-out',
            }} />
          </div>
        </div>
      </div>

      {/* Card grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          {/* Legend */}
          <div style={{
            display: 'flex', gap: 8, justifyContent: 'center',
            marginBottom: SPACING.md,
          }}>
            <LegendChip color="#0D9488" rgb="13,148,136" label="Kurdî" isDark={isDark} />
            <LegendChip color="#EA580C" rgb="234,88,12" label="Tirkî" isDark={isDark} />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(' + cols + ', 1fr)',
            gap: 8,
          }}>
            {cards.map(card => {
              const isFlippedCard = flippedIds.includes(card.id);
              const isMatched = matchedKeys.has(card.key);
              const isVisible = isFlippedCard || isMatched;
              const isKu = card.type === 'ku';
              const rgb = isKu ? '13,148,136' : '234,88,12';
              const accent = isKu ? '#0D9488' : '#EA580C';

              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  aria-label={isVisible ? card.text : 'Kart girtî'}
                  style={{
                    minHeight: 76,
                    borderRadius: 12,
                    cursor: isVisible ? 'default' : 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '0.74rem',
                    fontWeight: FONT_WEIGHT.bold,
                    padding: '6px',
                    transition: 'all 0.3s',
                    background: isMatched
                      ? (isDark ? 'rgba(21,128,61,0.18)' : 'rgba(21,128,61,0.08)')
                      : isVisible
                        ? (isDark ? `rgba(${rgb},0.18)` : `rgba(${rgb},0.08)`)
                        : (isDark
                            ? 'linear-gradient(135deg, rgba(13,148,136,0.22) 0%, rgba(15,76,92,0.30) 100%)'
                            : 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)'),
                    color: isMatched
                      ? '#15803D'
                      : isVisible
                        ? t.text
                        : '#fff',
                    border: '1.5px solid ' + (
                      isMatched ? '#15803D'
                        : isVisible ? accent
                        : 'transparent'
                    ),
                    transform: isMatched ? 'scale(0.94)' : 'none',
                    opacity: isMatched ? 0.85 : 1,
                    boxShadow: isMatched
                      ? 'none'
                      : isVisible
                        ? `0 2px 8px rgba(${rgb},0.20)`
                        : '0 4px 12px rgba(13,148,136,0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    gap: 3,
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {isVisible ? (
                    <>
                      <span style={{
                        fontSize: '0.55rem',
                        fontWeight: FONT_WEIGHT.extrabold,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: isMatched ? '#15803D' : accent,
                        opacity: 0.85,
                      }}>
                        {isKu ? 'KU' : 'TR'}
                      </span>
                      <span>{formatCardText(card.text, card.type)}</span>
                    </>
                  ) : (
                    <span style={{ fontSize: '1.5rem', opacity: 0.85 }}>?</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendChip({ color, rgb, label, isDark }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: '0.7rem', fontWeight: FONT_WEIGHT.semibold,
      color, padding: '3px 10px', borderRadius: 99,
      background: isDark ? `rgba(${rgb},0.18)` : `rgba(${rgb},0.10)`,
      border: `1px solid rgba(${rgb},0.30)`,
    }}>
      <span aria-hidden="true" style={{
        width: 6, height: 6, borderRadius: '50%', background: color,
      }} />
      {label}
    </span>
  );
}
