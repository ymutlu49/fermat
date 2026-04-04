// ─── FerMat — Design Tokens ────────────────────────────────────

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
    primary: '#0D9488', primaryLight: '#14B8A6', primarySoft: '#E6FAF8',
    accent: '#EA580C', accentHover: '#C2410C', accentSoft: '#FFF0EC',
    success: '#15803D', successLight: '#DCFCE7',
    warning: '#E9C46A', warningLight: '#FFF8E1',
    error: '#E63946', errorLight: '#FFE8EA',
    bg: '#FAFBFC', surface: '#FFFFFF', surfaceHover: '#F5F7FA',
    surfaceElevated: '#FFFFFF', border: '#E2E8F0', borderLight: '#F0F4F8',
    text: '#1A2332', textSecondary: '#64748B', textMuted: '#6B7A8D',
    textOnPrimary: '#FFFFFF', textOnAccent: '#FFFFFF',
    cardShadow: '0 1px 4px rgba(0,0,0,0.06)',
    cardShadowHover: '0 2px 8px rgba(0,0,0,0.10)',
    navShadow: '0 -1px 4px rgba(0,0,0,0.05)',
  },
  dark: {
    primary: '#2DD4BF', primaryLight: '#5EEAD4', primarySoft: '#0D2B2A',
    accent: '#FB923C', accentHover: '#F97316', accentSoft: '#2B1A1A',
    success: '#52B788', successLight: '#1A2F25',
    warning: '#F4D35E', warningLight: '#2B2614',
    error: '#FF6B6B', errorLight: '#2B1A1A',
    bg: '#0F1419', surface: '#1A2332', surfaceHover: '#243044',
    surfaceElevated: '#1E2A3A', border: '#2A3A4E', borderLight: '#1E2A3A',
    text: '#E8ECF1', textSecondary: '#8899AA', textMuted: '#7A8B9E',
    textOnPrimary: '#0F1419', textOnAccent: '#FFFFFF',
    cardShadow: '0 1px 4px rgba(0,0,0,0.2)',
    cardShadowHover: '0 2px 8px rgba(0,0,0,0.3)',
    navShadow: '0 -1px 4px rgba(0,0,0,0.25)',
  }
};

export const SECTION_COLORS = {
  light: [
    { bg: '#F5F8FC', text: '#2B5EA7', accent: '#5B93D6', icon: '#4078C0' },
    { bg: '#FDF9F5', text: '#A0512A', accent: '#D98A3E', icon: '#C47228' },
    { bg: '#F3FAF7', text: '#1A6B52', accent: '#34C493', icon: '#22A47A' },
    { bg: '#F5F6FC', text: '#2E4A72', accent: '#7880D4', icon: '#6366B8' },
    { bg: '#F9F5FC', text: '#7A38A8', accent: '#B076DA', icon: '#9B5CC4' },
    { bg: '#FDFBF3', text: '#8E5420', accent: '#D4A032', icon: '#C08B1E' },
    { bg: '#FCF3F4', text: '#A02845', accent: '#D65A72', icon: '#C44058' },
    { bg: '#F3FAF5', text: '#265E3A', accent: '#44B870', icon: '#2E9A58' },
    { bg: '#F7F5FC', text: '#5A30A0', accent: '#9B7AD4', icon: '#8560BE' },
    { bg: '#FCF4F4', text: '#8B2E2E', accent: '#D06060', icon: '#BE4444' },
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
