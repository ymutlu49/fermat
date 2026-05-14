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

// Two-stop linear gradient: lighter at the top-left, fuller colour at the
// bottom-right. Use inside <defs>. Produces the subtle "lit-from-above" look
// that lifts a flat fill into a 3D-feeling surface.
export function LinearLight({ id, from, to, x1 = '0%', y1 = '0%', x2 = '100%', y2 = '100%' }) {
  return (
    <linearGradient id={id} x1={x1} y1={y1} x2={x2} y2={y2}>
      <stop offset="0%" stopColor={from} />
      <stop offset="100%" stopColor={to} />
    </linearGradient>
  );
}

// Radial gradient with a soft inner highlight — turns a circle into a sphere.
// `lightOffset` shifts the highlight (default top-left).
export function SphereGradient({ id, base, highlight = '#ffffff', cx = '32%', cy = '28%' }) {
  return (
    <radialGradient id={id} cx={cx} cy={cy} r="75%" fx={cx} fy={cy}>
      <stop offset="0%"   stopColor={highlight} stopOpacity="0.55" />
      <stop offset="35%"  stopColor={highlight} stopOpacity="0.12" />
      <stop offset="100%" stopColor={base} />
    </radialGradient>
  );
}

// Soft inner shadow filter — gives flat shapes a recessed feel. For shapes
// that should look "stamped" or "embossed" into a surface.
export function InsetShadow({ id, blur = 1.5, opacity = 0.20 }) {
  return (
    <filter id={id}>
      <feGaussianBlur stdDeviation={blur} />
      <feOffset dx="0" dy="1" result="o" />
      <feFlood floodColor="#000" floodOpacity={opacity} />
      <feComposite in2="o" operator="in" />
      <feComposite in2="SourceGraphic" operator="over" />
    </filter>
  );
}

// Double-layer drop shadow for richer depth (a tight shadow + a softer halo).
export function RichShadow({ id, near = 1, far = 3, opacityNear = 0.18, opacityFar = 0.10 }) {
  return (
    <filter id={id} x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0.5" dy="1" stdDeviation={near} floodOpacity={opacityNear} />
      <feDropShadow dx="1"   dy="3" stdDeviation={far}  floodOpacity={opacityFar} />
    </filter>
  );
}

// Returns the hex with 30% black mix — used for "darker face" on isometric blocks.
export function darken(hex, amount = 0.30) {
  const c = hex.replace('#', '');
  const r = Math.max(0, Math.round(parseInt(c.substring(0, 2), 16) * (1 - amount)));
  const g = Math.max(0, Math.round(parseInt(c.substring(2, 4), 16) * (1 - amount)));
  const b = Math.max(0, Math.round(parseInt(c.substring(4, 6), 16) * (1 - amount)));
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

// Returns the hex with white mixed in — used for "lighter face" on isometric.
export function lighten(hex, amount = 0.18) {
  const c = hex.replace('#', '');
  const r = Math.min(255, Math.round(parseInt(c.substring(0, 2), 16) + (255 - parseInt(c.substring(0, 2), 16)) * amount));
  const g = Math.min(255, Math.round(parseInt(c.substring(2, 4), 16) + (255 - parseInt(c.substring(2, 4), 16)) * amount));
  const b = Math.min(255, Math.round(parseInt(c.substring(4, 6), 16) + (255 - parseInt(c.substring(4, 6), 16)) * amount));
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}
