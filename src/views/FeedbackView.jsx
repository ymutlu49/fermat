// ─── FerMat — Pêşniyar û Serrastkirin (Feedback View) ───────────
import { useState, useCallback } from 'react';
import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, DURATION, TOUCH_MIN } from '@data';
import { useMediaQuery } from '@hooks';

const FEEDBACK_STORAGE_KEY = 'ferhenga_feedback_v1';

const FEEDBACK_TYPES = [
  { id: 'bug',  emoji: '🐛', label: 'Xeletî',   desc: 'Pirsgirêkek heye',         color: '#EF4444' },
  { id: 'idea', emoji: '💡', label: 'Pêşniyar', desc: 'Ramanek an pêşniyarek heye', color: '#F59E0B' },
  { id: 'term', emoji: '📖', label: 'Têgeh',     desc: 'Têgehek nû pêşniyar bike',  color: '#3B82F6' },
  { id: 'like', emoji: '❤️', label: 'Spas',      desc: 'Tiştên ku baş in',          color: '#10B981' },
];

export default function FeedbackView({ theme, isDark }) {
  const t = theme;
  const { isMobile } = useMediaQuery();
  const px = isMobile ? SPACING.md : SPACING.xl;

  const [feedbackType, setFeedbackType] = useState(null);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

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
    const typeLabel = FEEDBACK_TYPES.find(ft => ft.id === feedbackType)?.label || feedbackType;
    const subject = encodeURIComponent(`[FerMat] ${typeLabel}`);
    const body = encodeURIComponent(
      `Cure: ${typeLabel}\n\n${message.trim()}\n\n---\nDema: ${new Date().toLocaleString()}\nGuherto: 3.0.0`
    );
    window.open(`mailto:y.mutlu@alparslan.edu.tr?subject=${subject}&body=${body}`, '_self');
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setMessage('');
      setFeedbackType(null);
    }, 3000);
  }, [feedbackType, message]);

  const selectedType = FEEDBACK_TYPES.find(ft => ft.id === feedbackType);

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'transparent', padding: `${SPACING.xl}px ${px}px 80px` }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: SPACING.xl + 4 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #059669, #10B981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto', marginBottom: SPACING.md,
            fontSize: '2rem',
          }}>
            💬
          </div>
          <div style={{
            fontSize: isMobile ? '1.3rem' : '1.5rem',
            fontWeight: FONT_WEIGHT.extrabold, color: t.text, marginBottom: SPACING.xs,
          }}>
            Pêşniyar û Serrastkirin
          </div>
          <div style={{ fontSize: FONT_SIZE.sm, color: t.textSecondary, lineHeight: 1.5 }}>
            Ji bo baştirkirina vê sepanê alîkariya xwe bikin.
            <br />
            Her pêşniyar ji me re girîng e.
          </div>
        </div>

        {/* Success state */}
        {submitted ? (
          <div style={{
            textAlign: 'center', padding: `${SPACING.xxl}px`,
            background: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.06)',
            borderRadius: RADIUS.xl,
            border: `2px solid ${isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.15)'}`,
            animation: `fadeInUp ${DURATION.normal} ease-out`,
          }}>
            <div style={{ fontSize: '3rem', marginBottom: SPACING.md }}>🎉</div>
            <div style={{ fontSize: '1.2rem', fontWeight: FONT_WEIGHT.bold, color: t.success, marginBottom: SPACING.xs }}>
              Spas ji bo pêşniyara te!
            </div>
            <div style={{ fontSize: FONT_SIZE.sm, color: t.textMuted }}>
              Dê em li ser bixebitin
            </div>
          </div>
        ) : (
          <>
            {/* Type selection */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
              gap: SPACING.sm + 2, marginBottom: SPACING.lg,
            }}>
              {FEEDBACK_TYPES.map(ft => {
                const isActive = feedbackType === ft.id;
                return (
                  <button
                    key={ft.id}
                    onClick={() => setFeedbackType(ft.id)}
                    style={{
                      padding: `${SPACING.lg}px ${SPACING.md}px`,
                      borderRadius: RADIUS.xl,
                      border: `2px solid ${isActive ? ft.color : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')}`,
                      background: isActive
                        ? ft.color + (isDark ? '18' : '0C')
                        : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                      cursor: 'pointer', fontFamily: 'inherit',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: SPACING.xs + 2,
                      transition: `all ${DURATION.normal}`,
                    }}
                  >
                    <span style={{ fontSize: '1.8rem' }}>{ft.emoji}</span>
                    <span style={{
                      fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold,
                      color: isActive ? ft.color : t.text,
                    }}>
                      {ft.label}
                    </span>
                    <span style={{
                      fontSize: FONT_SIZE.xs, color: t.textMuted, lineHeight: 1.3,
                    }}>
                      {ft.desc}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Message input */}
            <div style={{ marginBottom: SPACING.lg }}>
              <div style={{
                fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold,
                color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em',
                marginBottom: SPACING.sm,
              }}>
                Peyama te
              </div>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={
                  feedbackType === 'bug' ? 'Pirsgirêkê bi hûrgulî rave bike...'
                  : feedbackType === 'term' ? 'Têgeha nû, wateya Kurdî, Tirkî û Îngilîzî binivîse...'
                  : feedbackType === 'like' ? 'Kîjan tişt baş e? Çi berdewam bibe?'
                  : 'Pêşniyar an ramana xwe binivîse...'
                }
                style={{
                  width: '100%', minHeight: 140, padding: `${SPACING.md}px`,
                  borderRadius: RADIUS.xl,
                  border: `2px solid ${selectedType ? selectedType.color + '40' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')}`,
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                  color: t.text, fontSize: FONT_SIZE.base, fontFamily: 'inherit',
                  resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                  transition: `border-color ${DURATION.normal}`,
                }}
                onFocus={e => { e.target.style.borderColor = selectedType?.color || t.primary; }}
                onBlur={e => { e.target.style.borderColor = selectedType ? selectedType.color + '40' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'); }}
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!feedbackType || !message.trim()}
              style={{
                width: '100%', padding: `${SPACING.lg}px`, minHeight: 52,
                borderRadius: RADIUS.xl, border: 'none',
                background: feedbackType && message.trim()
                  ? `linear-gradient(135deg, #059669, #10B981)`
                  : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'),
                color: feedbackType && message.trim() ? '#fff' : t.textMuted,
                fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold,
                cursor: feedbackType && message.trim() ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit',
                transition: `all ${DURATION.normal}`,
              }}
            >
              ✉️ Bişîne
            </button>

            {/* Info */}
            <div style={{
              textAlign: 'center', marginTop: SPACING.lg,
              fontSize: FONT_SIZE.xs, color: t.textMuted, lineHeight: 1.5,
            }}>
              Peyama te dê bi e-nameyê ji Prof. Dr. Yılmaz MUTLU re were şandin.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
