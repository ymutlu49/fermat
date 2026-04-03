// ─── FerMat — Graph Layout Engine ──────────────────────────────
import { ALL_CONCEPTS, SECTIONS } from '@data';
import { RELATED_CONCEPTS } from '@data/conceptMeta.js';

/**
 * Build a graph for a specific section from RELATED_CONCEPTS data.
 * Returns only nodes that have connections (appear in RELATED_CONCEPTS).
 */
export function buildSectionGraph(sectionId) {
  const sectionConcepts = ALL_CONCEPTS.filter(c => c.s === sectionId);
  const sectionKeys = new Set(sectionConcepts.map(c => c.ku));

  // Collect all edges where at least one end is in this section
  const edges = [];
  const connectedKeys = new Set();
  const seenEdges = new Set();

  for (const [sourceKey, targets] of Object.entries(RELATED_CONCEPTS)) {
    if (!sectionKeys.has(sourceKey)) continue;
    for (const targetKey of targets) {
      if (sectionKeys.has(targetKey)) {
        // Avoid duplicate edges (A→B and B→A) using Set for O(1) lookup
        const edgeId = sourceKey < targetKey
          ? sourceKey + '|' + targetKey
          : targetKey + '|' + sourceKey;
        if (!seenEdges.has(edgeId)) {
          seenEdges.add(edgeId);
          edges.push({ from: sourceKey, to: targetKey });
        }
        connectedKeys.add(sourceKey);
        connectedKeys.add(targetKey);
      }
    }
  }

  // Build nodes from connected concepts only
  const nodes = sectionConcepts
    .filter(c => connectedKeys.has(c.ku))
    .map(c => ({ id: c.ku, ku: c.ku, tr: c.tr, en: c.en, lv: c.lv, s: c.s }));

  // Find root: concept matching section short name, or most connected
  const section = SECTIONS[sectionId];
  const rootKey = section
    ? (nodes.find(n => n.ku === section.short)?.ku || findMostConnected(nodes, edges))
    : findMostConnected(nodes, edges);

  return { nodes, edges, rootKey };
}

function findMostConnected(nodes, edges) {
  const counts = {};
  nodes.forEach(n => { counts[n.id] = 0; });
  edges.forEach(e => {
    if (counts[e.from] !== undefined) counts[e.from]++;
    if (counts[e.to] !== undefined) counts[e.to]++;
  });
  let maxKey = nodes[0]?.id;
  let maxCount = 0;
  for (const [key, count] of Object.entries(counts)) {
    if (count > maxCount) { maxCount = count; maxKey = key; }
  }
  return maxKey;
}

/**
 * Compute radial layout positions for nodes using BFS from root.
 * @param {Array} nodes - [{id, ...}]
 * @param {Array} edges - [{from, to}]
 * @param {string} rootId
 * @param {number} width - canvas width
 * @param {number} height - canvas height
 * @param {Object} opts - { rBase, rIncrement, nodeWidth, nodeHeight }
 * @returns {Object} positions - { nodeId: { x, y, depth } }
 */
export function computeRadialLayout(nodes, edges, rootId, width, height, opts = {}) {
  const {
    rBase = 160,
    rIncrement = 140,
    nodeWidth = 130,
    nodeHeight = 56,
  } = opts;

  if (!nodes.length) return {};

  // Build adjacency
  const adj = {};
  nodes.forEach(n => { adj[n.id] = []; });
  edges.forEach(e => {
    if (adj[e.from]) adj[e.from].push(e.to);
    if (adj[e.to]) adj[e.to].push(e.from);
  });

  // BFS from root
  const visited = new Set();
  const queue = [{ id: rootId || nodes[0].id, depth: 0 }];
  const levels = {};

  while (queue.length) {
    const { id, depth } = queue.shift();
    if (visited.has(id)) continue;
    visited.add(id);
    if (!levels[depth]) levels[depth] = [];
    levels[depth].push(id);
    for (const neighbor of (adj[id] || [])) {
      if (!visited.has(neighbor)) {
        queue.push({ id: neighbor, depth: depth + 1 });
      }
    }
  }

  // Handle disconnected nodes
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      const maxDepth = Math.max(...Object.keys(levels).map(Number), 0) + 1;
      if (!levels[maxDepth]) levels[maxDepth] = [];
      levels[maxDepth].push(node.id);
    }
  }

  // Position on concentric rings
  const cx = width / 2;
  const cy = height / 2;
  const positions = {};

  for (const [depthStr, nodeIds] of Object.entries(levels)) {
    const depth = parseInt(depthStr);
    if (depth === 0) {
      positions[nodeIds[0]] = { x: cx, y: cy, depth: 0 };
    } else {
      const radius = rBase + (depth - 1) * rIncrement;
      const count = nodeIds.length;
      // Calculate min angular separation to avoid overlap
      const minAngle = count > 1 ? (2 * Math.asin(Math.min(1, (nodeWidth * 0.7) / (2 * radius)))) : 0;
      const totalAngle = Math.max(minAngle * count, 2 * Math.PI);
      const angleStep = totalAngle / count;
      const startAngle = -Math.PI / 2; // start from top

      for (let i = 0; i < count; i++) {
        const angle = startAngle + i * angleStep;
        positions[nodeIds[i]] = {
          x: cx + radius * Math.cos(angle),
          y: cy + radius * Math.sin(angle),
          depth,
        };
      }
    }
  }

  // ── Normalize: fit all nodes within canvas bounds with padding ──────────
  const padding = Math.max(nodeWidth, nodeHeight) + 20;
  const posValues = Object.values(positions);
  if (posValues.length > 1) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    posValues.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const scaleX = (width - 2 * padding) / rangeX;
    const scaleY = (height - 2 * padding) / rangeY;
    const scale = Math.min(scaleX, scaleY, 1); // don't upscale if already fits
    for (const key of Object.keys(positions)) {
      positions[key] = {
        x: padding + (positions[key].x - minX) * scale + (width - 2 * padding - rangeX * scale) / 2,
        y: padding + (positions[key].y - minY) * scale + (height - 2 * padding - rangeY * scale) / 2,
        depth: positions[key].depth,
      };
    }
  } else if (posValues.length === 1) {
    const key = Object.keys(positions)[0];
    positions[key] = { x: width / 2, y: height / 2, depth: 0 };
  }

  return positions;
}

/**
 * Compute SVG bezier path for an edge between two nodes.
 * Returns an SVG path string with a slight curve.
 */
export function computeEdgePath(fromPos, toPos) {
  const dx = toPos.x - fromPos.x;
  const dy = toPos.y - fromPos.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Control point: perpendicular offset for curve
  const midX = (fromPos.x + toPos.x) / 2;
  const midY = (fromPos.y + toPos.y) / 2;
  const offset = Math.min(dist * 0.15, 30);
  const nx = -dy / dist; // perpendicular normal
  const ny = dx / dist;
  const cpX = midX + nx * offset;
  const cpY = midY + ny * offset;

  return `M ${fromPos.x} ${fromPos.y} Q ${cpX} ${cpY} ${toPos.x} ${toPos.y}`;
}

/**
 * Get the list of section IDs that have graph data.
 * Result is cached since concept data is static.
 */
let _cachedSectionsWithGraphs = null;
export function getSectionsWithGraphs() {
  if (_cachedSectionsWithGraphs) return _cachedSectionsWithGraphs;
  const sectionIds = [...new Set(ALL_CONCEPTS.map(c => c.s))].sort((a, b) => a - b);
  _cachedSectionsWithGraphs = sectionIds.filter(sid => {
    const { nodes } = buildSectionGraph(sid);
    return nodes.length >= 2;
  });
  return _cachedSectionsWithGraphs;
}
