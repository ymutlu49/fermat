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
export default function StatsView({ theme, isDark, concepts, progress, setProgress, showToast }) {
  const t = theme;
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const flashcardBoxes = progress.flashcardBoxes || {};
  const knownCount = concepts.filter(c => (flashcardBoxes[c.ku] || 0) >= LEITNER_KNOWN_BOX).length;
  const learningCount = concepts.filter(c => (flashcardBoxes[c.ku] || 0) === 1).length;
  const newCount = concepts.length - knownCount - learningCount;
  const totalQ = progress.totalQuestions || 0;
  const correctA = progress.correctAnswers || 0;
  const sessions = progress.sessions || [];
  const accuracy = totalQ > 0 ? Math.round((correctA / totalQ) * 100) : 0;

  // Section distribution
  const sectionCounts = Object.fromEntries(Object.keys(SECTIONS).map(k => [k, 0]));
  concepts.forEach(c => { sectionCounts[c.s] = (sectionCounts[c.s] || 0) + 1; });

  const handleReset = useCallback(() => {
    setProgress({ flashcardBoxes: {}, totalQuestions: 0, correctAnswers: 0, sessions: [] });
    setShowResetConfirm(false);
    showToast?.('Pêşketin ji nû ve hat paqijkirin', 'info');
  }, [setProgress, showToast]);

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'transparent', padding: `${SPACING.md}px ${SPACING.lg}px 80px` }}>
      {/* Summary */}
      <div style={{
        borderRadius: RADIUS.xl, padding: `${SPACING.xl}px`, marginBottom: 14,
        background: 'linear-gradient(135deg, #0F766E 0%, #0D9488 50%, #14B8A6 100%)',
        color: '#fff', textAlign: 'center',
        boxShadow: '0 8px 24px rgba(15,118,110,0.25)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -20, top: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', left: -10, bottom: -10, width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ fontSize: '2.2rem', fontWeight: FONT_WEIGHT.black, position: 'relative' }}>{concepts.length}</div>
        <div style={{ fontSize: FONT_SIZE.base, opacity: 0.85, position: 'relative' }}>Têgeh · 9 Beş · 3 Ziman</div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
        {[
          { icon: '❓', value: totalQ, label: 'Pirs', color: '#6366F1', bg: isDark ? '#1E1433' : '#EEF2FF' },
          { icon: '🎯', value: accuracy + '%', label: 'Rast', color: '#16A34A', bg: isDark ? '#142614' : '#DCFCE7' },
          { icon: '📅', value: sessions.length, label: 'Xebat', color: '#D97706', bg: isDark ? '#261E0F' : '#FEF9C3' },
        ].map((m, i) => (
          <div key={i} style={{
            background: m.bg, borderRadius: RADIUS.lg,
            padding: '14px 10px', textAlign: 'center',
            border: '1px solid ' + m.color + '25',
          }}>
            <div style={{ fontSize: '1.3rem', marginBottom: 3 }}>{m.icon}</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: m.color, lineHeight: 1 }}>{m.value}</div>
            <div style={{ fontSize: '0.68rem', color: t.textMuted, fontWeight: FONT_WEIGHT.semibold, marginTop: 3 }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Flashcard progress */}
      <div style={{ background: t.surface, borderRadius: RADIUS.xl, padding: `${SPACING.lg}px`, marginBottom: 14, border: '1px solid ' + t.border }}>
        <div style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.extrabold, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: SPACING.md }}>
          Pirs û Bersiv
        </div>
        {/* Stacked bar */}
        <div style={{ display: 'flex', gap: 3, height: 14, borderRadius: RADIUS.full, overflow: 'hidden', marginBottom: 10 }}>
          <div style={{ flex: knownCount, background: t.success, minWidth: knownCount > 0 ? 6 : 0, borderRadius: `${RADIUS.full}px 0 0 ${RADIUS.full}px`, transition: `flex 0.6s ease-out` }} />
          <div style={{ flex: learningCount, background: t.warning, minWidth: learningCount > 0 ? 4 : 0, transition: `flex 0.6s ease-out` }} />
          <div style={{ flex: newCount, background: t.border, minWidth: 6, borderRadius: `0 ${RADIUS.full}px ${RADIUS.full}px 0`, transition: `flex 0.6s ease-out` }} />
        </div>
        {/* Legend row */}
        <div style={{ display: 'flex', gap: 0 }}>
          {[
            { color: t.success, label: 'Zanî', count: knownCount, pct: Math.round(knownCount/concepts.length*100) },
            { color: t.warning, label: 'Fêrbûn', count: learningCount, pct: Math.round(learningCount/concepts.length*100) },
            { color: t.textMuted, label: 'Nû', count: newCount, pct: Math.round(newCount/concepts.length*100) },
          ].map((seg, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.extrabold, color: seg.color }}>{seg.count}</div>
              <div style={{ fontSize: FONT_SIZE.xs, color: t.textMuted, fontWeight: FONT_WEIGHT.semibold }}>{seg.label}</div>
              <div style={{ fontSize: '0.6rem', color: t.textMuted }}>%{seg.pct}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Session history */}
      {sessions.length > 0 && (
        <div style={{ background: t.surface, borderRadius: '12px', padding: `${SPACING.lg}px`, marginBottom: 14, border: '1px solid ' + t.border }}>
          <div style={{ fontSize: '0.8rem', fontWeight: FONT_WEIGHT.bold, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: SPACING.md }}>
            Xebatên dawî
          </div>
          <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 60 }}>
            {sessions.slice(-15).map((s, i) => {
              const pct = s.total > 0 ? s.correct / s.total : 0;
              const isLast = i === sessions.slice(-15).length - 1;
              return (
                <div key={i} style={{
                  flex: 1, borderRadius: `${RADIUS.sm}px ${RADIUS.sm}px 0 0`,
                  background: isLast ? t.primary : (pct >= 0.8 ? t.success : pct >= 0.5 ? t.warning : t.error),
                  opacity: isLast ? 1 : 0.6 + i * 0.03,
                  height: Math.max(4, pct * 60) + 'px', transition: 'height 0.5s ease-out',
                }} title={(Math.round(pct * 100)) + '%'} />
              );
            })}
          </div>
          <div style={{ fontSize: '0.72rem', color: t.textMuted, marginTop: 6 }}>
            Dawîn {Math.min(15, sessions.length)} xebat
          </div>
        </div>
      )}

      {/* Section distribution */}
      <div style={{ background: t.surface, borderRadius: RADIUS.xl, padding: `${SPACING.lg}px`, marginBottom: 14, border: '1px solid ' + t.border }}>
        <div style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.extrabold, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: SPACING.md }}>
          Beş
        </div>
        {Object.entries(SECTIONS).map(([id, sec]) => {
          const count = sectionCounts[id] || 0;
          const colors = getSectionColor(parseInt(id), isDark);
          const pct = Math.round(count / concepts.length * 100);
          return (
            <div key={id} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: FONT_WEIGHT.bold, color: t.text }}>
                  <span style={{ marginRight: 5 }}>{sec.icon}</span>
                  {sec.short}
                </span>
                <span style={{ fontSize: '0.72rem', color: colors.accent, fontWeight: FONT_WEIGHT.bold }}>
                  {count} · %{pct}
                </span>
              </div>
              <div style={{ height: SPACING.sm, borderRadius: 6, background: t.border, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: pct + '%',
                  background: `linear-gradient(90deg, ${colors.accent}CC, ${colors.accent})`,
                  borderRadius: 6,
                  transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)',
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Feedback Section ── */}
      <FeedbackSection theme={t} isDark={isDark} />

      {/* Reset */}
      <button
        onClick={() => setShowResetConfirm(true)}
        style={{
          width: '100%', padding: '14px', borderRadius: RADIUS.xl, border: '2px solid ' + t.error,
          background: 'transparent', color: t.error,
          fontFamily: 'inherit', fontWeight: FONT_WEIGHT.bold, fontSize: '0.95rem', cursor: 'pointer',
          transition: `all ${DURATION.fast}`,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = t.errorLight; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >
        Pêşketinê paqij bike
      </button>

      <div style={{ textAlign: 'center', marginTop: SPACING.xl, fontSize: FONT_SIZE.sm, color: t.textMuted }}>
        Prof. Dr. Yılmaz MUTLU
      </div>

      {/* Reset confirm modal */}
      <Modal isOpen={showResetConfirm} onClose={() => setShowResetConfirm(false)} theme={theme}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: SPACING.md }}>⚠️</div>
          <div style={{ fontSize: '1.1rem', fontWeight: FONT_WEIGHT.bold, color: t.text, marginBottom: SPACING.sm }}>Tu piştrast î?</div>
          <div style={{ fontSize: FONT_SIZE.base, color: t.textSecondary, marginBottom: SPACING.xl }}>
            Hemû pêşketin dê bê paqijkirin. Ev çêdibe nayê paşvegerandin.
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setShowResetConfirm(false)} style={{
              flex: 1, padding: `${SPACING.md}px`, borderRadius: '10px', border: '1.5px solid ' + t.border,
              background: t.surface, color: t.text, fontFamily: 'inherit', fontWeight: FONT_WEIGHT.semibold, cursor: 'pointer', fontSize: '0.95rem',
            }}>
              Betal bike
            </button>
            <button onClick={handleReset} style={{
              flex: 1, padding: `${SPACING.md}px`, borderRadius: '10px', border: 'none',
              background: t.error, color: '#fff', fontFamily: 'inherit', fontWeight: FONT_WEIGHT.bold, cursor: 'pointer', fontSize: '0.95rem',
            }}>
              Paqij bike
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── Feedback / Suggestion Section ────────────────────────────────────────────
const FEEDBACK_STORAGE_KEY = 'ferhenga_feedback_v1';

function FeedbackSection({ theme: t, isDark }) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState(null);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const feedbackTypes = [
    { id: 'bug',     emoji: '🐛', label: 'Xeletî',      desc: 'Pirsgirêkek heye' },
    { id: 'idea',    emoji: '💡', label: 'Pêşniyar',    desc: 'Ramanek heye' },
    { id: 'term',    emoji: '📖', label: 'Têgeh',        desc: 'Têgehek nû pêşniyar bike' },
    { id: 'like',    emoji: '❤️', label: 'Spas',         desc: 'Tiştên baş' },
  ];

  const handleSubmit = useCallback(() => {
    if (!feedbackType || !message.trim()) return;
    // Save locally
    const existing = JSON.parse(localStorage.getItem(FEEDBACK_STORAGE_KEY) || '[]');
    existing.push({
      type: feedbackType,
      message: message.trim(),
      date: new Date().toISOString(),
    });
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(existing));
    // Send via email
    const typeLabel = { bug: 'Xeletî', idea: 'Pêşniyar', term: 'Têgeh', like: 'Spas' }[feedbackType] || feedbackType;
    const subject = encodeURIComponent(`[FerMat] ${typeLabel}`);
    const body = encodeURIComponent(
      `Cure: ${typeLabel}\n\n${message.trim()}\n\n---\nDema: ${new Date().toLocaleString()}\nGuherto: 3.0.0`
    );
    window.open(`mailto:y.mutlu@alparslan.edu.tr?subject=${subject}&body=${body}`, '_self');
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsOpen(false);
      setMessage('');
      setFeedbackType(null);
    }, 2500);
  }, [feedbackType, message]);

  return (
    <div style={{
      background: isDark ? 'rgba(78,205,196,0.06)' : 'rgba(15,76,92,0.04)',
      borderRadius: RADIUS.xl,
      border: `1.5px solid ${isDark ? 'rgba(78,205,196,0.12)' : 'rgba(15,76,92,0.1)'}`,
      padding: `${SPACING.lg}px`,
      marginBottom: 14,
    }}>
      {/* Header — always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: SPACING.md,
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'inherit', padding: 0, textAlign: 'left',
        }}
      >
        <div style={{
          width: 42, height: 42, borderRadius: RADIUS.lg,
          background: isDark ? 'rgba(78,205,196,0.12)' : 'rgba(15,76,92,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.3rem', flexShrink: 0,
        }}>
          💬
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, color: t.text }}>
            Pêşniyar û Serrastkirin
          </div>
          <div style={{ fontSize: FONT_SIZE.xs, color: t.textMuted }}>
            Ji bo baştirkirina vê sepanê alîkariya xwe bikin
          </div>
        </div>
        <span style={{
          fontSize: '1.2rem', color: t.textMuted,
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
          transition: `transform ${DURATION.normal}`,
        }}>
          ▾
        </span>
      </button>

      {/* Expanded form */}
      {isOpen && !submitted && (
        <div style={{ marginTop: SPACING.lg, animation: `fadeInUp ${DURATION.normal} ease-out` }}>
          {/* Feedback type buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: SPACING.sm, marginBottom: SPACING.md }}>
            {feedbackTypes.map(ft => (
              <button
                key={ft.id}
                onClick={() => setFeedbackType(ft.id)}
                style={{
                  padding: `${SPACING.sm + 2}px ${SPACING.xs}px`,
                  borderRadius: RADIUS.lg,
                  border: `2px solid ${feedbackType === ft.id ? t.primary : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')}`,
                  background: feedbackType === ft.id
                    ? (isDark ? 'rgba(78,205,196,0.12)' : 'rgba(15,76,92,0.06)')
                    : 'transparent',
                  cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  transition: `all ${DURATION.fast}`,
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{ft.emoji}</span>
                <span style={{
                  fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold,
                  color: feedbackType === ft.id ? t.primary : t.textMuted,
                }}>
                  {ft.label}
                </span>
              </button>
            ))}
          </div>

          {/* Message input */}
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder={
              feedbackType === 'bug' ? 'Pirsgirêkê rave bike...'
              : feedbackType === 'term' ? 'Têgeha nû û wateya wê binivîse...'
              : feedbackType === 'like' ? 'Kîjan tişt baş e?'
              : 'Pêşniyara xwe binivîse...'
            }
            style={{
              width: '100%', minHeight: 90, padding: `${SPACING.md}px`,
              borderRadius: RADIUS.lg,
              border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
              color: t.text, fontSize: FONT_SIZE.sm, fontFamily: 'inherit',
              resize: 'vertical', outline: 'none', boxSizing: 'border-box',
              transition: `border-color ${DURATION.normal}`,
              marginBottom: SPACING.md,
            }}
            onFocus={e => { e.target.style.borderColor = t.primary; }}
            onBlur={e => { e.target.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'; }}
          />

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={!feedbackType || !message.trim()}
            style={{
              width: '100%', padding: `${SPACING.md}px`,
              borderRadius: RADIUS.xl, border: 'none',
              background: feedbackType && message.trim()
                ? 'linear-gradient(135deg, #0F766E, #0D9488)'
                : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'),
              color: feedbackType && message.trim() ? '#fff' : t.textMuted,
              fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold,
              cursor: feedbackType && message.trim() ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
              transition: `all ${DURATION.normal}`,
            }}
          >
            Bişîne
          </button>
        </div>
      )}

      {/* Success message */}
      {submitted && (
        <div style={{
          marginTop: SPACING.lg, textAlign: 'center',
          padding: `${SPACING.lg}px`,
          animation: `fadeInUp ${DURATION.normal} ease-out`,
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: SPACING.sm }}>🎉</div>
          <div style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: t.success }}>
            Spas ji bo pêşniyara te!
          </div>
          <div style={{ fontSize: FONT_SIZE.xs, color: t.textMuted, marginTop: SPACING.xs }}>
            Dê em li ser bixebitin
          </div>
        </div>
      )}
    </div>
  );
}
