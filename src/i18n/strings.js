// ─── FerMat — UI String Catalogue (i18n) ─────────────────────────
// Currently only `ku` is populated. Add `tr` and `en` translations
// gradually as views are migrated to use `useLocale().t('key')`.
//
// Adding a string:
//   1. Pick a stable key in dot.notation: 'nav.home', 'modal.confirmReset'.
//   2. Add it to STRINGS.ku (always required — fallback locale).
//   3. Optionally add tr/en translations.
//
// Migrating a view: replace literal 'Malper' with `t('nav.home')`.

export const SUPPORTED_LOCALES = ['ku', 'tr', 'en'];
export const DEFAULT_LOCALE = 'ku';

export const STRINGS = {
  ku: {
    // App-level
    'app.appName':              'FerMat',
    'app.tagline':               'Ferhenga Matematîkê ya Kurdî',
    'app.loading':               'Tê barkirin…',
    'app.start':                 'Dest pê bike',

    // Navigation
    'nav.home':                  'Malper',
    'nav.dict':                  'Ferheng',
    'nav.flash':                 'Fêrbûn',
    'nav.games':                 'Lîstik',
    'nav.stats':                 'Agahî',
    'nav.more':                  'Zêdetir',
    'nav.bottomLabel':           'Rêgeza jêrîn',

    // View titles
    'view.dict':                 'Ferheng',
    'view.flash':                'Pirs û Bersiv',
    'view.quiz':                 'Azmûn',
    'view.match':                'Cot Bîne',
    'view.write':                'Binivîse',
    'view.exercise':             'Hîndarî',
    'view.stats':                'Pêşketin',
    'view.about':                'Derbarê Ferhengê',
    'view.feedback':             'Pêşniyar û Serrastkirin',
    'view.conceptMap':           'Nexşeya Têgehan',
    'view.worksheet':            'Rûpelên Xebatê',

    // Common actions
    'action.cancel':             'Betal bike',
    'action.confirm':            'Erê',
    'action.close':              'Bigire',
    'action.next':               'Pêş',
    'action.prev':                'Paş',
    'action.reset':              'Paqij bike',
    'action.search':             'Li têgehekê bigere…',
    'action.tryAgain':           'Ji nû ve biceribîne',

    // Stats / Gamification
    'stats.knownOf':             '{known} ji {total} têgehan hatine fêrkirin',
    'stats.level':               'Asta {level}',
    'stats.xpToNext':             '{xp} XP heya astê pêş',
    'stats.maxLevel':             'Asta tewra bilind!',
    'stats.streakSingle':        'Rojek li pey hev',
    'stats.streakPlural':        '{n} roj li pey hev',
    'stats.dailyGoal':           'Armanca îro',
    'stats.todayProgress':       'Pêşketina îro',
    'stats.newConcepts':         'Têgehên nû',
    'stats.reviews':             'Dubarekirin',
    'stats.achievements':        'Destkeftî',
    'stats.achievementLocked':   'girtî',
    'stats.achievementUnlocked': 'vekirî',

    // Error / Empty states
    'empty.noResults':           'Têgehek nehat dîtin',
    'empty.adjustFilters':       'Parzûnê biguherîne an lêgerînê paqij bike',
    'error.title':               'Xeletîyek çêbû',
    'error.body':                'Bibore, pirsgirêkek çêbû. Ji kerema xwe dîsa biceribîne.',

    // Feedback
    'feedback.title':            'Ji bo baştirkirina vê sepanê alîkariya xwe bikin.',
    'feedback.orEmail':          'An jî rasterast bi e-nameyê bişîne:',
  },

  tr: {
    // Translations to be filled in by maintainers. Keys missing here fall back
    // to the corresponding `ku` value via t().
    'app.loading':               'Yükleniyor…',
    'action.cancel':             'İptal',
    'action.confirm':            'Tamam',
    'action.close':              'Kapat',
    'action.tryAgain':           'Tekrar dene',
    'error.title':               'Bir hata oluştu',
    'error.body':                'Üzgünüz, bir sorun yaşandı. Lütfen tekrar deneyin.',
  },

  en: {
    'app.loading':               'Loading…',
    'action.cancel':             'Cancel',
    'action.confirm':            'OK',
    'action.close':              'Close',
    'action.tryAgain':           'Try again',
    'error.title':               'Something went wrong',
    'error.body':                'Sorry, an error occurred. Please try again.',
  },
};

// Simple template interpolation: t('stats.knownOf', { known: 5, total: 200 })
export function interpolate(template, vars) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}
