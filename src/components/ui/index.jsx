// ─── FerMat — Shared UI Components ──────────────────────────────
import { useState, useEffect } from 'react';
import { SECTIONS, THEME, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, DURATION, TOUCH_MIN } from '@data';
import { getSectionColor } from '@utils/helpers.js';
import { IconCheck, IconX, IconSearch, IconVolume, IconChevronRight } from '@components/icons';

// ── Pill (section filter button) ──────────────────────────────────────────────
export function Pill({ label, isActive = false, color, onClick, children }) {
  const displayColor = color || '#0F4C5C';
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={isActive}
      style={{
        padding: `6px 12px`,
        minHeight: 36,
        borderRadius: RADIUS.full,
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: FONT_SIZE.sm,
        fontWeight: FONT_WEIGHT.semibold,
        transition: `all ${DURATION.normal}`,
        border: 'none',
        background: isActive ? displayColor : 'rgba(0,0,0,0.04)',
        color: isActive ? '#fff' : displayColor,
        outline: 'none',
        whiteSpace: 'nowrap',
        letterSpacing: '0.01em',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
      }}
    >
      {children || label}
    </button>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ label, color, bgColor }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: `${SPACING.xs}px ${SPACING.sm}px`,
      borderRadius: RADIUS.full,
      fontSize: FONT_SIZE.xs,
      fontWeight: FONT_WEIGHT.bold,
      letterSpacing: '0.03em',
      background: bgColor || 'rgba(0,0,0,0.08)',
      color: color || '#555',
    }}>
      {label}
    </span>
  );
}

// ── ConceptRow (Apple-style list row) ─────────────────────────────────────────
export function ConceptRow({ concept, theme, isDark, onClick, isLast = false }) {
  const t = theme || THEME.light;
  const colors = getSectionColor(concept.s, isDark);
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: SPACING.md,
        width: '100%', padding: `12px ${SPACING.lg}px`,
        minHeight: 56,
        background: 'transparent',
        border: 'none', borderBottom: isLast ? 'none' : `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
        cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: colors.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.1rem', flexShrink: 0,
      }}>
        {SECTIONS[concept.s]?.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold,
          color: t.text, lineHeight: 1.3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {concept.ku}
        </div>
        <div style={{
          fontSize: FONT_SIZE.sm, color: t.textMuted,
          fontWeight: FONT_WEIGHT.normal, lineHeight: 1.3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {concept.tr}
        </div>
      </div>
      <IconChevronRight size={16} color={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'} />
    </button>
  );
}

// ── ListSection (iOS grouped list container) ─────────────────────────────────
export function ListSection({ children, theme }) {
  const t = theme || THEME.light;
  return (
    <div style={{
      background: t.surface,
      borderRadius: RADIUS.xl,
      border: `1px solid ${t.border}`,
      overflow: 'hidden',
    }}>
      {children}
    </div>
  );
}

// ── SectionHeader (section group label) ──────────────────────────────────────
export function SectionGroupHeader({ label, theme }) {
  const t = theme || THEME.light;
  return (
    <div style={{
      fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.extrabold,
      color: t.textMuted, textTransform: 'uppercase',
      letterSpacing: '0.06em',
      padding: `${SPACING.lg}px ${SPACING.lg}px ${SPACING.sm}px`,
    }}>
      {label}
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, theme, onClick, style = {}, isInteractive = false }) {
  const [isHovered, setIsHovered] = useState(false);
  const t = theme || THEME.light;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => isInteractive && setIsHovered(true)}
      onMouseLeave={() => isInteractive && setIsHovered(false)}
      style={{
        background: t.surface,
        borderRadius: RADIUS.lg,
        boxShadow: isHovered ? t.cardShadowHover : t.cardShadow,
        border: '1px solid ' + t.border,
        transition: `all ${DURATION.normal} ease`,
        transform: isInteractive && isHovered ? 'translateY(-2px)' : 'none',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── ProgressBar ───────────────────────────────────────────────────────────────
export function ProgressBar({ value, max, color, bgColor, height = SPACING.sm }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{
      background: bgColor || 'rgba(0,0,0,0.08)',
      borderRadius: RADIUS.full,
      height,
      overflow: 'hidden',
    }}>
      <div style={{
        height: '100%',
        width: pct + '%',
        borderRadius: RADIUS.full,
        background: color || '#0F4C5C',
        transition: `width ${DURATION.slow} ease-out`,
      }} />
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ isOpen, onClose, theme, children, maxWidth = 420 }) {
  const t = theme || THEME.light;

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: SPACING.lg + 'px',
        animation: `fadeIn 0.2s ease-out`,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: t.surface,
          borderRadius: RADIUS.xl,
          padding: `${SPACING.xl}px ${SPACING.xl - 4}px`,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          maxWidth: maxWidth + 'px',
          width: '100%',
          animation: `slideUp ${DURATION.normal} cubic-bezier(0.22,0.61,0.36,1)`,
          maxHeight: '90dvh',
          overflowY: 'auto',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ── ToastContainer ────────────────────────────────────────────────────────────
const TOAST_ICONS = { success: IconCheck, error: IconX, info: IconSearch };

export function ToastContainer({ toasts, theme }) {
  const t = theme || THEME.light;
  const typeColors = { success: t.success, error: t.error, info: t.primary, warning: t.warning };
  return (
    <div style={{
      position: 'fixed',
      top: SPACING.lg,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      gap: SPACING.sm,
      alignItems: 'center',
      pointerEvents: 'none',
      maxWidth: 'calc(100vw - 32px)',
    }}>
      {toasts.map(toast => {
        const ToastIcon = TOAST_ICONS[toast.type];
        return (
          <div key={toast.id} style={{
            display: 'flex', alignItems: 'center', gap: SPACING.sm,
            background: typeColors[toast.type] || t.primary,
            color: '#fff',
            padding: `${SPACING.md - 1}px ${SPACING.xl - 2}px`,
            borderRadius: RADIUS.full,
            fontSize: FONT_SIZE.base,
            fontWeight: FONT_WEIGHT.semibold,
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            animation: `fadeInUp 0.3s ease-out`,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
          }}>
            {ToastIcon && <ToastIcon size={16} color="#fff" />}
            {toast.message}
          </div>
        );
      })}
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, message, actionLabel, onAction, theme }) {
  const t = theme || THEME.light;
  return (
    <div style={{ textAlign: 'center', padding: `${SPACING.xxl + 8}px ${SPACING.xl - 4}px` }}>
      <div style={{ fontSize: 44, marginBottom: SPACING.lg - 2 }}>{icon || '🔍'}</div>
      <div style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: t.text, marginBottom: SPACING.sm }}>
        {title}
      </div>
      {message && (
        <div style={{ fontSize: FONT_SIZE.base, color: t.textSecondary, marginBottom: SPACING.xl - 4, lineHeight: 1.5 }}>
          {message}
        </div>
      )}
      {actionLabel && (
        <Button variant="primary" onClick={onAction} theme={t}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// ── SectionTag ────────────────────────────────────────────────────────────────
export function SectionTag({ sectionId, isDark, size = 'sm' }) {
  const section = SECTIONS[sectionId];
  if (!section) return null;
  const colors = getSectionColor(sectionId, isDark);
  const isSmall = size === 'sm';
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: SPACING.xs,
      padding: isSmall ? `${SPACING.xs}px ${SPACING.sm}px` : `${SPACING.xs + 1}px ${SPACING.md}px`,
      borderRadius: RADIUS.full,
      background: colors.bg,
      color: colors.text,
      fontSize: isSmall ? '0.72rem' : FONT_SIZE.sm,
      fontWeight: FONT_WEIGHT.semibold,
    }}>
      <span>{section.icon}</span>
      {!isSmall && section.short}
    </span>
  );
}

// ── ScoreCircle ───────────────────────────────────────────────────────────────
export function ScoreCircle({ score, total, theme, size = 120 }) {
  const t = theme || THEME.light;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (pct / 100) * circumference;
  const color = pct >= 80 ? t.success : pct >= 50 ? t.warning : t.error;
  const cx = size / 2, cy = size / 2;

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke={t.border} strokeWidth="8" />
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={strokeDash + ' ' + circumference}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: `stroke-dasharray 0.8s ease-out` }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: size < 100 ? FONT_SIZE.lg : FONT_SIZE.xl, fontWeight: FONT_WEIGHT.extrabold, color }}>
          {pct}%
        </span>
        <span style={{ fontSize: '0.72rem', color: t.textMuted, fontWeight: FONT_WEIGHT.semibold }}>
          {score}/{total}
        </span>
      </div>
    </div>
  );
}

// ── Button ────────────────────────────────────────────────────────────────────
export function Button({ children, onClick, variant = 'primary', theme, disabled = false, style = {} }) {
  const t = theme || THEME.light;
  const [isHovered, setIsHovered] = useState(false);

  const variants = {
    primary: {
      background: disabled ? t.textMuted : (isHovered ? t.accentHover : t.accent),
      color: t.textOnAccent,
      border: 'none',
    },
    secondary: {
      background: disabled ? t.border : (isHovered ? t.primarySoft : 'transparent'),
      color: t.primary,
      border: '1.5px solid ' + t.primary,
    },
    ghost: {
      background: isHovered ? t.surfaceHover : 'transparent',
      color: t.text,
      border: '1px solid ' + t.border,
    },
    success: {
      background: disabled ? t.textMuted : (isHovered ? t.success : t.success),
      color: '#fff',
      border: 'none',
    },
  };

  const v = variants[variant] || variants.primary;

  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={disabled}
      style={{
        padding: `${SPACING.md}px ${SPACING.xl + 4}px`,
        minHeight: TOUCH_MIN,
        borderRadius: RADIUS.full,
        fontSize: FONT_SIZE.base,
        fontWeight: FONT_WEIGHT.semibold,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        transition: `all ${DURATION.normal}`,
        opacity: disabled ? 0.6 : 1,
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
        outline: 'none',
        ...v,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ── SpeakButton ──────────────────────────────────────────────────────────────
export function SpeakButton({ text, speak, isSpeaking, theme, size = 32 }) {
  const t = theme || THEME.light;
  if (!text || !speak) return null;

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={(e) => { e.stopPropagation(); speak(text); }}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); e.preventDefault(); speak(text); } }}
      aria-label={'Bibêje: ' + text}
      title="Bibêje"
      style={{
        width: size, height: size,
        borderRadius: '50%',
        border: 'none',
        background: isSpeaking ? t.primarySoft : 'transparent',
        cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        transition: `all ${DURATION.fast}`,
        animation: isSpeaking ? 'pulse 1s ease-in-out infinite' : 'none',
        WebkitTapHighlightColor: 'transparent',
        padding: 0,
      }}
    >
      <IconVolume size={size * 0.55} color={isSpeaking ? t.primary : t.textMuted} />
    </span>
  );
}
