// ─── FerMat — Visual library shared helpers ──────────────────────
// All visuals consume these primitives. Never access theme.xyz directly
// inside a visual — always go through vColors(theme).

// Maps a theme object to the consistent color palette used by every SVG visual.
export function vColors(t) {
  const isDark = t && (t.bg === '#0F1419' || t.bg === '#111827' || t.bg === '#1a1a2e');
  return {
    fill1:  t?.primary   || '#0F4C5C',
    fill2:  t?.accent    || t?.warning  || '#E8773A',
    fill3:  t?.success   || '#22C55E',
    fill4:  t?.warning   || '#F59E0B',
    fill5:  t?.error     || '#EF4444',
    fill6:  '#8B5CF6',
    soft1:  isDark ? '#1a3340' : '#E0F2FE',
    soft2:  isDark ? '#3d1f15' : '#FFF3EC',
    soft3:  isDark ? '#1a3022' : '#DCFCE7',
    bg:     t?.surface   || '#FFFFFF',
    line:   t?.border    || '#D1D5DB',
    text:   t?.text      || '#111827',
    dim:    t?.textSecondary || '#6B7280',
    muted:  t?.textMuted || t?.textSecondary || '#9CA3AF',
    white:  isDark ? '#1F2937' : '#FFFFFF',
  };
}

// Shared SVG <filter> for a soft drop shadow. Renders inside a <defs> block.
export function ShadowDef({ id, blur = 2, opacity = 0.18 }) {
  return (
    <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="1" dy="2" stdDeviation={blur} floodOpacity={opacity} />
    </filter>
  );
}
