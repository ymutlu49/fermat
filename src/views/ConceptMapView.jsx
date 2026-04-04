// ─── FerMat — Concept Map View (SVG Radial Graph) ───────────────
import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { ALL_CONCEPTS, SECTIONS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, DURATION, ICON_SIZE, TOUCH_MIN } from '@data';
import { getSectionColor } from '@utils/helpers.js';
import { buildSectionGraph, computeRadialLayout, computeEdgePath, getSectionsWithGraphs } from '@utils/graphLayout.js';
import { useMediaQuery } from '@hooks';
import { Pill } from '@components/ui';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Convert a Kurdish term to title case (first letter of each word uppercase) */
function toTitleCase(str) {
  return str
    .toLowerCase()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Clamp a number between min and max */
function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

// ── Zoom constants ───────────────────────────────────────────────────────────
const ZOOM_FACTOR = 1.15;
const MIN_ZOOM    = 0.3;
const MAX_ZOOM    = 3.0;

// ── SVG arrow marker ID ──────────────────────────────────────────────────────
const ARROW_ID    = 'cm-arrowhead';
const SHADOW_ID   = 'cm-drop-shadow';

// ─── Component ───────────────────────────────────────────────────────────────
export default function ConceptMapView({ theme, isDark, concepts }) {
  const t = theme;
  const { isMobile, isTablet, isDesktop } = useMediaQuery();

  // ── Responsive dimensions ────────────────────────────────────────────────
  const nodeW       = isMobile ? 100 : 130;
  const nodeH       = isMobile ? 44  : 56;
  const rBase       = isMobile ? 120 : 160;
  const rIncrement  = isMobile ? 110 : 140;
  const canvasW     = 1200;
  const canvasH     = 1000;
  const px          = isMobile ? SPACING.sm + 2 : isTablet ? SPACING.md : SPACING.lg;

  // ── Available sections (only those with graph data) ──────────────────────
  const graphSections = useMemo(() => getSectionsWithGraphs(), []);
  const defaultSection = graphSections[0] ?? 0;

  // ── State ────────────────────────────────────────────────────────────────
  const [activeSectionId, setActiveSectionId] = useState(defaultSection);
  const [selectedNode, setSelectedNode]       = useState(null);
  const [viewBox, setViewBox]                 = useState({ x: 0, y: 0, w: canvasW, h: canvasH });
  const [isPanning, setIsPanning]             = useState(false);
  const [panStart, setPanStart]               = useState({ x: 0, y: 0 });

  const svgRef = useRef(null);

  // ── Graph data + layout (recomputed on section change) ───────────────────
  const { graph, positions, sectionColor } = useMemo(() => {
    const g = buildSectionGraph(activeSectionId);
    const sc = getSectionColor(activeSectionId, isDark);
    const pos = computeRadialLayout(g.nodes, g.edges, g.rootKey, canvasW, canvasH, {
      rBase, rIncrement, nodeWidth: nodeW, nodeHeight: nodeH,
    });
    return { graph: g, positions: pos, sectionColor: sc };
  }, [activeSectionId, isDark, rBase, rIncrement, nodeW, nodeH]);

  // ── Concept lookup map ───────────────────────────────────────────────────
  const conceptMap = useMemo(() => {
    const map = {};
    ALL_CONCEPTS.forEach(c => { map[c.ku] = c; });
    return map;
  }, []);

  // ── Pan handlers ─────────────────────────────────────────────────────────
  const handlePointerDown = useCallback((e) => {
    if (e.target.closest('[data-node]')) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!isPanning) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = viewBox.w / rect.width;
    const scaleY = viewBox.h / rect.height;
    const dx = (e.clientX - panStart.x) * scaleX;
    const dy = (e.clientY - panStart.y) * scaleY;
    setViewBox(prev => ({ ...prev, x: prev.x - dx, y: prev.y - dy }));
    setPanStart({ x: e.clientX, y: e.clientY });
  }, [isPanning, panStart, viewBox.w, viewBox.h]);

  const handlePointerUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // ── Zoom via wheel (attached as non-passive for preventDefault) ──────────
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;
    setViewBox(prev => {
      const newW = clamp(prev.w * factor, canvasW * MIN_ZOOM, canvasW * MAX_ZOOM);
      const newH = clamp(prev.h * factor, canvasH * MIN_ZOOM, canvasH * MAX_ZOOM);
      const cx = prev.x + prev.w / 2;
      const cy = prev.y + prev.h / 2;
      return { x: cx - newW / 2, y: cy - newH / 2, w: newW, h: newH };
    });
  }, []);

  // Attach wheel as non-passive so preventDefault works
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.addEventListener('wheel', handleWheel, { passive: false });
    return () => svg.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // ── Toolbar actions ──────────────────────────────────────────────────────
  const zoomIn = useCallback(() => {
    setViewBox(prev => {
      const newW = clamp(prev.w / ZOOM_FACTOR, canvasW * MIN_ZOOM, canvasW * MAX_ZOOM);
      const newH = clamp(prev.h / ZOOM_FACTOR, canvasH * MIN_ZOOM, canvasH * MAX_ZOOM);
      const cx = prev.x + prev.w / 2;
      const cy = prev.y + prev.h / 2;
      return { x: cx - newW / 2, y: cy - newH / 2, w: newW, h: newH };
    });
  }, []);

  const zoomOut = useCallback(() => {
    setViewBox(prev => {
      const newW = clamp(prev.w * ZOOM_FACTOR, canvasW * MIN_ZOOM, canvasW * MAX_ZOOM);
      const newH = clamp(prev.h * ZOOM_FACTOR, canvasH * MIN_ZOOM, canvasH * MAX_ZOOM);
      const cx = prev.x + prev.w / 2;
      const cy = prev.y + prev.h / 2;
      return { x: cx - newW / 2, y: cy - newH / 2, w: newW, h: newH };
    });
  }, []);

  const resetView = useCallback(() => {
    setViewBox({ x: 0, y: 0, w: canvasW, h: canvasH });
  }, []);

  // ── Export / Print ───────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Nexşeya Têgehan — ${SECTIONS[activeSectionId]?.short || ''}</title>
        <style>
          @media print {
            body { margin: 0; padding: 0; }
            svg { width: 100vw; height: 100vh; }
          }
          body { display: flex; justify-content: center; align-items: center;
                 min-height: 100vh; margin: 0; background: #fff; }
        </style>
      </head>
      <body>${svgStr}</body>
      </html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 400);
  }, [activeSectionId]);

  // ── Section change handler ───────────────────────────────────────────────
  const handleSectionChange = useCallback((sid) => {
    setActiveSectionId(sid);
    setSelectedNode(null);
    resetView();
  }, [resetView]);

  // ── Node click ───────────────────────────────────────────────────────────
  const handleNodeClick = useCallback((nodeId) => {
    const concept = conceptMap[nodeId];
    if (concept) setSelectedNode(concept);
  }, [conceptMap]);

  // ── Close detail panel ───────────────────────────────────────────────────
  const closeDetail = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────
  const vb = `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`;
  const edgeColor = sectionColor.accent + '66'; // 40% opacity
  const rootBorderWidth = 3;

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      overflow: 'hidden', background: 'transparent', position: 'relative',
    }}>

      {/* ── Section selector bar ── */}
      <div style={{
        padding: `${SPACING.sm}px ${px}px 6px`,
        borderBottom: `1px solid ${t.border}`,
        background: t.surface,
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex', gap: 6,
          overflowX: 'auto', paddingBottom: 2,
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}>
          {graphSections.map(sid => {
            const sec = SECTIONS[sid];
            const sc = getSectionColor(sid, isDark);
            return (
              <Pill
                key={sid}
                label={sec.short}
                isActive={activeSectionId === sid}
                color={sc.accent}
                onClick={() => handleSectionChange(sid)}
              />
            );
          })}
        </div>
      </div>

      {/* ── Title ── */}
      <div style={{
        padding: `${SPACING.sm}px ${px}px ${SPACING.xs}px`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: t.text,
        }}>
          Nexşeya Têgehan
        </span>
        <span style={{
          fontSize: FONT_SIZE.sm, color: t.textMuted,
        }}>
          {graph.nodes.length} têgeh &middot; {graph.edges.length} girêdan
        </span>
      </div>

      {/* ── SVG Canvas ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <svg
          ref={svgRef}
          viewBox={vb}
          width="100%"
          height="100%"
          role="img"
          aria-label={`Nexşeya têgehan — ${SECTIONS[activeSectionId]?.name || ''}: ${graph.nodes.length} têgeh, ${graph.edges.length} girêdan`}
          style={{
            display: 'block', cursor: isPanning ? 'grabbing' : 'grab',
            touchAction: 'none', userSelect: 'none',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* ── Defs: arrowhead + drop shadow ── */}
          <defs>
            <marker
              id={ARROW_ID}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={sectionColor.accent} opacity="0.6" />
            </marker>
            <filter id={SHADOW_ID} x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* ── Background ── */}
          <rect
            x={viewBox.x - 2000}
            y={viewBox.y - 2000}
            width={viewBox.w + 4000}
            height={viewBox.h + 4000}
            fill={t.bg}
          />

          {/* ── Edges ── */}
          {graph.edges.map((edge, i) => {
            const from = positions[edge.from];
            const to = positions[edge.to];
            if (!from || !to) return null;
            const d = computeEdgePath(from, to);
            return (
              <path
                key={`edge-${i}`}
                d={d}
                stroke={edgeColor}
                strokeWidth={2}
                fill="none"
                markerEnd={`url(#${ARROW_ID})`}
              />
            );
          })}

          {/* ── Nodes ── */}
          {graph.nodes.map(node => {
            const pos = positions[node.id];
            if (!pos) return null;
            const isRoot = node.id === graph.rootKey;
            const rx = nodeW / 2;
            const ry = nodeH / 2;
            const fontSize = isMobile ? 11 : 13;
            const subFontSize = isMobile ? 9 : 10.5;

            return (
              <g
                key={node.id}
                data-node={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                style={{ cursor: 'pointer' }}
                onClick={(e) => { e.stopPropagation(); handleNodeClick(node.id); }}
              >
                <rect
                  x={-rx}
                  y={-ry}
                  width={nodeW}
                  height={nodeH}
                  rx={RADIUS.lg}
                  fill={sectionColor.bg}
                  stroke={sectionColor.accent}
                  strokeWidth={isRoot ? rootBorderWidth : 1.5}
                  filter={`url(#${SHADOW_ID})`}
                />
                {/* Kurdish term */}
                <text
                  x={0}
                  y={node.tr ? -4 : 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={sectionColor.text}
                  fontSize={fontSize}
                  fontWeight={FONT_WEIGHT.bold}
                  fontFamily="inherit"
                >
                  {toTitleCase(node.ku)}
                </text>
                {/* Turkish translation */}
                {node.tr && (
                  <text
                    x={0}
                    y={ry - (isMobile ? 10 : 14)}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={t.textMuted}
                    fontSize={subFontSize}
                    fontWeight={FONT_WEIGHT.normal}
                    fontFamily="inherit"
                  >
                    {node.tr}
                  </text>
                )}
                {/* Root indicator ring */}
                {isRoot && (
                  <rect
                    x={-rx - 3}
                    y={-ry - 3}
                    width={nodeW + 6}
                    height={nodeH + 6}
                    rx={RADIUS.lg + 2}
                    fill="none"
                    stroke={sectionColor.accent}
                    strokeWidth={1}
                    strokeDasharray="4 3"
                    opacity={0.5}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* ── Toolbar (zoom in / out / export) ── */}
        <div style={{
          position: 'absolute',
          top: SPACING.sm,
          right: SPACING.sm,
          display: 'flex', flexDirection: 'column', gap: SPACING.xs,
          zIndex: 10,
        }}>
          <ToolbarButton label="+" onClick={zoomIn} theme={t} title="Zoom in" />
          <ToolbarButton label="−" onClick={zoomOut} theme={t} title="Zoom out" />
          <ToolbarButton label="↺" onClick={resetView} theme={t} title="Reset" />
          <ToolbarButton label="🖨" onClick={handleExport} theme={t} title="Çap bike" />
        </div>
      </div>

      {/* ── Detail panel (bottom card) ── */}
      {selectedNode && (
        <>
          {/* Backdrop */}
          <div
            onClick={closeDetail}
            style={{
              position: 'absolute', inset: 0, zIndex: 20,
              background: 'rgba(0,0,0,0.15)',
            }}
          />
          {/* Card */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            zIndex: 30,
            background: t.surface,
            borderTop: `3px solid ${sectionColor.accent}`,
            borderRadius: `${RADIUS.xl}px ${RADIUS.xl}px 0 0`,
            boxShadow: t.cardShadowHover,
            padding: `${SPACING.xl}px ${px}px ${SPACING.xxl}px`,
            maxHeight: '50%',
            overflowY: 'auto',
            animation: `slideUp ${DURATION.normal} ease-out`,
          }}>
            {/* Close button */}
            <button
              onClick={closeDetail}
              style={{
                position: 'absolute', top: SPACING.sm, right: SPACING.md,
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: FONT_SIZE.lg, color: t.textMuted,
                minWidth: TOUCH_MIN, minHeight: TOUCH_MIN,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              aria-label="Bigire"
            >
              ✕
            </button>

            {/* Kurdish term */}
            <div style={{
              fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold,
              color: sectionColor.text, marginBottom: SPACING.xs,
            }}>
              {toTitleCase(selectedNode.ku)}
            </div>

            {/* Translations */}
            <div style={{
              display: 'flex', gap: SPACING.lg, flexWrap: 'wrap',
              marginBottom: SPACING.md,
            }}>
              <TranslationChip label="TR" value={selectedNode.tr} color={t.textSecondary} bg={t.surfaceHover} />
              <TranslationChip label="EN" value={selectedNode.en} color={t.textSecondary} bg={t.surfaceHover} />
            </div>

            {/* Definition */}
            {selectedNode.df && (
              <div style={{ marginBottom: SPACING.sm }}>
                <div style={{
                  fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold,
                  color: t.textMuted, marginBottom: SPACING.xs,
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>
                  Penase
                </div>
                <div style={{
                  fontSize: FONT_SIZE.base, color: t.text,
                  lineHeight: 1.55,
                }}>
                  {selectedNode.df}
                </div>
              </div>
            )}

            {/* Example */}
            {selectedNode.ex && (
              <div style={{ marginBottom: SPACING.xs }}>
                <div style={{
                  fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold,
                  color: t.textMuted, marginBottom: SPACING.xs,
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>
                  Mînak
                </div>
                <div style={{
                  fontSize: FONT_SIZE.base, color: t.text,
                  fontStyle: 'italic', lineHeight: 1.55,
                  padding: `${SPACING.sm}px ${SPACING.md}px`,
                  background: sectionColor.bg,
                  borderRadius: RADIUS.md,
                  borderLeft: `3px solid ${sectionColor.accent}`,
                }}>
                  {selectedNode.ex}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Inline keyframes ── */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ── Toolbar button ───────────────────────────────────────────────────────────
function ToolbarButton({ label, onClick, theme: t, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: TOUCH_MIN,
        height: TOUCH_MIN,
        borderRadius: RADIUS.md,
        border: `1px solid ${t.border}`,
        background: t.surface,
        color: t.text,
        fontSize: FONT_SIZE.lg,
        fontWeight: FONT_WEIGHT.bold,
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: t.cardShadow,
        transition: `all ${DURATION.fast}`,
        lineHeight: 1,
        padding: 0,
      }}
    >
      {label}
    </button>
  );
}

// ── Translation chip ─────────────────────────────────────────────────────────
function TranslationChip({ label, value, color, bg }) {
  if (!value) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: SPACING.xs,
      padding: `${SPACING.xs}px ${SPACING.sm + 2}px`,
      borderRadius: RADIUS.full,
      background: bg,
      fontSize: FONT_SIZE.sm,
      color,
    }}>
      <span style={{ fontWeight: FONT_WEIGHT.bold, fontSize: FONT_SIZE.xs, opacity: 0.7 }}>
        {label}
      </span>
      {value}
    </span>
  );
}
