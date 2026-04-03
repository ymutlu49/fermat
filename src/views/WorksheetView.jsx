// ─── FerMat — Rûpelên Xebatê (Worksheet Generator) ─────────────
import { useState, useMemo } from 'react';
import { ALL_CONCEPTS, SECTIONS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, DURATION, TOUCH_MIN } from '@data';
import { getSectionColor } from '@utils/helpers.js';
import { useMediaQuery } from '@hooks';
import { Pill } from '@components/ui';
import {
  exportMatchingWorksheet,
  exportFillBlankWorksheet,
  exportFlashcardSheet,
  exportConceptMapWorksheet,
} from '@utils/exportWorksheets.js';

// ── Worksheet type definitions ───────────────────────────────────────────────
const WORKSHEET_TYPES = [
  {
    id: 'matching',
    icon: '✏️',
    title: 'Hevberdana Peyvan',
    desc: 'Têgeh û wateyan bi hev re bike',
    borderColor: '#3B82F6',
  },
  {
    id: 'fillblank',
    icon: '📝',
    title: 'Cihê Vala Dagire',
    desc: 'Penaseyê bixwîne, têgeha rast binivîse',
    borderColor: '#10B981',
  },
  {
    id: 'flashcard',
    icon: '🃏',
    title: 'Kartên Hînbûnê',
    desc: 'Kartan çap bike û fêr bibe',
    borderColor: '#F59E0B',
  },
  {
    id: 'conceptmap',
    icon: '🗺️',
    title: 'Nexşeya Netemam',
    desc: 'Nexşeya têgehan temam bike',
    borderColor: '#8B5CF6',
  },
];

const COUNT_OPTIONS = [5, 10, 15, 20];

// ── Component ────────────────────────────────────────────────────────────────
export default function WorksheetView({ theme, isDark }) {
  const t = theme;
  const { isMobile } = useMediaQuery();

  // State
  const [selectedType, setSelectedType] = useState(null);
  const [sectionFilter, setSectionFilter] = useState(null);
  const [count, setCount] = useState(10);
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);

  // Filtered concepts
  const filteredConcepts = useMemo(() => {
    if (sectionFilter === null) return ALL_CONCEPTS;
    return ALL_CONCEPTS.filter(c => c.s === sectionFilter);
  }, [sectionFilter]);

  // Section entries for the pill bar
  const sectionEntries = useMemo(() => Object.entries(SECTIONS), []);

  // Handle generate
  const handleGenerate = () => {
    if (!selectedType || filteredConcepts.length === 0) return;

    switch (selectedType) {
      case 'matching':
        exportMatchingWorksheet(filteredConcepts, { includeAnswerKey, count });
        break;
      case 'fillblank':
        exportFillBlankWorksheet(filteredConcepts, { includeAnswerKey, count });
        break;
      case 'flashcard':
        exportFlashcardSheet(filteredConcepts, { count });
        break;
      case 'conceptmap': {
        const sectionName = sectionFilter !== null
          ? (SECTIONS[sectionFilter]?.name || 'Matematik')
          : 'Matematîk';
        exportConceptMapWorksheet(filteredConcepts, sectionName, {
          includeAnswerKey,
          blankPercent: 0.4,
        });
        break;
      }
    }
  };

  // ── Styles ─────────────────────────────────────────────────────────────────
  const styles = {
    container: {
      padding: `${SPACING.xl}px ${SPACING.lg}px`,
      maxWidth: 720,
      margin: '0 auto',
    },
    title: {
      fontSize: FONT_SIZE.xl,
      fontWeight: FONT_WEIGHT.extrabold,
      color: t.text,
      marginBottom: SPACING.xs,
    },
    subtitle: {
      fontSize: FONT_SIZE.base,
      color: t.textSecondary,
      marginBottom: SPACING.xl,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: SPACING.md,
      marginBottom: SPACING.xl,
    },
    card: (type) => ({
      background: selectedType === type.id ? type.borderColor + '15' : t.surface,
      border: `2px solid ${selectedType === type.id ? type.borderColor : t.border}`,
      borderRadius: RADIUS.xl,
      padding: `${SPACING.lg}px`,
      cursor: 'pointer',
      transition: `all ${DURATION.normal} ease`,
      boxShadow: selectedType === type.id ? `0 0 0 3px ${type.borderColor}22` : t.cardShadow,
    }),
    cardIcon: {
      fontSize: '28px',
      marginBottom: SPACING.sm,
      display: 'block',
    },
    cardTitle: {
      fontSize: FONT_SIZE.md,
      fontWeight: FONT_WEIGHT.bold,
      color: t.text,
      marginBottom: SPACING.xs,
    },
    cardDesc: {
      fontSize: FONT_SIZE.sm,
      color: t.textSecondary,
      lineHeight: 1.4,
    },
    configPanel: {
      background: t.surface,
      border: `1px solid ${t.border}`,
      borderRadius: RADIUS.lg,
      padding: `${SPACING.xl}px ${SPACING.lg}px`,
      boxShadow: t.cardShadow,
    },
    configLabel: {
      fontSize: FONT_SIZE.sm,
      fontWeight: FONT_WEIGHT.semibold,
      color: t.textSecondary,
      marginBottom: SPACING.sm,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    pillBar: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: SPACING.sm,
      marginBottom: SPACING.lg,
    },
    countBar: {
      display: 'flex',
      gap: SPACING.sm,
      marginBottom: SPACING.lg,
    },
    countBtn: (isActive) => ({
      padding: `${SPACING.sm}px ${SPACING.lg}px`,
      minHeight: TOUCH_MIN,
      borderRadius: RADIUS.full,
      border: `1.5px solid ${isActive ? t.primary : t.border}`,
      background: isActive ? t.primary : 'transparent',
      color: isActive ? t.textOnPrimary : t.text,
      fontSize: FONT_SIZE.base,
      fontWeight: FONT_WEIGHT.semibold,
      fontFamily: 'inherit',
      cursor: 'pointer',
      transition: `all ${DURATION.normal}`,
    }),
    toggleRow: {
      display: 'flex',
      alignItems: 'center',
      gap: SPACING.md,
      marginBottom: SPACING.lg,
    },
    toggleTrack: (isOn) => ({
      width: 44,
      height: 24,
      borderRadius: RADIUS.full,
      background: isOn ? t.primary : (isDark ? '#3A4A5E' : '#CBD5E1'),
      position: 'relative',
      cursor: 'pointer',
      transition: `background ${DURATION.normal}`,
      flexShrink: 0,
    }),
    toggleThumb: (isOn) => ({
      width: 18,
      height: 18,
      borderRadius: '50%',
      background: '#FFFFFF',
      position: 'absolute',
      top: 3,
      left: isOn ? 23 : 3,
      transition: `left ${DURATION.normal}`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    }),
    toggleLabel: {
      fontSize: FONT_SIZE.base,
      fontWeight: FONT_WEIGHT.medium,
      color: t.text,
    },
    generateBtn: {
      width: '100%',
      padding: `${SPACING.md}px ${SPACING.xl}px`,
      minHeight: TOUCH_MIN + 4,
      borderRadius: RADIUS.xl,
      border: 'none',
      background: selectedType ? 'linear-gradient(135deg, #0F766E, #0D9488)' : t.textMuted,
      color: t.textOnAccent,
      fontSize: FONT_SIZE.md,
      fontWeight: FONT_WEIGHT.bold,
      fontFamily: 'inherit',
      cursor: filteredConcepts.length === 0 ? 'not-allowed' : 'pointer',
      opacity: filteredConcepts.length === 0 ? 0.5 : 1,
      transition: `all ${DURATION.normal}`,
      letterSpacing: '0.02em',
    },
    conceptCount: {
      textAlign: 'center',
      fontSize: FONT_SIZE.sm,
      color: t.textMuted,
      marginTop: SPACING.sm,
    },
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
    <div style={styles.container}>
      {/* Title */}
      <div style={styles.title}>Rûpelên Xebatê</div>
      <div style={styles.subtitle}>Ji bo mamoste û dêûbavan</div>

      {/* Type cards */}
      <div style={styles.grid}>
        {WORKSHEET_TYPES.map(type => (
          <div
            key={type.id}
            style={styles.card(type)}
            onClick={() => setSelectedType(
              selectedType === type.id ? null : type.id
            )}
            role="button"
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedType(selectedType === type.id ? null : type.id);
              }
            }}
          >
            <span style={styles.cardIcon}>{type.icon}</span>
            <div style={styles.cardTitle}>{type.title}</div>
            <div style={styles.cardDesc}>{type.desc}</div>
          </div>
        ))}
      </div>

      {/* Configuration panel — shown when a type is selected */}
      {selectedType && (
        <div style={styles.configPanel}>
          {/* Section filter */}
          <div style={styles.configLabel}>Beş</div>
          <div style={styles.pillBar}>
            <Pill
              label="Hemû"
              isActive={sectionFilter === null}
              color={t.primary}
              onClick={() => setSectionFilter(null)}
            />
            {sectionEntries.map(([id, sec]) => {
              const secColor = getSectionColor(Number(id), isDark);
              return (
                <Pill
                  key={id}
                  isActive={sectionFilter === Number(id)}
                  color={secColor.accent}
                  onClick={() => setSectionFilter(
                    sectionFilter === Number(id) ? null : Number(id)
                  )}
                >
                  {sec.icon} {sec.short}
                </Pill>
              );
            })}
          </div>

          {/* Count selector */}
          {selectedType !== 'conceptmap' && (
            <>
              <div style={styles.configLabel}>Hejmar</div>
              <div style={styles.countBar}>
                {COUNT_OPTIONS.map(n => (
                  <button
                    key={n}
                    style={styles.countBtn(count === n)}
                    onClick={() => setCount(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Answer key toggle — not for flashcards */}
          {selectedType !== 'flashcard' && (
            <div style={styles.toggleRow}>
              <div
                style={styles.toggleTrack(includeAnswerKey)}
                onClick={() => setIncludeAnswerKey(!includeAnswerKey)}
                role="switch"
                aria-checked={includeAnswerKey}
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIncludeAnswerKey(!includeAnswerKey);
                  }
                }}
              >
                <div style={styles.toggleThumb(includeAnswerKey)} />
              </div>
              <span style={styles.toggleLabel}>Bersivnameyê jî lê zêde bike</span>
            </div>
          )}

          {/* Generate button */}
          <button
            style={styles.generateBtn}
            onClick={handleGenerate}
            disabled={filteredConcepts.length === 0}
          >
            Çêbike
          </button>
          <div style={styles.conceptCount}>
            {filteredConcepts.length} têgeh amade ne
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
