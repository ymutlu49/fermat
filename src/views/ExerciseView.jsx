// ─── FerMat — Hîndarî (Concept-based Exercise) ──────────────────
import { useState, useCallback, useEffect, useMemo } from 'react';
import { ALL_CONCEPTS, SECTIONS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, DURATION, ICON_SIZE, TOUCH_MIN } from '@data';
import { shuffle, getSectionColor } from '@utils/helpers.js';
import { useMediaQuery } from '@hooks';
import { IconCheck, IconX, IconRefresh, IconArrowRight, IconLightbulb } from '@components/icons';
import { ProgressBar, SectionTag, ScoreCircle } from '@components/ui';

// ─── Soru tipleri ─────────────────────────────────────────────────────────────
const Q_TYPES = [
  {
    id: 'def_term',
    label: 'Penase → Têgeh',
    desc: 'Penaseyê bixwîne, têgeha rast hilbijêre',
    emoji: '📖',
  },
  {
    id: 'term_def',
    label: 'Têgeh → Penase',
    desc: 'Têgehê bibîne, penaseyê rast hilbijêre',
    emoji: '🔍',
  },
  {
    id: 'ku_tr',
    label: 'Kurdî → Tirkî',
    desc: 'Têgeha Kurdî bi Tirkî bide',
    emoji: '🔄',
  },
  {
    id: 'tr_ku',
    label: 'Tirkî → Kurdî',
    desc: 'Têgeha Tirkî bi Kurdî bide',
    emoji: '🔁',
  },
  {
    id: 'ex_term',
    label: 'Mînak → Têgeh',
    desc: 'Mînak bixwîne, têgeha rast hilbijêre',
    emoji: '💬',
  },
];

const EXERCISE_COUNT = 10;

// ─── Pirsê ava bike ───────────────────────────────────────────────────────────
function buildQuestion(concept, allConcepts, qType, sectionPool) {
  // Xeletiyên pêşniyarkirî: pêşî ji heman beşê, paşê ji hemûyan
  const distractorPool = sectionPool.filter(c => c.ku !== concept.ku);
  const fallback = allConcepts.filter(c => c.ku !== concept.ku);
  const source = distractorPool.length >= 3 ? distractorPool : fallback;
  const distractors = shuffle(source).slice(0, 3);

  switch (qType) {
    case 'def_term': {
      const correct = concept.ku;
      const opts = shuffle([correct, ...distractors.map(d => d.ku)]);
      return {
        type: qType,
        concept,
        q: concept.df,
        hint: 'Vê penaseyê xwedî kîjan têgeh e?',
        opts,
        ans: opts.indexOf(correct),
        explain: `${concept.ku} — ${concept.tr}`,
      };
    }
    case 'term_def': {
      const correct = concept.df;
      const opts = shuffle([correct, ...distractors.map(d => d.df)]);
      return {
        type: qType,
        concept,
        q: concept.ku,
        hint: 'Penaseyê rast hilbijêre:',
        opts,
        ans: opts.indexOf(correct),
        explain: concept.df,
      };
    }
    case 'ku_tr': {
      const correct = concept.tr;
      const opts = shuffle([correct, ...distractors.map(d => d.tr)]);
      return {
        type: qType,
        concept,
        q: concept.ku,
        hint: 'Bi Tirkî çawa tê gotin?',
        opts,
        ans: opts.indexOf(correct),
        explain: `${concept.ku} = ${concept.tr} (${concept.en})`,
      };
    }
    case 'tr_ku': {
      const correct = concept.ku;
      const opts = shuffle([correct, ...distractors.map(d => d.ku)]);
      return {
        type: qType,
        concept,
        q: concept.tr,
        hint: 'Bi Kurdî çawa tê gotin?',
        opts,
        ans: opts.indexOf(correct),
        explain: `${concept.tr} = ${concept.ku}`,
      };
    }
    case 'ex_term': {
      if (!concept.ex || concept.ex.trim().length < 5) return null;
      const correct = concept.ku;
      const opts = shuffle([correct, ...distractors.map(d => d.ku)]);
      return {
        type: qType,
        concept,
        q: concept.ex,
        hint: 'Ev mînak ji bo kîjan têgehê ye?',
        opts,
        ans: opts.indexOf(correct),
        explain: `${concept.ku} — ${concept.df}`,
      };
    }
    default:
      return null;
  }
}

// ─── Rêza pirsan ava bike ─────────────────────────────────────────────────────
function generateQuestions(concepts, allConcepts, activeTypes, count) {
  if (concepts.length === 0 || activeTypes.length === 0) return [];

  const picked = shuffle(concepts).slice(0, Math.min(count * 2, concepts.length));
  const questions = [];

  for (const concept of picked) {
    if (questions.length >= count) break;
    const sectionPool = concepts; // same filtered section
    const typeId = activeTypes[Math.floor(Math.random() * activeTypes.length)];
    const q = buildQuestion(concept, allConcepts, typeId, sectionPool);
    if (q) questions.push(q);
  }

  // Eger têr nebe, ji hemûyan zêde bike
  if (questions.length < count) {
    const extra = shuffle(allConcepts).slice(0, count * 2);
    for (const concept of extra) {
      if (questions.length >= count) break;
      const already = questions.some(q => q.concept.ku === concept.ku);
      if (already) continue;
      const typeId = activeTypes[Math.floor(Math.random() * activeTypes.length)];
      const q = buildQuestion(concept, allConcepts, typeId, allConcepts);
      if (q) questions.push(q);
    }
  }

  return questions.slice(0, count);
}

// ─── Ana komponent ────────────────────────────────────────────────────────────
export default function ExerciseView({ theme, isDark, sounds }) {
  const t = theme;
  const { isMobile, isTablet, isDesktop } = useMediaQuery();
  const px = isMobile ? SPACING.md : isTablet ? SPACING.lg : SPACING.xl;

  const [phase, setPhase]             = useState('start');
  const [sectionFilter, setSectionFilter] = useState(null); // null = hemû
  const [activeTypes, setActiveTypes] = useState(Q_TYPES.map(qt => qt.id));
  const [questions, setQuestions]     = useState([]);
  const [current, setCurrent]         = useState(0);
  const [selected, setSelected]       = useState(null);
  const [score, setScore]             = useState(0);
  const [wrongList, setWrongList]     = useState([]);
  const [showExplain, setShowExplain] = useState(false);

  // Beşa hilbijartî ya têgehan
  const filteredConcepts = useMemo(() => {
    if (sectionFilter === null) return ALL_CONCEPTS;
    return ALL_CONCEPTS.filter(c => c.s === sectionFilter);
  }, [sectionFilter]);

  const toggleType = useCallback((typeId) => {
    setActiveTypes(prev => {
      if (prev.includes(typeId)) {
        if (prev.length === 1) return prev; // herî kêm yek bimîne
        return prev.filter(t => t !== typeId);
      }
      return [...prev, typeId];
    });
  }, []);

  const startExercise = useCallback(() => {
    const qs = generateQuestions(filteredConcepts, ALL_CONCEPTS, activeTypes, EXERCISE_COUNT);
    if (qs.length === 0) return;
    setQuestions(qs);
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setWrongList([]);
    setShowExplain(false);
    setPhase('playing');
  }, [filteredConcepts, activeTypes]);

  const handleSelect = useCallback((idx) => {
    if (selected !== null) return;
    setSelected(idx);
    setShowExplain(true);
    const q = questions[current];
    const correct = idx === q.ans;
    if (correct) { sounds?.correct?.(); setScore(s => s + 1); }
    else { sounds?.wrong?.(); setWrongList(w => [...w, q]); }
  }, [selected, questions, current, sounds]);

  const handleNext = useCallback(() => {
    if (current + 1 >= questions.length) {
      setPhase('result');
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setShowExplain(false);
    }
  }, [current, questions.length]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const handler = (e) => {
      if (['1','2','3','4'].includes(e.key)) handleSelect(parseInt(e.key) - 1);
      if (e.key === 'Enter' && selected !== null) handleNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, selected, handleSelect, handleNext]);

  const contentMaxW = isDesktop ? 660 : '100%';

  // ── DESTPÊK ──────────────────────────────────────────────────────────────────
  if (phase === 'start') {
    return (
      <div style={{ flex: 1, overflowY: 'auto', background: 'transparent', padding: `${SPACING.xl}px ${px}px 80px` }}>
        <div style={{ maxWidth: isDesktop ? 640 : 500, margin: '0 auto' }}>

          {/* Serî */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #0E7490, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', marginBottom: SPACING.md, fontSize: '2rem' }}>🎓</div>
            <div style={{ fontSize: isMobile ? '1.2rem' : '1.4rem', fontWeight: FONT_WEIGHT.extrabold, color: t.text, marginBottom: 6 }}>
              Hîndarî
            </div>
            <div style={{ fontSize: FONT_SIZE.base, color: t.textSecondary }}>
              {ALL_CONCEPTS.length} têgeh · Pirsan hilbijêre · Biceribîne
            </div>
          </div>

          {/* Beş */}
          <div style={{ marginBottom: SPACING.xl }}>
            <Label text="Beş" theme={t} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: SPACING.sm }}>
              <Chip
                label="🗂 Hemû"
                isActive={sectionFilter === null}
                color={t.primary}
                onClick={() => setSectionFilter(null)}
                theme={t}
              />
              {Object.entries(SECTIONS).map(([id, sec]) => {
                const sid = parseInt(id);
                const colors = getSectionColor(sid, isDark);
                return (
                  <Chip
                    key={id}
                    label={sec.icon + ' ' + sec.short}
                    isActive={sectionFilter === sid}
                    color={colors.accent}
                    onClick={() => setSectionFilter(sid)}
                    theme={t}
                  />
                );
              })}
            </div>
          </div>

          {/* Soru tipleri */}
          <div style={{ marginBottom: SPACING.xl }}>
            <Label text="Cureyên Pirsan" theme={t} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.sm }}>
              {Q_TYPES.map(qt => {
                const isOn = activeTypes.includes(qt.id);
                return (
                  <button
                    key={qt.id}
                    onClick={() => toggleType(qt.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: SPACING.md,
                      padding: '11px 14px', borderRadius: RADIUS.xl,
                      border: '1.5px solid ' + (isOn ? t.primary : t.border),
                      background: isOn ? t.primary + '12' : t.surface,
                      cursor: 'pointer', fontFamily: 'inherit',
                      transition: `all ${DURATION.fast}`,
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{qt.emoji}</span>
                    <div style={{ textAlign: 'left', flex: 1 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: FONT_WEIGHT.bold, color: isOn ? t.primary : t.text }}>
                        {qt.label}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: t.textMuted, marginTop: 1 }}>
                        {qt.desc}
                      </div>
                    </div>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      background: isOn ? t.primary : 'transparent',
                      border: '2px solid ' + (isOn ? t.primary : t.border),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isOn && <IconCheck size={12} color="#fff" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Agahiya pool */}
          <div style={{
            background: t.surface, borderRadius: 12,
            padding: `${SPACING.md}px ${SPACING.lg}px`, marginBottom: SPACING.xl,
            border: '1px solid ' + t.border,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: '1.3rem' }}>📋</span>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: FONT_WEIGHT.bold, color: t.text }}>
                {filteredConcepts.length} têgeh peyda bûn
              </div>
              <div style={{ fontSize: FONT_SIZE.sm, color: t.textMuted }}>
                {EXERCISE_COUNT} pirs dê bên çêkirin · {activeTypes.length} tîpa pirs çalak e
              </div>
            </div>
          </div>

          {/* Bişkoja destpêkê */}
          <button
            onClick={startExercise}
            disabled={filteredConcepts.length < 4 || activeTypes.length === 0}
            style={{
              width: '100%', padding: isMobile ? '15px' : '17px',
              borderRadius: RADIUS.xl, border: 'none',
              background: filteredConcepts.length < 4 ? t.border : 'linear-gradient(135deg, #0E7490, #06B6D4)',
              color: filteredConcepts.length < 4 ? t.textMuted : '#fff',
              fontSize: isMobile ? FONT_SIZE.md : '1.05rem', fontWeight: FONT_WEIGHT.bold,
              cursor: filteredConcepts.length < 4 ? 'not-allowed' : 'pointer',
              transition: `all ${DURATION.fast}`, minHeight: 52, fontFamily: 'inherit',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            Dest pê bike →
          </button>
        </div>
      </div>
    );
  }

  // ── ENCAM ─────────────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const pct = Math.round((score / questions.length) * 100);
    const msg = pct >= 80 ? '🏆 Pîroz be! Tu serkeftî!' : pct >= 60 ? '🌿 Baş e, berdewam bike!' : '🌱 Bixebite, tu dikarî!';
    return (
      <div style={{ flex: 1, overflowY: 'auto', background: 'transparent', padding: `${SPACING.xl}px ${px}px 80px` }}>
        <div style={{ maxWidth: isDesktop ? 560 : 480, margin: '0 auto', textAlign: 'center' }}>

          <div style={{ marginBottom: SPACING.xl }}>
            <ScoreCircle score={score} total={questions.length} theme={theme} size={isMobile ? 100 : 120} />
          </div>
          <div style={{ fontSize: isMobile ? '1.3rem' : '1.5rem', fontWeight: FONT_WEIGHT.extrabold, color: t.text, marginBottom: 6 }}>
            {msg}
          </div>
          <div style={{ fontSize: FONT_SIZE.md, color: t.textSecondary, marginBottom: 28 }}>
            {score} / {questions.length} rast · %{pct}
          </div>

          {/* Xelet bersiv */}
          {wrongList.length > 0 && (
            <div style={{
              background: t.surface, borderRadius: RADIUS.lg,
              padding: isMobile ? '14px' : '18px',
              marginBottom: SPACING.xl, border: '1px solid ' + t.border, textAlign: 'left',
            }}>
              <div style={{
                fontSize: '0.72rem', fontWeight: FONT_WEIGHT.extrabold, color: t.error,
                textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14,
              }}>
                ✗ Bersivên xelet ({wrongList.length})
              </div>
              {wrongList.map((q, i) => {
                const secColors = getSectionColor(q.concept.s, isDark);
                return (
                  <div key={i} style={{
                    padding: '11px 0',
                    borderBottom: i < wrongList.length - 1 ? '1px solid ' + t.border : 'none',
                  }}>
                    {/* Tip etiketi */}
                    <div style={{
                      fontSize: '0.68rem', fontWeight: FONT_WEIGHT.bold,
                      color: secColors.accent, marginBottom: RADIUS.sm,
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                    }}>
                      {Q_TYPES.find(qt => qt.id === q.type)?.label}
                    </div>
                    {/* Pirs */}
                    <div style={{
                      fontSize: '0.82rem', color: t.textSecondary,
                      marginBottom: 5, lineHeight: 1.5,
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {q.q}
                    </div>
                    {/* Bersiva rast */}
                    <div style={{
                      fontSize: '0.85rem', color: t.success, fontWeight: FONT_WEIGHT.bold,
                      display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                      <IconCheck size={14} color={t.success} />
                      {q.opts[q.ans]}
                    </div>
                    {/* Rave */}
                    {q.explain && (
                      <div style={{ fontSize: FONT_SIZE.sm, color: t.textMuted, marginTop: RADIUS.sm, fontStyle: 'italic' }}>
                        💡 {q.explain}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={startExercise}
              style={{
                flex: 1, padding: '14px', borderRadius: RADIUS.xl,
                border: '1.5px solid ' + t.border, background: t.surface,
                color: t.text, fontSize: '0.95rem', fontWeight: FONT_WEIGHT.semibold,
                cursor: 'pointer', fontFamily: 'inherit', minHeight: 52,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <IconRefresh size={16} color={t.text} /> Dîsa
            </button>
            <button
              onClick={() => setPhase('start')}
              style={{
                flex: 1, padding: '14px', borderRadius: RADIUS.xl,
                border: 'none', background: 'linear-gradient(135deg, #0E7490, #06B6D4)',
                color: '#fff', fontSize: '0.95rem', fontWeight: FONT_WEIGHT.bold,
                cursor: 'pointer', fontFamily: 'inherit', minHeight: 52,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              Vegerîn
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── LÎSTIN ────────────────────────────────────────────────────────────────────
  const q = questions[current];
  const secColors = getSectionColor(q.concept.s, isDark);
  const answered = selected !== null;
  const qTypeMeta = Q_TYPES.find(qt => qt.id === q.type);

  // Bersiva dirêj e? (penase û mînak dirêj dibin)
  const isLongOpt = q.type === 'term_def' || q.type === 'ex_term';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'transparent', overflow: 'hidden' }}>

      {/* Pêşkevtin */}
      <div style={{
        padding: `10px ${px}px ${SPACING.sm}px`,
        background: isDark ? 'rgba(26,35,50,0.95)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        borderBottom: '1px solid ' + (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'),
        flexShrink: 0,
      }}>
        <div style={{ maxWidth: contentMaxW, margin: '0 auto' }}>
          <ProgressBar value={current} max={questions.length} color={t.primary} bgColor={t.border} height={6} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.78rem', alignItems: 'center' }}>
            <span style={{ color: t.textMuted }}>{current + 1} / {questions.length}</span>
            <span>
              <span style={{ color: t.success, fontWeight: FONT_WEIGHT.bold }}>✓ {score}</span>
              <span style={{ color: t.textMuted }}> · </span>
              <span style={{ color: t.error, fontWeight: FONT_WEIGHT.bold }}>✗ {current - score}</span>
            </span>
            <SectionTag sectionId={q.concept.s} isDark={isDark} size="sm" />
          </div>
        </div>
      </div>

      {/* Pirs û vebijêrk */}
      <div style={{ flex: 1, overflowY: 'auto', padding: `${isMobile ? 14 : SPACING.xl}px ${px}px ${SPACING.xl}px` }}>
        <div style={{ maxWidth: contentMaxW, margin: '0 auto' }}>

          {/* Tip + pirs */}
          <div style={{
            background: secColors.bg,
            border: '1px solid ' + secColors.accent + '30',
            borderRadius: SPACING.lg,
            padding: isMobile ? `${SPACING.lg}px 14px` : `22px ${SPACING.xl}px`,
            marginBottom: 14, textAlign: 'center',
          }}>
            {/* Tip etiketi */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: secColors.accent + '20', color: secColors.accent,
              fontSize: '0.68rem', fontWeight: FONT_WEIGHT.extrabold,
              padding: `${RADIUS.sm}px 10px`, borderRadius: RADIUS.md, marginBottom: SPACING.md,
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              {qTypeMeta?.emoji} {qTypeMeta?.label}
            </div>

            {/* Pirsa sereke */}
            <div style={{
              fontSize: q.type === 'def_term' || q.type === 'ex_term'
                ? (isMobile ? '0.9rem' : '0.95rem')
                : (isMobile ? '1.3rem' : '1.55rem'),
              fontWeight: q.type === 'def_term' || q.type === 'ex_term' ? FONT_WEIGHT.medium : FONT_WEIGHT.extrabold,
              color: secColors.text,
              lineHeight: 1.55,
              fontStyle: q.type === 'ex_term' ? 'italic' : 'normal',
            }}>
              {q.q}
            </div>

            {/* Alîkariya pirsê */}
            <div style={{
              fontSize: '0.72rem', color: secColors.text,
              opacity: 0.6, marginTop: 10, fontWeight: FONT_WEIGHT.semibold,
            }}>
              {q.hint}
            </div>
          </div>

          {/* Vebijêrk */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 14 }}>
            {q.opts.map((opt, idx) => {
              const isCorrect = idx === q.ans;
              const isChosen  = idx === selected;
              let bg = t.surface, border = t.border, color = t.text;
              let iconEl = null;

              if (answered) {
                if (isCorrect) {
                  bg = t.successLight; border = t.success; color = t.success;
                  iconEl = <IconCheck size={16} color={t.success} />;
                } else if (isChosen) {
                  bg = t.errorLight; border = t.error; color = t.error;
                  iconEl = <IconX size={16} color={t.error} />;
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={answered}
                  style={{
                    padding: isLongOpt
                      ? (isMobile ? `${SPACING.md}px 13px` : '13px 15px')
                      : (isMobile ? '13px 14px' : `14px ${SPACING.lg}px`),
                    minHeight: isMobile ? 48 : 52,
                    borderRadius: 12,
                    border: '2px solid ' + border,
                    background: bg, color,
                    fontFamily: 'inherit',
                    fontSize: isLongOpt
                      ? (isMobile ? '0.8rem' : '0.85rem')
                      : (isMobile ? '0.9rem' : '0.95rem'),
                    fontWeight: FONT_WEIGHT.semibold,
                    cursor: answered ? 'default' : 'pointer',
                    textAlign: 'left',
                    display: 'flex', alignItems: isLongOpt ? 'flex-start' : 'center', gap: SPACING.md,
                    transition: 'all 0.18s',
                    WebkitTapHighlightColor: 'transparent',
                    lineHeight: isLongOpt ? 1.5 : 1.2,
                    animation: answered && isCorrect ? 'pulse 0.4s ease-out' : 'none',
                  }}
                  onMouseEnter={e => { if (!answered) e.currentTarget.style.background = t.surfaceHover || t.border + '40'; }}
                  onMouseLeave={e => { if (!answered) e.currentTarget.style.background = t.surface; }}
                >
                  <span style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: answered
                      ? (isCorrect ? t.success + '22' : isChosen ? t.error + '22' : t.border + '40')
                      : t.border + '40',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: FONT_WEIGHT.extrabold, flexShrink: 0, color,
                    marginTop: isLongOpt ? 2 : 0,
                  }}>
                    {['A','B','C','D'][idx]}
                  </span>
                  <span style={{ flex: 1 }}>{opt}</span>
                  {iconEl && <span style={{ flexShrink: 0, marginTop: isLongOpt ? 2 : 0 }}>{iconEl}</span>}
                </button>
              );
            })}
          </div>

          {/* Rave / Feedback */}
          {answered && showExplain && (
            <div style={{
              borderRadius: 12, overflow: 'hidden',
              border: '1px solid ' + (selected === q.ans ? t.success : t.error) + '40',
              animation: `fadeInUp ${DURATION.normal} ease-out`,
            }}>
              <div style={{
                padding: '11px 14px',
                background: selected === q.ans ? t.successLight : t.errorLight,
                color: selected === q.ans ? t.success : t.error,
                fontWeight: FONT_WEIGHT.bold, fontSize: FONT_SIZE.base,
                display: 'flex', alignItems: 'center', gap: SPACING.sm,
              }}>
                {selected === q.ans
                  ? <><IconCheck size={16} color={t.success} /> Rast! Aferîn! 🎉</>
                  : <><IconX size={16} color={t.error} /> Xelet. Bersiva rast: <strong>{q.opts[q.ans]}</strong></>
                }
              </div>
              {q.explain && (
                <div style={{
                  padding: '10px 14px', background: t.surface,
                  fontSize: '0.8rem', color: t.textSecondary,
                  lineHeight: 1.6, display: 'flex', gap: SPACING.sm,
                }}>
                  <span style={{ flexShrink: 0 }}>💡</span>
                  <span>{q.explain}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bişkoja "Pêş" — jêrê */}
      {answered && (
        <div style={{
          padding: `10px ${px}px`,
          background: t.surface, borderTop: '1px solid ' + t.border,
          flexShrink: 0, animation: `fadeInUp ${DURATION.normal} ease-out`,
        }}>
          <div style={{ maxWidth: contentMaxW, margin: '0 auto' }}>
            <button
              onClick={handleNext}
              style={{
                width: '100%', padding: isMobile ? '14px' : `${SPACING.lg}px`,
                minHeight: 52, borderRadius: RADIUS.xl, border: 'none',
                background: 'linear-gradient(135deg, #0E7490, #06B6D4)', color: '#fff',
                fontSize: isMobile ? '0.95rem' : FONT_SIZE.md,
                fontWeight: FONT_WEIGHT.bold, cursor: 'pointer',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: SPACING.sm,
                transition: `all ${DURATION.fast}`, fontFamily: 'inherit',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {current + 1 >= questions.length
                ? '📊 Encaman Bibîne'
                : <>Pêş <IconArrowRight size={16} color="#fff" /></>
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Alîkar komponentên piçûk ─────────────────────────────────────────────────
function Label({ text, theme: t }) {
  return (
    <div style={{
      fontSize: '0.72rem', fontWeight: FONT_WEIGHT.extrabold, color: t.textMuted,
      textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10,
    }}>
      {text}
    </div>
  );
}

function Chip({ label, isActive, color, onClick, theme: t }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '7px 13px', minHeight: 38, borderRadius: RADIUS.full,
        border: '1.5px solid ' + (isActive ? color : t.border),
        background: isActive ? color + '18' : 'transparent',
        color: isActive ? color : t.textSecondary,
        fontSize: '0.8rem', fontWeight: FONT_WEIGHT.bold,
        cursor: 'pointer', fontFamily: 'inherit',
        transition: `all ${DURATION.fast}`, whiteSpace: 'nowrap',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none', display: 'flex', alignItems: 'center',
      }}
    >
      {label}
    </button>
  );
}
