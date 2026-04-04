// ─── FerMat — Pêşniyar û Serrastkirin (Feedback View) ───────────────────────
import { FONT_SIZE, FONT_WEIGHT } from '@data';
import { IconLightbulb, IconMessage, IconBook, IconCheck, IconChevronRight } from '@components/icons';
import { PageContainer, SectionCard, ActionRow } from '@components/ui';

const GOOGLE_FORM_URL = 'https://forms.gle/47vidk9tgbYN5siQA';

const FEEDBACK_TYPES = [
  { id: 'bug',  icon: IconMessage, label: 'Xeletî',   desc: 'Pirsgirêkek rapor bike',     color: '#EF4444' },
  { id: 'idea', icon: IconLightbulb, label: 'Pêşniyar', desc: 'Ramanek an pêşniyarek bişîne', color: '#F59E0B' },
  { id: 'term', icon: IconBook,    label: 'Têgeh',    desc: 'Têgehek nû pêşniyar bike',    color: '#3B82F6' },
  { id: 'like', icon: IconCheck,   label: 'Spas',     desc: 'Tiştên ku baş in bibêje',     color: '#10B981' },
];

export default function FeedbackView({ theme, isDark }) {
  const t = theme;
  return (
    <PageContainer>
      <div style={{
        fontSize: FONT_SIZE.sm, color: t.textMuted, lineHeight: 1.6,
        marginBottom: 24, textAlign: 'center',
      }}>
        Ji bo baştirkirina vê sepanê alîkariya xwe bikin.
      </div>

      <SectionCard theme={t}>
        {FEEDBACK_TYPES.map((ft, i) => (
          <a
            key={ft.id}
            href={GOOGLE_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none', display: 'block' }}
          >
            <ActionRow
              icon={ft.icon} iconColor={ft.color} label={ft.label} desc={ft.desc}
              theme={t} isDark={isDark} isLast={i === FEEDBACK_TYPES.length - 1}
            />
          </a>
        ))}
      </SectionCard>

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <div style={{ fontSize: FONT_SIZE.xs, color: t.textMuted, marginBottom: 8 }}>
          An jî rasterast bi e-nameyê bişîne:
        </div>
        <a href="mailto:y.mutlu@alparslan.edu.tr?subject=[FerMat] Pêşniyar"
          style={{ fontSize: FONT_SIZE.sm, color: t.primary, fontWeight: FONT_WEIGHT.medium, textDecoration: 'none' }}>
          y.mutlu@alparslan.edu.tr
        </a>
      </div>
    </PageContainer>
  );
}
