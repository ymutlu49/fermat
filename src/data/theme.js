// ─── Ferhenga Matematîkê — Design Tokens ────────────────────────────────────

// ── Spacing scale (4px base unit) ───────────────────────────────────────────
export const SPACING = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

// ── Border radius scale ─────────────────────────────────────────────────────
export const RADIUS = { sm: 4, md: 8, lg: 14, xl: 20, full: 9999 };

// ── Typography ──────────────────────────────────────────────────────────────
export const FONT_SIZE = {
  xs: '0.65rem', sm: '0.75rem', base: '0.875rem', md: '1rem',
  lg: '1.25rem', xl: '1.5rem', xxl: '2rem',
};
export const FONT_WEIGHT = {
  normal: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800, black: 900,
};

// ── Animation durations ─────────────────────────────────────────────────────
export const DURATION = { fast: '0.15s', normal: '0.25s', slow: '0.5s' };

// ── Icon sizes ──────────────────────────────────────────────────────────────
export const ICON_SIZE = { sm: 16, md: 20, lg: 24, xl: 32 };

// ── Touch targets ───────────────────────────────────────────────────────────
export const TOUCH_MIN = 44;

// ── Color themes ────────────────────────────────────────────────────────────
export const THEME = {
  light: {
    primary: '#0F4C5C', primaryLight: '#1A6B7F', primarySoft: '#E8F4F8',
    accent: '#E76F51', accentHover: '#D4573B', accentSoft: '#FFF0EC',
    success: '#2D6A4F', successLight: '#D8F3DC',
    warning: '#E9C46A', warningLight: '#FFF8E1',
    error: '#E63946', errorLight: '#FFE8EA',
    bg: '#FAFBFC', surface: '#FFFFFF', surfaceHover: '#F5F7FA',
    surfaceElevated: '#FFFFFF', border: '#E2E8F0', borderLight: '#F0F4F8',
    text: '#1A2332', textSecondary: '#64748B', textMuted: '#6B7A8D',
    textOnPrimary: '#FFFFFF', textOnAccent: '#FFFFFF',
    cardShadow: '0 1px 3px rgba(15,76,92,0.08), 0 4px 12px rgba(15,76,92,0.04)',
    cardShadowHover: '0 4px 12px rgba(15,76,92,0.12), 0 8px 24px rgba(15,76,92,0.06)',
    navShadow: '0 -1px 12px rgba(15,76,92,0.08)',
  },
  dark: {
    primary: '#4ECDC4', primaryLight: '#6EE7DE', primarySoft: '#0D2B2A',
    accent: '#FF6B6B', accentHover: '#FF5252', accentSoft: '#2B1A1A',
    success: '#52B788', successLight: '#1A2F25',
    warning: '#F4D35E', warningLight: '#2B2614',
    error: '#FF6B6B', errorLight: '#2B1A1A',
    bg: '#0F1419', surface: '#1A2332', surfaceHover: '#243044',
    surfaceElevated: '#1E2A3A', border: '#2A3A4E', borderLight: '#1E2A3A',
    text: '#E8ECF1', textSecondary: '#8899AA', textMuted: '#7A8B9E',
    textOnPrimary: '#0F1419', textOnAccent: '#FFFFFF',
    cardShadow: '0 1px 3px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)',
    cardShadowHover: '0 4px 12px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3)',
    navShadow: '0 -1px 12px rgba(0,0,0,0.4)',
  }
};

export const SECTION_COLORS = {
  light: [
    { bg: '#EFF6FF', text: '#1E40AF', accent: '#3B82F6', icon: '#2563EB' },
    { bg: '#FFF7ED', text: '#9A3412', accent: '#F97316', icon: '#EA580C' },
    { bg: '#ECFDF5', text: '#065F46', accent: '#10B981', icon: '#059669' },
    { bg: '#EFF6FF', text: '#1E3A5F', accent: '#6366F1', icon: '#4F46E5' },
    { bg: '#FDF4FF', text: '#6B21A8', accent: '#A855F7', icon: '#9333EA' },
    { bg: '#FFFBEB', text: '#92400E', accent: '#F59E0B', icon: '#D97706' },
    { bg: '#FFF1F2', text: '#9F1239', accent: '#F43F5E', icon: '#E11D48' },
    { bg: '#F0FDF4', text: '#14532D', accent: '#22C55E', icon: '#16A34A' },
    { bg: '#F5F3FF', text: '#4C1D95', accent: '#8B5CF6', icon: '#7C3AED' },
    { bg: '#FEF2F2', text: '#7F1D1D', accent: '#EF4444', icon: '#DC2626' },
  ],
  dark: [
    { bg: '#1A2744', text: '#93C5FD', accent: '#60A5FA', icon: '#3B82F6' },
    { bg: '#2A1F14', text: '#FDBA74', accent: '#FB923C', icon: '#F97316' },
    { bg: '#14261D', text: '#6EE7B7', accent: '#34D399', icon: '#10B981' },
    { bg: '#1A1F33', text: '#A5B4FC', accent: '#818CF8', icon: '#6366F1' },
    { bg: '#231828', text: '#D8B4FE', accent: '#C084FC', icon: '#A855F7' },
    { bg: '#261E0F', text: '#FCD34D', accent: '#FBBF24', icon: '#F59E0B' },
    { bg: '#26141A', text: '#FDA4AF', accent: '#FB7185', icon: '#F43F5E' },
    { bg: '#142614', text: '#86EFAC', accent: '#4ADE80', icon: '#22C55E' },
    { bg: '#1E1433', text: '#C4B5FD', accent: '#A78BFA', icon: '#8B5CF6' },
    { bg: '#261414', text: '#FCA5A5', accent: '#F87171', icon: '#EF4444' },
  ]
};
