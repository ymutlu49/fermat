// ─── FerMat — SVG Concept Visual Library v2 ─────────────────────
// Complete overhaul: unique IDs, theme-safe colors, consistent size×size viewBox,
// fixed defs ordering, improved aesthetics, new visual types.
import { useId } from 'react';

// ─── Theme color helper ────────────────────────────────────────────────────────
// Never access t.xyz directly in visuals — always use vColors(t).
function vColors(t) {
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

// ─── Shared drop-shadow filter def ────────────────────────────────────────────
function ShadowDef({ id, blur = 2, opacity = 0.18 }) {
  return (
    <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="1" dy="2" stdDeviation={blur} floodOpacity={opacity} />
    </filter>
  );
}

// ─── 1. NumberLineVisual ───────────────────────────────────────────────────────
export function NumberLineVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const { start = 0, end = 5, highlight = [], natural = false } = params;
  const pad = 22, lineY = size * 0.52;
  const range = end - start || 1;
  const toX = n => pad + ((n - start) / range) * (size - pad * 2);
  const ticks = [];
  for (let i = start; i <= end; i++) ticks.push(i);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="jimarxêz">
      <defs>
        <marker id={`${uid}_arr`} markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M0,1 L7,4 L0,7 Z" fill={c.muted} />
        </marker>
        <ShadowDef id={`${uid}_sh`} />
      </defs>
      {/* Axis line */}
      <line x1={pad - 6} y1={lineY} x2={size - pad + 6} y2={lineY}
        stroke={c.line} strokeWidth="2" markerEnd={`url(#${uid}_arr)`} />
      {natural && (
        <text x={size - pad + 10} y={lineY + 4} fontSize={11} fill={c.muted} fontStyle="italic">…</text>
      )}
      {ticks.map(n => {
        const x = toX(n);
        const isHi = highlight.includes(n);
        return (
          <g key={n}>
            <line x1={x} y1={lineY - 6} x2={x} y2={lineY + 6}
              stroke={isHi ? c.fill1 : c.muted}
              strokeWidth={isHi ? 2 : 1.2} />
            {isHi ? (
              <>
                <circle cx={x} cy={lineY - 18} r={13} fill={c.fill1} filter={`url(#${uid}_sh)`} />
                <text x={x} y={lineY - 14} textAnchor="middle" fontSize={10}
                  fontWeight="800" fill={c.white} dominantBaseline="middle">{n}</text>
              </>
            ) : (
              <text x={x} y={lineY + 20} textAnchor="middle" fontSize={9}
                fontWeight="500" fill={c.dim}>{n}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─── 2. CountingVisual ────────────────────────────────────────────────────────
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
  const fillColor = color === 'accent' ? c.fill2 : color === 'success' ? c.fill3 : c.fill1;
  const items = [];
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / cols), col = i % cols;
    const cx = startX + col * gapX, cy = startY + row * gapY;
    const grpColor = groups > 1
      ? (Math.floor(i / Math.ceil(n / groups)) % 2 === 0 ? fillColor : c.fill3)
      : fillColor;
    const key = `item${i}`;
    if (shape === 'star') {
      const pts = Array.from({length:10}, (_,j) => {
        const a = (j * Math.PI) / 5 - Math.PI / 2;
        const rad = j % 2 === 0 ? r : r * 0.45;
        return `${cx + rad * Math.cos(a)},${cy + rad * Math.sin(a)}`;
      }).join(' ');
      items.push(<polygon key={key} points={pts} fill={grpColor} opacity={0.88} filter={`url(#${uid}_sh)`} />);
    } else if (shape === 'triangle') {
      items.push(<polygon key={key} points={`${cx},${cy-r} ${cx-r},${cy+r} ${cx+r},${cy+r}`}
        fill={grpColor} opacity={0.88} filter={`url(#${uid}_sh)`} />);
    } else if (shape === 'square') {
      items.push(<rect key={key} x={cx-r} y={cy-r} width={r*2} height={r*2} rx={3}
        fill={grpColor} opacity={0.88} filter={`url(#${uid}_sh)`} />);
    } else {
      items.push(<circle key={key} cx={cx} cy={cy} r={r}
        fill={grpColor} opacity={0.88} filter={`url(#${uid}_sh)`} />);
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${n} tişt`}>
      <defs><ShadowDef id={`${uid}_sh`} blur={2} opacity={0.22} /></defs>
      {items}
      <text x={size/2} y={size * 0.92} textAnchor="middle" fontSize={13}
        fontWeight="800" fill={fillColor}>{n}</text>
    </svg>
  );
}

// ─── 3. BlocksVisual ─────────────────────────────────────────────────────────
export function BlocksVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const { ones = 3, tens = 2, hundreds = 1 } = params;
  const hC = Math.min(hundreds, 2), tC = Math.min(tens, 5), oC = Math.min(ones, 9);

  // Simple approach: draw everything into a virtual canvas, then scale to fit
  // Virtual units: hundred=50x50, ten=8x50, one=8x8
  const VH = 50, VT = 8, VG = 4; // virtual heights/widths/gap
  // Calculate total virtual width
  let vw = 0;
  if (hC > 0) vw += hC * (VH + VG);
  if (tC > 0) vw += tC * (VT + VG);
  if (oC > 0) vw += Math.min(oC, 3) * (VT + VG);
  if (vw === 0) vw = VH;
  const vh = VH; // max virtual height is always 50 (hundreds grid height)

  // Scale to fit inside size with padding
  const pad = size * 0.08;
  const labelH = size * 0.12;
  const availW = size - pad * 2;
  const availH = size - pad - labelH;
  const sc = Math.min(availW / vw, availH / vh);

  const elems = [];
  const ofsY = pad + (availH - vh * sc) / 2;
  let ofsX = pad + (availW - vw * sc) / 2;

  // Hundreds: 5x5 grid
  for (let h = 0; h < hC; h++) {
    const cellSz = (VH * sc) / 5.4;
    const cellGap = cellSz * 0.08;
    for (let r = 0; r < 5; r++) {
      for (let col = 0; col < 5; col++) {
        elems.push(
          <rect key={`h${h}r${r}c${col}`}
            x={ofsX + col * (cellSz + cellGap)} y={ofsY + r * (cellSz + cellGap)}
            width={cellSz} height={cellSz}
            fill={c.fill1} opacity={0.78} rx={Math.max(1, sc)} />
        );
      }
    }
    const gridSz = 5 * (cellSz + cellGap) - cellGap;
    elems.push(<rect key={`hb${h}`}
      x={ofsX - 1.5} y={ofsY - 1.5} width={gridSz + 3} height={gridSz + 3}
      fill="none" stroke={c.fill1} strokeWidth={1.2} rx={2} />);
    ofsX += (VH + VG) * sc;
  }

  // Tens: 1x5 vertical bars
  for (let t = 0; t < tC; t++) {
    const barW = VT * sc * 0.9;
    const cellH = (VH * sc) / 5.4;
    const cellGap = cellH * 0.08;
    for (let seg = 0; seg < 5; seg++) {
      elems.push(
        <rect key={`t${t}s${seg}`}
          x={ofsX} y={ofsY + seg * (cellH + cellGap)}
          width={barW} height={cellH}
          fill={c.fill2} opacity={0.82} rx={Math.max(1, sc * 0.6)} />
      );
    }
    ofsX += (VT + VG) * sc;
  }

  // Ones: single cubes
  const oneSz = VT * sc * 0.9;
  const oneGap = oneSz * 0.15;
  for (let o = 0; o < oC; o++) {
    const col = o % 3, row = Math.floor(o / 3);
    elems.push(
      <rect key={`o${o}`}
        x={ofsX + col * (oneSz + oneGap)} y={ofsY + row * (oneSz + oneGap)}
        width={oneSz} height={oneSz}
        fill={c.fill3} opacity={0.85} rx={Math.max(1, sc * 0.6)} />
    );
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="bloklar">
      <defs><ShadowDef id={`${uid}_sh`} /></defs>
      {elems}
      <text x={size / 2} y={size - pad * 0.5} textAnchor="middle" fontSize={Math.min(9, size * 0.08)} fontWeight={700} fill={c.dim}>
        {hundreds > 0 && `${hundreds}×100 `}{tens > 0 && `${tens}×10 `}{ones > 0 && `${ones}×1`}
      </text>
    </svg>
  );
}

// ─── 4. FractionVisual ───────────────────────────────────────────────────────
export function FractionVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const { num = 1, den = 4, visual: vtype = 'pie' } = params;
  const cx = size / 2, cy = size * 0.44, r = size * 0.33;

  if (vtype === 'bar') {
    const barH = size * 0.26, barY = size * 0.32;
    const segW = (size - 36) / den;
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${num}/${den}`}>
        <defs><ShadowDef id={`${uid}_sh`} blur={2} /></defs>
        {Array.from({length: den}, (_, i) => (
          <rect key={i} x={18 + i * segW} y={barY} width={segW - 3} height={barH}
            fill={i < num ? c.fill2 : 'transparent'} rx={4}
            filter={i < num ? `url(#${uid}_sh)` : undefined}
            stroke={i < num ? c.fill2 : c.muted} strokeWidth={1.5}
            strokeDasharray={i < num ? undefined : '4,3'} />
        ))}
        <text x={size/2} y={barY + barH + 22} textAnchor="middle"
          fontSize={14} fontWeight={800} fill={c.fill2}>{num}/{den}</text>
      </svg>
    );
  }
  // Pie
  const sliceAngle = (2 * Math.PI) / den;
  const slices = Array.from({length: den}, (_, i) => {
    const a1 = -Math.PI / 2 + i * sliceAngle;
    const a2 = a1 + sliceAngle;
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    const large = sliceAngle > Math.PI ? 1 : 0;
    return (
      <path key={i}
        d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`}
        fill={i < num ? c.fill2 : c.soft1}
        stroke={c.white} strokeWidth={2} opacity={i < num ? 0.92 : 0.85} />
    );
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${num}/${den}`}>
      <defs>
        <ShadowDef id={`${uid}_sh`} blur={3} opacity={0.2} />
      </defs>
      <g filter={`url(#${uid}_sh)`}>{slices}</g>
      {/* Center dot */}
      <circle cx={cx} cy={cy} r={4} fill={c.white} />
      <text x={cx} y={cy + r + 22} textAnchor="middle"
        fontSize={15} fontWeight={800} fill={c.fill2}>{num}/{den}</text>
    </svg>
  );
}

// ─── 5. OperationVisual ──────────────────────────────────────────────────────
export function OperationVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const { op = 'add', a = 3, b = 2 } = params;
  const aCount = Math.min(a, 7), bCount = Math.min(b, 7);
  const total = aCount + bCount + 3;
  const r = Math.min((size * 0.75) / (total * 2.4), 14);
  const gapX = r * 2.4;
  const midY = size * 0.40;
  const items = [];

  if (op === 'sub') {
    for (let i = 0; i < aCount; i++) {
      const x = r + 4 + i * gapX;
      const isRemoved = i >= aCount - bCount;
      items.push(
        <circle key={`s${i}`} cx={x} cy={midY} r={r}
          fill={isRemoved ? c.fill5 : c.fill1} opacity={isRemoved ? 0.35 : 0.88} />
      );
      if (isRemoved) {
        items.push(
          <line key={`x1${i}`} x1={x-r} y1={midY-r} x2={x+r} y2={midY+r}
            stroke={c.fill5} strokeWidth={2} />,
          <line key={`x2${i}`} x1={x+r} y1={midY-r} x2={x-r} y2={midY+r}
            stroke={c.fill5} strokeWidth={2} />
        );
      }
    }
  } else {
    for (let i = 0; i < aCount; i++) {
      items.push(<circle key={`a${i}`} cx={r + 4 + i * gapX} cy={midY} r={r}
        fill={c.fill1} opacity={0.88} />);
    }
    const symX = r + 4 + aCount * gapX + gapX * 0.6;
    const symText = op === 'add' ? '+' : op === 'mul' ? '×' : '÷';
    const symColor = op === 'add' ? c.fill3 : op === 'mul' ? c.fill2 : c.fill4;
    items.push(
      <text key="sym" x={symX} y={midY + 5} textAnchor="middle"
        fontSize={18} fontWeight={800} fill={symColor}>{symText}</text>
    );
    const bStartX = symX + gapX * 0.7;
    for (let i = 0; i < bCount; i++) {
      items.push(<circle key={`b${i}`} cx={bStartX + i * gapX} cy={midY} r={r}
        fill={c.fill2} opacity={0.88} />);
    }
    const result = op === 'add' ? a + b : op === 'mul' ? a * b : b !== 0 ? Math.floor(a / b) : 0;
    const eqX = bStartX + bCount * gapX + gapX * 0.6;
    items.push(
      <text key="eq" x={eqX} y={midY + 5} textAnchor="middle"
        fontSize={16} fontWeight={700} fill={c.muted}>=</text>,
      <circle key="resBg" cx={eqX + gapX * 1.0} cy={midY} r={r + 3}
        fill={c.fill1} opacity={0.15} />,
      <text key="res" x={eqX + gapX * 1.0} y={midY + 5} textAnchor="middle"
        fontSize={15} fontWeight={800} fill={c.fill1}>{result}</text>
    );
  }

  const opSyms = { add: '+', sub: '−', mul: '×', div: '÷' };
  const result2 = op === 'add' ? a+b : op === 'sub' ? a-b : op === 'mul' ? a*b : b !== 0 ? Math.floor(a/b) : 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img"
      aria-label={`${a} ${opSyms[op]} ${b} = ${result2}`}>
      <defs><ShadowDef id={`${uid}_sh`} blur={1} opacity={0.15} /></defs>
      {items}
      <text x={size/2} y={size * 0.72} textAnchor="middle"
        fontSize={12} fontWeight={700} fill={c.dim}>
        {a} {opSyms[op]} {b} = {result2}
      </text>
    </svg>
  );
}

// ─── 6. CompareVisual ────────────────────────────────────────────────────────
export function CompareVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const { a = 5, b = 3, type = 'greater' } = params;
  const maxN = 8, r = size * 0.058, gapX = r * 2.3;
  const aCount = Math.min(a, maxN), bCount = Math.min(b, maxN);
  const rowY1 = size * 0.30, rowY2 = size * 0.58;

  const makeRow = (n, fill, y) => Array.from({length: n}, (_, i) => (
    <circle key={`${y}_${i}`} cx={r + 4 + i * gapX} cy={y} r={r}
      fill={fill} opacity={0.88} />
  ));

  const sym = type === 'greater' ? '>' : type === 'less' ? '<' : '=';
  const symColor = type === 'equal' ? c.fill3 : c.fill2;
  const labelX = r + 4 + maxN * gapX + 10;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img"
      aria-label={`${a} ${sym} ${b}`}>
      <defs><ShadowDef id={`${uid}_sh`} blur={1} opacity={0.15} /></defs>
      {makeRow(aCount, c.fill1, rowY1)}
      {makeRow(bCount, c.fill2, rowY2)}
      <text x={size * 0.72} y={size * 0.48} textAnchor="middle"
        fontSize={28} fontWeight={800} fill={symColor}>{sym}</text>
      <text x={r + 4 + aCount * gapX + r + 2} y={rowY1 + 4}
        fontSize={11} fontWeight={700} fill={c.fill1}>{a}</text>
      <text x={r + 4 + bCount * gapX + r + 2} y={rowY2 + 4}
        fontSize={11} fontWeight={700} fill={c.fill2}>{b}</text>
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

  const mkSvg = (content, ariaLabel) => (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={ariaLabel}>
      <defs>
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

  if (type === 'point') {
    return mkSvg(<>
      <line x1={cx-s} y1={cy} x2={cx+s} y2={cy} stroke={c.line} strokeWidth={1} strokeDasharray="5,4" />
      <line x1={cx} y1={cy-s} x2={cx} y2={cy+s} stroke={c.line} strokeWidth={1} strokeDasharray="5,4" />
      <circle cx={cx} cy={cy} r={7} fill={c.fill1} filter={`url(#${uid}_sh)`} />
      <text x={cx+12} y={cy-10} fontSize={12} fontWeight={700} fill={c.fill1}>A</text>
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
      <line x1={22} y1={cy} x2={size-22} y2={cy} stroke={c.fill1} strokeWidth={2.5} />
      <circle cx={22} cy={cy} r={5} fill={c.fill1} />
      <circle cx={size-22} cy={cy} r={5} fill={c.fill1} />
      <text x={22} y={cy-12} fontSize={11} fontWeight={700} fill={c.fill1}>A</text>
      <text x={size-22} y={cy-12} fontSize={11} fontWeight={700} fill={c.fill1}>B</text>
    </>, 'beş');
  }
  if (type === 'ray') {
    return mkSvg(<>
      <line x1={22} y1={cy} x2={size-18} y2={cy} stroke={c.fill1} strokeWidth={2.5}
        markerEnd={`url(#${uid}_al)`} />
      <circle cx={22} cy={cy} r={5} fill={c.fill1} />
      <text x={22} y={cy-12} fontSize={11} fontWeight={700} fill={c.fill1}>A</text>
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
      <polygon points={pStr} fill={c.soft1} stroke={c.fill1} strokeWidth={2.5}
        filter={`url(#${uid}_sh)`} strokeLinejoin="round" />
      {type === 'right_triangle' && (
        <rect x={pts[0][0]} y={pts[0][1]} width={10} height={10}
          fill="none" stroke={c.fill1} strokeWidth={1.8} />
      )}
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={4} fill={c.fill1} />
      ))}
    </>, 'sêgoşe');
  }
  if (type === 'quadrilateral' || type === 'square' || type === 'rectangle') {
    const rw = type === 'rectangle' ? s * 1.55 : s * 0.92;
    const rh = s * 0.92;
    return mkSvg(<>
      <rect x={cx-rw/2} y={cy-rh/2} width={rw} height={rh}
        fill={c.soft1} stroke={c.fill1} strokeWidth={2.5} rx={type === 'quadrilateral' ? 3 : 0}
        filter={`url(#${uid}_sh)`} />
      {type === 'square' && <>
        {/* Equal side marks */}
        <line x1={cx-rw/2+4} y1={cy-4} x2={cx-rw/2+11} y2={cy-4} stroke={c.fill1} strokeWidth={2} />
        <line x1={cx+rw/2-11} y1={cy-4} x2={cx+rw/2-4} y2={cy-4} stroke={c.fill1} strokeWidth={2} />
        <line x1={cx-4} y1={cy-rh/2+4} x2={cx-4} y2={cy-rh/2+11} stroke={c.fill1} strokeWidth={2} />
        <line x1={cx-4} y1={cy+rh/2-11} x2={cx-4} y2={cy+rh/2-4} stroke={c.fill1} strokeWidth={2} />
      </>}
    </>, type === 'square' ? 'çargoşe' : type === 'rectangle' ? 'tîrêj' : 'çargoşe');
  }
  if (type === 'circle') {
    const { showRadius = true } = params;
    return mkSvg(<>
      <circle cx={cx} cy={cy} r={s} fill={c.soft1} stroke={c.fill1} strokeWidth={2.5}
        filter={`url(#${uid}_sh)`} />
      <circle cx={cx} cy={cy} r={4} fill={c.fill1} />
      {showRadius && <>
        <line x1={cx} y1={cy} x2={cx+s} y2={cy} stroke={c.fill2} strokeWidth={1.8} strokeDasharray="5,3" />
        <text x={cx+s/2} y={cy-8} textAnchor="middle" fontSize={11} fontWeight={700} fill={c.fill2}>r</text>
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
    return mkSvg(<>
      <circle cx={cx} cy={cy} r={5} fill={c.fill1} />
      <line x1={cx} y1={cy} x2={x2} y2={y2} stroke={c.fill1} strokeWidth={2.5} />
      <line x1={cx} y1={cy} x2={x3} y2={y3} stroke={c.fill1} strokeWidth={2.5} />
      <path d={`M${cx+arcR},${cy} A${arcR},${arcR} 0 ${large},1 ${cx+arcR*Math.cos(-rad)},${cy+arcR*Math.sin(-rad)}`}
        fill={c.soft2} stroke={c.fill2} strokeWidth={2} opacity={0.9} />
      <text x={cx + arcR * 1.55 * Math.cos(-rad / 2)}
        y={cy + arcR * 1.55 * Math.sin(-rad / 2) + 4}
        textAnchor="middle" fontSize={11} fontWeight={800} fill={c.fill2}>{degrees}°</text>
    </>, `${degrees} derece goşe`);
  }
  // Default triangle
  const pts = [[cx, cy-s], [cx-s, cy+s*0.72], [cx+s, cy+s*0.72]];
  return mkSvg(<>
    <polygon points={pts.map(p=>p.join(',')).join(' ')}
      fill={c.soft1} stroke={c.fill1} strokeWidth={2.5}
      filter={`url(#${uid}_sh)`} strokeLinejoin="round" />
  </>, 'şekl');
}

// ─── 8. Geometry3DVisual ─────────────────────────────────────────────────────
export function Geometry3DVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const { shape = 'cube' } = params;
  const cx = size / 2, cy = size * 0.48, s = size * 0.30;

  const mkSvg = (content) => (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={shape}>
      <defs>
        <ShadowDef id={`${uid}_sh`} blur={4} opacity={0.2} />
        <linearGradient id={`${uid}_topGrad`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.fill1} stopOpacity={0.55} />
          <stop offset="100%" stopColor={c.fill1} stopOpacity={0.2} />
        </linearGradient>
        <linearGradient id={`${uid}_rightGrad`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={c.fill1} stopOpacity={0.25} />
          <stop offset="100%" stopColor={c.fill1} stopOpacity={0.08} />
        </linearGradient>
        <radialGradient id={`${uid}_sphGrad`} cx="38%" cy="32%" r="62%">
          <stop offset="0%" stopColor={c.white} stopOpacity={0.7} />
          <stop offset="60%" stopColor={c.fill1} stopOpacity={0.6} />
          <stop offset="100%" stopColor={c.fill1} stopOpacity={0.95} />
        </radialGradient>
      </defs>
      {content}
    </svg>
  );

  if (shape === 'cube') {
    const d = s * 0.52; // depth
    return mkSvg(<>
      {/* Front face */}
      <rect x={cx-s} y={cy-s*0.65+d} width={s*2} height={s*1.32}
        fill={c.soft1} stroke={c.fill1} strokeWidth={1.8} filter={`url(#${uid}_sh)`} />
      {/* Top face */}
      <polygon
        points={`${cx-s},${cy-s*0.65+d} ${cx-s+d},${cy-s*0.65} ${cx+s+d},${cy-s*0.65} ${cx+s},${cy-s*0.65+d}`}
        fill={`url(#${uid}_topGrad)`} stroke={c.fill1} strokeWidth={1.8} />
      {/* Right face */}
      <polygon
        points={`${cx+s},${cy-s*0.65+d} ${cx+s+d},${cy-s*0.65} ${cx+s+d},${cy+s*0.65} ${cx+s},${cy+s*0.65+d}`}
        fill={`url(#${uid}_rightGrad)`} stroke={c.fill1} strokeWidth={1.8} />
    </>);
  }
  if (shape === 'sphere') {
    return mkSvg(<>
      <circle cx={cx} cy={cy} r={s*1.05} fill={`url(#${uid}_sphGrad)`}
        stroke={c.fill1} strokeWidth={1.8} filter={`url(#${uid}_sh)`} />
      <ellipse cx={cx} cy={cy} rx={s*1.05} ry={s*0.32}
        fill="none" stroke={c.fill1} strokeWidth={1.2} strokeDasharray="5,3" opacity={0.5} />
    </>);
  }
  if (shape === 'cylinder') {
    return mkSvg(<>
      <rect x={cx-s*0.85} y={cy-s} width={s*1.7} height={s*2}
        fill={c.soft1} stroke={c.fill1} strokeWidth={1.8} />
      <ellipse cx={cx} cy={cy+s} rx={s*0.85} ry={s*0.28}
        fill={c.soft1} stroke={c.fill1} strokeWidth={1.8} />
      <ellipse cx={cx} cy={cy-s} rx={s*0.85} ry={s*0.28}
        fill={`url(#${uid}_topGrad)`} stroke={c.fill1} strokeWidth={1.8} />
    </>);
  }
  if (shape === 'cone') {
    return mkSvg(<>
      <polygon points={`${cx},${cy-s*1.15} ${cx-s},${cy+s*0.82} ${cx+s},${cy+s*0.82}`}
        fill={c.soft1} stroke={c.fill1} strokeWidth={1.8}
        strokeLinejoin="round" filter={`url(#${uid}_sh)`} />
      <ellipse cx={cx} cy={cy+s*0.82} rx={s} ry={s*0.3}
        fill={`url(#${uid}_topGrad)`} stroke={c.fill1} strokeWidth={1.8} />
    </>);
  }
  // Prism (default)
  return mkSvg(<>
    <polygon
      points={`${cx},${cy-s*0.95} ${cx-s*0.85},${cy+s*0.52} ${cx+s*0.85},${cy+s*0.52}`}
      fill={c.soft1} stroke={c.fill1} strokeWidth={1.8}
      strokeLinejoin="round" filter={`url(#${uid}_sh)`} />
    <polygon
      points={`${cx+s*0.85},${cy+s*0.52} ${cx+s*0.85+s*0.4},${cy+s*0.18} ${cx+s*0.4},${cy-s*1.3} ${cx},${cy-s*0.95}`}
      fill={`url(#${uid}_rightGrad)`} stroke={c.fill1} strokeWidth={1.8} />
  </>);
}

// ─── 9. CoordinateVisual ─────────────────────────────────────────────────────
export function CoordinateVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const { direction = null, showGrid = false } = params;
  const w = size, h = size;
  const cx = w * 0.40, cy = h * 0.55;

  if (direction === 'inside_outside') {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label="nav û derve">
        <circle cx={cx} cy={cy} r={42} fill="none" stroke={c.line} strokeWidth={2} strokeDasharray="5,3" />
        <circle cx={cx} cy={cy} r={22} fill={c.soft1} stroke={c.fill1} strokeWidth={2.5} />
        <text x={cx} y={cy+4} textAnchor="middle" fontSize={9} fontWeight={700} fill={c.fill1}>nav</text>
        <text x={cx+52} y={cy-18} fontSize={9} fontWeight={700} fill={c.muted}>derve</text>
        <line x1={cx+22} y1={cy-8} x2={cx+42} y2={cy-24} stroke={c.muted} strokeWidth={1} strokeDasharray="3,2" />
      </svg>
    );
  }
  if (direction === 'near_far') {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label="nêzîk û dûr">
        <circle cx={cx} cy={cy} r={12} fill={c.fill1} />
        <circle cx={cx+60} cy={cy} r={12} fill={c.fill1} opacity={0.38} />
        <line x1={cx+12} y1={cy} x2={cx+48} y2={cy} stroke={c.fill2} strokeWidth={2} strokeDasharray="4,3" />
        <text x={cx} y={cy+26} textAnchor="middle" fontSize={9} fontWeight={700} fill={c.fill1}>nêzîk</text>
        <text x={cx+60} y={cy+26} textAnchor="middle" fontSize={9} fontWeight={700} fill={c.muted}>dûr</text>
      </svg>
    );
  }

  const gridElems = [];
  if (showGrid) {
    for (let i = -3; i <= 3; i++) {
      gridElems.push(
        <line key={`gx${i}`} x1={cx+i*22} y1={12} x2={cx+i*22} y2={h-12}
          stroke={c.line} strokeWidth={0.5} opacity={0.6} />,
        <line key={`gy${i}`} x1={12} y1={cy+i*22} x2={w-12} y2={cy+i*22}
          stroke={c.line} strokeWidth={0.5} opacity={0.6} />
      );
    }
  }

  const dirElems = [];
  if (direction === 'above_below') {
    dirElems.push(
      <text key="above" x={cx+8} y={cy-28} fontSize={11} fontWeight={700} fill={c.fill1}>↑ Ser</text>,
      <text key="below" x={cx+8} y={cy+34} fontSize={11} fontWeight={700} fill={c.fill2}>↓ Bin</text>
    );
  } else if (direction === 'left_right') {
    dirElems.push(
      <text key="right" x={cx+22} y={cy-10} fontSize={11} fontWeight={700} fill={c.fill1}>Rast →</text>,
      <text key="left" x={14} y={cy-10} fontSize={11} fontWeight={700} fill={c.fill2}>← Çep</text>
    );
  } else {
    // Default: dot at (2,3)
    dirElems.push(
      <circle key="dot" cx={cx+44} cy={cy-44} r={6} fill={c.fill2} />,
      <text key="coord" x={cx+52} y={cy-48} fontSize={9} fontWeight={700} fill={c.fill2}>(2,3)</text>,
      <line key="dx" x1={cx+44} y1={cy} x2={cx+44} y2={cy-44} stroke={c.fill2} strokeWidth={1} strokeDasharray="3,2" opacity={0.5} />,
      <line key="dy" x1={cx} y1={cy-44} x2={cx+44} y2={cy-44} stroke={c.fill2} strokeWidth={1} strokeDasharray="3,2" opacity={0.5} />
    );
  }

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label="koordînat">
      <defs>
        <marker id={`${uid}_ca`} markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0.5 L5.5,3 L0,5.5 Z" fill={c.muted} />
        </marker>
      </defs>
      {gridElems}
      <line x1={14} y1={cy} x2={w-12} y2={cy} stroke={c.muted} strokeWidth={1.8}
        markerEnd={`url(#${uid}_ca)`} />
      <line x1={cx} y1={h-14} x2={cx} y2={12} stroke={c.muted} strokeWidth={1.8}
        markerEnd={`url(#${uid}_ca)`} />
      <text x={w-10} y={cy-5} fontSize={9} fill={c.muted}>x</text>
      <text x={cx+5} y={16} fontSize={9} fill={c.muted}>y</text>
      {dirElems}
    </svg>
  );
}

// ─── 10. SymmetryVisual ──────────────────────────────────────────────────────
export function SymmetryVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const cx = size / 2, h = size;
  const showLabel = params.label !== false;
  return (
    <svg width={size} height={h} viewBox={`0 0 ${size} ${h}`} role="img" aria-label="sîmetrî">
      <defs><ShadowDef id={`${uid}_sh`} blur={3} opacity={0.15} /></defs>
      {/* Left wing */}
      <path d={`M${cx},${h*0.22} Q${cx-46},${h*0.08} ${cx-56},${h*0.44} Q${cx-46},${h*0.68} ${cx},${h*0.72}`}
        fill={c.soft1} stroke={c.fill1} strokeWidth={2} filter={`url(#${uid}_sh)`} />
      {/* Right wing */}
      <path d={`M${cx},${h*0.22} Q${cx+46},${h*0.08} ${cx+56},${h*0.44} Q${cx+46},${h*0.68} ${cx},${h*0.72}`}
        fill={c.soft2} stroke={c.fill2} strokeWidth={2} filter={`url(#${uid}_sh)`} />
      {/* Axis */}
      <line x1={cx} y1={h*0.08} x2={cx} y2={h*0.86}
        stroke={c.muted} strokeWidth={1.8} strokeDasharray="6,3" />
      {showLabel && <text x={cx} y={h*0.92} textAnchor="middle" fontSize={10} fill={c.muted}>sîmetrî</text>}
    </svg>
  );
}

// ─── 11. RulerVisual ─────────────────────────────────────────────────────────
export function RulerVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const { length = 5, unit = 'cm' } = params;
  const startX = 14, endX = size - 14;
  const rulerW = endX - startX;
  const rulerH = size * 0.28, rulerY = size * 0.36;
  const tickCount = Math.min(length, 10);
  const tickGap = rulerW / tickCount;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${length}${unit} pîvan`}>
      <defs><ShadowDef id={`${uid}_sh`} blur={2} opacity={0.15} /></defs>
      {/* Ruler body */}
      <rect x={startX} y={rulerY} width={rulerW} height={rulerH}
        fill={c.bg} stroke={c.fill1} strokeWidth={1.8} rx={3}
        filter={`url(#${uid}_sh)`} />
      {/* Color stripe */}
      <rect x={startX} y={rulerY} width={rulerW} height={rulerH * 0.22}
        fill={c.fill1} rx={3} opacity={0.8} />
      {/* Ticks */}
      {Array.from({length: tickCount + 1}, (_, i) => {
        const x = startX + i * tickGap;
        const isMajor = i % (tickCount <= 5 ? 1 : 2) === 0;
        const tickH = isMajor ? rulerH * 0.55 : rulerH * 0.32;
        return (
          <g key={i}>
            <line x1={x} y1={rulerY + rulerH - tickH} x2={x} y2={rulerY + rulerH}
              stroke={c.fill1} strokeWidth={isMajor ? 1.8 : 0.8} />
            {isMajor && (
              <text x={x} y={rulerY + rulerH + 14} textAnchor="middle"
                fontSize={9} fill={c.dim} fontWeight={600}>{i}</text>
            )}
          </g>
        );
      })}
      <text x={endX - 8} y={rulerY + rulerH * 0.62}
        fontSize={9} fontWeight={700} fill={c.muted} textAnchor="end">{unit}</text>
    </svg>
  );
}

// ─── 12. ScaleVisual ─────────────────────────────────────────────────────────
export function ScaleVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const { balanced = true, leftLabel = '', rightLabel = '' } = params;
  const cx = size / 2, baseY = size * 0.88, postH = size * 0.52;
  const tilt = balanced ? 0 : 14;
  const beamColor = balanced ? c.fill3 : c.fill5;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img"
      aria-label={balanced ? 'hevseng' : 'nehevseng'}>
      <defs><ShadowDef id={`${uid}_sh`} blur={2} opacity={0.15} /></defs>
      {/* Post */}
      <line x1={cx} y1={baseY-postH} x2={cx} y2={baseY}
        stroke={c.muted} strokeWidth={4} strokeLinecap="round" />
      {/* Base */}
      <rect x={cx-28} y={baseY} width={56} height={9} rx={5}
        fill={c.muted} filter={`url(#${uid}_sh)`} />
      {/* Beam */}
      <line x1={cx-size*0.34} y1={baseY-postH+tilt}
        x2={cx+size*0.34} y2={baseY-postH-tilt}
        stroke={beamColor} strokeWidth={3.5} strokeLinecap="round" />
      {/* Pivot */}
      <circle cx={cx} cy={baseY-postH} r={5} fill={beamColor} />
      {/* Left pan + string */}
      <line x1={cx-size*0.34} y1={baseY-postH+tilt}
        x2={cx-size*0.34} y2={baseY-postH+tilt+20}
        stroke={c.muted} strokeWidth={1.5} />
      <ellipse cx={cx-size*0.34} cy={baseY-postH+tilt+25}
        rx={26} ry={8} fill="none"
        stroke={balanced ? c.fill3 : c.fill2} strokeWidth={2.5} />
      {leftLabel && (
        <text x={cx-size*0.34} y={Math.min(baseY-postH+tilt+42, size - 16)}
          textAnchor="middle" fontSize={9} fontWeight={700} fill={c.text}>{leftLabel}</text>
      )}
      {/* Right pan + string */}
      <line x1={cx+size*0.34} y1={baseY-postH-tilt}
        x2={cx+size*0.34} y2={baseY-postH-tilt+20}
        stroke={c.muted} strokeWidth={1.5} />
      <ellipse cx={cx+size*0.34} cy={baseY-postH-tilt+25}
        rx={26} ry={8} fill="none"
        stroke={balanced ? c.fill3 : c.fill1} strokeWidth={2.5} />
      {rightLabel && (
        <text x={cx+size*0.34} y={Math.min(baseY-postH-tilt+42, size - 16)}
          textAnchor="middle" fontSize={9} fontWeight={700} fill={c.text}>{rightLabel}</text>
      )}
    </svg>
  );
}

// ─── 13. ClockVisual ─────────────────────────────────────────────────────────
export function ClockVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const { hour = 3, minute = 0 } = params;
  const cx = size / 2, cy = size * 0.50, r = size * 0.42;
  const hourAngle  = ((hour % 12) / 12) * 2 * Math.PI - Math.PI / 2 + (minute / 60) * (Math.PI / 6);
  const minAngle   = (minute / 60) * 2 * Math.PI - Math.PI / 2;
  const secAngle   = -Math.PI / 2; // 12 o'clock reference
  const hx = cx + r * 0.55 * Math.cos(hourAngle), hy = cy + r * 0.55 * Math.sin(hourAngle);
  const mx = cx + r * 0.78 * Math.cos(minAngle),  my = cy + r * 0.78 * Math.sin(minAngle);
  const nums = [12,1,2,3,4,5,6,7,8,9,10,11];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img"
      aria-label={`${hour}:${String(minute).padStart(2,'0')}`}>
      <defs><ShadowDef id={`${uid}_sh`} blur={4} opacity={0.18} /></defs>
      {/* Clock face */}
      <circle cx={cx} cy={cy} r={r} fill={c.bg} stroke={c.line} strokeWidth={3}
        filter={`url(#${uid}_sh)`} />
      {/* Minute and hour tick marks */}
      {Array.from({length: 60}, (_, i) => {
        const a = (i / 60) * 2 * Math.PI - Math.PI / 2;
        const isMaj = i % 5 === 0;
        const r1 = r - (isMaj ? 10 : 5), r2 = r - 1;
        return (
          <line key={i}
            x1={cx + r1 * Math.cos(a)} y1={cy + r1 * Math.sin(a)}
            x2={cx + r2 * Math.cos(a)} y2={cy + r2 * Math.sin(a)}
            stroke={isMaj ? c.fill1 : c.line}
            strokeWidth={isMaj ? 2.2 : 0.8} />
        );
      })}
      {/* Hour numbers */}
      {nums.map((n, i) => {
        const a = (i / 12) * 2 * Math.PI - Math.PI / 2;
        return (
          <text key={n} x={cx + (r-20) * Math.cos(a)} y={cy + (r-20) * Math.sin(a) + 4}
            textAnchor="middle" fontSize={11} fontWeight={700} fill={c.text}>{n}</text>
        );
      })}
      {/* Hour hand */}
      <line x1={cx} y1={cy} x2={hx} y2={hy}
        stroke={c.fill1} strokeWidth={5} strokeLinecap="round" />
      {/* Minute hand */}
      <line x1={cx} y1={cy} x2={mx} y2={my}
        stroke={c.fill1} strokeWidth={3} strokeLinecap="round" />
      {/* Center dot */}
      <circle cx={cx} cy={cy} r={5} fill={c.fill1} />
      <circle cx={cx} cy={cy} r={2.5} fill={c.white} />
    </svg>
  );
}

// ─── 14. BarChartVisual ──────────────────────────────────────────────────────
export function BarChartVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const { values = [3, 5, 2, 4], labels = [] } = params;
  const maxV = Math.max(...values, 1);
  const padL = 22, padB = 24, padT = 12, padR = 8;
  const chartW = size - padL - padR;
  const chartH = size - padB - padT;
  const barW = chartW / values.length - 5;
  const colors = [c.fill1, c.fill2, c.fill3, c.fill4, c.fill5, c.fill6];
  // Grid lines
  const gridLines = [0.25, 0.5, 0.75, 1.0].map(f => {
    const y = padT + chartH * (1 - f);
    return (
      <line key={f} x1={padL} y1={y} x2={size-padR} y2={y}
        stroke={c.line} strokeWidth={0.5} strokeDasharray="4,3" opacity={0.7} />
    );
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="bar chart">
      <defs><ShadowDef id={`${uid}_sh`} blur={2} opacity={0.15} /></defs>
      {/* Axes */}
      <line x1={padL} y1={padT} x2={padL} y2={size-padB} stroke={c.muted} strokeWidth={1.8} />
      <line x1={padL} y1={size-padB} x2={size-padR} y2={size-padB} stroke={c.muted} strokeWidth={1.8} />
      {gridLines}
      {values.map((v, i) => {
        const barH = (v / maxV) * chartH;
        const x = padL + 3 + i * (barW + 5);
        const y = padT + chartH - barH;
        const col = colors[i % colors.length];
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH}
              fill={col} rx={4} opacity={0.88}
              filter={`url(#${uid}_sh)`} />
            <text x={x + barW/2} y={y - 4} textAnchor="middle"
              fontSize={9} fontWeight={800} fill={col}>{v}</text>
            {labels[i] && (
              <text x={x + barW/2} y={Math.min(size-padB+13, size - 4)} textAnchor="middle"
                fontSize={7} fill={c.dim}>{labels[i].length > 6 ? labels[i].slice(0, 5) + '…' : labels[i]}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─── 15. PieChartVisual ──────────────────────────────────────────────────────
export function PieChartVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const { slices = [30, 45, 25] } = params;
  const cx = size * 0.44, cy = size * 0.46, r = size * 0.36;
  const total = slices.reduce((a, b) => a + b, 0);
  const colors = [c.fill1, c.fill2, c.fill3, c.fill4, c.fill5, c.fill6];
  let startAngle = -Math.PI / 2;
  const paths = slices.map((s, i) => {
    const angle = (s / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(startAngle + angle), y2 = cy + r * Math.sin(startAngle + angle);
    const large = angle > Math.PI ? 1 : 0;
    const midA = startAngle + angle / 2;
    const labelR = Math.min(r + 16, size * 0.46);
    const lx = cx + labelR * Math.cos(midA), ly = cy + labelR * Math.sin(midA);
    // Clamp label within viewBox
    const clampedLx = Math.max(14, Math.min(lx, size - 14));
    const clampedLy = Math.max(10, Math.min(ly, size - 6));
    const d = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`;
    const pct = Math.round(s / total * 100);
    startAngle += angle;
    return (
      <g key={i}>
        <path d={d} fill={colors[i % colors.length]} stroke={c.white} strokeWidth={2} opacity={0.9} />
        {pct >= 8 && (
          <text x={clampedLx} y={clampedLy} textAnchor="middle" fontSize={8} fontWeight={700}
            fill={colors[i % colors.length]}>{pct}%</text>
        )}
      </g>
    );
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="pie chart">
      <defs><ShadowDef id={`${uid}_sh`} blur={4} opacity={0.2} /></defs>
      <g filter={`url(#${uid}_sh)`}>{paths}</g>
    </svg>
  );
}

// ─── 16. TableVisual ─────────────────────────────────────────────────────────
export function TableVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const { rows = 3, cols = 3, data = [] } = params;
  const cellW = (size - 20) / cols, cellH = (size * 0.72 - 10) / (rows + 1);
  const startX = 10, startY = size * 0.10;
  const cells = [];
  for (let r = -1; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      const x = startX + col * cellW, y = startY + (r + 1) * cellH;
      const isHeader = r === -1;
      cells.push(
        <rect key={`bg${r}${col}`} x={x+0.5} y={y+0.5}
          width={cellW-1} height={cellH-1}
          fill={isHeader ? c.fill1 : r % 2 === 0 ? c.bg : c.soft1}
          rx={isHeader && col === 0 ? 4 : isHeader && col === cols-1 ? 4 : 0} />
      );
      if (data[r] && data[r][col]) {
        cells.push(
          <text key={`t${r}${col}`} x={x + cellW/2} y={y + cellH/2 + 4}
            textAnchor="middle" fontSize={8} fontWeight={isHeader ? 700 : 400}
            fill={isHeader ? c.white : c.text}>{data[r][col]}</text>
        );
      }
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="tablo">
      <defs><ShadowDef id={`${uid}_sh`} blur={3} opacity={0.12} /></defs>
      <rect x={startX} y={startY} width={size-20} height={cellH*(rows+1)}
        fill="none" stroke={c.line} strokeWidth={1} rx={4}
        filter={`url(#${uid}_sh)`} />
      {cells}
      {/* Grid lines */}
      {Array.from({length: rows}, (_, i) => (
        <line key={`hl${i}`} x1={startX} y1={startY + (i+1)*cellH}
          x2={startX + size - 20} y2={startY + (i+1)*cellH}
          stroke={c.line} strokeWidth={0.6} />
      ))}
      {Array.from({length: cols-1}, (_, i) => (
        <line key={`vl${i}`} x1={startX + (i+1)*cellW} y1={startY}
          x2={startX + (i+1)*cellW} y2={startY + cellH*(rows+1)}
          stroke={c.line} strokeWidth={0.6} />
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
export function NumberGridVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const { cols: rawCols = 5, rows: rawRows = 4, highlight = [], crossed = [], startAt = 1 } = params;
  const cols = Math.min(rawCols, 10), rows = Math.min(rawRows, 8); // cap grid size
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
      cells.push(
        <rect key={`bg${r}${col}`} x={x+1} y={y+1} width={cellW-2} height={cellH-2}
          fill={isHi ? c.fill1 : c.bg} stroke={c.line} strokeWidth={0.7} rx={3} />,
        <text key={`t${r}${col}`} x={x + cellW/2} y={y + cellH/2 + 4}
          textAnchor="middle" fontSize={Math.min(cellW * 0.45, 12)}
          fontWeight={isHi ? 800 : 400}
          fill={isHi ? c.white : isCross ? c.muted : c.text}>{n}</text>
      );
      if (isCross) {
        cells.push(
          <line key={`x1${r}${col}`} x1={x+4} y1={y+4} x2={x+cellW-4} y2={y+cellH-4}
            stroke={c.fill5} strokeWidth={1.5} />,
          <line key={`x2${r}${col}`} x1={x+cellW-4} y1={y+4} x2={x+4} y2={y+cellH-4}
            stroke={c.fill5} strokeWidth={1.5} />
        );
      }
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="jimarên risteyê">
      <defs><ShadowDef id={`${uid}_sh`} blur={2} opacity={0.1} /></defs>
      {cells}
    </svg>
  );
}

// ─── 23. ArrowSequenceVisual (NEW) ───────────────────────────────────────────
export function ArrowSequenceVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const { from = [1, 2, 3], to = [2, 4, 6], label = '×2' } = params;
  const n = Math.min(from.length, to.length, 4);
  const rowH = (size * 0.75) / (n + 1);
  const lx = size * 0.16, rx = size * 0.78;
  const midX = size * 0.5;
  const topY = size * 0.14;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="rêzik">
      <defs>
        <marker id={`${uid}_aseq`} markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0.5 L5.5,3 L0,5.5 Z" fill={c.fill2} />
        </marker>
        <ShadowDef id={`${uid}_sh`} blur={2} opacity={0.15} />
      </defs>
      {/* Column headers */}
      <text x={lx} y={topY - 4} textAnchor="middle" fontSize={9} fontWeight={700} fill={c.dim}>Têkeve</text>
      <text x={rx} y={topY - 4} textAnchor="middle" fontSize={9} fontWeight={700} fill={c.dim}>Derxe</text>
      {/* Operation label */}
      <rect x={midX-22} y={topY + n*rowH/2 - 12} width={44} height={22} rx={8}
        fill={c.fill2} opacity={0.15} />
      <text x={midX} y={topY + n*rowH/2 + 3} textAnchor="middle"
        fontSize={12} fontWeight={800} fill={c.fill2}>{label}</text>
      {Array.from({length: n}, (_, i) => {
        const y = topY + (i + 0.5) * rowH;
        return (
          <g key={i}>
            {/* From bubble */}
            <circle cx={lx} cy={y} r={16} fill={c.soft1} stroke={c.fill1} strokeWidth={1.8}
              filter={`url(#${uid}_sh)`} />
            <text x={lx} y={y+4} textAnchor="middle" fontSize={11} fontWeight={700} fill={c.fill1}>
              {from[i]}
            </text>
            {/* Arrow */}
            <line x1={lx+17} y1={y} x2={rx-17} y2={y}
              stroke={c.fill2} strokeWidth={1.8} markerEnd={`url(#${uid}_aseq)`} />
            {/* To bubble */}
            <circle cx={rx} cy={y} r={16} fill={c.soft2} stroke={c.fill2} strokeWidth={1.8} />
            <text x={rx} y={y+4} textAnchor="middle" fontSize={11} fontWeight={700} fill={c.fill2}>
              {to[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── 24. AreaModelVisual (NEW) ───────────────────────────────────────────────
export function AreaModelVisual({ params = {}, theme, size = 160 }) {
  const uid = useId().replace(/:/g, '');
  const c = vColors(theme);
  const { a = 4, b = 3 } = params;
  const pad = 28;
  const aW = size - pad * 2, aH = size * 0.62 - pad;
  const cellW = aW / a, cellH = aH / b;
  const cells = [];
  for (let row = 0; row < b; row++) {
    for (let col = 0; col < a; col++) {
      cells.push(
        <rect key={`${row}${col}`}
          x={pad + col * cellW + 1} y={pad + row * cellH + 1}
          width={cellW - 2} height={cellH - 2}
          fill={c.soft1} stroke={c.fill1} strokeWidth={0.7} rx={2} />
      );
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img"
      aria-label={`${a} × ${b} = ${a*b}`}>
      <defs><ShadowDef id={`${uid}_sh`} blur={3} opacity={0.12} /></defs>
      {/* Outer rect */}
      <rect x={pad} y={pad} width={aW} height={aH}
        fill="none" stroke={c.fill1} strokeWidth={2.5} rx={4}
        filter={`url(#${uid}_sh)`} />
      {cells}
      {/* Width label */}
      <text x={pad + aW/2} y={pad - 8} textAnchor="middle"
        fontSize={11} fontWeight={800} fill={c.fill1}>{a}</text>
      {/* Height label */}
      <text x={pad - 8} y={pad + aH/2 + 4} textAnchor="middle"
        fontSize={11} fontWeight={800} fill={c.fill1}
        transform={`rotate(-90,${pad-8},${pad + aH/2 + 4})`}>{b}</text>
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
  const carryColor = op === 'add' ? '#E76F51' : '#3B82F6';

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
        <ShadowDef id={`${uid}_sh`} blur={1.5} opacity={0.12} />
        {carry && (
          <marker id={`${uid}_arr`} markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,1 L5,3 L0,5 Z" fill={carryColor} />
          </marker>
        )}
      </defs>

      {/* Card bg */}
      <rect x={size*0.1} y={size*0.06} width={size*0.8} height={size*0.74}
        rx={size*0.06} fill={c.white} stroke={c.line} strokeWidth={1}
        filter={`url(#${uid}_sh)`} />

      {/* Carry indicator */}
      {carry && op === 'add' && (
        <>
          <path d={`M${rightX} ${startY + rowH*0.3} Q${rightX - digitW*0.5} ${startY - rowH*0.1} ${rightX - digitW} ${startY + rowH*0.3}`}
            fill="none" stroke={carryColor} strokeWidth={1.3} strokeDasharray="3 2"
            markerEnd={`url(#${uid}_arr)`} />
          <text x={rightX - digitW} y={startY + rowH*0.22}
            textAnchor="middle" fontSize={fsSmall} fontWeight={800} fill={carryColor}>1</text>
        </>
      )}
      {carry && op === 'sub' && (
        <>
          <path d={`M${rightX - digitW} ${startY + rowH*0.3} Q${rightX - digitW*0.5} ${startY - rowH*0.1} ${rightX} ${startY + rowH*0.3}`}
            fill="none" stroke={carryColor} strokeWidth={1.3} strokeDasharray="3 2"
            markerEnd={`url(#${uid}_arr)`} />
          <line x1={rightX - digitW - digitW*0.15} y1={startY + rowH*0.5}
            x2={rightX - digitW + digitW*0.15} y2={startY + rowH*0.8}
            stroke={carryColor} strokeWidth={1.2} />
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
