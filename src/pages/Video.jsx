import GradientHeader from '../components/GradientHeader'
import { useState, useCallback } from 'react'
import { sporen } from '../data'
import { beheerWachtwoordKlopt } from '../beheerSlot'

function getYouTubeId(url) {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
  return match ? match[1] : null
}

function getThumbUrl(videoId) {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
}

export default function Video({ videos, setVideos, actiefVideoId, setActiefVideoId }) {
  const setActiefId = setActiefVideoId
  const actiefId = actiefVideoId
  const [eigenStemmen, setEigenStemmen] = useState({})
  const [meldOpen, setMeldOpen] = useState(false)
  const [beheerOpen, setBeheerOpen] = useState(false)
  const [beheerCode, setBeheerCode] = useState('')
  const [beheerIn, setBeheerIn] = useState(false)
  const [beheerFout, setBeheerFout] = useState('')
  const [beheerBezig, setBeheerBezig] = useState(false)
  const [form, setForm] = useState({ url: '', titel: '', omschrijving: '', trefwoorden: '', spoor: '', ingediendDoor: '' })
  const [formFout, setFormFout] = useState('')
  const [meldVerstuurd, setMeldVerstuurd] = useState(false)

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const goedgekeurd = (videos || []).filter(v => v.status === 'goedgekeurd')
  const wachtrij = (videos || []).filter(v => v.status === 'wachtrij')

  // Nieuwste op datum (voor hoofdvideo-selectie als geen actiefId)
  const opDatumNieuwNaarOud = [...goedgekeurd].sort((a, b) => b.id - a.id)

  // Top 5 op score (voor de ranglijst rechts)
  const gesorteedOpScore = [...goedgekeurd].sort((a, b) => (b.omhoog - b.omlaag) - (a.omhoog - a.omlaag))

  // Hoofdvideo: expliciet gekozen via actiefId, anders de nieuwste goedgekeurde
  const actief = actiefId
    ? goedgekeurd.find(v => v.id === actiefId) || opDatumNieuwNaarOud[0]
    : opDatumNieuwNaarOud[0]

  // Drie frames: altijd de drie nieuwste op id (timestamp), exclusief de actieve
  // Score speelt geen rol: dat is alleen voor de top 5
  const frameVideos = [...goedgekeurd]
    .sort((a, b) => b.id - a.id)
    .filter(v => v.id !== actief?.id)
    .slice(0, 3)

  const top5 = gesorteedOpScore.slice(0, 5)

  const stem = useCallback((id, richting) => {
    const huidig = eigenStemmen[id]
    if (huidig === richting) return
    setEigenStemmen(prev => ({ ...prev, [id]: richting }))
    setVideos(prev => prev.map(v => {
      if (v.id !== id) return v
      return {
        ...v,
        omhoog: v.omhoog + (richting === 'omhoog' ? 1 : huidig === 'omhoog' ? -1 : 0),
        omlaag: v.omlaag + (richting === 'omlaag' ? 1 : huidig === 'omlaag' ? -1 : 0),
      }
    }))
  }, [eigenStemmen, setVideos])

  const verstuurVideo = () => {
    const videoId = getYouTubeId(form.url)
    if (!videoId) { setFormFout('Geen geldige YouTube URL gevonden.'); return }
    if (!form.titel || !form.omschrijving || !form.spoor) { setFormFout('Vul alle verplichte velden in.'); return }
    const nieuw = {
      id: Date.now(),
      status: 'wachtrij',
      videoId,
      titel: form.titel,
      omschrijving: form.omschrijving,
      trefwoorden: form.trefwoorden.split(',').map(t => t.trim()).filter(Boolean),
      spoor: parseInt(form.spoor),
      ingediendDoor: form.ingediendDoor || 'Anoniem',
      datum: new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }),
      omhoog: 0, omlaag: 0,
    }
    setVideos(prev => [...prev, nieuw])
    setMeldVerstuurd(true)
    setFormFout('')
  }

  // Videobeheer vraagt het beheerwachtwoord, net als Beheer (verzoek van Edgar,
  // 2 november 2026). De controle staat in src/beheerSlot.js.
  const loginBeheer = async () => {
    if (beheerBezig) return
    setBeheerBezig(true)
    const klopt = await beheerWachtwoordKlopt(beheerCode).catch(() => false)
    setBeheerBezig(false)
    setBeheerCode('')
    if (klopt) { setBeheerIn(true); setBeheerFout('') }
    else setBeheerFout('Wachtwoord onjuist. Probeer opnieuw.')
  }

  const keurGoed = (id) => {
    setVideos(prev => prev.map(v => v.id === id ? { ...v, status: 'goedgekeurd' } : v))
    setActiefId(id)
    setBeheerOpen(false)
  }
  const keurAf = (id) => setVideos(prev => prev.filter(v => v.id !== id))
  const verwijder = (id) => {
    setVideos(prev => prev.filter(v => v.id !== id))
    if (actief?.id === id) setActiefId(null)
  }

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <GradientHeader
        label="Kennis & inzichten"
        title="AI Video's"
        subtitle="Relevante video's over AI in het onderwijs en de organisatie, samengesteld door en voor NHL Stenden."
      >
        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={() => { setMeldOpen(true); setMeldVerstuurd(false); setForm({ url:'',titel:'',omschrijving:'',trefwoorden:'',spoor:'',ingediendDoor:'' }); setFormFout('') }}
            className="inline-flex items-center gap-2 bg-nhl-roze hover:bg-nhl-roze-dark text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
          >
            + Video aanmelden
          </button>
          <button
            onClick={() => { setBeheerOpen(true); setBeheerCode(''); setBeheerIn(false); setBeheerFout('') }}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            🔐 Beheer
            {wachtrij.length > 0 && (
              <span className="bg-nhl-roze text-white rounded-full px-1.5 py-0.5 text-xs">{wachtrij.length}</span>
            )}
          </button>
        </div>
      </GradientHeader>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {goedgekeurd.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">🎬</div>
            <div className="font-semibold text-lg mb-2">Nog geen video's goedgekeurd</div>
            <p className="text-sm mb-6">Meld een video aan. Na goedkeuring via beheer verschijnt hij hier.</p>
            <button onClick={() => setMeldOpen(true)} className="btn-roze">+ Video aanmelden</button>
          </div>
        ) : actief && (
          <>
            {/* Hoofdvideo (nieuwste) + Top 5 (op score) */}
            <div className="grid lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2">
                {/* Label nieuwste */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs bg-nhl-roze text-white px-2.5 py-1 rounded-full font-semibold">🆕 Nieuwste video</span>
                  {actiefId && actiefId !== opDatumNieuwNaarOud[0]?.id && (
                    <button
                      onClick={() => setActiefId(null)}
                      className="text-xs text-gray-400 hover:text-nhl-blauw underline"
                    >
                      ← Terug naar nieuwste
                    </button>
                  )}
                  {actiefId && actiefId !== opDatumNieuwNaarOud[0]?.id && (
                    <span className="text-xs text-gray-400">Geselecteerd uit bibliotheek</span>
                  )}
                </div>

                <div className="bg-black rounded-2xl overflow-hidden aspect-video mb-4 shadow-lg">
                  <iframe key={actief.videoId}
                    src={`https://www.youtube.com/embed/${actief.videoId}`}
                    className="w-full h-full" allowFullScreen title={actief.titel} />
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="font-bold text-nhl-blauw text-lg mb-2 leading-snug">{actief.titel}</h2>
                      <p className="text-gray-600 text-sm leading-relaxed mb-3">{actief.omschrijving}</p>
                      <div className="flex flex-wrap gap-2">
                        {(actief.trefwoorden || []).map(t => (
                          <span key={t} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{t}</span>
                        ))}
                        {actief.spoor && (() => {
                          const s = sporen.find(sp => sp.id === actief.spoor)
                          return s ? (
                            <span className="text-xs px-2 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: s.kleur }}>
                              {s.icon} {s.titel}
                            </span>
                          ) : null
                        })()}
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-2 flex-shrink-0">
                      {['omhoog','omlaag'].map(r => {
                        const gestemd = eigenStemmen[actief.id] === r
                        return (
                          <button key={r} onClick={() => stem(actief.id, r)}
                            className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all ${gestemd ? 'border-nhl-roze bg-pink-50 scale-105' : 'border-gray-200 hover:border-gray-300'}`}>
                            <span className="text-xl">{r === 'omhoog' ? '👍' : '👎'}</span>
                            <span className={`text-xs font-bold ${gestemd ? 'text-nhl-roze' : 'text-gray-500'}`}>{actief[r]}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                    Gedeeld door {actief.ingediendDoor} · {actief.datum}
                  </div>
                </div>
              </div>

              {/* Top 5 op score */}
              <div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className="font-bold text-nhl-blauw mb-1 flex items-center gap-2">🏆 Top 5 best beoordeeld</div>
                  <p className="text-xs text-gray-400 mb-4">Klik om te bekijken</p>
                  <div className="space-y-2">
                    {top5.map((v, i) => (
                      <button key={v.id} onClick={() => setActiefId(v.id)}
                        className={`w-full flex items-center gap-3 text-left p-2.5 rounded-xl transition-colors ${actief.id === v.id ? 'bg-blue-50 border border-nhl-blauw/20' : 'hover:bg-gray-50'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-400' : 'bg-gray-200 text-gray-600'}`}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-nhl-blauw leading-snug line-clamp-2">{v.titel}</div>
                        </div>
                        <div className="text-xs text-green-600 font-bold flex-shrink-0">+{v.omhoog - v.omlaag}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Drie recente frames (nieuwste, exclusief hoofdvideo) */}
            {frameVideos.length > 0 && (
              <div className="mb-10">
                <div className="font-bold text-nhl-blauw mb-4">Recente toevoegingen</div>
                <div className="grid sm:grid-cols-3 gap-4">
                  {frameVideos.map(v => (
                    <button key={v.id} onClick={() => setActiefId(v.id)} className="text-left card card-hover overflow-hidden group">
                      <div className="relative">
                        <img src={getThumbUrl(v.videoId)} alt={v.titel} className="w-full aspect-video object-cover"
                          onError={e => { e.target.style.background='#e5e7eb'; e.target.style.height='80px' }} />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-nhl-blauw text-sm ml-0.5">▶</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="text-xs font-medium text-nhl-blauw leading-snug line-clamp-2 mb-1">{v.titel}</div>
                        <div className="text-xs text-gray-400">👍 {v.omhoog} · {v.datum}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Videobibliotheek: altijd zichtbaar */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="font-bold text-nhl-blauw">📚 Videobibliotheek</div>
                <div className="text-xs text-gray-400">{goedgekeurd.length} video{goedgekeurd.length !== 1 ? "'s" : ''} beschikbaar</div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {opDatumNieuwNaarOud.map(v => (
                  <button key={v.id} onClick={() => setActiefId(v.id)}
                    className={`w-full flex items-center gap-4 p-3 text-left transition-colors border-b border-gray-50 last:border-b-0 ${actief.id === v.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                    <img src={getThumbUrl(v.videoId)} alt=""
                      className="w-20 h-12 object-cover rounded-lg flex-shrink-0"
                      onError={e => e.target.style.display='none'} />
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium leading-snug ${actief.id === v.id ? 'text-nhl-blauw' : 'text-gray-800'}`}>{v.titel}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{v.ingediendDoor} · {v.datum}</div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {actief.id === v.id && (
                        <span className="text-xs bg-nhl-blauw text-white px-2 py-0.5 rounded-full font-medium">Nu</span>
                      )}
                      <div className="text-xs text-gray-400">👍 {v.omhoog}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Video aanmelden modal */}
      {meldOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-bold text-nhl-blauw text-lg">Video aanmelden</h2>
              <button onClick={() => setMeldOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">✕</button>
            </div>
            {meldVerstuurd ? (
              <div className="p-8 text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="font-bold text-nhl-blauw text-xl mb-2">Video aangemeld!</h3>
                <p className="text-gray-600 text-sm mb-2">Je video staat in de wachtrij en wordt beoordeeld door de beheerder.</p>
                <p className="text-gray-400 text-xs mb-6">Na goedkeuring verschijnt de video direct op deze pagina.</p>
                <button onClick={() => setMeldOpen(false)} className="btn-primary">Sluiten</button>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">YouTube URL <span className="text-red-400">*</span></label>
                  <input type="url" value={form.url} onChange={e => upd('url', e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nhl-blauw" />
                  {form.url && getYouTubeId(form.url) && (
                    <img src={getThumbUrl(getYouTubeId(form.url))} alt="Preview"
                      className="w-full h-32 object-cover rounded-lg mt-2"
                      onError={e => e.target.style.display='none'} />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Titel <span className="text-red-400">*</span></label>
                  <input type="text" value={form.titel} onChange={e => upd('titel', e.target.value)}
                    placeholder="Beschrijvende titel van de video"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nhl-blauw" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Waarom relevant? <span className="text-red-400">*</span></label>
                  <textarea value={form.omschrijving} onChange={e => upd('omschrijving', e.target.value)} rows={3}
                    placeholder="Wat draagt deze video bij aan het AI-gesprek binnen NHL Stenden?"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nhl-blauw resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Gerelateerd thema <span className="text-red-400">*</span></label>
                  <select value={form.spoor} onChange={e => upd('spoor', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nhl-blauw">
                    <option value="">Kies een thema...</option>
                    {sporen.map(s => <option key={s.id} value={s.id}>{s.icon} {s.titel}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Trefwoorden (komma-gescheiden)</label>
                  <input type="text" value={form.trefwoorden} onChange={e => upd('trefwoorden', e.target.value)}
                    placeholder="Bijv. AI, Onderwijs, Didactiek"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nhl-blauw" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Jouw naam (optioneel)</label>
                  <input type="text" value={form.ingediendDoor} onChange={e => upd('ingediendDoor', e.target.value)}
                    placeholder="Bijv. Jan de Vries"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nhl-blauw" />
                </div>
                {formFout && <div className="text-red-500 text-xs bg-red-50 p-3 rounded-lg">{formFout}</div>}
                <button onClick={verstuurVideo} className="btn-roze w-full">Video aanmelden →</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Beheer modal */}
      {beheerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
              <div>
                <h2 className="font-bold text-nhl-blauw text-lg">Video beheer</h2>
                {beheerIn && <p className="text-xs text-gray-400 mt-0.5">{wachtrij.length} in wachtrij · {goedgekeurd.length} goedgekeurd</p>}
              </div>
              <button onClick={() => setBeheerOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">✕</button>
            </div>
            {!beheerIn ? (
              <div className="p-6">
                <p className="text-gray-500 text-sm mb-3">Videobeheer vraagt het beheerwachtwoord.</p>
                <input type="password" value={beheerCode} onChange={e => { setBeheerCode(e.target.value); setBeheerFout('') }}
                  onKeyDown={e => e.key === 'Enter' && loginBeheer()}
                  placeholder="Wachtwoord" autoFocus disabled={beheerBezig}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-nhl-blauw" />
                {beheerFout && <div className="text-red-500 text-xs mb-3">{beheerFout}</div>}
                <button onClick={loginBeheer} disabled={beheerBezig} className="btn-primary w-full disabled:opacity-60">{beheerBezig ? 'Even controleren...' : 'Toegang'}</button>
              </div>
            ) : (
              <div className="p-6">
                {wachtrij.length > 0 && (
                  <div className="mb-6">
                    <div className="font-semibold text-nhl-blauw mb-3 flex items-center gap-2">
                      <span className="bg-nhl-roze text-white text-xs px-2 py-0.5 rounded-full">{wachtrij.length}</span>
                      Wacht op goedkeuring
                    </div>
                    <div className="space-y-4">
                      {wachtrij.map(v => (
                        <div key={v.id} className="border border-orange-200 bg-orange-50 rounded-xl p-4">
                          <img src={getThumbUrl(v.videoId)} alt="" className="w-full h-28 object-cover rounded-lg mb-3"
                            onError={e => { e.target.style.background='#e5e7eb'; e.target.style.height='60px' }} />
                          <div className="font-medium text-nhl-blauw text-sm mb-1">{v.titel}</div>
                          <p className="text-gray-500 text-xs mb-3">{v.omschrijving}</p>
                          <div className="flex gap-2">
                            <button onClick={() => keurGoed(v.id)} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs py-2 rounded-lg font-semibold">✓ Goedkeuren</button>
                            <button onClick={() => keurAf(v.id)} className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 text-xs py-2 rounded-lg font-semibold">✕ Afwijzen</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {wachtrij.length === 0 && (
                  <div className="text-center py-4 mb-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="text-xl mb-1">✅</div>
                    <div className="text-sm text-green-700 font-medium">Wachtrij is leeg</div>
                  </div>
                )}
                {goedgekeurd.length > 0 && (
                  <div>
                    <div className="font-semibold text-gray-500 text-sm mb-3">Goedgekeurd ({goedgekeurd.length})</div>
                    <div className="space-y-2">
                      {goedgekeurd.map(v => (
                        <div key={v.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-nhl-blauw truncate">{v.titel}</div>
                            <div className="text-xs text-gray-400">👍 {v.omhoog} · {v.datum}</div>
                          </div>
                          <button onClick={() => verwijder(v.id)} className="text-red-400 hover:text-red-600 text-xs flex-shrink-0">Verwijder</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
