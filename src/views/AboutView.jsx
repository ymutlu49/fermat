// ─── Ferhenga Matematîkê — Derbarê Ferhengê (About View) ─────────────────────
import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, DURATION } from '@data';
import { useMediaQuery } from '@hooks';

export default function AboutView({ theme, isDark }) {
  const t = theme;
  const { isMobile } = useMediaQuery();
  const px = isMobile ? SPACING.md : SPACING.xl;

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'transparent', padding: `${SPACING.xl}px ${px}px 80px` }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: SPACING.xl + 4 }}>
          <img
            src={import.meta.env.BASE_URL + 'favicon.svg'}
            alt="Ferhenga Matematîkê"
            style={{ width: 80, height: 80, borderRadius: RADIUS.xl, marginBottom: SPACING.md }}
          />
          <div style={{
            fontSize: isMobile ? '1.3rem' : '1.5rem',
            fontWeight: FONT_WEIGHT.extrabold, color: t.text,
          }}>
            Ferhenga Matematîkê
          </div>
          <div style={{ fontSize: FONT_SIZE.sm, color: t.textMuted, marginTop: SPACING.xs }}>
            Pêşdibistanî – Dibistana Seretayî
          </div>
        </div>

        {/* Main letter */}
        <div style={{
          background: isDark ? 'rgba(78,205,196,0.05)' : 'rgba(15,76,92,0.03)',
          borderRadius: RADIUS.xl,
          border: `1.5px solid ${isDark ? 'rgba(78,205,196,0.1)' : 'rgba(15,76,92,0.08)'}`,
          padding: isMobile ? `${SPACING.xl}px ${SPACING.lg}px` : `${SPACING.xxl}px ${SPACING.xl}px`,
          marginBottom: SPACING.lg,
        }}>
          <div style={{
            fontSize: FONT_SIZE.base, color: t.text,
            lineHeight: 1.85, textAlign: 'justify',
          }}>
            <span style={{ fontWeight: FONT_WEIGHT.bold, color: t.primary }}>
              Dêûbav û Mamosteyên Hêja,
            </span>
            <br /><br />
            Ev ferheng ji bo perwerdehiya matematîkê ya bi zimanê Kurmancî hatiye amadekirin.
            Armanca wê ew e ku têgehên matematîkê yên bingehîn bi awayekî zelal, zanistî û fêmker
            bi zarokên me re bên parve kirin. Di vê çarçoveyê de, ev ferheng hem ji mamosteyên ku
            bi Kurmancî dersên matematîkê didin re, hem jî ji dêûbavên ku dixwazin zarokên xwe bi
            zimanê xwe bi têgehên matematîkê re nas bikin re amûreke bingehîn e. Digel vê, ev ferheng
            di heman demê de bingehek e ji bo pirtûkên dersê û çalakiyên perwerdehî yên ku dê di
            pêşerojê de bi Kurmancî bên amadekirin.
            <br /><br />
            Ev ferheng ne tenê wekî pirtûkekê, lê di heman demê de wekî sepaneke (app) dîjîtal jî
            hatiye amadekirin. Bi vê sepanê re bikarhêner dikarin li her cih û her dem bigihîjin
            têgehan, lê bigerin û bi awayek înteraktîf fêr bibin. Digel vê, ji bo ku zarok têgehên
            matematîkê bi Kurmancî bi awayekî kûrtir û domdar fêr bibin, ferheng bi gelek pelên xebatê
            û çalakiyên şadiyane ve hatiye piştgirî kirin. Ev çalakî zarokan dibe alîkar ku matematîkê
            bi lîstik, keyfxweşî û pratîkê ve bi cih bikin.
            <br /><br />
            Hêvîdarim ku ev xebat — bi ferheng, sepan, pelên xebatê û çalakiyên şadiyane ve — dê di
            perwerdehiya matematîkê ya bi Kurmancî de alîkariyeke bi kêr were.
          </div>

          {/* Quote */}
          <div style={{
            marginTop: SPACING.xl,
            padding: `${SPACING.md}px ${SPACING.lg}px`,
            borderLeft: `4px solid ${t.primary}`,
            background: isDark ? 'rgba(78,205,196,0.06)' : 'rgba(15,76,92,0.04)',
            borderRadius: `0 ${RADIUS.lg}px ${RADIUS.lg}px 0`,
          }}>
            <div style={{
              fontSize: FONT_SIZE.base, fontStyle: 'italic',
              color: t.primary, fontWeight: FONT_WEIGHT.semibold,
              lineHeight: 1.6,
            }}>
              "Matematîk bi her zimanî diaxive, bi kurdî jî."
            </div>
          </div>
        </div>

        {/* Author card */}
        <div style={{
          background: t.surface,
          borderRadius: RADIUS.xl,
          border: `1.5px solid ${t.border}`,
          padding: `${SPACING.lg}px`,
          display: 'flex', alignItems: 'center', gap: SPACING.lg,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: `linear-gradient(135deg, ${t.primary}, ${isDark ? '#4ECDC4' : '#1A6B7F'})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', flexShrink: 0, color: '#fff', fontWeight: FONT_WEIGHT.black,
            fontFamily: 'serif',
          }}>
            YM
          </div>
          <div>
            <div style={{ fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.bold, color: t.text }}>
              Prof. Dr. Yılmaz Mutlu
            </div>
            <div style={{ fontSize: FONT_SIZE.sm, color: t.textSecondary, marginTop: 2 }}>
              Zanîngeha Mûş Alparslan
            </div>
            <div style={{ fontSize: FONT_SIZE.xs, color: t.textMuted, marginTop: 1 }}>
              Fakulteya Perwerdehiyê
            </div>
          </div>
        </div>

        {/* Version info */}
        <div style={{
          textAlign: 'center', marginTop: SPACING.xl,
          fontSize: FONT_SIZE.xs, color: t.textMuted,
        }}>
          Guherto 3.0.0 · 201 Têgeh · 9 Beş · 3 Ziman
        </div>
      </div>
    </div>
  );
}
