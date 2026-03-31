import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  ALL_CONCEPTS, SECTIONS,
  PASSING_SCORE, QUIZ_TOTAL_QUESTIONS, FEEDBACK_DELAY_MS,
  FLIP_DURATION_MS, MATCH_HIDE_DELAY_MS, NEXT_CARD_DELAY_MS,
  LEVENSHTEIN_THRESHOLD, MAX_HINT_LEVEL, LEITNER_KNOWN_BOX,
  SCROLL_TOP_THRESHOLD,
  SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, DURATION, ICON_SIZE, TOUCH_MIN,
} from '@data';
import { shuffle, levenshtein, filterConcepts, getLevelColor, getSectionColor } from '@utils/helpers.js';
import { useMediaQuery, useSwipeGesture, useAdaptiveDifficulty, useSpeech } from '@hooks';
import {
  IconSearch, IconX, IconChevronDown, IconChevronRight,
  IconArrowLeft, IconArrowRight, IconArrowUp,
  IconBook, IconCards, IconQuizIcon, IconPuzzle, IconPencil, IconBarChart, IconHome,
  IconCheck, IconVolume, IconVolumeMute, IconShuffle, IconLightbulb,
  IconRefresh, IconStar, IconTrophy, IconSun, IconMoon,
} from '@components/icons';
import { Pill, Badge, Card, ProgressBar, Modal, ToastContainer, EmptyState, SectionTag, ScoreCircle, SpeakButton } from '@components/ui';
import { ConceptVisual } from '@components/visuals';
export default function QuizGame({ theme, isDark, concepts, progress, setProgress, sounds, awardXP }) {
  const t = theme;
  const { speak, isSpeaking } = useSpeech();
  const { difficulty, recordAnswer, getCandidateConcepts } = useAdaptiveDifficulty();

  const [quizPhase, setQuizPhase] = useState('start'); // start | playing | result
  const [direction, setDirection] = useState('ku-tr');
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [quizState, setQuizState] = useState({ score: 0, total: 0, wrongAnswers: [] });

  const buildQuiz = useCallback(() => {
    const candidates = getCandidateConcepts(concepts, progress);
    const pool = candidates.length >= QUIZ_TOTAL_QUESTIONS ? candidates : concepts;
    const questionConcepts = shuffle(pool).slice(0, QUIZ_TOTAL_QUESTIONS);
    const [from, to] = direction.split('-');
    const built = questionConcepts.map(concept => {
      const distractors = shuffle(concepts.filter(c => c.ku !== concept.ku))
        .slice(0, 3)
        .map(c => c[to] || c.tr);
      const correct = concept[to] || concept.tr;
      const options = shuffle([correct, ...distractors]);
      return { concept, question: concept[from] || concept.ku, correct, options };
    });
    setQuestions(built);
    setCurrentQIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setQuizState({ score: 0, total: 0, wrongAnswers: [] });
    setQuizPhase('playing');
  }, [concepts, progress, direction, getCandidateConcepts]);

  const handleAnswerSelect = useCallback((answer) => {
    if (selectedAnswer !== null) return;
    const currentQuestion = questions[currentQIndex];
    const correct = answer === currentQuestion.correct;
    setSelectedAnswer(answer);
    setIsCorrect(correct);
    recordAnswer(correct);
    if (correct) { sounds?.correct(); awardXP?.('quizCorrect', { correct: true }); } else sounds?.wrong();
    setQuizState(prev => ({
      score: correct ? prev.score + 1 : prev.score,
      total: prev.total + 1,
      wrongAnswers: correct ? prev.wrongAnswers : [...prev.wrongAnswers, currentQuestion],
    }));
    setTimeout(() => {
      setSelectedAnswer(null);
      setIsCorrect(null);
      if (currentQIndex + 1 >= questions.length) {
        const finalScore = correct ? quizState.score + 1 : quizState.score;
        awardXP?.('quizPerfect', { quizComplete: true, perfectQuiz: finalScore === questions.length });
        setQuizPhase('result');
        // Save session
        setProgress(prev => ({
          ...(prev || {}),
          totalQuestions: ((prev || {}).totalQuestions || 0) + questions.length,
          correctAnswers: ((prev || {}).correctAnswers || 0) + (correct ? quizState.score + 1 : quizState.score),
          sessions: [...(((prev || {}).sessions) || []), {
            date: new Date().toISOString(),
            correct: correct ? quizState.score + 1 : quizState.score,
            total: questions.length,
          }].slice(-50),
        }));
      } else {
        setCurrentQIndex(prev => prev + 1);
      }
    }, FEEDBACK_DELAY_MS);
  }, [selectedAnswer, questions, currentQIndex, recordAnswer, sounds, quizState.score, setProgress]);

  useEffect(() => {
    if (quizPhase !== 'playing') return;
    const handleKey = (e) => {
      if (['1','2','3','4'].includes(e.key)) {
        const idx = parseInt(e.key) - 1;
        const q = questions[currentQIndex];
        if (q && q.options[idx]) handleAnswerSelect(q.options[idx]);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [quizPhase, questions, currentQIndex, handleAnswerSelect]);

  const difficultyLabels = { 1: 'Asan', 2: 'Navîncî', 3: 'Dijwar' };

  if (quizPhase === 'start') {
    const sessions = (progress || {}).sessions || [];
    const lastSession = sessions[sessions.length - 1];
    return (
      <div style={{ flex: 1, overflow: 'auto', background: 'transparent', padding: `${SPACING.xl}px ${SPACING.lg}px` }}>
        <div style={{ maxWidth: 400, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: SPACING.xl }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #166534, #15803D)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', marginBottom: SPACING.md }}><span style={{ fontSize: '1.8rem', filter: 'brightness(0) invert(1)' }}>❓</span></div>
            <div style={{ fontSize: '1.4rem', fontWeight: FONT_WEIGHT.extrabold, color: t.text, marginBottom: SPACING.sm }}>Azmûn</div>
            <div style={{ fontSize: '0.9rem', color: t.textSecondary }}>Zanîna xwe biceribîne · {QUIZ_TOTAL_QUESTIONS} pirs</div>
          </div>

          {lastSession && (
            <div style={{ background: t.surface, borderRadius: '12px', padding: '14px', marginBottom: 20, border: '1px solid ' + t.border, textAlign: 'center' }}>
              <div style={{ fontSize: FONT_SIZE.sm, color: t.textMuted, marginBottom: 6 }}>Encama dawî</div>
              <ScoreCircle score={lastSession.correct} total={lastSession.total} theme={theme} />
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: FONT_WEIGHT.bold, color: t.textMuted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Alî</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.sm }}>
              {[
                { value: 'ku-tr', label: 'Kurdî → Tirkî' },
                { value: 'tr-ku', label: 'Tirkî → Kurdî' },
                { value: 'ku-en', label: 'Kurdî → English' },
                { value: 'en-ku', label: 'English → Kurdî' },
              ].map(opt => (
                <button key={opt.value} onClick={() => setDirection(opt.value)} style={{
                  padding: `${SPACING.md}px ${SPACING.lg}px`, borderRadius: '12px', border: '2px solid ' + (direction === opt.value ? t.primary : t.border),
                  background: direction === opt.value ? t.primarySoft : t.surface,
                  color: direction === opt.value ? t.primary : t.text,
                  fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: FONT_WEIGHT.semibold, cursor: 'pointer',
                  textAlign: 'left', transition: `all ${DURATION.fast}`,
                }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: t.surface, borderRadius: '12px', padding: `${SPACING.md}px ${SPACING.lg}px`, marginBottom: 20, border: '1px solid ' + t.border }}>
            <div style={{ fontSize: '0.8rem', color: t.textMuted }}>
              Asta niha: <strong style={{ color: t.primary }}>{difficultyLabels[difficulty]}</strong> · Asta bi xweberî tê guhertin
            </div>
          </div>

          <button onClick={buildQuiz} style={{
            width: '100%', padding: `${SPACING.lg}px`, borderRadius: `${RADIUS.xl}px`, border: 'none',
            background: 'linear-gradient(135deg, #166534, #15803D)', color: t.textOnPrimary,
            fontSize: '1.1rem', fontWeight: FONT_WEIGHT.bold, cursor: 'pointer', transition: `all ${DURATION.fast}`,
            minHeight: TOUCH_MIN,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #15803D, #166534)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #166534, #15803D)'; }}
          >
            Dest pê bike
          </button>
        </div>
      </div>
    );
  }

  if (quizPhase === 'result') {
    const pct = Math.round((quizState.score / QUIZ_TOTAL_QUESTIONS) * 100);
    const message = pct >= 80 ? '🏆 Tu serkeftî!' : pct >= 50 ? '🌿 Baş e, tu pêş dikevî!' : '🌱 Bixebite, tu dikarî!';
    return (
      <div style={{ flex: 1, overflow: 'auto', background: 'transparent', padding: `${SPACING.xl}px ${SPACING.lg}px` }}>
        <div style={{ maxWidth: 400, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ marginBottom: SPACING.xl }}>
            <ScoreCircle score={quizState.score} total={QUIZ_TOTAL_QUESTIONS} theme={theme} />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: FONT_WEIGHT.extrabold, color: t.text, marginBottom: SPACING.sm }}>{message}</div>
          <div style={{ fontSize: FONT_SIZE.md, color: t.textSecondary, marginBottom: SPACING.xl }}>
            {quizState.score} / {QUIZ_TOTAL_QUESTIONS} rast
          </div>

          {quizState.wrongAnswers.length > 0 && (
            <div style={{ background: t.surface, borderRadius: '12px', padding: `${SPACING.lg}px`, marginBottom: 20, border: '1px solid ' + t.border, textAlign: 'left' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: FONT_WEIGHT.bold, color: t.error, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Bersivên xelet
              </div>
              {quizState.wrongAnswers.slice(0, 5).map((q, i) => (
                <div key={i} style={{ fontSize: FONT_SIZE.base, padding: '6px 0', borderBottom: i < quizState.wrongAnswers.length - 1 ? '1px solid ' + t.border : 'none', color: t.text, display: 'flex', alignItems: 'center', gap: SPACING.xs }}>
                  <strong>{q.question}</strong>
                  <SpeakButton text={q.concept.ku} speak={speak} isSpeaking={isSpeaking} theme={t} size={20} />
                  <span>→ {q.correct}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => buildQuiz()} style={{
              flex: 1, padding: '14px', borderRadius: `${RADIUS.xl}px`, border: '1.5px solid ' + t.border,
              background: t.surface, color: t.text, fontSize: '0.95rem', fontWeight: FONT_WEIGHT.semibold, cursor: 'pointer',
              minHeight: TOUCH_MIN,
            }}>
              Dîsa biceribîne
            </button>
            <button onClick={() => setQuizPhase('start')} style={{
              flex: 1, padding: '14px', borderRadius: `${RADIUS.xl}px`, border: 'none',
              background: 'linear-gradient(135deg, #166534, #15803D)', color: t.textOnPrimary, fontSize: '0.95rem', fontWeight: FONT_WEIGHT.semibold, cursor: 'pointer',
              minHeight: TOUCH_MIN,
            }}>
              Malper
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Playing phase
  const currentQuestion = questions[currentQIndex];
  const sectionColors = getSectionColor(currentQuestion.concept.s, isDark);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'transparent' }}>
      {/* Quiz header */}
      <div style={{ padding: `${SPACING.md}px ${SPACING.lg}px`, background: isDark ? 'rgba(26,35,50,0.95)' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', borderBottom: '1px solid ' + (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)') }}>
        <div style={{ marginBottom: SPACING.sm }}>
          <ProgressBar value={currentQIndex} max={questions.length} color={t.primary} bgColor={t.border} height={6} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: t.textMuted }}>{currentQIndex + 1} / {questions.length}</span>
          <span style={{ fontSize: '0.8rem', fontWeight: FONT_WEIGHT.bold }}>
            <span style={{ color: t.success }}>✓ {quizState.score}</span>
            <span style={{ color: t.textMuted }}> · </span>
            <span style={{ color: t.error }}>✗ {quizState.total - quizState.score}</span>
          </span>
          <Badge label={difficultyLabels[difficulty]} color={t.primary} bgColor={t.primarySoft} />
        </div>
      </div>

      {/* Question */}
      <div style={{ flex: 1, overflowY: 'auto', padding: `20px ${SPACING.lg}px` }}>
        <div style={{
          background: sectionColors.bg, borderRadius: RADIUS.xl + 'px', padding: `${SPACING.xl}px`,
          textAlign: 'center', marginBottom: 20,
          border: '1px solid ' + sectionColors.accent + '30',
        }}>
          <div style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, color: sectionColors.text, marginBottom: SPACING.md, textTransform: 'uppercase', letterSpacing: '0.04em', opacity: 0.7 }}>
            Bersiva vê têgehê çi ye?
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: FONT_WEIGHT.extrabold, color: sectionColors.text, lineHeight: 1.3, marginBottom: SPACING.md, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm }}>
            {currentQuestion.question}
            <SpeakButton text={currentQuestion.question} speak={speak} isSpeaking={isSpeaking} theme={t} size={28} />
          </div>
          <SectionTag sectionId={currentQuestion.concept.s} isDark={isDark} size="sm" />
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {currentQuestion.options.map((option, idx) => {
            let optBg = t.surface, optBorder = t.border, optColor = t.text;
            if (selectedAnswer !== null) {
              if (option === currentQuestion.correct) {
                optBg = t.successLight; optBorder = t.success; optColor = t.success;
              } else if (option === selectedAnswer && !isCorrect) {
                optBg = t.errorLight; optBorder = t.error; optColor = t.error;
              }
            }
            return (
              <button
                key={option}
                onClick={() => handleAnswerSelect(option)}
                disabled={selectedAnswer !== null}
                aria-label={'Bersiv ' + (idx + 1) + ': ' + option}
                style={{
                  padding: `14px ${SPACING.lg}px`, borderRadius: RADIUS.xl + 'px', border: '2px solid ' + optBorder,
                  background: optBg, color: optColor,
                  fontFamily: 'inherit', fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold, cursor: selectedAnswer !== null ? 'default' : 'pointer',
                  textAlign: 'left', transition: `all ${DURATION.normal}`,
                  display: 'flex', alignItems: 'center', gap: SPACING.md,
                  minHeight: TOUCH_MIN,
                  animation: isCorrect !== null && option === currentQuestion.correct ? `pulse ${DURATION.slow} ease-out` : 'none',
                }}
                onMouseEnter={e => { if (selectedAnswer === null) e.currentTarget.style.background = t.surfaceHover; }}
                onMouseLeave={e => { if (selectedAnswer === null) e.currentTarget.style.background = t.surface; }}
              >
                <span style={{
                  width: 28, height: 28, borderRadius: `${RADIUS.full}px`, background: optBorder + '22',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', fontWeight: FONT_WEIGHT.extrabold, flexShrink: 0, color: optColor,
                }}>
                  {['A', 'B', 'C', 'D'][idx]}
                </span>
                {option}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {selectedAnswer !== null && (
          <div style={{
            marginTop: SPACING.lg, padding: `${SPACING.md}px ${SPACING.lg}px`, borderRadius: '12px',
            background: isCorrect ? t.successLight : t.errorLight,
            color: isCorrect ? t.success : t.error,
            fontWeight: FONT_WEIGHT.semibold, fontSize: '0.9rem',
            animation: 'fadeInUp 0.3s ease-out',
            display: 'flex', alignItems: 'center', gap: SPACING.sm,
          }}>
            {isCorrect ? <IconCheck size={18} color={t.success} /> : <IconX size={18} color={t.error} />}
            {isCorrect ? 'Rast! Aferîn! 🎉' : 'Xelet. Bersiva rast: ' + currentQuestion.correct}
          </div>
        )}
      </div>
    </div>
  );
}
