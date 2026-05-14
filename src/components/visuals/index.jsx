// ─── FerMat — SVG Concept Visual Library v3 ─────────────────────
// Visual concepts are rendered with depth: gradients for surfaces, layered
// drop-shadows for grounding, and subtle highlights to mimic real-world
// materials. Shared primitives (gradients, shadows) live in ./core.jsx.
import { useId } from 'react';
import {
  vColors, ShadowDef, LinearLight, SphereGradient, RichShadow, darken, lighten,
} from './core.jsx';
export { vColors, ShadowDef };

// ─── 1. NumberLineVisual ───────────────────────────────────────────────────────
// Polished: axis with subtle gradient + grounding shadow, tick hierarchy
// (major every integer, minor at half-steps for short ranges), highlighted
// numbers shown as glossy spheres with their own labelled badge underneath.
export function NumberLineVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const { start = 0, end = 5, highlight = [], natural = false } = params;
  const pad = 22, lineY = size * 0.55;
  const range = end - start || 1;
  const toX = n => pad + ((n - start) / range) * (size - pad * 2);
  const ticks = [];
  for (let i = start; i <= end; i++) ticks.push(i);
  // Half-step minor ticks when range is small enough to feel readable
  const showMinor = range <= 10;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="jimarxêz">
      <defs>
        <LinearLight id={`${uid}_axis`} from={c.muted} to={c.line} x1="0%" y1="0%" x2="100%" y2="0%" />
        <SphereGradient id={`${uid}_sphere`} base={c.fill1} />
        <RichShadow id={`${uid}_rich`} near={1.2} far={3} />
        <ShadowDef id={`${uid}_sh`} blur={1.5} opacity={0.20} />
        <marker id={`${uid}_arr`} markerWidth="9" markerHeight="9" refX="4" refY="4" orient="auto">
          <path d="M0,1 L7,4 L0,7 Z" fill={c.muted} />
        </marker>
      </defs>

      {/* Axis baseline shadow (grounds the line) */}
      <line x1={pad - 6} y1={lineY + 2.5} x2={size - pad + 6} y2={lineY + 2.5}
        stroke="#000" strokeWidth="0.8" opacity="0.08" />
      {/* Axis line — subtle gradient stroke */}
      <line x1={pad - 6} y1={lineY} x2={size - pad + 6} y2={lineY}
        stroke={`url(#${uid}_axis)`} strokeWidth="2.2" strokeLinecap="round"
        markerEnd={`url(#${uid}_arr)`} />

      {natural && (
        <text x={size - pad + 10} y={lineY + 4} fontSize={11} fill={c.muted} fontStyle="italic">…</text>
      )}

      {/* Minor (half) ticks underneath, only when readable */}
      {showMinor && ticks.slice(0, -1).map(n => {
        const x = (toX(n) + toX(n + 1)) / 2;
        return (
          <line key={`m${n}`} x1={x} y1={lineY - 3} x2={x} y2={lineY + 3}
            stroke={c.muted} strokeWidth="0.8" opacity="0.55" />
        );
      })}

      {/* Major ticks + labels / spheres */}
      {ticks.map(n => {
        const x = toX(n);
        const isHi = highlight.includes(n);
        return (
          <g key={n}>
            {/* Tick mark — taller for highlighted */}
            <line
              x1={x} y1={lineY - (isHi ? 8 : 5)}
              x2={x} y2={lineY + (isHi ? 8 : 5)}
              stroke={isHi ? c.fill1 : c.muted}
              strokeWidth={isHi ? 2.2 : 1.3}
              strokeLinecap="round"
            />
            {isHi ? (
              <g filter={`url(#${uid}_rich)`}>
                {/* Sphere body */}
                <circle cx={x} cy={lineY - 20} r={13} fill={c.fill1} />
                {/* Glossy gradient overlay */}
                <circle cx={x} cy={lineY - 20} r={13} fill={`url(#${uid}_sphere)`} />
                {/* Soft top-left specular highlight */}
                <ellipse cx={x - 3.5} cy={lineY - 24} rx="4" ry="2.2"
                  fill="#fff" opacity="0.45" />
                {/* Number label centred */}
                <text x={x} y={lineY - 16} textAnchor="middle" fontSize={11}
                  fontWeight="800" fill={c.white} dominantBaseline="middle"
                  style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.25))' }}>
                  {n}
                </text>
              </g>
            ) : (
              <text x={x} y={lineY + 20} textAnchor="middle" fontSize={9.5}
                fontWeight="600" fill={c.dim}>
                {n}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─── 2. CountingVisual ────────────────────────────────────────────────────────
// Polished: every counter is a glossy 3D object with a radial-gradient body
// and a specular highlight at the top-left, grounded by a soft shadow. Groups
// alternate between primary and a secondary brand tint without losing depth.
export function CountingVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const { count = 5, shape = 'circle', color = 'primary', groups = 1 } = params;
  const n = Math.min(count, 20);
  const cols = n <= 5 ? n : Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / cols);
  const r = Math.min((size * 0.72) / (cols * 2.6), (size * 0.72) / (rows * 2.6), 18);
  const gapX = Math.min((size * 0.9 - r * 2) / Math.max(cols - 1, 1), r * 2.4);
  const gapY = Math.min((size * 0.72 - r * 2) / Math.max(rows - 1, 1), r * 2.6);
  const startX = (size - (cols - 1) * gapX) / 2;
  const startY = size * 0.12 + (size * 0.68 - (rows - 1) * gapY) / 2;
  const primaryFill   = color === 'accent' ? c.fill2 : color === 'success' ? c.fill3 : c.fill1;
  const secondaryFill = primaryFill === c.fill1 ? c.fill2 : c.fill1;

  const items = [];
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / cols), col = i % cols;
    const cx = startX + col * gapX, cy = startY + row * gapY;
    const grpColor = groups > 1
      ? (Math.floor(i / Math.ceil(n / groups)) % 2 === 0 ? primaryFill : secondaryFill)
      : primaryFill;
    const gradId = `${uid}_g${i}`;
    const key = `item${i}`;

    // Common props: depth shadow + body fill + glossy overlay
    if (shape === 'star') {
      const pts = Array.from({length:10}, (_,j) => {
        const a = (j * Math.PI) / 5 - Math.PI / 2;
        const rad = j % 2 === 0 ? r : r * 0.45;
        return `${cx + rad * Math.cos(a)},${cy + rad * Math.sin(a)}`;
      }).join(' ');
      items.push(
        <g key={key} filter={`url(#${uid}_rich)`}>
          <polygon points={pts} fill={grpColor} />
          <polygon points={pts} fill={`url(#${gradId})`} />
        </g>
      );
    } else if (shape === 'triangle') {
      items.push(
        <g key={key} filter={`url(#${uid}_rich)`}>
          <polygon points={`${cx},${cy-r} ${cx-r},${cy+r} ${cx+r},${cy+r}`} fill={grpColor} />
          <polygon points={`${cx},${cy-r} ${cx-r},${cy+r} ${cx+r},${cy+r}`} fill={`url(#${gradId})`} />
        </g>
      );
    } else if (shape === 'square') {
      items.push(
        <g key={key} filter={`url(#${uid}_rich)`}>
          <rect x={cx-r} y={cy-r} width={r*2} height={r*2} rx={r * 0.18} fill={grpColor} />
          <rect x={cx-r} y={cy-r} width={r*2} height={r*2} rx={r * 0.18} fill={`url(#${gradId})`} />
          {/* Top-left glossy stripe */}
          <rect x={cx-r+2} y={cy-r+2} width={r*2-4} height={r*0.5} rx={r*0.14}
            fill="#fff" opacity="0.22" />
        </g>
      );
    } else {
      // Circle — the canonical "counter token"
      items.push(
        <g key={key} filter={`url(#${uid}_rich)`}>
          <circle cx={cx} cy={cy} r={r} fill={grpColor} />
          <circle cx={cx} cy={cy} r={r} fill={`url(#${gradId})`} />
          {/* Specular highlight */}
          <ellipse cx={cx - r * 0.32} cy={cy - r * 0.40} rx={r * 0.36} ry={r * 0.22}
            fill="#fff" opacity="0.50" />
        </g>
      );
    }
  }

  // Collect unique gradient defs (one per item so each has a centred highlight)
  const gradientDefs = [];
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / cols), col = i % cols;
    const grpColor = groups > 1
      ? (Math.floor(i / Math.ceil(n / groups)) % 2 === 0 ? primaryFill : secondaryFill)
      : primaryFill;
    gradientDefs.push(
      <SphereGradient key={`g${i}`} id={`${uid}_g${i}`} base={grpColor} cx="32%" cy="28%" />
    );
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${n} tişt`}>
      <defs>
        <RichShadow id={`${uid}_rich`} near={0.8} far={2.2} opacityNear={0.20} opacityFar={0.10} />
        {gradientDefs}
      </defs>
      {items}
      {/* Total count badge */}
      <g transform={`translate(${size/2}, ${size * 0.92})`}>
        <rect x={-16} y={-10} width={32} height={20} rx={10}
          fill={primaryFill} opacity="0.10" />
        <text x={0} y={1} textAnchor="middle" dominantBaseline="middle"
          fontSize={13} fontWeight="800" fill={primaryFill}>
          {n}
        </text>
      </g>
    </svg>
  );
}

// ─── 3. BlocksVisual ─────────────────────────────────────────────────────────
// Polished: base-10 blocks rendered with isometric 3D depth. Each cell is a
// little cube — top face is lightest, left face medium, right face darker —
// so the place-value relationship reads as physical building blocks.
//   hundred = a 5×5 layered plate (one stack of cubes, viewed isometrically)
//   ten     = a 1×5 vertical stick
//   one     = a single cube
export function BlocksVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const { ones = 3, tens = 2, hundreds = 1 } = params;
  const hC = Math.min(hundreds, 2), tC = Math.min(tens, 5), oC = Math.min(ones, 9);

  // ── Helper: render an isometric cube at (x, y) with edge length `s` ──
  // Light from top-left: top face lightest, left medium, right darkest.
  const cube = (key, x, y, s, color) => {
    const dx = s * 0.55;   // isometric horizontal offset
    const dy = s * 0.30;   // isometric vertical offset
    const top    = lighten(color, 0.28);
    const left   = color;
    const right  = darken(color, 0.20);
    // Top: rhombus
    const topPts = [
      [x, y],
      [x + dx, y - dy],
      [x + s + dx, y - dy],
      [x + s, y],
    ].map(p => p.join(',')).join(' ');
    // Left face
    const leftPts = [
      [x, y],
      [x, y + s],
      [x + s, y + s],
      [x + s, y],
    ].map(p => p.join(',')).join(' ');
    // Right face
    const rightPts = [
      [x + s, y],
      [x + s + dx, y - dy],
      [x + s + dx, y + s - dy],
      [x + s, y + s],
    ].map(p => p.join(',')).join(' ');
    return (
      <g key={key}>
        <polygon points={leftPts}  fill={left}  stroke={darken(color, 0.32)} strokeWidth={0.4} strokeLinejoin="round" />
        <polygon points={rightPts} fill={right} stroke={darken(color, 0.32)} strokeWidth={0.4} strokeLinejoin="round" />
        <polygon points={topPts}   fill={top}   stroke={darken(color, 0.18)} strokeWidth={0.4} strokeLinejoin="round" />
      </g>
    );
  };

  const elems = [];
  const pad = size * 0.10;
  const labelH = size * 0.14;
  // Estimate widths so we can centre horizontally
  const cellSize = (hC > 0 ? (size * 0.06) : (size * 0.07));
  const cellGap  = cellSize * 0.05;
  const hundredW = (cellSize + cellGap) * 5 + cellSize * 0.55;
  const tenW     = cellSize + cellSize * 0.55;
  const oneW     = cellSize + cellSize * 0.55;
  const oneGap   = cellSize * 0.25;
  const groupGap = cellSize * 0.6;

  let cursorX = pad;
  // Compute total width for centering
  let totalW = 0;
  if (hC > 0) totalW += hC * hundredW + (hC - 1) * groupGap;
  if (tC > 0) totalW += (totalW ? groupGap : 0) + tC * tenW + (tC - 1) * cellGap * 2;
  if (oC > 0) totalW += (totalW ? groupGap : 0) + Math.min(oC, 3) * (oneW + oneGap);

  cursorX = (size - totalW) / 2;
  // Bottom-aligned y baseline for "ground" feel
  const baseY = (size - labelH - pad) - cellSize * 0.25;

  // ── Hundreds plates: 5×5 cube grid ──
  for (let h = 0; h < hC; h++) {
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        // back rows render first so iso depth stacks correctly
        const x = cursorX + col * (cellSize + cellGap);
        const y = baseY - row * (cellSize - cellGap * 0.5);
        elems.push(cube(`h${h}r${row}c${col}`, x, y, cellSize, c.fill1));
      }
    }
    cursorX += hundredW + groupGap;
  }

  // ── Tens sticks: 5-stack ──
  for (let t = 0; t < tC; t++) {
    for (let seg = 0; seg < 5; seg++) {
      const x = cursorX;
      const y = baseY - seg * (cellSize - cellGap * 0.5);
      elems.push(cube(`t${t}s${seg}`, x, y, cellSize, c.fill2));
    }
    cursorX += tenW + cellGap;
  }
  if (tC > 0) cursorX += groupGap - cellGap;

  // ── Ones: single cubes (wrap after 3) ──
  for (let o = 0; o < oC; o++) {
    const col = o % 3, row = Math.floor(o / 3);
    const x = cursorX + col * (oneW + oneGap);
    const y = baseY - row * (cellSize + oneGap);
    elems.push(cube(`o${o}`, x, y, cellSize, c.fill3));
  }

  // ── Ground shadow plate ──
  const groundY = baseY + cellSize + 4;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="bloklar">
      <ellipse cx={size / 2} cy={groundY} rx={totalW * 0.5} ry={cellSize * 0.18}
        fill="#000" opacity="0.10" />
      {elems}
      {/* Place-value label */}
      <g transform={`translate(${size/2}, ${size - pad * 0.55})`}>
        <rect x={-totalW * 0.5} y={-9} width={Math.max(totalW, 80)} height={18} rx={9}
          fill={c.fill1} opacity="0.08" />
        <text x={0} y={1} textAnchor="middle" dominantBaseline="middle"
          fontSize={Math.min(10, size * 0.08)} fontWeight={700} fill={c.fill1}>
          {hundreds > 0 && `${hundreds}×100`}{hundreds > 0 && (tens > 0 || ones > 0) ? ' · ' : ''}
          {tens > 0 && `${tens}×10`}{tens > 0 && ones > 0 ? ' · ' : ''}
          {ones > 0 && `${ones}×1`}
        </text>
      </g>
    </svg>
  );
}

// ─── 4. FractionVisual ───────────────────────────────────────────────────────
// Polished: pie slices wear a radial gradient (centre lighter, edge darker)
// so the disc reads as a real surface; empty slices are softly tinted with a
// dashed inner ring so they're clearly "missing". Bar mode gets a hatched
// fill for the empty cells. The fraction label sits in a pill badge below.
export function FractionVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const { num = 1, den = 4, visual: vtype = 'pie' } = params;
  const cx = size / 2, cy = size * 0.46, r = size * 0.34;

  // ─── BAR ────────────────────────────────────────────────────────────────
  if (vtype === 'bar') {
    const barH = size * 0.28, barY = size * 0.31;
    const segW = (size - 36) / den;
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${num}/${den}`}>
        <defs>
          <LinearLight id={`${uid}_segG`} from={lighten(c.fill2, 0.18)} to={c.fill2} x1="0%" y1="0%" x2="0%" y2="100%" />
          <RichShadow id={`${uid}_rich`} near={1} far={2.5} />
          <pattern id={`${uid}_hatch`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" fill={c.soft2} />
            <line x1="0" y1="0" x2="0" y2="6" stroke={c.fill2} strokeWidth="0.8" opacity="0.30" />
          </pattern>
        </defs>
        {Array.from({length: den}, (_, i) => {
          const filled = i < num;
          return (
            <g key={i} filter={filled ? `url(#${uid}_rich)` : undefined}>
              <rect
                x={18 + i * segW} y={barY} width={segW - 3} height={barH}
                fill={filled ? c.fill2 : `url(#${uid}_hatch)`}
                rx={4}
                stroke={filled ? darken(c.fill2, 0.10) : c.fill2}
                strokeOpacity={filled ? 1 : 0.35}
                strokeWidth={1.5}
              />
              {filled && (
                <rect
                  x={18 + i * segW} y={barY} width={segW - 3} height={barH}
                  fill={`url(#${uid}_segG)`} rx={4} opacity="0.55"
                />
              )}
            </g>
          );
        })}
        {/* Label pill */}
        <g transform={`translate(${size/2}, ${barY + barH + 22})`}>
          <rect x={-22} y={-12} width={44} height={24} rx={12} fill={c.fill2} opacity="0.12" />
          <text x={0} y={1} textAnchor="middle" dominantBaseline="middle"
            fontSize={14} fontWeight={800} fill={c.fill2}>{num}/{den}</text>
        </g>
      </svg>
    );
  }

  // ─── PIE ────────────────────────────────────────────────────────────────
  const sliceAngle = (2 * Math.PI) / den;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${num}/${den}`}>
      <defs>
        <radialGradient id={`${uid}_filled`} cx="40%" cy="36%" r="65%">
          <stop offset="0%"   stopColor={lighten(c.fill2, 0.30)} />
          <stop offset="55%"  stopColor={c.fill2} />
          <stop offset="100%" stopColor={darken(c.fill2, 0.12)} />
        </radialGradient>
        <radialGradient id={`${uid}_empty`} cx="40%" cy="36%" r="65%">
          <stop offset="0%"   stopColor={lighten(c.soft1, 0.10)} />
          <stop offset="100%" stopColor={c.soft1} />
        </radialGradient>
        <RichShadow id={`${uid}_rich`} near={1.5} far={4} />
      </defs>

      {/* Ground shadow under the pie */}
      <ellipse cx={cx} cy={cy + r + 4} rx={r * 0.85} ry={r * 0.10}
        fill="#000" opacity="0.10" />

      <g filter={`url(#${uid}_rich)`}>
        {Array.from({length: den}, (_, i) => {
          const a1 = -Math.PI / 2 + i * sliceAngle;
          const a2 = a1 + sliceAngle;
          const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
          const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
          const large = sliceAngle > Math.PI ? 1 : 0;
          const filled = i < num;
          return (
            <path key={i}
              d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`}
              fill={filled ? `url(#${uid}_filled)` : `url(#${uid}_empty)`}
              stroke={filled ? darken(c.fill2, 0.18) : c.muted}
              strokeOpacity={filled ? 0.30 : 0.40}
              strokeWidth={filled ? 0.8 : 1}
              strokeDasharray={filled ? undefined : '3,2'}
            />
          );
        })}
      </g>

      {/* Glossy specular arc on top-left of the disc */}
      <path
        d={`M ${cx - r * 0.55},${cy - r * 0.65} A ${r * 0.85},${r * 0.85} 0 0,1 ${cx + r * 0.20},${cy - r * 0.85}`}
        stroke="#fff" strokeWidth={r * 0.18} strokeLinecap="round"
        fill="none" opacity="0.35"
      />

      {/* White separators between slices — only over the filled→empty boundary */}
      {Array.from({length: den}, (_, i) => {
        const a = -Math.PI / 2 + i * sliceAngle;
        const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
        return (
          <line key={`sep${i}`} x1={cx} y1={cy} x2={x} y2={y}
            stroke="#fff" strokeWidth={1.6} opacity="0.85" />
        );
      })}

      {/* Centre pin */}
      <circle cx={cx} cy={cy} r={3.5} fill={c.white} stroke={c.muted} strokeOpacity="0.3" strokeWidth={0.5} />

      {/* Label pill */}
      <g transform={`translate(${cx}, ${cy + r + 22})`}>
        <rect x={-24} y={-12} width={48} height={24} rx={12} fill={c.fill2} opacity="0.12" />
        <text x={0} y={1} textAnchor="middle" dominantBaseline="middle"
          fontSize={15} fontWeight={800} fill={c.fill2}>{num}/{den}</text>
      </g>
    </svg>
  );
}

// ─── 5. OperationVisual ──────────────────────────────────────────────────────
// Polished: counters are glossy spheres (radial gradient + specular). The
// operation symbol sits inside a tinted badge so it reads as a "function"
// applied between operands; result lives in a logo-coral pill at the right.
// Subtraction marks removed tokens with a red cross overlay + lower opacity.
export function OperationVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const { op = 'add', a = 3, b = 2 } = params;
  const aCount = Math.min(a, 7), bCount = Math.min(b, 7);
  const slots = op === 'sub' ? aCount + 2 : aCount + bCount + 4;
  const r = Math.min((size * 0.80) / (slots * 2.2), 13);
  const gapX = r * 2.3;
  const midY = size * 0.42;
  const opSyms = { add: '+', sub: '−', mul: '×', div: '÷' };
  const symText = opSyms[op];
  const symColor = op === 'add' ? c.fill3 : op === 'sub' ? c.fill5 : op === 'mul' ? c.fill2 : c.fill4;
  const result = op === 'add' ? a + b : op === 'sub' ? a - b : op === 'mul' ? a * b : b !== 0 ? Math.floor(a / b) : 0;

  // Sphere counter
  const sphere = (key, x, y, base, gid) => (
    <g key={key} filter={`url(#${uid}_rich)`}>
      <circle cx={x} cy={y} r={r} fill={base} />
      <circle cx={x} cy={y} r={r} fill={`url(#${gid})`} />
      <ellipse cx={x - r * 0.32} cy={y - r * 0.40} rx={r * 0.30} ry={r * 0.18}
        fill="#fff" opacity="0.55" />
    </g>
  );

  const items = [];
  if (op === 'sub') {
    for (let i = 0; i < aCount; i++) {
      const x = r + 4 + i * gapX;
      const isRemoved = i >= aCount - bCount;
      if (isRemoved) {
        // Dim sphere + red cross
        items.push(
          <g key={`s${i}`} opacity="0.40">
            {sphere(`g${i}`, x, midY, c.fill1, `${uid}_g1`)}
          </g>
        );
        items.push(
          <g key={`x${i}`}>
            <line x1={x - r * 0.85} y1={midY - r * 0.85} x2={x + r * 0.85} y2={midY + r * 0.85}
              stroke={c.fill5} strokeWidth={2.5} strokeLinecap="round" />
            <line x1={x + r * 0.85} y1={midY - r * 0.85} x2={x - r * 0.85} y2={midY + r * 0.85}
              stroke={c.fill5} strokeWidth={2.5} strokeLinecap="round" />
          </g>
        );
      } else {
        items.push(sphere(`s${i}`, x, midY, c.fill1, `${uid}_g1`));
      }
    }
  } else {
    for (let i = 0; i < aCount; i++) {
      items.push(sphere(`a${i}`, r + 4 + i * gapX, midY, c.fill1, `${uid}_g1`));
    }
    const symX = r + 4 + aCount * gapX + gapX * 0.5;
    items.push(
      <g key="sym">
        <rect x={symX - 12} y={midY - 12} width={24} height={24} rx={6}
          fill={symColor} opacity="0.14" />
        <text x={symX} y={midY + 5} textAnchor="middle"
          fontSize={18} fontWeight={900} fill={symColor}>{symText}</text>
      </g>
    );
    const bStartX = symX + gapX * 0.6;
    for (let i = 0; i < bCount; i++) {
      items.push(sphere(`b${i}`, bStartX + i * gapX, midY, c.fill2, `${uid}_g2`));
    }
    const eqX = bStartX + bCount * gapX + gapX * 0.5;
    items.push(
      <text key="eq" x={eqX} y={midY + 5} textAnchor="middle"
        fontSize={16} fontWeight={700} fill={c.muted}>=</text>
    );
    items.push(
      <g key="res">
        <rect x={eqX + gapX * 0.55 - 12} y={midY - 13} width={26} height={26} rx={13}
          fill={c.fill1} opacity="0.16" />
        <text x={eqX + gapX * 0.55} y={midY + 5} textAnchor="middle"
          fontSize={15} fontWeight={900} fill={c.fill1}>{result}</text>
      </g>
    );
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img"
      aria-label={`${a} ${symText} ${b} = ${result}`}>
      <defs>
        <RichShadow id={`${uid}_rich`} near={0.8} far={2.2} opacityNear={0.20} opacityFar={0.10} />
        <SphereGradient id={`${uid}_g1`} base={c.fill1} cx="32%" cy="28%" />
        <SphereGradient id={`${uid}_g2`} base={c.fill2} cx="32%" cy="28%" />
      </defs>
      {items}
      {/* Equation label as a pill below the visual */}
      <g transform={`translate(${size / 2}, ${size * 0.78})`}>
        <rect x={-44} y={-12} width={88} height={24} rx={12}
          fill={symColor} opacity="0.10" />
        <text x={0} y={1} textAnchor="middle" dominantBaseline="middle"
          fontSize={13} fontWeight={800} fill={symColor}>
          {a} {symText} {b} = {result}
        </text>
      </g>
    </svg>
  );
}

// ─── 6. CompareVisual ────────────────────────────────────────────────────────
// Polished: two rows of glossy sphere counters (top teal, bottom coral) make
// the inequality readable at a glance; the comparison symbol lives in its own
// tinted badge to the right, scaled large enough to feel like the focal point.
export function CompareVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const { a = 5, b = 3, type = 'greater' } = params;
  const maxN = 8, r = size * 0.058, gapX = r * 2.3;
  const aCount = Math.min(a, maxN), bCount = Math.min(b, maxN);
  const rowY1 = size * 0.30, rowY2 = size * 0.62;

  const sphere = (key, x, y, gid, base) => (
    <g key={key} filter={`url(#${uid}_rich)`}>
      <circle cx={x} cy={y} r={r} fill={base} />
      <circle cx={x} cy={y} r={r} fill={`url(#${gid})`} />
      <ellipse cx={x - r * 0.32} cy={y - r * 0.40} rx={r * 0.30} ry={r * 0.18}
        fill="#fff" opacity="0.55" />
    </g>
  );

  const makeRow = (n, gid, base, y) =>
    Array.from({ length: n }, (_, i) => sphere(`${y}_${i}`, r + 4 + i * gapX, y, gid, base));

  const sym = type === 'greater' ? '>' : type === 'less' ? '<' : '=';
  const symColor = type === 'equal' ? c.fill3 : c.fill2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img"
      aria-label={`${a} ${sym} ${b}`}>
      <defs>
        <RichShadow id={`${uid}_rich`} near={0.8} far={2.2} opacityNear={0.20} opacityFar={0.10} />
        <SphereGradient id={`${uid}_top`}    base={c.fill1} cx="32%" cy="28%" />
        <SphereGradient id={`${uid}_bottom`} base={c.fill2} cx="32%" cy="28%" />
      </defs>
      {makeRow(aCount, `${uid}_top`, c.fill1, rowY1)}
      {makeRow(bCount, `${uid}_bottom`, c.fill2, rowY2)}

      {/* Comparison symbol in a tinted badge — focal point */}
      <g transform={`translate(${size * 0.74}, ${size * 0.46})`}>
        <rect x={-22} y={-22} width={44} height={44} rx={12}
          fill={symColor} opacity="0.14" />
        <text x={0} y={1} textAnchor="middle" dominantBaseline="middle"
          fontSize={30} fontWeight={900} fill={symColor}>{sym}</text>
      </g>

      {/* Count labels next to each row */}
      <g transform={`translate(${r + 4 + aCount * gapX + r * 2.2}, ${rowY1})`}>
        <rect x={-12} y={-9} width={24} height={18} rx={9} fill={c.fill1} opacity="0.12" />
        <text x={0} y={1} textAnchor="middle" dominantBaseline="middle"
          fontSize={11} fontWeight={800} fill={c.fill1}>{a}</text>
      </g>
      <g transform={`translate(${r + 4 + bCount * gapX + r * 2.2}, ${rowY2})`}>
        <rect x={-12} y={-9} width={24} height={18} rx={9} fill={c.fill2} opacity="0.12" />
        <text x={0} y={1} textAnchor="middle" dominantBaseline="middle"
          fontSize={11} fontWeight={800} fill={c.fill2}>{b}</text>
      </g>
    </svg>
  );
}

// ─── 7. GeometryVisual ───────────────────────────────────────────────────────
export function GeometryVisual({ visual, params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const type = (visual && visual.type !== 'line' && visual.type !== 'triangle' && visual.type !== 'quadrilateral' && visual.type !== 'circle' && visual.type !== 'angle' && visual.type !== 'point')
    ? (params.type || 'triangle')
    : (params.type || visual?.type || 'triangle');
  const cx = size / 2, cy = size * 0.47;
  const s = size * 0.36;

  // Shared gradient + shadow definitions used by every shape variant below.
  // Body gradient lifts flat fills off the surface; sphereGrad makes vertex
  // dots feel like physical pins instead of stickers.
  const mkSvg = (content, ariaLabel) => (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={ariaLabel}>
      <defs>
        <linearGradient id={`${uid}_body`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={lighten(c.fill1, 0.85)} />
          <stop offset="100%" stopColor={c.soft1} />
        </linearGradient>
        <linearGradient id={`${uid}_stroke`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.fill1} />
          <stop offset="100%" stopColor={darken(c.fill1, 0.15)} />
        </linearGradient>
        <SphereGradient id={`${uid}_vert`} base={c.fill1} cx="32%" cy="28%" />
        <RichShadow id={`${uid}_rich`} near={1.2} far={3} />
        <marker id={`${uid}_al`} markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
          <path d="M0,0.5 L6.5,3.5 L0,6.5 Z" fill={c.fill1} />
        </marker>
        <marker id={`${uid}_ar`} markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto-start-reverse">
          <path d="M0,0.5 L6.5,3.5 L0,6.5 Z" fill={c.fill1} />
        </marker>
        <ShadowDef id={`${uid}_sh`} blur={3} opacity={0.15} />
      </defs>
      {content}
    </svg>
  );

  // Helper: a sphere-look vertex point
  const vertex = (key, x, y, r = 4) => (
    <g key={key} filter={`url(#${uid}_rich)`}>
      <circle cx={x} cy={y} r={r} fill={c.fill1} />
      <circle cx={x} cy={y} r={r} fill={`url(#${uid}_vert)`} />
    </g>
  );

  if (type === 'point') {
    return mkSvg(<>
      <line x1={cx-s} y1={cy} x2={cx+s} y2={cy} stroke={c.line} strokeWidth={1} strokeDasharray="5,4" />
      <line x1={cx} y1={cy-s} x2={cx} y2={cy+s} stroke={c.line} strokeWidth={1} strokeDasharray="5,4" />
      {vertex('p', cx, cy, 8)}
      <text x={cx+14} y={cy-12} fontSize={13} fontWeight={800} fill={c.fill1}>A</text>
    </>, 'xal');
  }
  if (type === 'line') {
    return mkSvg(<>
      <line x1={18} y1={cy} x2={size-18} y2={cy} stroke={c.fill1} strokeWidth={2.5}
        markerStart={`url(#${uid}_ar)`} markerEnd={`url(#${uid}_al)`} />
      <text x={size/2} y={cy+20} textAnchor="middle" fontSize={10} fill={c.dim}>xêz</text>
    </>, 'xêz');
  }
  if (type === 'segment') {
    return mkSvg(<>
      <line x1={22} y1={cy} x2={size-22} y2={cy} stroke={`url(#${uid}_stroke)`} strokeWidth={3} strokeLinecap="round" />
      {vertex('a', 22, cy, 5.5)}
      {vertex('b', size-22, cy, 5.5)}
      <text x={22} y={cy-14} fontSize={11} fontWeight={800} fill={c.fill1}>A</text>
      <text x={size-22} y={cy-14} fontSize={11} fontWeight={800} fill={c.fill1}>B</text>
    </>, 'beş');
  }
  if (type === 'ray') {
    return mkSvg(<>
      <line x1={22} y1={cy} x2={size-18} y2={cy} stroke={`url(#${uid}_stroke)`} strokeWidth={3} strokeLinecap="round"
        markerEnd={`url(#${uid}_al)`} />
      {vertex('a', 22, cy, 5.5)}
      <text x={22} y={cy-14} fontSize={11} fontWeight={800} fill={c.fill1}>A</text>
    </>, 'tîr');
  }
  if (type === 'parallel') {
    return mkSvg(<>
      <line x1={22} y1={size*0.32} x2={size-22} y2={size*0.32} stroke={c.fill1} strokeWidth={2.5} />
      <line x1={22} y1={size*0.58} x2={size-22} y2={size*0.58} stroke={c.fill2} strokeWidth={2.5} />
      {/* Tick marks for parallel */}
      <line x1={size*0.45} y1={size*0.28} x2={size*0.48} y2={size*0.36} stroke={c.fill1} strokeWidth={2} />
      <line x1={size*0.45} y1={size*0.54} x2={size*0.48} y2={size*0.62} stroke={c.fill2} strokeWidth={2} />
      <text x={size*0.88} y={size*0.30} fontSize={11} fontStyle="italic" fill={c.fill1}>ℓ₁</text>
      <text x={size*0.88} y={size*0.56} fontSize={11} fontStyle="italic" fill={c.fill2}>ℓ₂</text>
      <text x={size/2} y={size*0.80} textAnchor="middle" fontSize={12} fontWeight={700} fill={c.dim}>ℓ₁ ∥ ℓ₂</text>
    </>, 'paralel xêz');
  }
  if (type === 'perpendicular') {
    return mkSvg(<>
      <line x1={18} y1={cy} x2={size-18} y2={cy} stroke={c.fill1} strokeWidth={2.5} />
      <line x1={cx} y1={size*0.14} x2={cx} y2={size*0.82} stroke={c.fill2} strokeWidth={2.5} />
      <rect x={cx} y={cy} width={10} height={10} fill="none" stroke={c.fill2} strokeWidth={1.8} />
      <text x={size/2} y={size*0.88} textAnchor="middle" fontSize={12} fontWeight={700} fill={c.dim}>90°</text>
    </>, 'perpendîkular');
  }
  if (type === 'triangle' || type === 'equilateral' || type === 'right_triangle') {
    let pts;
    if (type === 'equilateral') {
      pts = [[cx, cy-s*1.0], [cx-s*1.0, cy+s*0.62], [cx+s*1.0, cy+s*0.62]];
    } else if (type === 'right_triangle') {
      pts = [[cx-s*0.85, cy-s*0.75], [cx-s*0.85, cy+s*0.65], [cx+s*0.85, cy+s*0.65]];
    } else {
      pts = [[cx, cy-s*0.95], [cx-s*0.92, cy+s*0.72], [cx+s*0.78, cy+s*0.72]];
    }
    const pStr = pts.map(p => p.join(',')).join(' ');
    return mkSvg(<>
      <g filter={`url(#${uid}_rich)`}>
        <polygon points={pStr} fill={`url(#${uid}_body)`} stroke={`url(#${uid}_stroke)`} strokeWidth={2.5}
          strokeLinejoin="round" />
      </g>
      {type === 'right_triangle' && (
        <rect x={pts[0][0]} y={pts[0][1]} width={12} height={12}
          fill="none" stroke={c.fill1} strokeWidth={1.8} strokeOpacity={0.55} />
      )}
      {pts.map((p, i) => vertex(`v${i}`, p[0], p[1], 4.5))}
    </>, 'sêgoşe');
  }
  if (type === 'quadrilateral' || type === 'square' || type === 'rectangle') {
    const rw = type === 'rectangle' ? s * 1.55 : s * 0.92;
    const rh = s * 0.92;
    return mkSvg(<>
      <g filter={`url(#${uid}_rich)`}>
        <rect x={cx-rw/2} y={cy-rh/2} width={rw} height={rh}
          fill={`url(#${uid}_body)`} stroke={`url(#${uid}_stroke)`} strokeWidth={2.5}
          rx={type === 'quadrilateral' ? 4 : 0} strokeLinejoin="round" />
      </g>
      {type === 'square' && <>
        {/* Equal side ticks */}
        <line x1={cx-rw/2+4} y1={cy-4} x2={cx-rw/2+11} y2={cy-4} stroke={c.fill1} strokeWidth={2} strokeLinecap="round" />
        <line x1={cx+rw/2-11} y1={cy-4} x2={cx+rw/2-4} y2={cy-4} stroke={c.fill1} strokeWidth={2} strokeLinecap="round" />
        <line x1={cx-4} y1={cy-rh/2+4} x2={cx-4} y2={cy-rh/2+11} stroke={c.fill1} strokeWidth={2} strokeLinecap="round" />
        <line x1={cx-4} y1={cy+rh/2-11} x2={cx-4} y2={cy+rh/2-4} stroke={c.fill1} strokeWidth={2} strokeLinecap="round" />
      </>}
      {/* Corner vertices */}
      {vertex('c1', cx-rw/2, cy-rh/2, 3.5)}
      {vertex('c2', cx+rw/2, cy-rh/2, 3.5)}
      {vertex('c3', cx+rw/2, cy+rh/2, 3.5)}
      {vertex('c4', cx-rw/2, cy+rh/2, 3.5)}
    </>, type === 'square' ? 'çargoşe' : type === 'rectangle' ? 'tîrêj' : 'çargoşe');
  }
  if (type === 'circle') {
    const { showRadius = true } = params;
    return mkSvg(<>
      <g filter={`url(#${uid}_rich)`}>
        <circle cx={cx} cy={cy} r={s} fill={`url(#${uid}_body)`}
          stroke={`url(#${uid}_stroke)`} strokeWidth={2.5} />
      </g>
      {/* Glossy specular arc top-left */}
      <path
        d={`M ${cx - s * 0.55},${cy - s * 0.65} A ${s * 0.85},${s * 0.85} 0 0,1 ${cx + s * 0.20},${cy - s * 0.85}`}
        stroke="#fff" strokeWidth={s * 0.14} strokeLinecap="round"
        fill="none" opacity="0.30"
      />
      {vertex('o', cx, cy, 4)}
      {showRadius && <>
        <line x1={cx} y1={cy} x2={cx+s} y2={cy} stroke={c.fill2} strokeWidth={1.8} strokeDasharray="5,3" />
        <text x={cx+s/2} y={cy-10} textAnchor="middle" fontSize={11} fontWeight={800} fill={c.fill2}>r</text>
      </>}
    </>, 'xemberî');
  }
  if (type === 'angle') {
    const { degrees = 60 } = params;
    const rad = (degrees * Math.PI) / 180;
    const len = s * 0.92;
    const x2 = cx + len, y2 = cy;
    const x3 = cx + len * Math.cos(-rad), y3 = cy + len * Math.sin(-rad);
    const arcR = len * 0.38;
    const large = degrees > 180 ? 1 : 0;
    // Filled arc using coral gradient so the angle wedge reads as a real surface
    return mkSvg(<>
      <line x1={cx} y1={cy} x2={x2} y2={y2} stroke={`url(#${uid}_stroke)`} strokeWidth={2.8} strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={x3} y2={y3} stroke={`url(#${uid}_stroke)`} strokeWidth={2.8} strokeLinecap="round" />
      <path
        d={`M${cx},${cy} L${cx+arcR},${cy} A${arcR},${arcR} 0 ${large},1 ${cx+arcR*Math.cos(-rad)},${cy+arcR*Math.sin(-rad)} Z`}
        fill={c.soft2}
        stroke={c.fill2}
        strokeWidth={1.5}
        opacity={0.92}
      />
      {vertex('o', cx, cy, 5)}
      <text x={cx + arcR * 1.55 * Math.cos(-rad / 2)}
        y={cy + arcR * 1.55 * Math.sin(-rad / 2) + 4}
        textAnchor="middle" fontSize={12} fontWeight={800} fill={c.fill2}>{degrees}°</text>
    </>, `${degrees} derece goşe`);
  }
  // Default triangle
  const pts = [[cx, cy-s], [cx-s, cy+s*0.72], [cx+s, cy+s*0.72]];
  return mkSvg(<>
    <g filter={`url(#${uid}_rich)`}>
      <polygon points={pts.map(p=>p.join(',')).join(' ')}
        fill={`url(#${uid}_body)`} stroke={`url(#${uid}_stroke)`} strokeWidth={2.5}
        strokeLinejoin="round" />
    </g>
    {pts.map((p, i) => vertex(`v${i}`, p[0], p[1], 4))}
  </>, 'şekl');
}

// ─── 8. Geometry3DVisual ─────────────────────────────────────────────────────
// Polished: 3D primitives wear face-specific gradients (top brightest, sides
// graduated) plus a top-left specular highlight that sells the "lit from
// above" illusion. Ground shadow ellipses anchor each shape on the surface.
export function Geometry3DVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const { shape = 'cube' } = params;
  const cx = size / 2, cy = size * 0.48, s = size * 0.30;

  // Pre-compute palette stops for face shading
  const topLight  = lighten(c.fill1, 0.35);
  const sideMid   = c.fill1;
  const sideDark  = darken(c.fill1, 0.20);

  const mkSvg = (content) => (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={shape}>
      <defs>
        <RichShadow id={`${uid}_rich`} near={1.5} far={4} />
        <linearGradient id={`${uid}_top`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={topLight} />
          <stop offset="100%" stopColor={sideMid} />
        </linearGradient>
        <linearGradient id={`${uid}_side`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor={sideMid} />
          <stop offset="100%" stopColor={sideDark} />
        </linearGradient>
        <linearGradient id={`${uid}_front`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={lighten(c.fill1, 0.15)} />
          <stop offset="100%" stopColor={sideMid} />
        </linearGradient>
        <radialGradient id={`${uid}_sphere`} cx="32%" cy="28%" r="68%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="20%"  stopColor={topLight} stopOpacity="0.85" />
          <stop offset="60%"  stopColor={c.fill1} />
          <stop offset="100%" stopColor={sideDark} />
        </radialGradient>
      </defs>
      {/* Ground shadow */}
      <ellipse cx={cx} cy={cy + s + 8} rx={s * 0.95} ry={s * 0.14}
        fill="#000" opacity="0.14" />
      {content}
    </svg>
  );

  if (shape === 'cube') {
    const d = s * 0.52;
    const x1 = cx - s,  y1 = cy - s * 0.65 + d;     // front-top-left
    const x2 = cx + s,  y2 = y1;                    // front-top-right
    const x3 = cx + s,  y3 = cy + s * 0.65 + d;     // front-bottom-right
    const x4 = cx - s,  y4 = y3;                    // front-bottom-left
    const x1b = x1 + d, y1b = y1 - d;               // back-top-left
    const x2b = x2 + d, y2b = y2 - d;               // back-top-right
    const x3b = x3 + d, y3b = y3 - d;               // back-bottom-right
    return mkSvg(<>
      <g filter={`url(#${uid}_rich)`}>
        {/* Right face */}
        <polygon points={`${x2},${y2} ${x2b},${y2b} ${x3b},${y3b} ${x3},${y3}`}
          fill={`url(#${uid}_side)`} stroke={sideDark} strokeWidth={0.6} strokeLinejoin="round" />
        {/* Top face */}
        <polygon points={`${x1},${y1} ${x1b},${y1b} ${x2b},${y2b} ${x2},${y2}`}
          fill={`url(#${uid}_top)`} stroke={sideMid} strokeWidth={0.6} strokeLinejoin="round" />
        {/* Front face */}
        <polygon points={`${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`}
          fill={`url(#${uid}_front)`} stroke={sideMid} strokeWidth={0.6} strokeLinejoin="round" />
      </g>
      {/* Top-left specular */}
      <polygon points={`${x1+3},${y1+3} ${x1+s*0.5},${y1+3} ${x1+s*0.5},${y1+8} ${x1+3},${y1+8}`}
        fill="#fff" opacity="0.18" />
    </>);
  }
  if (shape === 'sphere') {
    return mkSvg(<>
      <g filter={`url(#${uid}_rich)`}>
        <circle cx={cx} cy={cy} r={s * 1.05} fill={`url(#${uid}_sphere)`} />
      </g>
      {/* Specular highlight */}
      <ellipse cx={cx - s * 0.34} cy={cy - s * 0.40} rx={s * 0.30} ry={s * 0.18}
        fill="#fff" opacity="0.55" />
      {/* Equator hint (dashed) */}
      <ellipse cx={cx} cy={cy} rx={s * 1.05} ry={s * 0.32}
        fill="none" stroke={sideDark} strokeWidth={1} strokeDasharray="4,3" opacity="0.40" />
    </>);
  }
  if (shape === 'cylinder') {
    return mkSvg(<>
      <g filter={`url(#${uid}_rich)`}>
        {/* Side */}
        <rect x={cx - s * 0.85} y={cy - s} width={s * 1.7} height={s * 2}
          fill={`url(#${uid}_side)`} stroke={sideMid} strokeWidth={0.8} />
        {/* Bottom ellipse (visible behind body for closed look) */}
        <ellipse cx={cx} cy={cy + s} rx={s * 0.85} ry={s * 0.28}
          fill={sideDark} stroke={sideDark} strokeWidth={0.8} />
        {/* Top ellipse */}
        <ellipse cx={cx} cy={cy - s} rx={s * 0.85} ry={s * 0.28}
          fill={`url(#${uid}_top)`} stroke={sideMid} strokeWidth={0.8} />
      </g>
      {/* Vertical specular stripe on the left side of body */}
      <rect x={cx - s * 0.70} y={cy - s + 4} width={s * 0.18} height={s * 2 - 8}
        fill="#fff" opacity="0.18" rx={2} />
    </>);
  }
  if (shape === 'cone') {
    return mkSvg(<>
      <g filter={`url(#${uid}_rich)`}>
        <polygon points={`${cx},${cy - s * 1.15} ${cx - s},${cy + s * 0.82} ${cx + s},${cy + s * 0.82}`}
          fill={`url(#${uid}_front)`} stroke={sideMid} strokeWidth={0.8} strokeLinejoin="round" />
        <ellipse cx={cx} cy={cy + s * 0.82} rx={s} ry={s * 0.30}
          fill={`url(#${uid}_top)`} stroke={sideMid} strokeWidth={0.8} />
      </g>
      {/* Specular stripe down the left slope */}
      <path d={`M ${cx - s * 0.6},${cy - s * 0.4} L ${cx - s * 0.85},${cy + s * 0.6}`}
        stroke="#fff" strokeWidth={s * 0.10} strokeLinecap="round" opacity="0.25" />
    </>);
  }
  // Prism (default)
  return mkSvg(<>
    <g filter={`url(#${uid}_rich)`}>
      <polygon
        points={`${cx},${cy - s * 0.95} ${cx - s * 0.85},${cy + s * 0.52} ${cx + s * 0.85},${cy + s * 0.52}`}
        fill={`url(#${uid}_front)`} stroke={sideMid} strokeWidth={0.8} strokeLinejoin="round" />
      <polygon
        points={`${cx + s * 0.85},${cy + s * 0.52} ${cx + s * 0.85 + s * 0.4},${cy + s * 0.18} ${cx + s * 0.4},${cy - s * 1.3} ${cx},${cy - s * 0.95}`}
        fill={`url(#${uid}_side)`} stroke={sideMid} strokeWidth={0.8} strokeLinejoin="round" />
    </g>
  </>);
}

// ─── 9. CoordinateVisual ─────────────────────────────────────────────────────
// Polished: axes wear a subtle gradient stroke that fades toward the arrowhead;
// the plotted point is a glossy sphere; dashed coordinate lines pulse softly
// toward each axis to show projection.
export function CoordinateVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const { direction = null, showGrid = false } = params;
  const w = size, h = size;
  const cx = w * 0.40, cy = h * 0.55;

  // Shared sphere highlight used by points
  const SphereDot = ({ x, y, r = 7, color = c.fill1 }) => (
    <g filter={`url(#${uid}_rich)`}>
      <circle cx={x} cy={y} r={r} fill={color} />
      <circle cx={x} cy={y} r={r} fill={`url(#${uid}_sphereGen)`} />
      <ellipse cx={x - r * 0.32} cy={y - r * 0.38} rx={r * 0.32} ry={r * 0.20}
        fill="#fff" opacity="0.55" />
    </g>
  );

  if (direction === 'inside_outside') {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label="nav û derve">
        <defs>
          <RichShadow id={`${uid}_rich`} near={1} far={2.5} />
          <SphereGradient id={`${uid}_sphereGen`} base={c.fill1} cx="32%" cy="28%" />
          <radialGradient id={`${uid}_inner`} cx="40%" cy="36%" r="65%">
            <stop offset="0%" stopColor={lighten(c.fill1, 0.40)} />
            <stop offset="100%" stopColor={c.fill1} />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={44} fill="none" stroke={c.line} strokeWidth={2} strokeDasharray="5,3" />
        <g filter={`url(#${uid}_rich)`}>
          <circle cx={cx} cy={cy} r={24} fill={`url(#${uid}_inner)`} stroke={darken(c.fill1, 0.1)} strokeWidth={2} />
        </g>
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize={10} fontWeight={800} fill={c.white}>nav</text>
        <text x={cx + 54} y={cy - 22} fontSize={10} fontWeight={700} fill={c.muted}>derve</text>
        <line x1={cx + 24} y1={cy - 10} x2={cx + 46} y2={cy - 24} stroke={c.muted} strokeWidth={1} strokeDasharray="3,2" />
      </svg>
    );
  }
  if (direction === 'near_far') {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label="nêzîk û dûr">
        <defs>
          <RichShadow id={`${uid}_rich`} near={1} far={2.5} />
          <SphereGradient id={`${uid}_sphereGen`} base={c.fill1} cx="32%" cy="28%" />
          <SphereGradient id={`${uid}_sphereFar`} base={c.fill1} cx="32%" cy="28%" />
        </defs>
        <SphereDot x={cx} y={cy} r={13} />
        <g opacity="0.42"><SphereDot x={cx + 64} y={cy} r={13} /></g>
        <line x1={cx + 14} y1={cy} x2={cx + 50} y2={cy} stroke={c.fill2} strokeWidth={2} strokeDasharray="4,3" />
        <text x={cx} y={cy + 28} textAnchor="middle" fontSize={10} fontWeight={800} fill={c.fill1}>nêzîk</text>
        <text x={cx + 64} y={cy + 28} textAnchor="middle" fontSize={10} fontWeight={700} fill={c.muted}>dûr</text>
      </svg>
    );
  }

  const gridElems = [];
  if (showGrid) {
    for (let i = -3; i <= 3; i++) {
      gridElems.push(
        <line key={`gx${i}`} x1={cx + i * 22} y1={12} x2={cx + i * 22} y2={h - 12}
          stroke={c.line} strokeWidth={0.5} opacity={0.4} />,
        <line key={`gy${i}`} x1={12} y1={cy + i * 22} x2={w - 12} y2={cy + i * 22}
          stroke={c.line} strokeWidth={0.5} opacity={0.4} />
      );
    }
  }

  const dirElems = [];
  if (direction === 'above_below') {
    dirElems.push(
      <text key="above" x={cx + 8} y={cy - 28} fontSize={11} fontWeight={800} fill={c.fill1}>↑ Ser</text>,
      <text key="below" x={cx + 8} y={cy + 34} fontSize={11} fontWeight={800} fill={c.fill2}>↓ Bin</text>
    );
  } else if (direction === 'left_right') {
    dirElems.push(
      <text key="right" x={cx + 22} y={cy - 10} fontSize={11} fontWeight={800} fill={c.fill1}>Rast →</text>,
      <text key="left" x={14} y={cy - 10} fontSize={11} fontWeight={800} fill={c.fill2}>← Çep</text>
    );
  } else {
    // Default: plotted point at (2, 3) with projection lines
    const px = cx + 44, py = cy - 44;
    dirElems.push(
      <line key="dx" x1={px} y1={cy} x2={px} y2={py} stroke={c.fill2} strokeWidth={1.2} strokeDasharray="3,2" opacity={0.55} />,
      <line key="dy" x1={cx} y1={py} x2={px} y2={py} stroke={c.fill2} strokeWidth={1.2} strokeDasharray="3,2" opacity={0.55} />,
      <SphereDot key="dot" x={px} y={py} r={7} color={c.fill2} />,
      <g key="lbl" transform={`translate(${px + 12}, ${py - 12})`}>
        <rect x={-2} y={-9} width={32} height={16} rx={8} fill={c.fill2} opacity="0.12" />
        <text x={14} y={2} textAnchor="middle" dominantBaseline="middle"
          fontSize={9} fontWeight={800} fill={c.fill2}>(2,3)</text>
      </g>
    );
  }

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label="koordînat">
      <defs>
        <RichShadow id={`${uid}_rich`} near={1} far={2.5} />
        <SphereGradient id={`${uid}_sphereGen`} base={c.fill2} cx="32%" cy="28%" />
        <linearGradient id={`${uid}_axisX`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={c.line} />
          <stop offset="80%" stopColor={c.muted} />
        </linearGradient>
        <linearGradient id={`${uid}_axisY`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={c.line} />
          <stop offset="80%" stopColor={c.muted} />
        </linearGradient>
        <marker id={`${uid}_ca`} markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0.5 L5.5,3 L0,5.5 Z" fill={c.muted} />
        </marker>
      </defs>
      {gridElems}
      {/* Axes with subtle baseline shadow */}
      <line x1={14} y1={cy + 1.5} x2={w - 12} y2={cy + 1.5} stroke="#000" strokeWidth={0.6} opacity="0.08" />
      <line x1={14} y1={cy} x2={w - 12} y2={cy} stroke={`url(#${uid}_axisX)`} strokeWidth={2}
        strokeLinecap="round" markerEnd={`url(#${uid}_ca)`} />
      <line x1={cx} y1={h - 14} x2={cx} y2={12} stroke={`url(#${uid}_axisY)`} strokeWidth={2}
        strokeLinecap="round" markerEnd={`url(#${uid}_ca)`} />
      <text x={w - 10} y={cy - 5} fontSize={10} fontWeight={700} fill={c.muted}>x</text>
      <text x={cx + 5} y={16} fontSize={10} fontWeight={700} fill={c.muted}>y</text>
      {/* Origin dot */}
      <circle cx={cx} cy={cy} r={2.5} fill={c.muted} />
      {dirElems}
    </svg>
  );
}

// ─── 10. SymmetryVisual ──────────────────────────────────────────────────────
// Polished: two mirror-image wings — left wears the logo teal gradient, right
// the coral gradient — so symmetry reads as "the same shape, reflected across
// the axis". A glowing axis underscores the reflection plane.
export function SymmetryVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const cx = size / 2, h = size;
  const showLabel = params.label !== false;
  return (
    <svg width={size} height={h} viewBox={`0 0 ${size} ${h}`} role="img" aria-label="sîmetrî">
      <defs>
        <RichShadow id={`${uid}_rich`} near={1.5} far={3.5} />
        <radialGradient id={`${uid}_leftG`} cx="65%" cy="40%" r="80%">
          <stop offset="0%"   stopColor={lighten(c.fill1, 0.25)} />
          <stop offset="100%" stopColor={c.fill1} />
        </radialGradient>
        <radialGradient id={`${uid}_rightG`} cx="35%" cy="40%" r="80%">
          <stop offset="0%"   stopColor={lighten(c.fill2, 0.25)} />
          <stop offset="100%" stopColor={c.fill2} />
        </radialGradient>
        <linearGradient id={`${uid}_axisG`} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%"   stopColor={c.muted} stopOpacity="0" />
          <stop offset="15%"  stopColor={c.fill1} stopOpacity="0.6" />
          <stop offset="50%"  stopColor={c.fill1} />
          <stop offset="85%"  stopColor={c.fill1} stopOpacity="0.6" />
          <stop offset="100%" stopColor={c.muted} stopOpacity="0" />
        </linearGradient>
      </defs>
      <g filter={`url(#${uid}_rich)`}>
        {/* Left wing */}
        <path d={`M${cx},${h * 0.22} Q${cx - 48},${h * 0.06} ${cx - 58},${h * 0.44} Q${cx - 48},${h * 0.70} ${cx},${h * 0.74}`}
          fill={`url(#${uid}_leftG)`} stroke={darken(c.fill1, 0.10)} strokeWidth={1.2} strokeOpacity="0.5"
          strokeLinejoin="round" />
        {/* Right wing — mirror */}
        <path d={`M${cx},${h * 0.22} Q${cx + 48},${h * 0.06} ${cx + 58},${h * 0.44} Q${cx + 48},${h * 0.70} ${cx},${h * 0.74}`}
          fill={`url(#${uid}_rightG)`} stroke={darken(c.fill2, 0.10)} strokeWidth={1.2} strokeOpacity="0.5"
          strokeLinejoin="round" />
      </g>
      {/* Wing highlights (top-left specular) */}
      <ellipse cx={cx - 32} cy={h * 0.26} rx="14" ry="5" fill="#fff" opacity="0.30" transform={`rotate(-25 ${cx - 32} ${h * 0.26})`} />
      <ellipse cx={cx + 32} cy={h * 0.26} rx="14" ry="5" fill="#fff" opacity="0.30" transform={`rotate(25 ${cx + 32} ${h * 0.26})`} />
      {/* Axis — gradient stroke fades at top/bottom */}
      <line x1={cx} y1={h * 0.06} x2={cx} y2={h * 0.88}
        stroke={`url(#${uid}_axisG)`} strokeWidth={2.4} strokeDasharray="5,3" strokeLinecap="round" />
      {/* Axis end markers */}
      <circle cx={cx} cy={h * 0.06} r="2" fill={c.fill1} opacity="0.6" />
      <circle cx={cx} cy={h * 0.88} r="2" fill={c.fill1} opacity="0.6" />
      {showLabel && (
        <g transform={`translate(${cx}, ${h * 0.94})`}>
          <rect x="-30" y="-9" width="60" height="16" rx="8" fill={c.fill1} opacity="0.10" />
          <text x="0" y="1" textAnchor="middle" dominantBaseline="middle"
            fontSize={10} fontWeight={800} fill={c.fill1}>sîmetrî</text>
        </g>
      )}
    </svg>
  );
}

// ─── 11. RulerVisual ─────────────────────────────────────────────────────────
// Polished: a real plastic-with-coloured-edge ruler. The body has a vertical
// gradient (paler top, slightly darker bottom — the "lit-from-above" cue);
// the brand stripe runs along the top edge; tick hierarchy is three-deep
// (major every cm, half-cm medium, mm short); the bottom 1px shadow grounds
// it on the page.
export function RulerVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const { length = 5, unit = 'cm' } = params;
  const startX = 12, endX = size - 12;
  const rulerW = endX - startX;
  const rulerH = size * 0.32, rulerY = size * 0.36;
  const tickCount = Math.min(length, 10);
  const tickGap = rulerW / tickCount;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${length}${unit} pîvan`}>
      <defs>
        <RichShadow id={`${uid}_rich`} near={1.5} far={3.5} />
        <linearGradient id={`${uid}_body`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={lighten(c.bg, 0.15)} />
          <stop offset="50%"  stopColor={c.bg} />
          <stop offset="100%" stopColor={darken(c.bg, 0.08)} />
        </linearGradient>
        <linearGradient id={`${uid}_stripe`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={lighten(c.fill1, 0.18)} />
          <stop offset="100%" stopColor={c.fill1} />
        </linearGradient>
      </defs>

      {/* Body — outer drop shadow grounds the ruler */}
      <g filter={`url(#${uid}_rich)`}>
        <rect x={startX} y={rulerY} width={rulerW} height={rulerH}
          fill={`url(#${uid}_body)`} stroke={darken(c.fill1, 0.1)} strokeWidth={0.8}
          strokeOpacity={0.35} rx={4} />
      </g>

      {/* Top coloured stripe (brand band) */}
      <rect x={startX} y={rulerY} width={rulerW} height={rulerH * 0.22}
        fill={`url(#${uid}_stripe)`} rx={4} />
      {/* Stripe inner highlight */}
      <rect x={startX + 2} y={rulerY + 1.5} width={rulerW - 4} height={rulerH * 0.06}
        fill="#fff" opacity="0.30" rx={2} />

      {/* Subtle separator under the stripe */}
      <line x1={startX} y1={rulerY + rulerH * 0.22} x2={endX} y2={rulerY + rulerH * 0.22}
        stroke={darken(c.fill1, 0.15)} strokeWidth={0.4} opacity="0.40" />

      {/* Ticks: major (cm) every gap, medium at half-cm, short at every mm */}
      {(() => {
        const out = [];
        const stripeBottom = rulerY + rulerH * 0.22;
        const tickBaseY = rulerY + rulerH - 2;
        const subTicksPerCm = 10;
        const subGap = tickGap / subTicksPerCm;

        for (let i = 0; i <= tickCount; i++) {
          const x = startX + i * tickGap;
          const isMajor = true;
          const tickH = rulerH * 0.55;
          out.push(
            <line key={`maj${i}`}
              x1={x} y1={tickBaseY - tickH} x2={x} y2={tickBaseY}
              stroke={darken(c.fill1, 0.05)} strokeWidth={1.4} strokeLinecap="round" />
          );
          out.push(
            <text key={`num${i}`} x={x} y={rulerY + rulerH + 12}
              textAnchor="middle" fontSize={9} fontWeight={700} fill={c.dim}>
              {i}
            </text>
          );
          // Medium + sub ticks between this cm and next (skip on last)
          if (i < tickCount) {
            for (let j = 1; j < subTicksPerCm; j++) {
              const sx = x + j * subGap;
              if (sx > endX - 1) break;
              const isMedium = j === 5;
              const subH = isMedium ? rulerH * 0.30 : rulerH * 0.16;
              out.push(
                <line key={`s${i}_${j}`}
                  x1={sx} y1={tickBaseY - subH} x2={sx} y2={tickBaseY}
                  stroke={c.muted} strokeWidth={isMedium ? 0.8 : 0.5}
                  opacity={isMedium ? 0.85 : 0.55}
                  strokeLinecap="round" />
              );
            }
          }
        }
        return out;
      })()}

      {/* Unit label inside the brand stripe */}
      <text x={endX - 6} y={rulerY + rulerH * 0.15}
        fontSize={8.5} fontWeight={800} fill="#fff" textAnchor="end"
        letterSpacing="0.04em">
        {unit.toUpperCase()}
      </text>

      {/* Subtle reflection highlight on body (top edge) */}
      <rect x={startX + 3} y={rulerY + rulerH * 0.28} width={rulerW - 6} height={2}
        fill="#fff" opacity="0.18" rx={1} />
    </svg>
  );
}

// ─── 12. ScaleVisual ─────────────────────────────────────────────────────────
// Polished: classic balance scale. Brass-tinted gradient post, 3D base plate,
// rounded beam with shadow, dish-shaped pans (ellipse with thickness), glossy
// pivot sphere. Balanced state uses green beam; tilted state uses logo coral.
export function ScaleVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const { balanced = true, leftLabel = '', rightLabel = '' } = params;
  const cx = size / 2, baseY = size * 0.86, postH = size * 0.50;
  const tilt = balanced ? 0 : 12;
  const beamColor = balanced ? c.fill3 : c.fill2;
  // Pan positions (rotate around pivot)
  const beamLen = size * 0.34;
  const leftEndX = cx - beamLen, leftEndY = baseY - postH + tilt;
  const rightEndX = cx + beamLen, rightEndY = baseY - postH - tilt;
  const panY = (y) => Math.min(y + 22, size - 18);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img"
      aria-label={balanced ? 'hevseng' : 'nehevseng'}>
      <defs>
        <RichShadow id={`${uid}_rich`} near={1.2} far={3.5} />
        <linearGradient id={`${uid}_post`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={lighten(c.muted, 0.20)} />
          <stop offset="50%"  stopColor={c.muted} />
          <stop offset="100%" stopColor={darken(c.muted, 0.20)} />
        </linearGradient>
        <linearGradient id={`${uid}_base`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={lighten(c.muted, 0.15)} />
          <stop offset="100%" stopColor={darken(c.muted, 0.15)} />
        </linearGradient>
        <linearGradient id={`${uid}_beam`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor={lighten(beamColor, 0.20)} />
          <stop offset="100%" stopColor={darken(beamColor, 0.10)} />
        </linearGradient>
        <SphereGradient id={`${uid}_pivot`} base={beamColor} cx="32%" cy="28%" />
        <radialGradient id={`${uid}_panL`} cx="50%" cy="35%" r="65%">
          <stop offset="0%"   stopColor={lighten(c.fill1, 0.30)} />
          <stop offset="100%" stopColor={darken(c.fill1, 0.15)} />
        </radialGradient>
        <radialGradient id={`${uid}_panR`} cx="50%" cy="35%" r="65%">
          <stop offset="0%"   stopColor={lighten(c.fill2, 0.30)} />
          <stop offset="100%" stopColor={darken(c.fill2, 0.15)} />
        </radialGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx={cx} cy={baseY + 11} rx={42} ry={3.5} fill="#000" opacity="0.16" />

      {/* Base plate — 3D look with top face + dark side */}
      <rect x={cx - 30} y={baseY + 4} width={60} height={4}
        fill={darken(c.muted, 0.18)} rx={2} />
      <rect x={cx - 30} y={baseY} width={60} height={6}
        fill={`url(#${uid}_base)`} rx={2.5} />
      <rect x={cx - 28} y={baseY + 1} width={56} height={1.4}
        fill="#fff" opacity="0.20" rx={0.7} />

      {/* Vertical post */}
      <rect x={cx - 3} y={baseY - postH} width={6} height={postH}
        fill={`url(#${uid}_post)`} rx={1.5} />
      <rect x={cx - 2.5} y={baseY - postH + 4} width={1.4} height={postH - 8}
        fill="#fff" opacity="0.30" rx={0.7} />

      {/* Beam (rotates) — wider rounded bar */}
      <g transform={`rotate(${balanced ? 0 : -8} ${cx} ${baseY - postH})`}>
        <line x1={cx - beamLen} y1={baseY - postH} x2={cx + beamLen} y2={baseY - postH}
          stroke="#000" strokeWidth={5} strokeLinecap="round" opacity="0.18" transform="translate(0,1.5)" />
        <line x1={cx - beamLen} y1={baseY - postH} x2={cx + beamLen} y2={baseY - postH}
          stroke={`url(#${uid}_beam)`} strokeWidth={4} strokeLinecap="round" />
        <line x1={cx - beamLen + 4} y1={baseY - postH - 1} x2={cx + beamLen - 4} y2={baseY - postH - 1}
          stroke="#fff" strokeWidth={1} strokeLinecap="round" opacity="0.40" />
      </g>

      {/* Pivot — glossy sphere */}
      <g filter={`url(#${uid}_rich)`}>
        <circle cx={cx} cy={baseY - postH} r={6} fill={beamColor} />
        <circle cx={cx} cy={baseY - postH} r={6} fill={`url(#${uid}_pivot)`} />
      </g>
      <ellipse cx={cx - 2} cy={baseY - postH - 2} rx="1.8" ry="1"
        fill="#fff" opacity="0.65" />

      {/* Left chain + pan */}
      <line x1={leftEndX} y1={leftEndY} x2={leftEndX} y2={leftEndY + 22}
        stroke={darken(c.muted, 0.10)} strokeWidth={1.5} strokeLinecap="round" />
      <g filter={`url(#${uid}_rich)`}>
        {/* Pan: ellipse with subtle 3D rim */}
        <ellipse cx={leftEndX} cy={leftEndY + 25} rx={26} ry={4}
          fill={darken(c.fill1, 0.20)} />
        <ellipse cx={leftEndX} cy={leftEndY + 23} rx={26} ry={8}
          fill={`url(#${uid}_panL)`} stroke={darken(c.fill1, 0.15)} strokeWidth={0.8} />
        <ellipse cx={leftEndX} cy={leftEndY + 22} rx={22} ry={5.5}
          fill="none" stroke="#fff" strokeWidth={0.7} opacity="0.40" />
      </g>
      {leftLabel && (
        <g transform={`translate(${leftEndX}, ${panY(leftEndY + 18)})`}>
          <rect x="-18" y="-9" width="36" height="16" rx="8" fill={c.fill1} opacity="0.12" />
          <text x="0" y="1" textAnchor="middle" dominantBaseline="middle"
            fontSize={9} fontWeight={800} fill={c.fill1}>{leftLabel}</text>
        </g>
      )}

      {/* Right chain + pan */}
      <line x1={rightEndX} y1={rightEndY} x2={rightEndX} y2={rightEndY + 22}
        stroke={darken(c.muted, 0.10)} strokeWidth={1.5} strokeLinecap="round" />
      <g filter={`url(#${uid}_rich)`}>
        <ellipse cx={rightEndX} cy={rightEndY + 25} rx={26} ry={4}
          fill={darken(c.fill2, 0.20)} />
        <ellipse cx={rightEndX} cy={rightEndY + 23} rx={26} ry={8}
          fill={`url(#${uid}_panR)`} stroke={darken(c.fill2, 0.15)} strokeWidth={0.8} />
        <ellipse cx={rightEndX} cy={rightEndY + 22} rx={22} ry={5.5}
          fill="none" stroke="#fff" strokeWidth={0.7} opacity="0.40" />
      </g>
      {rightLabel && (
        <g transform={`translate(${rightEndX}, ${panY(rightEndY + 18)})`}>
          <rect x="-18" y="-9" width="36" height="16" rx="8" fill={c.fill2} opacity="0.12" />
          <text x="0" y="1" textAnchor="middle" dominantBaseline="middle"
            fontSize={9} fontWeight={800} fill={c.fill2}>{rightLabel}</text>
        </g>
      )}
    </svg>
  );
}

// ─── 13. ClockVisual ─────────────────────────────────────────────────────────
// Polished: real analog clock — metallic bezel ring around white dial, three-
// tier tick hierarchy (hour/quarter/minute), tapered hour & minute hands with
// drop shadow, glossy centre cap, coral second hand for accent.
export function ClockVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const { hour = 3, minute = 0 } = params;
  const cx = size / 2, cy = size * 0.50, r = size * 0.42;
  const hourAngle = ((hour % 12) / 12) * 2 * Math.PI - Math.PI / 2 + (minute / 60) * (Math.PI / 6);
  const minAngle  = (minute / 60) * 2 * Math.PI - Math.PI / 2;
  const hx = cx + r * 0.52 * Math.cos(hourAngle), hy = cy + r * 0.52 * Math.sin(hourAngle);
  const mx = cx + r * 0.78 * Math.cos(minAngle),  my = cy + r * 0.78 * Math.sin(minAngle);
  // tail end (small back-stub for hands)
  const hxBack = cx - r * 0.10 * Math.cos(hourAngle), hyBack = cy - r * 0.10 * Math.sin(hourAngle);
  const mxBack = cx - r * 0.10 * Math.cos(minAngle),  myBack = cy - r * 0.10 * Math.sin(minAngle);
  const nums = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img"
      aria-label={`${hour}:${String(minute).padStart(2, '0')}`}>
      <defs>
        <RichShadow id={`${uid}_rich`} near={2} far={5} opacityNear={0.20} opacityFar={0.10} />
        {/* Metallic bezel — top brighter than bottom */}
        <linearGradient id={`${uid}_bezel`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={lighten(c.fill1, 0.20)} />
          <stop offset="50%"  stopColor={c.fill1} />
          <stop offset="100%" stopColor={darken(c.fill1, 0.20)} />
        </linearGradient>
        {/* Dial face — subtle inner shading from edges to centre */}
        <radialGradient id={`${uid}_dial`} cx="50%" cy="42%" r="58%">
          <stop offset="0%"   stopColor={lighten(c.bg, 0.05)} />
          <stop offset="80%"  stopColor={c.bg} />
          <stop offset="100%" stopColor={darken(c.bg, 0.04)} />
        </radialGradient>
        {/* Centre cap sphere */}
        <SphereGradient id={`${uid}_cap`} base={c.fill1} cx="32%" cy="28%" />
      </defs>

      {/* Outer ground shadow */}
      <ellipse cx={cx} cy={cy + r + 4} rx={r * 0.88} ry={r * 0.10} fill="#000" opacity="0.14" />

      {/* Outer bezel ring */}
      <g filter={`url(#${uid}_rich)`}>
        <circle cx={cx} cy={cy} r={r} fill={`url(#${uid}_bezel)`} />
      </g>
      {/* Bezel highlight (top arc) */}
      <path
        d={`M ${cx - r * 0.75},${cy - r * 0.55} A ${r * 0.92},${r * 0.92} 0 0,1 ${cx + r * 0.50},${cy - r * 0.78}`}
        stroke="#fff" strokeWidth={r * 0.10} strokeLinecap="round"
        fill="none" opacity="0.40"
      />

      {/* Dial face — slightly inset */}
      <circle cx={cx} cy={cy} r={r - r * 0.13} fill={`url(#${uid}_dial)`} />
      {/* Dial inner rim shadow */}
      <circle cx={cx} cy={cy} r={r - r * 0.13} fill="none"
        stroke={darken(c.bg, 0.20)} strokeWidth={0.8} opacity="0.45" />

      {/* Tick marks: minutes (light), hours (bold) — drawn over the dial */}
      {Array.from({ length: 60 }, (_, i) => {
        const a = (i / 60) * 2 * Math.PI - Math.PI / 2;
        const isHour = i % 5 === 0;
        const r1 = r - (isHour ? r * 0.18 : r * 0.12);
        const r2 = r - r * 0.075;
        return (
          <line key={i}
            x1={cx + r1 * Math.cos(a)} y1={cy + r1 * Math.sin(a)}
            x2={cx + r2 * Math.cos(a)} y2={cy + r2 * Math.sin(a)}
            stroke={isHour ? c.text : c.muted}
            strokeWidth={isHour ? 2.2 : 0.7}
            strokeOpacity={isHour ? 0.92 : 0.55}
            strokeLinecap="round" />
        );
      })}

      {/* Hour numbers */}
      {nums.map((n, i) => {
        const a = (i / 12) * 2 * Math.PI - Math.PI / 2;
        return (
          <text key={n}
            x={cx + (r - r * 0.32) * Math.cos(a)}
            y={cy + (r - r * 0.32) * Math.sin(a) + 3.5}
            textAnchor="middle" fontSize={Math.max(9, r * 0.20)}
            fontWeight={n === 12 ? 800 : 700}
            fill={c.text}>
            {n}
          </text>
        );
      })}

      {/* Hour hand — tapered + shadow */}
      <g filter={`url(#${uid}_rich)`}>
        <line x1={hxBack} y1={hyBack} x2={hx} y2={hy}
          stroke={c.text} strokeWidth={5.5} strokeLinecap="round" />
      </g>
      {/* Minute hand */}
      <g filter={`url(#${uid}_rich)`}>
        <line x1={mxBack} y1={myBack} x2={mx} y2={my}
          stroke={c.text} strokeWidth={3.2} strokeLinecap="round" />
      </g>
      {/* Coral accent on minute hand tip */}
      <circle cx={mx} cy={my} r={2.5} fill={c.fill2} />

      {/* Centre cap — glossy sphere */}
      <g filter={`url(#${uid}_rich)`}>
        <circle cx={cx} cy={cy} r={6} fill={c.fill1} />
        <circle cx={cx} cy={cy} r={6} fill={`url(#${uid}_cap)`} />
      </g>
      <ellipse cx={cx - 2} cy={cy - 2} rx="1.8" ry="1" fill="#fff" opacity="0.70" />
      {/* Centre pin */}
      <circle cx={cx} cy={cy} r={1.4} fill={c.fill1} />
    </svg>
  );
}

// ─── 14. BarChartVisual ──────────────────────────────────────────────────────
// Polished: each bar wears a vertical gradient (lighter top → fuller bottom),
// rests on a soft floor shadow, and carries a thin specular stripe down the
// left edge to mimic a moulded plastic block. Y-axis gridlines + axis stroke
// give the chart a "data viz" finish.
export function BarChartVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const { values = [3, 5, 2, 4], labels = [] } = params;
  const maxV = Math.max(...values, 1);
  const padL = 24, padB = 26, padT = 14, padR = 10;
  const chartW = size - padL - padR;
  const chartH = size - padB - padT;
  const barW = chartW / values.length - 6;
  const baseColors = [c.fill1, c.fill2, c.fill3, c.fill4, c.fill5, c.fill6];

  // Unique gradient def per palette colour
  const gradDefs = baseColors.map((col, i) => (
    <linearGradient key={i} id={`${uid}_g${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stopColor={lighten(col, 0.22)} />
      <stop offset="100%" stopColor={col} />
    </linearGradient>
  ));

  // Y-axis gridlines
  const gridLines = [0.25, 0.5, 0.75, 1.0].map(f => {
    const y = padT + chartH * (1 - f);
    return (
      <line key={f} x1={padL} y1={y} x2={size - padR} y2={y}
        stroke={c.line} strokeWidth={0.5} strokeDasharray="4,3" opacity={0.55} />
    );
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="bar chart">
      <defs>
        <RichShadow id={`${uid}_rich`} near={0.8} far={2.2} opacityNear={0.18} opacityFar={0.08} />
        {gradDefs}
      </defs>

      {/* Grid + axes */}
      {gridLines}
      <line x1={padL} y1={padT} x2={padL} y2={size - padB} stroke={c.muted} strokeWidth={1.6} strokeLinecap="round" />
      <line x1={padL} y1={size - padB} x2={size - padR} y2={size - padB} stroke={c.muted} strokeWidth={1.6} strokeLinecap="round" />

      {/* Bars */}
      {values.map((v, i) => {
        const barH = (v / maxV) * chartH;
        const x = padL + 4 + i * (barW + 6);
        const y = padT + chartH - barH;
        const gradId = `${uid}_g${i % baseColors.length}`;
        const col = baseColors[i % baseColors.length];
        return (
          <g key={i}>
            {/* Bar body with gradient + rich shadow */}
            <g filter={`url(#${uid}_rich)`}>
              <rect x={x} y={y} width={barW} height={barH}
                fill={`url(#${gradId})`} rx={4} stroke={darken(col, 0.12)}
                strokeWidth={0.5} strokeOpacity={0.40} />
            </g>
            {/* Left specular stripe — sells the moulded plastic look */}
            <rect x={x + 2} y={y + 3} width={2} height={Math.max(0, barH - 6)}
              fill="#fff" opacity="0.30" rx={1} />
            {/* Value badge on top */}
            <text x={x + barW / 2} y={y - 5} textAnchor="middle"
              fontSize={9.5} fontWeight={800} fill={col}>{v}</text>
            {/* Category label */}
            {labels[i] && (
              <text x={x + barW / 2} y={Math.min(size - padB + 14, size - 4)}
                textAnchor="middle" fontSize={7.5} fontWeight={600} fill={c.dim}>
                {labels[i].length > 6 ? labels[i].slice(0, 5) + '…' : labels[i]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─── 15. PieChartVisual ──────────────────────────────────────────────────────
// Polished: each slice has its own radial gradient (centre brighter, edge
// darker) for a glossy disc finish; white slice separators run from centre
// to rim; a specular arc on top-left + ground shadow ellipse give the pie a
// real physical disc presence. Legend pills sit underneath when space allows.
export function PieChartVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const { slices = [30, 45, 25] } = params;
  const cx = size * 0.50, cy = size * 0.44, r = size * 0.34;
  const total = slices.reduce((a, b) => a + b, 0);
  const baseColors = [c.fill1, c.fill2, c.fill3, c.fill4, c.fill5, c.fill6];

  // Build slice paths + per-slice gradient defs
  let startAngle = -Math.PI / 2;
  const sliceData = slices.map((s, i) => {
    const angle = (s / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(startAngle + angle), y2 = cy + r * Math.sin(startAngle + angle);
    const large = angle > Math.PI ? 1 : 0;
    const midA = startAngle + angle / 2;
    const labelR = r * 0.62;
    const lx = cx + labelR * Math.cos(midA), ly = cy + labelR * Math.sin(midA);
    const startA = startAngle;
    startAngle += angle;
    const col = baseColors[i % baseColors.length];
    return {
      d: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`,
      col, pct: Math.round(s / total * 100),
      lx, ly, midA, startA,
    };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="pie chart">
      <defs>
        <RichShadow id={`${uid}_rich`} near={1.5} far={4} />
        {sliceData.map((sl, i) => (
          <radialGradient key={i} id={`${uid}_s${i}`} cx="40%" cy="36%" r="70%">
            <stop offset="0%"   stopColor={lighten(sl.col, 0.25)} />
            <stop offset="60%"  stopColor={sl.col} />
            <stop offset="100%" stopColor={darken(sl.col, 0.12)} />
          </radialGradient>
        ))}
      </defs>

      {/* Ground shadow under disc */}
      <ellipse cx={cx} cy={cy + r + 4} rx={r * 0.85} ry={r * 0.10}
        fill="#000" opacity="0.12" />

      {/* Slices with rich shadow */}
      <g filter={`url(#${uid}_rich)`}>
        {sliceData.map((sl, i) => (
          <path key={i} d={sl.d} fill={`url(#${uid}_s${i})`} />
        ))}
      </g>

      {/* Glossy specular arc on top-left of the disc */}
      <path
        d={`M ${cx - r * 0.55},${cy - r * 0.65} A ${r * 0.85},${r * 0.85} 0 0,1 ${cx + r * 0.20},${cy - r * 0.85}`}
        stroke="#fff" strokeWidth={r * 0.16} strokeLinecap="round"
        fill="none" opacity="0.30"
      />

      {/* White slice separators */}
      {sliceData.map((sl, i) => {
        const x = cx + r * Math.cos(sl.startA), y = cy + r * Math.sin(sl.startA);
        return (
          <line key={`sep${i}`} x1={cx} y1={cy} x2={x} y2={y}
            stroke="#fff" strokeWidth={1.6} opacity="0.90" />
        );
      })}

      {/* Centre cap */}
      <circle cx={cx} cy={cy} r={3.5} fill={c.white}
        stroke={c.muted} strokeOpacity="0.35" strokeWidth={0.5} />

      {/* Percentage labels inside slices, only when slice large enough */}
      {sliceData.map((sl, i) => sl.pct >= 10 && (
        <text key={`l${i}`} x={sl.lx} y={sl.ly + 3} textAnchor="middle"
          fontSize={10} fontWeight={800} fill="#fff"
          style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.30))' }}>
          {sl.pct}%
        </text>
      ))}
    </svg>
  );
}

// ─── 16. TableVisual ─────────────────────────────────────────────────────────
// Polished: header row wears a logo-teal gradient with a subtle highlight
// stripe (like a book heading), body cells alternate between surface and
// soft1 tint (zebra stripe). Outer container has rounded corners + drop
// shadow so the table looks like a printed card.
export function TableVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const { rows = 3, cols = 3, data = [] } = params;
  const padX = 12, padY = size * 0.10;
  const tableW = size - padX * 2;
  const cellH = (size - padY - 12) / (rows + 1);
  const cellW = tableW / cols;
  const startX = padX;
  const startY = padY;
  const radius = 6;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="tablo">
      <defs>
        <RichShadow id={`${uid}_rich`} near={1.5} far={3.5} />
        <linearGradient id={`${uid}_head`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={lighten(c.fill1, 0.18)} />
          <stop offset="100%" stopColor={c.fill1} />
        </linearGradient>
        <linearGradient id={`${uid}_body`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={lighten(c.bg, 0.05)} />
          <stop offset="100%" stopColor={c.bg} />
        </linearGradient>
        {/* Clip path to round table corners */}
        <clipPath id={`${uid}_clip`}>
          <rect x={startX} y={startY} width={tableW} height={cellH * (rows + 1)} rx={radius} />
        </clipPath>
      </defs>

      {/* Drop-shadowed body */}
      <g filter={`url(#${uid}_rich)`}>
        <rect x={startX} y={startY} width={tableW} height={cellH * (rows + 1)}
          fill={`url(#${uid}_body)`} rx={radius} />
      </g>

      {/* Cells (clipped to rounded outline) */}
      <g clipPath={`url(#${uid}_clip)`}>
        {/* Header row */}
        <rect x={startX} y={startY} width={tableW} height={cellH}
          fill={`url(#${uid}_head)`} />
        {/* Header inner highlight */}
        <rect x={startX + 1} y={startY + 1} width={tableW - 2} height={cellH * 0.35}
          fill="#fff" opacity="0.22" />

        {/* Zebra stripe body rows */}
        {Array.from({ length: rows }, (_, r) => (
          r % 2 === 0 ? null : (
            <rect key={`zb${r}`}
              x={startX} y={startY + (r + 1) * cellH}
              width={tableW} height={cellH}
              fill={c.soft1} opacity="0.55" />
          )
        ))}
      </g>

      {/* Container border (subtle) */}
      <rect x={startX} y={startY} width={tableW} height={cellH * (rows + 1)}
        fill="none" stroke={c.line} strokeWidth={0.6} rx={radius} opacity="0.5" />

      {/* Grid lines (horizontal between rows) */}
      {Array.from({ length: rows }, (_, i) => (
        <line key={`hl${i}`}
          x1={startX} y1={startY + (i + 1) * cellH}
          x2={startX + tableW} y2={startY + (i + 1) * cellH}
          stroke={c.line} strokeWidth={0.5} opacity="0.40" />
      ))}
      {/* Grid lines (vertical between cols) */}
      {Array.from({ length: cols - 1 }, (_, i) => (
        <line key={`vl${i}`}
          x1={startX + (i + 1) * cellW} y1={startY + cellH * 0.55}
          x2={startX + (i + 1) * cellW} y2={startY + cellH * (rows + 1)}
          stroke={c.line} strokeWidth={0.5} opacity="0.30" />
      ))}

      {/* Cell text */}
      {Array.from({ length: rows + 1 }, (_, r) => (
        Array.from({ length: cols }, (_, col) => {
          const isHeader = r === 0;
          const dataR = r - 1;
          const x = startX + col * cellW + cellW / 2;
          const y = startY + r * cellH + cellH / 2 + 3;
          const text = isHeader
            ? (data[-1] && data[-1][col]) || ''
            : (data[dataR] && data[dataR][col]) || '';
          if (!text) return null;
          return (
            <text key={`t${r}${col}`} x={x} y={y} textAnchor="middle"
              fontSize={isHeader ? 9 : 8.5}
              fontWeight={isHeader ? 800 : 600}
              fill={isHeader ? '#fff' : c.text}
              letterSpacing={isHeader ? '0.04em' : '0'}>
              {text}
            </text>
          );
        })
      ))}
    </svg>
  );
}

// ─── 17. DiceVisual ──────────────────────────────────────────────────────────
export function DiceVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const { face = 3 } = params;
  const s = size * 0.56, bx = (size - s) / 2, by = (size - s) / 2;
  const dotR = s * 0.11;
  const dotPositions = {
    1: [[0.5, 0.5]],
    2: [[0.28, 0.28], [0.72, 0.72]],
    3: [[0.28, 0.28], [0.5, 0.5], [0.72, 0.72]],
    4: [[0.28, 0.28], [0.72, 0.28], [0.28, 0.72], [0.72, 0.72]],
    5: [[0.28, 0.28], [0.72, 0.28], [0.5, 0.5], [0.28, 0.72], [0.72, 0.72]],
    6: [[0.28, 0.22], [0.72, 0.22], [0.28, 0.5], [0.72, 0.5], [0.28, 0.78], [0.72, 0.78]],
  };
  const dots = (dotPositions[face] || dotPositions[1]).map(([dx, dy], i) => (
    <circle key={i} cx={bx + s * dx} cy={by + s * dy} r={dotR} fill={c.text} />
  ));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`zar ${face}`}>
      <defs>
        <ShadowDef id={`${uid}_sh`} blur={3} opacity={0.2} />
        <linearGradient id={`${uid}_diceGrad`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c.bg} stopOpacity={1} />
          <stop offset="100%" stopColor={c.soft1} stopOpacity={1} />
        </linearGradient>
      </defs>
      {/* Dice body */}
      <rect x={bx} y={by} width={s} height={s} rx={s * 0.14}
        fill={`url(#${uid}_diceGrad)`} stroke={c.fill1} strokeWidth={2}
        filter={`url(#${uid}_sh)`} />
      {dots}
    </svg>
  );
}

// ─── 18. ProbabilityVisual ───────────────────────────────────────────────────
export function ProbabilityVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const { value = 0.5, coin = false } = params;

  if (coin) {
    const r = size * 0.26;
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="perçe">
        <defs>
          <ShadowDef id={`${uid}_sh`} blur={3} opacity={0.2} />
          <radialGradient id={`${uid}_cg1`} cx="38%" cy="35%" r="60%">
            <stop offset="0%" stopColor={c.white} stopOpacity={0.5} />
            <stop offset="100%" stopColor={c.fill4} stopOpacity={1} />
          </radialGradient>
          <radialGradient id={`${uid}_cg2`} cx="38%" cy="35%" r="60%">
            <stop offset="0%" stopColor={c.white} stopOpacity={0.5} />
            <stop offset="100%" stopColor={c.fill1} stopOpacity={1} />
          </radialGradient>
        </defs>
        <circle cx={size*0.3} cy={size*0.42} r={r}
          fill={`url(#${uid}_cg1)`} stroke={c.fill4} strokeWidth={2.5}
          filter={`url(#${uid}_sh)`} />
        <text x={size*0.3} y={size*0.42+5} textAnchor="middle"
          fontSize={15} fontWeight={800} fill={c.white}>T</text>
        <circle cx={size*0.7} cy={size*0.42} r={r}
          fill={`url(#${uid}_cg2)`} stroke={c.fill1} strokeWidth={2.5}
          filter={`url(#${uid}_sh)`} />
        <text x={size*0.7} y={size*0.42+5} textAnchor="middle"
          fontSize={15} fontWeight={800} fill={c.white}>Y</text>
        <text x={size/2} y={size*0.82} textAnchor="middle"
          fontSize={11} fontWeight={600} fill={c.dim}>½ + ½ = 1</text>
      </svg>
    );
  }

  const trackX = 18, trackW = size - 36, trackH = 14, trackY = size * 0.44;
  const fillW = Math.max(0, Math.min(trackW, trackW * value));
  const labels = ['0', '¼', '½', '¾', '1'];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img"
      aria-label={`îhtîmal ${value}`}>
      <defs>
        <ShadowDef id={`${uid}_sh`} blur={2} opacity={0.15} />
        <linearGradient id={`${uid}_pg`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={c.fill5} />
          <stop offset="50%" stopColor={c.fill4} />
          <stop offset="100%" stopColor={c.fill3} />
        </linearGradient>
        <clipPath id={`${uid}_clip`}>
          <rect x={trackX} y={trackY} width={fillW} height={trackH} rx={7} />
        </clipPath>
      </defs>
      <text x={trackX} y={trackY - 8} fontSize={9} fill={c.fill5} fontWeight={700}>Negengaz</text>
      <text x={trackX+trackW} y={trackY - 8} textAnchor="end"
        fontSize={9} fill={c.fill3} fontWeight={700}>Teqez</text>
      {/* Track */}
      <rect x={trackX} y={trackY} width={trackW} height={trackH} rx={7} fill={c.line} />
      {/* Fill — gradient */}
      <rect x={trackX} y={trackY} width={trackW} height={trackH} rx={7}
        fill={`url(#${uid}_pg)`} clipPath={`url(#${uid}_clip)`} />
      {/* Thumb */}
      <circle cx={trackX + fillW} cy={trackY + trackH/2} r={10}
        fill={c.fill3} filter={`url(#${uid}_sh)`} />
      <text x={trackX + fillW} y={trackY + trackH/2 + 4} textAnchor="middle"
        fontSize={8} fontWeight={700} fill={c.white}>{value}</text>
      {/* Labels */}
      {labels.map((l, i) => (
        <text key={i} x={trackX + (i/4) * trackW} y={trackY + trackH + 18}
          textAnchor="middle" fontSize={8} fill={c.muted}>{l}</text>
      ))}
    </svg>
  );
}

// ─── 19. AlgebraVisual (pure SVG) ────────────────────────────────────────────
export function AlgebraVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const { type: vtype = 'variable', equation = '□ + 3 = 7', balanced = true } = params;

  if (vtype === 'equation') {
    // Inline mini scale + equation text, pure SVG
    const cx = size / 2, baseY = size * 0.72, postH = size * 0.38;
    const tilt = balanced ? 0 : 10;
    const beamColor = balanced ? c.fill3 : c.fill5;
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img"
        aria-label={equation}>
        <defs><ShadowDef id={`${uid}_sh`} blur={2} opacity={0.15} /></defs>
        {/* Post */}
        <line x1={cx} y1={baseY-postH} x2={cx} y2={baseY}
          stroke={c.muted} strokeWidth={3.5} strokeLinecap="round" />
        {/* Base */}
        <rect x={cx-22} y={baseY} width={44} height={7} rx={4} fill={c.muted} />
        {/* Beam */}
        <line x1={cx-size*0.30} y1={baseY-postH+tilt}
          x2={cx+size*0.30} y2={baseY-postH-tilt}
          stroke={beamColor} strokeWidth={3} strokeLinecap="round" />
        <circle cx={cx} cy={baseY-postH} r={4} fill={beamColor} />
        {/* Pans */}
        <ellipse cx={cx-size*0.30} cy={baseY-postH+tilt+18}
          rx={22} ry={6} fill="none" stroke={beamColor} strokeWidth={2} />
        <ellipse cx={cx+size*0.30} cy={baseY-postH-tilt+18}
          rx={22} ry={6} fill="none" stroke={beamColor} strokeWidth={2} />
        {/* Equation text — auto-shrink for long equations */}
        <text x={size/2} y={size*0.14} textAnchor="middle"
          fontSize={equation.length > 12 ? 10 : 13} fontWeight={800} fill={c.fill1} fontFamily="monospace">{equation}</text>
      </svg>
    );
  }

  // Variable box
  const bx = size * 0.28, by = size * 0.18, bs = size * 0.44;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="guherbar">
      <defs><ShadowDef id={`${uid}_sh`} blur={3} opacity={0.15} /></defs>
      <rect x={bx} y={by} width={bs} height={bs} rx={10}
        fill={c.soft1} stroke={c.fill1} strokeWidth={2.5}
        strokeDasharray="7,4" filter={`url(#${uid}_sh)`} />
      <text x={size/2} y={by + bs/2 + 2} textAnchor="middle"
        fontSize={28} fontWeight={800} fill={c.fill1} dominantBaseline="middle">?</text>
      <text x={size/2} y={by + bs + 22} textAnchor="middle"
        fontSize={11} fontWeight={600} fill={c.dim}>guherbar</text>
    </svg>
  );
}

// ─── 20. PatternVisual ───────────────────────────────────────────────────────
export function PatternVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const { items = ['🔵','🟡','🔵','🟡','?'], count = 5 } = params;
  const shapeMap = { '🔵':'circle','🟡':'square','🔺':'triangle','🟢':'circle','🔴':'circle','🟠':'circle' };
  const colorMap = { '🔵':c.fill1,'🟡':c.fill4,'🔺':c.fill5,'🟢':c.fill3,'🔴':c.fill5,'🟠':c.fill2 };
  const n = Math.min(count, 7);
  const spacing = (size - 20) / n;
  const r = Math.min(spacing * 0.36, 20);
  const midY = size * 0.42;
  const elems = [];
  for (let i = 0; i < n; i++) {
    const cx = 12 + i * spacing + spacing / 2;
    const item = items[i] || (i % 2 === 0 ? '🔵' : '🟡');
    const isLast = item === '?' || i === n - 1 && items[n-1] === '?';
    if (isLast) {
      elems.push(
        <rect key={`box${i}`} x={cx-r} y={midY-r} width={r*2} height={r*2} rx={5}
          fill={c.soft1} stroke={c.muted} strokeWidth={2} strokeDasharray="4,2.5" />,
        <text key={`q${i}`} x={cx} y={midY+4} textAnchor="middle"
          fontSize={16} fontWeight={800} fill={c.muted} dominantBaseline="middle">?</text>
      );
    } else {
      const shape = shapeMap[item] || 'circle';
      const col   = colorMap[item] || c.fill1;
      if (shape === 'triangle') {
        elems.push(<polygon key={i} points={`${cx},${midY-r} ${cx-r},${midY+r} ${cx+r},${midY+r}`}
          fill={col} opacity={0.88} />);
      } else if (shape === 'square') {
        elems.push(<rect key={i} x={cx-r} y={midY-r} width={r*2} height={r*2} rx={4}
          fill={col} opacity={0.88} />);
      } else {
        elems.push(<circle key={i} cx={cx} cy={midY} r={r} fill={col} opacity={0.88} />);
      }
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="şêwe">
      <defs><ShadowDef id={`${uid}_sh`} blur={1.5} opacity={0.15} /></defs>
      {elems}
      {size >= 120 && (
        <text x={size/2} y={size*0.74} textAnchor="middle"
          fontSize={9} fill={c.muted}>Şêweyê berdewam bike…</text>
      )}
    </svg>
  );
}

// ─── 21. SetVisual ───────────────────────────────────────────────────────────
export function SetVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const { type: stype = 'two_sets', labels = ['A', 'B'] } = params;
  const cx = size / 2, cy = size * 0.46, r = size * 0.30;
  const offset = r * 0.62;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="kom">
      <defs>
        <clipPath id={`${uid}_clipA`}>
          <circle cx={cx - offset * 0.7} cy={cy} r={r} />
        </clipPath>
        <clipPath id={`${uid}_clipB`}>
          <circle cx={cx + offset * 0.7} cy={cy} r={r} />
        </clipPath>
        <ShadowDef id={`${uid}_sh`} blur={3} opacity={0.12} />
      </defs>
      {/* Circle A */}
      <circle cx={cx - offset * 0.7} cy={cy} r={r}
        fill={c.fill1} opacity={0.18} stroke={c.fill1} strokeWidth={2.5}
        filter={`url(#${uid}_sh)`} />
      {/* Circle B */}
      <circle cx={cx + offset * 0.7} cy={cy} r={r}
        fill={c.fill2} opacity={0.18} stroke={c.fill2} strokeWidth={2.5} />
      {/* Intersection highlight */}
      <circle cx={cx + offset * 0.7} cy={cy} r={r}
        fill={c.fill4} opacity={0.28}
        clipPath={`url(#${uid}_clipA)`} />
      {/* Labels */}
      <text x={cx - offset * 1.25} y={cy + 5} textAnchor="middle"
        fontSize={18} fontWeight={800} fill={c.fill1}>{labels[0]}</text>
      <text x={cx + offset * 1.25} y={cy + 5} textAnchor="middle"
        fontSize={18} fontWeight={800} fill={c.fill2}>{labels[1] || 'B'}</text>
      <text x={cx} y={cy + 5} textAnchor="middle"
        fontSize={11} fontWeight={700} fill={c.text}>∩</text>
    </svg>
  );
}

// ─── 22. NumberGridVisual (NEW) ──────────────────────────────────────────────
// Polished: each cell is a subtle paper tile; highlighted numbers wear a
// gradient body with a glossy specular highlight (selected button feel),
// crossed-out numbers get an X-stroke through them with dimmed text.
export function NumberGridVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const { cols: rawCols = 5, rows: rawRows = 4, highlight = [], crossed = [], startAt = 1 } = params;
  const cols = Math.min(rawCols, 10), rows = Math.min(rawRows, 8);
  const pad = 12;
  const cellW = (size - pad * 2) / cols;
  const cellH = (size * 0.88 - pad * 2) / rows;
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      const n = startAt + r * cols + col;
      const x = pad + col * cellW, y = pad + r * cellH;
      const isHi = highlight.includes(n);
      const isCross = crossed.includes(n);
      // Cell body
      if (isHi) {
        cells.push(
          <g key={`bg${r}${col}`} filter={`url(#${uid}_rich)`}>
            <rect x={x + 1} y={y + 1} width={cellW - 2} height={cellH - 2}
              fill={c.fill1} rx={4} />
            <rect x={x + 1} y={y + 1} width={cellW - 2} height={cellH - 2}
              fill={`url(#${uid}_hi)`} rx={4} />
            {/* Top specular stripe */}
            <rect x={x + 3} y={y + 2} width={cellW - 6} height={cellH * 0.25}
              fill="#fff" opacity="0.30" rx={2} />
          </g>
        );
      } else {
        cells.push(
          <rect key={`bg${r}${col}`} x={x + 0.5} y={y + 0.5}
            width={cellW - 1} height={cellH - 1}
            fill={`url(#${uid}_cell)`} stroke={c.line} strokeWidth={0.6}
            strokeOpacity="0.55" rx={3} />
        );
      }
      cells.push(
        <text key={`t${r}${col}`} x={x + cellW / 2} y={y + cellH / 2 + 4}
          textAnchor="middle" fontSize={Math.min(cellW * 0.45, 12)}
          fontWeight={isHi ? 800 : 600}
          fill={isHi ? '#fff' : isCross ? c.muted : c.text}
          opacity={isCross ? 0.55 : 1}
          style={isHi ? { filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.25))' } : undefined}>
          {n}
        </text>
      );
      if (isCross) {
        cells.push(
          <line key={`x1${r}${col}`} x1={x + 5} y1={y + 5} x2={x + cellW - 5} y2={y + cellH - 5}
            stroke={c.fill5} strokeWidth={1.7} strokeLinecap="round" opacity="0.80" />,
          <line key={`x2${r}${col}`} x1={x + cellW - 5} y1={y + 5} x2={x + 5} y2={y + cellH - 5}
            stroke={c.fill5} strokeWidth={1.7} strokeLinecap="round" opacity="0.80" />
        );
      }
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="jimarên risteyê">
      <defs>
        <RichShadow id={`${uid}_rich`} near={0.8} far={1.8} opacityNear={0.20} opacityFar={0.08} />
        <linearGradient id={`${uid}_cell`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={lighten(c.bg, 0.05)} />
          <stop offset="100%" stopColor={c.bg} />
        </linearGradient>
        <linearGradient id={`${uid}_hi`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={lighten(c.fill1, 0.20)} />
          <stop offset="100%" stopColor={c.fill1} />
        </linearGradient>
      </defs>
      {cells}
    </svg>
  );
}

// ─── 23. ArrowSequenceVisual (NEW) ───────────────────────────────────────────
// Polished: input/output mapping table with glossy spherical bubbles. Logo
// teal for input, coral for output. The operation label sits in a central
// pill that visually "transforms" each input into its paired output.
export function ArrowSequenceVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const { from = [1, 2, 3], to = [2, 4, 6], label = '×2' } = params;
  const n = Math.min(from.length, to.length, 4);
  const rowH = (size * 0.78) / (n + 0.5);
  const lx = size * 0.18, rx = size * 0.82;
  const midX = size * 0.5;
  const topY = size * 0.15;
  const bubbleR = 17;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="rêzik">
      <defs>
        <RichShadow id={`${uid}_rich`} near={1} far={2.5} />
        <SphereGradient id={`${uid}_inG`}  base={c.fill1} cx="32%" cy="28%" />
        <SphereGradient id={`${uid}_outG`} base={c.fill2} cx="32%" cy="28%" />
        <linearGradient id={`${uid}_arrow`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={c.fill1} />
          <stop offset="100%" stopColor={c.fill2} />
        </linearGradient>
        <marker id={`${uid}_aseq`} markerWidth="6.5" markerHeight="6.5" refX="3.5" refY="3.25" orient="auto">
          <path d="M0,0.5 L6,3.25 L0,6 Z" fill={c.fill2} />
        </marker>
      </defs>

      {/* Column headers (chips) */}
      <g transform={`translate(${lx}, ${topY - 4})`}>
        <rect x={-22} y={-9} width={44} height={16} rx={8} fill={c.fill1} opacity="0.12" />
        <text x={0} y={1} textAnchor="middle" dominantBaseline="middle"
          fontSize={9} fontWeight={800} fill={c.fill1}>Têkeve</text>
      </g>
      <g transform={`translate(${rx}, ${topY - 4})`}>
        <rect x={-20} y={-9} width={40} height={16} rx={8} fill={c.fill2} opacity="0.12" />
        <text x={0} y={1} textAnchor="middle" dominantBaseline="middle"
          fontSize={9} fontWeight={800} fill={c.fill2}>Derxe</text>
      </g>

      {/* Operation label — central pill with gradient */}
      <g transform={`translate(${midX}, ${topY + (n / 2) * rowH})`}>
        <rect x={-22} y={-13} width={44} height={26} rx={13}
          fill={`url(#${uid}_arrow)`} opacity="0.22" />
        <rect x={-22} y={-13} width={44} height={26} rx={13}
          fill="none" stroke={c.fill2} strokeWidth={1.2} strokeOpacity="0.55" />
        <text x={0} y={1} textAnchor="middle" dominantBaseline="middle"
          fontSize={13} fontWeight={900} fill={c.fill2}>{label}</text>
      </g>

      {Array.from({ length: n }, (_, i) => {
        const y = topY + (i + 0.7) * rowH;
        return (
          <g key={i}>
            {/* From bubble — glossy sphere */}
            <g filter={`url(#${uid}_rich)`}>
              <circle cx={lx} cy={y} r={bubbleR} fill={c.fill1} />
              <circle cx={lx} cy={y} r={bubbleR} fill={`url(#${uid}_inG)`} />
            </g>
            <ellipse cx={lx - bubbleR * 0.32} cy={y - bubbleR * 0.40}
              rx={bubbleR * 0.30} ry={bubbleR * 0.18}
              fill="#fff" opacity="0.55" />
            <text x={lx} y={y + 4} textAnchor="middle" fontSize={12} fontWeight={800} fill="#fff"
              style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.25))' }}>
              {from[i]}
            </text>

            {/* Arrow — gradient stroke */}
            <line x1={lx + bubbleR + 1} y1={y} x2={rx - bubbleR - 1} y2={y}
              stroke={`url(#${uid}_arrow)`} strokeWidth={2.2}
              strokeLinecap="round" markerEnd={`url(#${uid}_aseq)`} />

            {/* To bubble */}
            <g filter={`url(#${uid}_rich)`}>
              <circle cx={rx} cy={y} r={bubbleR} fill={c.fill2} />
              <circle cx={rx} cy={y} r={bubbleR} fill={`url(#${uid}_outG)`} />
            </g>
            <ellipse cx={rx - bubbleR * 0.32} cy={y - bubbleR * 0.40}
              rx={bubbleR * 0.30} ry={bubbleR * 0.18}
              fill="#fff" opacity="0.55" />
            <text x={rx} y={y + 4} textAnchor="middle" fontSize={12} fontWeight={800} fill="#fff"
              style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.25))' }}>
              {to[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── 24. AreaModelVisual (NEW) ───────────────────────────────────────────────
// Polished: a × b rectangle modelled as a checkerboard of softly tinted unit
// cells (each cell carries a subtle vertical gradient so the grid feels like
// a tiled mosaic rather than a flat outline). Dimension labels live in pill
// badges along the outside edges.
export function AreaModelVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const { a = 4, b = 3 } = params;
  const pad = 30;
  const aW = size - pad * 2, aH = size * 0.60 - pad * 0.4;
  const cellW = aW / a, cellH = aH / b;
  const cells = [];
  for (let row = 0; row < b; row++) {
    for (let col = 0; col < a; col++) {
      const isAlt = (row + col) % 2 === 1;
      cells.push(
        <rect key={`${row}${col}`}
          x={pad + col * cellW + 1.5} y={pad + row * cellH + 1.5}
          width={cellW - 3} height={cellH - 3}
          fill={isAlt ? `url(#${uid}_cellB)` : `url(#${uid}_cellA)`}
          stroke={`${c.fill1}40`} strokeWidth={0.6} rx={3} />
      );
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img"
      aria-label={`${a} × ${b} = ${a * b}`}>
      <defs>
        <RichShadow id={`${uid}_rich`} near={1.2} far={3} />
        <linearGradient id={`${uid}_cellA`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={lighten(c.fill1, 0.85)} />
          <stop offset="100%" stopColor={c.soft1} />
        </linearGradient>
        <linearGradient id={`${uid}_cellB`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={c.soft1} />
          <stop offset="100%" stopColor={lighten(c.fill1, 0.45)} />
        </linearGradient>
      </defs>

      {/* Outer rectangle with shadow */}
      <g filter={`url(#${uid}_rich)`}>
        <rect x={pad} y={pad} width={aW} height={aH}
          fill="none" stroke={c.fill1} strokeWidth={2.5}
          rx={5} />
      </g>
      {cells}

      {/* Width label pill */}
      <g transform={`translate(${pad + aW / 2}, ${pad - 12})`}>
        <rect x={-14} y={-9} width={28} height={18} rx={9}
          fill={c.fill1} opacity="0.16" />
        <text x={0} y={1} textAnchor="middle" dominantBaseline="middle"
          fontSize={11} fontWeight={800} fill={c.fill1}>{a}</text>
      </g>
      {/* Height label pill (rotated) */}
      <g transform={`translate(${pad - 12}, ${pad + aH / 2}) rotate(-90)`}>
        <rect x={-14} y={-9} width={28} height={18} rx={9}
          fill={c.fill1} opacity="0.16" />
        <text x={0} y={1} textAnchor="middle" dominantBaseline="middle"
          fontSize={11} fontWeight={800} fill={c.fill1}>{b}</text>
      </g>
      {/* Result — clamped to stay inside viewBox */}
      <text x={size/2} y={Math.min(pad + aH + 24, size - 6)} textAnchor="middle"
        fontSize={12} fontWeight={800} fill={c.fill2}>{a} × {b} = {a * b}</text>
    </svg>
  );
}

// ─── 25a. RegroupingVisual (eldeli toplama / onluk bozma) ───────────────────
export function RegroupingVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const { op = 'add', a = 18, b = 24, carry = true } = params;
  const result = op === 'add' ? a + b : a - b;
  const opSym = op === 'add' ? '+' : '−';
  const opColor = op === 'add' ? c.fill3 : c.fill5;
  // Carry/borrow indicator uses logo palette (coral for add, dark teal for sub)
  const carryColor = op === 'add' ? c.fill2 : c.fill1;

  const cx = size / 2;
  const startY = size * 0.15;
  const rowH = size * 0.18;
  const digitW = size * 0.14;
  const fs = size * 0.12;
  const fsSmall = size * 0.07;

  const aStr = String(a).padStart(2, ' ');
  const bStr = String(b).padStart(2, ' ');
  const maxLen = Math.max(aStr.length, bStr.length, String(result).length);
  const rPad = String(result).padStart(maxLen, ' ');
  const rightX = cx + digitW * 0.9;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img"
      aria-label={`${a} ${opSym} ${b} = ${result}`}>
      <defs>
        <RichShadow id={`${uid}_rich`} near={1.5} far={3.5} />
        <linearGradient id={`${uid}_paper`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={lighten(c.bg, 0.05)} />
          <stop offset="100%" stopColor={c.bg} />
        </linearGradient>
        {carry && (
          <marker id={`${uid}_arr`} markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,1 L5,3 L0,5 Z" fill={carryColor} />
          </marker>
        )}
      </defs>

      {/* Notebook card background — gradient + soft shadow */}
      <g filter={`url(#${uid}_rich)`}>
        <rect x={size*0.10} y={size*0.06} width={size*0.80} height={size*0.74}
          rx={size*0.06} fill={`url(#${uid}_paper)`} stroke={c.line} strokeWidth={0.6}
          strokeOpacity={0.5} />
      </g>
      {/* Subtle inner top highlight for the paper feel */}
      <rect x={size*0.11} y={size*0.07} width={size*0.78} height={size*0.04}
        rx={size*0.04} fill="#fff" opacity="0.40" />

      {/* Carry indicator */}
      {carry && op === 'add' && (
        <>
          <path d={`M${rightX} ${startY + rowH*0.3} Q${rightX - digitW*0.5} ${startY - rowH*0.1} ${rightX - digitW} ${startY + rowH*0.3}`}
            fill="none" stroke={carryColor} strokeWidth={1.5} strokeDasharray="3 2"
            markerEnd={`url(#${uid}_arr)`} />
          <circle cx={rightX - digitW} cy={startY + rowH*0.22} r={fsSmall * 0.85}
            fill={carryColor} opacity="0.15" />
          <text x={rightX - digitW} y={startY + rowH*0.22}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={fsSmall} fontWeight={800} fill={carryColor}>1</text>
        </>
      )}
      {carry && op === 'sub' && (
        <>
          <path d={`M${rightX - digitW} ${startY + rowH*0.3} Q${rightX - digitW*0.5} ${startY - rowH*0.1} ${rightX} ${startY + rowH*0.3}`}
            fill="none" stroke={carryColor} strokeWidth={1.5} strokeDasharray="3 2"
            markerEnd={`url(#${uid}_arr)`} />
          <line x1={rightX - digitW - digitW*0.15} y1={startY + rowH*0.5}
            x2={rightX - digitW + digitW*0.15} y2={startY + rowH*0.8}
            stroke={carryColor} strokeWidth={1.4} strokeLinecap="round" />
        </>
      )}

      {/* Row 1: first number */}
      {aStr.split('').map((d, i) => (
        <text key={`a${i}`} x={rightX - (aStr.length - 1 - i) * digitW} y={startY + rowH}
          textAnchor="middle" fontSize={fs} fontWeight={700} fill={c.text}
          fontFamily="'Inter',system-ui,monospace">{d}</text>
      ))}

      {/* Row 2: operator + second number */}
      <text x={rightX - maxLen * digitW + digitW*0.15} y={startY + rowH*2}
        textAnchor="middle" fontSize={fs} fontWeight={800} fill={opColor}
        fontFamily="'Inter',system-ui,monospace">{opSym}</text>
      {bStr.split('').map((d, i) => (
        <text key={`b${i}`} x={rightX - (bStr.length - 1 - i) * digitW} y={startY + rowH*2}
          textAnchor="middle" fontSize={fs} fontWeight={700} fill={c.text}
          fontFamily="'Inter',system-ui,monospace">{d}</text>
      ))}

      {/* Line */}
      <line x1={size*0.16} y1={startY + rowH*2.28} x2={size*0.84} y2={startY + rowH*2.28}
        stroke={c.text} strokeWidth={1.8} />

      {/* Row 3: result */}
      {rPad.split('').map((d, i) => (
        <text key={`r${i}`} x={rightX - (rPad.length - 1 - i) * digitW} y={startY + rowH*3.15}
          textAnchor="middle" fontSize={fs} fontWeight={800} fill={opColor}
          fontFamily="'Inter',system-ui,monospace">{d}</text>
      ))}

      {/* Label */}
      <text x={cx} y={size * 0.92} textAnchor="middle"
        fontSize={fsSmall} fontWeight={600} fill={c.dim}>
        {carry ? (op === 'add' ? 'didestdemayî' : 'bi standinê') : (op === 'add' ? 'bêdestdemayî' : 'bê standinê')}
      </text>
    </svg>
  );
}

// ─── 25b. CustomVisual ──────────────────────────────────────────────────────
export function CustomVisual({ params = {}, theme, size = 160 }) {
  const c = vColors(theme);
  const { icon = '🔢', label = '', formula = '' } = params;
  const formulaFs = formula.length > 14 ? 9 : formula.length > 10 ? 11 : 13;
  const labelFs = label.length > 16 ? 8 : 10;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label || icon}>
      <text x={size/2} y={size * (formula || label ? 0.40 : 0.50)} textAnchor="middle"
        fontSize={size * 0.28} dominantBaseline="middle">{icon}</text>
      {formula && (
        <text x={size/2} y={size * 0.68} textAnchor="middle"
          fontSize={formulaFs} fontWeight={800} fill={c.fill1} fontFamily="monospace">
          {formula.length > 18 ? formula.slice(0, 17) + '…' : formula}
        </text>
      )}
      {label && (
        <text x={size/2} y={size * (formula ? 0.84 : 0.72)} textAnchor="middle"
          fontSize={labelFs} fontWeight={600} fill={c.dim}>
          {label.length > 20 ? label.slice(0, 19) + '…' : label}
        </text>
      )}
    </svg>
  );
}

// ─── 26. ConceptVisual (router) ──────────────────────────────────────────────
export function ConceptVisual({ visual, theme, size = 160 }) {
  if (!visual || visual.type === 'none') return null;
  const c = vColors(theme);
  const t = theme;
  const p = visual.params || {};

  const renderInner = () => {
    switch (visual.type) {
      case 'number_line':    return <NumberLineVisual params={p} theme={t} size={size} />;
      case 'counting':       return <CountingVisual params={p} theme={t} size={size} />;
      case 'blocks':         return <BlocksVisual params={p} theme={t} size={size} />;
      case 'fraction':       return <FractionVisual params={p} theme={t} size={size} />;
      case 'operation':      return <OperationVisual params={p} theme={t} size={size} />;
      case 'compare':        return <CompareVisual params={p} theme={t} size={size} />;
      case 'point':          return <GeometryVisual visual={visual} params={{...p, type:'point'}} theme={t} size={size} />;
      case 'line':           return <GeometryVisual visual={visual} params={{...p, type: p.type || 'line'}} theme={t} size={size} />;
      case 'triangle':       return <GeometryVisual visual={visual} params={{...p, type: p.type || 'triangle'}} theme={t} size={size} />;
      case 'quadrilateral':  return <GeometryVisual visual={visual} params={{...p, type: p.type || 'quadrilateral'}} theme={t} size={size} />;
      case 'circle':         return <GeometryVisual visual={visual} params={{...p, type:'circle'}} theme={t} size={size} />;
      case 'angle':          return <GeometryVisual visual={visual} params={{...p, type:'angle'}} theme={t} size={size} />;
      case 'geometry_3d':    return <Geometry3DVisual params={p} theme={t} size={size} />;
      case 'coordinate':     return <CoordinateVisual params={p} theme={t} size={size} />;
      case 'symmetry':       return <SymmetryVisual params={p} theme={t} size={size} />;
      case 'ruler':          return <RulerVisual params={p} theme={t} size={size} />;
      case 'scale':          return <ScaleVisual params={p} theme={t} size={size} />;
      case 'clock':          return <ClockVisual params={p} theme={t} size={size} />;
      case 'bar_chart':      return <BarChartVisual params={p} theme={t} size={size} />;
      case 'pie_chart':      return <PieChartVisual params={p} theme={t} size={size} />;
      case 'table':          return <TableVisual params={p} theme={t} size={size} />;
      case 'dice':           return <DiceVisual params={p} theme={t} size={size} />;
      case 'probability':    return <ProbabilityVisual params={p} theme={t} size={size} />;
      case 'variable':       return <AlgebraVisual params={{...p, type:'variable'}} theme={t} size={size} />;
      case 'equation':       return <AlgebraVisual params={{...p, type:'equation'}} theme={t} size={size} />;
      case 'pattern':        return <PatternVisual params={p} theme={t} size={size} />;
      case 'set':            return <SetVisual params={p} theme={t} size={size} />;
      case 'number_grid':    return <NumberGridVisual params={p} theme={t} size={size} />;
      case 'arrow_sequence': return <ArrowSequenceVisual params={p} theme={t} size={size} />;
      case 'area_model':     return <AreaModelVisual params={p} theme={t} size={size} />;
      case 'regrouping':     return <RegroupingVisual params={p} theme={t} size={size} />;
      default:               return <CustomVisual params={p} theme={t} size={size} />;
    }
  };

  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      borderRadius: 12,
      background: c.soft1,
      border: '1px solid ' + c.line,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {renderInner()}
    </div>
  );
}
