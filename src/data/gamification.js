// ─── FerMat — Gamification System ──────────────────────────────

// ── XP Rewards ──────────────────────────────────────────────────────────────
export const XP_REWARDS = {
  flashcardCorrect:   10,
  flashcardKnown:     25,   // card moved to "known" box
  quizCorrect:        15,
  quizPerfect:        50,   // 10/10 score bonus
  matchComplete:      30,
  writeCorrect:       20,
  exerciseCorrect:    15,
  dailyGoalComplete:  100,
  streakBonus:        25,   // per day of streak
};

// ── Levels ──────────────────────────────────────────────────────────────────
export const LEVELS = [
  { level: 1,  title: 'Destpêk',       titleTr: 'Başlangıç',     xpRequired: 0,     icon: '🌱' },
  { level: 2,  title: 'Fêrbûyî',       titleTr: 'Öğrenci',       xpRequired: 100,   icon: '📖' },
  { level: 3,  title: 'Xwendekar',     titleTr: 'Çalışkan',      xpRequired: 300,   icon: '✏️' },
  { level: 4,  title: 'Zana',          titleTr: 'Bilgili',       xpRequired: 600,   icon: '🧠' },
  { level: 5,  title: 'Jêhatî',        titleTr: 'Yetenekli',     xpRequired: 1000,  icon: '⭐' },
  { level: 6,  title: 'Pispor',        titleTr: 'Uzman',         xpRequired: 1500,  icon: '🏅' },
  { level: 7,  title: 'Usta',          titleTr: 'Usta',          xpRequired: 2500,  icon: '🎓' },
  { level: 8,  title: 'Matematîkzan',  titleTr: 'Matematikçi',   xpRequired: 4000,  icon: '🏆' },
  { level: 9,  title: 'Caucher Birkar', titleTr: 'Fields Madalyası', xpRequired: 6000, icon: '🥇' },
];

// ── Achievements / Badges ───────────────────────────────────────────────────
export const ACHIEVEMENTS = [
  // Learning milestones
  { id: 'first_word',     icon: '🎯', title: 'Peyva Yekem',     desc: 'Têgehek fêr bû',              condition: p => (p.totalCorrect || 0) >= 1 },
  { id: 'ten_words',      icon: '📚', title: '10 Têgeh',        desc: '10 têgehan fêr bû',            condition: p => (p.knownCount || 0) >= 10 },
  { id: 'fifty_words',    icon: '🌟', title: '50 Têgeh',        desc: '50 têgehan fêr bû',            condition: p => (p.knownCount || 0) >= 50 },
  { id: 'hundred_words',  icon: '💎', title: '100 Têgeh',       desc: '100 têgehan fêr bû',           condition: p => (p.knownCount || 0) >= 100 },
  { id: 'all_words',      icon: '👑', title: 'Hemû Têgeh!',     desc: 'Hemû têgehan fêr bû',          condition: p => (p.knownCount || 0) >= 205 },

  // Activity badges
  { id: 'quiz_master',    icon: '🧪', title: 'Azmûnvan',        desc: '10 azmûn temam kir',           condition: p => (p.quizCount || 0) >= 10 },
  { id: 'perfect_quiz',   icon: '💯', title: 'Bê Çewtî',        desc: 'Azmûnek bê çewtî temam kir',  condition: p => (p.perfectQuizzes || 0) >= 1 },
  { id: 'writer',         icon: '✍️', title: 'Nivîskar',        desc: '50 peyv rast nivîsand',         condition: p => (p.writeCorrect || 0) >= 50 },
  { id: 'matcher',        icon: '🧩', title: 'Cotker',           desc: '10 lîstikên cotkirinê temam kir', condition: p => (p.matchCount || 0) >= 10 },

  // Streak badges
  { id: 'streak_3',       icon: '🔥', title: '3 Roj',           desc: '3 roj li pey hev xebitî',      condition: p => (p.streak || 0) >= 3 },
  { id: 'streak_7',       icon: '⚡', title: 'Hefteyek!',       desc: '7 roj li pey hev xebitî',      condition: p => (p.streak || 0) >= 7 },
  { id: 'streak_30',      icon: '🌙', title: 'Mehek!',          desc: '30 roj li pey hev xebitî',     condition: p => (p.streak || 0) >= 30 },

  // Section mastery
  { id: 'section_master',  icon: '🏛️', title: 'Beşek Temam',    desc: 'Beşek bi tevahî fêr bû',      condition: p => (p.completedSections || 0) >= 1 },
  { id: 'half_sections',   icon: '🗺️', title: 'Nîvê Rê',        desc: '5 beşan temam kir',            condition: p => (p.completedSections || 0) >= 5 },
];

// ── Daily Goal ──────────────────────────────────────────────────────────────
export const DAILY_GOAL = {
  newConcepts: 5,       // learn 5 new concepts per day
  reviewConcepts: 10,   // review 10 concepts per day
  xpTarget: 100,        // earn 100 XP per day
};

// ── Helper: get level from XP ───────────────────────────────────────────────
export function getLevelFromXP(xp) {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.xpRequired) current = lvl;
    else break;
  }
  const nextIdx = LEVELS.findIndex(l => l.level === current.level) + 1;
  const next = LEVELS[nextIdx] || null;
  const progressToNext = next
    ? (xp - current.xpRequired) / (next.xpRequired - current.xpRequired)
    : 1;
  return { current, next, progressToNext, xp };
}

// ── Helper: check unlocked achievements ─────────────────────────────────────
export function getUnlockedAchievements(progress) {
  return ACHIEVEMENTS.filter(a => a.condition(progress));
}

// ── Helper: check newly unlocked achievements ───────────────────────────────
export function getNewAchievements(progress, previouslyUnlocked = []) {
  const allUnlocked = getUnlockedAchievements(progress);
  return allUnlocked.filter(a => !previouslyUnlocked.includes(a.id));
}

// ── Motivational quotes in Kurdish ──────────────────────────────────────────
export const MOTIVATIONAL_QUOTES = [
  'Matematîk bi kurdî xweştir e!',
  'Her roj hinekî fêr bibe, her roj mezintir bibe.',
  'Zanîn hêz e, hêza te bi kurdî ye.',
  'Tu dikarî! Berdewam bike!',
  'Rêya hezar gavan bi gaveke destpê dike.',
  'Ziman û zanist, herdu baskên firrînê ne.',
  'Caucher Birkar jî wek te destpê kir.',
  'Matematîk zimanê gerdûnê ye, bi kurdî jî diaxive.',
  'Hişê te bêsînor e, wek hejmaran.',
  'Her têgehek nû, dergehek nû ye.',
];
