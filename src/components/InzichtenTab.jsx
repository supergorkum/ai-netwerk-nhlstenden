import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sporen, lagen } from '../data'

const INSPIRATIE_TYPES = [
  { id: 'ontwikkeling', label: 'Interessante ontwikkeling', icon: '🌐', uitleg: 'Een trend, nieuws of inzicht uit de AI-wereld dat relevant is voor NHL Stenden.' },
  { id: 'initiatief', label: 'Initiatief of project', icon: '🚀', uitleg: 'Een lopend of nieuw initiatief dat zichtbaar moet worden in het AI-netwerk.' },
  { id: 'artikel', label: 'Artikel of publicatie', icon: '📰', uitleg: 'Een artikel, rapport of onderzoek dat de moeite waard is om te delen.' },
  { id: 'tool', label: 'Interessante AI-tool', icon: '🛠️', uitleg: 'Een tool of toepassing die relevant kan zijn voor onderwijs of bedrijfsvoering.' },
  { id: 'event', label: 'Evenement of bijeenkomst', icon: '📅', uitleg: 'Een conferentie, webinar of bijeenkomst die relevant is. Dit voegen we ook toe aan de evenementenagenda.' },
]

const catKleur = {
  ontwikkeling: 'bg-blue-50 text-blue-700 border-blue-200',
  initiatief: 'bg-green-50 text-green-700 border-green-200',
  artikel: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  tool: 'bg-purple-50 text-purple-700 border-purple-200',
  event: 'bg-orange-50 text-orange-700 border-orange-200',
}

const TREFWOORD_SUGGESTIES = ['AI', 'Onderwijs', 'Didactiek', 'Geletterdheid', 'Studiesucces', 'Privacy', 'SURF', 'Governance', 'Innovatie', 'Data', 'Curriculum', 'Samenwerking', 'Toetsing', 'Ethiek', 'Soevereiniteit']

// Inzichten als tab binnen Initiatieven: een eigen, herkenbaar kleuraccent (amber/paars)
// zodat dit visueel los blijft staan van de blauwe initiatieven-kaarten, ook al
// staat het nu op dezelfde pagina.
export default function InzichtenTab({ inspiraties, setInspiraties }) {
  const navigate = useNavigate()
  const [filterType, setFilterType] = useState(null)
  const [addOpen, setAddOpen] = useState(false)
  const [stap, setStap] = useState(0)
  const [form, setForm] = useState({ type: '', rol: '', naam: '', titel: '', tekst: '', url: '', spoor: '', laag: '', trefwoorden: [] })
  const [trefwoordInput, setTrefwoordInput] = useState('')
  const [verstuurd, setVerstuurd] = useState(false)
  const [eigenStemmen, setEigenStemmen] = useState({})

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const stem = (id, richting) => {
    const huidig = eigenStemmen[id]
    if (huidig === richting) return
    setEigenStemmen(prev => ({ ...prev, [id]: richting }))
    setInspiraties(prev => prev.map(b => {
      if (b.id !== id) return b
      const st = b.stemmen || { omhoog: 0, omlaag: 0 }
      return {
        ...b,
        stemmen: {
          omhoog: st.omhoog + (richting === 'omhoog' ? 1 : huidig === 'omhoog' ? -1 : 0),
          omlaag: st.omlaag + (richting === 'omlaag' ? 1 : huidig === 'omlaag' ? -1 : 0),
        }
      }
    }))
  }

  const getStemmen = (b) => b.stemmen || { omhoog: 0, omlaag: 0 }
  const getScore = (b) => (getStemmen(b).omhoog - getStemmen(b).omlaag)

  const kanVolgende = () => {
    if (stap === 0) return form.type !== ''
    if (stap === 1) return form.tekst.length > 10
    return true
  }

  const voegTrefwoordToe = (w) => {
    const woord = w.trim()
    if (!woord || form.trefwoorden.includes(woord)) return
    upd('trefwoorden', [...form.trefwoorden, woord])
    setTrefwoordInput('')
  }

  const verstuur = () => {
    const typeDef = INSPIRATIE_TYPES.find(t => t.id === form.type)
    const sporeDef = sporen.find(s => s.id === parseInt(form.spoor))
    const nieuw = {
      id: Date.now(),
      type: form.type,
      icon: typeDef?.icon || '💡',
      typelabel: typeDef?.label || 'Inzicht',
      rol: form.rol || 'Onbekend',
      naam: form.naam || 'Anoniem',
      spoor: parseInt(form.spoor) || null,
      sporeDef: sporeDef || null,
      laag: form.laag ? parseInt(form.laag) : null,
      titel: form.titel,
      tekst: form.tekst,
      url: form.url,
      trefwoorden: form.trefwoorden,
      datum: new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }),
      nieuw: true,
    }
    setInspiraties(prev => [nieuw, ...prev])
    setVerstuurd(true)
    const isAiAct = (parseInt(form.spoor) === 3) || form.trefwoorden.some(t => t.toLowerCase().includes('ai act') || t.toLowerCase().includes('compliance'))
    if (isAiAct) {
      setTimeout(() => navigate('/initiatieven?tab=aiact'), 1800)
    }
  }

  const alle = inspiraties
  const gefilterd = filterType ? alle.filter(b => b.type === filterType) : alle

  const getRubricering = () => {
    const hints = []
    if (form.spoor) hints.push(`Thema: ${sporen.find(s => s.id === parseInt(form.spoor))?.titel}`)
    if (form.laag) hints.push(`Laag ${form.laag}: ${lagen.find(l => l.nr === parseInt(form.laag))?.naam}`)
    if (form.type === 'event') hints.push('Wordt ook toegevoegd aan de Evenementenagenda')
    if (form.type === 'initiatief') hints.push('Wordt zichtbaar in het Netwerkoverzicht')
    return hints
  }

  return (
    <div>
      {/* Eigen kleuraccent voor deze tab: amber in plaats van blauw, zodat duidelijk is dat
          dit een ander soort content is dan de geverifieerde initiatieven hierboven. */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-1">Inzichten</div>
          <p className="text-sm text-amber-800">Artikelen, ontwikkelingen en initiatieven gedeeld door mensen uit het netwerk. Vrij in te dienen, nog niet geverifieerd zoals de initiatieven hierboven.</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors flex-shrink-0"
        >
          + Deel een inzicht
        </button>
      </div>

      {/* Type filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilterType(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${!filterType ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
          Alles ({alle.length})
        </button>
        {INSPIRATIE_TYPES.map(t => {
          const n = alle.filter(b => b.type === t.id).length
          if (!n) return null
          return (
            <button key={t.id} onClick={() => setFilterType(filterType === t.id ? null : t.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filterType === t.id ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
              {t.icon} {t.label} ({n})
            </button>
          )
        })}
      </div>

      {/* Masonry grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
        {gefilterd.map(b => {
          const st = getStemmen(b)
          const gestemd = eigenStemmen[b.id]
          return (
          <div key={b.id} className={`break-inside-avoid bg-white rounded-2xl p-5 border card-hover ${b.nieuw ? 'border-amber-400 ring-2 ring-amber-200' : 'border-gray-200'}`}>
            <div className="flex items-start justify-between mb-3 gap-2">
              <div className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${catKleur[b.type] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                <span>{b.icon}</span><span>{b.typelabel}</span>
              </div>
              {b.sporeDef && (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex-shrink-0">
                  {b.sporeDef.icon} {b.sporeDef.titel}
                </span>
              )}
            </div>
            <div className="font-semibold text-nhl-blauw mb-2 leading-snug text-sm">{b.titel}</div>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">{b.tekst}</p>
            {b.trefwoorden?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {b.trefwoorden.map(t => <span key={t} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{t}</span>)}
              </div>
            )}
            {b.url && (
              <a href={b.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-amber-600 text-xs font-medium hover:underline mb-3">
                🔗 {b.bronLabel || 'Bekijk bron'}
              </a>
            )}
            {b.laag && (
              <div className="text-xs text-gray-400 mb-2">
                Laag {b.laag}: {lagen.find(l => l.nr === b.laag)?.naam}
              </div>
            )}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-400">{b.naam !== 'Anoniem' ? b.naam : b.rol} · {b.datum}</div>
              <div className="flex items-center gap-2">
                {b.nieuw && <span className="inline-flex items-center gap-1 text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold">🆕 Nieuw</span>}
                {b.autoUpdate && <span title="Automatisch opgehaald via de nieuws-functie" className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">🤖 Auto</span>}
                  {b.intern && <span className="inline-flex items-center gap-1 text-xs bg-nhl-blauw/10 text-nhl-blauw px-2 py-0.5 rounded-full font-medium">🏛️ NHL Stenden</span>}
                <div className="flex items-center gap-1">
                  <button onClick={() => stem(b.id, 'omhoog')}
                    className={`flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs transition-colors ${gestemd === 'omhoog' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100 text-gray-400'}`}>
                    👍 {st.omhoog}
                  </button>
                  <button onClick={() => stem(b.id, 'omlaag')}
                    className={`flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs transition-colors ${gestemd === 'omlaag' ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100 text-gray-400'}`}>
                    👎 {st.omlaag}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )})}
      </div>

      {alle.length > 0 && (
        <div className="mt-12 grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="font-bold text-nhl-blauw mb-4 flex items-center gap-2">🏆 Top 3 meest gewaardeerd</div>
            <div className="space-y-3">
              {[...alle].sort((a, b) => getScore(b) - getScore(a)).slice(0, 3).map((b, i) => (
                <div key={b.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-gray-400' : 'bg-orange-400'}`}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-nhl-blauw text-sm leading-snug">{b.titel}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{b.icon} {b.typelabel} · 👍 {getStemmen(b).omhoog}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="font-bold text-nhl-blauw mb-4">📋 Alle bijdragen</div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {[...alle].sort((a, b) => {
                  if (a.nieuw && !b.nieuw) return -1
                  if (!a.nieuw && b.nieuw) return 1
                  return 0
                }).map(b => (
                <div key={b.id} className="flex items-start gap-2 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-base flex-shrink-0">{b.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-nhl-blauw leading-snug">{b.titel}</div>
                    <div className="text-xs text-gray-400">{b.datum}</div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => stem(b.id, 'omhoog')}
                      className={`text-xs px-1.5 py-0.5 rounded transition-colors ${eigenStemmen[b.id] === 'omhoog' ? 'bg-green-100 text-green-700' : 'text-gray-400 hover:bg-gray-100'}`}>
                      👍 {getStemmen(b).omhoog}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {gefilterd.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🔍</div>
          <div className="font-medium">Nog niets in deze categorie.</div>
        </div>
      )}

      {/* Toevoegen modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-bold text-nhl-blauw text-lg">Inzicht delen</h2>
              <button onClick={() => setAddOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">✕</button>
            </div>

            {verstuurd ? (
              <div className="p-8 text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="font-bold text-nhl-blauw text-xl mb-2">Gedeeld!</h3>
                <p className="text-gray-600 text-sm mb-4">Je bijdrage verschijnt direct in het inzichtenoverzicht.</p>
                {(parseInt(form.spoor) === 3 || form.trefwoorden.some(t => t.toLowerCase().includes('ai act'))) && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 text-left">
                    <div className="text-xs font-semibold text-nhl-blauw mb-1">⚖️ AI Act gerelateerd</div>
                    <p className="text-xs text-gray-600">Je bijdrage is gelinkt aan AI &amp; Verantwoordelijkheid. Je wordt doorgestuurd naar de AI Act compliance pagina.</p>
                  </div>
                )}
                <button onClick={() => setAddOpen(false)} className="btn-primary">Sluiten</button>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  {['Wat deel je?','Details & rubricering'].map((s, i) => (
                    <div key={i} className="flex items-center gap-2 flex-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i < stap ? 'bg-amber-500 text-white' : i === stap ? 'bg-nhl-blauw text-white' : 'bg-gray-100 text-gray-400'}`}>
                        {i < stap ? '✓' : i + 1}
                      </div>
                      <span className={`text-xs ${i === stap ? 'text-nhl-blauw font-medium' : 'text-gray-400'}`}>{s}</span>
                      {i < 1 && <div className={`flex-1 h-0.5 rounded ${i < stap ? 'bg-amber-500' : 'bg-gray-200'}`} />}
                    </div>
                  ))}
                </div>

                {stap === 0 && (
                  <div className="space-y-3">
                    <p className="text-gray-500 text-sm mb-4">Wat voor soort inzicht wil je delen?</p>
                    {INSPIRATIE_TYPES.map(t => (
                      <button key={t.id} onClick={() => upd('type', t.id)}
                        className={`w-full px-4 py-3 rounded-xl text-left border-2 transition-colors ${form.type === t.id ? 'border-nhl-blauw bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <div className="flex items-center gap-3 mb-0.5">
                          <span className="text-xl">{t.icon}</span>
                          <span className="font-semibold text-gray-800 text-sm">{t.label}</span>
                        </div>
                        <p className="text-xs text-gray-500 ml-8">{t.uitleg}</p>
                      </button>
                    ))}
                  </div>
                )}

                {stap === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Titel <span className="text-red-400">*</span></label>
                      <input type="text" value={form.titel} onChange={e => upd('titel', e.target.value)}
                        placeholder="Korte, beschrijvende titel"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nhl-blauw" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Toelichting <span className="text-red-400">*</span></label>
                      <textarea value={form.tekst} onChange={e => upd('tekst', e.target.value)} rows={4}
                        placeholder="Beschrijf wat je deelt en waarom het relevant is voor NHL Stenden."
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nhl-blauw resize-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Link of URL</label>
                      <input type="url" value={form.url} onChange={e => upd('url', e.target.value)}
                        placeholder="https://..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nhl-blauw" />
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-2">
                      <div className="text-xs font-semibold text-nhl-blauw mb-2">💡 Goede inspiratiebronnen om te volgen</div>
                      <p className="text-xs text-gray-600 leading-relaxed mb-3">
                        Niet zeker wat je wilt delen? Dit zijn de bronnen waar het AI-Netwerk zelf naar kijkt voor relevante ontwikkelingen.
                      </p>
                      <div className="space-y-2">
                        {[
                          { naam: 'Rijksoverheid', omschrijving: 'Officiële berichten over AI-beleid, de AI-Fabriek, digitalisering in het onderwijs en nationale AI-strategie.', url: 'https://www.rijksoverheid.nl', icon: '🏛️' },
                          { naam: 'EU AI Act (EUR-Lex)', omschrijving: 'De officiële tekst en updates van de Europese AI-verordening. Essentieel voor alles rond compliance en risicoclassificatie.', url: 'https://eur-lex.europa.eu/legal-content/NL/TXT/?uri=CELEX:32024R1689', icon: '⚖️' },
                          { naam: 'NPULS', omschrijving: 'Nationaal programma voor digitalisering in het hoger onderwijs. Directe kaders, tools en materialen voor AI-geletterdheid en onderwijsvernieuwing.', url: 'https://npuls.nl', icon: '📚' },
                          { naam: 'SURF', omschrijving: 'De ICT-samenwerkingsorganisatie voor onderwijs en onderzoek. Volg de AI-Hub, GPT-NL en AI-Fabriek-ontwikkelingen voor veilige AI-inzet.', url: 'https://surf.nl', icon: '🤝' },
                        ].map(b => (
                          <a key={b.naam} href={b.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-start gap-2.5 p-2.5 bg-white rounded-lg border border-blue-100 hover:border-nhl-blauw transition-colors group">
                            <span className="text-base flex-shrink-0 mt-0.5">{b.icon}</span>
                            <div>
                              <div className="text-xs font-semibold text-nhl-blauw group-hover:text-nhl-roze transition-colors">{b.naam} ↗</div>
                              <div className="text-xs text-gray-500 leading-relaxed">{b.omschrijving}</div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rubricering: help ons het goed te plaatsen</div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Gerelateerd thema</label>
                        <select value={form.spoor} onChange={e => upd('spoor', e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nhl-blauw bg-white">
                          <option value="">Kies een thema...</option>
                          {sporen.map(s => <option key={s.id} value={s.id}>{s.icon} {s.titel}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Gerelateerde laag (technisch)</label>
                        <select value={form.laag} onChange={e => upd('laag', e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nhl-blauw bg-white">
                          <option value="">Niet van toepassing / weet ik niet</option>
                          {lagen.map(l => <option key={l.nr} value={l.nr}>Laag {l.nr}: {l.naam}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Jouw rol</label>
                        <select value={form.rol} onChange={e => upd('rol', e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nhl-blauw bg-white">
                          <option value="">Kies...</option>
                          {['Docent','Onderzoeker','Student','Medewerker dienst','Management','Anders'].map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Trefwoorden</label>
                        <div className="flex gap-2 mb-2">
                          <input type="text" value={trefwoordInput} onChange={e => setTrefwoordInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); voegTrefwoordToe(trefwoordInput) } }}
                            placeholder="Trefwoord + Enter"
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-nhl-blauw bg-white" />
                          <button onClick={() => voegTrefwoordToe(trefwoordInput)} className="px-3 py-2 bg-nhl-blauw text-white rounded-lg text-xs">+</button>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {TREFWOORD_SUGGESTIES.filter(s => !form.trefwoorden.includes(s)).slice(0, 6).map(s => (
                            <button key={s} onClick={() => voegTrefwoordToe(s)}
                              className="px-2 py-0.5 text-xs border border-gray-200 text-gray-500 hover:border-nhl-blauw hover:text-nhl-blauw rounded-full bg-white transition-colors">
                              + {s}
                            </button>
                          ))}
                        </div>
                        {form.trefwoorden.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {form.trefwoorden.map(w => (
                              <span key={w} className="inline-flex items-center gap-1 bg-nhl-blauw text-white px-2 py-0.5 rounded-full text-xs">
                                {w} <button onClick={() => upd('trefwoorden', form.trefwoorden.filter(t => t !== w))} className="hover:text-red-200">✕</button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {getRubricering().length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                        <div className="text-xs font-semibold text-green-700 mb-1">✓ Jouw bijdrage wordt geplaatst bij:</div>
                        {getRubricering().map((h, i) => <div key={i} className="text-xs text-green-600">· {h}</div>)}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
                  {stap > 0 ? <button onClick={() => setStap(0)} className="btn-ghost text-sm">← Terug</button> : <div />}
                  {stap === 0 ? (
                    <button onClick={() => setStap(1)} disabled={!kanVolgende()}
                      className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors ${kanVolgende() ? 'bg-nhl-blauw text-white hover:bg-nhl-blauw-dark' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}>
                      Volgende →
                    </button>
                  ) : (
                    <button onClick={verstuur} disabled={!form.tekst || form.tekst.length < 10}
                      className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors ${form.tekst?.length >= 10 ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}>
                      Delen →
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
