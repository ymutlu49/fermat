// ─── FerMat — Visual library shared helpers ──────────────────────
// Every SVG visual consumes vColors(theme) for its palette so we can keep
// the look consistent and theme-aware. The palette deliberately mirrors the
// logo identity:
//
//   Logo:  teal #0D9488 · coral #EA580C · green #15803D · dark #0F4C5C
//
// fill1–fill3 carry the brand identity. fill4/fill5 are semantic (warning,
// error) — kept because some visuals signal "careful" or "wrong" states.
// fill6 is reserved for the purple-leaning sections (CIHÎ, CEBÎRÎ) so they
// keep their visual identity in concept thumbnails.

export function vColors(t) {
  const isDark = t && (t.bg === '#0F1419' || t.bg === '#111827' || t.bg === '#1a1a2e');
  return {
    // Brand fills — logo palette anchors
    fill1:  t?.primary   || '#0D9488',   // logo teal
    fill2:  t?.accent    || '#EA580C',   // logo coral
    fill3:  t?.success   || '#15803D',   // logo green
    fill4:  t?.warning   || '#D97706',   // semantic warning amber
    fill5:  t?.error     || '#DC2626',   // semantic error red
    fill6:  '#7E22CE',                    // section purple (CIHÎ/CEBÎRÎ identity)
    // Soft tinted backgrounds — derived from logo palette
    soft1:  isDark ? '#0E2E33' : '#E0F4F2',   // teal tint
    soft2:  isDark ? '#2E1A12' : '#FCEFE7',   // coral tint
    soft3:  isDark ? '#142A1D' : '#E1F4E8',   // green tint
    // Surface, text, line — from theme with sensible fallbacks
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
