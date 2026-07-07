import GradientHeader from '../components/GradientHeader'
import ImpactDashboard from '../components/ImpactDashboard'
import { initiatieven, AI_ACT_ITEMS, SIGNAAL_CONFIG, verplichtingSignaal } from '../data'

const STATUS_LABELS = {
  lopend:            { label: 'Lopend',           kleur: 'bg-green-100 text-green-700',   dot: 'bg-green-500' },
  'in-ontwikkeling': { label: 'In voorbereiding', kleur: 'bg-blue-100 text-nhl-blauw',    dot: 'bg-blue-500' },
  'te-starten':      { label: 'Nog te starten',   kleur: 'bg-orange-100 text-orange-700', dot: 'bg-orange-400' },
  'te-controleren':  { label: 'Te controleren',   kleur: 'bg-red-100 text-red-700',       dot: 'bg-red-500' },
  afgerond:          { label: 'Afgerond',         kleur: 'bg-gray-100 text-gray-500',     dot: 'bg-gray-400' },
}

export default function Dashboard({ pilots = [], evenementen = [], roadmap = [] }) {
  const signalen = AI_ACT_ITEMS.map(vp => ({ vp, signaal: verplichtingSignaal(vp, roadmap) }))
  const volgorde = { rood: 0, oranje: 1, groen: 2 }
  const gesorteerd = [...signalen].sort((a, b) => {
    const v = volgorde[a.signaal.kleur] - volgorde[b.signaal.kleur]
    if (v !== 0) return v
    return (a.vp.deadlineISO || '').localeCompare(b.vp.deadlineISO || '')
  })
  const metWerk = signalen.filter(s => s.signaal.kleur === 'groen').length
  const eigenKoers = roadmap.filter(r => !r.aiActKoppeling && r.status !== 'afgerond')
  const afgerond = roadmap.filter(r => r.status === 'afgerond')

  return (
    <div className="min-h-screen pt-16 bg-white">
      <GradientHeader
        label="Voortgang"
        title="Dashboard"
        subtitle="De voortgang van het AI-Netwerk in cijfers, gekoppeld aan de doelstellingen en de verplichtingen uit de AI Act."
      />

      <ImpactDashboard pilots={pilots} initiatieven={initiatieven} evenementen={evenementen} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-nhl-blauw">Verplichtingen en roadmap</h2>
          <p className="text-sm text-gray-500 mt-1">
            {metWerk} van de {AI_ACT_ITEMS.length} AI Act verplichtingen heeft lopend werk. Per verplichting zie je de status en wie ermee bezig is.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {gesorteerd.map(({ vp, signaal }) => {
            const sc = SIGNAAL_CONFIG[signaal.kleur]
            const items = roadmap.filter(r => r.aiActKoppeling === vp.id && r.status !== 'afgerond')
            const klaar = roadmap.filter(r => r.aiActKoppeling === vp.id && r.status === 'afgerond')
            return (
              <div key={vp.id} className={`rounded-2xl border-2 ${sc.border} bg-white overflow-hidden flex flex-col`}>
                <div className={`px-4 py-3 ${sc.bg}`}>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-bold text-gray-500">{vp.artikel} · 📅 {vp.deadline}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${sc.badge}`}>{sc.label}</span>
                  </div>
                  <div className="font-bold text-nhl-blauw text-sm mt-1 leading-snug">{vp.titel}</div>
                </div>
                <div className="p-4 flex-1">
                  {items.length === 0 && klaar.length === 0 && (
                    <div className="text-xs text-gray-400 italic">Geen roadmap-item gekoppeld.</div>
                  )}
                  <div className="space-y-2.5">
                    {items.map(r => {
                      const st = STATUS_LABELS[r.status] || STATUS_LABELS['te-starten']
                      return (
                        <div key={r.id} className="flex items-start gap-2">
                          <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${st.dot}`} />
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-gray-700 leading-snug">{r.titel}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{st.label}{r.verantwoordelijke ? ` · ${r.verantwoordelijke}` : ''}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {klaar.length > 0 && (
                    <div className="text-xs text-gray-400 mt-3">✅ {klaar.length} gekoppeld item{klaar.length !== 1 ? 's' : ''} afgerond</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {eigenKoers.length > 0 && (
          <div className="mb-8">
            <h3 className="font-bold text-nhl-blauw mb-1">Eigen koers</h3>
            <p className="text-sm text-gray-500 mb-4">Roadmap-items zonder directe AI Act verplichting.</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {eigenKoers.map(r => {
                const st = STATUS_LABELS[r.status] || STATUS_LABELS['te-starten']
                return (
                  <div key={r.id} className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.kleur}`}>{st.label}</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-700 leading-snug">{r.titel}</div>
                    {r.verantwoordelijke && <div className="text-xs text-gray-400 mt-1">{r.verantwoordelijke}</div>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {afgerond.length > 0 && (
          <div className="text-sm text-gray-400">✅ In totaal {afgerond.length} roadmap-item{afgerond.length !== 1 ? 's' : ''} afgerond en bevestigd door een beheerder.</div>
        )}
      </div>

    </div>
  )
}
